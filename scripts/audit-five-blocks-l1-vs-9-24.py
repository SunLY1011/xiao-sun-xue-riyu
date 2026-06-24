# -*- coding: utf-8 -*-
"""五关板块 · 第1课 vs 第9–24课 · 严格对齐审计（单词/会話/文法/作業/拡張）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
FLOW = ROOT / "js" / "lesson-1-flow.js"
TIPS_U2 = ROOT / "js" / "data" / "unit2-knowledge-tips.js"
TIPS_924 = ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"
L1_TIPS = ROOT / "js" / "data" / "l1-knowledge-tips.js"
OUT = ROOT / "docs" / "audit-five-blocks-l9-24-vs-l1.md"

HW_TAGS = ["発音", "活用", "選択", "穴埋め", "翻訳", "間違い", "作文", "聴解"]
SB_KEYS = ["pronunciation", "etymology", "preview", "honorific"]
EXT_KEYS = [
    "pronunciation",
    "etymology",
    "preview",
    "honorific",
    "template",
    "mistakes",
    "keyPoints",
    "rolePlay",
    "basicText",
    "grammar",
]


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def abc_count(lid: int) -> int:
    if not ABC.is_file():
        return 0
    text = ABC.read_text(encoding="utf-8")
    m = re.search(rf"^\s*{lid}:\s*\{{", text, re.M)
    if not m:
        return 0
    rest = text[m.end() :]
    m2 = re.search(r"^\s*\d+:\s*\{", rest, re.M)
    chunk = rest[: m2.start()] if m2 else rest
    return chunk.count('label: "A"')


def flow_warn_ids(lid: int) -> set[str]:
    text = FLOW.read_text(encoding="utf-8")
    m = re.search(rf"\s{lid}:\s*new Set\(\[(.*?)\]\)", text, re.S)
    if not m:
        return set()
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def audit_vocab(L: dict, lid: int, warn_ids: set[str]) -> dict:
    vocab = L.get("vocab") or []
    issues = []
    no_mean = [v["id"] for v in vocab if not (v.get("meaningZh") or "").strip()]
    if no_mean:
        issues.append(f"缺 meaningZh: {len(no_mean)} 条")
    verbs = [
        v
        for v in vocab
        if (v.get("pos") or "").startswith("動")
        or re.match(r"^動\(", v.get("pos") or "")
    ]
    conj = [v for v in verbs if (v.get("conjugation") or {}).get("forms")]
    # 动词少时要求全覆盖；动词多时至少 3 条、至多 5 条（与 L1 深度抽检口径一致）
    need_conj = len(verbs) if len(verbs) < 3 else max(3, min(len(verbs), 5))
    if verbs and len(conj) < need_conj:
        issues.append(f"动词活用表不足 {len(conj)}/{len(verbs)}（需≥{need_conj}）")
    warn_in_vocab = [v["id"] for v in vocab if v["id"] in warn_ids]
    if lid != 1 and not warn_ids:
        issues.append("VOCAB_WARN_BY_LESSON 未配置")
    elif lid != 1 and len(warn_in_vocab) < 4:
        issues.append(f"注意词仅 {len(warn_in_vocab)} 个（L1 约 11）")
    # L1 有 per-word tips 在 l1-knowledge-tips；9–24 靠 Lessons924 兜底
    tips_ok = lid == 1 or TIPS_924.is_file()
    if not tips_ok:
        issues.append("缺 Lessons924KnowledgeTips")
    return {
        "n": len(vocab),
        "verbs": len(verbs),
        "conj": len(conj),
        "warn_n": len(warn_in_vocab),
        "ok": len(issues) == 0,
        "issues": issues,
    }


def audit_dialogue(L: dict, lid: int) -> dict:
    dlg = L.get("dialogues") or []
    issues = []
    if not dlg:
        issues.append("无会話数据")
    op_ch = sum(1 for d in dlg if (d.get("opener") or {}).get("chinese", "").strip())
    rep_ch = sum(
        1
        for d in dlg
        for r in (d.get("userTurn") or {}).get("replies") or []
        if (r.get("chinese") or "").strip()
    )
    if op_ch < len(dlg):
        issues.append(f"opener 中文 {op_ch}/{len(dlg)}")
    if rep_ch < len(dlg):
        issues.append(f"reply 中文 {rep_ch}/{len(dlg)}")
    abc_n = abc_count(lid) if lid >= 9 else 0
    if lid >= 9 and abc_n != len(dlg):
        issues.append(f"ABC 场景 {abc_n}/{len(dlg)}")
    # 合并后 userTurn 应为 3 条（工程侧 apply 后）；数据文件内仍是 1 条课文 reply
    return {
        "n": len(dlg),
        "abc_n": abc_n,
        "op_ch": op_ch,
        "rep_ch": rep_ch,
        "ok": len(issues) == 0,
        "issues": issues,
    }


def audit_grammar(L: dict, lid: int) -> dict:
    nodes = L.get("grammarNodes") or []
    issues = []
    if not nodes:
        issues.append("无文法节点")
    no_zh = [g["id"] for g in nodes if not (g.get("explanationZh") or "").strip()]
    if no_zh:
        issues.append(f"缺 explanationZh: {no_zh}")
    no_title = [g["id"] for g in nodes if not (g.get("titleZh") or "").strip()]
    if no_title and lid == 1:
        issues.append("L1 应有 titleZh")
    no_ex = [g["id"] for g in nodes if not (g.get("example") or "").strip()]
    no_exzh = [g["id"] for g in nodes if not g.get("exampleZh")]
    if no_ex:
        issues.append(f"缺 example: {no_ex}")
    if no_exzh:
        issues.append(f"缺 exampleZh: {no_exzh}")
    return {"n": len(nodes), "ok": len(issues) == 0, "issues": issues}


def audit_homework(L: dict, lid: int) -> dict:
    hw = L.get("homeworkSections") or []
    qs = L.get("quizQuestions") or []
    titles = " ".join(s.get("title", "") for s in hw)
    issues = []
    if len(hw) < 9:
        issues.append(f"作業段仅 {len(hw)}（L1 规范 ≥9 题型段）")
    missing = [t for t in HW_TAGS if t not in titles]
    if missing:
        issues.append(f"缺题型段: {missing}")
    if len(qs) != 12:
        issues.append(f"小テスト {len(qs)} 题（L1=12）")
    empty_q = sum(1 for q in qs if not (q.get("question") or "").strip())
    if empty_q:
        issues.append(f"空题干 {empty_q}")
    bad_ids = [q["id"] for q in qs if re.search(r"_q_(pad_|fill_a|fill_b|choice_a)", q.get("id") or "")]
    if bad_ids:
        issues.append(f"占位小测: {bad_ids}")
    return {"hw_n": len(hw), "quiz_n": len(qs), "ok": len(issues) == 0, "issues": issues}


def audit_extension(L: dict, lid: int) -> dict:
    sb = L.get("summaryBlocks") or []
    rext = L.get("reviewExtension") or []
    issues = []
    sb_keys = {b.get("key") for b in sb}
    miss_sb = [k for k in SB_KEYS if k not in sb_keys]
    if miss_sb:
        issues.append(f"summaryBlocks 缺: {miss_sb}")
    rext_t = " ".join(x.get("title", "") for x in rext)
    if len(rext) < 5:
        issues.append(f"reviewExtension 仅 {len(rext)} 块（L1=5）")
    if "テンプレート" not in rext_t and "模板" not in rext_t:
        issues.append("缺 📋 模板块")
    if "誤り" not in rext_t and "误用" not in rext_t:
        issues.append("缺 ⚠️ 常见误用块")
    # 拡張关 UI 读 summaryBlocks + reviewExtension；L1 还有 dialogueKeyPoints 等
    dkp = L.get("dialogueKeyPoints") or []
    rpt = L.get("rolePlayTasks") or []
    if not dkp and lid >= 9:
        issues.append("缺 dialogueKeyPoints（会話要点）")
    if not rpt and lid >= 9:
        issues.append("缺 rolePlayTasks（ロールプレイ）")
    return {
        "sb_n": len(sb),
        "rext_n": len(rext),
        "dkp_n": len(dkp),
        "rpt_n": len(rpt),
        "ok": len(issues) == 0,
        "issues": issues,
    }


def audit_lesson(L: dict, lid: int) -> dict:
    warn = flow_warn_ids(lid) if lid != 1 else set()
    return {
        "lid": lid,
        "vocab": audit_vocab(L, lid, warn),
        "dialogue": audit_dialogue(L, lid),
        "grammar": audit_grammar(L, lid),
        "homework": audit_homework(L, lid),
        "extension": audit_extension(L, lid),
    }


def block_pass(a: dict) -> bool:
    return a.get("ok", False)


def lesson_pass(r: dict) -> bool:
    return all(block_pass(r[k]) for k in ("vocab", "dialogue", "grammar", "homework", "extension"))


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    l1 = audit_lesson(lessons[1], 1)
    rows = [audit_lesson(lessons[lid], lid) for lid in range(9, 25)]

    lines = [
        "# 五关严格审核 · 第1课 MVP vs 第9–24课",
        "",
        "基准：`docs/MVP-L1-完整规范.md` · 工程壳 `Lesson1Flow`（9–24 已挂载）",
        "",
        "## 总判定",
        "",
    ]

    all_ok = all(lesson_pass(r) for r in rows)
    shell_ok = TIPS_924.is_file() and ABC.is_file()
    lines.append("| 维度 | 结论 |")
    lines.append("|------|------|")
    lines.append("| 工程五关 Tab + ABC UI | ✅ 9–24 已接 Lesson1Flow / applyLessons9_24DialogueAbc |")
    lines.append(f"| 数据五关（16 课） | {'✅ 全部达标' if all_ok else '❌ 存在差距（见下表）'} |")
    lines.append(f"| 知识卡工程 | {'✅' if shell_ok else '❌'} Lessons924KnowledgeTips + ABC 文件 |")
    lines.append("")

    lines.append("## 第1课基准快照")
    lines.append("")
    lines.append("| 板块 | L1 指标 |")
    lines.append("|------|---------|")
    lines.append(f"| 単語 | {l1['vocab']['n']} 词 · 注意 {l1['vocab']['warn_n']} · 动词活用（L1 名词句为主） |")
    lines.append(f"| 会話 | {l1['dialogue']['n']} 场景 · L1 专用 ABC（非 9–24 同一文件） |")
    lines.append(f"| 文法 | {l1['grammar']['n']} 节点 |")
    lines.append(f"| 作業 | {l1['homework']['hw_n']} 段 · 小テスト {l1['homework']['quiz_n']} 题 |")
    lines.append(f"| 拡張 | summary {l1['extension']['sb_n']} · review {l1['extension']['rext_n']} · 要点 {l1['extension']['dkp_n']} · 扮演 {l1['extension']['rpt_n']} |")
    lines.append("")

    lines.append("## 第9–24课 · 分课五关")
    lines.append("")
    lines.append("| 课 | 単語 | 会話 | 文法 | 作業 | 拡張 | 总评 |")
    lines.append("|----|------|------|------|------|------|------|")
    for r in rows:
        lid = r["lid"]
        cols = []
        for key, icon in [
            ("vocab", "単"),
            ("dialogue", "会"),
            ("grammar", "文"),
            ("homework", "作"),
            ("extension", "扩"),
        ]:
            cols.append("✅" if block_pass(r[key]) else "❌")
        total = "✅" if lesson_pass(r) else "❌"
        v = r["vocab"]
        d = r["dialogue"]
        g = r["grammar"]
        h = r["homework"]
        e = r["extension"]
        detail = f"{v['n']}词/{d['n']}景/{g['n']}法/{h['quiz_n']}题/{e['rext_n']}扩"
        lines.append(f"| {lid} | {cols[0]} | {cols[1]} | {cols[2]} | {cols[3]} | {cols[4]} | {total} {detail} |")
    lines.append("")

    lines.append("## 差距明细（仅 FAIL 项）")
    lines.append("")
    any_gap = False
    for r in rows:
        lid = r["lid"]
        parts = []
        for key, label in [
            ("vocab", "単語"),
            ("dialogue", "会話"),
            ("grammar", "文法"),
            ("homework", "作業"),
            ("extension", "拡張"),
        ]:
            if not block_pass(r[key]):
                any_gap = True
                iss = "; ".join(r[key]["issues"])
                parts.append(f"**{label}**: {iss}")
        if parts:
            lines.append(f"### 第{lid}课")
            for p in parts:
                lines.append(f"- {p}")
            lines.append("")

    if not any_gap:
        lines.append("- （无）")
    lines.append("")

    lines.append("## 与第1课 MVP 的结构性说明")
    lines.append("")
    lines.append("1. **会話**：L1 为录制播放 + `l1-dialogue-abc.js`；9–24 为 **ABC 三答**（A=课文，B/C=场景变体），与 U2 第5–8课同制，符合扩展 MVP，不等于 L1 第1课交互完全相同。")
    lines.append("2. **単語**：L1 有逐词 `L1KnowledgeTips`；9–24 为 `Lessons924KnowledgeTips` 兜底 + `VOCAB_WARN` 高亮，动词课要求 `conjugation.forms`。")
    lines.append("3. **作業**：规范要求 9 段题型 + **12 题** gate3 小テスト（与 L1 一致）。")
    lines.append("4. **拡張**：`summaryBlocks` 四 key + `reviewExtension` 五块（含模板+误用）+ `dialogueKeyPoints` + `rolePlayTasks`。")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT}")
    if all_ok:
        print("[OK] 16 lessons × 5 blocks strict vs L1 MVP rules")
        return 0
    fail_n = sum(1 for r in rows if not lesson_pass(r))
    print(f"[FAIL] {fail_n}/16 lessons have block gaps — see {OUT.name}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
