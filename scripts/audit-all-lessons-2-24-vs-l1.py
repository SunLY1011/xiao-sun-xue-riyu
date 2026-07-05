#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""全域五关 · 第2–24课 vs 第1课 MVP（结构 + 深度抽检）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC_924 = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
ABC_U2 = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"
ABC_U1 = ROOT / "js" / "data" / "unit1-dialogue-abc-l234.js"
FLOW = ROOT / "js" / "lesson-1-flow.js"
TIPS_L1 = ROOT / "js" / "data" / "l1-knowledge-tips.js"
TIPS_U2 = ROOT / "js" / "data" / "unit2-knowledge-tips.js"
TIPS_924 = ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"
OUT = ROOT / "docs" / "audit-all-lessons-2-24-vs-l1-mvp.md"

UNIT_LESSONS = {
    1: [1, 2, 3, 4],
    2: [5, 6, 7, 8],
    3: [9, 10, 11, 12],
    4: [13, 14, 15, 16],
    5: [17, 18, 19, 20],
    6: [21, 22, 23, 24],
}
LESSON_TO_UNIT = {lid: u for u, ids in UNIT_LESSONS.items() for lid in ids}

HW_TAGS = ["発音", "活用", "選択", "穴埋め", "翻訳", "間違い", "作文", "聴解"]
SB_KEYS = ["pronunciation", "etymology", "preview", "honorific"]
DEPTH_BAD_ZH = [
    r"见本课基本课文",
    r"见本课",
    r"本课文法用",
    r"第\d+课：本课",
]
DEPTH_BAD_GRAMMAR = [r"^见", r"^本课", r"^（.*）$"]


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def abc_count(lid: int) -> int:
    if lid >= 9 and ABC_924.is_file():
        text = ABC_924.read_text(encoding="utf-8")
        m = re.search(rf"^\s*{lid}:\s*\{{", text, re.M)
        if not m:
            return 0
        rest = text[m.end() :]
        m2 = re.search(r"^\s*\d+:\s*\{", rest, re.M)
        chunk = rest[: m2.start()] if m2 else rest
        return chunk.count('label: "A"')
    if 5 <= lid <= 8 and ABC_U2.is_file():
        text = ABC_U2.read_text(encoding="utf-8")
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
        return rest[:i].count('label: "A"')
    if 2 <= lid <= 4 and ABC_U1.is_file():
        text = ABC_U1.read_text(encoding="utf-8")
        m = re.search(rf"L{lid}_", text)
        if not m:
            return 0
        # count dialogue ids in unit1 file for lesson
        return len(re.findall(rf"l{lid}_dlg_", text))
    return 0


def flow_warn_ids(lid: int) -> set[str]:
    text = FLOW.read_text(encoding="utf-8")
    m = re.search(rf"\s{lid}:\s*new Set\(\[(.*?)\]\)", text, re.S)
    if not m:
        return set()
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def tips_density(lid: int) -> int:
    if lid == 1 and TIPS_L1.is_file():
        return TIPS_L1.read_text(encoding="utf-8").count('"lines"')
    if 5 <= lid <= 8 and TIPS_U2.is_file():
        t = TIPS_U2.read_text(encoding="utf-8")
        return t.count(f"l{lid}_v_")
    if lid >= 9 and TIPS_924.is_file():
        return TIPS_924.read_text(encoding="utf-8").count(f"l{lid}_v_")
    return 0


def hw_line_stats(hw: list) -> tuple[int, int, int]:
    total = empty = thin = 0
    for s in hw:
        for ln in s.get("lines") or []:
            total += 1
            if isinstance(ln, str):
                t = ln.strip()
                if not t:
                    empty += 1
                elif len(t) < 4 and not t.startswith("→"):
                    thin += 1
            elif isinstance(ln, dict):
                if not (ln.get("jp") or ln.get("text") or "").strip() and not (
                    ln.get("zh") or ""
                ).strip():
                    empty += 1
    return len(hw), total, empty


