#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
烘焙 P0 开机封面整图 cover-base.png
地图剪影 + 金虚线 + 六圆(02,04,03,01,05,06) 全部在 PNG 内，运行时不再叠层。
坐标基于 japan-map-splash.png 剪影上的新干线大致走向（南→北）。
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MAP_SRC = ROOT / "assets" / "splash" / "japan-map-splash.png"
OUT = ROOT / "assets" / "splash" / "cover-base.png"

# 逻辑稿 390×844；导出 @2x
W, H = 390, 844
SCALE_OUT = 2

CREAM = (255, 248, 225)
MAP_GRAY = (224, 224, 224)
OCEAN = (227, 242, 253)
GOLD_A = (255, 143, 0)
GOLD_B = (255, 213, 79)
CIRCLE_FILL = (255, 255, 255)
CIRCLE_STROKE = (144, 164, 174)
TEXT_IN_CIRCLE = (84, 110, 122)
TITLE_BROWN = (62, 39, 35)
SUB_CORAL = (255, 112, 67)
META_GRAY = (120, 144, 156)

# 源图 855×973 上六站大致地理锚点（福岡→名古屋→箱根→東京→仙台→札幌）
SRC_STOPS = [
    ("02", 305, 805),  # 福岡
    ("04", 425, 655),  # 名古屋
    ("03", 448, 585),  # 箱根（本州南，略西）
    ("01", 518, 535),  # 東京（关东东侧）
    ("05", 530, 385),  # 仙台
    ("06", 455, 125),  # 札幌
]

# 虚线中间控制点（太平洋侧弯曲，非直线穿岛心）
SRC_PATH_EXTRA = [
    (300, 850),
    (360, 760),
    (400, 700),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates += [
            "C:/Windows/Fonts/msyhbd.ttc",
            "C:/Windows/Fonts/segoeuib.ttf",
        ]
    else:
        candidates += [
            "C:/Windows/Fonts/msyh.ttc",
            "C:/Windows/Fonts/segoeui.ttf",
        ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def map_silhouette_to_gray(rgba: Image.Image) -> Image.Image:
    """红剪影 → 浅灰岛 + 透明底。"""
    rgba = rgba.convert("RGBA")
    w, h = rgba.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    src_px = rgba.load()
    dst_px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = src_px[x, y]
            if a < 16:
                continue
            lum = (r + g + b) / 3
            if lum > 40:
                dst_px[x, y] = (*MAP_GRAY, 255)
    return out


def transform_point(x: float, y: float, map_box: tuple[int, int, int, int], src_size: tuple[int, int]) -> tuple[float, float]:
    mx0, my0, mx1, my1 = map_box
    sw, sh = src_size
    tx = mx0 + (x / sw) * (mx1 - mx0)
    ty = my0 + (y / sh) * (my1 - my0)
    return tx, ty


def catmull_rom_points(pts: list[tuple[float, float]], samples_per_seg: int = 24) -> list[tuple[float, float]]:
    if len(pts) < 2:
        return pts
    out: list[tuple[float, float]] = []
    extended = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(extended) - 2):
        p0, p1, p2, p3 = extended[i - 1], extended[i], extended[i + 1], extended[i + 2]
        for t in range(samples_per_seg):
            u = t / samples_per_seg
            u2, u3 = u * u, u * u * u
            x = 0.5 * (
                (2 * p1[0])
                + (-p0[0] + p2[0]) * u
                + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2
                + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3
            )
            y = 0.5 * (
                (2 * p1[1])
                + (-p0[1] + p2[1]) * u
                + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2
                + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3
            )
            out.append((x, y))
    out.append(pts[-1])
    return out


def draw_dashed_polyline(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[float, float]],
    width: int,
    dash_on: float,
    dash_off: float,
    color: tuple[int, int, int],
) -> None:
    if len(points) < 2:
        return
    dist = 0.0
    drawing = True
    remain = dash_on
    px, py = points[0]
    for nx, ny in points[1:]:
        seg_len = math.hypot(nx - px, ny - py)
        if seg_len < 1e-6:
            continue
        ux, uy = (nx - px) / seg_len, (ny - py) / seg_len
        walked = 0.0
        while walked < seg_len:
            step = min(remain, seg_len - walked)
            x1 = px + ux * walked
            y1 = py + uy * walked
            x2 = px + ux * (walked + step)
            y2 = py + uy * (walked + step)
            if drawing:
                draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
            walked += step
            dist += step
            remain -= step
            if remain <= 1e-6:
                drawing = not drawing
                remain = dash_on if drawing else dash_off
        px, py = nx, ny


