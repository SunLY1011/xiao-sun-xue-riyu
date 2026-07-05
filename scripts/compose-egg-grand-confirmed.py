#!/usr/bin/env python3
"""从 彩蛋/通关隐藏版-确认版 的 1..24.png 按 4×6（北↑·春夏秋冬）合成 egg-grand.webp。"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from PIL import Image

from grand_finale_layout import (
    CARD_COUNT,
    CELL_SIZE,
    COLS,
    CONFIRMED_GRAND_DIR,
    EGG_GRAND,
    EGG_GRAND_DRAFT,
    EGG_GRAND_PREVIEW,
    GRAND,
    OUT_H,
    OUT_W,
    ROWS,
    card_path,
    compose_card_order,
    confirmed_source_path,
    fit_cell_square,
)
from grand_finale_slate import GRAND_SLATE, LATITUDE_ROW_ZH, SEASON_COL_ZH

ROOT = Path(__file__).resolve().parents[1]
CONFIRMED = CONFIRMED_GRAND_DIR


def confirmed_card_path(n: int) -> Path:
    return confirmed_source_path(n)


def compose_from_card_ids(card_ids: list[int], out: Path) -> None:
    canvas = Image.new("RGB", (OUT_W, OUT_H), (248, 245, 240))
    for idx, cid in enumerate(card_ids):
        src = confirmed_card_path(cid)
        if not src.is_file():
            print(f"missing {src}", file=sys.stderr)
            raise SystemExit(1)
        col = idx % COLS
        row = idx // COLS
        cell = fit_cell_square(Image.open(src), CELL_SIZE, card_id=cid)
        canvas.paste(cell, (col * CELL_SIZE, row * CELL_SIZE))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "WEBP", quality=90, method=6)
    print(f"composed {out} ({OUT_W}x{OUT_H})")


def main() -> None:
    ap = argparse.ArgumentParser(description="确认版 → 4×6 手机一屏 egg-grand.webp")
    ap.add_argument("--install-clean", action="store_true")
    ap.add_argument("--sync-eggs", action="store_true")
    args = ap.parse_args()

    order = compose_card_order()
    if len(order) != CARD_COUNT or len(set(order)) != CARD_COUNT:
        print("slate 必须含 24 个不重复编号", file=sys.stderr)
        raise SystemExit(1)

    compose_from_card_ids(order, EGG_GRAND)
    compose_from_card_ids(order, EGG_GRAND_DRAFT)

    preview = Image.open(EGG_GRAND).convert("RGB")
    preview.save(EGG_GRAND_PREVIEW, "JPEG", quality=88, optimize=True)
    print(f"preview {EGG_GRAND_PREVIEW.name}")

    if args.install_clean:
        GRAND.mkdir(parents=True, exist_ok=True)
        for cid in range(1, CARD_COUNT + 1):
            src = confirmed_card_path(cid)
            im = fit_cell_square(Image.open(src), CELL_SIZE, card_id=cid)
            for suffix in ("clean", "draft"):
                im.save(card_path(cid, suffix), "PNG", optimize=True)
            print(f"card-{cid:02d} <- {cid}.png")

    archive = CONFIRMED / "合成用"
    archive.mkdir(exist_ok=True)
    for cid in range(1, CARD_COUNT + 1):
        shutil.copy2(confirmed_card_path(cid), archive / f"card-{cid:02d}.png")

    shutil.copy2(EGG_GRAND, CONFIRMED / "egg-grand-4x6.webp")

    if args.sync_eggs:
        import subprocess

        subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "sync-grand-to-eggs.py")],
            check=True,
            cwd=ROOT,
        )

    print("grid: 4×6 portrait · rows 北→南 · cols 春夏秋冬")
    for r, row in enumerate(GRAND_SLATE):
        labels = [f"{SEASON_COL_ZH[c]}:{n}" for c, n in enumerate(row)]
        print(f"  R{r} {LATITUDE_ROW_ZH[r]}: " + " | ".join(labels))


if __name__ == "__main__":
    main()
