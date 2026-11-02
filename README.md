# LinkLite URL Shortener

LinkLite is a small URL-shortening and click-statistics service built with Python, FastAPI, HTML/CSS/JavaScript, and SQLite.

## Features

- Create a short URL from a long URL.
- Redirect visitors to the original URL.
- Store URLs and click counts in SQLite.
- View recently created URLs and click statistics in the web UI.
- Run automated tests locally and in GitHub Actions.

## Requirements

- Windows, macOS, or Linux
- Python 3.11 or newer

## Installation

From the project root, create and activate a virtual environment:

```powershell
python -m venv .venv
\.venv\Scripts\activate
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

On Windows, `run.bat` can create the virtual environment, install dependencies, and start the server automatically.

## Run

```powershell
python -m uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000 in a browser. Enter a long URL, create a short URL, and open the generated link to increase its click count.

## Test

```powershell
pytest -q
```

The GitHub Actions workflow in `.github/workflows/tests.yml` runs the test suite on every push and pull request.

## Data and generated files

The SQLite database is created as `urls.db` when the application starts. It is intentionally excluded from Git by `.gitignore`, along with virtual environments, caches, compiled Python files, and logs.
