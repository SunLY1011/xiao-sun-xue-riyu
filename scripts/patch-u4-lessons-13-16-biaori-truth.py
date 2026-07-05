#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""U4 第13–16课 · PRD 真源小测（Q1–11 解析 + Q12 保留综合题）"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from biaori_quiz_truth_lib import (
    apply_quiz,
    fix_homework_headers,
    load_lessons,
    normalize_translation_quizzes,
    save_lessons,
)
from prd_quiz_canon import build_canon

LESSON_IDS = [13, 14, 15, 16]

# Q12 综合题 explanationZh 精修（保留现有 options）
Q12_EXPLAIN: dict[int, str] = {
    13: "选 A。书用「冊」；丁寧体用「あります」；鸡蛋问「何個」。",
    14: "选正确て形句。×帰るて→帰って；×読むて→読んで。",
    15: "选 B。现在进行用「～ています」；×今食べます→食べています。",
    16: "选 A。ナ形并列用「～くて」；結果态用「～ています」。",
}


def patch_q12_explain(L: dict, lid: int) -> int:
    n = 0
    zh = Q12_EXPLAIN.get(lid)
    if not zh:
        return 0
    for q in L.get("quizQuestions") or []:
        if q.get("id") == f"l{lid}_q12":
            q["explanationZh"] = zh
            n = 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    canon = build_canon(LESSON_IDS)
    text, m, lessons = load_lessons()
    stats: dict[int, int] = {}
    hw = 0
    for L in lessons:
        lid = L.get("lessonId")
        if lid not in LESSON_IDS:
            continue
        normalize_translation_quizzes(L)
        stats[lid] = apply_quiz(L, lid, canon)
        patch_q12_explain(L, lid)
        hw += fix_homework_headers(L)
    save_lessons(text, m, lessons)
    print(f"[OK] patch-u4-lessons-13-16-biaori-truth: quiz {stats} · homework {hw}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
