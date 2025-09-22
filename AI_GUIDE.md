# Project Brain Beacon — AI Guide

## Purpose
This guide tells any AI assistant exactly how to work on this repo: request files, propose full-file replacements, use Redline, run Snapshot Ritual, and ship in small, verifiable steps.

## 1) Behavior Rules
- One or two commands at a time.
- Provide full-file replacements; no partial patches or "open editor".
- Assume fresh terminal at repo root; include mkdir -p when needed.
- Verify each step and wait for confirmation.
- Prefer small, reversible changes.

## 2) File Request Etiquette
- Ask for exact paths (e.g., tools/stp_make.py, tools/stp_serve.py, dist/stp.yaml).
- If large, ask for only the section you need.
- If unsure, ask to run: python3 tools/stp_make.py && ls -la dist

## 3) Full-File Replacement Pattern
Use: cat > path/to/file.ext <<'EOF'  (contents)  EOF

## 4) Redline Policy (Change Approval)
- For changes to behavior/APIs/ports/file shapes: post a short Redline Notice (what, why safer, rollback).
- Wait for approval on Redline items.

## 5) Snapshot Ritual (STP)
- Run: python3 tools/stp_make.py ; ls -la dist
- Artifacts: dist/stp.yaml (machine snapshot), dist/prompt_pack.md (paste-pack).

## 6) Definition of Done (DoD) Template
- Feature runs locally without errors.
- Explicit CLI/HTTP checks listed.
- Files committed and pushed.
- Tag created: step-XX.
- Snapshot updated in dist/.

## 7) Troubleshooting Flow
1) Reproduce with exact command.
2) Read first error lines.
3) Check versions/ports/paths.
4) Apply minimal fix → verify → commit.
5) If blocked, request files or a fresh snapshot.

## 8) Quick Server How-To
- Start: python3 -m uvicorn tools.stp_serve:app --reload --port 5055
- GET /healthz → {"ok": true}
- GET /stp → YAML snapshot
- GET /prompt_pack → Markdown pack
- GET /ai and /howto → this guide

## 9) Git Hygiene
- Write imperative, specific commit messages.
- Tag completed steps: git tag step-XX && git push origin step-XX

*End of AI Guide.*
