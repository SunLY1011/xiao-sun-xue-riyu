#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第2–24课 · 写入 grammarNodes[].links（标日跨课关联 · 批次 B）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

sys.path.insert(0, str(ROOT / "scripts"))
from grammar_links_biaori import invalidate_reference_cache, links_for_node  # noqa: E402


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    lessons = json.loads(m.group(2))
    return text, m, lessons


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    invalidate_reference_cache()
    text, m, lessons = load_lessons()
    n_nodes = 0
    n_links = 0
    for L in lessons:
        lid = L.get("lessonId")
        if not lid or lid < 2:
            continue
        nodes = L.get("grammarNodes") or []
        ids = [g.get("id") for g in nodes if g.get("id")]
        for i, g in enumerate(nodes):
            nid = g.get("id")
            if not nid:
                continue
            new_links = links_for_node(lid, nid, i, ids)
            if g.get("links") != new_links:
                g["links"] = new_links
                n_nodes += 1
                n_links += len(new_links)
    save_lessons(text, m, lessons)
    print(f"[OK] patch-grammar-links-biaori: {n_nodes} nodes, {n_links} link items (L2–24)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
