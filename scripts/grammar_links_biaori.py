# -*- coding: utf-8 -*-
"""标日初级上 · 文法节点跨课 links（供 patch-grammar-links-biaori.py 写入 lessons-data）"""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFERENCE_MD = ROOT / "参考资料/03-语法补充/标日全24课语法对照表.md"

# 各课先修/延展一句话（标日单元脉络）
LESSON_PREV: dict[int, str] = {
    2: "第1课 · は…です／じゃありません",
    3: "第2课 · これ／その＋名词",
    4: "第3课 · ここ・そこ・あそこ",
    5: "第1–4课 · 名词句（です）",
    6: "第5课 · ます形・に时刻",
    7: "第6课 · へ・で・からまで",
    8: "第7课 · を・频率・邀请",
    9: "第5–8课 · ます形叙述",
    10: "第9课 · い形容词",
    11: "第10课 · な形容词",
    12: "第11课 · が好き・上手",
    13: "第12课 · 比较・のほうが",
    14: "第13课 · 数量词・に存在",
    15: "第14课 · て形",
    16: "第15课 · ています",
    17: "第16课 · て形连接",
    18: "第17课 · ほしい・たい",
    19: "第18课 · なる・变化",
    20: "第19课 · ない形",
    21: "第20课 · 可能形",
    22: "第21课 · た形・经验",
    23: "第22课 · 简体",
    24: "第23课 · たり・場合",
}

LESSON_NEXT: dict[int, str] = {
    2: "第3课 · 场所ここ系列",
    3: "第4课 · あります／います",
    4: "第5课 · 动词ます形",
    5: "第6课 · 移动へ・で",
    6: "第7课 · を宾语",
    7: "第8课 · で语言・授受",
    8: "第9课 · い形容词",
    9: "第10课 · な形容词",
    10: "第11课 · が好き",
    11: "第12课 · 比较",
    12: "第13课 · 助数词",
    13: "第14课 · て形",
    14: "第15课 · ています",
    15: "第16课 · 形容词て形",
    16: "第17课 · 愿望",
    17: "第18课 · 变化",
    18: "第19课 · ない形",
    19: "第20课 · 可能形",
    20: "第21课 · た形",
    21: "第22课 · 简体",
    22: "第23课 · たり",
    23: "第24课 · と思う・转述",
    24: "复习 · 初级上总结",
}

