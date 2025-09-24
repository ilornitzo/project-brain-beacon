# Project Brain Beacon — Prompt Pack
Generated: 2025-09-24T20:18:32.081589Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon

## Git Snapshot
- Last commit: f0dbc415f07f3630461df674b3c20c7dd3865b04 — ui: add version badge (backend commit + generated_at)
- Author: Isaac lornitzo
- Date: 2025-09-24T13:18:02-07:00

## Repo Tree (trimmed)
- .env.sample
    - stp.yml
- .gitignore
- AI_GUIDE.md
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
    - version-badge.js
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
