#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""L1 级知识卡精写 · 单词/文法共用生成（L2–24）"""
from __future__ import annotations

import re
from typing import Any

try:
    from vocab_tips_curated_data import CURATED
except ImportError:
    CURATED = {}

LESSON_GRAM_LABEL: dict[int, str] = {
    2: "指示語・これ/それ",
    3: "場所・ここ/あそこ",
    4: "存在・あります",
    5: "ます形・时刻",
    6: "へ/で・移动",
    7: "を・频率",
    8: "授受・で手段",
    9: "イ形容詞",
    10: "ナ形容詞",
    11: "が好き・が上手",
    12: "より・一番",
    13: "助数词・存在",
    14: "て形",
    15: "ている・许可",
    16: "イ/ナ形て形",
    17: "がほしい・たい",
    18: "なる・变化",
    19: "ない形・义务",
    20: "ことができる",
    21: "たことがある",
    22: "简体・思う",
    23: "たり・命令",
    24: "と思う・告别",
}


def first_grammar_ref(lesson: dict) -> str:
    nodes = lesson.get("grammarNodes") or []
    return (nodes[0].get("id") if nodes else "") or f"l{lesson['lessonId']}_g1"


def find_basic_line(lesson: dict, jp_fragment: str) -> str:
    frag = (jp_fragment or "").split("／")[0].strip()
    if not frag:
        return ""
    for line in lesson.get("basicText") or []:
        if frag in line:
            return line.strip()
    return ""


def find_dialogue_anchor(lesson: dict, jp_fragment: str) -> str:
    frag = (jp_fragment or "").split("／")[0].strip()
    if not frag:
        return ""
    for d in lesson.get("dialogues") or []:
        op = d.get("opener") or {}
        if frag in (op.get("japanese") or ""):
            return (op.get("japanese") or "").strip()
        for r in (d.get("userTurn") or {}).get("replies") or []:
            if frag in (r.get("japanese") or r.get("jp") or ""):
                return (r.get("japanese") or r.get("jp") or "").strip()
    return ""


def pos_hint(pos: str, lid: int, ref: str) -> str:
    if "イ形容" in pos:
        return f"イ形容詞活用四形；否定用「くない」；本课节点 {ref}。"
    if "ナ形容" in pos:
        return "ナ形容詞：词干＋です／ではありません；勿改「く」尾。"
    if pos.startswith("動"):
        return f"动词ます形叙述；宾语「を」、时间「に」按第{lid}课文法。"
    if pos == "助":
        return f"助词须对照当课文法例句；勿按中文语序硬套。"
    if pos == "名":
        return f"名词搭配は／が／を／に；见文法 {ref}。"
    if pos == "副":
        return "副词修饰谓语；注意与否定・过去呼应。"
    if pos == "接":
        return "接续词连接句意；会話 A 轨可对照朗读。"
    return f"第{lid}课词汇；会話 ABC 的 A 轨为朗读真源。"


def vocab_lines_l1(v: dict, lesson: dict, gram_ref: str | None = None) -> tuple[list[dict[str, str]], str]:
    vid = v.get("id") or ""
    lid = int(lesson.get("lessonId") or 0)
    ref = gram_ref or first_grammar_ref(lesson)
    label = LESSON_GRAM_LABEL.get(lid, "当课文法")

    if vid in CURATED:
        zh_lines = CURATED[vid]["zh"]
        if isinstance(zh_lines, str):
            zh_lines = [zh_lines]
        lines = [{"zh": z} for z in zh_lines[:3]]
        ref = CURATED[vid].get("ref", ref)
        if len(lines) < 2:
            jp = (v.get("jp") or "").split("／")[0].strip()
            anchor = find_dialogue_anchor(lesson, jp) or find_basic_line(lesson, jp)
            if anchor and jp and not any(jp in (l.get("ja") or "") for l in lines):
                lines.append({"ja": jp, "zh": "课文锚句；对照会話 A 轨朗读。"})
        if len(lines) < 3:
            pos = (v.get("pos") or "").strip()
            hint = pos_hint(pos, lid, ref)
            if hint and not any(hint[:10] in (l.get("zh") or "") for l in lines):
                lines.append({"zh": hint})
        return lines[:3], ref

    jp = (v.get("jp") or "").split("／")[0].strip()
    mzh = (v.get("meaningZh") or "").strip()
    pos = (v.get("pos") or "").strip()
    head = jp.split("（")[0].strip() if jp else mzh
    lines: list[dict[str, str]] = []

    if mzh and head:
        lines.append({"zh": f"「{head}」= {mzh}；本课 {label} 语境记忆。"})
    elif mzh:
        lines.append({"zh": f"词义：{mzh}；配合文法 {ref}。"})

    anchor = find_dialogue_anchor(lesson, jp) or find_basic_line(lesson, jp)
    if anchor and jp:
        lines.append({"ja": jp, "zh": f"课文锚句；对照会話 A 轨朗读。"})
    elif jp:
        lines.append({"ja": jp, "zh": "对照单词栏读音与课文例句。"})

    hint = pos_hint(pos, lid, ref)
    if hint and not any(hint[:12] in (l.get("zh") or "") for l in lines):
        lines.append({"zh": hint})

    return lines[:3], ref


def grammar_lines_l1(node: dict, lid: int) -> list[dict[str, str]]:
    lines: list[dict[str, str]] = []
    title = (node.get("titleZh") or node.get("title") or "").strip()
    expl = (node.get("explanation") or "").strip()
    expl_zh = [t.strip() for t in (node.get("explanationZh") or "").split("\n") if t.strip()]

    if expl:
        first = expl.split("\n")[0].strip()
        lines.append({"ja": first, "zh": title or f"第{lid}课文法句型。"})
    elif title:
        lines.append({"zh": title})

    for z in expl_zh[:2]:
        if z == title and lines:
            continue
        if z.startswith("句型：") and any("句型" in (l.get("zh") or "") for l in lines):
            continue
        lines.append({"zh": z})

    ex = (node.get("example") or "").strip()
    exzh = node.get("exampleZh") or []
    first_zh = str(exzh[0]).strip() if exzh else ""
    if ex:
        lines.append({"ja": ex, "zh": first_zh or "对照课文例句朗读。"})

    for lk in node.get("links") or []:
        lab = (lk.get("label") or "").strip()
        if lab.startswith("⚠️"):
            lines.append({"zh": lab.replace("⚠️", "").strip()})

    if not lines:
        lines.append({"zh": title or "对照文法节点例句。"})
    return lines[:5]
