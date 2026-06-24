#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第3单元第9–12课 · U3 标日精修（箱根单元 · 形容词·好恶·比较）

- grammarNodes 例句/译 ← 同课 basicText / 会話
- 作業 Q12 → 综合题；quiz Q12 对齐
- 不动课1、lesson-1-flow.js
"""
from __future__ import annotations

import json
import re
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = [9, 10, 11, 12]

# 文法节点补丁（例句真源 = lessons-data basicText / 会話）
GRAMMAR_BY_LESSON: dict[int, dict[str, dict]] = {
    9: {
        "l9_g1": {
            "titleZh": "い形容词四种时态（丁寧体）",
            "example": "四川料理は辛いです。",
            "exampleZh": [
                "四川菜很辣。（课文）",
                "昨日は寒かったです。（过去肯定）",
                "このスープはあまり辛くないです。（现在否定）",
            ],
        },
        "l9_g2": {
            "example": "このスープはあまり辛くないです。",
            "exampleZh": [
                "这个汤不太辣。（课文第2句）",
                "いいえ、あまり辛くないです。（会話）",
            ],
        },
        "l9_g3": {
            "example": "とても辛いですが、美味しいです。",
            "exampleZh": [
                "非常辣，但很好吃。（会話·转折が）",
                "四川料理は辛いですが、とても美味しいです。",
            ],
        },
        "l9_g4": {
            "example": "この料理は辛いでしょう。",
            "exampleZh": [
                "这道菜很辣吧。（推量·本课了解）",
                "※ 第18课系统学习「でしょう」。",
            ],
        },
    },
    10: {
        "l10_g1": {
            "titleZh": "な形容词四种时态（丁寧体）",
            "example": "京都の紅葉は有名です。",
            "exampleZh": [
                "京都红叶很有名。（课文）",
                "この町は静かではありません。／あの寺は有名でした。",
            ],
        },
        "l10_g2": {
            "example": "あの寺は有名でした。",
            "exampleZh": [
                "那座寺庙以前很有名。（课文·过去）",
                "昔、ここはにぎやかでした。",
            ],
        },
        "l10_g3": {
            "example": "コーヒーにします。",
            "exampleZh": [
                "我要咖啡。（选择·にします）",
                "※ 第7课会話亦出现；本课为ナ形语境了解。",
            ],
        },
        "l10_g4": {
            "example": "京都はどうでしたか。",
            "exampleZh": [
                "京都怎么样？（会話·いかが／どう）",
                "紅葉が本当にきれいでした。",
            ],
        },
    },
    11: {
        "l11_g1": {
            "example": "小野さんは歌が好きです。",
            "exampleZh": [
                "小野喜欢唱歌。（课文）",
                "对象用「が」，不用「を」。",
            ],
        },
        "l11_g2": {
            "example": "森さんはテニスが上手です。",
            "exampleZh": [
                "森先生网球打得好。（课文）",
                "李さんは日本語が上手ですね。（会話）",
            ],
        },
        "l11_g3": {
            "example": "どれがあなたの傘ですか。",
            "exampleZh": [
                "哪一把是你的伞？（疑问词＋が）",
                "※ 与第2课「だれの」互补。",
            ],
        },
        "l11_g4": {
            "example": "李さん、この四川料理はどうですか。",
            "exampleZh": [
                "小李，这道四川菜怎么样？（会話）",
                "この料理はどうですか。",
            ],
        },
    },
    12: {
        "l12_g1": {
            "example": "李さんは森さんより若いです。",
            "exampleZh": [
                "小李比森先生年轻。（课文）",
                "中国は日本より広いです。",
            ],
        },
        "l12_g2": {
            "example": "中国は日本より広いです。",
            "exampleZh": [
                "中国比日本辽阔。（课文）",
                "左の方がちょっと安いです。（会話·のほうが）",
            ],
        },
        "l12_g3": {
            "example": "クラスで李さんが一番背が高いです。",
            "exampleZh": [
                "班里小李个子最高。（课文）",
                "日本料理の中で、すしが一番好きです。",
            ],
        },
        "l12_g4": {
            "example": "値段はどちらも同じぐらいですか。",
            "exampleZh": [
                "价格两边差不多吗？（会話·同じ）",
                "※ 比较课亦用「同じぐらい」。",
            ],
        },
    },
}

HW_Q12_BY_LESSON: dict[int, list[str]] = {
    9: [
        "Q12【综合】：关于イ形容詞，哪句正确？",
        "A. 四川料理は辛いです。",
        "B. このスープはあまり辛いです。",
        "C. 昨日は寒いでした。",
        "D. この料理は辛くないでした。",
        "→ A（B 须「あまり～ない」；C 过去用「寒かった」；D 过去否定用「辛くなかった」）",
        "（拓展 Q13：この部屋は広いでした。→ 広かったです）",
    ],
    10: [
        "Q12【综合】：关于ナ形容詞，哪句正确？",
        "A. 京都の紅葉は有名です。",
        "B. この部屋はきれいかったです。",
        "C. この町は静かなです。",
        "D. あの寺は有名かったです。",
        "→ A（B/D ナ形过去用「～でした」；C 终止形用「静かです」）",
        "（拓展 Q13：この町は静かなです。→ 静かです）",
    ],
    11: [
        "Q12【综合】：关于「～が好き／上手」，哪句正确？",
        "A. 小野さんは歌が好きです。",
        "B. 私は料理を上手です。",
        "C. 森さんはテニスを好きです。",
        "D. 李さんは日本語を上手ですね。",
        "→ A（好恶·能力评价的对象用「が」）",
        "（拓展 Q13：私は料理を上手です。→ 料理が上手です）",
    ],
    12: [
        "Q12【综合】：关于比较表达，哪句正确？",
        "A. 中国は日本より広いです。",
        "B. 中国は日本より広い。",
        "C. クラスで李さんが一番背が高いです。",
        "D. 日本より中国の広いです。",
        "→ A（B 缺です；C 为课文句；D 缺「のほうが」）",
        "（拓展 Q13：中国は日本より広い。→ 広いです）",
    ],
}

QUIZ_Q12_BY_LESSON: dict[int, dict] = {
    9: {
        "id": "l9_q12",
        "type": "choice",
        "question": "关于イ形容詞，哪句正确？",
        "options": [
            "四川料理は辛いです。",
            "このスープはあまり辛いです。",
            "昨日は寒いでした。",
            "この料理は辛くないでした。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。B「あまり」须接否定；C イ形过去用「寒かったです」；D 过去否定用「辛くなかったです」。",
        "grammarNodeId": "l9_g1",
    },
    10: {
        "id": "l10_q12",
        "type": "choice",
        "question": "关于ナ形容詞，哪句正确？",
        "options": [
            "京都の紅葉は有名です。",
            "この部屋はきれいかったです。",
            "この町は静かなです。",
            "あの寺は有名かったです。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。ナ形过去用「きれいでした／有名でした」，不用「～かった」。",
        "grammarNodeId": "l10_g1",
    },
    11: {
        "id": "l11_q12",
        "type": "choice",
        "question": "关于「～が好き／上手」，哪句正确？",
        "options": [
            "小野さんは歌が好きです。",
            "私は料理を上手です。",
            "森さんはテニスを好きです。",
            "李さんは日本語を上手ですね。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。感情·能力评价的对象用「が」，不用「を」。",
        "grammarNodeId": "l11_g1",
    },
    12: {
        "id": "l12_q12",
        "type": "choice",
        "question": "关于比较表达，哪句正确？",
        "options": [
            "中国は日本より広いです。",
            "中国は日本より広い。",
            "クラスで李さんが一番背が高いです。",
            "日本より中国の広いです。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。B 缺丁寧体「です」；D 须「中国のほうが広いです」。",
        "grammarNodeId": "l12_g1",
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


def patch_grammar(L: dict, lid: int) -> int:
    patches = GRAMMAR_BY_LESSON.get(lid, {})
    n = 0
    for node in L.get("grammarNodes") or []:
        pid = node.get("id")
        if pid not in patches:
            continue
        for k, v in patches[pid].items():
            if node.get(k) != v:
                node[k] = v
                n += 1
    return n


def patch_homework_q12(L: dict, lid: int) -> int:
    hw_lines = HW_Q12_BY_LESSON.get(lid)
    if not hw_lines:
        return 0
    for sec in L.get("homeworkSections") or []:
        title = sec.get("title") or ""
        if "間違い" not in title and "総合問題" not in title:
            continue
        lines = sec.get("lines") or []
        if any("Q12【综合】" in str(ln) for ln in lines):
            return 0
        head = [ln for ln in lines if str(ln).startswith("【题源】")][:1]
        sec["title"] = "総合問題（综合题 · gate Q12）／間違い参考（Q13）"
        sec["lines"] = head + hw_lines
        return 1
    return 0


def patch_quiz_q12(L: dict, lid: int) -> int:
    spec = QUIZ_Q12_BY_LESSON.get(lid)
    if not spec:
        return 0
    qid = spec["id"]
    for i, q in enumerate(L.get("quizQuestions") or []):
        if q.get("id") == qid:
            if q != spec:
                L["quizQuestions"][i] = deepcopy(spec)
                return 1
            return 0
    return 0


def main() -> int:
    text, lessons = load_lessons()
    by_id = {x["lessonId"]: x for x in lessons}
    total = 0
    for lid in LESSON_IDS:
        L = by_id[lid]
        total += patch_grammar(L, lid)
        total += patch_homework_q12(L, lid)
        total += patch_quiz_q12(L, lid)
        span = find_lesson_span(text, lid)
        if not span:
            print(f"[FAIL] lesson {lid} span not found", file=sys.stderr)
            return 1
        start, end = span
        trailing = end < len(text) and text[end - 1] == ","
        new_blob = serialize_lesson(L, trailing_comma=trailing)
        text = text[:start] + new_blob + text[end:]

    DATA.write_text(text, encoding="utf-8")
    print(f"[OK] patch-unit3-lessons9-12-biaori: {total} field/section updates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
