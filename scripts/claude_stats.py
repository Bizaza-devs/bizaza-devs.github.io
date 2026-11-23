#!/usr/bin/env python3
"""Daily Claude Code usage summary -> data/claude.json (anonymous numbers only).

Reads the local Claude Code session logs (~/.claude/projects/**/*.jsonl, every
subfolder, subagent logs included) and writes per-day counts for the
"Work activity" calendar on the site. Standard library only, no network access.

Output contains ONLY dates and numbers: no text, titles, paths, project names
or session ids ever leave this script.

Definitions
-----------
prompts   User messages actually typed by the user. A `type == "user"` record
          counts unless it is:
            - only tool_result blocks (tool output fed back to the model),
            - `isMeta` (injected skill text, image captions, caveats ...),
            - `isSidechain` or carries `agentId` (subagent conversation),
            - `origin.kind` present and not "human" (plugins, task notifications),
            - after stripping leading <system-reminder> blocks, empty or starting
              with a command / system marker (<command-name>, <command-message>,
              <local-command-stdout>, <task-notification>, <side-sessions-event>,
              "[Request interrupted", "Background (from the session" ...).
sessions  Distinct sessionIds that had at least one counted prompt that day.
tokens    Assistant `message.usage`: input + output + cache_creation_input
          (cache_read NOT counted), deduplicated by `message.id` (a message is
          split over several lines; the max of each field is kept), attributed
          to the day the message first appears. Subagent usage is included.

Timezone: Europe/Budapest via zoneinfo; if tzdata is missing (common on
Windows) a built-in EU rule is used: CET +01:00, CEST +02:00 from the last
Sunday of March 01:00 UTC to the last Sunday of October 01:00 UTC.

History: Claude Code deletes old logs (cleanupPeriodDays, ~30 days by default),
so each run reads the existing --out file and merges it with the fresh counts,
keeping the per-field maximum for every date. `days` holds the full merged
history (the site filters to the last year itself); `totals` are sums over
`days` (totals.sessions = sum of daily session counts).

Usage: python scripts/claude_stats.py [--out data/claude.json] [--days 0]
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone

TZ_NAME = "Europe/Budapest"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from zoneinfo import ZoneInfo

    _TZ = ZoneInfo(TZ_NAME)
except Exception:  # ZoneInfoNotFoundError when tzdata is absent
    _TZ = None


def _last_sunday(year: int, month: int) -> date:
    nxt = date(year + (month == 12), month % 12 + 1, 1)
    d = nxt - timedelta(days=1)
    return d - timedelta(days=(d.weekday() - 6) % 7)


def _budapest_offset(utc: datetime) -> timedelta:
    """EU DST rule for Central Europe (fallback when tzdata is unavailable)."""
    y = utc.year
    start = datetime.combine(_last_sunday(y, 3), datetime.min.time(), timezone.utc) + timedelta(hours=1)
    end = datetime.combine(_last_sunday(y, 10), datetime.min.time(), timezone.utc) + timedelta(hours=1)
    return timedelta(hours=2) if start <= utc < end else timedelta(hours=1)


def to_local(utc: datetime) -> datetime:
    if _TZ is not None:
        return utc.astimezone(_TZ)
    return utc.astimezone(timezone(_budapest_offset(utc)))


def parse_ts(value) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


REMINDER_RE = re.compile(r"^\s*<system-reminder>.*?</system-reminder>\s*", re.S)
SKIP_PREFIXES = (
    "<command-name>",
    "<command-message>",
    "<command-args>",
    "<local-command-",
    "<system-reminder>",
    "<task-notification>",
    "<side-sessions-event>",
    "<ci-monitor-event>",
    "<user-prompt-submit-hook>",
    "[Request interrupted",
    "[Usage limit",
    "[Earlier usage-limit",
    "[Cross-session",
    "[Image:",
    "Base directory for this skill",
    "Background (from the session",
    "Task (from the session",
    "Another Claude session",
    "Caveat: The messages below",
)


def user_text(content) -> str | None:
    """Text the user typed, or None if the record is not a typed prompt."""
    if isinstance(content, str):
        text = content
    elif isinstance(content, list):
        blocks = [b for b in content if isinstance(b, dict)]
        if not blocks or all(b.get("type") == "tool_result" for b in blocks):
            return None
        if any(b.get("type") == "tool_result" for b in blocks):
            return None
        text = "\n".join(b.get("text", "") for b in blocks if b.get("type") == "text")
        if not text.strip() and any(b.get("type") == "image" for b in blocks):
            return "[image]"  # pasted image without text is still a typed prompt
    else:
        return None
    while True:  # drop leading injected reminder blocks
        stripped = REMINDER_RE.sub("", text, count=1)
        if stripped == text:
            break
        text = stripped
    text = text.strip()
    if not text or text.startswith(SKIP_PREFIXES):
        return None
    return text


def is_prompt(rec: dict) -> bool:
    if rec.get("type") != "user":
        return False
    if rec.get("isMeta") or rec.get("isSidechain") or rec.get("agentId"):
        return False
    origin = rec.get("origin")
    if isinstance(origin, dict) and origin.get("kind") not in (None, "human"):
        return False
    msg = rec.get("message")
    if not isinstance(msg, dict):
        return False
    return user_text(msg.get("content")) is not None


def collect(root: str):
    prompts: dict[str, int] = {}
    sessions: dict[str, set] = {}
    usage: dict[str, list] = {}  # message.id -> [day, inp, out, cache_create]
    files = glob.glob(os.path.join(root, "**", "*.jsonl"), recursive=True)
    for path in files:
        try:
            fh = open(path, encoding="utf-8", errors="replace")
        except OSError:
            continue
        with fh:
            for line in fh:
                if not line.strip():
                    continue
                try:
                    rec = json.loads(line)
                except (json.JSONDecodeError, ValueError):
                    continue  # damaged / truncated line
                if not isinstance(rec, dict):
                    continue
                kind = rec.get("type")
                if kind == "user":
                    if not is_prompt(rec):
                        continue
                    ts = parse_ts(rec.get("timestamp"))
                    if ts is None:
                        continue
                    day = to_local(ts).date().isoformat()
                    prompts[day] = prompts.get(day, 0) + 1
                    sid = rec.get("sessionId")
                    if sid:
                        sessions.setdefault(day, set()).add(sid)
                elif kind == "assistant":
                    msg = rec.get("message")
                    if not isinstance(msg, dict):
                        continue
                    u = msg.get("usage")
                    mid = msg.get("id")
                    if not isinstance(u, dict) or not mid:
                        continue
                    ts = parse_ts(rec.get("timestamp"))
                    if ts is None:
                        continue
                    day = to_local(ts).date().isoformat()
                    vals = []
                    for key in ("input_tokens", "output_tokens", "cache_creation_input_tokens"):
                        v = u.get(key)
                        vals.append(v if isinstance(v, int) and v > 0 else 0)
                    cur = usage.get(mid)
                    if cur is None:
                        usage[mid] = [day, *vals]
                    else:
                        if day < cur[0]:
                            cur[0] = day
                        for i, v in enumerate(vals, 1):
                            if v > cur[i]:
                                cur[i] = v
    tokens: dict[str, int] = {}
    for day, a, b, c in usage.values():
        tokens[day] = tokens.get(day, 0) + a + b + c
    return prompts, sessions, tokens, len(files)


DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
FIELDS = ("prompts", "sessions", "tokens")


def load_existing(path: str) -> dict[str, dict]:
    """Days already in the output file (history whose logs may be deleted)."""
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError):
        return {}
    days = data.get("days") if isinstance(data, dict) else None
    if not isinstance(days, list):
        return {}
    out: dict[str, dict] = {}
    for item in days:
        if not isinstance(item, dict):
            continue
        d = item.get("date")
        if not isinstance(d, str) or not DATE_RE.match(d):
            continue
        try:
            date.fromisoformat(d)
        except ValueError:
            continue
        vals = {}
        for f in FIELDS:
            v = item.get(f)
            vals[f] = v if isinstance(v, int) and not isinstance(v, bool) and v > 0 else 0
        prev = out.get(d)
        out[d] = {f: max(vals[f], prev[f]) for f in FIELDS} if prev else vals
    return out


def build(prompts, sessions, tokens, existing: dict[str, dict], window_days: int) -> dict:
    now = to_local(datetime.now(timezone.utc)).replace(microsecond=0)
    merged: dict[str, dict] = {}
    for d in set(prompts) | set(tokens):
        merged[d] = {
            "prompts": prompts.get(d, 0),
            "sessions": len(sessions.get(d, ())),
            "tokens": tokens.get(d, 0),
        }
    for d, old in existing.items():  # per-field max keeps days whose logs are gone
        cur = merged.get(d)
        merged[d] = {f: max(old[f], cur[f]) for f in FIELDS} if cur else dict(old)
    active = sorted(d for d, v in merged.items() if v["prompts"] or v["tokens"])
    if window_days > 0:
        first = (now.date() - timedelta(days=window_days - 1)).isoformat()
        active = [d for d in active if d >= first]
    days = [{"date": d, **merged[d]} for d in active]
    return {
        "generated": now.isoformat(),
        "timezone": TZ_NAME,
        "days": days,
        "totals": {
            "prompts": sum(x["prompts"] for x in days),
            "sessions": sum(x["sessions"] for x in days),
            "tokens": sum(x["tokens"] for x in days),
            "activeDays": len(days),
            "firstDay": days[0]["date"] if days else None,
        },
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", default=os.path.join(REPO_ROOT, "data", "claude.json"))
    ap.add_argument("--days", type=int, default=0,
                    help="keep only the last N days (0 = full history, default). "
                         "Trimmed days are dropped from the file for good.")
    ap.add_argument("--source", default=os.path.join(os.path.expanduser("~"), ".claude", "projects"),
                    help="Claude Code projects folder (default: ~/.claude/projects)")
    args = ap.parse_args()
    if args.days < 0:
        ap.error("--days must be >= 0")
    if not os.path.isdir(args.source):
        print(f"Source folder not found: {args.source}", file=sys.stderr)
        return 1

    out = os.path.abspath(args.out)
    existing = load_existing(out)
    prompts, sessions, tokens, nfiles = collect(args.source)
    data = build(prompts, sessions, tokens, existing, args.days)

    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=True)
        fh.write("\n")
    os.replace(tmp, out)

    t = data["totals"]
    tz_note = "zoneinfo" if _TZ is not None else "built-in EU DST rule (tzdata missing)"
    print(f"Read {nfiles} log files, timezone via {tz_note}, {len(existing)} days kept from previous output")
    print(f"Active days: {t['activeDays']} (first: {t['firstDay']})")
    print(f"Total prompts: {t['prompts']}  sessions: {t['sessions']}  tokens: {t['tokens']:,}")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
