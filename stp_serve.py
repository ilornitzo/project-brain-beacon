from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import json
import os
import subprocess
from datetime import datetime, timezone

import yaml

ROOT = Path(__file__).parent.resolve()
DIST = ROOT / "dist"

STP_YAML = DIST / "stp.yaml"
PROMPT_PACK_MD = DIST / "prompt_pack.md"
AI_GUIDE_MD = ROOT / "AI_GUIDE.md"

app = FastAPI(title="Project Brain Beacon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- helpers ----------

def _now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def _read_text(p: Path) -> str:
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"Missing file: {p.relative_to(ROOT)}")
    try:
        return p.read_text(encoding="utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed reading {p.name}: {e}")

def _read_yaml_as_obj(p: Path) -> Dict[str, Any]:
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"Missing file: {p.relative_to(ROOT)}")
    try:
        with p.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        # ensure json-serializable
        json.loads(json.dumps(data))
        if not isinstance(data, dict):
            raise ValueError("Top-level YAML is not a mapping/object")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed parsing YAML {p.name}: {e}")

def _git_info() -> Dict[str, Any]:
    """
    Best-effort git info. Works locally and usually on Render.
    Falls back gracefully if git is unavailable.
    """
    info = {"commit_short": None, "commit_full": None, "generated_at": _now_utc_iso()}
    try:
        short = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT).decode().strip()
        full = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip()
        info["commit_short"] = short
        info["commit_full"] = full
    except Exception:
        # ignore; keep Nones
        pass
    return info

# ---------- endpoints ----------

@app.get("/", response_class=PlainTextResponse)
def healthz() -> str:
    return "ok"

@app.get("/stp", response_class=PlainTextResponse)
def get_stp_yaml() -> Response:
    """
    Serve STP as YAML (legacy).
    """
    text = _read_text(STP_YAML)
    return Response(content=text, media_type="text/yaml; charset=utf-8")

@app.get("/stp.json")
def get_stp_json() -> JSONResponse:
    """
    Serve STP as strict JSON. Must include keys like:
    stp_version, generated_at, project, git, summary, commands, next_actions, files
    (We simply surface whatever is in stp.yaml; schema ownership stays in the STP.)
    """
    obj = _read_yaml_as_obj(STP_YAML)
    return JSONResponse(content=obj, media_type="application/json")

@app.get("/prompt_pack", response_class=PlainTextResponse)
def get_prompt_pack() -> str:
    """
    Serve the generated prompt pack markdown.
    """
    return _read_text(PROMPT_PACK_MD)

@app.get("/prompt_pack.json")
def get_prompt_pack_json() -> JSONResponse:
    """
    Optional JSON-wrapped version of the prompt pack.
    Returns a simple object with the markdown as a string.
    """
    md = _read_text(PROMPT_PACK_MD)
    return JSONResponse(content={"markdown": md}, media_type="application/json")

@app.get("/ai", response_class=PlainTextResponse)
def get_ai_guide() -> str:
    """
    Serve AI integration guide; provide a minimal inline fallback to avoid regressions.
    """
    if AI_GUIDE_MD.exists():
        return _read_text(AI_GUIDE_MD)
    return (
        "# AI Integration Guide\n"
        "- Treat STP + Prompt Pack as ground truth.\n"
        "- If you need a file, ask for its exact repo path.\n"
        "- Provide full-file replacements only.\n"
    )

@app.get("/version")
def version() -> JSONResponse:
    """
    Keep /version working. Best-effort commit metadata + generated_at.
    """
    info = _git_info()
    return JSONResponse(
        content={
            "ok": True,
            "service": "project-brain-beacon",
            "commit": info["commit_short"],
            "commit_full": info["commit_full"],
            "generated_at": info["generated_at"],
        },
        media_type="application/json",
    )

if __name__ == "__main__":
    # Local dev convenience runner
    import uvicorn
    uvicorn.run("stp_serve:app", host="0.0.0.0", port=5090, reload=True)
