#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""裁掉 72c63460 封面四边红框，导出 assets/splash/cover-base.png（780×1688）。"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "地图" / "72c63460-f23a-412c-87b2-e3c4d58c17ef.png"
OUT = ROOT / "assets" / "splash" / "cover-base.png"
OUT_W, OUT_H = 780, 1688  # 390×844 @2x


def is_cream(r: int, g: int, b: int) -> bool:
    return r >= 235 and g >= 228 and b >= 200


def is_map_red(r: int, g: int, b: int) -> bool:
    return r >= 140 and r > g + 25 and r > b + 25


def is_border_red(r: int, g: int, b: int) -> bool:
    return r >= 90 and g <= 70 and b <= 70 and r > g + 20


def content_score_column(px, x: int, h: int) -> int:
    cream = mapr = border = 0
    for y in range(h):
        r, g, b = px[x, y][:3]
        if is_cream(r, g, b):
            cream += 1
        elif is_map_red(r, g, b):
            mapr += 1
        elif is_border_red(r, g, b):
            border += 1
    return cream + mapr * 2 - border


def content_score_row(px, y: int, w: int) -> int:
    cream = mapr = border = 0
    for x in range(w):
        r, g, b = px[x, y][:3]
        if is_cream(r, g, b):
            cream += 1
        elif is_map_red(r, g, b):
            mapr += 1
        elif is_border_red(r, g, b):
            border += 1
    return cream + mapr * 2 - border


def shrink_from_border(im: Image.Image, max_px: int = 28) -> tuple[int, int, int, int]:
    """去掉四边细红框：从外缘向内剥，直到该行/列几乎无框线红。"""
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    left, top, right, bottom = 0, 0, w - 1, h - 1

    def col_border_ratio(x: int) -> float:
        n = 0
        for y in range(h):
            r, g, b = px[x, y]
            if is_border_red(r, g, b):
                n += 1
        return n / h

    def row_border_ratio(y: int) -> float:
        n = 0
        for x in range(w):
            r, g, b = px[x, y]
            if is_border_red(r, g, b):
                n += 1
        return n / w

    for _ in range(max_px):
        if left >= right or top >= bottom:
            break
        if col_border_ratio(left) > 0.02 or col_border_ratio(left) > col_border_ratio(left + 1):
            left += 1
        else:
            break
    for _ in range(max_px):
        if col_border_ratio(right) > 0.02:
            right -= 1
        else:
            break
    for _ in range(max_px):
        if row_border_ratio(top) > 0.02:
            top += 1
        else:
            break
    for _ in range(max_px):
        if row_border_ratio(bottom) > 0.02:
            bottom -= 1
        else:
            break
    return left, top, right, bottom


def find_crop_box(im: Image.Image, margin: int = 2) -> tuple[int, int, int, int]:
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()

    left = 0
    for x in range(w):
        if content_score_column(px, x, h) > h * 0.08:
            left = max(0, x - margin)
            break

    right = w - 1
    for x in range(w - 1, -1, -1):
        if content_score_column(px, x, h) > h * 0.08:
            right = min(w - 1, x + margin)
            break

    top = 0
    for y in range(h):
        if content_score_row(px, y, w) > w * 0.08:
            top = max(0, y - margin)
            break

    bottom = h - 1
    for y in range(h - 1, -1, -1):
        if content_score_row(px, y, w) > w * 0.08:
            bottom = min(h - 1, y + margin)
            break

    return left, top, right, bottom


def main() -> int:
    if not SRC.is_file():
        print(f"[FAIL] missing {SRC}", file=sys.stderr)
        return 1

    im = Image.open(SRC)
    box = find_crop_box(im)
    cropped = im.crop(box)
    box2 = shrink_from_border(cropped)
    cropped = cropped.crop(box2)
    inset = 20
    cw, ch = cropped.size
    if cw > inset * 4 and ch > inset * 4:
        cropped = cropped.crop((inset, inset, cw - inset, ch - inset))
    out = cropped.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, "PNG", optimize=True)
    print(f"[OK] crop {box} from {im.size} -> {OUT} {out.size}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
