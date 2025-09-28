# Project Brain Beacon — Prompt Pack
Generated: 2025-09-28T22:30:56.707294Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon

## Git Snapshot
- Last commit: e77818b42cecc8b93d225abe92f35794a093dece — ci: scheduled refresh uploads artifacts only (no commit-back of generated files)
- Author: Isaac lornitzo
- Date: 2025-09-28T15:30:12-07:00

## Repo Tree (trimmed)
- .api.pid
- .env.sample
    - scheduled-stp.yml
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
    - STPViewer.jsx
      - react.svg
      - FooterBar.jsx
      - ProjectSwitcher.jsx
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
