# -*- coding: utf-8 -*-
"""平假名 / 片假名笔顺 · 分批对账（笔数 · 折点数 · 视口 · 几何规则）。

用法：
  python scripts/audit-kana-strokes-batch.py
  python scripts/audit-kana-strokes-batch.py --script hira
  python scripts/audit-kana-strokes-batch.py --script kata

输出：
  docs/kana-stroke-audit-hira.md
  docs/kana-stroke-audit-kata.md
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE_JS = ROOT / "js" / "data" / "kana-stroke-guide.js"
OUT_HIRA = ROOT / "docs" / "kana-stroke-audit-hira.md"
OUT_KATA = ROOT / "docs" / "kana-stroke-audit-kata.md"
VB = 1024
CX = VB / 2

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

# 每批 8 字（5 段 × 8 ≈ 40 + ん 等）
BATCHES: list[tuple[str, list[str]]] = [
    ("批1·あ〜く", ["あ", "い", "う", "え", "お", "か", "き", "く"]),
    ("批2·け〜た", ["け", "こ", "さ", "し", "す", "せ", "そ", "た"]),
    ("批3·ち〜ね", ["ち", "つ", "て", "と", "な", "に", "ぬ", "ね"]),
    ("批4·の〜み", ["の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み"]),
    ("批5·む〜り", ["む", "め", "も", "や", "ゆ", "よ", "ら", "り"]),
    ("批6·る〜ん", ["る", "れ", "ろ", "わ", "を", "ん"]),
]


def to_katakana(h: str) -> str:
    return "".join(chr(ord(c) + 0x60) if 0x3041 <= ord(c) <= 0x3096 else c for c in h)


def load_guide() -> dict:
    text = GUIDE_JS.read_text(encoding="utf-8")
    return json.loads(text.split("=", 1)[1].rstrip(";\n"))


def in_vb(p: list[float]) -> bool:
    return 0 <= p[0] <= VB and 0 <= p[1] <= VB


def xmean(s):
    return sum(p[0] for p in s) / len(s)


def ymean(s):
    return sum(p[1] for p in s) / len(s)


def span(s):
    xs = [p[0] for p in s]
    ys = [p[1] for p in s]
    return max(xs) - min(xs), max(ys) - min(ys)


def is_horiz(s, ratio=1.35):
    w, h = span(s)
    return w > h * ratio and h < 220


def is_vert(s, ratio=1.35):
    w, h = span(s)
    return h > w * ratio and w < 220


def geom_flags(char: str, strokes: list) -> list[str]:
    flags: list[str] = []
    if char == "よ" and len(strokes) >= 2:
        s0 = strokes[0]
        if not is_horiz(s0):
            flags.append("第1笔应沿灰底横条（横画）")
        ym = ymean(s0)
        if ym < 260 or ym > 400:
            flags.append("第1笔应贴合灰底横条区")
    if char == "や" and len(strokes) >= 3:
        if is_horiz(strokes[0]) and ymean(strokes[0]) > 480:
            flags.append("第1笔不应为下横")
        if not (is_vert(strokes[0]) or xmean(strokes[0]) < CX - 40):
            flags.append("第1笔应左侧竖")
    if char == "か" and len(strokes) >= 3:
        if not is_horiz(strokes[0]) or ymean(strokes[0]) > 480:
            flags.append("第1笔应上横")
        if not is_vert(strokes[1]):
            flags.append("第2笔应竖")
    if char == "さ" and len(strokes) >= 3:
        # 标日：第1笔左上→右下弧，非「左竖+横+撇」工字形
        if is_vert(strokes[0]) and not is_horiz(strokes[0]) and xmean(strokes[0]) < CX - 80:
            flags.append("疑为工字形误笔（应弧笔起笔）")
        if is_horiz(strokes[1]) and is_vert(strokes[0]) and abs(xmean(strokes[0]) - xmean(strokes[1])) < 60:
            flags.append("疑为工字形误笔")
    if char == "ヨ" and len(strokes) >= 4:
        if not is_horiz(strokes[0]):
            flags.append("第1笔应为上横")
        if not (is_vert(strokes[1]) or span(strokes[1])[1] > 400):
            flags.append("第2笔应为右侧长竖")
        if not is_horiz(strokes[2]):
            flags.append("第3笔应为中横")
        if not is_horiz(strokes[3]):
            flags.append("第4笔应为下横")
    pt_cap = 28 if ord(char) < 0x30A0 else 14
    for i, s in enumerate(strokes):
        if any(not in_vb(p) for p in s):
            flags.append(f"笔{i+1}越界")
        if len(s) > pt_cap:
            flags.append(f"笔{i+1}折点>{pt_cap}")
    return flags


def audit_char(guide: dict, char: str) -> dict:
    hira_key = char if ord(char) < 0x30A0 else to_katakana(char)
    exp = STD_STROKES.get(hira_key)
    entry = guide.get(char)
    if not entry:
        return {"char": char, "ok": False, "issues": ["无数据"]}
    strokes = entry.get("strokes", [])
    issues: list[str] = []
    if exp is not None and len(strokes) != exp:
        issues.append(f"笔数 {len(strokes)}≠{exp}")
    issues.extend(geom_flags(hira_key, strokes))
    max_pts = max((len(s) for s in strokes), default=0)
    return {
        "char": char,
        "ok": len(issues) == 0,
        "strokes": len(strokes),
        "exp": exp,
        "max_pts": max_pts,
        "issues": issues,
    }


def audit_script(guide: dict, script: str) -> tuple[list[dict], int]:
    rows: list[dict] = []
    fail = 0
    for _name, chars in BATCHES:
        for h in chars:
            ch = h if script == "hira" else to_katakana(h)
            if script == "hira" and ch not in guide:
                continue
            if script == "kata" and ch not in guide:
                rows.append({"char": ch, "ok": False, "issues": ["片假名缺失"], "batch": _name})
                fail += 1
                continue
            r = audit_char(guide, ch)
            r["batch"] = _name
            r["hira"] = h
            rows.append(r)
            if not r["ok"]:
                fail += 1
    return rows, fail


def render_md(script: str, rows: list[dict], fail: int) -> str:
    label = "平假名（ひらがな）" if script == "hira" else "片假名（カタカナ）"
    lines = [
        f"# 笔顺分批对账 · {label}",
        "",
        f"> 生成：`python scripts/audit-kana-strokes-batch.py --script {script}`",
        "",
        f"**汇总**：{len(rows) - fail}/{len(rows)} 通过 · 失败 {fail}",
        "",
    ]
    cur = None
    for r in rows:
        if r.get("batch") != cur:
            cur = r.get("batch")
            lines.append(f"## {cur}")
            lines.append("")
            lines.append("| 字 | 笔数 | 最多折点 | 结果 | 说明 |")
            lines.append("|----|------|----------|------|------|")
        ch = r["char"]
        issues = "; ".join(r.get("issues", [])) or "—"
        ok = "OK" if r.get("ok") else "**FAIL**"
        strokes = r.get("strokes", "—")
        exp = r.get("exp", "—")
        cnt = f"{strokes}/{exp}" if strokes != "—" else "—"
        lines.append(f"| {ch} | {cnt} | {r.get('max_pts', '—')} | {ok} | {issues} |")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", choices=("hira", "kata", "both"), default="both")
    args = ap.parse_args()
    guide = load_guide()
    scripts = ["hira", "kata"] if args.script == "both" else [args.script]
    exit_code = 0
    for script in scripts:
        rows, fail = audit_script(guide, script)
        out = OUT_HIRA if script == "hira" else OUT_KATA
        out.write_text(render_md(script, rows, fail), encoding="utf-8", newline="\n")
        print(f"[{'OK' if fail == 0 else 'FAIL'}] {script}: {len(rows)-fail}/{len(rows)} -> {out}")
        if fail:
            exit_code = 1
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