def lerp_color(t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    return (
        int(GOLD_A[0] + (GOLD_B[0] - GOLD_A[0]) * t),
        int(GOLD_A[1] + (GOLD_B[1] - GOLD_A[1]) * t),
        int(GOLD_A[2] + (GOLD_B[2] - GOLD_A[2]) * t),
    )


def render_frame(w: int, h: int) -> Image.Image:
    img = Image.new("RGB", (w, h), CREAM)
    draw = ImageDraw.Draw(img)

    # 淡蓝海洋晕染
    ocean = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ocean)
    od.ellipse([-w * 0.15, h * 0.08, w * 1.15, h * 0.92], fill=(*OCEAN, 90))
    img.paste(ocean, (0, 0), ocean)

    if not MAP_SRC.is_file():
        raise FileNotFoundError(MAP_SRC)

    map_rgba = Image.open(MAP_SRC)
    gray_map = map_silhouette_to_gray(map_rgba)
    sw, sh = gray_map.size

    target_w = int(w * 0.88)
    target_h = int(sh * (target_w / sw))
    max_h = int(h * 0.62)
    if target_h > max_h:
        target_h = max_h
        target_w = int(sw * (target_h / sh))

    gray_map = gray_map.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mx = (w - target_w) // 2
    my = int(h * 0.22)
    map_box = (mx, my, mx + target_w, my + target_h)

    img.paste(gray_map, (mx, my), gray_map)

    def tpt(sx: float, sy: float) -> tuple[float, float]:
        return transform_point(sx, sy, map_box, (sw, sh))

    # 顶栏（画进底图）
    icon_r = int(w * 0.055)
    icon_cx, icon_cy = int(w * 0.12), int(h * 0.075)
    draw.rounded_rectangle(
        [icon_cx - icon_r, icon_cy - icon_r, icon_cx + icon_r, icon_cy + icon_r],
        radius=int(icon_r * 0.35),
        fill=SUB_CORAL,
    )
    f_title = load_font(int(h * 0.028), bold=True)
    f_sub = load_font(int(h * 0.02), bold=True)
    f_meta = load_font(int(h * 0.014))
    tx = int(w * 0.22)
    draw.text((tx, int(h * 0.048)), "标日 あと学習", fill=TITLE_BROWN, font=f_title)
    draw.text((tx, int(h * 0.078)), "学習の道", fill=SUB_CORAL, font=f_sub)
    draw.text((tx, int(h * 0.102)), "新幹線 24 駅 · 探索型学习", fill=META_GRAY, font=f_meta)

    # ① 完整金虚线（南→北途经六站）
    src_line_pts = SRC_PATH_EXTRA + [(sx, sy) for _, sx, sy in SRC_STOPS]
    line_pts = catmull_rom_points([tpt(x, y) for x, y in src_line_pts], samples_per_seg=28)

    # 外发光（宽淡线）
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    draw_dashed_polyline(gd, line_pts, width=6, dash_on=6, dash_off=4, color=(*GOLD_B, 120))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    n = len(line_pts)
    for i in range(n - 1):
        t = i / max(1, n - 2)
        draw_dashed_polyline(
            draw,
            [line_pts[i], line_pts[i + 1]],
            width=3,
            dash_on=8,
            dash_off=5,
            color=lerp_color(t),
        )

    # ② 六圆盖住线下段  ③ 圆内代号
    r_circle = int(w * 0.048)
    f_code = load_font(int(r_circle * 0.95), bold=True)
    for code, sx, sy in SRC_STOPS:
        cx, cy = tpt(sx, sy)
        cx, cy = int(cx), int(cy)
        draw.ellipse(
            [cx - r_circle, cy - r_circle, cx + r_circle, cy + r_circle],
            fill=CIRCLE_FILL,
            outline=CIRCLE_STROKE,
            width=3,
        )
        draw.ellipse(
            [cx - r_circle + 4, cy - r_circle + 4, cx + r_circle - 4, cy + r_circle - 4],
            outline=(210, 220, 225),
            width=1,
        )
        bbox = draw.textbbox((0, 0), code, font=f_code)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((cx - tw / 2, cy - th / 2 - 1), code, fill=TEXT_IN_CIRCLE, font=f_code)

    return img


def main() -> int:
    frame = render_frame(W, H)
    if SCALE_OUT > 1:
        frame = frame.resize((W * SCALE_OUT, H * SCALE_OUT), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frame.save(OUT, "PNG", optimize=True)
    print(f"[OK] wrote {OUT} ({frame.size[0]}x{frame.size[1]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
