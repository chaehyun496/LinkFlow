from fastapi.testclient import TestClient
from app.main import app


def test_create_redirect_and_click_count(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setattr("app.main.DB_PATH", db_path)
    with TestClient(app) as client:
        response = client.post("/api/urls", json={"url": "https://example.com/docs"})
        assert response.status_code == 200
        code = response.json()["code"]
        redirect = client.get(f"/{code}", follow_redirects=False)
        assert redirect.status_code == 307
        assert redirect.headers["location"] == "https://example.com/docs"
        assert client.get("/api/urls").json()[0]["clicks"] == 1


def test_invalid_url_is_rejected(tmp_path, monkeypatch):
    monkeypatch.setattr("app.main.DB_PATH", tmp_path / "test.db")
    with TestClient(app) as client:
        assert client.post("/api/urls", json={"url": "not-a-url"}).status_code == 422
