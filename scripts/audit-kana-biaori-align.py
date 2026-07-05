# -*- coding: utf-8 -*-
"""书写清音 · 与标日初级上五十音表 / intro-content 对账。"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/书写板块-标日对齐审计.md"

# 与 build-kana-stroke-guide.py STD_STROKES 一致（文部科学省・标日教辅笔顺表）
STD_STROKES = {
    "あ": 3, "い": 2, "う": 2, "え": 2, "お": 3, "か": 3, "き": 4, "く": 1, "け": 3, "こ": 2,
    "さ": 3, "し": 1, "す": 2, "せ": 3, "そ": 1, "た": 4, "ち": 2, "つ": 1, "て": 1, "と": 2,
    "な": 4, "に": 3, "ぬ": 2, "ね": 2, "の": 1, "は": 3, "ひ": 1, "ふ": 4, "へ": 1, "ほ": 4,
    "ま": 3, "み": 2, "む": 3, "め": 2, "も": 3, "や": 3, "ゆ": 2, "よ": 2,
    "ら": 2, "り": 2, "る": 1, "れ": 2, "ろ": 1, "わ": 2, "を": 3, "ん": 1,
}

# 标日 / intro 特殊读音（与课文一致）
BIAORI_ROMAJI = {
    "し": "shi", "ち": "chi", "つ": "tsu", "ふ": "fu", "を": "o",
}


def load_intro_seion() -> list[dict]:
    text = (ROOT / "js/data/intro-content.js").read_text(encoding="utf-8")
    m = re.search(r"const INTRO_GOJUON_SEION = (\[[\s\S]*?\]);", text)
    if not m:
        return []
    raw = m.group(1)
    rows = []
    for row_m in re.finditer(
        r'\{\s*row:\s*"([^"]+)"\s*,\s*cells:\s*\[([\s\S]*?)\]\s*\}', raw
    ):
        row_name = row_m.group(1)
        cells_block = row_m.group(2)
        cells = []
        for c_m in re.finditer(
            r'\{\s*kana:\s*"([^"]+)"\s*,\s*romaji:\s*"([^"]*)"(?:\s*,\s*special:\s*true)?(?:\s*,\s*hint:\s*"([^"]*)")?\s*\}',
            cells_block,
        ):
            cells.append(
                {
                    "kana": c_m.group(1),
                    "romaji": c_m.group(2),
                    "hint": c_m.group(3) or "",
                }
            )
        rows.append({"row": row_name, "cells": cells})
    return rows


def load_guide() -> dict:
    text = (ROOT / "js/data/kana-stroke-guide.js").read_text(encoding="utf-8")
    return json.loads(text.split("=", 1)[1].rstrip(";\n"))


def geometry_issues(guide: dict) -> list[str]:
    """与 scripts/_audit-kana-geometry.py 规则一致。"""
    cx = 512
    issues: list[str] = []

    def xmean(s):
        return sum(p[0] for p in s) / len(s)

    def ymean(s):
        return sum(p[1] for p in s) / len(s)

    def span(s):
        xs = [p[0] for p in s]
        ys = [p[1] for p in s]
        return max(xs) - min(xs), max(ys) - min(ys)

    def is_horiz(s):
        w, h = span(s)
        return w > h * 1.3 and h < 220

    def is_vert(s):
        w, h = span(s)
        return h > w * 1.3 and w < 220

    yo = guide.get("よ", {}).get("strokes", [])
    if len(yo) >= 2:
        if not is_horiz(yo[0]) or xmean(yo[0]) > cx + 60:
            issues.append("よ: 第1笔应为左上短横")
        if not is_vert(yo[1]) and span(yo[1])[1] < span(yo[1])[0]:
            issues.append("よ: 第2笔应为竖弯主笔")

    ya = guide.get("や", {}).get("strokes", [])
    if len(ya) >= 3:
        if is_horiz(ya[0]) and ymean(ya[0]) > 400:
            issues.append("や: 笔序错误（下横不应为首笔）")
        if not is_vert(ya[0]) and xmean(ya[0]) > cx:
            issues.append("や: 第1笔应为左侧竖")

    mu = guide.get("む", {}).get("strokes", [])
    if len(mu) >= 3:
        if not is_horiz(mu[0]):
            issues.append("む: 第1笔应为上横")
        if xmean(mu[2]) < cx + 80:
            issues.append("む: 第3笔应在右上")

    return issues


def main() -> None:
    intro = load_intro_seion()
    guide = load_guide()
    intro_kana = []
    for row in intro:
        for c in row["cells"]:
            if c and c.get("kana"):
                intro_kana.append(c["kana"])

    lines = [
        "# 书写板块 · 标日对齐审计",
        "",
        "> 生成：`python scripts/audit-kana-biaori-align.py`",
        "> 笔顺真源：`scripts/build-kana-stroke-guide.py` + animCJK 清洗",
        "> 字表真源：`js/data/intro-content.js` · `INTRO_GOJUON_SEION`（与标日初级上五十音图一致）",
        "",
        "## 1. 字表与读音（本课课文）",
        "",
        "| 项 | 结果 |",
        "|----|------|",
    ]

    seion_keys = list(STD_STROKES.keys())
    set_intro = set(intro_kana)
    set_guide = set(guide.keys())
    set_std = set(seion_keys)

    lines.append(f"| 清音字数 | intro {len(intro_kana)} · guide {len(guide)} · 标准 {len(seion_keys)} |")
    lines.append(
        f"| intro ⊆ 标准 | {'OK' if set_intro == set_std else 'FAIL ' + str(set_intro ^ set_std)} |"
    )
    lines.append(
        f"| guide = 标准 | {'OK' if set_guide == set_std else 'FAIL ' + str(set_guide ^ set_std)} |"
    )

    lines.extend(["", "### 标日特殊读音（书写表 romaji 须一致）", "", "| 假名 | romaji | intro |", "|------|--------|-------|"])
    for k, exp in BIAORI_ROMAJI.items():
        cell = next((c for row in intro for c in row["cells"] if c and c.get("kana") == k), None)
        got = cell["romaji"] if cell else "—"
        ok = got == exp
        lines.append(f"| {k} | {exp} | {got} {'✓' if ok else '✗'} |")

    lines.extend(["", "## 2. 笔顺笔画数（教材笔顺表）", "", "| 假名 | 标准笔数 | 数据笔数 | 状态 |", "|------|----------|----------|------|"])
    fail = []
    for k in seion_keys:
        exp = STD_STROKES[k]
        got = len(guide[k]["strokes"]) if k in guide else 0
        ok = got == exp
        if not ok:
            fail.append(k)
        lines.append(f"| {k} | {exp} | {got} | {'✓' if ok else '✗'} |")

    geo = geometry_issues(guide)
    lines.extend(
        [
            "",
            f"**笔顺对账**：{len(seion_keys) - len(fail)}/{len(seion_keys)} 通过"
            + (f" · 待修：{', '.join(fail)}" if fail else " · 全部通过"),
            "",
            "## 3. 几何笔序抽检（标日教辅常见规则）",
            "",
            "运行：`python scripts/_audit-kana-geometry.py`",
            "",
        ]
    )
    if geo:
        lines.append("**状态**：FAIL")
        for g in geo:
            lines.append(f"- {g}")
    else:
        lines.append("**状态**：OK（よ 左上横 · や 左竖起笔 · む 上横+右上払 等）")
    lines.extend(
        [
            "",
            "## 4. 屏上规范（与标日教辅静态表一致，非标日 App 动画）",
            "",
            "- 默认 **一览分色**（红→绿→蓝→紫），数字 + 黑箭头起笔",
            "- **无** 描红底字叠影（仅分色笔顺路径）",
            "- **を**：字形を、读音表记 **o**（与 intro / 标日一致）",
            "- 进度键 = 平假名 kana；片假名仅显示切换",
            "",
            "## 5. 已知字形差异说明",
            "",
            "笔顺路径来自 animCJK 中线，经 2a/2b 副线清洗后与教材**笔数**一致；",
            "**よ**（横笔误在右）、**や**（animCJK 笔序颠倒）已手工校正；镜像副线优先保留左侧。",
            "个别字（如 **す**、**む** 折线）路径可能与印刷体略有差别，以**笔序与笔数**为准。",
            "顶栏标题用系统字体，格内为笔顺路径，属正常「字形来源不同」而非笔序错误。",
            "",
        ]
    )

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    print(f"[OK] {OUT}")
    if fail or geo:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
