#!/usr/bin/env python3
"""将 scene-supplements-overrides.json 合并进 ABC JS"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OVERRIDES = ROOT / "scripts" / "scene-supplements-overrides.json"
FILES = [
    (range(1, 2), ROOT / "js/data/l1-dialogue-abc.js"),
    (range(2, 5), ROOT / "js/data/unit1-dialogue-abc-l234.js"),
    (range(5, 9), ROOT / "js/data/unit2-dialogue-abc-l5-8.js"),
    (range(9, 25), ROOT / "js/data/lessons-9-24-dialogue-abc.js"),
]


def lesson_for_did(did: str) -> int:
    m = re.match(r"l(\d+)_", did)
    return int(m.group(1)) if m else 0


def esc_js(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def patch_block(block: str, ov: dict) -> str:
    out = block
    if ov.get("abcGuideZh"):
        out = re.sub(
            r'abcGuideZh:\s*"(?:\\.|[^"\\])*"',
            f'abcGuideZh: "{esc_js(ov["abcGuideZh"])}"',
            out,
            count=1,
        )
    for lab, nkey, ckey in (
        ("A", "A_noteZh", None),
        ("B", "B_noteZh", "B_chinese"),
        ("C", "C_noteZh", "C_chinese"),
    ):
        if ov.get(nkey):
            pat = rf'(label:\s*"{lab}"[\s\S]*?noteZh:\s*")(?:\\.|[^"\\])*(")'
            repl = rf'\g<1>{esc_js(ov[nkey])}\g<2>'
            out = re.sub(pat, repl, out, count=1)
        if ckey and ov.get(ckey):
            pat = rf'(label:\s*"{lab}"[\s\S]*?chinese:\s*")(?:\\.|[^"\\])*(")'
            repl = rf'\g<1>{esc_js(ov[ckey])}\g<2>'
            out = re.sub(pat, repl, out, count=1)
    return out


def patch_file(path: Path, overrides: dict, lid_range: range) -> int:
    text = path.read_text(encoding="utf-8")
    n = 0
    for did, ov in overrides.items():
        if lesson_for_did(did) not in lid_range:
            continue
        pat = rf'"{re.escape(did)}":\s*\{{[\s\S]*?\n  \}},'
        m = re.search(pat, text)
        if not m:
            print(f"[WARN] {did} not in {path.name}")
            continue
        new_block = patch_block(m.group(0), ov)
        if new_block != m.group(0):
            text = text.replace(m.group(0), new_block, 1)
            n += 1
            print(f"[OK] {path.name} · {did}")
    path.write_text(text, encoding="utf-8")
    return n


def main() -> int:
    if not OVERRIDES.is_file():
        print("[SKIP] no overrides")
        return 0
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))
    total = sum(patch_file(p, overrides, r) for r, p in FILES)
    print(f"Applied {total} scene overrides")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
