"""四格条带：各单元 clean / dialogue 处理与气泡文案。"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageStat

# 复用 finish 脚本中的绘图工具（导入时由 finish-unit-strip 注入）
_draw_bubble: Callable[..., None]
_draw_mood_text_small: Callable[..., None]
_draw_dept_caption_circle: Callable[..., None]
_remove_corner_watermark: Callable[[Image.Image], None]
_cover_rect: Callable[..., None]
_blend_tone_from_ref: Callable[..., None]
_load_font: Callable[[int], ImageFont.FreeTypeFont]


def bind_draw_helpers(**kwargs: Any) -> None:
    global _draw_bubble, _draw_mood_text_small, _draw_dept_caption_circle
    global _remove_corner_watermark, _cover_rect, _blend_tone_from_ref, _load_font
    for k, v in kwargs.items():
        globals()[f"_{k}" if not k.startswith("_") else k] = v


GURUMI_ROIS: dict[int, tuple[int, int, int, int]] = {
    1: (400, 150, 740, 540),
    2: (340, 140, 640, 520),
    3: (330, 170, 620, 540),
    4: (260, 190, 540, 500),
}

PROP_ROIS: dict[int, tuple[int, int, int, int]] = {
    1: (600, 380, 760, 540),
    2: (80, 360, 200, 520),
    3: (520, 400, 680, 540),
    4: (480, 380, 620, 520),
}


def _u1_p1_clean(img: Image.Image) -> None:
    """源图经 apply-unit1-liked-sources.py 已去块；此处仅水印。"""
    _remove_corner_watermark(img)


def _u1_p2_clean(img: Image.Image) -> None:
    _remove_corner_watermark(img)


def _u1_p3_clean(img: Image.Image) -> None:
    _remove_corner_watermark(img)


def _u1_p4_clean(img: Image.Image, *, ref_warm: Image.Image | None = None) -> None:
    _remove_corner_watermark(img)
    if ref_warm is not None:
        _blend_tone_from_ref(img, ref_warm, strength=0.28)
        w, h = img.size
        px = img.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                px[x, y] = (
                    min(255, int(r * 1.06 + 8)),
                    min(255, int(g * 1.04 + 6)),
                    min(255, int(b * 1.02 + 4)),
                )


def _u2_p_clean(img: Image.Image) -> None:
    _remove_corner_watermark(img)


def _u2_p4_clean(img: Image.Image, *, ref_warm: Image.Image | None = None) -> None:
    _u2_p_clean(img)
    w, h = img.size
    if ref_warm is not None:
        _blend_tone_from_ref(img, ref_warm, strength=0.22)
        px = img.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                px[x, y] = (
                    min(255, int(r * 1.05 + 6)),
                    min(255, int(g * 1.03 + 5)),
                    min(255, int(b * 1.01 + 3)),
                )


def _u3_p4_clean(img: Image.Image, *, ref_warm: Image.Image | None = None) -> None:
    _u2_p_clean(img)
    w, h = img.size
    if ref_warm is not None:
        _blend_tone_from_ref(img, ref_warm, strength=0.18)
        px = img.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]
                px[x, y] = (
                    min(255, int(r * 1.04 + 5)),
                    min(255, int(g * 1.03 + 4)),
                    min(255, int(b * 1.02 + 3)),
                )


_UNIT234_CLEAN = [_u2_p_clean, _u2_p_clean, _u2_p_clean]

UNIT_CLEAN: dict[int, list[Callable[..., None]]] = {
    1: [_u1_p1_clean, _u1_p2_clean, _u1_p3_clean],
    2: _UNIT234_CLEAN,
    3: _UNIT234_CLEAN,
    4: _UNIT234_CLEAN,
    5: _UNIT234_CLEAN,
    6: _UNIT234_CLEAN,
}

UNIT_P4_CLEAN: dict[int, Callable[..., None]] = {
    1: _u1_p4_clean,
    2: _u2_p4_clean,
    3: _u3_p4_clean,
    4: _u3_p4_clean,
    5: _u3_p4_clean,
    6: _u3_p4_clean,
}


def _dlg(img: Image.Image, specs: list[tuple]) -> None:
    for spec in specs:
        _draw_bubble(img, spec[0], spec[1], **spec[2])


UNIT_DIALOGUE: dict[int, list[Callable[[Image.Image], None]]] = {
    1: [
        lambda img: _dlg(
            img,
            [
                ((24, 28), "はじめまして。\nわたしは田中です。", {"side": "left", "max_w": 210}),
                ((1000, 380), "はじめまして。\nわたしは李です。\n中国人です。", {"side": "right", "is_gurumi": True, "max_w": 200}),
                ((24, 200), "李さんは学生ですか。", {"side": "left", "max_w": 180, "font_size": 16}),
                ((1000, 500), "いいえ、学生じゃありません。\n会社員です。", {"side": "right", "is_gurumi": True, "max_w": 200, "font_size": 16}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((20, 40), "これは何ですか。", {"side": "left", "max_w": 160}),
                ((1000, 320), "これは本です。", {"side": "right", "is_gurumi": True, "max_w": 140}),
                ((20, 180), "それは何ですか。", {"side": "left", "max_w": 160}),
                ((1000, 450), "それはノートです。", {"side": "right", "is_gurumi": True, "max_w": 150}),
            ],
        ),
        lambda img: (
            _draw_dept_caption_circle(img, (900, 118), "ここはデパートです。"),
            _dlg(
                img,
                [
                    ((16, 36), "すみません、\n図書館はどこですか。", {"side": "left", "max_w": 190, "font_size": 16}),
                    ((1000, 280), "図書館はあそこです。", {"side": "right", "is_gurumi": True, "max_w": 175, "font_size": 16}),
                    ((16, 200), "食堂はどこですか。", {"side": "left", "max_w": 160, "font_size": 16}),
                    ((1000, 400), "食堂はここです。", {"side": "right", "is_gurumi": True, "max_w": 150, "font_size": 16}),
                ],
            ),
        ),
        lambda img: (
            _draw_mood_text_small(img, (int(img.size[0] * 0.20), int(img.size[1] * 0.56)), "明日も頑張ろう"),
            _dlg(
                img,
                [
                    ((20, 36), "部屋に何がありますか。", {"side": "left", "max_w": 200, "font_size": 16}),
                    ((1000, 300), "机と椅子があります。", {"side": "right", "is_gurumi": True, "max_w": 190, "font_size": 16}),
                    ((20, 160), "テレビはありますか。", {"side": "left", "max_w": 170, "font_size": 16}),
                    (
                        (1000, 440),
                        "はい、あります。\nパソコンもあります。",
                        {"side": "right", "is_gurumi": True, "max_w": 200, "font_size": 15},
                    ),
                ],
            ),
        ),
    ],
    2: [
        lambda img: _dlg(
            img,
            [
                ((20, 32), "李さんは毎日何で\n来ますか。", {"side": "left", "max_w": 195, "font_size": 16}),
                ((1000, 300), "毎日バスで来ます。", {"side": "right", "is_gurumi": True, "max_w": 175, "font_size": 16}),
                ((20, 155), "何時に着きますか。", {"side": "left", "max_w": 170, "font_size": 16}),
                ((1000, 420), "八時半ごろ着きます。", {"side": "right", "is_gurumi": True, "max_w": 185, "font_size": 16}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((18, 34), "土曜日に映画を\n見ませんか。", {"side": "left", "max_w": 190, "font_size": 16}),
                ((1000, 280), "はい、土曜日の三時は\nどうですか。", {"side": "right", "is_gurumi": True, "max_w": 200, "font_size": 15}),
                ((18, 168), "どこで会いますか。", {"side": "left", "max_w": 165, "font_size": 16}),
                ((1000, 430), "駅の前で会いましょう。", {"side": "right", "is_gurumi": True, "max_w": 195, "font_size": 16}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((18, 36), "いらっしゃいませ。", {"side": "left", "max_w": 175, "font_size": 16}),
                (
                    (1000, 260),
                    "すみません、この\nカメラはいくらですか。",
                    {"side": "right", "is_gurumi": True, "max_w": 200, "font_size": 15},
                ),
                ((18, 155), "三万円です。", {"side": "left", "max_w": 150, "font_size": 16}),
                ((1000, 400), "少し高いですね。", {"side": "right", "is_gurumi": True, "max_w": 165, "font_size": 16}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((18, 34), "昨日勉強しましたか。", {"side": "left", "max_w": 200, "font_size": 16}),
                ((1000, 280), "いいえ、勉強しませんでした。", {"side": "right", "is_gurumi": True, "max_w": 210, "font_size": 15}),
                ((18, 155), "今日は頑張ってください。", {"side": "left", "max_w": 210, "font_size": 15}),
                ((1000, 420), "はい、頑張ります。", {"side": "right", "is_gurumi": True, "max_w": 170, "font_size": 16}),
            ],
        ),
    ],
    3: [
        lambda img: _dlg(
            img,
            [
                ((18, 32), "この四川料理は\n辛いですか。", {"side": "left", "max_w": 195, "font_size": 16}),
                ((1000, 280), "はい、とても辛いです。", {"side": "right", "is_gurumi": True, "max_w": 185, "font_size": 16}),
                ((18, 155), "おいしいですか。", {"side": "left", "max_w": 165, "font_size": 16}),
                ((1000, 420), "はい、おいしいです。", {"side": "right", "is_gurumi": True, "max_w": 175, "font_size": 16}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((18, 34), "京都の紅葉は\n有名ですね。", {"side": "left", "max_w": 195, "font_size": 16}),
                ((1000, 280), "はい、とても有名です。", {"side": "right", "is_gurumi": True, "max_w": 195, "font_size": 16}),
                ((18, 155), "きれいですね。", {"side": "left", "max_w": 150, "font_size": 16}),
                ((1000, 420), "はい、とてもきれいです。", {"side": "right", "is_gurumi": True, "max_w": 210, "font_size": 15}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((18, 34), "小野さんは歌が\n好きです。", {"side": "left", "max_w": 190, "font_size": 16}),
                ((1000, 280), "はい、歌が上手です。", {"side": "right", "is_gurumi": True, "max_w": 185, "font_size": 16}),
                ((18, 155), "李さんも歌が\n好きですか。", {"side": "left", "max_w": 185, "font_size": 16}),
                ((1000, 420), "いいえ、聞くのが\n好きです。", {"side": "right", "is_gurumi": True, "max_w": 195, "font_size": 15}),
            ],
        ),
        lambda img: _dlg(
            img,
            [
                ((16, 32), "李さんと森さんと\nどちらが若いですか。", {"side": "left", "max_w": 210, "font_size": 15}),
                ((1000, 270), "李さんは森さんより\n若いです。", {"side": "right", "is_gurumi": True, "max_w": 200, "font_size": 15}),
                ((16, 158), "どちらが背が高いですか。", {"side": "left", "max_w": 205, "font_size": 16}),
                ((1000, 410), "森さんのほうが\n高いです。", {"side": "right", "is_gurumi": True, "max_w": 195, "font_size": 15}),
            ],
        ),
    ],
}

SUPPORTED_UNITS = frozenset(UNIT_CLEAN.keys())
