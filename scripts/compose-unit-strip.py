#!/usr/bin/env python3
"""将四张单格 16:9 图拼成 unit-{n}-strip.webp（2×2，读序左上→右上→左下→右下）。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("需要 Pillow: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
GUTTER = 6
OUT_W, OUT_H = 1920, 1080
CELL_W, CELL_H = OUT_W // 2, OUT_H // 2


def load_cell(path: Path) -> Image.Image:
    img = Image.open(path).convert("RGB")
    return img.resize((CELL_W, CELL_H), Image.Resampling.LANCZOS)


def compose(panels: list[Path], out: Path) -> None:
    if len(panels) != 4:
        raise SystemExit("需要恰好 4 张图：格1 格2 格3 格4")
    cells = [load_cell(p) for p in panels]
    canvas = Image.new("RGB", (OUT_W, OUT_H), (255, 255, 255))
    positions = [
        (0, 0),
        (CELL_W + GUTTER, 0),
        (0, CELL_H + GUTTER),
        (CELL_W + GUTTER, CELL_H + GUTTER),
    ]
    # 有 gutter 时画布需加大；简化为无 gutter 等分（与定案 4–8px 白缝接近）
    canvas = Image.new("RGB", (OUT_W, OUT_H), (255, 255, 255))
    half_w, half_h = OUT_W // 2, OUT_H // 2
    for cell, (x, y) in zip(cells, [(0, 0), (half_w, 0), (0, half_h), (half_w, half_h)]):
        canvas.paste(cell.resize((half_w, half_h), Image.Resampling.LANCZOS), (x, y))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "WEBP", quality=88, method=6)
    print(f"OK {out} ({OUT_W}x{OUT_H})")


def main() -> None:
    ap = argparse.ArgumentParser(description="2×2 拼单元四格条带")
    ap.add_argument("--unit", type=int, default=1, help="单元号，默认 1")
    ap.add_argument(
        "--panels",
        nargs=4,
        type=Path,
        metavar="PNG",
        help="四张路径：p1 p2 p3 p4；默认 assets/story/unit-N-panel-{1..4}-draft.png",
    )
    ap.add_argument("-o", "--output", type=Path, help="输出 webp 路径")
    args = ap.parse_args()
    u = args.unit
    panels = args.panels or [STORY / f"unit-{u}-panel-{i}-draft.png" for i in range(1, 5)]
    out = args.output or STORY / f"unit-{u}-strip.webp"
    for p in panels:
        if not p.is_file():
            raise SystemExit(f"缺少: {p}")
    compose(panels, out)


if __name__ == "__main__":
    main()
