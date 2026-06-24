#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第2单元第5–7课 · U2-B 文法例句（本课课文真源）

- 仅改 lessonId 5–7 的 grammarNodes example / exampleZh
- 不动课1、lesson-1-flow.js
- 例句优先 lessons-data 同课 basicText / 会話
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = [5, 6, 7]

# 标日初级上 · 第2单元 L5–7（与 basicText 一致）
GRAMMAR_PATCH: dict[str, dict] = {
    "l5_g1": {
        "example": "森さんは７時に起きます。",
        "exampleZh": [
            "森先生七点起床。（ます形·现在/习惯）",
            "働きます・起きます・来ます 等动词礼貌体。",
        ],
    },
    "l5_g2": {
        "example": "今、ごご３じ１５ぷんです。",
        "exampleZh": [
            "现在是下午3点15分。",
            "私は毎朝６時半に起きます。",
        ],
    },
    "l5_g3": {
        "example": "森さんは７時に起きます。",
        "exampleZh": [
            "森先生七点起床。（に＝时间点）",
            "※ 毎日・今日・今 等不加に。",
        ],
    },
    "l5_g4": {
        "example": "田中さんは９時から５時まで働きます。",
        "exampleZh": [
            "田中先生从九点工作到五点。",
            "から～まで＝时间范围。",
        ],
    },
    "l5_g5": {
        "example": "７時ごろに起きます。",
        "exampleZh": [
            "大约七点起床。（ごろ＝大约）",
            "口语中ごろに 的に 可省略。",
        ],
    },
    "l6_g4": {
        "example": "どうやって会社へ行きますか。",
        "exampleZh": [
            "你怎么去公司？（どうやって＝方式）",
            "どこへ行きますか。／いつ行きますか。",
        ],
    },
    "l6_g5": {
        "titleZh": "时间·空间范围对比",
        "example": "東京から京都まで新幹線で行きます。",
        "exampleZh": [
            "从东京到京都坐新干线。（空间から～まで）",
            "与第5课时间范围同一结构，本课用于地点。",
        ],
    },
    "l7_g2": {
        "titleZh": "频率副词",
        "example": "李さんは毎日コーヒーを飲みます。",
        "exampleZh": [
            "小李每天喝咖啡。（毎日）",
            "私は時々テニスをします。（時々）",
            "あまり／ぜんぜん 须与否定呼应。",
        ],
    },
}


def load_lessons() -> tuple[str, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return text, json.loads(m.group(1))


def find_lesson_span(text: str, lid: int) -> tuple[int, int] | None:
    marker = f'"lessonId": {lid},'
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.rfind("{", 0, idx)
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(text) and text[end] == ",":
                    end += 1
                return start, end
    return None


def serialize_lesson(L: dict, *, trailing_comma: bool) -> str:
    lines = json.dumps(L, ensure_ascii=False, indent=2).split("\n")
    blob = "  " + lines[0] + "\n" + "\n".join("  " + ln for ln in lines[1:])
    if trailing_comma and not blob.rstrip().endswith(","):
        blob = blob.rstrip() + ","
    return blob


def patch_lesson(L: dict) -> int:
    n = 0
    for g in L.get("grammarNodes") or []:
        gid = g.get("id", "")
        if gid not in GRAMMAR_PATCH:
            continue
        for k, v in GRAMMAR_PATCH[gid].items():
            if g.get(k) != v:
                g[k] = v
                n += 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    by_id = {L["lessonId"]: L for L in lessons}
    total = 0
    for lid in LESSON_IDS:
        n = patch_lesson(by_id[lid])
        total += n
        span = find_lesson_span(text, lid)
        if not span:
            raise SystemExit(f"L{lid} not found")
        rest = text[span[1] :].lstrip()
        text = text[: span[0]] + serialize_lesson(
            by_id[lid], trailing_comma=rest.startswith("{")
        ) + text[span[1] :]
    DATA.write_text(text, encoding="utf-8")
    print(f"[OK] patch-unit2-grammar-l5-7-biaori: {total} fields updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