def ext_stats(L: dict) -> dict:
    rext = L.get("reviewExtension") or []
    sb = L.get("summaryBlocks") or []
    dkp = L.get("dialogueKeyPoints") or []
    rpt = L.get("rolePlayTasks") or []
    rext_t = " ".join(x.get("title", "") for x in rext)
    lines_n = sum(len(b.get("lines") or []) for b in rext)
    empty = 0
    for b in rext:
        for ln in b.get("lines") or []:
            if isinstance(ln, str) and not ln.strip():
                empty += 1
    return {
        "rext_n": len(rext),
        "rext_lines": lines_n,
        "rext_empty": empty,
        "has_template": "テンプレート" in rext_t or "模板" in rext_t,
        "has_mistakes": "誤り" in rext_t or "误用" in rext_t,
        "sb_keys": {b.get("key") for b in sb},
        "dkp_n": len(dkp),
        "rpt_n": len(rpt),
    }


def _zh_text(v) -> str:
    if v is None:
        return ""
    if isinstance(v, list):
        return " ".join(str(x) for x in v)
    return str(v)


def depth_grammar_issues(nodes: list) -> list[str]:
    out = []
    for g in nodes:
        ex = _zh_text(g.get("example")).strip()
        exzh = _zh_text(g.get("exampleZh")).strip()
        if not exzh:
            out.append(f"{g.get('id')}:缺exampleZh")
        elif any(re.search(p, exzh) for p in DEPTH_BAD_ZH):
            out.append(f"{g.get('id')}:exampleZh兜底/占位")
        if not ex:
            out.append(f"{g.get('id')}:缺example")
    return out


