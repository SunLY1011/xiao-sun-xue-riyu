#!/usr/bin/env python3
"""第2单元第5–8课 · 与第1课 MVP 数据字段对齐校验（只读）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"

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


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def abc_counts() -> dict[int, int]:
    text = ABC.read_text(encoding="utf-8")
    out: dict[int, int] = {}
    for lid in (5, 6, 7, 8):
        m = re.search(rf"const\s+L{lid}_DIALOGUE_ABC\s*=\s*\{{", text)
        if not m:
            out[lid] = 0
            continue
        rest = text[m.end() :]
        depth = 1
        i = 0
        while i < len(rest) and depth > 0:
            if rest[i] == "{":
                depth += 1
            elif rest[i] == "}":
                depth -= 1
            i += 1
        block = rest[: i]
        out[lid] = block.count('label: "A"')
    return out


def main() -> int:
    lessons = load_lessons()
    abc = abc_counts()
    ok = True
    for lid in (5, 6, 7, 8):
        L = lessons.get(lid)
        if not L:
            print(f"[FAIL] lesson {lid} missing")
            ok = False
            continue
        missing = [k for k in REQUIRED_KEYS if k not in L or L[k] in (None, [], "")]
        if missing:
            print(f"[FAIL] lesson {lid} missing/empty: {missing}")
            ok = False
        dlg_n = len(L.get("dialogues") or [])
        abc_n = abc.get(lid, 0)
        if abc_n < dlg_n:
            print(f"[WARN] lesson {lid} ABC {abc_n} < dialogues {dlg_n}")
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
            f"dlg={dlg_n} abc={abc_n} grammar={len(L.get('grammarNodes') or [])} "
            f"quiz={len(L.get('quizQuestions') or [])} hw={len(hw)} "
            f"ext={len(L.get('reviewExtension') or [])}"
        )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
