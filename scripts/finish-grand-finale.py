#!/usr/bin/env python3
"""通关全家福：clean 单卡 + 4×6（北↑·春夏秋冬）合成 egg-grand.webp。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

from grand_finale_layout import (
    fit_cell_square,
    CARD_COUNT,
    CELL_SIZE,
    COLS,
    EGG_GRAND,
    EGG_GRAND_DRAFT,
    EGG_GRAND_PREVIEW,
    GRAND,
    OUT_H,
    OUT_W,
    ROWS,
    card_path,
    compose_card_order,
)

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"


def remove_corner_watermark(img: Image.Image) -> None:
    w, h = img.size
    box = (int(w * 0.82), int(h * 0.88), w, h)
    region = img.crop(box)
    st = region.convert("L")
    if sum(st.getdata()) / (region.size[0] * region.size[1]) > 240:
        draw_region = Image.new("RGB", region.size, (248, 245, 240))
        img.paste(draw_region, box)


def resolve_source(card_id: int, source: str) -> Path:
    if source == "auto":
        for kind in ("harmonized", "draft"):
            p = card_path(card_id, kind)
            if p.is_file():
                return p
        return card_path(card_id, "draft")
    return card_path(card_id, source)


def compose_ordered(clean_by_id: dict[int, Path], order: list[int], out: Path) -> None:
    canvas = Image.new("RGB", (OUT_W, OUT_H), (248, 245, 240))
    for idx, cid in enumerate(order):
        col = idx % COLS
        row = idx // COLS
        cell = fit_cell_square(Image.open(clean_by_id[cid]), CELL_SIZE, card_id=cid)
        canvas.paste(cell, (col * CELL_SIZE, row * CELL_SIZE))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "WEBP", quality=90, method=6)
    print(f"composed {out} ({OUT_W}x{OUT_H})")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=("draft", "harmonized", "auto"), default="auto")
    ap.add_argument("--compose-only", action="store_true")
    args = ap.parse_args()

    GRAND.mkdir(parents=True, exist_ok=True)
    order = compose_card_order()
    clean_by_id: dict[int, Path] = {}

    if not args.compose_only:
        for cid in range(1, CARD_COUNT + 1):
            src = resolve_source(cid, args.source)
            if not src.is_file():
                print(f"missing {src}", file=sys.stderr)
                sys.exit(1)
            clean = Image.open(src).convert("RGB")
            remove_corner_watermark(clean)
            dest = card_path(cid, "clean")
            clean.save(dest, "PNG", optimize=True)
            clean_by_id[cid] = dest
            print(f"ok clean {cid:02d}")
    else:
        for cid in range(1, CARD_COUNT + 1):
            p = card_path(cid, "clean")
            if not p.is_file():
                print(f"missing {p}", file=sys.stderr)
                sys.exit(1)
            clean_by_id[cid] = p

    compose_ordered(clean_by_id, order, EGG_GRAND)
    compose_ordered(clean_by_id, order, EGG_GRAND_DRAFT)
    Image.open(EGG_GRAND).convert("RGB").save(
        EGG_GRAND_PREVIEW, "JPEG", quality=88, optimize=True
    )
    print("done 4×6 · 北↑南↓ · 列=春夏秋冬")


if __name__ == "__main__":
    main()
