#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第6单元第21–24课 · U6 标日精修（经验·简体·たり·转述）

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
LESSON_IDS = [21, 22, 23, 24]

GRAMMAR_BY_LESSON: dict[int, dict[str, dict]] = {
    21: {
        "l21_g1": {
            "titleZh": "动词た形（作り方）",
            "example": "わたしはすき焼きを食べたことがあります。",
            "exampleZh": [
                "我吃过寿喜烧。（课文·た形+经验）",
                "行く→行った、食べる→食べた（与て形对应）",
            ],
        },
        "l21_g2": {
            "example": "わたしはすき焼きを食べたことがあります。",
            "exampleZh": [
                "动词た形＋ことがあります。（课文）",
                "日本に行ったことがありますか。",
            ],
        },
        "l21_g3": {
            "example": "食事をしたあとで、散歩します。",
            "exampleZh": [
                "吃完饭之后散步。（课文）",
                "映画を見たあとで、コーヒーを飲みに行きました。（会話）",
            ],
        },
        "l21_g4": {
            "example": "切符を買いましょうか。",
            "exampleZh": [
                "我帮你买票吧？（课文·申し出）",
                "私が選びましょうか。（会話）",
            ],
        },
    },
    22: {
        "l22_g1": {
            "titleZh": "简体（普通体）体系",
            "example": "森さんは毎晩テレビを見る。",
            "exampleZh": [
                "森先生每晚看电视。（课文·简体）",
                "敬体：毎晩テレビを見ます。",
            ],
        },
        "l22_g2": {
            "example": "来週、送別会をする予定だ。",
            "exampleZh": [
                "下周计划办欢送会。（课文）",
                "行く予定だ／来週、京都へ行く予定です。",
            ],
        },
        "l22_g3": {
            "example": "ちょっと聞きたいんだけど、今日は忙しい？",
            "exampleZh": [
                "想打听一下，今天忙吗？（课文·けど铺垫）",
                "高いけど、買いたい。",
            ],
        },
        "l22_g4": {
            "example": "来週、送別会をする予定だ。",
            "exampleZh": [
                "小李今天会来吗？（会話·かな）",
                "今日は李さんは来るかな。",
            ],
        },
        "l22_g5": {
            "example": "森さんは毎晩テレビを見る。",
            "exampleZh": [
                "简体陈述。（课文）",
                "友だち同士は「ですが」→「けど」。",
            ],
        },
        "l22_g6": {
            "example": "この料理の作り方を教えてくれる？",
            "exampleZh": [
                "能教我做这道菜吗？（课文·～方）",
                "この料理の作り方を教えてください。",
            ],
        },
    },
    23: {
        "l23_g1": {
            "example": "休みの日は、散歩したり、買い物に行ったりします。",
            "exampleZh": [
                "休息日散散步、去买买东西。（课文）",
                "映画を見たり、本を読んだりします。",
            ],
        },
        "l23_g2": {
            "example": "雨の場合は、運動会は中止します。",
            "exampleZh": [
                "下雨的情况下，运动会取消。（课文）",
                "遅れる場合は、連絡するように言っておきます。（会話）",
            ],
        },
        "l23_g3": {
            "example": "李さんが来るかどうか、知っていますか。",
            "exampleZh": [
                "你知道小李来不来吗？（课文）",
                "明日、晴れるかどうか分かりません。",
            ],
        },
        "l23_g4": {
            "example": "鍵がどこにあるか、教えてください。",
            "exampleZh": [
                "请告诉我钥匙在哪里。（课文·间接疑问）",
                "誰が何を準備するか、もう決まりましたか。（会話）",
            ],
        },
        "l23_g5": {
            "example": "航空券の値段は季節によって違います。",
            "exampleZh": [
                "机票价格因季节而异。（课文）",
                "人によって違います。（会話）",
            ],
        },
    },
    24: {
        "l24_g1": {
            "example": "李さんはもうすぐ来ると思います。",
            "exampleZh": [
                "我想小李马上就来。（课文）",
                "前面须简体：来ると思います。",
            ],
        },
        "l24_g2": {
            "example": "彼は「行きます」と言いました。",
            "exampleZh": [
                "他说「我去」。（课文·直接引用）",
                "先生は来週テストがあると言っていました。",
            ],
        },
        "l24_g3": {
            "example": "すみません、頭が痛いんです。",
            "exampleZh": [
                "对不起，我头疼。（课文·说明理由）",
                "東京タワーへ行きたいんですが、どうやって行きますか。",
            ],
        },
        "l24_g4": {
            "example": "東京タワーへ行きたいんですが、どうやって行きますか。",
            "exampleZh": [
                "我想去东京塔，怎么走？（课文）",
                "ちょっとお聞きしたいんですが…（铺垫请求）",
            ],
        },
    },
}

