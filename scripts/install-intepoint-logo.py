# -*- coding: utf-8 -*-
"""从 INTEPOINT 品牌目录安装 logo 到 H5 + 小程序壳。

默认源：`logo/logo.png`（完整壳图标）或 `logo/INTEPOINT-logo-PNG.png`

用法：
  python scripts/install-intepoint-logo.py
  python scripts/install-intepoint-logo.py --src logo/logo.png
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC_DIR = ROOT / "logo"
BRAND = ROOT / "assets" / "brand"
ICON_OUT = BRAND / "intepoint-logo-icon.png"
FULL_OUT = BRAND / "intepoint-logo-full.png"
MINIAPP = ROOT / "japanese_learning_miniapp" / "assets" / "logo.png"
APP_ICON = ROOT / "icons" / "icon.png"

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".svg"}


def find_logo_file(src_dir: Path) -> Path | None:
    if not src_dir.is_dir():
        return None
    skip_parts = ("产品概念", "概念图", "5-15", "5-09", "X-产品", "灵境")
    prefer_parts = ("logo", "品牌", "公司宣传", "intepoint", "INTEPOINT")
    scored: list[tuple[int, Path]] = []
    for p in src_dir.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".png", ".webp", ".jpg", ".jpeg"}:
            continue
        path_s = str(p)
        if any(x in path_s for x in skip_parts):
            continue
        sz = p.stat().st_size
        if sz > 3_000_000:
            continue
        score = 0
        low = p.stem.lower()
        if "logo" in low or "intepoint" in low:
            score += 100
        if any(x.lower() in path_s.lower() for x in prefer_parts):
            score += 40
        if sz < 800_000:
            score += 20
        scored.append((score, p))
    if not scored:
        return None
    scored.sort(key=lambda t: (t[0], -t[1].stat().st_size), reverse=True)
    return scored[0][1]


def crop_square_content(img):
    """横版画布裁出图标正方形。"""
    from PIL import Image

    img = img.convert("RGBA")
    w, h = img.size
    if w == h:
        return img
    px = img.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 20 and not (r > 240 and g > 240 and b > 240):
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx <= minx or maxy <= miny:
        side = min(w, h)
        l = (w - side) // 2
        t = (h - side) // 2
        return img.crop((l, t, l + side, t + side))
    side = max(maxx - minx + 1, maxy - miny + 1)
    cx = (minx + maxx) // 2
    cy = (miny + maxy) // 2
    l = max(0, cx - side // 2)
    t = max(0, cy - side // 2)
    r = min(w, l + side)
    b = min(h, t + side)
    if r - l < side:
        l = max(0, r - side)
    if b - t < side:
        t = max(0, b - side)
    return img.crop((l, t, l + side, t + side))


def extract_emblem_from_shell_square(sq):
    """从海军蓝区内提取白色 emblem；边缘白底 flood-fill 剔除，四角透明。"""
    from collections import deque
    from PIL import Image

    img = sq.convert("RGBA")
    w, h = img.size
    inset = max(2, int(w * 0.11))
    inner = img.crop((inset, inset, w - inset, h - inset))
    iw, ih = inner.size
    px = inner.load()

    def is_white_ink(r, g, b, a):
        return a > 20 and r > 200 and g > 200 and b > 200 and max(r, g, b) - min(r, g, b) < 45

    white = [[False] * iw for _ in range(ih)]
    for y in range(ih):
        for x in range(iw):
            if is_white_ink(*px[x, y]):
                white[y][x] = True

    bg = [[False] * iw for _ in range(ih)]
    q = deque()
    for x in range(iw):
        for y in (0, ih - 1):
            if white[y][x] and not bg[y][x]:
                bg[y][x] = True
                q.append((x, y))
    for y in range(ih):
        for x in (0, iw - 1):
            if white[y][x] and not bg[y][x]:
                bg[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < iw and 0 <= ny < ih and white[ny][nx] and not bg[ny][nx]:
                bg[ny][nx] = True
                q.append((nx, ny))

    out = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    po = out.load()
    for y in range(ih):
        for x in range(iw):
            if white[y][x] and not bg[y][x]:
                po[x, y] = (255, 255, 255, 255)

    bbox = out.getbbox()
    if not bbox:
        return out
    emblem = out.crop(bbox)
    pad = max(2, int(max(emblem.size) * 0.04))
    side = max(emblem.size) + pad * 2
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))
    return square


def install_full_app_icon(src: Path) -> None:
    from PIL import Image

    img = Image.open(src).convert("RGBA")
    square = crop_square_content(img)
    shell512 = square.resize((512, 512), Image.Resampling.LANCZOS)
    emblem512 = extract_emblem_from_shell_square(square).resize((512, 512), Image.Resampling.LANCZOS)
    BRAND.mkdir(parents=True, exist_ok=True)
    shell512.save(BRAND / "intepoint-logo-app-shell.png", "PNG", optimize=True)
    emblem512.save(BRAND / "intepoint-logo-emblem.png", "PNG", optimize=True)
    emblem512.save(ICON_OUT, "PNG", optimize=True)
    img.save(FULL_OUT, "PNG", optimize=True)
    for path, size in ((MINIAPP, 192), (APP_ICON, 192)):
        path.parent.mkdir(parents=True, exist_ok=True)
        shell512.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG", optimize=True)
    print(f"[OK] app-shell <- {src.name} (square crop)")
    print(f"[OK] emblem -> {BRAND / 'intepoint-logo-emblem.png'}")
    print(f"[OK] {MINIAPP}")
    print(f"[OK] {APP_ICON}")


def process_raster(src: Path) -> None:
    from PIL import Image

    img = Image.open(src).convert("RGBA")
    w, h = img.size
    cut = int(h * 0.62)
    icon = img.crop((0, 0, w, cut))
    bbox = icon.getbbox()
    if bbox:
        icon = icon.crop(bbox)
    iw, ih = icon.size
    side = max(iw, ih)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(icon, ((side - iw) // 2, (side - ih) // 2))
    icon512 = square.resize((512, 512), Image.Resampling.LANCZOS)
    BRAND.mkdir(parents=True, exist_ok=True)
    img.save(FULL_OUT, "PNG", optimize=True)
    icon512.save(ICON_OUT, "PNG", optimize=True)
    print(f"[OK] full  -> {FULL_OUT} ({FULL_OUT.stat().st_size} B)")
    print(f"[OK] icon -> {ICON_OUT} ({ICON_OUT.stat().st_size} B)")
    print("[i] 橘框壳图标请再运行: python scripts/build-shell-app-icon.py")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", help="单个 logo 图片路径")
    ap.add_argument("--dir", default=str(DEFAULT_SRC_DIR), help="扫描目录")
    args = ap.parse_args()

    src_file: Path | None = None
    if args.src:
        src_file = Path(args.src)
    else:
        src_file = find_logo_file(Path(args.dir))

    if not src_file or not src_file.is_file():
        fallback = BRAND / "intepoint-logo-full-source.png"
        if fallback.is_file():
            src_file = fallback
            print(f"[WARN] 未在 {args.dir} 找到 logo，使用已缓存 {fallback.name}")
        else:
            raise SystemExit(
                f"未找到 logo 文件。请指定 --src 或将 PNG 放入：\n  {DEFAULT_SRC_DIR}"
            )

    if src_file.suffix.lower() == ".svg":
        shutil.copy2(src_file, ROOT / "icons" / "icon.svg")
        print(f"[OK] svg -> icons/icon.svg（栅格请另提供 PNG）")
        return

    if src_file.name.lower() == "logo.png" and "logo" in str(src_file.parent).lower():
        install_full_app_icon(src_file)
        return

    process_raster(src_file)


if __name__ == "__main__":
    main()
