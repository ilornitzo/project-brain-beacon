# Project Brain Beacon — Prompt Pack
Generated: 2025-09-26T17:54:52.671492Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: https://github.com/ilornitzo/project-brain-beacon

## Git Snapshot
- Last commit: 758c7481de2ef042d3e1811d84a8b0b81101c6ac — step-10b: enriched Copy (runtime + diffstat) + /healthz + version-badge fix
- Author: Isaac lornitzo
- Date: 2025-09-26T10:54:26-07:00

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
