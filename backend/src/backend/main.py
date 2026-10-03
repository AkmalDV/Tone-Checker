from contextlib import asynccontextmanager
from typing import Dict
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from laya import Router
import uvicorn

log = logging.getLogger(__name__)

# ponytail: model path relative to backend/ cwd; adjust if layout changes
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "laya_model")
_MODEL_PATHS = {
    "typed-decisions": os.path.join(_MODEL_DIR, "typed-decisions"),
    "multilingual": os.path.join(_MODEL_DIR, "multilingual"),
}

_router: Router | None = None


def _pull_if_missing() -> None:
    """Download the full Laya repo from HuggingFace if laya_model/ is absent."""
    if os.path.isdir(_MODEL_DIR) and os.listdir(_MODEL_DIR):
        return
    from huggingface_hub import snapshot_download

    os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"
    log.info("laya_model not found — pulling from HuggingFace…")
    snapshot_download(
        repo_id="convaiinnovations/laya",
        local_dir=_MODEL_DIR,
        local_dir_use_symlinks=False,
    )
    log.info("Model download complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _router
    if _router is None:
        _pull_if_missing()
        _router = Router(preload=True, models=_MODEL_PATHS, standalone_repos=True)
    yield


app = FastAPI(title="Tone Checker", lifespan=lifespan)

# ponytail: comma-separated env var for multi-origin prod deployments
_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class PredictionRequest(BaseModel):
    statement: str
    target_question: str
    instructions: str
    criteria_map: Dict[str, str]
    custom_threshold: float = 0.5


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/predict-custom")
async def predict_custom(req: PredictionRequest):
    questions = {
        "custom_decision": {
            "type": "choice",
            "instructions": req.instructions,
            "criteria": req.criteria_map,
        },
        "probability_score": {
            "type": "noul",
            "instructions": f"Probability evaluation for: {req.target_question}",
        },
    }
    result = _router.predict(req.statement, questions)
    answers = result.get("answers", {})
    return {
        "statement": req.statement,
        "prediction": answers.get("custom_decision", {}),
        "confidence_score": answers.get("probability_score", {}).get("noul", 0.0),
        "routing": result.get("routing", {}),
    }


def run() -> None:
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000)
