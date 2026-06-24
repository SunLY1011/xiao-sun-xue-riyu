#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""笔记 A+B：课内数据清理（L1 误用拆行、L13+ 占位易错、L13 参考表去重）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

PLACEHOLDER_TRIO = [
    "× 行って、買い物をします（错）　○ 行って、買い物をしました",
    "× 読んでいる　○ 読んでいます（丁寧）",
    "× 広いで明るい　○ 広くて明るい",
]

STALE_ADJ_TRIO = [
    "× 辛いでした　○ 辛かったです（イ形容詞过去）",
    "× おいしいくない　○ おいしくない",
    "× あまり辛いです　○ あまり辛くないです",
]

MARK_TOP20 = "【对照表·Top20】"


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def is_mistake_sec(sec: dict) -> bool:
    return bool(re.search(r"误|誤り", sec.get("title") or ""))


def is_ref_sec(sec: dict) -> bool:
    return "参考表" in (sec.get("title") or "")


def dedupe_preserve_order(lines: list) -> list:
    seen: set[str] = set()
    out: list = []
    for line in lines:
        t = str(line).strip()
        if not t or t in seen:
            continue
        seen.add(t)
        out.append(line if isinstance(line, str) else t)
    return out


def split_multiline_mistakes(lines: list) -> list:
    out: list = []
    for line in lines:
        s = str(line)
        if "\n" in s:
            out.extend([p.strip() for p in s.split("\n") if p.strip()])
        else:
            out.append(s.strip())
    return out


def fix_lesson_1_mistakes(lessons: list) -> int:
    n = 0
    for les in lessons:
        if les.get("lessonId") != 1:
            continue
        for sec in les.get("reviewExtension") or []:
            if not is_mistake_sec(sec):
                continue
            before = len(sec.get("lines") or [])
            sec["lines"] = split_multiline_mistakes(sec.get("lines") or [])
            if len(sec["lines"]) != before:
                n += 1
    return n


def remove_stale_lines(lessons: list) -> int:
    removed = 0
    for les in lessons:
        lid = int(les.get("lessonId") or 0)
        for sec in les.get("reviewExtension") or []:
            if not is_mistake_sec(sec):
                continue
            new_lines = []
            for line in sec.get("lines") or []:
                t = str(line).strip()
                if t in PLACEHOLDER_TRIO and lid not in (14,):
                    removed += 1
                    continue
                if t in STALE_ADJ_TRIO and lid >= 12:
                    removed += 1
                    continue
                new_lines.append(line)
            sec["lines"] = new_lines
    return removed


def dedupe_mistake_sections(lessons: list) -> int:
    """同课误用块内：按去标记后的 ×○ 正文去重。"""
    removed = 0

    def key(line: str) -> str:
        t = re.sub(r"【[^】]+】\s*", "", line).strip()
        return re.sub(r"\s+", "", t)

    for les in lessons:
        for sec in les.get("reviewExtension") or []:
            if not is_mistake_sec(sec):
                continue
            lines = split_multiline_mistakes(sec.get("lines") or [])
            seen: set[str] = set()
            out: list = []
            for line in lines:
                t = str(line).strip()
                if not t:
                    continue
                k = key(t)
                if k in seen:
                    removed += 1
                    continue
                seen.add(k)
                out.append(t)
            sec["lines"] = out
    return removed


def dedupe_l13_reference(lessons: list) -> int:
    for les in lessons:
        if les.get("lessonId") != 13:
            continue
        for sec in les.get("reviewExtension") or []:
            if not is_ref_sec(sec):
                continue
            before = len(sec.get("lines") or [])
            sec["lines"] = dedupe_preserve_order(sec.get("lines") or [])
            return before - len(sec["lines"])
    return 0


def main() -> int:
    text, m, lessons = load_lessons()
    r1 = fix_lesson_1_mistakes(lessons)
    r2 = remove_stale_lines(lessons)
    r3 = dedupe_mistake_sections(lessons)
    r4 = dedupe_l13_reference(lessons)
    save_lessons(text, m, lessons)
    print(
        f"[OK] L1 split sections={r1}; removed stale/placeholder={r2}; "
        f"mistake dedupe={r3}; L13 ref dedupe={r4}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
