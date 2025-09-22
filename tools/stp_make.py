#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import subprocess, json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DIST.mkdir(parents=True, exist_ok=True)

def git(*args, default=""):
    try:
        return subprocess.check_output(["git", *args], cwd=ROOT).decode().strip()
    except Exception:
        return default

# --- Git snapshot ---
git_info = {
    "branch": git("rev-parse", "--abbrev-ref", "HEAD"),
    "remote_url": git("config", "--get", "remote.origin.url"),
    "last_commit_hash": git("rev-parse", "HEAD"),
    "last_commit_msg": git("log", "-1", "--pretty=%s"),
    "last_commit_author": git("log", "-1", "--pretty=%an"),
    "last_commit_date": git("log", "-1", "--pretty=%cI"),
}

# --- Walk repo & select files ---
EXCLUDE_DIRS = {".git", "dist", "__pycache__", ".idea", ".vscode", "node_modules", ".venv", "venv"}
INLINE_EXTS = {".md",".txt",".py",".json",".yml",".yaml",".toml",".sh",".cfg",".ini",".env",".gitignore"}
MAX_INLINE = 64 * 1024

files = []
for p in ROOT.rglob("*"):
    if p.is_dir(): 
        continue
    rel = p.relative_to(ROOT)
    if any(part in EXCLUDE_DIRS for part in rel.parts):
        continue
    size = p.stat().st_size
    item = {"path": rel.as_posix(), "bytes": size}
    if p.suffix.lower() in INLINE_EXTS and size <= MAX_INLINE:
        try:
            item["inline"] = True
            item["content"] = p.read_text(encoding="utf-8", errors="replace")
        except Exception:
            item["inline"] = False
    else:
        item["inline"] = False
    files.append(item)

# --- Tree view ---
def tree():
    lines = []
    for f in sorted(files, key=lambda x: x["path"]):
        parts = Path(f["path"]).parts
        lines.append(("  " * (len(parts)-1)) + "- " + parts[-1])
    return "\n".join(lines) if lines else "(repo minimal)"

# --- Tiny YAML emitter (for simple shapes) ---
def yml(v, ind=0):
    s = "  " * ind
    if isinstance(v, dict):
        out=[]
        for k,val in v.items():
            if isinstance(val,(dict,list)):
                out.append(f"{s}{k}:")
                out.append(yml(val, ind+1))
            else:
                out.append(f"{s}{k}: {json.dumps(val)}")
        return "\n".join(out)
    if isinstance(v, list):
        out=[]
        for it in v:
            if isinstance(it,(dict,list)):
                out.append(f"{s}-")
                out.append(yml(it, ind+1))
            else:
                out.append(f"{s}- {json.dumps(it)}")
        return "\n".join(out)
    return f"{s}{json.dumps(v)}"

now = datetime.utcnow().isoformat()+"Z"
stp = {
    "stp_version":"1",
    "generated_at": now,
    "project": {"name": ROOT.name, "root": str(ROOT)},
    "git": git_info,
    "summary": {"file_count": len(files), "tree": tree()},
    "commands": {"generate_snapshot":"python3 tools/stp_make.py","verify_outputs":"ls -la dist"},
    "next_actions": [
        "Review dist/prompt_pack.md for accuracy",
        "Paste prompt_pack.md into a fresh AI thread if transferring context"
    ],
    "files": files
}

# Write YAML
(DIST/"stp.yaml").write_text(yml(stp), encoding="utf-8")

# Write prompt pack (no code fences to keep it simple)
prompt = f"""# Project Brain Beacon — Prompt Pack
Generated: {now}

## Project
- Name: {ROOT.name}
- Branch: {git_info.get('branch','')}
- Remote: {git_info.get('remote_url','')}

## Git Snapshot
- Last commit: {git_info.get('last_commit_hash','')} — {git_info.get('last_commit_msg','')}
- Author: {git_info.get('last_commit_author','')}
- Date: {git_info.get('last_commit_date','')}

## Repo Tree (trimmed)
{tree()}

## Recreate snapshot
Run: python3 tools/stp_make.py  &&  ls -la dist

## Guidance for AI
- Treat this file and stp.yaml as ground truth.
- If a needed file is not inlined in stp.yaml, ask for it explicitly.
"""
(DIST/"prompt_pack.md").write_text(prompt, encoding="utf-8")

print("✅ Snapshot written: dist/stp.yaml, dist/prompt_pack.md")
