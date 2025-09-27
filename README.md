# Project Brain Beacon (BRaiN)

BRaiN is a tiny “project brain” that keeps your repo’s **Single True Prompt (STP)** artifacts fresh and makes it dead-simple to start a focused ChatGPT build thread. It outputs:
- `dist/stp.yaml` — machine-readable snapshot (repo state, commands, rules)
- `dist/prompt_pack.md` — human-friendly pack with the universal footer

Why: so future-you (or a teammate) can onboard in under 5 minutes with the right context.


---

## ⚡ Quick Start — Local Dev (≤5 min)

**Prereqs:** Node ≥ 18, Python ≥ 3.11, `pip`, `git`.

1) **Clone**
```bash
git clone git@github.com:ilornitzo/project-brain-beacon.git
cd project-brain-beacon
python3 tools/stp_make.py && ls -la dist
cd ~/project-brain-beacon && tee README.md > /dev/null <<'MD'
# Project Brain Beacon (BRaiN)

**BRaiN** is a tiny “project brain” that keeps your repo’s Single True Prompt (STP) artifacts fresh and makes it dead-simple to spin up a focused ChatGPT build thread.

It outputs:
- `dist/stp.yaml` — machine-readable snapshot (repo state, commands, rules)
- `dist/prompt_pack.md` — human-friendly pack with a universal footer (Startup Asks, Rules, Snapshot Ritual)

Why: so future-you (or a teammate) can onboard in under 5 minutes with correct context.

---

## ⚡ Quick Start — Local Dev (≤5 min)

**Prereqs:** Node ≥ 18, Python ≥ 3.11, `pip`, `git`.

1) **Clone**
```bash
git clone git@github.com:ilornitzo/project-brain-beacon.git
cd project-brain-beaconMD
md
