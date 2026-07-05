#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""常见错误 Top20 → 各课 reviewExtension「⚠️ よくある誤り」追加一条（按课次列）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
TOP20 = ROOT / "参考资料/03-语法补充/常见错误Top20.md"
MISTAKE_TITLE = "⚠️ よくある誤り"
MARKER = "【对照表·Top20】"


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def parse_top20() -> dict[int, str]:
    by_lesson: dict[int, list[str]] = {}
    for line in TOP20.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or line.startswith("| #") or "---" in line:
            continue
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 5 or not parts[0].isdigit():
            continue
        num, wrong, right, lesson_s, note = parts[0], parts[1], parts[2], parts[3], parts[4]
        if not lesson_s.isdigit():
            continue
        lid = int(lesson_s)
        line_txt = f"{MARKER} × {wrong} → ○ {right}（{note}）"
        by_lesson.setdefault(lid, []).append(line_txt)
    return {lid: "\n".join(lines) for lid, lines in by_lesson.items()}


def patch_lesson(L: dict, top20_line: str) -> bool:
    blocks = L.get("reviewExtension") or []
    target = None
    for b in blocks:
        t = b.get("title") or ""
        if "误用" in t or "誤り" in t or "误" in t:
            target = b
            break
    if not target:
        return False
    lines = list(target.get("lines") or [])
    lines = [ln for ln in lines if MARKER not in ln]
    if top20_line not in lines:
        lines.insert(0, top20_line)
    target["lines"] = lines
    return True


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    by_lesson = parse_top20()
    text, m, lessons = load_lessons()
    ok = 0
    for L in lessons:
        lid = L.get("lessonId")
        if lid not in by_lesson:
            continue
        if patch_lesson(L, by_lesson[lid]):
            ok += 1
    save_lessons(text, m, lessons)
    print(f"[OK] patch-top20-review-extension: {ok} lessons")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
