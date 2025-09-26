# Project Brain Beacon — Prompt Pack
Generated: 2025-09-26T21:13:48.065449Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon

## Git Snapshot
- Last commit: 5df548df8558b1eb721ac1ced412ebc75b79a13e — step-12: single Render blueprint for API + Web
- Author: Isaac lornitzo
- Date: 2025-09-26T14:11:44-07:00

## Repo Tree (trimmed)
- .api.pid
- .env.sample
    - stp.yml
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
      - FooterBar.jsx
      - PromptPackViewer.jsx
      - STPViewer.jsx
      - StatusCard.jsx
    - index.css
    - main.jsx
    - version-badge.js
  - vite.config.js
- main
- render.yaml
- requirements.txt
- runtime.txt
- stp_serve.py
  - stp_make.py
  - stp_serve.py

## Recreate snapshot
Run: python3 tools/stp_make.py  &&  ls -la dist

## Guidance for AI
- Treat this file and stp.yaml as ground truth.
- If a needed file is not inlined in stp.yaml, ask for it explicitly.
