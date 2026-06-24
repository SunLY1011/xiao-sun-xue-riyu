# -*- coding: utf-8 -*-
"""生成标日五十音书写 · 全量对账表（平+片 92 项）。

用法：python scripts/audit-kana-biaori-changelog.py
输出：docs/kana-stroke-标日全量对账表.md
"""
from __future__ import annotations

import importlib.util
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE_JS = ROOT / "js" / "data" / "kana-stroke-guide.js"
OUT = ROOT / "docs" / "kana-stroke-标日全量对账表.md"
BUILD = ROOT / "scripts" / "build-kana-stroke-guide.py"

SEION = [
    "あ", "い", "う", "え", "お",
    "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の",
    "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も",
    "や", "ゆ", "よ",
    "ら", "り", "る", "れ", "ろ",
    "わ", "を",
    "ん",
]

STD_STROKES = {
    "あ": 3, "い": 2, "う": 2, "え": 2, "お": 3, "か": 3, "き": 4, "く": 1, "け": 3, "こ": 2,
    "さ": 3, "し": 1, "す": 2, "せ": 3, "そ": 1, "た": 4, "ち": 2, "つ": 1, "て": 1, "と": 2,
    "な": 4, "に": 3, "ぬ": 2, "ね": 2, "の": 1, "は": 3, "ひ": 1, "ふ": 4, "へ": 1, "ほ": 4,
    "ま": 3, "み": 2, "む": 3, "め": 2, "も": 3, "や": 3, "ゆ": 2, "よ": 2,
    "ら": 2, "り": 2, "る": 1, "れ": 2, "ろ": 1, "わ": 2, "を": 3, "ん": 1,
}

# 手工校正说明（与 build-kana-stroke-guide.py 同步维护）
HIRA_MANUAL_NOTES: dict[str, str] = {
    "よ": "第1笔沿灰底横条（y≈330）；第2笔竖弯钩环线",
    "か": "笔顺改为上横→竖→右下短笔",
    "ふ": "撇笔与末笔标日校正（去 animCJK 误笔）",
    "や": "笔序改为左竖→右上→下横",
    "の": "仅保留环路主笔（去镜像副线）",
}

KATA_MANUAL_NOTES: dict[str, str] = {
    "ヨ": "四笔：上横+右竖+中横+下横（独立片假名，勿用平假名よ）",
    "オ": "竖笔去底部竖钩（灰底改笔顺宽描边）",
    "ホ": "竖笔去底部竖钩",
    "マ": "第1笔补全至左下对角（防 RDP 截断）",
    "フ": "去平假名ふ误植；改片假名单笔对角（无才字钩）",
}

# animCJK 清洗导致笔数变化（无手工表、仅流水线）
PIPELINE_COUNT_NOTES: dict[str, str] = {
    "あ": "镜像副线清洗 4→3 笔",
    "お": "镜像副线清洗 4→3 笔",
    "す": "副线合并 3→2 笔",
    "な": "副线合并 5→4 笔",
    "ぬ": "副线合并 4→2 笔",
    "ね": "副线合并 3→2 笔",
    "は": "副线合并 4→3 笔",
    "ほ": "副线合并 5→4 笔",
    "ま": "副线合并 4→3 笔",
    "み": "副线合并 3→2 笔",
    "む": "副线合并 4→3 笔",
    "め": "副线合并 3→2 笔",
    "よ": "副线合并+手工（见上）",
    "る": "副线合并 2→1 笔",
}


def to_katakana(h: str) -> str:
    return "".join(chr(ord(c) + 0x60) if 0x3041 <= ord(c) <= 0x3096 else c for c in h)


def load_build():
    spec = importlib.util.spec_from_file_location("build_kana", BUILD)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_guide() -> dict:
    text = GUIDE_JS.read_text(encoding="utf-8")
    return json.loads(text.split("=", 1)[1].rstrip(";\n"))


def naive_canonicalize(mod, pts: list, script: str) -> list:
    return mod.canonicalize_stroke([list(p) for p in pts], script=script)


def classify_hira(mod, hira: str, guide: dict) -> tuple[str, str]:
    """返回 (状态, 修改说明)。"""
    entry = guide.get(hira, {})
    strokes = entry.get("strokes", [])
    exp = STD_STROKES.get(hira)
    n = len(strokes)

    if hira in HIRA_MANUAL_NOTES:
        note = HIRA_MANUAL_NOTES[hira]
        if hira in PIPELINE_COUNT_NOTES and hira not in ("よ",):
            note = PIPELINE_COUNT_NOTES[hira] + "；" + note
        return "已手工校正", note

    svg = mod.SVG_DIR / f"{ord(hira)}.svg"
    raw_n = 0
    cleaned_n = n
    if svg.is_file():
        raw = mod.extract_medians(svg.read_text(encoding="utf-8"))
        raw_n = len(raw)
        cleaned = mod.clean_strokes(hira, raw, script="hira")
        cleaned_n = len(cleaned)

    if hira in PIPELINE_COUNT_NOTES:
        return "流水线校正", PIPELINE_COUNT_NOTES[hira]

    # 路径与 naive canonicalize 有显著差异
    if svg.is_file() and raw_n:
        raw = mod.extract_medians(svg.read_text(encoding="utf-8"))
        auto = mod.clean_strokes(hira, raw, script="hira")
        if auto and strokes and len(auto) == len(strokes):
            diff = sum(
                1
                for a, b in zip(auto, strokes)
                if len(a) != len(b) or any(math.hypot(x - y, u - v) > 25 for (x, y), (u, v) in zip(a, b))
            )
            if diff:
                return "流水线校正", "弧线化/RDP/发夹尾截断（路径微调）"

    if exp is not None and n == exp:
        return "未改", "animCJK 标日笔数对齐 · 弧线笔顺"
    return "流水线校正", f"笔数 {raw_n}→{n}（标日 {exp} 笔）"


