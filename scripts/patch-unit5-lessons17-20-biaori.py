#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第5单元第17–20课 · U5 标日精修（愿望·变化·否定·可能）

- grammarNodes 例句/译 ← basicText / 会話
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
LESSON_IDS = [17, 18, 19, 20]

GRAMMAR_BY_LESSON: dict[int, dict[str, dict]] = {
    17: {
        "l17_g1": {
            "example": "わたしは新しい洋服がほしいです。",
            "exampleZh": [
                "我想要新衣服。（课文）",
                "欲しいものは「が」标记对象。",
            ],
        },
        "l17_g2": {
            "example": "日本へ行きたいです。",
            "exampleZh": [
                "想去日本。（课文）",
                "何を食べたいですか。（课文·动作愿望）",
            ],
        },
        "l17_g3": {
            "titleZh": "第三人称愿望（ほしがる・たがる·了解）",
            "example": "李さんは新しい車をほしがっています。",
            "exampleZh": [
                "小李想要一辆新车。（第三人称·ほしがる）",
                "※ 本课了解即可，中级系统学习。",
            ],
        },
        "l17_g4": {
            "example": "今、新しいパソコンがほしいんですが、お金が足りません。",
            "exampleZh": [
                "现在想要新电脑，但钱不够。（会話·んです强调）",
                "日本へ行きたいんです。",
            ],
        },
    },
    18: {
        "l18_g1": {
            "example": "携帯電話はとても小さくなりました。",
            "exampleZh": [
                "手机变得非常小了。（课文）",
                "イ形容詞：小さい→小さくなりました。",
            ],
        },
        "l18_g2": {
            "example": "生活が便利になりました。",
            "exampleZh": [
                "生活变方便了。（课文扩展·ナ形）",
                "息子は医者になりました。",
            ],
        },
        "l18_g3": {
            "example": "テレビの音を小さくしてください。",
            "exampleZh": [
                "请把电视音量调小。（课文）",
                "温度を高くします。（人为使变化）",
            ],
        },
        "l18_g4": {
            "example": "健康のために、毎日運動したほうがいいですよ。",
            "exampleZh": [
                "为了健康，最好每天运动。（课文）",
                "たばこを吸わないほうがいいです。（否定建议）",
            ],
        },
        "l18_g5": {
            "example": "明日は雨が降るかもしれません。",
            "exampleZh": [
                "明天也许会下雨。（课文）",
                "明日は晴れるでしょう。（推测·了解）",
            ],
        },
    },
    19: {
        "l19_g1": {
            "titleZh": "动词ない形（作り方）",
            "example": "食べる→食べない、行く→行かない、する→しない",
            "exampleZh": [
                "ない形变化规则。（本课核心）",
                "来る→来ない（こない）。",
            ],
        },
        "l19_g2": {
            "example": "部屋のかぎを忘れないでください。",
            "exampleZh": [
                "请不要忘记房间钥匙。（课文）",
                "ここで写真を撮らないでください。",
            ],
        },
        "l19_g3": {
            "example": "明日、レポートを出さなければなりません。",
            "exampleZh": [
                "明天必须交报告。（课文）",
                "ない形词干＋なければなりません。",
            ],
        },
        "l19_g4": {
            "example": "明日は来なくてもいいです。",
            "exampleZh": [
                "明天可以不来。（课文）",
                "可以不～＝没必要做。",
            ],
        },
    },
    20: {
        "l20_g1": {
            "title": "辞書形（动词原形）",
            "titleZh": "动词原形",
            "explanation": "动词辞書形",
            "explanationZh": "辞書形用于「ことができる」「前に」等句型。",
            "example": "スミスさんはピアノを弾くことができます。",
            "exampleZh": [
                "史密斯先生会弹钢琴。（课文）",
                "辞書形＋ことができます。",
            ],
        },
        "l20_g2": {
            "example": "スミスさんはピアノを弾くことができます。",
            "exampleZh": [
                "表示有能力做某事。（课文）",
                "私は料理を作ることができます。",
            ],
        },
        "l20_g3": {
            "example": "寝る前に、歯を磨きます。",
            "exampleZh": [
                "睡觉前刷牙。（课文）",
                "日本へ行く前に、日本語を少し勉強しました。（会話）",
            ],
        },
        "l20_g4": {
            "titleZh": "～ことがあります（经验·第21课先导）",
            "example": "富士山に登ったことがありますか。",
            "exampleZh": [
                "爬过富士山吗？（本课接触·第21课正式学）",
                "※ 用「た形＋ことがあります」表经验。",
            ],
        },
    },
}

