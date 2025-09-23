# Project Brain Beacon — Prompt Pack
Generated: 2025-09-23T22:36:45.447973Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon.git

## Git Snapshot
- Last commit: 406c3c8c964635a54956881c8b122f6465db3d44 — api: permissive CORS fallback (accept any origin if env missing/malformed)
- Author: Isaac lornitzo
- Date: 2025-09-23T15:26:02-07:00

## Repo Tree (trimmed)
- .gitignore
- AI_GUIDE.md
- Dockerfile
- README.md
  - .env.production
  - .gitignore
  - README.md
  - eslint.config.js
  - index.html
  - package-lock.json
  - package.json
    - vite.svg
    - App.css
    - App.jsx
      - react.svg
      - PromptPackViewer.jsx
      - STPViewer.jsx
      - StatusCard.jsx
    - index.css
    - main.jsx
  - vite.config.js
- render.yaml
- requirements.txt
- runtime.txt
  - stp_make.py
  - stp_serve.py

## Recreate snapshot
Run: python3 tools/stp_make.py  &&  ls -la dist

## Guidance for AI
- Treat this file and stp.yaml as ground truth.
- If a needed file is not inlined in stp.yaml, ask for it explicitly.
