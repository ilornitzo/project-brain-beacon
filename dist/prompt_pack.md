# Project Brain Beacon — Prompt Pack
Generated: 2025-09-24T00:24:43.406957Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: git@github.com:ilornitzo/project-brain-beacon.git

## Git Snapshot
- Last commit: 9eed5bea9a078dfaf00e5c99f6e6de3e0494d79f — ci: first STP Snapshot run
- Author: Isaac lornitzo
- Date: 2025-09-23T17:09:32-07:00

## Repo Tree (trimmed)
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
