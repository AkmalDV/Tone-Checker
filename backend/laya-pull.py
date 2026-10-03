"""Download Laya model from HuggingFace if not present locally.

Run: python laya-pull.py
"""

import os
from huggingface_hub import snapshot_download

MODEL_DIR = os.path.join(os.path.dirname(__file__), "laya_model")


def main() -> None:
    if os.path.isdir(MODEL_DIR) and os.listdir(MODEL_DIR):
        print(f"laya_model already exists at {MODEL_DIR} — skipping pull.")
        return

    os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"
    print("Starting full model download...")
    local_dir = snapshot_download(
        repo_id="convaiinnovations/laya",
        local_dir=MODEL_DIR,
        local_dir_use_symlinks=False,
    )
    print(f"Download complete! Model saved to: {local_dir}")


if __name__ == "__main__":
    main()
