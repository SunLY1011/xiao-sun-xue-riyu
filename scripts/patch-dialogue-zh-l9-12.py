#!/usr/bin/env python3
"""将 curated_dialogue_zh_l9_12 写入 dialogue-zh-l9-24.js"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZH_JS = ROOT / "js" / "data" / "dialogue-zh-l9-24.js"
sys.path.insert(0, str(ROOT / "scripts"))
from curated_dialogue_zh_l9_12 import CURATED_L9_12, norm_jp


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text = ZH_JS.read_text(encoding="utf-8")
    m = re.search(r"const\s+DIALOGUE_ZH_L9_24\s*=\s*(\{.*?\})\s*;", text, re.S)
    if not m:
        raise SystemExit("DIALOGUE_ZH_L9_24 not found")
    mp = json.loads(m.group(1))
    n = 0
    for jp, zh in CURATED_L9_12.items():
        k = norm_jp(jp)
        if mp.get(k) != zh:
            mp[k] = zh
            n += 1
    body = json.dumps(mp, ensure_ascii=False, indent=2)
    out = (
        "/**\n"
        " * 第3–6单元第9–24课 · 会話 opener/reply 中文灰字\n"
        " * build-dialogue-zh-l9-24.py + patch-dialogue-zh-l9-12.py（L9–12 精校）\n"
        " */\n"
        f"const DIALOGUE_ZH_L9_24 = {body};\n"
    )
    ZH_JS.write_text(out, encoding="utf-8")
    print(f"[OK] patch-dialogue-zh-l9-12: updated {n} keys, total {len(mp)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
