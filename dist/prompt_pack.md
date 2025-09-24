# Project Brain Beacon — Prompt Pack
Generated: 2025-09-24T00:33:08.476967Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon

## Git Snapshot
- Last commit: 2cdae2e8e13dd2539cd141c8c1707dc40473b1b1 — api: add /version endpoint
- Author: Isaac lornitzo
- Date: 2025-09-23T17:24:43-07:00

## Repo Tree (trimmed)
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
