#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
U2 第5–8课 · 标日真源精修（作业/小测对 PRD）

- 修正选择题 options 拆分、填空 answer / questionTts
- 作業段【题源】→【本课课文】
- 真源：【产品PRD】/新增补课文内容/第2单元/*.txt
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LESSON_IDS = [5, 6, 7, 8]

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


# PRD 【作业】Q1–12 真源（第5–8课）
CANON: dict[int, dict[int, dict]] = {
    5: {
        1: {
            "type": "choice",
            "question": "森さんは毎朝七時＿＿＿起きます。",
            "options_raw": "で　B. に　C. を　D. が → B",
            "answer": 1,
            "grammarNodeId": "l5_g3",
            "explanationZh": "选「に」。具体时刻用「に」。对应课文：森さんは７時に起きます。",
        },
        2: {
            "type": "choice",
            "question": "昨日、何時に＿＿＿か。 — １１時に寝ました。",
            "options_raw": "寝ます　B. 寝ました　C. 寝ています　D. 寝ない → B",
            "answer": 1,
            "grammarNodeId": "l5_g1",
            "explanationZh": "选「寝ました」。问过去时间用过去式。",
        },
        3: {
            "type": "choice",
            "question": "私は毎朝６時＿＿＿起きます。",
            "options_raw": "ごろ　B. ごろに　C. ぐらい　D. だけ → A",
            "answer": 0,
            "grammarNodeId": "l5_g5",
            "explanationZh": "选「ごろ」。大约六点；「ごろに」也可，本题选 A。",
        },
        4: {
            "type": "choice",
            "question": "会社は９時＿＿＿５時＿＿＿働きます。",
            "options_raw": "から・まで　B. に・に　C. で・で　D. まで・から → A",
            "answer": 0,
            "grammarNodeId": "l5_g4",
            "explanationZh": "选「から・まで」。时间范围。对应：田中さんは９時から５時まで働きます。",
        },
        5: {
            "type": "fill",
            "question": "田中さんは毎日８時＿＿＿働きます。",
            "answer": "に",
            "grammarNodeId": "l5_g3",
            "explanationZh": "填「に」。每天八点上班（时间点）。",
        },
        6: {
            "type": "fill",
            "question": "昨日、私はあまり勉強し＿＿＿。",
            "answer": "ませんでした",
            "grammarNodeId": "l5_g1",
            "explanationZh": "填「ませんでした」。过去否定ます形。",
        },
        7: {
            "type": "fill",
            "question": "朝ごはんを７時＿＿＿食べます。",
            "answer": "ごろ",
            "grammarNodeId": "l5_g5",
            "explanationZh": "填「ごろ」。大约七点吃早饭。",
        },
        8: {
            "type": "fill",
            "question": "私は毎朝６時半に起きます。それから、７時に朝ごはんを食べます。",
            "answer": "我每天早上6点半起床。然后7点吃早饭。",
            "grammarNodeId": "l5_g1",
            "explanationZh": "日译中：对应会話「６時半に起きます」「７時に食べます」。",
        },
        9: {
            "type": "fill",
            "question": "森さんは夜１１時ごろ寝ます。",
            "answer": "森先生晚上11点左右睡觉。",
            "grammarNodeId": "l5_g5",
            "explanationZh": "日译中：ごろ＝大约。",
        },
        10: {
            "type": "fill",
            "question": "你每天几点工作？",
            "answer": "毎日何時に働きますか。",
            "grammarNodeId": "l5_g3",
            "explanationZh": "中译日：何時に＋动词ます形。",
        },
        11: {
            "type": "fill",
            "question": "昨天没学习。",
            "answer": "昨日、勉強しませんでした。",
            "grammarNodeId": "l5_g1",
            "explanationZh": "中译日：过去否定。",
        },
        12: {
            "type": "choice",
            "question": "下列哪句叙述日常作息正确？",
            "options": [
                "私は毎朝６時に起きる。",
                "私は毎朝６時に起きます。",
                "私は毎朝６時で起きます。",
            ],
            "answer": 1,
            "grammarNodeId": "l5_g1",
            "explanationZh": "选 B。丁寧体用「起きます」；×起きる 为辞書形；×で 不能表时间点。",
        },
    },
    6: {
        1: {
            "type": "choice",
            "question": "来月、日本＿＿＿行きます。",
            "options_raw": "を　B. が　C. へ　D. で → C",
            "answer": 2,
            "grammarNodeId": "l6_g1",
            "explanationZh": "选「へ」。移动方向/目的地。",
        },
        2: {
            "type": "choice",
            "question": "家＿＿＿駅＿＿＿バスで行きます。",
            "options_raw": "から・まで　B. へ・へ　C. に・に　D. から・へ → A",
            "answer": 0,
            "grammarNodeId": "l6_g2",
            "explanationZh": "选「から・まで」。从家到车站。",
        },
        3: {
            "type": "choice",
            "question": "毎日、電車＿＿＿会社へ行きます。",
            "options_raw": "を　B. が　C. に　D. で → D",
            "answer": 3,
            "grammarNodeId": "l6_g3",
            "explanationZh": "选「で」。交通方式。",
        },
        4: {
            "type": "choice",
            "question": "昨日、私は友達＿＿＿映画を見ました。",
            "options_raw": "と　B. に　C. を　D. が → A",
            "answer": 0,
            "grammarNodeId": "l6_g1",
            "explanationZh": "选「と」。与某人一起。",
        },
        5: {
            "type": "fill",
            "question": "東京駅＿＿＿新大阪駅までは約２時間半です。",
            "answer": "から",
            "grammarNodeId": "l6_g2",
            "explanationZh": "填「から」。空间起点。",
        },
        6: {
            "type": "fill",
            "question": "どうやって学校へ行きますか。 — ＿＿＿で行きます。",
            "answer": "自転車",
            "grammarNodeId": "l6_g3",
            "explanationZh": "填「自転車」。交通工具放在「で」前。",
        },
        7: {
            "type": "fill",
            "question": "京都へは何＿＿＿行きますか。",
            "answer": "で",
            "grammarNodeId": "l6_g3",
            "explanationZh": "填「で」。何で＝用什么方式去。",
        },
        8: {
            "type": "fill",
            "question": "私は来週、大阪へ新幹線で行きます。",
            "answer": "我下周坐新干线去大阪。",
            "grammarNodeId": "l6_g3",
            "explanationZh": "日译中：へ＋で 表目的地与手段。",
        },
        9: {
            "type": "fill",
            "question": "家から会社まで歩いて３０分です。",
            "answer": "从家到公司步行30分钟。",
            "grammarNodeId": "l6_g2",
            "explanationZh": "日译中：から～まで＋所需时间。",
        },
        10: {
            "type": "fill",
            "question": "你明天去学校吗？——是的，坐公交车去。",
            "answer": "明日、学校へ行きますか。 — はい、バスで行きます。",
            "grammarNodeId": "l6_g1",
            "explanationZh": "中译日：邀请/应答＋で 表方式。",
        },
        11: {
            "type": "fill",
            "question": "小李从东京到大阪去了。",
            "answer": "李さんは東京から大阪へ行きました。",
            "grammarNodeId": "l6_g2",
            "explanationZh": "中译日：から＋へ＋过去式。",
        },
        12: {
            "type": "choice",
            "question": "「東京から京都まで２時間半ぐらいです」中「から・まで」表示？",
            "options": ["时间点", "空间起点与终点", "工具手段", "存在场所"],
            "answer": 1,
            "grammarNodeId": "l6_g2",
            "explanationZh": "选「空间起点与终点」。与第5课时间范围同形。",
        },
    },
    7: {
        1: {
            "type": "choice",
            "question": "毎朝、牛乳＿＿＿飲みます。",
            "options_raw": "を　B. が　C. に　D. で → A",
            "answer": 0,
            "grammarNodeId": "l7_g1",
            "explanationZh": "选「を」。他动词宾语。",
        },
        2: {
            "type": "choice",
            "question": "私は＿＿＿映画を見ます。（週に１回くらい）",
            "options_raw": "いつも　B. よく　C. ときどき　D. あまり → C",
            "answer": 2,
            "grammarNodeId": "l7_g2",
            "explanationZh": "选「ときどき」。大约每周一次。",
        },
        3: {
            "type": "choice",
            "question": "一緒に映画を見＿＿＿。",
            "options_raw": "ます　B. ませんか　C. ました　D. ない → B",
            "answer": 1,
            "grammarNodeId": "l7_g3",
            "explanationZh": "选「ませんか」。邀请。",
        },
        4: {
            "type": "choice",
            "question": "コーヒーを＿＿＿ください。",
            "options_raw": "を　B. が　C. に　D. は → A",
            "answer": 0,
            "grammarNodeId": "l7_g4",
            "explanationZh": "选「を」。点单时宾语标记（口语可省略）。",
        },
        5: {
            "type": "fill",
            "question": "私は日曜日＿＿＿テニスをします。",
            "answer": "に",
            "grammarNodeId": "l7_g1",
            "explanationZh": "填「に」。星期几作时间用「に」。",
        },
        6: {
            "type": "fill",
            "question": "昨日、何＿＿＿食べましたか。",
            "answer": "を",
            "grammarNodeId": "l7_g1",
            "explanationZh": "填「を」。疑问词「何」作宾语。",
        },
        7: {
            "type": "fill",
            "question": "私はあまりテレビ＿＿＿見ません。",
            "answer": "を",
            "grammarNodeId": "l7_g1",
            "explanationZh": "填「を」。あまり～ない 仍须宾语「を」。",
        },
        8: {
            "type": "fill",
            "question": "李さんは毎日コーヒーを飲みます。",
            "answer": "小李每天喝咖啡。",
            "grammarNodeId": "l7_g1",
            "explanationZh": "日译中：毎日＋を。",
        },
        9: {
            "type": "fill",
            "question": "一緒に京都へ行きませんか。",
            "answer": "一起去京都好吗？",
            "grammarNodeId": "l7_g3",
            "explanationZh": "日译中：ませんか＝邀请。",
        },
        10: {
            "type": "fill",
            "question": "我有时看报纸。",
            "answer": "私はときどき新聞を読みます。",
            "grammarNodeId": "l7_g2",
            "explanationZh": "中译日：ときどき＋を。",
        },
        11: {
            "type": "fill",
            "question": "昨晚你喝了什么？——喝了啤酒。",
            "answer": "昨夜、何を飲みましたか。 — ビールを飲みました。",
            "grammarNodeId": "l7_g1",
            "explanationZh": "中译日：何を＋过去式。",
        },
        12: {
            "type": "choice",
            "question": "下列哪句正确？",
            "options": [
                "私は毎日映画を見る。",
                "私は毎日映画を見ます。",
                "私は毎日映画を見でます。",
            ],
            "answer": 1,
            "grammarNodeId": "l7_g1",
            "explanationZh": "选 B。叙述习惯用ます形；×見る 为辞書形。",
        },
    },
    8: {
        1: {
            "type": "choice",
            "question": "日本語＿＿＿話しましょう。",
            "options_raw": "を　B. が　C. で　D. に → C",
            "answer": 2,
            "grammarNodeId": "l8_g1",
            "explanationZh": "选「で」。用某种语言。",
        },
        2: {
            "type": "choice",
            "question": "私は友だちに本を＿＿＿。",
            "options_raw": "もらいました　B. あげました　C. くれました　D. くださいました → B",
            "answer": 1,
            "grammarNodeId": "l8_g2",
            "explanationZh": "选「あげました」。主语「我」给别人。",
        },
        3: {
            "type": "choice",
            "question": "私は先生＿＿＿辞書をもらいました。",
            "options_raw": "に　B. から　C. を　D. AもBも正しい → D",
            "answer": 3,
            "grammarNodeId": "l8_g3",
            "explanationZh": "选 D。もらう 对象可用「に」或「から」。",
        },
        4: {
            "type": "choice",
            "question": "友達＿＿＿プレゼントをくれました。",
            "options_raw": "は　B. に　C. が　D. の → C",
            "answer": 2,
            "grammarNodeId": "l8_g3",
            "explanationZh": "选「が」。给予者作主语。",
        },
        5: {
            "type": "fill",
            "question": "この手紙は日本語＿＿＿書きました。",
            "answer": "で",
            "grammarNodeId": "l8_g1",
            "explanationZh": "填「で」。用语言写信。",
        },
        6: {
            "type": "fill",
            "question": "私は母に花を＿＿＿。",
            "answer": "あげました",
            "grammarNodeId": "l8_g2",
            "explanationZh": "填「あげました」。我给妈妈花。",
        },
        7: {
            "type": "fill",
            "question": "昨日、李さん＿＿＿お菓子をもらいました。",
            "answer": "から",
            "grammarNodeId": "l8_g3",
            "explanationZh": "填「から」。从李先生处收到（に 亦可，本课答案用から）。",
        },
        8: {
            "type": "fill",
            "question": "私は日本から友達に中国のお茶をあげました。",
            "answer": "我从日本给朋友送了中国茶。",
            "grammarNodeId": "l8_g2",
            "explanationZh": "日译中：あげる 方向 我→友達。",
        },
        9: {
            "type": "fill",
            "question": "先生が私に本をくれました。とても嬉しかったです。",
            "answer": "老师给了我书。我很高兴。",
            "grammarNodeId": "l8_g3",
            "explanationZh": "日译中：くれる＝别人给我。",
        },
        10: {
            "type": "fill",
            "question": "我用日语写信给母亲。",
            "answer": "私は日本語で母に手紙を書きます。",
            "grammarNodeId": "l8_g1",
            "explanationZh": "中译日：で＋に＋を。",
        },
        11: {
            "type": "fill",
            "question": "你从谁那里得到这个的？——从森先生那里。",
            "answer": "誰からそれをもらいましたか。 — 森さんからです。",
            "grammarNodeId": "l8_g3",
            "explanationZh": "中译日：もらう＋から。",
        },
        12: {
            "type": "choice",
            "question": "「私は田中さんに本をくれました」正确吗？",
            "options": [
                "正确",
                "错误，应改为「あげました」",
                "错误，应改为「もらいました」",
            ],
            "answer": 1,
            "grammarNodeId": "l8_g3",
            "explanationZh": "选 B。主语是我时不能用「くれる」（给予者须是他人）。",
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
        else:
            q["answer"] = spec["answer"]
            q["questionTts"] = fill_tts(spec["question"], spec["answer"])
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
    print(f"[OK] patch-u2-lessons-5-8-biaori-truth: quiz {stats} · homework headers {hw}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
