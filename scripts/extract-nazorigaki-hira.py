# -*- coding: utf-8 -*-
"""从 hiragana_nazorigaki2015.pdf 拆解 46 清音 · 不修改 PDF。

真源：书写板块/真源/01-平假名-QA/hiragana_nazorigaki2015.pdf

裁切规则（与 QA 模板一致）：
  · panel：PDF 矢量粉框 get_drawings() · 页顶居中正方格（含分色笔、序号、とめる／はらう／はねる）
  · trace：PDF 矢量粉框 · 底部 2×2 描红区
  · 排除：左上例词、右侧行对照、页外白边

输出：
  assets/write-nazorigaki/hira/{hex}-panel.png   分色笔顺大格
  assets/write-nazorigaki/hira/{hex}-trace.png   底部描红格（2×2 合成）
  书写板块/data/kana-nazorigaki-meta.json
  js/data/kana-nazorigaki-meta.js
  js/data/kana-nazorigaki-manifest.js
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "书写板块" / "真源" / "01-平假名-QA" / "hiragana_nazorigaki2015.pdf"
OUT_DIR = ROOT / "assets" / "write-nazorigaki" / "hira"
META_JSON = ROOT / "书写板块" / "data" / "kana-nazorigaki-meta.json"
META_JS = ROOT / "js" / "data" / "kana-nazorigaki-meta.js"
MANIFEST = ROOT / "js" / "data" / "kana-nazorigaki-manifest.js"

SEION_KANA = [
    "あ", "い", "う", "え", "お",
    "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の",
    "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も",
    "や", "ゆ", "よ",
    "ら", "り", "る", "れ", "ろ",
    "わ", "を",
    "ん",
]

ROW_PEERS: dict[str, list[str]] = {
    "あ行": ["あ", "い", "う", "え", "お"],
    "か行": ["か", "き", "く", "け", "こ"],
    "さ行": ["さ", "し", "す", "せ", "そ"],
    "た行": ["た", "ち", "つ", "て", "と"],
    "な行": ["な", "に", "ぬ", "ね", "の"],
    "は行": ["は", "ひ", "ふ", "へ", "ほ"],
    "ま行": ["ま", "み", "む", "め", "も"],
    "や行": ["や", "ゆ", "よ"],
    "ら行": ["ら", "り", "る", "れ", "ろ"],
    "わ行": ["わ", "を"],
    "ん": ["ん"],
}

TECHNIQUES = ("とめる", "はらう", "はねる")

# PDF 矢量粉框真值（happylilac 2015 · 46 页一致）· 检测失败时回退
FALLBACK_PANEL = fitz.Rect(134.7, 34.5, 427.5, 327.3)
FALLBACK_TRACE = fitz.Rect(55.6, 359.5, 505.4, 808.5)
SCALE = 3.0


def hex_name(kana: str, suffix: str = "panel") -> str:
    return f"{ord(kana):04x}-{suffix}.png"


def row_label(kana: str) -> str:
    for label, peers in ROW_PEERS.items():
        if kana in peers:
            return label
    return "ん"


def row_peers(kana: str) -> list[str]:
    return list(ROW_PEERS.get(row_label(kana), [kana]))


def parse_page_meta(page: fitz.Page, kana: str) -> dict:
    """从 PDF 文本层 + 区块坐标解析例词、笔锋、行内位置。"""
    raw = page.get_text("text")
    joined = raw.replace("\n", "").replace(" ", "")
    techniques = [t for t in TECHNIQUES if t in joined]
    peers = row_peers(kana)
    peers_joined = "".join(peers)
    r = page.rect

    examples: list[str] = []
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        x0, y0, _, _ = b["bbox"]
        if x0 > r.width * 0.38 or y0 > r.height * 0.52:
            continue
        t = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip()
        t = re.sub(r"\s+", "", t)
        if t in TECHNIQUES or t == peers_joined:
            continue
        if re.fullmatch(r"[ぁ-ん]{2,6}", t) and t not in examples:
            examples.append(t)

    stroke_guess = max(1, raw.count("→"))

    return {
        "examples": examples[:2],
        "techniques": techniques,
        "rowLabel": row_label(kana),
        "rowPeers": peers,
        "strokeCount": stroke_guess,
    }


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def _is_pink_stroke(color: tuple[float, float, float] | None) -> bool:
  """PDF stroke RGB · 粉框描边（非笔画鲑红）。"""
  if not color:
    return False
  r, g, b = color
  return r > 0.8 and g < 0.55 and b > 0.5


def pink_frame_rects(page: fitz.Page) -> list[fitz.Rect]:
  rects: list[fitz.Rect] = []
  for d in page.get_drawings():
    if not _is_pink_stroke(d.get("color")):
      continue
    r = d.get("rect")
    if r:
      rects.append(fitz.Rect(r))
  return rects


def find_panel_rect(page: fitz.Page) -> fitz.Rect:
  """页顶居中 · 单格分色笔顺（粉圆角方框内全部保留）。"""
  page_h = page.rect.height
  candidates = [
    r
    for r in pink_frame_rects(page)
    if r.y1 < page_h * 0.5 and r.width > 200 and r.height > 200 and abs(r.width - r.height) < 25
  ]
  if candidates:
    return min(candidates, key=lambda r: r.y0)
  return FALLBACK_PANEL


def find_trace_rect(page: fitz.Page) -> fitz.Rect:
  """底部 2×2 描红格（大粉框）。"""
  page_h = page.rect.height
  candidates = [r for r in pink_frame_rects(page) if r.y0 > page_h * 0.38 and r.width > 350]
  if candidates:
    return max(candidates, key=lambda r: r.width * r.height)
  return FALLBACK_TRACE


def main() -> int:
    if not PDF.is_file():
        print(f"[FAIL] 缺少 PDF: {PDF}")
        return 1

    doc = fitz.open(PDF)
    if doc.page_count < len(SEION_KANA):
        print(f"[FAIL] PDF 仅 {doc.page_count} 页，需要 {len(SEION_KANA)}")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    META_JSON.parent.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, str] = {}
    meta: dict[str, dict] = {}

    for i, kana in enumerate(SEION_KANA):
        page = doc[i]

        panel_rect = find_panel_rect(page)
        trace_rect = find_trace_rect(page)
        assets: dict[str, str] = {}
        for key, rect in (("panel", panel_rect), ("trace", trace_rect)):
            pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=rect, alpha=False)
            fname = hex_name(kana, key)
            out_path = OUT_DIR / fname
            pix.save(str(out_path))
            assets[key] = rel(out_path)

        parsed = parse_page_meta(page, kana)
        entry = {
            "kana": kana,
            "page": i + 1,
            "source": "hiragana_nazorigaki2015.pdf",
            "assets": assets,
            **parsed,
        }
        meta[kana] = entry
        manifest[kana] = assets["panel"]
        print(f"[OK] p{i + 1:02d} {kana} examples={parsed['examples']} tech={parsed['techniques']}")

    doc.close()

    META_JSON.write_text(
        json.dumps({"schema": "hyouga-nazorigaki/v1", "count": len(meta), "chars": meta}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    js_meta = (
        "/** 平假名なぞりがき · 由 extract-nazorigaki-hira.py 从 PDF 解析 · 勿手改 */\n"
        "const KANA_NAZORIGAKI_META = "
        + json.dumps(meta, ensure_ascii=False, indent=2)
        + ";\n"
    )
    META_JS.write_text(js_meta, encoding="utf-8")

    js_manifest = (
        "/** 平假名なぞりがき · 分色笔顺格路径 · 由 extract-nazorigaki-hira.py 生成 */\n"
        "const KANA_NAZORIGAKI_HIRA = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n"
    )
    MANIFEST.write_text(js_manifest, encoding="utf-8")

    print(f"[OK] {len(meta)} chars -> {META_JSON}")
    print(f"[OK] manifest -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
