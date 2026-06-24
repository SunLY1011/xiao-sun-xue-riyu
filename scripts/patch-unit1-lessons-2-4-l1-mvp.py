#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第1单元第2–4课 · 对齐 L1 MVP（不动课1 / lesson-1-flow.js）

- 文法 example / exampleZh
- 小测第12题：综合题（choice）
- reviewExtension 补至 5 块（标日上册 + 适度延展）
- L4：あります・います 活用表
- 作業：間違い段 Q12 改为総合問題（与 gate 一致）
"""
from __future__ import annotations

import json
import re
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = [2, 3, 4]

GRAMMAR_EXAMPLES: dict[int, dict[str, dict]] = {
    2: {
        "l2_g1": {
            "example": "これは 本です。",
            "exampleZh": ["这是书。", "那是什么？", "哪一本是日语杂志？"],
        },
        "l2_g2": {
            "example": "この 本は 日本語の 本です。",
            "exampleZh": ["这是日语书。", "那本杂志是森先生的。"],
        },
    },
    3: {
        "l3_g1": {
            "example": "ここは デパートです。",
            "exampleZh": ["这里是百货商店。", "厕所在哪里？", "那边是图书馆。"],
        },
        "l3_g3": {
            "example": "あそこが 郵便局です。",
            "exampleZh": ["那边是邮局。", "这边是电梯。"],
        },
        "l3_g5": {
            "example": "トイレは あちらです。",
            "exampleZh": ["洗手间在那边（礼貌说法）。", "银行在那边十字路口的左边。"],
        },
    },
}

QUIZ_Q12: dict[int, dict] = {
    2: {
        "id": "l2_q12",
        "type": "choice",
        "question": "【综合】下列哪一句正确？（指示词＋の）",
        "options": [
            "これは 私の 本です。",
            "この 本は だれですか。",
            "あれは どれですか。",
            "それは 李さんです。",
        ],
        "answer": 0,
        "explanation": "连体词后接名词；问所属用「だれの」；「どれ」需「どれが～」；自称不加「さん」。",
        "grammarNodeId": "l2_g3",
    },
    3: {
        "id": "l3_q12",
        "type": "choice",
        "question": "【综合】问路·场所（标日第3课文型）",
        "options": [
            "トイレは どこですか。 — あちらです。",
            "トイレは どこですか。 — あそこですか。",
            "あそこは どこですか。",
            "ここが デパートに あります。",
        ],
        "answer": 0,
        "explanation": "问场所用「～はどこですか」；指示远处礼貌用「あちら」；「ここが」用于指出新信息。",
        "grammarNodeId": "l3_g2",
    },
    4: {
        "id": "l4_q12",
        "type": "choice",
        "question": "【综合】存在句·场所助词（标日第4课）",
        "options": [
            "部屋に 机と いすがあります。",
            "部屋に 猫があります。",
            "机は 部屋が あります。",
            "庭に 犬を います。",
        ],
        "answer": 0,
        "explanation": "非生物用「あります」、生物用「います」；存在场所用「に」、存在主体用「が」。",
        "grammarNodeId": "l4_g1",
    },
}

HW_Q12_LINES: dict[int, list[str]] = {
    2: [
        "Q12【综合】：下列哪一句正确？",
        "A. これは 私の 本です。",
        "B. この 本は だれですか。",
        "C. あれは どれですか。",
        "D. それは 李さんです。",
        "→ A（指示词・の・だれの）",
        "（拓展 Q13 改错：その 本は だれですか。→ だれのですか。）",
    ],
    3: [
        "Q12【综合】：问路时哪组对话正确？",
        "A. トイレは どこですか。 — あちらです。",
        "B. トイレは どこですか。 — あそこですか。",
        "C. あそこは どこですか。",
        "D. ここが デパートに あります。",
        "→ A",
        "（拓展 Q13：あそこは どこですか。→ あそこは 何ですか。）",
    ],
    4: [
        "Q12【综合】：关于房间与院子，哪句正确？",
        "A. 部屋に 机と いすがあります。",
        "B. 部屋に 猫があります。",
        "C. 机は 部屋が あります。",
        "D. 庭に 犬を います。",
        "→ A",
        "（拓展 Q13：部屋に 猫があります。→ 部屋に 猫がいます。）",
    ],
}

REVIEW_EXT_EXTRA: dict[int, list[dict]] = {
    2: [
        {
            "title": "📋 指示詞テンプレート（模板 · 标日第2课）",
            "lines": [
                "これ／それ／あれは［名詞］です。",
                "この／その／あの［名詞］は［名詞］の［名詞］です。",
                "あれは だれの［名詞］ですか。 — 私のです。",
                "例：この カメラは スミスさんのです。",
                "【知识延展】拍照介绍家人：「この 方は どなたですか」（敬语，课文已出现）。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用 · 第2课）",
            "lines": [
                "× この 本は だれですか　○ だれのですか",
                "× あれは どれですか　○ どれが～ですか",
                "× これ 本　○ この 本",
                "× 私は 李さんです　○ 私は 李です",
            ],
        },
        {
            "title": "📝 ユニットテスト予告（第1单元 · 标日上册）",
            "lines": [
                "第4课结束后进行第1单元复习测（标日初级上 第1单元）。",
                "范围：名词句です／ません／ですか、こそあど（事物+场所预告）、存在句入门、数字・年龄・价格。",
                "建议：每课完成作业 Q1–Q12，会話 A 轨对照课文，拡張栏误用表考前过一遍。",
                "【知识延展】测后可预习第5课「ます形」时间表达（第2单元入口）。",
            ],
        },
    ],
    3: [
        {
            "title": "📋 場所・案内テンプレート（模板 · 标日第3课）",
            "lines": [
                "ここは［施設］です。",
                "［施設］は どこですか。 — あちらです。／あそこが［施設］です。",
                "［施設］は ［場所］の ［方位］です。",
                "例：銀行は あちらの 交差点の 左です。",
                "【知识延展】购物问价「この［物］は いくらですか」— いくら＋円（本课数字）。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用 · 第3课）",
            "lines": [
                "× ここは 郵便局だ　○ ここは 郵便局です",
                "× ここの 部屋　○ この 部屋（场所词不用の）",
                "× トイレは どこ　○ トイレは どこですか",
                "× あそこは どこですか　○ あそこは 何ですか（已指具体处）",
            ],
        },
        {
            "title": "📝 ユニットテスト予告（第1单元 · 标日上册）",
            "lines": [
                "本课属第1单元；单元测在第4课后（标日 P.34 前后单元练习思路）。",
                "重点：ここ／そこ／あそこ／どこ、こちら系列、は vs が（新信息）、いくら・階数。",
                "与第2课对比记忆：事物こそあど ↔ 场所こそあど 平行表（见参考表）。",
                "下接第4课：どこにありますか ↔ 本课「～はどこですか」。",
            ],
        },
    ],
    4: [
        {
            "title": "📋 存在・配置テンプレート（模板 · 标日第4课）",
            "lines": [
                "［場所］に［物］が あります。／［人・動物］が います。",
                "［物］は［場所］に あります。",
                "［場所］に［物］や［物］などがあります。",
                "例：机の 上に 本が 三冊 あります。",
                "【知识延展】第13课将强化数量词；本课先掌握「に＋が」框架。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用 · 第4课）",
            "lines": [
                "× 部屋に 猫があります　○ 猫がいます",
                "× 机は 部屋が あります　○ 机は 部屋に あります",
                "× 庭に 犬を います　○ 犬が います",
                "× 上に 猫　○ 上に 猫が います（主体が）",
            ],
        },
        {
            "title": "📝 ユニットテスト予告（第1单元 · 标日上册）",
            "lines": [
                "★ 第1单元收官课：学完本课即做单元测（标日上册 第1单元 综合）。",
                "必考：あります／います、に／が、と／や／など、方位词（上・下・中・隣…）、数量（冊・台…）。",
                "会話：房间介绍+院子有无动物（课文「部屋の様子」）。",
                "通过后进入第2单元第5课：动词ます形与时间（标日第5课）。",
            ],
        },
    ],
}

ARU_IMU_CONJ = {
    "label": "あります／います",
    "forms": [
        {"label": "肯定", "jp": "あります／います"},
        {"label": "否定", "jp": "ありません／いません"},
        {"label": "疑问", "jp": "ありますか／いますか"},
        {"label": "过去（接触）", "jp": "ありました／いました"},
    ],
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


def patch_grammar(L: dict, lid: int) -> int:
    n = 0
    mp = GRAMMAR_EXAMPLES.get(lid, {})
    for g in L.get("grammarNodes") or []:
        gid = g.get("id", "")
        if gid not in mp:
            continue
        for k, v in mp[gid].items():
            if g.get(k) != v:
                g[k] = v
                n += 1
    return n


def patch_quiz(L: dict, lid: int) -> int:
    qs = L.get("quizQuestions") or []
    if any(q.get("id") == f"l{lid}_q12" for q in qs):
        return 0
    qs.append(deepcopy(QUIZ_Q12[lid]))
    L["quizQuestions"] = qs
    return 1


def patch_homework_q12(L: dict, lid: int) -> int:
    lines_new = HW_Q12_LINES.get(lid)
    if not lines_new:
        return 0
    for sec in L.get("homeworkSections") or []:
        if "間違い" not in (sec.get("title") or ""):
            continue
        sec["title"] = "総合問題（综合题 · gate Q12）／間違い参考（Q13）"
        sec["lines"] = lines_new
        return 1
    return 0


def patch_review_extension(L: dict, lid: int) -> int:
    rext = L.get("reviewExtension") or []
    titles = {x.get("title", "") for x in rext}
    n = 0
    for block in REVIEW_EXT_EXTRA.get(lid, []):
        if block["title"] in titles:
            continue
        rext.append(deepcopy(block))
        n += 1
    L["reviewExtension"] = rext
    return n


def patch_l4_conj(L: dict) -> int:
    if L["lessonId"] != 4:
        return 0
    n = 0
    for v in L.get("vocab") or []:
        if v.get("id") in ("l4_v_28", "l4_v_29"):
            if not (v.get("conjugation") or {}).get("forms"):
                v["conjugation"] = deepcopy(ARU_IMU_CONJ)
                n += 1
    return n


def patch_lesson(L: dict) -> dict:
    lid = L["lessonId"]
    return {
        "grammar": patch_grammar(L, lid),
        "quiz": patch_quiz(L, lid),
        "hw": patch_homework_q12(L, lid),
        "rext": patch_review_extension(L, lid),
        "conj": patch_l4_conj(L),
    }


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    by_id = {L["lessonId"]: L for L in lessons}
    stats: dict[str, int] = {}
    for lid in LESSON_IDS:
        if lid not in by_id:
            raise SystemExit(f"lesson {lid} missing")
        s = patch_lesson(by_id[lid])
        for k, v in s.items():
            stats[k] = stats.get(k, 0) + v
        span = find_lesson_span(text, lid)
        if not span:
            raise SystemExit(f"span not found L{lid}")
        rest = text[span[1] :].lstrip()
        text = text[: span[0]] + serialize_lesson(
            by_id[lid], trailing_comma=rest.startswith("{")
        ) + text[span[1] :]
    DATA.write_text(text, encoding="utf-8")
    print("[OK] patch-unit1-lessons-2-4-l1-mvp:", stats)
    print("未改：lessonId=1 · lesson-1-flow.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
