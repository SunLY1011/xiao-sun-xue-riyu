#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""L2–24 单词黄卡 · L1 级精写 · 仅替换 knowledge-tips.js 内 VOCAB 块"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
sys.path.insert(0, str(ROOT / "scripts"))
from l1_depth_common import first_grammar_ref, vocab_lines_l1  # noqa: E402

TARGETS: list[tuple[range, Path, str]] = [
    (range(2, 5), ROOT / "js/data/unit1-knowledge-tips.js", "Unit1KnowledgeTips"),
    (range(5, 9), ROOT / "js/data/unit2-knowledge-tips.js", "Unit2KnowledgeTips"),
    (range(9, 25), ROOT / "js/data/lessons-9-24-knowledge-tips.js", "Lessons924KnowledgeTips"),
]


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_vocab_entry(vid: str, line_objs: list[dict], ref: str) -> str:
    link_gram = f'{{ label: "→ 文法", gate: 1, ref: {js_str(ref)} }}'
    parts = ["    lines: ["]
    for lo in line_objs:
        inner = ", ".join(f"{k}: {js_str(v)}" for k, v in lo.items())
        parts.append(f"      {{ {inner} }},")
    parts.append("    ],")
    parts.append(f"    links: [conv, {link_gram}],")
    return f"  {js_str(vid)}: {{\n" + "\n".join(parts) + "\n  },"


def build_vocab_block(lids: range, lessons: dict) -> str:
    entries: list[str] = []
    for lid in lids:
        L = lessons.get(lid)
        if not L:
            continue
        ref0 = first_grammar_ref(L)
        for v in L.get("vocab") or []:
            vid = v.get("id")
            if not vid:
                continue
            if v.get("from") not in (None, "text", ""):
                continue
            lines, ref = vocab_lines_l1(v, L, ref0)
            entries.append(emit_vocab_entry(vid, lines, ref))
    return "\n".join(entries)


def merge_vocab(path: Path, vocab_body: str) -> None:
    text = path.read_text(encoding="utf-8")
    new_block = f"  const VOCAB = {{\n{vocab_body}\n  }};"
    if "const VOCAB = {" not in text:
        raise SystemExit(f"VOCAB block missing: {path}")
    text = re.sub(r"  const VOCAB = \{[\s\S]*?\};", new_block, text, count=1)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    total = 0
    for lids, path, _name in TARGETS:
        body = build_vocab_block(lids, lessons)
        n = body.count("_v_")
        merge_vocab(path, body)
        total += n
        print(f"[OK] {path.name} L{lids.start}–{lids.stop - 1}: {n} vocab kcards (L1 depth)")
    print(f"[OK] total vocab kcards: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
