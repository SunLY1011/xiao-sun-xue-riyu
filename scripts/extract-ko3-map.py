#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 地图/kO3mN798qr.png 提取红色列岛剪影，去掉 TRAVEL JAPAN 等灰字，输出透明底 PNG。"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "地图" / "kO3mN798qr.png"
OUT = ROOT / "assets" / "splash" / "japan-map-ko3.png"
META = ROOT / "assets" / "splash" / "japan-map-ko3.meta.json"


def is_map_red(r: int, g: int, b: int, a: int) -> bool:
    if a < 32:
        return False
    if r < 120:
        return False
    if r < g + 35 or r < b + 35:
        return False
    if max(r, g, b) - min(r, g, b) < 40 and r < 200:
        return False
    return True


def main() -> int:
    if not SRC.is_file():
        print(f"[FAIL] missing {SRC}", file=sys.stderr)
        return 1

    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()

    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_map_red(r, g, b, a):
                mp[x, y] = 255
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x <= min_x:
        print("[FAIL] no red map pixels found", file=sys.stderr)
        return 1

    pad = 4
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w - 1, max_x + pad)
    max_y = min(h - 1, max_y + pad)

    cropped = Image.new("RGBA", (max_x - min_x + 1, max_y - min_y + 1), (0, 0, 0, 0))
    cp = cropped.load()
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            r, g, b, a = px[x, y]
            if is_map_red(r, g, b, a):
                cp[x - min_x, y - min_y] = (r, g, b, 255)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    cropped.save(OUT, "PNG", optimize=True)

    meta = {
        "source": str(SRC.relative_to(ROOT)).replace("\\", "/"),
        "sourceSize": [w, h],
        "cropBox": [min_x, min_y, max_x, max_y],
        "outputSize": [cropped.size[0], cropped.size[1]],
        "lock390x844": {
            "topPct": round((min_y / h) * 100, 2),
            "leftPct": round((min_x / w) * 100, 2),
            "widthPct": round(((max_x - min_x + 1) / w) * 100, 2),
            "heightPct": round(((max_y - min_y + 1) / h) * 100, 2),
            "objectPosition": "right center",
        },
    }
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[OK] {OUT} {cropped.size[0]}x{cropped.size[1]}")
    print(json.dumps(meta["lock390x844"], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
