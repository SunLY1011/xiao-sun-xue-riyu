#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第4单元第13–16课 · U4 标日精修（数量词·て形·ています·形容词て形）

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
LESSON_IDS = [13, 14, 15, 16]

GRAMMAR_BY_LESSON: dict[int, dict[str, dict]] = {
    13: {
        "l13_g1": {
            "titleZh": "助数词（本·个·匹·枚等）",
            "example": "机の上に本が三冊あります。",
            "exampleZh": [
                "书桌上有三本书。（课文）",
                "部屋に猫が二匹います。",
            ],
        },
        "l13_g2": {
            "titleZh": "数量词在名词后、动词前",
            "example": "机の上に本が三冊あります。",
            "exampleZh": [
                "名＋助数词＋あります／います。（语顺）",
                "じゃあ、このノートを三冊ください。（会話）",
            ],
        },
        "l13_g3": {
            "example": "このノートを三冊ください。",
            "exampleZh": [
                "请给我三本这种笔记本。（会話）",
                "冷蔵庫に卵が何個ありますか。（课文·存在）",
            ],
        },
        "l13_g4": {
            "example": "冷蔵庫に卵が何個ありますか。",
            "exampleZh": [
                "冰箱里有多少个鸡蛋？（课文）",
                "このノートはいくらですか。（价格）",
            ],
        },
    },
    14: {
        "l14_g1": {
            "titleZh": "动词三类（本课为て形打基础）",
            "example": "昨日、デパートへ行って、買い物しました。",
            "exampleZh": [
                "昨天去了百货公司买东西。（课文）",
                "1类：書く→書いて；2类：食べる→食べて；3类：する→して。",
            ],
        },
        "l14_g2": {
            "example": "デパートへ行って、買い物しました。",
            "exampleZh": [
                "て形连接动作。（课文）",
                "行く→行って（特例）；読む→読んで。",
            ],
        },
        "l14_g3": {
            "example": "すみません、ここに名前を書いてください。",
            "exampleZh": [
                "请在这里写名字。（课文）",
                "デパートのレストランでご飯を食べてから…（会話·てから）",
            ],
        },
        "l14_g4": {
            "example": "ご飯を食べてから、勉強します。",
            "exampleZh": [
                "吃完饭再学习。（课文）",
                "食べてから＝做完A之后做B。",
            ],
        },
        "l14_g5": {
            "example": "荷物が重いですね。私が持ちましょうか。",
            "exampleZh": [
                "行李很重呢。我帮您拿吧？（课文）",
                "ます形词干＋ましょうか（主动提议）。",
            ],
        },
    },
    15: {
        "l15_g1": {
            "example": "小野さんは今新聞を読んでいます。",
            "exampleZh": [
                "小野正在看报纸。（课文·进行）",
                "さっきまで電話をしていました。（会話）",
            ],
        },
        "l15_g2": {
            "example": "李さんは毎朝6時に起きています。",
            "exampleZh": [
                "小李每天早上六点起床。（课文·习惯）",
                "毎日、日本語を勉強しています。",
            ],
        },
        "l15_g3": {
            "example": "写真を撮ってもいいですか。",
            "exampleZh": [
                "可以拍照吗？（课文）",
                "はい、撮ってもいいですよ。（会話）",
            ],
        },
        "l15_g4": {
            "titleZh": "请求许可（礼貌问法）",
            "example": "すみません、ここに座ってもいいですか。",
            "exampleZh": [
                "不好意思，可以坐这里吗？（课文）",
                "このオフィスで写真を撮ってもいいですか。（会話）",
            ],
        },
    },
    16: {
        "l16_g1": {
            "titleZh": "い形容词て形（并列·原因）",
            "example": "この部屋は広くて明るいです。",
            "exampleZh": [
                "这个房间又宽敞又明亮。（课文）",
                "広い→広くて、明るい→明るくて。",
            ],
        },
        "l16_g2": {
            "example": "この町は静かできれいです。",
            "exampleZh": [
                "这个城镇又安静又漂亮。（课文）",
                "静かで、きれいで（ナ形＋で）。",
            ],
        },
        "l16_g3": {
            "example": "窓が割れています。",
            "exampleZh": [
                "窗户碎了。（结果状态·课文）",
                "ドアが閉まっています。／エアコンはついています。（会話）",
            ],
        },
        "l16_g4": {
            "titleZh": "が（转折·铺垫）",
            "example": "このホテルの部屋は広くて明るいですが、ちょっと高いです。",
            "exampleZh": [
                "宽敞明亮，但有点贵。（が·转折）",
                "とても広くて明るいです。窓から庭が見えます。（会話）",
            ],
        },
        "l16_g5": {
            "example": "「富士山」という山があります。",
            "exampleZh": [
                "有座叫「富士山」的山。（本课了解）",
                "※ 口语常说「～って」。",
            ],
        },
    },
}

