#!/usr/bin/env python3
"""修复第 1 单元单格画面瑕疵（格2 贴图块/黑块/水印 · 格3 无云精灵 · 格4 用 image-4）。"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
EGG = ROOT / "彩蛋" / "单元1"


def cover_rect(img: Image.Image, box: tuple[int, int, int, int], sample_box: tuple[int, int, int, int]) -> None:
    sx0, sy0, sx1, sy1 = sample_box
    patch = img.crop((sx0, sy0, sx1, sy1)).resize(
        (box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS
    )
    img.paste(patch, (box[0], box[1]))


def remove_corner_watermark(img: Image.Image) -> None:
    w, h = img.size
    x0, y0 = int(w * 0.76), int(h * 0.88)
    src = img.crop((int(w * 0.42), int(h * 0.86), int(w * 0.72), h))
    if src.width > 8 and src.height > 8:
        img.paste(src.resize((w - x0, h - y0), Image.Resampling.LANCZOS), (x0, y0))


def fix_panel2(img: Image.Image) -> None:
    w, h = img.size
    remove_corner_watermark(img)
    # 左上半透明块（风铃/树冠）
    cover_rect(img, (int(w * 0.08), int(h * 0.02), int(w * 0.42), int(h * 0.38)), (int(w * 0.45), int(h * 0.05), int(w * 0.75), int(h * 0.35)))
    # 货架黑块
    cover_rect(img, (int(w * 0.02), int(h * 0.38), int(w * 0.12), int(h * 0.52)), (int(w * 0.14), int(h * 0.38), int(w * 0.24), int(h * 0.52)))
    # 右下贴图重复
    cover_rect(img, (int(w * 0.72), int(h * 0.72), w, h), (int(w * 0.35), int(h * 0.75), int(w * 0.65), int(h * 0.95)))


def fix_panel3(img: Image.Image) -> None:
    w, h = img.size
    remove_corner_watermark(img)
    # 可读招牌区（若有）
    cover_rect(img, (int(w * 0.68), int(h * 0.02), int(w * 0.98), int(h * 0.35)), (int(w * 0.35), int(h * 0.05), int(w * 0.55), int(h * 0.30)))


def fix_panel4(img: Image.Image) -> None:
    remove_corner_watermark(img)


def main() -> None:
    for name in ("unit-1-panel-2-draft-new.png", "unit-1-panel-2-harmonized.png", "unit-1-panel-2-draft.png"):
        src2 = STORY / name
        if not src2.is_file():
            alt = Path(r"C:\Users\Lenovo\.cursor\projects\d\assets") / name
            if alt.is_file():
                src2 = alt
        if src2.is_file():
            break
    else:
        src2 = None
    if src2 and src2.is_file():
        p2 = Image.open(src2).convert("RGB")
        w, h = p2.size
        remove_corner_watermark(p2)
        cover_rect(p2, (int(w * 0.52), int(h * 0.02), int(w * 0.98), int(h * 0.18)), (int(w * 0.20), int(h * 0.08), int(w * 0.48), int(h * 0.22)))
        out2 = STORY / "unit-1-panel-2-draft.png"
        p2.save(out2, "PNG", optimize=True)
        print(f"panel 2 -> {out2.name} (from {src2.name})")

    p3_src = EGG / "image-3.png"
    if p3_src.is_file():
        p3 = Image.open(p3_src).convert("RGB")
        w, h = p3.size
        remove_corner_watermark(p3)
        # 雷門灯笼与匾额文字 → 色块
        cover_rect(p3, (int(w * 0.55), int(h * 0.08), int(w * 0.92), int(h * 0.55)), (int(w * 0.55), int(h * 0.55), int(w * 0.85), int(h * 0.85)))
        cover_rect(p3, (int(w * 0.58), int(h * 0.02), int(w * 0.88), int(h * 0.12)), (int(w * 0.15), int(h * 0.05), int(w * 0.40), int(h * 0.12)))
        out3 = STORY / "unit-1-panel-3-draft.png"
        p3.save(out3, "PNG", optimize=True)
        print(f"panel 3 from image-3 (Asakusa) -> {out3.name}")

    src4 = EGG / "image-4.png"
    if src4.is_file():
        p4 = Image.open(src4).convert("RGB")
        fix_panel4(p4)
        out4 = STORY / "unit-1-panel-4-draft.png"
        p4.save(out4, "PNG", optimize=True)
        print(f"panel 4 from image-4 -> {out4.name}")

    p1 = STORY / "unit-1-panel-1-draft.png"
    if p1.is_file():
        im = Image.open(p1).convert("RGB")
        remove_corner_watermark(im)
        im.save(p1, "PNG", optimize=True)
        print(f"watermark pass panel 1")


if __name__ == "__main__":
    main()