def audit_lesson(L: dict, lid: int, l1: dict) -> dict:
    warn = flow_warn_ids(lid) if lid != 1 else set()
    vocab = L.get("vocab") or []
    dlg = L.get("dialogues") or []
    nodes = L.get("grammarNodes") or []
    hw = L.get("homeworkSections") or []
    qs = L.get("quizQuestions") or []
    ext = ext_stats(L)
    hw_secs, hw_lines, hw_empty = hw_line_stats(hw)
    titles = " ".join(s.get("title", "") for s in hw)

    issues: dict[str, list[str]] = {
        "vocab": [],
        "dialogue": [],
        "grammar": [],
        "homework": [],
        "extension": [],
        "depth": [],
    }

    # --- vocab ---
    if any(not (v.get("meaningZh") or "").strip() for v in vocab):
        issues["vocab"].append("缺 meaningZh")
    verbs = [
        v
        for v in vocab
        if (v.get("pos") or "").startswith("動")
        or re.match(r"^動\(", v.get("pos") or "")
    ]
    conj = [v for v in verbs if (v.get("conjugation") or {}).get("forms")]
    need_conj = len(verbs) if len(verbs) < 3 else max(3, min(len(verbs), 5))
    if verbs and len(conj) < need_conj:
        issues["vocab"].append(f"动词活用 {len(conj)}/{len(verbs)}（需≥{need_conj}）")
    if lid >= 5 and not warn:
        issues["vocab"].append("VOCAB_WARN 未配置")
    elif lid >= 5 and len([v for v in vocab if v["id"] in warn]) < 4:
        issues["vocab"].append(f"注意词仅 {len([v for v in vocab if v['id'] in warn])} 个")
    tips_n = tips_density(lid)
    if lid == 1 and tips_n < 20:
        issues["vocab"].append("L1KnowledgeTips 偏少")
    if lid >= 5 and tips_n < 8:
        issues["depth"].append(f"逐词知识卡稀疏（约 {tips_n} 条 id）")

    # --- dialogue ---
    if not dlg:
        issues["dialogue"].append("无会話")
    op_ch = sum(1 for d in dlg if (d.get("opener") or {}).get("chinese", "").strip())
    if op_ch < len(dlg):
        issues["dialogue"].append(f"opener中文 {op_ch}/{len(dlg)}")
    if lid >= 2:
        abc_n = abc_count(lid)
        if abc_n != len(dlg):
            issues["dialogue"].append(f"ABC {abc_n}/{len(dlg)}")
    if lid == 1:
        issues["dialogue"].append("（基准）L1 录制流+unit1 ABC，不与 2–24 同文件")

    # --- grammar ---
    if not nodes:
        issues["grammar"].append("无文法节点")
    issues["grammar"].extend(depth_grammar_issues(nodes)[:3])
    if len(depth_grammar_issues(nodes)) > 3:
        issues["grammar"].append(f"…另有 {len(depth_grammar_issues(nodes)) - 3} 条例句问题")

    # --- homework ---
    l1_hw_secs = len(l1.get("homeworkSections") or [])
    l1_quiz = len(l1.get("quizQuestions") or [])
    if hw_secs < 9:
        issues["homework"].append(f"作業段 {hw_secs}/9")
    missing_tags = [t for t in HW_TAGS if t not in titles]
    if missing_tags:
        issues["homework"].append(f"缺题型: {missing_tags}")
    if hw_empty:
        issues["homework"].append(f"空行 {hw_empty}")
    if len(qs) != l1_quiz:
        issues["homework"].append(f"小テスト {len(qs)}/{l1_quiz}")
    bad_q = [q["id"] for q in qs if re.search(r"_q_(pad_|fill_a|fill_b)", q.get("id") or "")]
    if bad_q:
        issues["homework"].append(f"占位题 {bad_q[:3]}")
    if hw_lines < 30 and lid >= 9:
        issues["depth"].append(f"作業总行偏少 {hw_lines}（L1≈52）")

    # --- extension ---
    miss_sb = [k for k in SB_KEYS if k not in ext["sb_keys"]]
    if miss_sb:
        issues["extension"].append(f"summaryBlocks缺 {miss_sb}")
    if ext["rext_n"] < 5:
        issues["extension"].append(f"reviewExtension {ext['rext_n']}/5")
    if not ext["has_template"]:
        issues["extension"].append("缺模板块")
    if not ext["has_mistakes"]:
        issues["extension"].append("缺误用块")
    if lid >= 5 and ext["dkp_n"] == 0:
        issues["extension"].append("缺 dialogueKeyPoints")
    if lid >= 5 and ext["rpt_n"] == 0:
        issues["extension"].append("缺 rolePlayTasks")
    if ext["rext_empty"]:
        issues["extension"].append(f"reviewExtension空行 {ext['rext_empty']}")

    shell_ok = {k: len(issues[k]) == 0 for k in ("vocab", "dialogue", "grammar", "homework", "extension")}
    # L1 dialogue always has note — structural pass for 2-24 only
    if lid == 1:
        shell_ok["dialogue"] = True

    return {
        "lid": lid,
        "unit": LESSON_TO_UNIT.get(lid, 0),
        "metrics": {
            "vocab": len(vocab),
            "dlg": len(dlg),
            "gram": len(nodes),
            "hw_secs": hw_secs,
            "hw_lines": hw_lines,
            "quiz": len(qs),
            "rext": ext["rext_n"],
            "sb": len(ext["sb_keys"]),
            "dkp": ext["dkp_n"],
            "rpt": ext["rpt_n"],
        },
        "shell_ok": shell_ok,
        "issues": issues,
        "depth_n": len(issues["depth"]) + len(issues["grammar"]),
    }


