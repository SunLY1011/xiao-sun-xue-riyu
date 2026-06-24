#!/usr/bin/env python3
"""以用户选定的 4 张图为源，去泡/去字/去暗块后写入 unit-1 draft。"""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
CURSOR_ASSETS = Path(r"C:\Users\Lenovo\.cursor\projects\d\assets")

LIKED = {
    1: "c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_a6e3cb4cfaee7c92d414d7146109b160_images_image-19f73432-2bd5-4c77-831d-3004361953ce.png",
    2: "c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_a6e3cb4cfaee7c92d414d7146109b160_images_unit-1-panel-2-dialogue-80772ca9-8960-4013-baea-b3c28e4f6a8e.png",
    3: "c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_a6e3cb4cfaee7c92d414d7146109b160_images_image-8479b965-f58b-4465-a7a7-7470838e78f2.png",
    4: "c__Users_Lenovo_AppData_Roaming_Cursor_User_workspaceStorage_a6e3cb4cfaee7c92d414d7146109b160_images_unit-1-panel-4-dialogue-05ca1eaa-083b-4038-b5d1-3e22b2f60aee.png",
}


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


def cover_bright_blobs(img: Image.Image, boxes: list[tuple[int, int, int, int]], sample: tuple[int, int, int, int]) -> None:
    for box in boxes:
        cover_rect(img, box, sample)


def cover_dark_blobs(img: Image.Image, boxes: list[tuple[int, int, int, int]], sample: tuple[int, int, int, int]) -> None:
    for box in boxes:
        cover_rect(img, box, sample)


def rel(img: Image.Image, x0: float, y0: float, x1: float, y1: float) -> tuple[int, int, int, int]:
    w, h = img.size
    return (int(w * x0), int(h * y0), int(w * x1), int(h * y1))


def clean_panel1(img: Image.Image) -> None:
    w, h = img.size
    remove_corner_watermark(img)
    cover_rect(img, rel(img, 0.78, 0.78, 1.0, 1.0), rel(img, 0.35, 0.72, 0.72, 0.95))


def clean_panel2(img: Image.Image) -> None:
    w, h = img.size
    remove_corner_watermark(img)
    floor = rel(img, 0.25, 0.72, 0.65, 0.95)
    cover_bright_blobs(
        img,
        [
            rel(img, 0.01, 0.02, 0.28, 0.32),
            rel(img, 0.02, 0.18, 0.30, 0.42),
            rel(img, 0.52, 0.06, 0.82, 0.38),
            rel(img, 0.58, 0.22, 0.88, 0.48),
        ],
        floor,
    )
    cover_dark_blobs(
        img,
        [
            rel(img, 0.12, 0.08, 0.48, 0.48),
            rel(img, 0.02, 0.32, 0.10, 0.48),
            rel(img, 0.68, 0.68, 1.0, 1.0),
        ],
        floor,
    )


def clean_panel3(img: Image.Image) -> None:
    remove_corner_watermark(img)


def clean_panel4(img: Image.Image) -> None:
    w, h = img.size
    remove_corner_watermark(img)
    wall = rel(img, 0.55, 0.35, 0.85, 0.65)
    floor = rel(img, 0.15, 0.75, 0.55, 0.95)
    cover_bright_blobs(
        img,
        [
            rel(img, 0.01, 0.02, 0.30, 0.38),
            rel(img, 0.01, 0.32, 0.28, 0.58),
            rel(img, 0.48, 0.12, 0.78, 0.42),
            rel(img, 0.52, 0.38, 0.82, 0.62),
        ],
        wall,
    )
    cover_dark_blobs(
        img,
        [
            rel(img, 0.28, 0.10, 0.48, 0.38),
            rel(img, 0.48, 0.10, 0.68, 0.32),
            rel(img, 0.32, 0.06, 0.44, 0.22),
            rel(img, 0.72, 0.78, 1.0, 1.0),
        ],
        rel(img, 0.50, 0.55, 0.75, 0.78),
    )
    cover_rect(img, rel(img, 0.38, 0.48, 0.52, 0.56), wall)


CLEANERS = {1: clean_panel1, 2: clean_panel2, 3: clean_panel3, 4: clean_panel4}


def resolve_liked(i: int) -> Path:
    name = LIKED[i]
    for base in (CURSOR_ASSETS, STORY):
        p = base / name
        if p.is_file():
            return p
    raise FileNotFoundError(name)


def main() -> None:
    for i in range(1, 5):
        src = resolve_liked(i)
        img = Image.open(src).convert("RGB")
        CLEANERS[i](img)
        out = STORY / f"unit-1-panel-{i}-draft.png"
        img.save(out, "PNG", optimize=True)
        print(f"panel {i} <- {src.name} -> {out.name}")


if __name__ == "__main__":
    main()
