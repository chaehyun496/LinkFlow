from pathlib import Path
import secrets
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "urls.db"
STATIC_DIR = BASE_DIR / "static"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                original_url TEXT NOT NULL,
                clicks INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )"""
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="LinkLite URL Shortener", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class URLCreate(BaseModel):
    url: HttpUrl


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    return HTMLResponse((STATIC_DIR / "index.html").read_text(encoding="utf-8"))


@app.post("/api/urls")
def create_url(payload: URLCreate, request: Request):
    original_url = str(payload.url)
    with get_connection() as conn:
        for _ in range(10):
            code = secrets.token_urlsafe(5).replace("-", "").replace("_", "")[:7]
            try:
                conn.execute("INSERT INTO urls (code, original_url) VALUES (?, ?)", (code, original_url))
                break
            except sqlite3.IntegrityError:
                continue
        else:
            raise HTTPException(status_code=500, detail="Could not create a unique short URL")
    return {"code": code, "original_url": original_url, "short_url": str(request.base_url) + code}


@app.get("/api/urls")
def list_urls():
    with get_connection() as conn:
        rows = conn.execute("SELECT code, original_url, clicks, created_at FROM urls ORDER BY id DESC").fetchall()
    return [dict(row) for row in rows]


@app.get("/{code}")
def redirect_to_original(code: str):
    with get_connection() as conn:
        row = conn.execute("SELECT original_url FROM urls WHERE code = ?", (code,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Short URL not found")
        conn.execute("UPDATE urls SET clicks = clicks + 1 WHERE code = ?", (code,))
    return RedirectResponse(row["original_url"], status_code=307)

