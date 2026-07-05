# -*- coding: utf-8 -*-
"""Check tts-cache coverage for lesson-vocab-biaori.js"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "tts-cache"
BIAORI = ROOT / "js" / "data" / "lesson-vocab-biaori.js"


def tts_key(jp: str) -> str:
    s = (jp or "").strip()
    h = 0
    for ch in s:
        h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
    return format(h, "x")


def main() -> int:
    text = BIAORI.read_text(encoding="utf-8")
    fields = []
    for pat, name in [
        (r'jp:\s*"([^"]+)"', "jp"),
        (r'kana:\s*"([^"]+)"', "kana"),
        (r'example:\s*"([^"]+)"', "example"),
    ]:
        for m in re.finditer(pat, text):
            v = m.group(1).strip()
            if v and name != "kana" or (name == "kana" and v and v != m.group(1)):
                fields.append((name, v))
    missing = []
    seen = set()
    for name, v in fields:
        if name == "kana" and not v:
            continue
        k = tts_key(v)
        if k in seen:
            continue
        seen.add(k)
        if not (CACHE / f"{k}.mp3").exists():
            missing.append((name, v, k))
    print(f"biaori unique lines: {len(seen)}")
    print(f"missing mp3: {len(missing)}")
    for name, v, k in missing[:40]:
        print(f"  [{name}] {k}.mp3 <- {v[:50]}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