# 节点级覆盖（对比/重点跨课）
NODE_OVERRIDES: dict[str, list[dict]] = {
  # L1（仅数据 links；不动 lesson-1-flow 壳）
  "l1_g1": [
    {"type": "extension", "label": "🔗 第2课 · これ・その＋名词"},
  ],
  "l1_g2": [
    {"type": "prerequisite", "label": "→ 本课 · は…です（肯定）", "targetNodeId": "l1_g1"},
    {"type": "contrast", "label": "⚠️ 正式：ではありません；口语：じゃありません"},
  ],
  "l1_g3": [
    {"type": "prerequisite", "label": "→ 本课 · 肯定句", "targetNodeId": "l1_g1"},
    {"type": "extension", "label": "🔗 第2课 · これは…ですか"},
  ],
  "l1_g4": [
    {"type": "prerequisite", "label": "→ 本课 · は…です", "targetNodeId": "l1_g1"},
    {"type": "extension", "label": "🔗 第4课 · あります／います"},
  ],
  # U1
  "l2_g1": [
    {"type": "prerequisite", "label": "📖 第1课 · は…です"},
    {"type": "contrast", "label": "⚠️ これ＝物；ここ＝场所（第3课）"},
    {"type": "extension", "label": "🔗 第3课 · ここ・そこ"},
  ],
  "l2_g2": [
    {"type": "prerequisite", "label": "→ 本课 · これ／それ／あれ", "targetNodeId": "l2_g1"},
    {"type": "extension", "label": "🔗 第3课 · この→ここ（连体）"},
  ],
  "l2_g3": [
    {"type": "prerequisite", "label": "📖 第1课 · の（所属）"},
    {"type": "extension", "label": "🔗 第4课 · 存在句の上に"},
  ],
  "l2_g4": [
    {"type": "prerequisite", "label": "→ 本课 · この／その＋名词", "targetNodeId": "l2_g2"},
    {"type": "extension", "label": "🔗 第12课 · どれが（比较疑问）"},
  ],
  "l3_g1": [
    {"type": "prerequisite", "label": "📖 第2课 · これ／それ（物）"},
    {"type": "contrast", "label": "⚠️ ここ＝场所；これ＝物品"},
    {"type": "extension", "label": "🔗 第4课 · に存在"},
  ],
  "l3_g2": [
    {"type": "prerequisite", "label": "→ 本课 · ここ／そこ", "targetNodeId": "l3_g1"},
    {"type": "extension", "label": "🔗 第6课 · どこへ行きますか"},
  ],
  "l3_g3": [
    {"type": "prerequisite", "label": "📖 第1课 · は…ですか"},
    {"type": "extension", "label": "🔗 第16课 · が新信息提示"},
  ],
  "l4_g1": [
    {"type": "prerequisite", "label": "📖 第3课 · は…です（场所）"},
    {"type": "contrast", "label": "⚠️ あります＝无生命；います＝有生命"},
    {"type": "extension", "label": "🔗 第13课 · に＋数量"},
  ],
  "l4_g2": [
    {"type": "prerequisite", "label": "→ 本课 · あります", "targetNodeId": "l4_g1"},
    {"type": "extension", "label": "🔗 第13课 · 机の上に本が三冊"},
  ],
  # U2
  "l5_g1": [
    {"type": "prerequisite", "label": "📖 第1–4课 · 名词句です"},
    {"type": "extension", "label": "🔗 第7课 · 动词分类・を"},
  ],
  "l5_g3": [
    {"type": "prerequisite", "label": "→ 本课 · ます形", "targetNodeId": "l5_g1"},
    {"type": "contrast", "label": "⚠️ ×毎朝に起きる → ○毎朝起きる"},
  ],
  "l6_g3": [
    {"type": "prerequisite", "label": "📖 第5课 · に时刻"},
    {"type": "contrast", "label": "⚠️ 交通で（本课）≠ 语言で（第8课）"},
    {"type": "extension", "label": "🔗 第8课 · 日本語で"},
  ],
  "l7_g1": [
    {"type": "prerequisite", "label": "📖 第6课 · へ・で移动"},
    {"type": "extension", "label": "🔗 第14课 · て形连接"},
  ],
  "l7_g4": [
    {"type": "contrast", "label": "⚠️ 选择用にします；×コーヒーをします"},
    {"type": "extension", "label": "🔗 第8课 · をください"},
  ],
  "l8_g1": [
    {"type": "prerequisite", "label": "📖 第6课 · で＝交通手段"},
    {"type": "contrast", "label": "⚠️ 本课で＝语言/工具"},
  ],
  "l8_g2": [
    {"type": "extension", "label": "🔗 授受：方向别用あげる／くれる／もらう"},
    {"type": "contrast", "label": "⚠️ 主语是给予方还是接受方"},
  ],
  # U3
  "l9_g1": [
    {"type": "prerequisite", "label": "📖 第5课 · ます形（敬体）"},
    {"type": "extension", "label": "🔗 第10课 · な形容词"},
  ],
  "l10_g1": [
    {"type": "prerequisite", "label": "📖 第9课 · い形容词变位"},
    {"type": "contrast", "label": "⚠️ い形 vs な形否定"},
  ],
  "l11_g1": [
    {"type": "prerequisite", "label": "📖 第10课 · な形容词"},
    {"type": "extension", "label": "🔗 第12课 · 比较"},
  ],
  "l12_g2": [
    {"type": "prerequisite", "label": "📖 第11课 · が好き"},
    {"type": "extension", "label": "🔗 第18课 · ほうがいい"},
  ],
  "l9_g3": [
    {"type": "prerequisite", "label": "→ 本课 · い形容词", "targetNodeId": "l9_g1"},
    {"type": "contrast", "label": "⚠️ が＝转折铺垫；第3课が＝新信息"},
  ],
  "l9_g4": [
    {"type": "prerequisite", "label": "→ 本课 · あまり～ない", "targetNodeId": "l9_g2"},
    {"type": "extension", "label": "🔗 第18课 · でしょう（系统学推量）"},
  ],
  "l10_g2": [
    {"type": "prerequisite", "label": "→ 本课 · ナ形容詞活用", "targetNodeId": "l10_g1"},
    {"type": "extension", "label": "📋 对照表 · 第9课 · イ形容詞"},
  ],
  "l10_g3": [
    {"type": "prerequisite", "label": "→ 本课 · ナ形容詞", "targetNodeId": "l10_g1"},
    {"type": "contrast", "label": "⚠️ きれいな町（连体）≠ きれいです（终止）"},
  ],
  "l11_g3": [
    {"type": "prerequisite", "label": "→ 本课 · が上手", "targetNodeId": "l11_g2"},
    {"type": "contrast", "label": "⚠️ 自夸用「得意」；夸他人用「上手」"},
  ],
  "l11_g4": [
    {"type": "prerequisite", "label": "→ 本课 · が好き", "targetNodeId": "l11_g1"},
    {"type": "extension", "label": "🔗 第10课 · いかがですか"},
  ],
  "l12_g1": [
    {"type": "prerequisite", "label": "📖 第11课 · が好き・上手"},
    {"type": "extension", "label": "🔗 第13课 · 助数词"},
  ],
  "l12_g4": [
    {"type": "prerequisite", "label": "→ 本课 · 一番", "targetNodeId": "l12_g3"},
    {"type": "contrast", "label": "⚠️ AはBと同じです／と違います"},
  ],
  # U4
  "l13_g1": [
    {"type": "prerequisite", "label": "📖 第4课 · いくつ"},
    {"type": "extension", "label": "🔗 第14课 · て形"},
  ],
  "l14_g2": [
    {"type": "prerequisite", "label": "📖 第13课 · 数量+に"},
    {"type": "extension", "label": "🔗 第15课 · ています"},
  ],
  "l14_g4": [
    {"type": "prerequisite", "label": "→ 本课 · て形", "targetNodeId": "l14_g2"},
    {"type": "extension", "label": "🔗 第21课 · たあとで"},
  ],
  "l15_g1": [
    {"type": "prerequisite", "label": "📖 第14课 · て形"},
    {"type": "contrast", "label": "⚠️ ています＝进行中；て＝连接"},
  ],
  "l16_g3": [
    {"type": "prerequisite", "label": "📖 第15课 · ています"},
    {"type": "extension", "label": "🔗 第16课 · い形容词て形"},
  ],
  # U5
  "l17_g1": [
    {"type": "prerequisite", "label": "📖 第14–16课 · て形体系"},
    {"type": "contrast", "label": "⚠️ がほしい＝想要物；たい＝想做"},
  ],
  "l18_g1": [
    {"type": "prerequisite", "label": "📖 第17课 · ほしい・たい"},
    {"type": "extension", "label": "🔗 第19课 · ない形"},
  ],
  "l19_g1": [
    {"type": "prerequisite", "label": "📖 第18课 · なる・变化"},
    {"type": "extension", "label": "🔗 第20课 · 可能形"},
  ],
  "l20_g2": [
    {"type": "prerequisite", "label": "📖 第19课 · ない形"},
    {"type": "extension", "label": "🔗 第21课 · たことがある"},
  ],
  # U6
  "l21_g2": [
    {"type": "prerequisite", "label": "📖 第20课 · 可能形"},
    {"type": "extension", "label": "🔗 第22课 · 简体"},
  ],
  "l22_g1": [
    {"type": "prerequisite", "label": "📖 第21课 · た形"},
    {"type": "contrast", "label": "⚠️ 简体＝普通体；です＝敬体"},
  ],
  "l23_g1": [
    {"type": "prerequisite", "label": "📖 第22课 · 简体"},
    {"type": "extension", "label": "🔗 第24课 · と思う"},
  ],
  "l24_g1": [
    {"type": "prerequisite", "label": "📖 第23课 · かどうか"},
    {"type": "extension", "label": "🔗 中级 · 引用句扩展"},
  ],
}