def classify_kata(mod, hira: str, kata: str, guide: dict) -> tuple[str, str]:
    if kata in KATA_MANUAL_NOTES:
        return "已手工校正", KATA_MANUAL_NOTES[kata]

    entry = guide.get(kata, {})
    strokes = entry.get("strokes", [])
    n = len(strokes)

    svg = mod.SVG_DIR / f"{ord(kata)}.svg"
    raw_n = 0
    if svg.is_file():
        raw = mod.extract_medians(svg.read_text(encoding="utf-8"))
        raw_n = len(raw)

    if raw_n and raw_n != n:
        return "流水线校正", f"animCJK {raw_n}→{n} 笔（镜像副线清洗/弧线化）"

    if n:
        return "未改", "animCJK 片假名弧线笔顺 · 灰底=笔顺宽描边"

    return "缺失", "无 SVG 数据"


def main() -> None:
    mod = load_build()
    guide = load_guide()

    rows: list[dict] = []
    manual_h = 0
    manual_k = 0
    pipe_h = 0
    pipe_k = 0
    ok_h = 0
    ok_k = 0

    for i, hira in enumerate(SEION, 1):
        kata = to_katakana(hira)
        h_status, h_note = classify_hira(mod, hira, guide)
        k_status, k_note = classify_kata(mod, hira, kata, guide)

        if h_status == "已手工校正":
            manual_h += 1
        elif h_status == "流水线校正":
            pipe_h += 1
        elif h_status == "未改":
            ok_h += 1

        if k_status == "已手工校正":
            manual_k += 1
        elif k_status == "流水线校正":
            pipe_k += 1
        elif k_status == "未改":
            ok_k += 1

        rows.append(
            {
                "i": i,
                "hira": hira,
                "kata": kata,
                "h_n": len(guide.get(hira, {}).get("strokes", [])),
                "h_exp": STD_STROKES.get(hira),
                "k_n": len(guide.get(kata, {}).get("strokes", [])),
                "h_status": h_status,
                "h_note": h_note,
                "k_status": k_status,
                "k_note": k_note,
            }
        )

    lines = [
        "# 五十音书写 · 标日全量对账表",
        "",
        "> 生成：`python scripts/audit-kana-biaori-changelog.py`",
        "> 数据：`js/data/kana-stroke-guide.js` · 构建：`scripts/build-kana-stroke-guide.py`",
        "> 规范：标日初级上五十音笔顺 · animCJK 中线 + 手工校正",
        "",
        "## 汇总",
        "",
        "| 项 | 平假名 | 片假名 | 合计 |",
        "|----|--------|--------|------|",
        f"| 总字数 | 46 | 46 | **92** |",
        f"| 未改（animCJK 对齐） | {ok_h} | {ok_k} | {ok_h + ok_k} |",
        f"| 流水线校正 | {pipe_h} | {pipe_k} | {pipe_h + pipe_k} |",
        f"| 已手工校正 | {manual_h} | {manual_k} | {manual_h + manual_k} |",
        "",
        "### 片假名全局 UI",
        "",
        "- **灰底**：片假名统一用笔顺宽描边生成（与彩色笔顺同坐标），避免 animCJK 轮廓里的汉字式竖钩",
        "- **平假名灰底**：仍用 animCJK 字形轮廓 path",
        "",
        "### 手工校正清单（须人工复核字形）",
        "",
        "| 假名 | 修改要点 |",
        "|------|----------|",
    ]
    for k, v in HIRA_MANUAL_NOTES.items():
        lines.append(f"| {k}（平） | {v} |")
    for k, v in KATA_MANUAL_NOTES.items():
        lines.append(f"| {k}（片） | {v} |")

    lines.extend(
        [
            "",
            "## 逐字对账（46 行 × 平+片）",
            "",
            "| # | 平 | 片 | 平·笔数 | 片·笔数 | 平·状态 | 平·修改说明 | 片·状态 | 片·修改说明 |",
            "|---|----|----|---------|---------|---------|-------------|---------|-------------|",
        ]
    )

    for r in rows:
        h_cnt = f"{r['h_n']}/{r['h_exp']}"
        k_cnt = str(r["k_n"])
        lines.append(
            f"| {r['i']} | {r['hira']} | {r['kata']} | {h_cnt} | {k_cnt} | "
            f"{r['h_status']} | {r['h_note']} | {r['k_status']} | {r['k_note']} |"
        )

    lines.extend(
        [
            "",
            "## 验收",
            "",
            "```bat",
            "python scripts/build-kana-stroke-guide.py",
            "python scripts/audit-kana-strokes-batch.py",
            "python scripts/_audit-kana-geometry.py",
            "python scripts/audit-kana-biaori-changelog.py",
            "```",
            "",
            "本地：`http://localhost:8765/index.html?v=CACHE_VER` → 书写 → 平/片切换逐字抽检。",
            "",
        ]
    )

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    print(f"[OK] {OUT} ({len(rows)} rows · 手工 平{manual_h}+片{manual_k})")


if __name__ == "__main__":
    main()
