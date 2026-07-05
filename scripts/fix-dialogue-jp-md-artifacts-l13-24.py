#!/usr/bin/env python3
"""第13–24课 · 会話日文去掉 ** 等 Markdown 脏标记"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = list(range(11, 25))  # 11 课残留 ** 脏标记一并清理


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def clean(s: str) -> str:
    return re.sub(r"\*+", "", s or "").strip()


def patch_dialogue(L: dict) -> int:
    n = 0
    for d in L.get("dialogues") or []:
        if (d.get("speaker") or "").find("*") >= 0:
            d["speaker"] = clean(d["speaker"])
            n += 1
        op = d.get("opener") or {}
        for field in ("japanese", "chinese"):
            v = op.get(field) or ""
            if "*" in v:
                op[field] = clean(v)
                n += 1
        ut = d.get("userTurn") or {}
        if (ut.get("speaker") or "").find("*") >= 0:
            ut["speaker"] = clean(ut["speaker"])
            n += 1
        for r in ut.get("replies") or []:
            for field in ("japanese", "chinese", "speaker"):
                v = r.get(field) or ""
                if "*" in v:
                    r[field] = clean(v)
                    n += 1
    return n


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


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    n = 0
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in LESSON_IDS:
        n += patch_dialogue(by_id[lid])
        text = save_lesson(text, by_id[lid])
    DATA.write_text(text, encoding="utf-8")
    print(f"[OK] fix-dialogue-jp-md-artifacts-l13-24: {n} fields")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
