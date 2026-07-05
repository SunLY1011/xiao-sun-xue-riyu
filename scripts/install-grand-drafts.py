#!/usr/bin/env python3
"""将 Cursor GenerateImage 产出复制到 assets/story/grand/ 并缩放到 1920×1080。"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

from grand_finale_layout import CARD_COUNT, GRAND, card_path

CURSOR_ASSETS = Path(r"C:\Users\Lenovo\.cursor\projects\d\assets")
OUT_W, OUT_H = 1920, 1080


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src-dir", type=Path, default=CURSOR_ASSETS)
    ap.add_argument("--only", type=int, nargs="*")
    args = ap.parse_args()

    GRAND.mkdir(parents=True, exist_ok=True)
    nums = args.only or list(range(1, CARD_COUNT + 1))

    for i in nums:
        src = args.src_dir / f"grand-card-{i:02d}-draft.png"
        if not src.is_file():
            src = args.src_dir / f"card-{i:02d}-draft.png"
        if not src.is_file():
            print(f"skip missing {src.name}")
            continue
        im = Image.open(src).convert("RGB").resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)
        dest = card_path(i, "draft")
        im.save(dest, "PNG", optimize=True)
        print(f"ok {dest.name}")


if __name__ == "__main__":
    main()
