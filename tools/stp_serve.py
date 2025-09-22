from pathlib import Path
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse, PlainTextResponse

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

app = FastAPI(title="Project Brain Beacon — STP Server")

@app.get("/healthz")
def healthz():
    return {"ok": True}

def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return ""

@app.get("/stp")
def get_stp():
    text = _read(DIST / "stp.yaml")
    if not text:
        return JSONResponse({"error": "dist/stp.yaml not found"}, status_code=404)
    return PlainTextResponse(text, media_type="text/plain; charset=utf-8")

@app.get("/prompt_pack")
def get_prompt():
    text = _read(DIST / "prompt_pack.md")
    if not text:
        return JSONResponse({"error": "dist/prompt_pack.md not found"}, status_code=404)
    return Response(text, media_type="text/markdown; charset=utf-8")

@app.get("/ai")
@app.get("/howto")
def get_ai_guide():
    text = _read(ROOT / "AI_GUIDE.md")
    if not text:
        return JSONResponse({"error": "AI_GUIDE.md not found"}, status_code=404)
    return Response(text, media_type="text/markdown; charset=utf-8")