HW_Q12_BY_LESSON: dict[int, list[str]] = {
    17: [
        "Q12【综合】：关于「ほしい／たい」，哪句正确？",
        "A. わたしは新しい洋服がほしいです。",
        "B. 私は新しいスマホをほしいです。",
        "C. 彼は日本へ行きたいです。",
        "D. 日本へ行きますたいです。",
        "→ A（B 用「が」；C 第三人称用「たがる」；D 形错误）",
        "（拓展 Q13：をほしい→がほしい；行きたい→行きたがっている）",
    ],
    18: [
        "Q12【综合】：关于变化·建议·推测，哪句正确？",
        "A. 携帯電話はとても小さくなりました。",
        "B. 携帯電話はとても小さいになりました。",
        "C. 健康のために、たばこを吸ったほうがいいです。",
        "D. 明日は雨が降ってかもしれません。",
        "→ A（B イ形用「くなる」；C 戒烟用「吸わない」；D 用辞書形「降る」）",
        "（拓展 Q13：吸ったほう→吸わないほう）",
    ],
    19: [
        "Q12【综合】：关于「ないで／なければ／なくても」，哪句正确？",
        "A. 部屋のかぎを忘れないでください。",
        "B. ここで写真を撮ってください。",
        "C. 明日は来なければなりません。",
        "D. 毎日、薬を飲むなければなりません。",
        "→ A（B 禁止用「撮らないで」；C 可不来用「来なくても」；D 飲まなければ）",
        "（拓展 Q13：飲むなければ→飲まなければ）",
    ],
    20: [
        "Q12【综合】：关于「ことができる／前に」，哪句正确？",
        "A. スミスさんはピアノを弾くことができます。",
        "B. 私はピアノが弾くことができます。",
        "C. 寝た前に、歯を磨きます。",
        "D. 弾くことがスミスさんはできます。",
        "→ A（B を；C 前に前用辞書形；D 语序错误）",
        "（拓展 Q13：ピアノが弾く→ピアノを弾く）",
    ],
}

QUIZ_Q12_BY_LESSON: dict[int, dict] = {
    17: {
        "id": "l17_q12",
        "type": "choice",
        "question": "关于「ほしい／たい」，哪句正确？",
        "options": [
            "わたしは新しい洋服がほしいです。",
            "私は新しいスマホをほしいです。",
            "彼は日本へ行きたいです。",
            "日本へ行きますたいです。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。ほしい 对象用が；第三人称愿望用たがる；たい 接ます形词干。",
        "grammarNodeId": "l17_g1",
    },
    18: {
        "id": "l18_q12",
        "type": "choice",
        "question": "关于变化·建议·推测，哪句正确？",
        "options": [
            "携帯電話はとても小さくなりました。",
            "携帯電話はとても小さいになりました。",
            "健康のために、たばこを吸ったほうがいいです。",
            "明日は雨が降ってかもしれません。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。イ形变化用「くなる」；戒烟建议用「吸わないほう」；かもしれません前用辞書形。",
        "grammarNodeId": "l18_g1",
    },
    19: {
        "id": "l19_q12",
        "type": "choice",
        "question": "关于「ないで／なければ／なくても」，哪句正确？",
        "options": [
            "部屋のかぎを忘れないでください。",
            "ここで写真を撮ってください。",
            "明日は来なければなりません。",
            "毎日、薬を飲むなければなりません。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。禁止请求用「ないでください」；义务用「飲まなければ」；许可不用用「来なくても」。",
        "grammarNodeId": "l19_g2",
    },
    20: {
        "id": "l20_q12",
        "type": "choice",
        "question": "关于「ことができる／前に」，哪句正确？",
        "options": [
            "スミスさんはピアノを弾くことができます。",
            "私はピアノが弾くことができます。",
            "寝た前に、歯を磨きます。",
            "弾くことがスミスさんはできます。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。可能句宾语常用を；「前に」前用辞書形。",
        "grammarNodeId": "l20_g2",
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
    print(f"[OK] patch-unit5-lessons17-20-biaori: {total} field/section updates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