# 对照表「句型」列 → grammarNodes.id（显式关键字 + 按课节点序兜底）
_PATTERN_TO_NODE: list[tuple[int, str, str]] = [
    (2, "これ", "l2_g1"),
    (2, "この", "l2_g2"),
    (2, "ですね", "l2_g3"),
    (3, "ここ", "l3_g1"),
    (3, "どこ", "l3_g2"),
    (3, "が", "l3_g3"),
    (4, "あります", "l4_g1"),
    (4, "や", "l4_g2"),
    (4, "方位", "l4_g3"),
    (5, "ます形", "l5_g1"),
    (5, "時", "l5_g2"),
    (5, "に（時間", "l5_g3"),
    (5, "から", "l5_g4"),
    (6, "へ", "l6_g1"),
    (6, "空間", "l6_g2"),
    (6, "で（交通", "l6_g3"),
    (7, "を", "l7_g1"),
    (7, "頻度", "l7_g2"),
    (7, "ませんか", "l7_g3"),
    (8, "で（手段", "l8_g1"),
    (8, "あげる", "l8_g2"),
    (9, "イ形容詞", "l9_g1"),
    (9, "あまり", "l9_g2"),
    (10, "ナ形容詞", "l10_g1"),
    (10, "でした", "l10_g2"),
    (11, "好き", "l11_g1"),
    (11, "上手", "l11_g2"),
    (12, "より", "l12_g1"),
    (12, "ほうが", "l12_g2"),
    (12, "一番", "l12_g3"),
    (13, "助数詞", "l13_g1"),
    (13, "数量詞", "l13_g3"),
    (14, "て形", "l14_g2"),
    (14, "てください", "l14_g3"),
    (14, "てから", "l14_g4"),
    (14, "ましょうか", "l14_g5"),
    (15, "ています", "l15_g1"),
    (15, "てもいい", "l15_g2"),
    (16, "形容詞て", "l16_g1"),
    (16, "結果", "l16_g2"),
    (16, "で（原因", "l16_g3"),
    (16, "という", "l16_g4"),
    (17, "ほしい", "l17_g1"),
    (17, "たい", "l17_g2"),
    (18, "くなる", "l18_g1"),
    (18, "にする", "l18_g2"),
    (18, "ほうがいい", "l18_g3"),
    (18, "でしょう", "l18_g4"),
    (19, "ない形", "l19_g1"),
    (19, "ないで", "l19_g2"),
    (19, "なければ", "l19_g3"),
    (19, "なくても", "l19_g4"),
    (20, "辞書形", "l20_g1"),
    (20, "ことができる", "l20_g2"),
    (20, "前に", "l20_g3"),
    (21, "た形", "l21_g2"),
    (21, "たことが", "l21_g2"),
    (21, "たあと", "l21_g3"),
    (22, "簡体", "l22_g1"),
    (22, "予定", "l22_g2"),
    (23, "たり", "l23_g1"),
    (23, "場合", "l23_g2"),
    (23, "かどうか", "l23_g3"),
    (24, "と思う", "l24_g1"),
    (24, "と言う", "l24_g2"),
    (24, "のです", "l24_g3"),
]

