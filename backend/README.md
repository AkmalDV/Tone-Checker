# Tone Checker — Backend

## Setup

```bash
uv sync
```

## Run

```bash
uv run backend
```

The server starts on `http://localhost:8000`.

## Dev (hot-reload, re-loads model once per process start)

```bash
uv run uvicorn backend.main:app --reload --port 8000
```

> **Note:** `--reload` restarts the process on file changes.
> The lifespan guard ensures the model is only loaded once per process, not on every request.

## CORS

Allowed origins default to `http://localhost:3000`.
Override via env var for production:

```bash
ALLOWED_ORIGINS=https://yourdomain.com uv run backend
```

Multiple origins: comma-separated.
