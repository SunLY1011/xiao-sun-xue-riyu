#!/usr/bin/env python3
"""以单元格1（或全局 gurumi-reference）为色彩锚点，统一格2–4角色区色调（仅 PIL）。"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"

GURUMI_ROIS: dict[int, tuple[int, int, int, int]] = {
    1: (400, 150, 740, 540),
    2: (340, 140, 640, 520),
    3: (330, 170, 620, 540),
    4: (260, 190, 540, 500),
}

SUITCASE_ROIS: dict[int, tuple[int, int, int, int]] = {
    1: (600, 380, 760, 540),
    2: (80, 360, 200, 520),
    3: (520, 400, 680, 540),
    4: (480, 380, 620, 520),
}


def channel_stats(im: Image.Image) -> tuple[list[float], list[float]]:
    st = ImageStat.Stat(im)
    return list(st.mean), [max(s, 1.0) for s in st.stddev]


def match_region_stats(ref: Image.Image, tgt: Image.Image, strength: float = 0.72) -> Image.Image:
    tgt = tgt.convert("RGB")
    ref_mean, ref_std = channel_stats(ref)
    tgt_mean, tgt_std = channel_stats(tgt)
    out = Image.new("RGB", tgt.size)
    px_out = out.load()
    px_tgt = tgt.load()
    w, h = tgt.size
    for y in range(h):
        for x in range(w):
            r, g, b = px_tgt[x, y]
            vals = [r, g, b]
            new = []
            for i, v in enumerate(vals):
                nv = (v - tgt_mean[i]) * (ref_std[i] / tgt_std[i]) + ref_mean[i]
                new.append(int(vals[i] * (1 - strength) + nv * strength))
            px_out[x, y] = tuple(max(0, min(255, c)) for c in new)
    return out


def blend_global_tone(ref: Image.Image, tgt: Image.Image, strength: float = 0.12) -> Image.Image:
    rm, _ = channel_stats(ref)
    tm, _ = channel_stats(tgt)
    delta = [(rm[i] - tm[i]) * strength for i in range(3)]
    out = tgt.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            px[x, y] = (
                max(0, min(255, int(r + delta[0]))),
                max(0, min(255, int(g + delta[1]))),
                max(0, min(255, int(b + delta[2]))),
            )
    return out


def apply_rois(img: Image.Image, ref_img: Image.Image, rois: list[tuple[int, int, int, int]], strength: float) -> Image.Image:
    result = img.copy()
    for box in rois:
        matched = match_region_stats(ref_img.crop(box), result.crop(box), strength=strength)
        result.paste(matched, box)
    return result


def export_reference(panel1: Image.Image) -> None:
    ref = panel1.crop(GURUMI_ROIS[1])
    out = STORY / "gurumi-reference.png"
    ref.save(out, "PNG", optimize=True)
    print(f"reference {out} ({ref.size[0]}x{ref.size[1]})")


def resolve_anchor(unit: int) -> Image.Image:
    global_ref = STORY / "gurumi-reference.png"
    if global_ref.is_file():
        return Image.open(global_ref).convert("RGB")
    p1 = STORY / f"unit-{unit}-panel-1-draft.png"
    if not p1.is_file() and unit != 1:
        p1 = STORY / "unit-1-panel-1-draft.png"
    if not p1.is_file():
        raise SystemExit(f"missing anchor: {p1}")
    return Image.open(p1).convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, default=1, help="单元号")
    args = ap.parse_args()
    unit = args.unit

    panel1 = resolve_anchor(unit)
    if unit == 1:
        export_reference(panel1)

    for i in range(1, 5):
        src = STORY / f"unit-{unit}-panel-{i}-draft.png"
        if not src.is_file():
            print(f"skip missing {src.name}")
            continue
        img = Image.open(src).convert("RGB")
        if i == 1:
            out = img
        else:
            rois = [GURUMI_ROIS[i]]
            if i in SUITCASE_ROIS:
                rois.append(SUITCASE_ROIS[i])
            out = apply_rois(img, panel1, rois, strength=0.68)
            out = blend_global_tone(panel1, out, strength=0.14)
        dest = STORY / f"unit-{unit}-panel-{i}-harmonized.png"
        out.save(dest, "PNG", optimize=True)
        print(f"harmonized panel {i} -> {dest.name}")

    print(f"next: python scripts/finish-unit-strip.py --unit {unit} --source auto")


if __name__ == "__main__":
    main()
