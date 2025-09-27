# Project Brain Beacon (BRaiN)

**BRaiN** is a tiny “project brain” that keeps your repo’s **Single True Prompt (STP)** artifacts fresh and makes it dead-simple to spin up a focused ChatGPT build thread. It generates two canonical files in `./dist/`:
- `stp.yaml` — machine-readable snapshot (ground truth: repo state, commands, rules).
- `prompt_pack.md` — human-friendly pack with the universal footer (Startup Asks, Rules of Engagement, Snapshot Ritual).

**Why it exists:** future-you (or a teammate) can start productive AI-assisted work in under 5 minutes with correct context and zero guesswork.

---

## ⚡ Quick Start — Local Dev (≤5 min)

> Prereqs: Node ≥ 18, Python 3.11+ (3.13 OK), `pip`, `git`.

1) **Clone**
```bash
git clone git@github.com:ilornitzo/project-brain-beacon.git
cd project-brain-beacon
python3 tools/stp_make.py && ls -la dist
