#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
去掉 64649377 封面四边红色描边框（保留米黄底 + 地图 + 虚线 + 六圆）。
仅把描边线上的深红像素改为米黄，不缩放、不裁切画布尺寸。
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "地图" / "64649377-e0e1-4239-a073-118630981bb6 (1).png"
OUT = ROOT / "assets" / "splash" / "cover-base.png"
CREAM = (255, 248, 225)

def is_border_line_red(r: int, g: int, b: int) -> bool:
    return r >= 100 and g <= 95 and b <= 95 and g < int(r * 0.55)


def in_frame_zone(x: int, y: int, w: int, h: int) -> bool:
    """描边框 + 圆角区域（不碰 x=12 以右的列岛主体列）。"""
    if x <= 11 or x >= w - 14:
        return True
    if y <= 11 or y >= h - 14:
        return True
    m = 26
    if x < m and y < m:
        return True
    if x >= w - m and y < m:
        return True
    if x < m and y >= h - m:
        return True
    if x >= w - m and y >= h - m:
        return True
    return False


def main() -> int:
    src = SRC if SRC.is_file() else OUT
    if not src.is_file():
        print(f"[FAIL] missing {SRC}", file=sys.stderr)
        return 1

    im = Image.open(src).convert("RGB")
    px = im.load()
    w, h = im.size
    changed = 0

    for y in range(h):
        for x in range(w):
            if not in_frame_zone(x, y, w, h):
                continue
            r, g, b = px[x, y]
            if is_border_line_red(r, g, b):
                px[x, y] = CREAM
                changed += 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, "PNG", optimize=True)
    print(f"[OK] stripped {changed} border px -> {OUT} {im.size}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
