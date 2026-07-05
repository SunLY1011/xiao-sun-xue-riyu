"""通关全家福 · 4×6 手机一屏网格（竖屏 · 北↑南↓ · 列=春夏秋冬）。"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from grand_finale_slate import GRAND_SLATE, slate_flat_row_major

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
GRAND = STORY / "grand"
EGG_TXT = ROOT / "彩蛋" / "通关全家福.txt"
EGG_TXT_FALLBACK = ROOT / "彩蛋" / "通关隐藏版-确认版" / "通关隐藏版全家福md.txt"
# 通关 L3 真源图（禁止 AI 重绘替换；仅允许裁切/合成）
CONFIRMED_GRAND_DIR = ROOT / "彩蛋" / "通关隐藏版-确认版"
EGG_OUT = ROOT / "彩蛋" / "grand"

# 4 列（春夏秋冬）× 6 行（南→北，行 0 在北）
COLS = 4
ROWS = 6
CARD_COUNT = 24

# 手机竖屏一屏：1080×1620（2:3），每格正方形 270×270（源图 3:2 居中裁切）
CELL_SIZE = 270
OUT_W, OUT_H = COLS * CELL_SIZE, ROWS * CELL_SIZE  # 1080×1620

# 旧版横条 8×3 仅作归档参考
LEGACY_COLS, LEGACY_ROWS = 8, 3
LEGACY_OUT_W, LEGACY_OUT_H = 7680, 1620

EGG_GRAND = STORY / "egg-grand.webp"
EGG_GRAND_DRAFT = STORY / "egg-grand-draft.webp"
EGG_GRAND_PREVIEW = STORY / "egg-grand-preview.jpg"


def resolve_egg_txt() -> Path | None:
    for p in (EGG_TXT, EGG_TXT_FALLBACK):
        if p.is_file():
            return p
    return None


def card_path(n: int, suffix: str = "draft") -> Path:
    """n: 1..24（场景 ID，与确认版 N.png 一致）"""
    return GRAND / f"card-{n:02d}-{suffix}.png"


def compose_card_order() -> list[int]:
    """按 slate 顺序列出要贴入画布的 card id。"""
    return slate_flat_row_major()


def confirmed_source_path(card_id: int) -> Path:
    """确认版场景原图（与 N.png 编号一致）。"""
    return CONFIRMED_GRAND_DIR / f"{card_id}.png"


# 正方形裁切焦点：在可滑动范围内的比例 (0=左/上, 0.5=居中, 1=右/下)
# 仅对需保留主人公/构图的格位单独配置，其余默认居中。
GRAND_CELL_CROP_FOCUS: dict[int, tuple[float, float]] = {
    # 第 5 行第 1 列 · GRAND_SLATE[4][0] · card 19 熊本城 — 主人公在画面左下
    19: (0.0, 0.5),
}


def crop_focus_for(card_id: int) -> tuple[float, float]:
    return GRAND_CELL_CROP_FOCUS.get(int(card_id), (0.5, 0.5))


def fit_cell_square(
    im: Image.Image,
    size: int,
    *,
    focus: tuple[float, float] | None = None,
    card_id: int | None = None,
) -> Image.Image:
    """按焦点裁切为正方形（默认居中）。横图裁宽、竖图裁高。"""
    if focus is None and card_id is not None:
        focus = crop_focus_for(card_id)
    if focus is None:
        focus = (0.5, 0.5)
    fx = max(0.0, min(1.0, float(focus[0])))
    fy = max(0.0, min(1.0, float(focus[1])))

    im = im.convert("RGB")
    iw, ih = im.size
    if iw >= ih:
        side = ih
        extra = iw - side
        x0 = int(round(extra * fx))
        y0 = int(round((ih - side) * fy)) if ih > side else 0
    else:
        side = iw
        extra = ih - side
        x0 = int(round((iw - side) * fx)) if iw > side else 0
        y0 = int(round(extra * fy))

    x0 = max(0, min(x0, iw - side))
    y0 = max(0, min(y0, ih - side))
    im = im.crop((x0, y0, x0 + side, y0 + side))
    return im.resize((size, size), Image.Resampling.LANCZOS)
