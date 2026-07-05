#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""U6 第21–24课 · PRD 真源小测"""
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

LESSON_IDS = [21, 22, 23, 24]

Q12_EXPLAIN: dict[int, str] = {
    21: "选 A。たことがある表经验；×登ることがあります。",
    22: "选 A。简体句尾；×行きます京都へ语序错误。",
    23: "选 A。たり～たりする表列举；×場合＝场合。",
    24: "选 A。と思う／と言う引用；简体缺です。",
}


def patch_q12_explain(L: dict, lid: int) -> int:
    zh = Q12_EXPLAIN.get(lid)
    if not zh:
        return 0
    for q in L.get("quizQuestions") or []:
        if q.get("id") == f"l{lid}_q12":
            q["explanationZh"] = zh
            return 1
    return 0


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
    print(f"[OK] patch-u6-lessons-21-24-biaori-truth: quiz {stats} · homework {hw}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
