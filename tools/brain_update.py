#!/usr/bin/env python3
import argparse, datetime as dt, os, sys
try:
    import yaml
except ImportError:
    print("Missing PyYAML. Run: pip install pyyaml", file=sys.stderr); sys.exit(1)

PATH=".brain.yml"

def load():
    if not os.path.exists(PATH): return {}
    import io
    with open(PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def save(data):
    with open(PATH, "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False, width=1000)

def ensure(d, k, v):
    if k not in d or d[k] is None: d[k]=v

def main():
    ap=argparse.ArgumentParser(description="Update BRaiN YAML (step, DoD, next steps, recent commands, troubleshooting).")
    ap.add_argument("--step", help="Set current_step.name")
    ap.add_argument("--dod", action="append", default=[], help="Add a Definition of Done item (repeatable)")
    ap.add_argument("--next", dest="next_steps", action="append", default=[], help="Append a next step")
    ap.add_argument("--add-command", action="append", default=[], help="Append a recent command (repeatable)")
    ap.add_argument("--trouble", help="Add troubleshooting in 'issue|cause|fix1;fix2;...' format")
    ap.add_argument("--max-recent", type=int, default=10, help="Max commands_recent to keep (default 10)")
    args=ap.parse_args()

    data = load()

    ensure(data, "current_step", {})
    ensure(data, "commands_recent", [])
    ensure(data, "troubleshooting", [])

    if args.step:
        data["current_step"]["name"]=args.step
    if args.dod:
        ensure(data["current_step"], "definition_of_done", [])
        for item in args.dod:
            if item not in data["current_step"]["definition_of_done"]:
                data["current_step"]["definition_of_done"].append(item)
    if args.next_steps:
        ensure(data, "next_steps", [])
        for n in args.next_steps:
            if n not in data["next_steps"]:
                data["next_steps"].append(n)
    if args.add_command:
        cmds=[c for c in args.add_command if c.strip()]
        for c in cmds:
            if c in data["commands_recent"]:
                data["commands_recent"].remove(c)
            data["commands_recent"].insert(0, c)
        data["commands_recent"]=data["commands_recent"][:args.max_recent]
    if args.trouble:
        parts=args.trouble.split("|")
        issue = parts[0].strip() if len(parts)>0 else ""
        cause = parts[1].strip() if len(parts)>1 else ""
        fixes = []
        if len(parts)>2:
            fixes=[x.strip() for x in parts[2].split(";") if x.strip()]
        stamp=dt.datetime.utcnow().isoformat(timespec="seconds")+"Z"
        entry={"date_utc": stamp, "issue": issue, "cause": cause, "fix": fixes}
        data["troubleshooting"].insert(0, entry)

    save(data)
    print(f"Updated {PATH}")

if __name__=="__main__": main()