_LESSON_GRAMMAR_IDS: dict[int, list[str]] | None = None
_LESSON_GRAMMAR_META: dict[int, list[tuple[str, str]]] | None = None


def _load_lesson_grammar_ids() -> dict[int, list[str]]:
    global _LESSON_GRAMMAR_IDS
    if _LESSON_GRAMMAR_IDS is not None:
        return _LESSON_GRAMMAR_IDS
    data = ROOT / "js" / "data" / "lessons-data.js"
    import json

    text = data.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    ids: dict[int, list[str]] = {}
    if m:
        for L in json.loads(m.group(1)):
            lid = L.get("lessonId")
            if lid:
                ids[lid] = [g["id"] for g in (L.get("grammarNodes") or []) if g.get("id")]
    _LESSON_GRAMMAR_IDS = ids
    return ids


def _load_lesson_grammar_meta() -> dict[int, list[tuple[str, str]]]:
    global _LESSON_GRAMMAR_META
    if _LESSON_GRAMMAR_META is not None:
        return _LESSON_GRAMMAR_META
    import json

    data = ROOT / "js" / "data" / "lessons-data.js"
    text = data.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    meta: dict[int, list[tuple[str, str]]] = {}
    if m:
        for L in json.loads(m.group(1)):
            lid = L.get("lessonId")
            if lid:
                meta[lid] = [
                    (g["id"], (g.get("title") or "") + (g.get("titleZh") or ""))
                    for g in (L.get("grammarNodes") or [])
                    if g.get("id")
                ]
    _LESSON_GRAMMAR_META = meta
    return meta


