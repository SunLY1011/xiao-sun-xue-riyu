#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第1课 · 解析中文微调（讲义腔→口语 + 小测解析 + 文法 links · 不动五关壳）"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

sys.path.insert(0, str(ROOT / "scripts"))
from grammar_links_biaori import NODE_OVERRIDES  # noqa: E402
from l1_quiz_explanations import L1_QUIZ_EXPLANATION_ZH  # noqa: E402

_tone_path = ROOT / "scripts" / "patch-zh-lecture-tone.py"
_tone_spec = importlib.util.spec_from_file_location("patch_zh_lecture_tone", _tone_path)
_tone_mod = importlib.util.module_from_spec(_tone_spec)
assert _tone_spec.loader
_tone_spec.loader.exec_module(_tone_mod)
REPLACEMENTS = _tone_mod.REPLACEMENTS
SKIP_IF_MATCH = _tone_mod.SKIP_IF_MATCH

# 先于通用「表示→说明」
L1_EXTRA_REPLACEMENTS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"用「の」表示所属"), "用「の」标所属"),
    (re.compile(r"表示轻微的惊讶"), "带有轻微惊讶"),
    (re.compile(r"使用时，表示"), "回应时，意思是"),
    (re.compile(r"表示“我才要"), "意思是“我才要"),
]

SKIP_L1 = re.compile(
    SKIP_IF_MATCH.pattern
    + r"|敬語レベル表示|レベル表示|也用于称呼"
)


def polish_l1(text: str) -> str:
    if not text or not isinstance(text, str):
        return text
    if SKIP_L1.search(text):
        return text
    out = text
    for pat, repl in L1_EXTRA_REPLACEMENTS:
        out = pat.sub(repl, out)
    for pat, repl in REPLACEMENTS:
        out = pat.sub(repl, out)
    return out


def polish_l1_value(v):
    if isinstance(v, str):
        return polish_l1(v)
    if isinstance(v, list):
        return [polish_l1_value(x) for x in v]
    if isinstance(v, dict):
        return {k: polish_l1_value(x) for k, x in v.items()}
    return v


def walk_l1(L: dict) -> None:
    for g in L.get("grammarNodes") or []:
        nid = g.get("id") or ""
        if nid in NODE_OVERRIDES:
            g["links"] = NODE_OVERRIDES[nid]
        for key in ("titleZh", "explanationZh"):
            if key in g:
                g[key] = polish_l1_value(g[key])
    for q in L.get("quizQuestions") or []:
        qid = q.get("id") or ""
        if qid in L1_QUIZ_EXPLANATION_ZH:
            q["explanationZh"] = L1_QUIZ_EXPLANATION_ZH[qid]
        for key in ("explanation", "explanationZh", "questionZh"):
            if key in q and qid not in L1_QUIZ_EXPLANATION_ZH:
                q[key] = polish_l1_value(q[key])
    for key in ("dialogueKeyPoints", "rolePlayTasks", "lessonCoachSummary"):
        if key in L:
            L[key] = polish_l1_value(L[key])
    for sec in L.get("homeworkSections") or []:
        sec["title"] = polish_l1(sec.get("title", ""))
        sec["lines"] = polish_l1_value(sec.get("lines"))
    for block in L.get("reviewExtension") or []:
        block["title"] = polish_l1(block.get("title", ""))
        block["lines"] = polish_l1_value(block.get("lines"))
    for block in L.get("summaryBlocks") or []:
        if "lines" in block:
            block["lines"] = polish_l1_value(block["lines"])


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    lessons = json.loads(m.group(2))
    found = False
    for L in lessons:
        if L.get("lessonId") != 1:
            continue
        found = True
        walk_l1(L)
        break
    if not found:
        raise SystemExit("lessonId 1 not found")
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")
    print(f"[OK] patch-l1-explanation-zh: quiz解析 {len(L1_QUIZ_EXPLANATION_ZH)} 条 · 文法 links · 讲义腔")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
