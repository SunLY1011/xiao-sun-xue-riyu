# -*- coding: utf-8 -*-
"""从 matome-50katakana 两册 PDF 拆解 46 清音片假名 · 不修改 PDF。

真源：
  书写板块/真源/04-片假名-PhaseB/matome-50katakana-a-no.pdf   （ア〜ノ · 25 页）
  书写板块/真源/04-片假名-PhaseB/matome-50katakana-ha-nn.pdf （ハ〜ン · 21 页）

裁切规则（与平假名なぞりがき一致）：
  · panel：PDF 矢量粉框 · 页顶右方分色笔顺格（とめる／はらう／はねる）
  · trace：主练习格右上 2×2 描红区
  · 排除：插图例词区、左侧竖练列、页脚版权

输出：
  assets/write-nazorigaki/kata/{hex}-panel.png
  assets/write-nazorigaki/kata/{hex}-trace.png
  书写板块/data/kana-nazorigaki-kata-meta.json
  js/data/kana-nazorigaki-kata-meta.js
  js/data/kana-nazorigaki-kata-manifest.js
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
PDF_A_NO = ROOT / "书写板块" / "真源" / "04-片假名-PhaseB" / "matome-50katakana-a-no.pdf"
PDF_HA_NN = ROOT / "书写板块" / "真源" / "04-片假名-PhaseB" / "matome-50katakana-ha-nn.pdf"
OUT_DIR = ROOT / "assets" / "write-nazorigaki" / "kata"
META_JSON = ROOT / "书写板块" / "data" / "kana-nazorigaki-kata-meta.json"
META_JS = ROOT / "js" / "data" / "kana-nazorigaki-kata-meta.js"
MANIFEST = ROOT / "js" / "data" / "kana-nazorigaki-kata-manifest.js"

SEION_HIRA = [
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

HIRA_TO_KATA = str.maketrans(
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
)

ROW_PEERS_HIRA: dict[str, list[str]] = {
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
SCALE = 3.0

# 描红 2×2 · 按 PDF 版心（a-no 与 ha-nn 右移量不同）
FALLBACK_TRACE = {
    "a-no": fitz.Rect(334.6, 260.2, 540.8, 466.0),
    "ha-nn": fitz.Rect(366.1, 260.2, 572.0, 466.0),
}


def to_katakana(hira: str) -> str:
    return hira.translate(HIRA_TO_KATA)


def hex_name(kana: str, suffix: str = "panel") -> str:
    return f"{ord(kana):04x}-{suffix}.png"


def row_label_hira(kana: str) -> str:
    for label, peers in ROW_PEERS_HIRA.items():
        if kana in peers:
            return label
    return "ん"


def row_peers_kata(kana: str) -> list[str]:
    peers = ROW_PEERS_HIRA.get(row_label_hira(kana), [kana])
    return [to_katakana(p) for p in peers]


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def _is_kata_frame_pink(color: tuple[float, float, float] | None) -> bool:
    if not color:
        return False
    r, g, b = color
    return r > 0.85 and g < 0.2 and 0.4 < b < 0.7


def pink_frame_rects(page: fitz.Page) -> list[fitz.Rect]:
    rects: list[fitz.Rect] = []
    for d in page.get_drawings():
        if not _is_kata_frame_pink(d.get("color")):
            continue
        r = d.get("rect")
        if r:
            rects.append(fitz.Rect(r))
    return rects


def find_panel_rect(page: fitz.Page) -> fitz.Rect:
    page_h = page.rect.height
    candidates = [
        r
        for r in pink_frame_rects(page)
        if r.y1 < page_h * 0.28 and r.width > 120 and r.height > 120 and abs(r.width - r.height) < 25
    ]
    if candidates:
        return min(candidates, key=lambda r: r.y0)
    return fitz.Rect(392.5, 41.9, 538.9, 188.3)


def find_trace_rect(page: fitz.Page, source_key: str) -> fitz.Rect:
    return FALLBACK_TRACE.get(source_key, FALLBACK_TRACE["a-no"])


def parse_page_meta(page: fitz.Page, hira: str) -> dict:
    raw = page.get_text("text")
    joined = raw.replace("\n", "").replace(" ", "")
    techniques = [t for t in TECHNIQUES if t in joined]
    kata = to_katakana(hira)
    peers_kata = row_peers_kata(hira)
    peers_joined = "".join(peers_kata)
    r = page.rect

    examples: list[str] = []
    for b in page.get_text("dict")["blocks"]:
        if b.get("type") != 0:
            continue
        x0, y0, _, _ = b["bbox"]
        if x0 > r.width * 0.72 or y0 > r.height * 0.42:
            continue
        t = "".join(s["text"] for l in b["lines"] for s in l["spans"]).strip()
        t = re.sub(r"\s+", "", t)
        if t in TECHNIQUES or t == peers_joined or "かたかな" in t:
            continue
        if "幼児" in t or "http" in t or "YAHOO" in t:
            continue
        if re.fullmatch(r"[\u30a0-\u30ffー]{2,8}", t) and t not in examples:
            examples.append(t)

    return {
        "hira": hira,
        "kana": kata,
        "examples": examples[:2],
        "techniques": techniques,
        "rowLabel": row_label_kata(hira),
        "rowPeers": peers_kata,
        "strokeCount": max(1, raw.count("→")),
    }


def row_label_kata(kana: str) -> str:
    h = row_label_hira(kana)
    if h == "ん":
        return "ン"
    return to_katakana(h[0]) + "行"


def extract_pdf(pdf: Path, source_key: str, hira_list: list[str], page_offset: int, meta: dict, manifest: dict) -> None:
    doc = fitz.open(pdf)
    if doc.page_count < len(hira_list):
        print(f"[FAIL] {pdf.name} 仅 {doc.page_count} 页，需要 {len(hira_list)}")
        doc.close()
        return

    for i, hira in enumerate(hira_list):
        page = doc[i]
        kata = to_katakana(hira)
        panel_rect = find_panel_rect(page)
        trace_rect = find_trace_rect(page, source_key)
        assets: dict[str, str] = {}
        for key, rect in (("panel", panel_rect), ("trace", trace_rect)):
            pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), clip=rect, alpha=False)
            fname = hex_name(kata, key)
            out_path = OUT_DIR / fname
            pix.save(str(out_path))
            assets[key] = rel(out_path)

        parsed = parse_page_meta(page, hira)
        entry = {
            "kana": kata,
            "hira": hira,
            "page": page_offset + i + 1,
            "source": pdf.name,
            "assets": assets,
            **{k: v for k, v in parsed.items() if k not in ("hira", "kana")},
        }
        meta[hira] = entry
        manifest[hira] = assets["panel"]
        print(f"[OK] p{page_offset + i + 1:02d} {kata} ({hira}) examples={parsed['examples']} tech={parsed['techniques']}")

    doc.close()


def main() -> int:
    if not PDF_A_NO.is_file():
        print(f"[FAIL] 缺少 PDF: {PDF_A_NO}")
        return 1
    if not PDF_HA_NN.is_file():
        print(f"[FAIL] 缺少 PDF: {PDF_HA_NN}")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    META_JSON.parent.mkdir(parents=True, exist_ok=True)

    hira_a_no = SEION_HIRA[:25]
    hira_ha_nn = SEION_HIRA[25:]

    meta: dict[str, dict] = {}
    manifest: dict[str, str] = {}

    extract_pdf(PDF_A_NO, "a-no", hira_a_no, 0, meta, manifest)
    extract_pdf(PDF_HA_NN, "ha-nn", hira_ha_nn, 25, meta, manifest)

    if len(meta) != len(SEION_HIRA):
        print(f"[FAIL] 仅提取 {len(meta)}/{len(SEION_HIRA)} 字")
        return 1

    META_JSON.write_text(
        json.dumps({"schema": "hyouga-nazorigaki-kata/v1", "count": len(meta), "chars": meta}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    js_meta = (
        "/** 片假名なぞりがき · 由 extract-nazorigaki-kata.py 从 PDF 解析 · 勿手改 */\n"
        "const KANA_NAZORIGAKI_KATA_META = "
        + json.dumps(meta, ensure_ascii=False, indent=2)
        + ";\n"
    )
    META_JS.write_text(js_meta, encoding="utf-8")

    js_manifest = (
        "/** 片假名なぞりがき · 分色笔顺格路径 · 由 extract-nazorigaki-kata.py 生成 */\n"
        "const KANA_NAZORIGAKI_KATA = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n"
    )
    MANIFEST.write_text(js_manifest, encoding="utf-8")

    print(f"[OK] {len(meta)} chars -> {META_JSON}")
    print(f"[OK] manifest -> {MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
