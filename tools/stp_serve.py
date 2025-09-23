from pathlib import Path
from os import getenv
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
GUIDE = ROOT / "AI_GUIDE.md"

app = FastAPI(title="BRaiN — STP Server")

# ---- CORS: accept configured origins or fall back to wildcard ----
raw = getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in raw.split(",") if o.strip()]
if not origins:
    origins = ["*"]  # permissive fallback for deployment issues

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)

@app.get("/healthz")
def healthz():
    return {"ok": True, "origins": origins}

def _read_text(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return None

@app.get("/stp", response_class=PlainTextResponse)
def stp():
    text = _read_text(DIST / "stp.yaml")
    if text is None:
        return JSONResponse({"error": "dist/stp.yaml not found"}, status_code=404)
    return Response(text, media_type="text/plain; charset=utf-8")

@app.get("/prompt_pack", response_class=PlainTextResponse)
def prompt_pack():
    text = _read_text(DIST / "prompt_pack.md")
    if text is None:
        return JSONResponse({"error": "dist/prompt_pack.md not found"}, status_code=404)
    # Send as Markdown-friendly plaintext
    return Response(text, media_type="text/markdown; charset=utf-8")

@app.get("/ai", response_class=PlainTextResponse)
@app.get("/howto", response_class=PlainTextResponse)
def ai_guide():
    text = _read_text(GUIDE)
    if text is None:
        return JSONResponse({"error": "AI_GUIDE.md not found"}, status_code=404)
    return Response(text, media_type="text/markdown; charset=utf-8")
