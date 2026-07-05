#!/usr/bin/env python3
"""四格条带：clean（条带无泡）+ dialogue（单格有泡）+ incoming 交接。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageStat

from story_strip_units import (
    SUPPORTED_UNITS,
    UNIT_CLEAN,
    UNIT_DIALOGUE,
    UNIT_P4_CLEAN,
    bind_draw_helpers,
)

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
OUT_W, OUT_H = 1920, 1080

FONT_PATHS = [
    Path(r"C:\Windows\Fonts\YuGothR.ttc"),
    Path(r"C:\Windows\Fonts\msgothic.ttc"),
    Path(r"C:\Windows\Fonts\msyh.ttc"),
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_PATHS:
        if p.is_file():
            try:
                return ImageFont.truetype(str(p), size, index=0)
            except OSError:
                continue
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        if not para:
            lines.append("")
            continue
        cur = ""
        for ch in para:
            test = cur + ch
            if draw.textlength(test, font=font) <= max_width:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = ch
        if cur:
            lines.append(cur)
    return lines or [""]


def text_block_size(draw, lines, font, line_gap: int = 4) -> tuple[int, int]:
    w = max(int(draw.textlength(ln, font=font)) for ln in lines) if lines else 0
    h = sum(font.size + line_gap for _ in lines) - line_gap if lines else font.size
    return w, h


def draw_bubble(
    img: Image.Image,
    xy: tuple[int, int],
    text: str,
    *,
    side: str = "left",
    font_size: int = 17,
    max_w: int = 200,
    is_gurumi: bool = False,
) -> None:
    draw = ImageDraw.Draw(img)
    font = load_font(font_size)
    lines = wrap_text(draw, text, font, max_w)
    tw, th = text_block_size(draw, lines, font)
    pad_x, pad_y = 12, 10
    bw, bh = tw + pad_x * 2, th + pad_y * 2
    x, y = xy
    if side == "right":
        x = x - bw
    fill = (255, 252, 245) if is_gurumi else (255, 255, 255)
    outline = (40, 40, 40)
    rect = [x, y, x + bw, y + bh]
    draw.rounded_rectangle(rect, radius=14, fill=fill, outline=outline, width=2)
    if side == "left":
        tail = [(x + 8, y + bh), (x - 6, y + bh + 4), (x + 18, y + bh - 2)]
    else:
        tail = [(x + bw - 8, y + bh), (x + bw + 6, y + bh + 4), (x + bw - 18, y + bh - 2)]
    draw.polygon(tail, fill=fill, outline=outline)
    ty = y + pad_y
    for ln in lines:
        draw.text((x + pad_x, ty), ln, fill=(20, 20, 20), font=font)
        ty += font.size + 4


def draw_mood_text_small(img: Image.Image, xy: tuple[int, int], text: str) -> None:
    draw = ImageDraw.Draw(img)
    font = load_font(13)
    x, y = xy
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        draw.text((x + dx, y + dy), text, fill=(255, 252, 240), font=font)
    draw.text((x, y), text, fill=(90, 60, 40), font=font)


def draw_dept_caption_circle(img: Image.Image, center: tuple[int, int], text: str) -> None:
    draw = ImageDraw.Draw(img)
    font = load_font(14)
    tw = int(draw.textlength(text, font=font))
    th = font.size
    pad = 10
    cx, cy = center
    rx = tw // 2 + pad + 8
    ry = th // 2 + pad + 4
    draw.ellipse(
        [cx - rx, cy - ry, cx + rx, cy + ry],
        outline=(180, 100, 60),
        width=2,
        fill=(255, 252, 245),
    )
    draw.text((cx - tw // 2, cy - th // 2), text, fill=(40, 30, 20), font=font)


def remove_corner_watermark(img: Image.Image) -> None:
    w, h = img.size
    x0, y0 = int(w * 0.76), int(h * 0.88)
    src = img.crop((int(w * 0.42), int(h * 0.86), int(w * 0.72), h))
    if src.width > 8 and src.height > 8:
        img.paste(src.resize((w - x0, h - y0), Image.Resampling.LANCZOS), (x0, y0))


def cover_rect(img: Image.Image, box: tuple[int, int, int, int], sample_box: tuple[int, int, int, int]) -> None:
    sx0, sy0, sx1, sy1 = sample_box
    patch = img.crop((sx0, sy0, sx1, sy1)).resize(
        (box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS
    )
    img.paste(patch, (box[0], box[1]))


def blend_tone_from_ref(target: Image.Image, ref: Image.Image, strength: float) -> None:
    rm = ImageStat.Stat(ref).mean[:3]
    tm = ImageStat.Stat(target).mean[:3]
    delta = [(rm[i] - tm[i]) * strength for i in range(3)]
    px = target.load()
    w, h = target.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            px[x, y] = (
                max(0, min(255, int(r + delta[0]))),
                max(0, min(255, int(g + delta[1]))),
                max(0, min(255, int(b + delta[2]))),
            )


bind_draw_helpers(
    draw_bubble=draw_bubble,
    draw_mood_text_small=draw_mood_text_small,
    draw_dept_caption_circle=draw_dept_caption_circle,
    remove_corner_watermark=remove_corner_watermark,
    cover_rect=cover_rect,
    blend_tone_from_ref=blend_tone_from_ref,
    load_font=load_font,
)


STRIP_BG = (252, 248, 245)
STRIP_GAP = 2
VERT_W = 1080


def compose_grid(panels: list[Path], out: Path) -> None:
    half_w, half_h = OUT_W // 2, OUT_H // 2
    canvas = Image.new("RGB", (OUT_W, OUT_H), STRIP_BG)
    for i, p in enumerate(panels):
        cell = Image.open(p).convert("RGB").resize((half_w, half_h), Image.Resampling.LANCZOS)
        canvas.paste(cell, ((i % 2) * half_w, (i // 2) * half_h))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "WEBP", quality=90, method=6)
    print(f"composed grid {out} ({OUT_W}x{OUT_H})")


def compose_vertical(panels: list[Path], out: Path) -> None:
    """竖排四格 · 画册/连环画感 · 竖屏手机满宽阅读。"""
    cells: list[Image.Image] = []
    for p in panels:
        im = Image.open(p).convert("RGB")
        ratio = im.height / max(im.width, 1)
        h = max(1, int(VERT_W * ratio))
        cells.append(im.resize((VERT_W, h), Image.Resampling.LANCZOS))
    total_h = sum(c.height for c in cells) + STRIP_GAP * (len(cells) - 1)
    canvas = Image.new("RGB", (VERT_W, total_h), STRIP_BG)
    y = 0
    for i, cell in enumerate(cells):
        canvas.paste(cell, (0, y))
        y += cell.height + (STRIP_GAP if i < len(cells) - 1 else 0)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, "WEBP", quality=90, method=6)
    print(f"composed vertical {out} ({VERT_W}x{total_h})")


def resolve_source(unit: int, i: int, source: str) -> Path:
    if source == "auto":
        for name in ("harmonized", "draft"):
            p = STORY / f"unit-{unit}-panel-{i}-{name}.png"
            if p.is_file():
                return p
        return STORY / f"unit-{unit}-panel-{i}-draft.png"
    return STORY / f"unit-{unit}-panel-{i}-{source}.png"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=("draft", "harmonized", "auto"), default="auto")
    ap.add_argument("--unit", type=int, default=1)
    ap.add_argument(
        "--layout",
        choices=("vertical", "grid"),
        default="vertical",
        help="vertical=竖排四格(默认) grid=2×2横图",
    )
    ap.add_argument(
        "--raw-clean",
        action="store_true",
        help="确认版直出：不跑水印/色调 clean 处理",
    )
    ap.add_argument(
        "--with-dialogue",
        action="store_true",
        help="同时生成 panel-N-dialogue.png（默认仅 clean + strip，不贴泡）",
    )
    args = ap.parse_args()
    unit = args.unit
    if unit not in SUPPORTED_UNITS:
        print(f"未实现 unit {unit}，当前支持: {sorted(SUPPORTED_UNITS)}", file=sys.stderr)
        sys.exit(1)

    pick = lambda i: resolve_source(unit, i, args.source)
    cleans: list[Path] = []
    incoming = STORY / "incoming" / f"unit-{unit}"
    incoming.mkdir(parents=True, exist_ok=True)
    clean_fns = UNIT_CLEAN[unit] if not args.raw_clean else [lambda img: None] * 3
    p4_fn = (lambda img, ref_warm=None: None) if args.raw_clean else UNIT_P4_CLEAN[unit]
    dlg_fns = UNIT_DIALOGUE.get(unit) if args.with_dialogue else None
    if args.with_dialogue and not dlg_fns:
        print(f"unit {unit} 无 UNIT_DIALOGUE 定义，无法生成 dialogue 图", file=sys.stderr)
        sys.exit(1)

    for i in range(1, 4):
        src = pick(i)
        if not src.is_file():
            print(f"missing {src}", file=sys.stderr)
            sys.exit(1)
        base = Image.open(src).convert("RGB")
        clean = base.copy()
        clean_fns[i - 1](clean)
        clean_path = STORY / f"unit-{unit}-panel-{i}-clean.png"
        clean.save(clean_path, "PNG", optimize=True)
        cleans.append(clean_path)
        print(f"ok clean {i} -> {clean_path.name}")

    ref3 = Image.open(cleans[2]).convert("RGB")
    src4 = pick(4)
    if not src4.is_file():
        print(f"missing {src4}", file=sys.stderr)
        sys.exit(1)
    clean4 = Image.open(src4).convert("RGB")
    p4_fn(clean4, ref_warm=ref3)
    clean4_path = STORY / f"unit-{unit}-panel-4-clean.png"
    clean4.save(clean4_path, "PNG", optimize=True)
    cleans.append(clean4_path)
    print(f"ok clean 4 -> {clean4_path.name} (warm-unified)")

    for i in range(1, 5):
        clean = Image.open(cleans[i - 1]).convert("RGB")
        clean.save(incoming / f"panel-{i}.png", "PNG", optimize=True)
        if args.with_dialogue:
            dlg = clean.copy()
            dlg_fns[i - 1](dlg)
            dlg_path = STORY / f"unit-{unit}-panel-{i}-dialogue.png"
            dlg.save(dlg_path, "PNG", optimize=True)
            dlg.save(incoming / f"panel-{i}-dialogue.png", "PNG", optimize=True)
            print(f"ok dialogue {i} -> {dlg_path.name}")

    strip = STORY / f"unit-{unit}-strip.webp"
    if args.layout == "vertical":
        compose_vertical(cleans, strip)
        compose_vertical(cleans, STORY / f"unit-{unit}-strip-draft.webp")
    else:
        compose_grid(cleans, strip)
        compose_grid(cleans, STORY / f"unit-{unit}-strip-draft.webp")
    meta = STORY / f"unit-{unit}-strip-layout.txt"
    meta.write_text(args.layout + "\n", encoding="utf-8")
    print(f"unit {unit} strip = {args.layout} (raw_clean={args.raw_clean})")
    if not args.with_dialogue:
        print("skip dialogue panels (use --with-dialogue to generate)")
    print("done")


if __name__ == "__main__":
    main()