HW_Q12_BY_LESSON: dict[int, list[str]] = {
    13: [
        "Q12【综合】：关于数量词与存在句，哪句正确？",
        "A. 机の上に本が三冊あります。",
        "B. 机の上に本が三個あります。",
        "C. 部屋に猫が二匹ある。",
        "D. 冷蔵庫に卵が何冊ありますか。",
        "→ A（B 书用「冊」；C 须「あります」；D 卵用「個」）",
        "（拓展 Q13：机の上に本が三冊ある。→ あります）",
    ],
    14: [
        "Q12【综合】：关于て形，哪句正确？",
        "A. ご飯を食べてから、勉強します。",
        "B. 私は家へ帰るて、テレビを見た。",
        "C. ここに名前を書くてください。",
        "D. デパートへ行くて、買い物しました。",
        "→ A（B/C/D て形错误；课文「食べてから」）",
        "（拓展 Q13：帰るて→帰って；書くて→書いて）",
    ],
    15: [
        "Q12【综合】：关于「～ています／～てもいい」，哪句正确？",
        "A. 小野さんは今新聞を読んでいます。",
        "B. 私は今、ご飯を食べます。",
        "C. 毎日、日本語を勉強してもいいです。",
        "D. 写真を撮るてもいいですか。",
        "→ A（B 进行用「食べています」；C/D 许可用「て＋も」）",
        "（拓展 Q13：食べます→食べています）",
    ],
    16: [
        "Q12【综合】：关于形容词て形与「～ている」状态，哪句正确？",
        "A. この部屋は広くて明るいです。",
        "B. この部屋は広いで明るいです。",
        "C. 窓が割れます。",
        "D. この町は静かなきれいです。",
        "→ A（B イ形用「くて」；C 状态用「割れている」；D 用「静かで」）",
        "（拓展 Q13：広いで→広くて；割れます→割れています）",
    ],
}

QUIZ_Q12_BY_LESSON: dict[int, dict] = {
    13: {
        "id": "l13_q12",
        "type": "choice",
        "question": "关于数量词与存在句，哪句正确？",
        "options": [
            "机の上に本が三冊あります。",
            "机の上に本が三個あります。",
            "部屋に猫が二匹ある。",
            "冷蔵庫に卵が何冊ありますか。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。书用「冊」；丁寧体用「あります」；鸡蛋问「何個」。",
        "grammarNodeId": "l13_g1",
    },
    14: {
        "id": "l14_q12",
        "type": "choice",
        "question": "关于て形，哪句正确？",
        "options": [
            "ご飯を食べてから、勉強します。",
            "私は家へ帰るて、テレビを見た。",
            "ここに名前を書くてください。",
            "デパートへ行くて、買い物しました。",
        ],
        "answer": 0,
        "explanation": "A 为课文「食べてから」。B 帰って；C 書いて；D 行って。",
        "grammarNodeId": "l14_g4",
    },
    15: {
        "id": "l15_q12",
        "type": "choice",
        "question": "关于「～ています／～てもいい」，哪句正确？",
        "options": [
            "小野さんは今新聞を読んでいます。",
            "私は今、ご飯を食べます。",
            "毎日、日本語を勉強してもいいです。",
            "写真を撮るてもいいですか。",
        ],
        "answer": 0,
        "explanation": "A 为课文进行形。B 应用「食べています」；许可须「撮っても」。",
        "grammarNodeId": "l15_g1",
    },
    16: {
        "id": "l16_q12",
        "type": "choice",
        "question": "关于形容词て形与「～ている」状态，哪句正确？",
        "options": [
            "この部屋は広くて明るいです。",
            "この部屋は広いで明るいです。",
            "窓が割れます。",
            "この町は静かなきれいです。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。イ形て形「広くて」；状态「割れている」；ナ形「静かで」。",
        "grammarNodeId": "l16_g1",
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
    print(f"[OK] patch-unit4-lessons13-16-biaori: {total} field/section updates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
