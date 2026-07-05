#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""U5 第17–20课 · PRD 真源小测"""
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

LESSON_IDS = [17, 18, 19, 20]

Q12_EXPLAIN: dict[int, str] = {
    17: "选 A。が好き／ほしい的对象用「が」；×をほしい。",
    18: "选 A。なる＝自然变化；×ほうがいい表建议。",
    19: "选 A。ないでください＝请不要；×なければ＝必须。",
    20: "选 A。ことができる；×が弾くことができる语序错误。",
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
    print(f"[OK] patch-u5-lessons-17-20-biaori-truth: quiz {stats} · homework {hw}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