def block_icon(ok: bool) -> str:
    return "✅" if ok else "❌"


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    l1 = lessons[1]
    rows = [audit_lesson(lessons[lid], lid, l1) for lid in range(2, 25)]

    struct_fail = [r for r in rows if not all(r["shell_ok"].values())]
    depth_warn = [r for r in rows if r["depth_n"] > 0]

    lines = [
        "# 全域五关审核 · 第2–24课 vs 第1课 MVP",
        "",
        f"生成：`python scripts/audit-all-lessons-2-24-vs-l1.py` · 基准 `docs/MVP-L1-完整规范.md`",
        "",
        "## 一、总判定",
        "",
        "| 维度 | 结论 |",
        "|------|------|",
        f"| **结构对齐**（五关字段齐全） | {23 - len(struct_fail)}/23 课达标 · {len(struct_fail)} 课有缺口 |",
        f"| **深度对齐**（例句/知识卡/作業密度） | {23 - len(depth_warn)} 课基本达标 · {len(depth_warn)} 课需内容精修 |",
        "| **会話交互** | L1=录制跟读；第2–24课=ABC 三答（U1L2–4 / U2L5–8 / L9–24 分文件），属**扩展 MVP** |",
        "",
        "## 二、L1 基准快照",
        "",
        f"| 板块 | 指标 |",
        f"|------|------|",
        f"| 単語 | {len(l1.get('vocab') or [])} 词 · L1KnowledgeTips |",
        f"| 会話 | {len(l1.get('dialogues') or [])} 场景 · 录制流 |",
        f"| 文法 | {len(l1.get('grammarNodes') or [])} 节点 · 例句+exampleZh |",
        f"| 作業 | {len(l1.get('homeworkSections') or [])} 段 · 小テスト {len(l1.get('quizQuestions') or [])} 题 |",
        f"| 拡張 | summaryBlocks×4 · reviewExtension×5 · 要点+扮演 |",
        "",
        "## 三、分单元 · 分课五关（结构）",
        "",
    ]

    for uid in range(1, 7):
        ids = [i for i in UNIT_LESSONS[uid] if i >= 2]
        if not ids:
            continue
        lines.append(f"### 第{uid}单元")
        lines.append("")
        lines.append("| 课 | 単語 | 会話 | 文法 | 作業 | 拡張 | 小计 |")
        lines.append("|----|------|------|------|------|------|------|")
        for r in rows:
            if r["lid"] not in ids:
                continue
            sk = r["shell_ok"]
            cols = [block_icon(sk[k]) for k in ("vocab", "dialogue", "grammar", "homework", "extension")]
            total = block_icon(all(sk.values()))
            m = r["metrics"]
            lines.append(
                f"| {r['lid']} | {cols[0]} | {cols[1]} | {cols[2]} | {cols[3]} | {cols[4]} | {total} |"
            )
        lines.append("")

    lines.append("## 四、结构未对齐明细（须修数据）")
    lines.append("")
    if not struct_fail:
        lines.append("- （无）")
    else:
        for r in struct_fail:
            lines.append(f"### 第{r['lid']}课 · 第{r['unit']}单元")
            for key, label in [
                ("vocab", "単語"),
                ("dialogue", "会話"),
                ("grammar", "文法"),
                ("homework", "作業"),
                ("extension", "拡張"),
            ]:
                if r["issues"][key]:
                    lines.append(f"- **{label}**：{'；'.join(r['issues'][key])}")
            lines.append("")

    lines.append("## 五、深度差距（结构已过、内容待精修）")
    lines.append("")
    for r in depth_warn:
        parts = r["issues"]["depth"] + [
            x for x in r["issues"]["grammar"] if "example" in x or "兜底" in x
        ]
        if parts:
            lines.append(f"- **L{r['lid']}**：{'；'.join(parts)}")

    lines.append("")
    lines.append("## 六、对齐建议（供 PM 拍板）")
    lines.append("")
    lines.append("见同目录讨论稿：`docs/全域五关-2-24对齐L1-建议.md`（由本脚本结论展开）。")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"结构 FAIL: {len(struct_fail)} 课 · 深度 WARN: {len(depth_warn)} 课")
    return 1 if struct_fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
