"""通关全家福 · 4×6 格序（北↑南↓ · 列=春夏秋冬）。"""
from __future__ import annotations

# 行 0 = 最北（画面上方），行 5 = 最南（画面下方）
# 列 0–3 = 春 · 夏 · 秋 · 冬
# 值为原卡片编号（确认版 1.png…24.png 的场景 ID，不重排源文件）

GRAND_SLATE: list[list[int]] = [
    [24, 3, 5, 1],   # 北：高山祭春 · ねぶた夏 · 日光秋 · 流冰冬
    [8, 6, 9, 2],    # 东北/北陆：兼六园春 · 松岛夏 · 清水秋 · 小樽冬
    [13, 10, 14, 4],  # 近畿：姬路春 · 伏见夏 · 东大寺秋 · 白川冬
    [17, 15, 16, 7],  # 四国/中国：道后春 · 严岛夏 · 金刀比罗秋 · 富士冬
    [19, 18, 20, 21],  # 九州：熊本春 · 阿波夏 · 别府秋 · 屋久岛秋
    [12, 11, 22, 23],  # 南：祇园春 · 岚山夏 · 首里秋 · 长崎灯笼冬
]

SEASON_COL_ZH = ("春", "夏", "秋", "冬")
LATITUDE_ROW_ZH = (
    "北（北海道·东北）",
    "东北/北陆",
    "近畿",
    "四国·中国",
    "九州",
    "南（冲绳·南九州）",
)


def slate_flat_row_major() -> list[int]:
    """合成粘贴顺序：自上而下、每行自左（春）至右（冬）。"""
    out: list[int] = []
    for row in GRAND_SLATE:
        out.extend(row)
    return out


def card_grid_position(card_id: int) -> tuple[int, int] | None:
    """返回 (col, row) 0-based。"""
    for row_i, row in enumerate(GRAND_SLATE):
        for col_i, cid in enumerate(row):
            if cid == card_id:
                return col_i, row_i
    return None
