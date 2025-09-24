import os
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, JSONResponse

try:
    import yaml  # PyYAML
except Exception:  # pragma: no cover
    yaml = None  # We'll handle lack of PyYAML gracefully.


# --- File locations -----------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
STP_YAML = DIST / "stp.yaml"
PROMPT_MD = DIST / "prompt_pack.md"


# --- Helpers -----------------------------------------------------------------
def _read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(str(path))
    return path.read_text(encoding="utf-8")


def get_commit_hash() -> str:
    """
    Best-effort commit hash for /version:
    1) GIT_COMMIT env (if CI set it),
    2) `git rev-parse HEAD` if .git exists,
    3) 'unknown' as fallback.
    """
    env_hash = os.getenv("GIT_COMMIT")
    if env_hash:
        return env_hash.strip()

    git_dir = ROOT / ".git"
    if git_dir.exists():
        try:
            h = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip()
            return h
        except Exception:
            pass
    return "unknown"


def get_stp_generated_at() -> Optional[str]:
    """
    Pull `generated_at` from dist/stp.yaml if available.
    Works even if PyYAML isn't installed by doing a quick line scan.
    """
    if not STP_YAML.exists():
        return None

    if yaml is not None:
        try:
            data = yaml.safe_load(STP_YAML.read_text(encoding="utf-8"))
            return str(data.get("generated_at")) if isinstance(data, dict) else None
        except Exception:
            pass

    # Lightweight fallback: scan for the line beginning with 'generated_at:'
    try:
        for line in STP_YAML.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("generated_at:"):
                return line.split("generated_at:", 1)[1].strip().strip('"\'')
    except Exception:
        pass
    return None


# --- App ---------------------------------------------------------------------
app = FastAPI(title="Project Brain Beacon API")

# Permissive CORS fallback (frontend handles stricter env-based config)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # safe fallback; tighten via proxy/Render if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "project-brain-beacon", "time": datetime.utcnow().isoformat() + "Z"}


@app.get("/stp", response_class=PlainTextResponse)
def get_stp():
    try:
        return _read_text(STP_YAML)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="stp.yaml not found")


@app.get("/prompt_pack", response_class=PlainTextResponse)
def get_prompt_pack():
    try:
        return _read_text(PROMPT_MD)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="prompt_pack.md not found")


@app.post("/ai")
def ai_stub(payload: dict):
    """
    Minimal placeholder to keep endpoint stable.
    Mirrors input back; swap with your model call if desired.
    """
    return {"ok": True, "echo": payload}


@app.get("/version")
def version():
    """
    Tiny helper for UI badges & status panes.
    Returns commit hash (full + short) and the STP generated_at (if present).
    """
    commit = get_commit_hash()
    generated_at = get_stp_generated_at()
    return JSONResponse(
        {
            "commit": commit,
            "short": commit[:7] if commit and commit != "unknown" else commit,
            "generated_at": generated_at,
        }
    )


# --- Local dev entry ---------------------------------------------------------
if __name__ == "__main__":
    # Running directly: `python tools/stp_serve.py`
    import uvicorn

    port = int(os.getenv("PORT", "5055"))
    uvicorn.run("tools.stp_serve:app", host="0.0.0.0", port=port, reload=True)
