#!/usr/bin/env python3
"""第3–6单元第9–24课 vs 第1课 MVP · 严格对齐审计"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
FLOW = ROOT / "js" / "lesson-1-flow.js"
TIPS = ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"

HW_TAGS = ["発音", "活用", "選択", "穴埋め", "翻訳", "間違い", "作文", "聴解"]
SB_KEYS = ["pronunciation", "etymology", "preview", "honorific"]
L1_BASELINE = {"quiz_n": 12, "review_ext_n": 5}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def abc_count(lid: int) -> int:
    text = ABC.read_text(encoding="utf-8")
    m = re.search(rf"^\s*{lid}:\s*\{{", text, re.M)
    if not m:
        return 0
    rest = text[m.end() :]
    depth = 1
    i = 0
    while i < len(rest) and depth > 0:
        if rest[i] == "{":
            depth += 1
        elif rest[i] == "}":
            depth -= 1
        i += 1
    return rest[:i].count('label: "A"')


def flow_has_vocab_warn(lid: int) -> bool:
    text = FLOW.read_text(encoding="utf-8")
    return f"{lid}: new Set" in text


def audit_lesson(L: dict, lid: int) -> dict:
    dlg = L.get("dialogues") or []
    dlg_op = sum(1 for d in dlg if (d.get("opener") or {}).get("chinese", "").strip())
    dlg_rep = sum(
        1
        for d in dlg
        for r in (d.get("userTurn") or {}).get("replies") or []
        if (r.get("chinese") or "").strip()
    )
    verb_n = sum(1 for v in L.get("vocab") or [] if "動" in (v.get("pos") or ""))
    vocab_conj = sum(
        1
        for v in L.get("vocab") or []
        if v.get("conjugation") and (v.get("conjugation") or {}).get("forms")
    )
    rext = L.get("reviewExtension") or []
    rext_titles = " ".join(x.get("title", "") for x in rext)
    hw_titles = " ".join(s.get("title", "") for s in L.get("homeworkSections") or [])
    return {
        "lid": lid,
        "dlg_n": len(dlg),
        "dlg_abc": abc_count(lid),
        "dlg_ch_ok": dlg_op >= len(dlg) * 0.9 and dlg_rep >= len(dlg) * 0.9,
        "quiz_n": len(L.get("quizQuestions") or []),
        "quiz_ok": len(L.get("quizQuestions") or []) == L1_BASELINE["quiz_n"],
        "rext_ok": len(rext) >= L1_BASELINE["review_ext_n"]
        and "テンプレート" in rext_titles
        and "誤り" in rext_titles,
        "hw_ok": len(L.get("homeworkSections") or []) >= 9
        and not [t for t in HW_TAGS if t not in hw_titles],
        "sb_ok": not [k for k in SB_KEYS if k not in {b.get("key") for b in L.get("summaryBlocks") or []}],
        "grammar_zh_ok": all((g.get("explanationZh") or "").strip() for g in L.get("grammarNodes") or []),
        "vocab_conj_ok": vocab_conj >= max(3, min(verb_n, 5)),
        "warn_ok": flow_has_vocab_warn(lid),
        "tips_ok": TIPS.is_file(),
    }


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    rows = [audit_lesson(lessons[lid], lid) for lid in range(9, 25)]
    issues = []
    if not TIPS.is_file():
        issues.append("缺少 lessons-9-24-knowledge-tips.js")
    if not ABC.is_file():
        issues.append("缺少 lessons-9-24-dialogue-abc.js")
    for x in rows:
        lid = x["lid"]
        if not x["warn_ok"]:
            issues.append(f"L{lid} VOCAB_WARN 未配置")
        if x["dlg_abc"] != x["dlg_n"]:
            issues.append(f"L{lid} ABC {x['dlg_abc']}/{x['dlg_n']}")
        if not x["dlg_ch_ok"]:
            issues.append(f"L{lid} 会話 chinese 未填满")
        if not x["quiz_ok"]:
            issues.append(f"L{lid} quiz {x['quiz_n']}≠12")
        if not x["rext_ok"]:
            issues.append(f"L{lid} reviewExtension 未齐")
        if not x["hw_ok"]:
            issues.append(f"L{lid} 作業未齐")
        if not x["grammar_zh_ok"]:
            issues.append(f"L{lid} 文法 explanationZh 缺")
    if issues:
        print("[FAIL] strict:", *issues, sep="\n  ")
        return 1
    print("[OK] lessons 9–24 strict pass (16 lessons)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
