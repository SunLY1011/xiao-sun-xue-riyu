#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""【标日学习资料补充】/结构化 → 合并进 【产品PRD】/新增补课文内容"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "【标日学习资料补充】" / "结构化"
PRD = ROOT / "【产品PRD】" / "新增补课文内容"

BLOCK_START = "【标日真源·结构化补丁】"
BLOCK_END = "【/标日真源·结构化补丁】"
BLOCK_RE = re.compile(
    re.escape(BLOCK_START) + r"([\s\S]*?)" + re.escape(BLOCK_END),
    re.M,
)


def prd_target(rel: str) -> Path:
    """第2单元/第2单元第05课-真源补丁.txt → 第2单元第05课.txt
    第4单元/第4单元第13课-真源补丁.txt → 第4单元13课.txt（U4–U6 命名）"""
    p = Path(rel)
    stem = p.stem.replace("-真源补丁", "")
    m = re.match(r"^(第\d+单元)第0?(\d+)课$", stem)
    if m:
        name = f"{m.group(1)}{m.group(2)}课.txt"
    else:
        name = stem + ".txt"
    return PRD / p.parent / name


def merge_file(sup_path: Path) -> bool:
    rel = sup_path.relative_to(SRC).as_posix()
    if "-真源补丁" not in sup_path.name:
        return False
    body = sup_path.read_text(encoding="utf-8")
    m = BLOCK_RE.search(body)
    if not m:
        print(f"[SKIP] no block: {rel}")
        return False
    patch = m.group(1).strip()
    target = prd_target(rel)
    if not target.exists():
        print(f"[FAIL] PRD missing: {target}")
        return False
    text = target.read_text(encoding="utf-8")
    if BLOCK_START in text:
        text = BLOCK_RE.sub(f"{BLOCK_START}\n{patch}\n{BLOCK_END}", text, count=1)
    else:
        text = text.rstrip() + f"\n\n{BLOCK_START}\n{patch}\n{BLOCK_END}\n"
    target.write_text(text, encoding="utf-8")
    print(f"[OK] merged → {target.relative_to(ROOT)}")
    return True


def main() -> int:
    if not SRC.is_dir():
        print(f"[FAIL] missing {SRC}")
        return 1
    n = 0
    for p in sorted(SRC.rglob("*-真源补丁.txt")):
        if merge_file(p):
            n += 1
    print(f"[OK] merge-supplement-structured-into-prd: {n} file(s)")
    return 0 if n else 1


if __name__ == "__main__":
    sys.exit(main())
