#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
U3 第9–12课 · 标日真源精修（作业/小测对 PRD）

- 修正选择题 options 拆分、翻译题改 fill、grammarNodeId / explanationZh
- 作業段【题源】→【本课课文】
- 真源：【产品PRD】/新增补课文内容/第3单元/*.txt
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = [9, 10, 11, 12]

_BLANK = re.compile(r"[＿_]+")
_HINT = re.compile(r"\s*→.*$|（[^）]*）$")


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def split_choice_options(combined: str) -> list[str]:
    s = re.sub(r"\s*→.*$", "", combined).strip()
    parts = re.split(r"(?:^|[\s　]+)(?=[B-D][\.．、]\s*)", s)
    opts: list[str] = []
    for p in parts:
        p = re.sub(r"^[A-D][\.．、]\s*", "", p).strip()
        p = re.sub(r"（[^）]*）\s*$", "", p).strip()
        if p:
            opts.append(p)
    return opts or [s]


def fill_tts(question: str, answer: str) -> str:
    q = _HINT.sub("", question.strip())
    q = re.sub(r"\s*—.*$", "", q).strip()
    if _BLANK.search(q):
        return _BLANK.sub(str(answer), q, count=1)
    if re.search(r"[\u3040-\u30ff\u3400-\u9fff]", q):
        return q
    return str(answer)


CANON: dict[int, dict[int, dict]] = {
    9: {
        1: {
            "type": "choice",
            "question": "この料理は＿＿＿です。",
            "options": ["辛い", "辛く", "辛", "辛さ"],
            "answer": 0,
            "grammarNodeId": "l9_g1",
            "explanationZh": "选「辛い」。い形容词现在肯定用词干＋です。",
        },
        2: {
            "type": "choice",
            "question": "このスープは＿＿＿熱くないです。",
            "options": ["とても", "あまり", "いつも", "よく"],
            "answer": 1,
            "grammarNodeId": "l9_g2",
            "explanationZh": "选「あまり」。须与否定形呼应。",
        },
        3: {
            "type": "choice",
            "question": "昨日のテストは＿＿＿です。（難しかった）",
            "options": ["難しい", "難しくない", "難しかった", "難しいでした"],
            "answer": 2,
            "grammarNodeId": "l9_g1",
            "explanationZh": "选「難しかった」。い形过去肯定。",
        },
        4: {
            "type": "choice",
            "question": "このりんごは甘い＿＿＿、おいしいです。",
            "options": ["から", "が", "で", "に"],
            "answer": 1,
            "grammarNodeId": "l9_g3",
            "explanationZh": "选「が」。转折／铺垫。",
        },
        5: {
            "type": "fill",
            "question": "このカレーは＿＿＿辛くないです。",
            "answer": "あまり",
            "grammarNodeId": "l9_g2",
            "explanationZh": "填「あまり」。",
        },
        6: {
            "type": "fill",
            "question": "富士山は＿＿＿ですね。（高い）",
            "answer": "高い",
            "grammarNodeId": "l9_g1",
            "explanationZh": "填「高い」。",
        },
        7: {
            "type": "fill",
            "question": "昨日の天気は＿＿＿です。（寒かった）",
            "answer": "寒かった",
            "grammarNodeId": "l9_g1",
            "explanationZh": "填「寒かった」。",
        },
        8: {
            "type": "fill",
            "question": "四川料理は辛いですが、とても美味しいです。",
            "answer": "四川菜虽然辣，但很好吃。",
            "grammarNodeId": "l9_g3",
            "explanationZh": "日译中：が 转折。",
        },
        9: {
            "type": "fill",
            "question": "このスープはあまり熱くないです。",
            "answer": "这个汤不太热。",
            "grammarNodeId": "l9_g2",
            "explanationZh": "日译中：あまり～ない。",
        },
        10: {
            "type": "fill",
            "question": "这件衣服很贵。",
            "answer": "この服は高いです。",
            "grammarNodeId": "l9_g1",
            "explanationZh": "中译日：い形现在肯定。",
        },
        11: {
            "type": "fill",
            "question": "昨天的电影有趣吗？——不，没意思。",
            "answer": "昨日の映画は面白かったですか。 — いいえ、面白くなかったです。",
            "grammarNodeId": "l9_g1",
            "explanationZh": "中译日：过去问句＋过去否定。",
        },
        12: {
            "type": "choice",
            "question": "关于イ形容詞，哪句正确？",
            "options": [
                "四川料理は辛いです。",
                "このスープはあまり辛いです。",
                "昨日は寒いでした。",
                "この料理は辛くないでした。",
            ],
            "answer": 0,
            "grammarNodeId": "l9_g1",
            "explanationZh": "选 A。B 须あまり＋否定；C 过去用寒かった；D 过去否定用辛くなかった。",
        },
    },
    10: {
        1: {
            "type": "choice",
            "question": "京都の紅葉は＿＿＿です。",
            "options": ["有名", "有名な", "有名に", "有名だ"],
            "answer": 0,
            "grammarNodeId": "l10_g1",
            "explanationZh": "选「有名」。ナ形终止形。",
        },
        2: {
            "type": "choice",
            "question": "昨日はいい天気＿＿＿。",
            "options": ["です", "でした", "ます", "ました"],
            "answer": 1,
            "grammarNodeId": "l10_g2",
            "explanationZh": "选「でした」。过去肯定。",
        },
        3: {
            "type": "choice",
            "question": "＿＿＿な町ですね。",
            "options": ["きれい", "きれいだ", "きれく", "きれいに"],
            "answer": 0,
            "grammarNodeId": "l10_g3",
            "explanationZh": "选「きれい」。修饰名词用きれい＋な。",
        },
        4: {
            "type": "choice",
            "question": "この辺は＿＿＿ではありません。",
            "options": ["静か", "静かな", "静かに", "静かだ"],
            "answer": 0,
            "grammarNodeId": "l10_g1",
            "explanationZh": "选「静か」。现在否定用静かではありません。",
        },
        5: {
            "type": "fill",
            "question": "昔、この寺はとても＿＿＿でした。（有名）",
            "answer": "有名",
            "grammarNodeId": "l10_g2",
            "explanationZh": "填「有名」。ナ形过去＝～でした。",
        },
        6: {
            "type": "fill",
            "question": "あの人は＿＿＿じゃないです。（元気）",
            "answer": "元気",
            "grammarNodeId": "l10_g1",
            "explanationZh": "填「元気」。现在否定。",
        },
        7: {
            "type": "fill",
            "question": "京都の町は＿＿＿です。（きれい）",
            "answer": "きれい",
            "grammarNodeId": "l10_g1",
            "explanationZh": "填「きれい」。终止形。",
        },
        8: {
            "type": "fill",
            "question": "京都の紅葉はとても有名です。",
            "answer": "京都的红叶非常有名。",
            "grammarNodeId": "l10_g1",
            "explanationZh": "日译中。",
        },
        9: {
            "type": "fill",
            "question": "昔、ここはにぎやかな町でした。",
            "answer": "从前，这里是很热闹的城镇。",
            "grammarNodeId": "l10_g2",
            "explanationZh": "日译中：ナ形过去。",
        },
        10: {
            "type": "fill",
            "question": "那个寺庙不安静。",
            "answer": "あの寺は静かではありません。",
            "grammarNodeId": "l10_g1",
            "explanationZh": "中译日：ナ形否定。",
        },
        11: {
            "type": "fill",
            "question": "昨天天气怎么样？——很好。",
            "answer": "昨日の天気はどうでしたか。 — よかったです。",
            "grammarNodeId": "l10_g4",
            "explanationZh": "中译日：どうでしたか／よかった（いい的过去）。",
        },
        12: {
            "type": "choice",
            "question": "关于ナ形容詞，哪句正确？",
            "options": [
                "京都の紅葉は有名です。",
                "この部屋はきれいかったです。",
                "この町は静かなです。",
                "あの寺は有名かったです。",
            ],
            "answer": 0,
            "grammarNodeId": "l10_g1",
            "explanationZh": "选 A。ナ形过去用きれいでした／有名でした，不用～かった。",
        },
    },
    11: {
        1: {
            "type": "choice",
            "question": "わたしは猫＿＿＿好きです。",
            "options": ["を", "が", "に", "で"],
            "answer": 1,
            "grammarNodeId": "l11_g1",
            "explanationZh": "选「が」。好恶的对象。",
        },
        2: {
            "type": "choice",
            "question": "李さんは料理＿＿＿上手ですね。",
            "options": ["を", "が", "に", "で"],
            "answer": 1,
            "grammarNodeId": "l11_g2",
            "explanationZh": "选「が」。能力评价。",
        },
        3: {
            "type": "choice",
            "question": "自分のことを言うときは？",
            "options": ["上手です", "得意です", "上手いです", "上手でした"],
            "answer": 1,
            "grammarNodeId": "l11_g3",
            "explanationZh": "选「得意です」。自谦用得意。",
        },
        4: {
            "type": "choice",
            "question": "私はピアノが＿＿＿。",
            "options": ["下手", "苦手", "どちらも可（意味違い）"],
            "answer": 2,
            "grammarNodeId": "l11_g1",
            "explanationZh": "选 C。下手・苦手均可（语义略异）。",
        },
        5: {
            "type": "fill",
            "question": "私は犬が＿＿＿です。",
            "answer": "嫌い",
            "grammarNodeId": "l11_g1",
            "explanationZh": "填「嫌い」。",
        },
        6: {
            "type": "fill",
            "question": "小野さんは英語が＿＿＿じゃないです。",
            "answer": "上手",
            "grammarNodeId": "l11_g2",
            "explanationZh": "填「上手」。",
        },
        7: {
            "type": "fill",
            "question": "趣味は＿＿＿です。（読書）",
            "answer": "読書",
            "grammarNodeId": "l11_g1",
            "explanationZh": "填「読書」。",
        },
        8: {
            "type": "fill",
            "question": "私はテニスが好きですが、あまり上手じゃありません。",
            "answer": "我喜欢网球，但不太擅长。",
            "grammarNodeId": "l11_g1",
            "explanationZh": "日译中：が好き・上手。",
        },
        9: {
            "type": "fill",
            "question": "森さんはお酒が大好きです。",
            "answer": "森先生非常喜欢喝酒。",
            "grammarNodeId": "l11_g1",
            "explanationZh": "日译中。",
        },
        10: {
            "type": "fill",
            "question": "小李擅长日语吗？——是的，非常擅长。",
            "answer": "李さんは日本語が上手ですか。 — はい、とても上手です。",
            "grammarNodeId": "l11_g2",
            "explanationZh": "中译日。",
        },
        11: {
            "type": "fill",
            "question": "我讨厌早起。",
            "answer": "私は早起きが嫌いです。",
            "grammarNodeId": "l11_g1",
            "explanationZh": "中译日：が嫌い。",
        },
        12: {
            "type": "choice",
            "question": "关于「～が好き／上手」，哪句正确？",
            "options": [
                "小野さんは歌が好きです。",
                "私は料理を上手です。",
                "森さんはテニスを好きです。",
                "李さんは日本語を上手ですね。",
            ],
            "answer": 0,
            "grammarNodeId": "l11_g1",
            "explanationZh": "选 A。感情·能力对象用が，不用を。",
        },
    },
    12: {
        1: {
            "type": "choice",
            "question": "李さんは森さん＿＿＿若いです。",
            "options": ["より", "ほう", "が", "は"],
            "answer": 0,
            "grammarNodeId": "l12_g1",
            "explanationZh": "选「より」。比较基准。",
        },
        2: {
            "type": "choice",
            "question": "日本より中国の＿＿＿広いです。",
            "options": ["ほう", "ほうが", "こと", "もの"],
            "answer": 1,
            "grammarNodeId": "l12_g2",
            "explanationZh": "选「ほうが」。",
        },
        3: {
            "type": "choice",
            "question": "クラスで李さんが＿＿＿背が高いです。",
            "options": ["一番", "とても", "あまり", "よく"],
            "answer": 0,
            "grammarNodeId": "l12_g3",
            "explanationZh": "选「一番」。最上级。",
        },
        4: {
            "type": "choice",
            "question": "夏より冬のほう＿＿＿好きです。",
            "options": ["を", "が", "に", "で"],
            "answer": 1,
            "grammarNodeId": "l12_g2",
            "explanationZh": "选「が」。のほうが＋好き。",
        },
        5: {
            "type": "fill",
            "question": "この中で、どれ＿＿＿一番安いですか。",
            "answer": "が",
            "grammarNodeId": "l12_g3",
            "explanationZh": "填「が」。范围＋で，主体が一番。",
        },
        6: {
            "type": "fill",
            "question": "私の車は森さん＿＿＿同じです。",
            "answer": "のと",
            "grammarNodeId": "l12_g4",
            "explanationZh": "填「のと」。与…相同（口语亦可用と同じ）。",
        },
        7: {
            "type": "fill",
            "question": "昨日＿＿＿今日のほうが暑いです。",
            "answer": "より",
            "grammarNodeId": "l12_g2",
            "explanationZh": "填「より」。AよりBのほうが。",
        },
        8: {
            "type": "fill",
            "question": "李さんは森さんより若いですが、背は森さんより高くないです。",
            "answer": "小李比森先生年轻，但个子没有森先生高。",
            "grammarNodeId": "l12_g1",
            "explanationZh": "日译中：より比较。",
        },
        9: {
            "type": "fill",
            "question": "日本料理の中で、私はすしが一番好きです。",
            "answer": "在日本料理中，我最喜欢寿司。",
            "grammarNodeId": "l12_g3",
            "explanationZh": "日译中：で＋一番。",
        },
        10: {
            "type": "fill",
            "question": "这个和那个哪个便宜？",
            "answer": "これとそれとどっちが安いですか。",
            "grammarNodeId": "l12_g2",
            "explanationZh": "中译日：どっちが。",
        },
        11: {
            "type": "fill",
            "question": "在中国，哪个城市最热闹？",
            "answer": "中国で、どの町が一番にぎやかですか。",
            "grammarNodeId": "l12_g3",
            "explanationZh": "中译日：で＋一番。",
        },
        12: {
            "type": "choice",
            "question": "关于比较表达，哪句正确？",
            "options": [
                "中国は日本より広いです。",
                "中国は日本より広い。",
                "クラスで李さんが一番背が高いです。",
                "日本より中国の広いです。",
            ],
            "answer": 0,
            "grammarNodeId": "l12_g1",
            "explanationZh": "选 A。B 缺です；D 语序错误。",
        },
    },
}


def apply_quiz(L: dict, lid: int) -> int:
    canon = CANON.get(lid, {})
    n = 0
    for q in L.get("quizQuestions") or []:
        m = re.search(r"_q(\d+)$", q.get("id", ""))
        if not m:
            continue
        qi = int(m.group(1))
        spec = canon.get(qi)
        if not spec:
            continue
        q["type"] = spec["type"]
        q["question"] = spec["question"]
        if spec["type"] == "choice":
            if "options" in spec:
                q["options"] = spec["options"]
            else:
                q["options"] = split_choice_options(spec.get("options_raw", ""))
            q["answer"] = spec["answer"]
            if "explanation" in spec:
                q["explanation"] = spec["explanation"]
        else:
            q["answer"] = spec["answer"]
            q["questionTts"] = fill_tts(spec["question"], spec["answer"])
            q.pop("options", None)
        q["grammarNodeId"] = spec["grammarNodeId"]
        q["explanationZh"] = spec["explanationZh"]
        n += 1
    return n


def fix_homework_headers(L: dict) -> int:
    n = 0
    for sec in L.get("homeworkSections") or []:
        for i, line in enumerate(sec.get("lines") or []):
            if line.startswith("【题源】"):
                sec["lines"][i] = line.replace("【题源】", "【本课课文】", 1)
                n += 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, m, lessons = load_lessons()
    stats: dict[int, int] = {}
    hw = 0
    for L in lessons:
        lid = L.get("lessonId")
        if lid not in LESSON_IDS:
            continue
        stats[lid] = apply_quiz(L, lid)
        hw += fix_homework_headers(L)
    save_lessons(text, m, lessons)
    print(f"[OK] patch-u3-lessons-9-12-biaori-truth: quiz {stats} · homework headers {hw}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
