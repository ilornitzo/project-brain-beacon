# Project Brain Beacon — Prompt Pack
Generated: 2025-09-24T20:18:02.292014Z

## Project
- Name: project-brain-beacon
- Branch: main
- Remote: git@github.com:ilornitzo/project-brain-beacon.git

## Git Snapshot
- Last commit: 62467df7975258558cc397d1272ce88509e0fc34 — chore: add SOS baseline (.env.sample, .gitignore, autoring)
- Author: Isaac lornitzo
- Date: 2025-09-24T13:17:21-07:00

## Repo Tree (trimmed)
- .env
- .env.sample
    - stp.yml
- .gitignore
  - .ring
  - help_2025-09-24_09-34-49.txt
  - help_2025-09-24_09-37-13.txt
  - help_2025-09-24_10-25-29.txt
  - help_2025-09-24_10-29-30.txt
  - help_2025-09-24_10-53-26.txt
  - help_2025-09-24_11-07-52.txt
  - help_2025-09-24_12-05-51.txt
  - help_2025-09-24_12-07-09.txt
  - help_2025-09-24_12-08-04.txt
  - help_2025-09-24_12-25-10.txt
  - help_2025-09-24_12-26-41.txt
  - help_2025-09-24_13-00-27.txt
  - help_2025-09-24_13-02-31.txt
  - help_2025-09-24_13-02-58.txt
  - help_2025-09-24_13-07-55.txt
  - help_2025-09-24_13-12-30.txt
  - help_2025-09-24_13-14-26.txt
  - help_2025-09-24_13-15-28.txt
- .sos_autoring
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
