#!/usr/bin/env python3
"""为 unit1-knowledge-tips.js 生成 L2–4 会話场景黄卡 DIALOGUE_BY_LESSON。"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT_SNIPPET = ROOT / "docs" / "_unit1-dialogue-kcards-snippet.js"


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def tip_for_scene(d: dict, idx: int) -> dict:
    op = d.get("opener") or {}
    ut = d.get("userTurn") or {}
    replies = ut.get("replies") or [{}]
    r0 = replies[0]
    lines = []
    ojp = (op.get("japanese") or "").strip()
    ozh = (op.get("chinese") or "").strip()
    rjp = (r0.get("japanese") or "").strip()
    rzh = (r0.get("chinese") or "").strip()
    if ojp:
        lines.append({"ja": ojp, "zh": ozh or "发起句：对照课文朗读。"})
    if rjp:
        lines.append({"zh": f"应答（{ut.get('speaker','')}）：{rzh or '见 ABC 之 A 轨。'}"})
    title = (d.get("title") or "").split("（")[0].strip()
    if title:
        lines.insert(0, {"zh": f"场景「{title}」· 第 {idx + 1} 句"})
    g_ref = f"l{d['id'].split('_')[0].replace('l','')}_g1" if False else None
    links = [{"label": "→ 会話", "gate": 2}]
    if "l2_" in d.get("id", ""):
        links.append({"label": "→ 文法", "gate": 1, "ref": "l2_g1"})
    elif "l3_" in d.get("id", ""):
        links.append({"label": "→ 文法", "gate": 1, "ref": "l3_g1"})
    elif "l4_" in d.get("id", ""):
        links.append({"label": "→ 文法", "gate": 1, "ref": "l4_g1"})
    return {"lines": lines, "links": links}


def main() -> None:
    lessons = load_lessons()
    blocks = []
    for lid in (2, 3, 4):
        ds = lessons[lid].get("dialogues") or []
        tips = [tip_for_scene(d, i) for i, d in enumerate(ds)]
        blocks.append(f"  {lid}: {json.dumps(tips, ensure_ascii=False, indent=4)}")
    snippet = "const DIALOGUE_BY_LESSON = {\n" + ",\n".join(blocks) + "\n};\n"
    OUT_SNIPPET.write_text(snippet, encoding="utf-8")
    print(f"[OK] {len(blocks)} lessons -> {OUT_SNIPPET}")


if __name__ == "__main__":
    main()
