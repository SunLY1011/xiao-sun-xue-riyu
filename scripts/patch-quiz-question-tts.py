#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为 lessons-data 填空测验补 questionTts（完整可读日文句 · 批次 C）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

_BLANK = re.compile(r"[＿_]+")
_JA = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
_ZH_ONLY = re.compile(r"^[\u4e00-\u9fff0-9A-Za-z，。、？！：；「」『』（）\s—－\-·．.…]+$")
_HINT_PAREN = re.compile(r"（[^）]*）|\([^)]*\)")


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def normalize_ja(s: str) -> str:
    s = s.strip()
    s = s.replace("，", "、").replace("？", "？").replace("！", "！")
    s = re.sub(r"\s+", " ", s)
    s = _HINT_PAREN.sub("", s).strip()
    return s


def is_chinese_line(s: str) -> bool:
    if not s or not re.search(r"[\u4e00-\u9fff]", s):
        return False
    return not _JA.search(s.replace("JC", "").replace("N", ""))


def build_question_tts(q: dict) -> str:
    question = (q.get("question") or "").strip()
    answer = q.get("answer")
    if answer is None:
        answer = ""
    if isinstance(answer, (int, float)):
        answer = str(answer)
    answer = str(answer).strip()

    if not question and answer and _JA.search(answer):
        return normalize_ja(answer)

    if is_chinese_line(question):
        if _JA.search(answer):
            return normalize_ja(answer.split("／")[0].split("/")[0])
        return ""

    if _BLANK.search(question):
        tts = question
        if isinstance(answer, str) and _BLANK.search(answer):
            parts = [p.strip() for p in re.split(r"[、／/]", answer) if p.strip()]
        elif isinstance(answer, str) and answer:
            parts = [answer]
        else:
            parts = []
        for part in parts:
            tts = _BLANK.sub(part, tts, count=1)
        tts = _BLANK.sub("", tts)
        return normalize_ja(tts)

    if _JA.search(question):
        return normalize_ja(question)

    if _JA.search(answer):
        return normalize_ja(answer)

    return ""


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, m, lessons = load_lessons()
    n = 0
    for L in lessons:
        for q in L.get("quizQuestions") or []:
            if q.get("type") != "fill":
                continue
            if (q.get("questionTts") or "").strip():
                continue
            tts = build_question_tts(q)
            if not tts:
                continue
            q["questionTts"] = tts
            n += 1
    save_lessons(text, m, lessons)
    print(f"[OK] patch-quiz-question-tts: added questionTts on {n} fill items")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