HW_Q12_BY_LESSON: dict[int, list[str]] = {
    21: [
        "Q12【综合】：关于「たことがある／たあとで」，哪句正确？",
        "A. わたしはすき焼きを食べたことがあります。",
        "B. 私は富士山に登ることがあります。",
        "C. 食事をしたあと、散歩します。",
        "D. 日本に行ったことがありますか。",
        "→ A（B 用「登ったこと」；C 须「あとで」；D 为疑问句形式）",
        "（拓展 Q13：登ること→登ったこと）",
    ],
    22: [
        "Q12【综合】：关于简体，哪句正确？",
        "A. 森さんは毎晩テレビを見る。",
        "B. 森さんは毎晩テレビを見ます。",
        "C. 来週、送別会をする予定です。",
        "D. この料理の作り方を教えてください。",
        "→ A（B/C/D 为敬体；课文标题句）",
        "（拓展 Q13：行きます京都へ→京都へ行く）",
    ],
    23: [
        "Q12【综合】：关于「たり／場合／かどうか」，哪句正确？",
        "A. 休みの日は、散歩したり、買い物に行ったりします。",
        "B. 休みの日は、散歩して、買い物に行きます。",
        "C. 彼が来るかどうかを知っていますか。",
        "D. 雨の場合は、試合を中止する。",
        "→ A（B 缺「たり」；C「かどうか」后不用「を」；D 课文用「中止します」）",
        "（拓展 Q13：かどうかを→かどうか）",
    ],
    24: [
        "Q12【综合】：关于「と思う／と言う／んです」，哪句正确？",
        "A. 李さんはもうすぐ来ると思います。",
        "B. 李さんはもうすぐ来ますと思います。",
        "C. 彼は行きますと言いました。",
        "D. 頭が痛いです、トイレはどこですか。",
        "→ A（B 引用须简体「来る」；C 缺「」与「と」；D 应用「痛いんです」）",
        "（拓展 Q13：来ると思います→来ないと思います 等语境）",
    ],
}

QUIZ_Q12_BY_LESSON: dict[int, dict] = {
    21: {
        "id": "l21_q12",
        "type": "choice",
        "question": "关于「たことがある／たあとで」，哪句正确？",
        "options": [
            "わたしはすき焼きを食べたことがあります。",
            "私は富士山に登ることがあります。",
            "食事をしたあと、散歩します。",
            "日本に行ったことがありますか。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。经验用「たことがある」；之后用「あとで」。",
        "grammarNodeId": "l21_g2",
    },
    22: {
        "id": "l22_q12",
        "type": "choice",
        "question": "关于简体，哪句正确？",
        "options": [
            "森さんは毎晩テレビを見る。",
            "森さんは毎晩テレビを見ます。",
            "来週、送別会をする予定です。",
            "この料理の作り方を教えてください。",
        ],
        "answer": 0,
        "explanation": "A 为课文简体句。B/C/D 为敬体。",
        "grammarNodeId": "l22_g1",
    },
    23: {
        "id": "l23_q12",
        "type": "choice",
        "question": "关于「たり／場合／かどうか」，哪句正确？",
        "options": [
            "休みの日は、散歩したり、買い物に行ったりします。",
            "休みの日は、散歩して、買い物に行きます。",
            "彼が来るかどうかを知っていますか。",
            "雨の場合は、試合を中止する。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。たり列举；かどうか前不用を。",
        "grammarNodeId": "l23_g1",
    },
    24: {
        "id": "l24_q12",
        "type": "choice",
        "question": "关于「と思う／と言う／んです」，哪句正确？",
        "options": [
            "李さんはもうすぐ来ると思います。",
            "李さんはもうすぐ来ますと思います。",
            "彼は行きますと言いました。",
            "頭が痛いです、トイレはどこですか。",
        ],
        "answer": 0,
        "explanation": "A 为课文句。と思う前用简体；引用用「と」；说明用「んです」。",
        "grammarNodeId": "l24_g1",
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
    print(f"[OK] patch-unit6-lessons21-24-biaori: {total} field/section updates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
