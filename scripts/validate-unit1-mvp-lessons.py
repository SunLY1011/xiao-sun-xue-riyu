#!/usr/bin/env python3
"""第1单元第2–4课 · 与第1课 MVP 数据字段对齐校验（只读）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

REQUIRED_KEYS = [
    "lessonId",
    "lessonTitle",
    "theme",
    "themeZh",
    "vocab",
    "grammarNodes",
    "dialogues",
    "quizQuestions",
    "basicText",
    "dialogueKeyPoints",
    "rolePlayTasks",
    "homeworkSections",
    "summaryBlocks",
    "reviewExtension",
]

HW_TITLES = [
    "発音",
    "活用",
    "選択",
    "穴埋め",
    "翻訳",
    "間違い",
    "作文",
    "聴解",
]

SUMMARY_KEYS = ["pronunciation", "etymology", "preview", "honorific"]


def load_lessons() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return json.loads(m.group(1))


def main() -> int:
    lessons = {L["lessonId"]: L for L in load_lessons()}
    ok = True
    for lid in (1, 2, 3, 4):
        L = lessons.get(lid)
        if not L:
            print(f"[FAIL] lesson {lid} missing")
            ok = False
            continue
        missing = [k for k in REQUIRED_KEYS if k not in L or L[k] in (None, [], "")]
        if missing:
            print(f"[FAIL] lesson {lid} missing/empty: {missing}")
            ok = False
        hw = L.get("homeworkSections") or []
        hw_titles = " ".join(s.get("title", "") for s in hw)
        for tag in HW_TITLES:
            if tag not in hw_titles:
                print(f"[WARN] lesson {lid} homework missing section tag: {tag}")
        sb_keys = {b.get("key") for b in (L.get("summaryBlocks") or [])}
        for k in SUMMARY_KEYS:
            if k not in sb_keys:
                print(f"[WARN] lesson {lid} summaryBlocks missing key: {k}")
        print(
            f"[OK] lesson {lid}: vocab={len(L.get('vocab') or [])} "
            f"dlg={len(L.get('dialogues') or [])} grammar={len(L.get('grammarNodes') or [])} "
            f"quiz={len(L.get('quizQuestions') or [])} hw={len(hw)} ext={len(L.get('reviewExtension') or [])}"
        )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