def _parse_reference_rows() -> list[tuple[int, str, str, str]]:
    if not REFERENCE_MD.is_file():
        return []
    rows: list[tuple[int, str, str, str]] = []
    for line in REFERENCE_MD.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|"):
            continue
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 4 or not parts[0].isdigit():
            continue
        rows.append((int(parts[0]), parts[1], parts[2], parts[3]))
    return rows


def _node_for_pattern(lesson_id: int, pattern: str, row_index: int = 0) -> str | None:
    for lid, key, nid in _PATTERN_TO_NODE:
        if lid == lesson_id and key in pattern:
            return nid
    pat = re.sub(r"[〜～]", "", pattern)
    keys = [pat[:6], pat[:4]] if len(pat) >= 4 else [pat]
    for nid, title in _load_lesson_grammar_meta().get(lesson_id) or []:
        for k in keys:
            if k and k in title:
                return nid
    gids = _load_lesson_grammar_ids().get(lesson_id) or []
    if row_index < len(gids):
        return gids[row_index]
    return gids[0] if gids else None


def _build_reference_table_links() -> dict[str, list[dict]]:
    by_lesson: dict[int, list[tuple[str, str, str]]] = defaultdict(list)
    for lid, pat, zh, rel in _parse_reference_rows():
        by_lesson[lid].append((pat, zh, rel))

    out: dict[str, list[dict]] = defaultdict(list)
    row_idx: dict[int, int] = defaultdict(int)
    for lid, pat, _zh, rel in _parse_reference_rows():
        idx = row_idx[lid]
        row_idx[lid] += 1
        nid = _node_for_pattern(lid, pat, idx)
        if not nid or rel in ("—", "-", ""):
            continue
        for rid_s in re.split(r"[、,]", rel):
            rid_s = rid_s.strip()
            if not rid_s.isdigit():
                continue
            rid = int(rid_s)
            hint = ""
            for rp, _, _ in by_lesson.get(rid, []):
                hint = rp[:14]
                break
            label = f"📋 对照表 · 第{rid}课"
            if hint:
                label += f" · {hint}"
            out[nid].append({"type": "extension", "label": label})
    return dict(out)


_REFERENCE_TABLE_CACHE: dict[str, list[dict]] | None = None


def reference_table_links() -> dict[str, list[dict]]:
    global _REFERENCE_TABLE_CACHE
    if _REFERENCE_TABLE_CACHE is None:
        _REFERENCE_TABLE_CACHE = _build_reference_table_links()
    return _REFERENCE_TABLE_CACHE


def invalidate_reference_cache() -> None:
    global _REFERENCE_TABLE_CACHE
    _REFERENCE_TABLE_CACHE = None


def _dedupe_links(links: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for lk in links:
        key = lk.get("label", "")
        if key in seen:
            continue
        seen.add(key)
        out.append(lk)
    return out


def links_for_node(lid: int, nid: str, idx: int, node_ids: list[str]) -> list[dict]:
    if nid in NODE_OVERRIDES:
        links = list(NODE_OVERRIDES[nid])
    else:
        links = []
        if idx > 0:
            prev_id = node_ids[idx - 1]
            links.append(
                {
                    "type": "prerequisite",
                    "label": f"→ 本课 · {prev_id}",
                    "targetNodeId": prev_id,
                }
            )
        if lid in LESSON_PREV:
            links.append({"type": "prerequisite", "label": f"📖 {LESSON_PREV[lid]}"})
        if lid in LESSON_NEXT:
            links.append({"type": "extension", "label": f"🔗 {LESSON_NEXT[lid]}"})
    links.extend(reference_table_links().get(nid, []))
    return _dedupe_links(links)
