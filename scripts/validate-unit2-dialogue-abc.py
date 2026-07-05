#!/usr/bin/env python3
"""第5–8课会話 ABC · 严格校验（A/B/C 三轨 + 条数=dialogues）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"


def load_lessons():
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def abc_maps():
    text = ABC.read_text(encoding="utf-8")
    if ",," in text:
        raise SystemExit("[FAIL] unit2-dialogue-abc-l5-8.js has ,, syntax error")
    out = {}
    for lid in (5, 6, 7, 8):
        m = re.search(rf"const\s+L{lid}_DIALOGUE_ABC\s*=\s*(\{{.*?\}});", text, re.S)
        if not m:
            raise SystemExit(f"[FAIL] L{lid}_DIALOGUE_ABC missing")
        block = m.group(1)
        ids = re.findall(r'"([^"]+_dlg_\d+)":\s*\{', block)
        out[lid] = ids
    return out


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    maps = abc_maps()
    ok = True
    for lid in (5, 6, 7, 8):
        dlg_ids = [d["id"] for d in lessons[lid].get("dialogues") or [] if d.get("id")]
        abc_ids = maps[lid]
        if set(dlg_ids) != set(abc_ids):
            ok = False
            print(f"[FAIL] L{lid} id mismatch dlg={len(dlg_ids)} abc={len(abc_ids)}")
        else:
            print(f"[OK] L{lid} {len(abc_ids)} scenes ABC ids match")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
