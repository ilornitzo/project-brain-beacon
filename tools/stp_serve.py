from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Response
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import json
import os
import platform
import subprocess
from datetime import datetime, timezone

import yaml

# --- Paths ---
ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

STP_YAML = DIST / "stp.yaml"
PROMPT_PACK_MD = DIST / "prompt_pack.md"
AI_GUIDE_MD = ROOT / "AI_GUIDE.md"

# --- App ---
app = FastAPI(title="Project BRaiN Beacon API", version="1.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
def _now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def _git(cmd: List[str]) -> str:
    return subprocess.check_output(cmd, cwd=ROOT).decode().strip()

def _git_info() -> Dict[str, Any]:
    info = {"commit": None, "short": None, "generated_at": _now_utc_iso()}
    try:
        info["commit"] = _git(["git", "rev-parse", "HEAD"])
        info["short"]  = _git(["git", "rev-parse", "--short", "HEAD"])
    except Exception:
        pass
    return info

def _allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    return parts

def _ensure_dist_dev_hint() -> None:
    """If dist/* are missing at startup (common in dev), print a friendly hint."""
    need = [STP_YAML, PROMPT_PACK_MD]
    if not all(p.exists() for p in need):
        print("[stp_serve] INFO: dist artifacts missing.")
        print("[stp_serve] Hint (dev): Run: python3 tools/stp_make.py")

_ensure_dist_dev_hint()

def _read_text_file(p: Path) -> Optional[str]:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        return None

def _read_yaml_obj(p: Path) -> Optional[Dict[str, Any]]:
    try:
        with p.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        # ensure JSON-serializable
        json.loads(json.dumps(data))
        if not isinstance(data, dict):
            return None
        return data
    except Exception:
        return None

# --- Endpoints ---

@app.get("/", response_class=PlainTextResponse)
def root_health() -> str:
    return "ok"

@app.get("/healthz")
@app.get("/health")
def healthz() -> JSONResponse:
    info = _git_info()
    data = {
        "ok": True,
        "service": "project-brain-beacon",
        "commit": info["short"] or info["commit"],
        "generated": info["generated_at"],
        "origins": _allowed_origins(),
        "runtime": {
            "python": platform.python_version(),
            "os": {
                "system": platform.system(),
                "release": platform.release(),
                "machine": platform.machine(),
            },
        },
    }
    return JSONResponse(content=data, media_type="application/json")

@app.get("/stp")
def get_stp_yaml() -> Response:
    """
    Success: 200 text/plain; charset=utf-8 (YAML as plain text for strict clients)
    Missing: 404 application/json { "error": "..." }
    """
    if not STP_YAML.exists():
        return JSONResponse(status_code=404, content={"error": f"Missing file: {STP_YAML.relative_to(ROOT)}"})
    text = _read_text_file(STP_YAML)
    if text is None:
        return JSONResponse(status_code=404, content={"error": "Failed to read stp.yaml"})
    return Response(content=text, media_type="text/plain; charset=utf-8")

@app.get("/stp.json")
def get_stp_json() -> JSONResponse:
    """
    Success: 200 application/json
    Missing: 404 application/json { "error": "..." }
    """
    if not STP_YAML.exists():
        return JSONResponse(status_code=404, content={"error": f"Missing file: {STP_YAML.relative_to(ROOT)}"})
    obj = _read_yaml_obj(STP_YAML)
    if obj is None:
        return JSONResponse(status_code=404, content={"error": "Failed to parse stp.yaml"})
    return JSONResponse(content=obj, media_type="application/json")

@app.get("/prompt_pack")
def get_prompt_pack() -> Response:
    """
    Success: 200 text/markdown; charset=utf-8
    Missing: 404 application/json { "error": "..." }
    """
    if not PROMPT_PACK_MD.exists():
        return JSONResponse(status_code=404, content={"error": f"Missing file: {PROMPT_PACK_MD.relative_to(ROOT)}"})
    text = _read_text_file(PROMPT_PACK_MD)
    if text is None:
        return JSONResponse(status_code=404, content={"error": "Failed to read prompt_pack.md"})
    return Response(content=text, media_type="text/markdown; charset=utf-8")

@app.get("/prompt_pack.json")
def get_prompt_pack_json() -> JSONResponse:
    """
    Success: 200 application/json { "markdown": "..." }
    Missing: 404 application/json { "error": "..." }
    """
    if not PROMPT_PACK_MD.exists():
        return JSONResponse(status_code=404, content={"error": f"Missing file: {PROMPT_PACK_MD.relative_to(ROOT)}"})
    text = _read_text_file(PROMPT_PACK_MD)
    if text is None:
        return JSONResponse(status_code=404, content={"error": "Failed to read prompt_pack.md"})
    return JSONResponse(content={"markdown": text}, media_type="application/json")

@app.get("/ai")
@app.get("/howto")
def get_ai_guide() -> Response:
    """
    Success: 200 text/markdown; charset=utf-8
    Missing: 404 application/json { "error": "..." }
    """
    if not AI_GUIDE_MD.exists():
        return JSONResponse(status_code=404, content={"error": f"Missing file: {AI_GUIDE_MD.relative_to(ROOT)}"})
    text = _read_text_file(AI_GUIDE_MD)
    if text is None:
        return JSONResponse(status_code=404, content={"error": "Failed to read AI_GUIDE.md"})
    return Response(content=text, media_type="text/markdown; charset=utf-8")

@app.get("/version")
def version() -> JSONResponse:
    info = _git_info()
    return JSONResponse(
        content={
            "ok": True,
            "service": "project-brain-beacon",
            "commit": info["commit"],
            "short": info["short"],
            "generated_at": info["generated_at"],
        },
        media_type="application/json",
    )
