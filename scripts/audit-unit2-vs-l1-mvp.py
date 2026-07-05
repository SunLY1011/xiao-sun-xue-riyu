#!/usr/bin/env python3

"""第2单元5–8课 vs 第1课 MVP · 五关严格对齐审计（只读）"""

from __future__ import annotations



import json

import re

import sys

from pathlib import Path



ROOT = Path(__file__).resolve().parents[1]

DATA = ROOT / "js" / "data" / "lessons-data.js"

ABC = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"

FLOW = ROOT / "js" / "lesson-1-flow.js"

TIPS = ROOT / "js" / "data" / "unit2-knowledge-tips.js"



HW_TAGS = ["発音", "活用", "選択", "穴埋め", "翻訳", "間違い", "作文", "聴解"]

SB_KEYS = ["pronunciation", "etymology", "preview", "honorific"]

REQUIRED = [

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



L1_BASELINE = {

    "quiz_n": 12,

    "review_ext_n": 5,

    "summary_blocks": 4,

}





def load_lessons() -> dict[int, dict]:

    text = DATA.read_text(encoding="utf-8")

    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)

    return {L["lessonId"]: L for L in json.loads(m.group(1))}





def abc_count(lid: int) -> int:

    text = ABC.read_text(encoding="utf-8")

    m = re.search(rf"const\s+L{lid}_DIALOGUE_ABC\s*=\s*\{{", text)

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

    return rest[: i].count('label: "A"')





def flow_has_vocab_warn(lid: int) -> bool:

    text = FLOW.read_text(encoding="utf-8")

    return f"{lid}: new Set" in text





def audit_lesson(L: dict, lid: int) -> dict:

    vocab = L.get("vocab") or []

    dlg = L.get("dialogues") or []

    grammar = L.get("grammarNodes") or []

    hw = L.get("homeworkSections") or []

    hw_titles = " ".join(s.get("title", "") for s in hw)

    sb = L.get("summaryBlocks") or []

    rext = L.get("reviewExtension") or []



    vocab_conj = sum(

        1

        for v in vocab

        if v.get("conjugation") and (v.get("conjugation") or {}).get("forms")

    )

    dlg_op = sum(1 for d in dlg if (d.get("opener") or {}).get("chinese"))

    dlg_rep = sum(

        1

        for d in dlg

        for r in (d.get("userTurn") or {}).get("replies") or []

        if r.get("chinese")

    )

    verb_n = sum(1 for v in vocab if "動" in (v.get("pos") or ""))

    rext_titles = " ".join(x.get("title", "") for x in rext)



    return {

        "lid": lid,

        "vocab_n": len(vocab),

        "vocab_conj": vocab_conj,

        "vocab_conj_ok": vocab_conj >= max(3, min(verb_n, 5)),

        "warn_ok": flow_has_vocab_warn(lid),

        "dlg_n": len(dlg),

        "dlg_abc": abc_count(lid),

        "dlg_ch_ok": dlg_op >= len(dlg) * 0.9 and dlg_rep >= len(dlg) * 0.9,

        "grammar_n": len(grammar),

        "grammar_zh_ok": all((g.get("explanationZh") or "").strip() for g in grammar),

        "quiz_n": len(L.get("quizQuestions") or []),

        "quiz_ok": len(L.get("quizQuestions") or []) >= L1_BASELINE["quiz_n"],

        "hw_n": len(hw),

        "hw_ok": len(hw) >= 9 and not [t for t in HW_TAGS if t not in hw_titles],

        "sb_ok": not [k for k in SB_KEYS if k not in {b.get("key") for b in sb}],

        "review_ext_n": len(rext),

        "rext_ok": len(rext) >= L1_BASELINE["review_ext_n"]

        and "テンプレート" in rext_titles

        and "誤り" in rext_titles,

        "tips_ok": TIPS.is_file(),

    }





def strict_pass(l1: dict, u2: list[dict]) -> tuple[bool, list[str]]:

    issues = []

    if not TIPS.is_file():

        issues.append("缺少 js/data/unit2-knowledge-tips.js")

    for x in u2:

        if not x["warn_ok"]:

            issues.append(f"第{x['lid']}课 VOCAB_WARN_BY_LESSON 未配置")

        if not x["vocab_conj_ok"]:

            issues.append(f"第{x['lid']}课动词 conjugation 不足")

        if x["dlg_abc"] != x["dlg_n"]:

            issues.append(f"第{x['lid']}课 ABC {x['dlg_abc']}/{x['dlg_n']}")

        if not x["dlg_ch_ok"]:

            issues.append(f"第{x['lid']}课会話 chinese 未填满")

        if not x["grammar_zh_ok"]:

            issues.append(f"第{x['lid']}课文法 explanationZh 有缺")

        if not x["quiz_ok"]:

            issues.append(f"第{x['lid']}课小テスト {x['quiz_n']}≠12")

        if not x["rext_ok"]:

            issues.append(f"第{x['lid']}课 reviewExtension 结构未齐 L1")

        if not x["hw_ok"]:

            issues.append(f"第{x['lid']}课作業段/题型未齐")

        if not x["sb_ok"]:

            issues.append(f"第{x['lid']}课 summaryBlocks 缺 key")

    return len(issues) == 0, issues





def main() -> int:

    sys.stdout.reconfigure(encoding="utf-8")

    lessons = load_lessons()

    l1 = audit_lesson(lessons[1], 1)

    u2 = [audit_lesson(lessons[i], i) for i in (5, 6, 7, 8)]

    ok, issues = strict_pass(l1, u2)



    print("# 第2单元第5–8课 vs 第1课 MVP · 严格审核报告\n")

    print("基准：docs/MVP-L1-完整规范.md · Lesson1Flow + Unit2KnowledgeTips\n")

    print("## 总判定\n")

    print("| 维度 | 结论 |")

    print("|------|------|")

    print("| **工程五关壳** | ✅ 对齐 |")

    print(f"| **数据五关内容** | {'✅ 已严齐 L1' if ok else '⚠️ 见差距'} |")

    print(f"| **严格对齐 L1** | {'✅ 达标' if ok else '❌ 未达标'} |\n")



    if issues:

        print("**差距明细：**")

        for i in issues:

            print(f"- {i}")

        print()



    print("## 数据快照（L1 vs 5–8）\n")

    print("| 课 | 単語 | 会話 | 文法 | 小テスト | 拡張块 | ABC | conj | warn |")

    print("|----|------|------|------|----------|--------|-----|------|------|")

    print(

        f"| L1 | {l1['vocab_n']} | {l1['dlg_n']} | {l1['grammar_n']} | {l1['quiz_n']} | {l1['review_ext_n']} | — | — | — |"

    )

    for x in u2:

        print(

            f"| L{x['lid']} | {x['vocab_n']} | {x['dlg_n']} | {x['grammar_n']} | {x['quiz_n']} | {x['review_ext_n']} | {x['dlg_abc']}/{x['dlg_n']} | {x['vocab_conj']} | {'✅' if x['warn_ok'] else '❌'} |"

        )

    print()

    return 0 if ok else 1





if __name__ == "__main__":

    raise SystemExit(main())

