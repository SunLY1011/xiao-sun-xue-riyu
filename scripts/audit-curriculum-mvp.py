#!/usr/bin/env python3
"""24 课 × MVP 金标（L14）对照审计 · 输出 docs/curriculum-mvp-audit.json"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data"

GOLD = {
    "grammar_nodes_min": 5,
    "quiz_min": 4,
    "dialogue_replies_min": 3,
    "vocab_depth_min": 8,
    "node_patches_min": 1,
    "coach_summary": True,
    "difficult_hints": True,
}

SILVER = {
    "grammar_nodes_min": 2,
    "quiz_min": 3,
    "dialogue_replies_min": 3,
    "vocab_depth_min": 5,
    "node_patches_min": 0,
    "coach_summary": True,
    "difficult_hints": False,
}

MVP_FILES = [
    "lessons-mvp.js",
    "lessons-stage2-mvp.js",
    "lessons-prd-unreleased-mvp.js",
]


def split_lesson_blocks(combined: str) -> dict[int, str]:
    by_id: dict[int, str] = {}
    chunks = re.split(r'(?=(?:lessonId|"lessonId")\s*:\s*\d+)', combined)
    for ch in chunks:
        m = re.search(r'(?:lessonId|"lessonId")\s*:\s*(\d+)', ch)
        if not m:
            continue
        lid = int(m.group(1))
        if 1 <= lid <= 24:
            by_id[lid] = ch
    return by_id


def depth_metrics(lid: int) -> dict:
    text = (DATA / "lessons-mvp-depth.js").read_text(encoding="utf-8")
    m = re.search(rf"\n\s*{lid}\s*:\s*\{{", text)
    if not m:
        return {
            "vocabDepth": 0,
            "nodePatches": 0,
            "coachSummary": False,
            "difficultHints": False,
        }
    sub = text[m.start() : m.start() + 12000]
    vocab_n = len(re.findall(r'id:\s*"l\d+_v', sub)) + len(re.findall(r'"id":\s*"l\d+_v', sub))
    np_m = re.search(r"nodePatches\s*:\s*\{", sub)
    node_patches = 0
    if np_m:
        np_sub = sub[np_m.end() : np_m.end() + 4000]
        node_patches = len(re.findall(r"\bl\d+_\w+:\s*\{", np_sub))
        if node_patches == 0:
            node_patches = 1
    return {
        "vocabDepth": vocab_n,
        "nodePatches": node_patches,
        "coachSummary": "lessonCoachSummary" in sub,
        "difficultHints": "difficultVocabHints" in sub,
    }


def lesson_source(lid: int) -> str:
    if lid in (14, 16, 18):
        return "mvp-core"
    if lid in (13, 15, 17, 19, 20):
        return "stage2"
    prd = (DATA / "lessons-prd-unreleased-mvp.js").read_text(encoding="utf-8")
    if f'"lessonId": {lid}' in prd:
        return "prd-auto"
    return "unknown"


def score_block(block: str, depth: dict, lid: int) -> dict:
    gn = len(re.findall(r'\bid:\s*"l\d+_', block)) + len(
        re.findall(r'"id":\s*"l\d+_', block)
    )
    gn = max(
        len(re.findall(r'\bid:\s*"l\d+_', block)),
        len(re.findall(r'"id":\s*"l\d+_', block)),
    )
    quiz = max(
        len(re.findall(r'\bid:\s*"l\d+_q\d+', block)),
        len(re.findall(r'"id":\s*"l\d+_q\d+', block)),
    )
    replies = len(re.findall(r'(?:"noteJa"|noteJa):\s*"', block))
    has_dialogue = "dialogues" in block
    has_chinese = bool(re.search(r'"chinese":\s*"[^"]{2,}', block))
    has_question_tts = "questionTts" in block
    has_title_ruby = "lessonTitleRuby" in block and "reading" in block

    vocab_n = depth["vocabDepth"]
    node_patches = depth["nodePatches"]
    coach = depth["coachSummary"]
    diff = depth["difficultHints"]

    def tier(bar: dict) -> bool:
        return (
            gn >= bar["grammar_nodes_min"]
            and quiz >= bar["quiz_min"]
            and replies >= bar["dialogue_replies_min"]
            and vocab_n >= bar["vocab_depth_min"]
            and node_patches >= bar["node_patches_min"]
            and (coach if bar["coach_summary"] else True)
            and (diff if bar["difficult_hints"] else True)
            and has_dialogue
        )

    if tier(GOLD):
        level = "gold"
    elif tier(SILVER):
        level = "silver"
    elif gn >= 1 and quiz >= 1 and has_dialogue:
        level = "bronze"
    else:
        level = "missing"

    gaps = []
    if gn < GOLD["grammar_nodes_min"]:
        gaps.append(f"文法节点{gn}/{GOLD['grammar_nodes_min']}")
    if quiz < GOLD["quiz_min"]:
        gaps.append(f"测验{quiz}/{GOLD['quiz_min']}")
    if replies < GOLD["dialogue_replies_min"]:
        gaps.append(f"会話note{replies}/{GOLD['dialogue_replies_min']}")
    if vocab_n < GOLD["vocab_depth_min"]:
        gaps.append(f"単語{vocab_n}/{GOLD['vocab_depth_min']}")
    if node_patches < GOLD["node_patches_min"]:
        gaps.append(f"補足nodePatches{node_patches}/{GOLD['node_patches_min']}")
    if not coach:
        gaps.append("缺lessonCoachSummary")
    if not diff:
        gaps.append("缺difficultVocabHints")
    if not has_chinese:
        gaps.append("会話chinese空")
    if "fill" in block and not has_question_tts:
        gaps.append("填空缺questionTts")
    if not has_title_ruby:
        gaps.append("缺lessonTitleRuby")

    biaori = (DATA / "lesson-vocab-biaori.js").read_text(encoding="utf-8")
    has_biaori = bool(re.search(rf"\n\s*{lid}\s*:\s*\[", biaori))

    return {
        "grammarNodes": gn,
        "quizQuestions": quiz,
        "dialogueNotes": replies,
        "vocabDepth": vocab_n,
        "nodePatches": node_patches,
        "coachSummary": coach,
        "difficultHints": diff,
        "hasChineseDialogue": has_chinese,
        "hasQuestionTts": has_question_tts,
        "hasBiaoriVocab": has_biaori,
        "level": level,
        "gaps": gaps,
        "source": lesson_source(lid),
    }


def main() -> int:
    combined = "\n".join(
        (DATA / f).read_text(encoding="utf-8") for f in MVP_FILES if (DATA / f).exists()
    )
    by_id = split_lesson_blocks(combined)

    rows = []
    for lid in range(1, 25):
        block = by_id.get(lid, "")
        depth = depth_metrics(lid)
        if not block:
            rows.append(
                {
                    "lessonId": lid,
                    "level": "missing",
                    "gaps": ["无 lessons-mvp 课包"],
                    "source": lesson_source(lid),
                }
            )
            continue
        rows.append({"lessonId": lid, **score_block(block, depth, lid)})

    out_json = ROOT / "docs" / "curriculum-mvp-audit.json"
    out_json.write_text(
        json.dumps({"goldRef": 14, "thresholds": {"gold": GOLD, "silver": SILVER}, "rows": rows}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    levels: dict[str, list[int]] = {"gold": [], "silver": [], "bronze": [], "missing": []}
    for r in rows:
        levels.setdefault(r["level"], []).append(r["lessonId"])

    print("=== MVP 课程审计（对照 L14 金标）===\n")
    print(f"{'课':>3} {'级':8} {'源':10} {'文法':>4} {'测验':>4} {'会話':>4} {'単語':>4} {'補足':>4} 缺口")
    for r in rows:
        if r["level"] == "missing" and len(r.get("gaps", [])) == 1:
            print(f"{r['lessonId']:3d} missing    —          —    —    —    —    {r['gaps'][0]}")
            continue
        gap = "；".join(r["gaps"][:5]) if r.get("gaps") else "—"
        print(
            f"{r['lessonId']:3d} {r['level']:8} {r.get('source','?'):10} "
            f"{r.get('grammarNodes',0):4d} {r.get('quizQuestions',0):4d} "
            f"{r.get('dialogueNotes',0):4d} {r.get('vocabDepth',0):4d} "
            f"{r.get('nodePatches',0):4d}  {gap}"
        )
    print(f"\n金标 gold:    {levels.get('gold', [])}")
    print(f"银标 silver:  {levels.get('silver', [])}")
    print(f"铜标 bronze:  {levels.get('bronze', [])}")
    print(f"缺失 missing: {levels.get('missing', [])}")
    print(f"\nJSON → {out_json.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
