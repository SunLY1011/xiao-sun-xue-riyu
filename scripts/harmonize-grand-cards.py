#!/usr/bin/env python3
"""以 card-01 为色调锚点，统一通关全家福 24 格全局色温。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

import importlib.util

from grand_finale_layout import CARD_COUNT, GRAND, card_path

_harm = importlib.util.spec_from_file_location(
    "harmonize_gurumi_panels",
    Path(__file__).resolve().parent / "harmonize-gurumi-panels.py",
)
_mod = importlib.util.module_from_spec(_harm)
assert _harm.loader
_harm.loader.exec_module(_mod)
blend_global_tone = _mod.blend_global_tone
resolve_anchor = _mod.resolve_anchor


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="src_kind", choices=("draft", "harmonized"), default="draft")
    ap.add_argument("--only", type=int, nargs="*", help="仅处理指定卡号 1-24")
    args = ap.parse_args()

    GRAND.mkdir(parents=True, exist_ok=True)
    nums = args.only or list(range(1, CARD_COUNT + 1))

    anchor_src = card_path(1, args.src_kind)
    if not anchor_src.is_file():
        try:
            panel1 = resolve_anchor(1)
        except SystemExit:
            print(f"missing anchor {anchor_src}", file=sys.stderr)
            sys.exit(1)
    else:
        panel1 = Image.open(anchor_src).convert("RGB")

    for i in nums:
        src = card_path(i, args.src_kind)
        if not src.is_file():
            print(f"skip missing {src.name}")
            continue
        img = Image.open(src).convert("RGB")
        if i == 1:
            out = img
        else:
            out = blend_global_tone(panel1, img, strength=0.16)
        dest = card_path(i, "harmonized")
        out.save(dest, "PNG", optimize=True)
        print(f"harmonized card {i:02d} -> {dest.name}")

    print("next: python scripts/finish-grand-finale.py")


if __name__ == "__main__":
    main()
