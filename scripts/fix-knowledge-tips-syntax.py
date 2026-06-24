#!/usr/bin/env python3
"""修复 knowledge-tips.js 中 VOCAB 等对象的非法 `}},` → `},`"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "js/data/unit1-knowledge-tips.js",
    ROOT / "js/data/unit2-knowledge-tips.js",
    ROOT / "js/data/lessons-9-24-knowledge-tips.js",
]

for p in FILES:
    if not p.is_file():
        print(f"[SKIP] {p.name}")
        continue
    t = p.read_text(encoding="utf-8")
    n = t.count("  }},")
    t2 = t.replace("  }},", "  },")
    p.write_text(t2, encoding="utf-8")
    print(f"[OK] {p.name}: fixed {n} `}},`")
