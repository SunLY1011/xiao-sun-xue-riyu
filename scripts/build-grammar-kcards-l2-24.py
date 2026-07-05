#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""L2–24 文法黄卡 · 从 grammarNodes 生成 GRAMMAR 块并合并进 knowledge-tips.js"""
from __future__ import annotations

import json
import re
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
sys.path.insert(0, str(ROOT / "scripts"))
from l1_depth_common import grammar_lines_l1  # noqa: E402
TIPS_FILES: list[tuple[range, Path]] = [
    (range(2, 5), ROOT / "js" / "data" / "unit1-knowledge-tips.js"),
    (range(5, 9), ROOT / "js" / "data" / "unit2-knowledge-tips.js"),
    (range(9, 25), ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"),
]


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def tip_for_node(node: dict, lid: int) -> dict:
    lines: list[dict] = list(grammar_lines_l1(node, lid))

    links: list[dict] = [
        {"label": "→ 会話", "gate": 2},
        {"label": "→ 単語", "gate": 0},
    ]
    for lk in node.get("links") or []:
        ref = lk.get("targetNodeId")
        if ref:
            links.append({"label": lk.get("label") or "→ 文法", "gate": 1, "ref": ref})
            continue
        label = (lk.get("label") or "").strip()
        if label.startswith("→ 本课"):
            m = re.search(r"l\d+_g\d+", label)
            if m:
                links.append({"label": label, "gate": 1, "ref": m.group(0)})
        elif label.startswith("⚠️"):
            lines.append({"zh": label.replace("⚠️", "").strip()})

    # cap lines
    lines = lines[:5]
    return {"lines": lines, "links": links[:6]}


def build_grammar_map(lessons: dict[int, dict], lids: range) -> dict[str, dict]:
    out: dict[str, dict] = {}
    for lid in lids:
        for node in lessons.get(lid, {}).get("grammarNodes") or []:
            nid = node.get("id")
            if not nid:
                continue
            out[nid] = tip_for_node(node, lid)
    return out


def js_grammar_block(gmap: dict[str, dict]) -> str:
    parts = []
    for nid in sorted(gmap.keys(), key=lambda x: (int(re.search(r"l(\d+)", x).group(1)), x)):
        parts.append(f"  {json.dumps(nid, ensure_ascii=False)}: {json.dumps(gmap[nid], ensure_ascii=False, indent=4)}")
    inner = ",\n".join(parts)
    return f"const GRAMMAR = {{\n{inner}\n}};\n"


def merge_into_tips(path: Path, gmap: dict[str, dict]) -> None:
    text = path.read_text(encoding="utf-8")
    block = js_grammar_block(gmap)

    if "const GRAMMAR = {" in text:
        text = re.sub(r"const GRAMMAR = \{[\s\S]*?\};\n\n", block + "\n", text, count=1)
    else:
        anchor = "  function grammar(node) {"
        if anchor not in text:
            raise SystemExit(f"grammar() anchor not found in {path}")
        text = text.replace(anchor, block + "\n  " + anchor.lstrip())

    new_grammar_fn = """  function grammar(node) {
    if (!node) return null;
    if (GRAMMAR[node.id]) return GRAMMAR[node.id];
    const zh = (node.explanationZh || node.titleZh || "").trim();
    if (!zh) return null;
    const lines = zh.split(/\\n+/)
      .slice(0, 4)
      .map((t) => ({ zh: t.trim() }))
      .filter((l) => l.zh);
    return lines.length ? { lines, links: [conv, vocab] } : null;
  }"""

    text = re.sub(
        r"  function grammar\(node\) \{[\s\S]*?\n  \}",
        new_grammar_fn,
        text,
        count=1,
    )
    path.write_text(text, encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    total = 0
    for lids, path in TIPS_FILES:
        gmap = build_grammar_map(lessons, lids)
        merge_into_tips(path, gmap)
        total += len(gmap)
        print(f"[OK] {path.name}: {len(gmap)} grammar kcards (L{lids.start}–{lids.stop - 1})")
    print(f"[OK] total grammar kcards: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
