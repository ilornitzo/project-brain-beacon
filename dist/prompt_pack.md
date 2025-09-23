# Project Brain Beacon — Prompt Pack
Generated: 2025-09-23T17:35:13.189248Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon.git

## Git Snapshot
- Last commit: 73a4b268e61657be6ddff35a4aef9f23b44c8a9c — Add requirements.txt for Render backend
- Author: Isaac lornitzo
- Date: 2025-09-23T10:26:19-07:00

## Repo Tree (trimmed)
- .gitignore
- AI_GUIDE.md
- Dockerfile
- README.md
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
