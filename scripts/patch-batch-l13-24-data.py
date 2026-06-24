#!/usr/bin/env python3
"""批 B–D（13–24课）· lessons-data 会話中文同步 curated"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
sys.path.insert(0, str(ROOT / "scripts"))
from curated_dialogue_zh_l9_12 import CURATED_L9_12
from curated_dialogue_zh_l13_24 import CURATED_L13_24
from curated_zh_lookup import lookup_curated, norm_jp

LESSON_IDS = list(range(13, 25))


def lookup(jp: str) -> str:
    return lookup_curated(jp, CURATED_L13_24, CURATED_L9_12)


def load_lessons() -> tuple[str, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return text, json.loads(m.group(1))


def find_lesson_span(text: str, lid: int) -> tuple[int, int] | None:
    marker = f'"lessonId": {lid},'
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.rfind("{", 0, idx)
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(text) and text[end] == ",":
                    end += 1
                return start, end
    return None


def serialize_lesson(L: dict, *, trailing_comma: bool) -> str:
    lines = json.dumps(L, ensure_ascii=False, indent=2).split("\n")
    blob = "  " + lines[0] + "\n" + "\n".join("  " + ln for ln in lines[1:])
    if trailing_comma and not blob.rstrip().endswith(","):
        blob = blob.rstrip() + ","
    return blob


def save_lesson(text: str, L: dict) -> str:
    lid = L["lessonId"]
    span = find_lesson_span(text, lid)
    if not span:
        raise SystemExit(f"lesson {lid} not found")
    rest = text[span[1] :].lstrip()
    trailing_comma = rest.startswith("{")
    return text[: span[0]] + serialize_lesson(L, trailing_comma=trailing_comma) + text[span[1] :]


def patch_dialogue_zh(L: dict) -> int:
    n = 0
    for d in L.get("dialogues") or []:
        op = d.get("opener") or {}
        jp = norm_jp(op.get("japanese", ""))
        zh = lookup(jp)
        if zh:
            op["chinese"] = zh
            n += 1
        for r in (d.get("userTurn") or {}).get("replies") or []:
            jp2 = norm_jp(r.get("japanese", ""))
            zh2 = lookup(jp2)
            if zh2:
                r["chinese"] = zh2
                n += 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    stats = {"zh": 0}
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in LESSON_IDS:
        L = by_id[lid]
        stats["zh"] += patch_dialogue_zh(L)
        text = save_lesson(text, L)
    DATA.write_text(text, encoding="utf-8")
    print("[OK] patch-batch-l13-24-data:", stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
