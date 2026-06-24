#!/usr/bin/env python3
"""通关全家福开工校对。"""
from __future__ import annotations

from pathlib import Path

from grand_finale_layout import (
    CARD_COUNT,
    COLS,
    EGG_GRAND,
    GRAND,
    OUT_H,
    OUT_W,
    ROWS,
    card_path,
    resolve_egg_txt,
)

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs/storyboard-grand-24-彩蛋重绘.md"
DATA = ROOT / "js/data/grand-finale-cards.js"


def main() -> None:
    print("\n=== 通关全家福 · 开工校对 ===\n")
    print(f"版式: {COLS}×{ROWS} 手机一屏 = {CARD_COUNT} · 合成 {OUT_W}×{OUT_H} (2:3)\n")
    print("逻辑: 行 北→南 · 列 春夏秋冬 · 见 docs/story-grand-finale-mobile-layout.md\n")

    ok = True
    egg_txt = resolve_egg_txt()
    if egg_txt:
        print(f"[A] 真源 {egg_txt.relative_to(ROOT)} -> OK")
    else:
        print(f"[A] 真源缺失（彩蛋/通关全家福.txt）")
        ok = False

    if DOC.is_file():
        print(f"[B] 英文稿 {DOC.relative_to(ROOT)} -> OK")
    else:
        print(f"[B] 英文稿缺失")
        ok = False

    if DATA.is_file():
        print(f"[C] 数据 {DATA.relative_to(ROOT)} -> OK")
    else:
        print(f"[C] 数据缺失")
        ok = False

    GRAND.mkdir(parents=True, exist_ok=True)
    for kind in ("draft", "harmonized", "clean"):
        n = sum(1 for i in range(1, CARD_COUNT + 1) if card_path(i, kind).is_file())
        print(f"[{kind}] {n}/{CARD_COUNT}")

    if EGG_GRAND.is_file():
        print(f"[egg-grand.webp] OK")
    else:
        print(f"[egg-grand.webp] 待合成")

    print("\n---")
    print("通过文档后可出图 → harmonize-grand-cards → finish-grand-finale → sync-grand-to-eggs")
    if not ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
