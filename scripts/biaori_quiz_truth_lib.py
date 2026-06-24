# -*- coding: utf-8 -*-
"""标日小测真源 · 共享读写与 apply_quiz（U2–U6 patch 脚本共用）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

_BLANK = re.compile(r"[＿_]+")
_HINT = re.compile(r"\s*→.*$|（[^）]*）$")


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def split_choice_options(combined: str) -> list[str]:
    s = re.sub(r"\s*→.*$", "", combined).strip()
    parts = re.split(r"(?:^|[\s　]+)(?=[B-D][\.．、]\s*)", s)
    opts: list[str] = []
    for p in parts:
        p = re.sub(r"^[A-D][\.．、]\s*", "", p).strip()
        p = re.sub(r"（[^）]*）\s*$", "", p).strip()
        if p:
            opts.append(p)
    return opts or [s]


def fill_tts(question: str, answer: str) -> str:
    q = _HINT.sub("", question.strip())
    q = re.sub(r"\s*—.*$", "", q).strip()
    if _BLANK.search(q):
        return _BLANK.sub(str(answer), q, count=1)
    if re.search(r"[\u3040-\u30ff\u3400-\u9fff]", q):
        return q
    return str(answer)


def apply_quiz(L: dict, lid: int, canon: dict[int, dict[int, dict]]) -> int:
    spec_map = canon.get(lid, {})
    n = 0
    for q in L.get("quizQuestions") or []:
        m = re.search(r"_q(\d+)$", q.get("id", ""))
        if not m:
            continue
        qi = int(m.group(1))
        spec = spec_map.get(qi)
        if not spec:
            continue
        q["type"] = spec["type"]
        q["question"] = spec["question"]
        if spec["type"] == "choice":
            if "options" in spec:
                q["options"] = spec["options"]
            else:
                q["options"] = split_choice_options(spec.get("options_raw", ""))
            q["answer"] = spec["answer"]
            if "explanation" in spec:
                q["explanation"] = spec["explanation"]
        else:
            q["answer"] = spec["answer"]
            q["questionTts"] = fill_tts(spec["question"], spec["answer"])
            q.pop("options", None)
        if spec.get("grammarNodeId"):
            q["grammarNodeId"] = spec["grammarNodeId"]
        q["explanationZh"] = spec["explanationZh"]
        n += 1
    return n


def fix_homework_headers(L: dict) -> int:
    n = 0
    for sec in L.get("homeworkSections") or []:
        for i, line in enumerate(sec.get("lines") or []):
            if line.startswith("【题源】"):
                sec["lines"][i] = line.replace("【题源】", "【本课课文】", 1)
                n += 1
    return n


def normalize_translation_quizzes(L: dict) -> int:
    """将单选项「→ 答案」的伪选择题改为 fill（无 CANON 时的兜底）。"""
    n = 0
    for q in L.get("quizQuestions") or []:
        opts = q.get("options") or []
        if q.get("type") != "choice" or len(opts) != 1:
            if len(opts) == 1 and isinstance(opts[0], str) and re.match(r"^[A-D][\.．、]", opts[0]):
                q["options"] = split_choice_options(opts[0])
            continue
        only = opts[0].strip()
        if only.startswith("→"):
            ans = re.sub(r"^→\s*", "", only).strip()
            q["type"] = "fill"
            q["answer"] = ans
            q.pop("options", None)
            q["questionTts"] = fill_tts(q.get("question", ""), ans)
            n += 1
        elif re.match(r"^[A-D][\.．、]", only):
            q["options"] = split_choice_options(only)
            n += 1
    return n
