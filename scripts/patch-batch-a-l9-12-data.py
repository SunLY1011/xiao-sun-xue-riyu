#!/usr/bin/env python3
"""批 A：lessons-data 第9–12课 opener 中文 + L9 小测 grammarNodeId"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
sys.path.insert(0, str(ROOT / "scripts"))
from curated_dialogue_zh_l9_12 import CURATED_L9_12
from curated_zh_lookup import lookup_curated, norm_jp

L9_QUIZ_GID = {
    "l9_q1": "l9_g1",
    "l9_q2": "l9_g2",
    "l9_q3": "l9_g1",
    "l9_q4": "l9_g3",
    "l9_q5": "l9_g2",
    "l9_q6": "l9_g1",
    "l9_q7": "l9_g1",
    "l9_q8": "l9_g3",
    "l9_q9": "l9_g2",
    "l9_q10": "l9_g1",
    "l9_q11": "l9_g1",
    "l9_q12": "l9_g1",
}


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
        zh = lookup_curated(jp, CURATED_L9_12)
        if zh:
            op["chinese"] = zh
            n += 1
        for r in (d.get("userTurn") or {}).get("replies") or []:
            jp2 = norm_jp(r.get("japanese", ""))
            zh2 = lookup_curated(jp2, CURATED_L9_12)
            if zh2:
                r["chinese"] = zh2
                n += 1
    return n


def patch_l9_quiz(L: dict) -> int:
    if L["lessonId"] != 9:
        return 0
    n = 0
    for q in L.get("quizQuestions") or []:
        gid = L9_QUIZ_GID.get(q.get("id", ""))
        if gid and q.get("grammarNodeId") != gid:
            q["grammarNodeId"] = gid
            n += 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    stats = {"zh": 0, "quiz": 0}
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in (9, 10, 11, 12):
        L = by_id[lid]
        stats["zh"] += patch_dialogue_zh(L)
        stats["quiz"] += patch_l9_quiz(L)
        text = save_lesson(text, L)
    DATA.write_text(text, encoding="utf-8")
    print("[OK] patch-batch-a-l9-12-data:", stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
