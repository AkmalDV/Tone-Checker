# Tone Checker

Local decision-making backend powered by [Laya](https://github.com/NandhaKishorM/laya) + a Next.js frontend dashboard. Create custom conversation cases, target questions, and dynamic confidence/outcome criteria on the fly.

## Project Structure

```
├── backend/          # FastAPI + Laya inference server
│   ├── src/backend/
│   │   └── main.py   # API server (auto-pulls model on first run)
│   ├── laya-pull.py  # Standalone model download script
│   └── pyproject.toml
└── frontend/         # Next.js + Tailwind CSS dashboard
    └── src/app/
        └── page.tsx  # Single-page criteria builder UI
```

## Quick Start

### 1. Pull the model

```bash
cd backend
uv sync
uv run python laya-pull.py
```

Or skip this — the server auto-downloads the model on first boot if `laya_model/` is missing.

### 2. Start the backend

```bash
cd backend
uv run backend
```

Server runs at `http://localhost:8000`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

**POST** `/api/predict-custom`

```json
{
  "statement": "Me: \"Can I buy this?\" Wife: \"Sure, go ahead.\"",
  "target_question": "Can I buy this?",
  "instructions": "What is her true permission level?",
  "criteria_map": {
    "approved": "She means it, completely fine.",
    "risky": "Hesitant, will bring it up later.",
    "forbidden": "Absolute trap."
  },
  "custom_threshold": 0.75
}
```

Returns prediction choice, confidence score, and full probability distribution.

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |

## License

Apache 2.0 (Laya model) — see [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya).
