#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第2单元第8课 · U2-C 标日精修

- grammarNodes 例句/例句译 ← basicText 真源
- 作業 Q12 → 综合题（与 gate 一致）；修正 quiz l8_q5 答案
- 不动课1、lesson-1-flow.js
"""
from __future__ import annotations

import json
import re
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_ID = 8

GRAMMAR_PATCH: dict[str, dict] = {
    "l8_g1": {
        "titleZh": "手段·方法（语言、工具等）",
        "example": "李さんは日本語で手紙を書きます。",
        "exampleZh": [
            "小李用日语写信。（课文第1句）",
            "私は妹にプレゼントをあげます。（授受·给予）",
            "※ 第6课「で」=交通；本课扩展为语言·工具。",
        ],
    },
    "l8_g2": {
        "example": "私は妹にプレゼントをあげます。",
        "exampleZh": [
            "我给妹妹礼物。（主语=给予者，に=对象）",
            "李さんは小野さんにプレゼントをあげました。（会話）",
        ],
    },
    "l8_g3": {
        "example": "先生がお菓子をくれました。",
        "exampleZh": [
            "老师给了我点心。（主语=给予者，常省略私に）",
            "森さんがくれました。（会話：别人给我方）",
        ],
    },
    "l8_g4": {
        "example": "友達から CD をもらいました。",
        "exampleZh": [
            "我从朋友那里得到了 CD。（主语=接受者）",
            "に／から 均可，から 强调来源。",
        ],
    },
}

HW_Q12_LINES = [
    "Q12【综合】：关于「で」与授受动词，哪句正确？",
    "A. 李さんは日本語で手紙を書きます。",
    "B. 私は友達が本をあげました。",
    "C. 先生が私に本をもらいました。",
    "D. 私は日本語に手紙を書きます。",
    "→ A（课文句：で＝语言手段；B/C 动词方向或主语错误）",
    "（拓展 Q13：私は田中さんに本をくれました。→ あげました）",
]

QUIZ_Q12 = {
    "id": "l8_q12",
    "type": "choice",
    "question": "关于「で」与授受动词，哪句正确？",
    "options": [
        "李さんは日本語で手紙を書きます。",
        "私は友達が本をあげました。",
        "先生が私に本をもらいました。",
        "私は日本語に手紙を書きます。",
    ],
    "answer": 0,
    "explanation": "A 为课文基本课文句。B 应「私は友達に…あげる」；C「もらう」主语是接受者；D 语言手段用で。",
    "grammarNodeId": "l8_g1",
}

QUIZ_Q5_FIX = {"answer": "で"}


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


def patch_grammar(L: dict) -> int:
    n = 0
    for node in L.get("grammarNodes") or []:
        pid = node.get("id")
        if pid not in GRAMMAR_PATCH:
            continue
        for k, v in GRAMMAR_PATCH[pid].items():
            if node.get(k) != v:
                node[k] = v
                n += 1
    return n


def patch_homework_q12(L: dict) -> int:
    for sec in L.get("homeworkSections") or []:
        if "間違い" not in (sec.get("title") or ""):
            continue
        sec["title"] = "総合問題（综合题 · gate Q12）／間違い参考（Q13）"
        lines = sec.get("lines") or []
        # 保留【题源】行（若有），替换 Q12 段
        head = []
        for ln in lines:
            if ln.startswith("【题源】"):
                head.append(ln)
                break
        sec["lines"] = head + HW_Q12_LINES
        return 1
    return 0


def patch_quiz(L: dict) -> int:
    n = 0
    qs = L.get("quizQuestions") or []
    for q in qs:
        if q.get("id") == "l8_q5" and q.get("answer") != QUIZ_Q5_FIX["answer"]:
            q["answer"] = QUIZ_Q5_FIX["answer"]
            n += 1
        if q.get("id") == "l8_q12":
            if q != QUIZ_Q12:
                qs[qs.index(q)] = deepcopy(QUIZ_Q12)
                n += 1
    return n


def main() -> int:
    text, lessons = load_lessons()
    L = next(x for x in lessons if x.get("lessonId") == LESSON_ID)
    n = patch_grammar(L)
    n += patch_homework_q12(L)
    n += patch_quiz(L)

    span = find_lesson_span(text, LESSON_ID)
    if not span:
        print("[FAIL] lesson 8 span not found", file=sys.stderr)
        return 1
    start, end = span
    trailing = end < len(text) and text[end - 1] == ","
    new_blob = serialize_lesson(L, trailing_comma=trailing)
    DATA.write_text(text[:start] + new_blob + text[end:], encoding="utf-8")
    print(f"[OK] patch-unit2-lesson8-u2c: {n} updates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
