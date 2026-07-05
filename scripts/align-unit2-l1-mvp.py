#!/usr/bin/env python3
"""第2单元5–8课 · 严格对齐第1课 MVP（数据 + 生成 VOCAB_WARN 片段）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"
FLOW = ROOT / "js" / "lesson-1-flow.js"

# 会話灰字（本课课文 · 与 opener / A 轨一致）
UNIT2_DIALOGUE_ZH: dict[str, str] = {
    # L5
    "森さん、毎朝何時に起きますか。": "森先生，每天早上几点起床？",
    "６時半に起きます。": "6点半起床。",
    "じゃあ、朝ごはんは？": "那么，早饭呢？",
    "いつも７時に食べます。それから、７時半に家を出ます。": "总是7点吃。然后7点半出门。",
    "会社には何時に着きますか。": "几点到公司？",
    "８時ごろです。": "8点左右。",
    "李さんは？": "小李呢？",
    "私は６時に起きます。そして、朝ごはんを食べて、７時に家を出ます。": "我6点起床。然后吃早饭，7点出门。",
    "早いですね。": "真早啊。",
    "いいえ、森さんも早いですよ。": "不，森先生您也很早啊。",
    "李さんは昨夜何時に寝ましたか。": "小李昨晚几点睡的？",
    "１１時半に寝ました。": "11点半睡的。",
    "私は１２時です。": "我12点（睡）。",
    "みんな、頑張っていますね。": "大家都很努力呢。",
    # L6
    "李さん、来月の休みにどこかへ行きますか。": "小李，下个月休假要去哪儿吗？",
    "はい、京都へ行く予定です。": "嗯，打算去京都。",
    "いいですね。何で行きますか。": "好啊。坐什么去？",
    "新幹線で行きます。東京から京都まで２時間半ぐらいです。": "坐新干线。从东京到京都大约两个半小时。",
    "一人で行きますか。": "一个人去吗？",
    "いいえ、友達と一緒に行きます。": "不，和朋友一起去。",
    "そうですか。楽しみですね。": "是吗。很期待啊。",
    "小野さんもどこかへ行きますか。": "小野你也打算去哪儿吗？",
    "私はまだ決めていません。温泉に行きたいです。": "我还没定。想去泡温泉。",
    "箱根はどうですか。": "箱根怎么样？",
    "箱根もいいですね。ちょっと考えます。": "箱根也不错。我再想想。",
    "じゃあ、また後で。": "那回头再说。",
    # L7
    "いらっしゃいませ。ご注文はお決まりですか。": "欢迎光临。您点好了吗？",
    "すみません、ちょっとまだ… 李さん、何にしますか。": "不好意思，还没……小李，你点什么？",
    "私はコーヒーにします。小野さんは？": "我点咖啡。小野呢？",
    "私は紅茶にします。": "我点红茶。",
    "コーヒーと紅茶ですね。": "咖啡和红茶是吧。",
    "はい。それと、ケーキもありますか。": "嗯。还有蛋糕吗？",
    "はい、あります。今日はチーズケーキとショートケーキです。": "有的。今天是芝士蛋糕和海绵蛋糕。",
    "じゃあ、チーズケーキを一つください。": "那请给我一个芝士蛋糕。",
    "私は結構です。": "我不用了。",
    "かしこまりました。少々お待ちください。": "好的。请稍等。",
    "（数分後）": "（几分钟后）",
    "李さんはよくカフェへ来ますか。": "小李常来咖啡馆吗？",
    "いいえ、あまり来ません。小野さんは？": "不，不太来。小野呢？",
    "私はときどき来ます。ここは静かでいいですね。": "我偶尔来。这里很安静，不错。",
    "そうですね。また一緒に来ましょう。": "是啊。下次一起来吧。",
    "はい、ぜひ。": "好的，一定。",
    # L8
    "小野さん、これ、プレゼントです。中国のお菓子です。": "小野，这是礼物。中国的点心。",
    "まあ、ありがとうございます。開けてもいいですか。": "哎呀，谢谢。可以打开吗？",
    "はい、どうぞ。": "嗯，请。",
    "わあ、きれいな箱ですね。何が入っていますか。": "哇，盒子好漂亮。里面是什么？",
    "中にクッキーやキャンディなどが入っています。": "里面有饼干、糖果等。",
    "ありがとうございます。とても嬉しいです。": "谢谢。非常高兴。",
    "いいえ、どういたしまして。": "不客气。",
    "李さん、先月はありがとうございました。私からもプレゼントです。": "小李，上个月谢谢你。我也送你礼物。",
    "えっ、いいんですか。開けてもいいですか。": "诶，可以吗。可以打开吗？",
    "もちろん。": "当然。",
    "あっ、日本の文房具ですね。とても便利そうです。": "啊，是日本的文具。看起来很实用。",
    "どうぞ使ってください。": "请用吧。",
    "森さん、小野さん、本当にありがとうございました。": "森先生、小野，真的非常感谢。",
    "（後日、李からお礼の手紙を書くシーン）": "（日后，小李写感谢信的场景）",
    "李（ナレーション）：小野さんと森さんに、日本語でお礼の手紙を書きます。": "李（旁白）：给小野和森写日语感谢信。",
    "李さんから手紙が来ました。日本語で書いてありますね。": "小李来信了。是用日语写的呢。",
    "読みましょう。『お世話になりました。日本でとても楽しかったです。また会いましょう。』": "我们来读吧。「承蒙关照。在日本很开心。再会吧。」",
    "李さんは日本語が上手ですね。": "小李日语真好啊。",
}

VOCAB_WARN: dict[int, list[str]] = {
    5: ["l5_v_1", "l5_v_2", "l5_v_3", "l5_v_11", "l5_v_13", "l5_v_14", "l5_v_21", "l5_v_22"],
    6: ["l6_v_1", "l6_v_2", "l6_v_3", "l6_v_10", "l6_v_11", "l6_v_29", "l6_v_30", "l6_v_31", "l6_v_32"],
    7: ["l7_v_1", "l7_v_9", "l7_v_11", "l7_v_29", "l7_v_31", "l7_v_32", "l7_v_33"],
    8: ["l8_v_5", "l8_v_6", "l8_v_7", "l8_v_1", "l8_v_3", "l8_v_4"],
}

VERB_CONJ: dict[str, tuple[str, str, dict[str, str]]] = {
    "起きます": ("2类", "起きる", {"辞書": "起きる", "ます": "起きます", "ません": "起きません", "ました": "起きました", "ませんでした": "起きませんでした"}),
    "寝ます": ("2类", "寝る", {"辞書": "寝る", "ます": "寝ます", "ません": "寝ません", "ました": "寝ました", "ませんでした": "寝ませんでした"}),
    "働きます": ("1类", "働く", {"辞書": "働く", "ます": "働きます", "ません": "働きません", "ました": "働きました", "ませんでした": "働きませんでした"}),
    "休みます": ("1类", "休む", {"辞書": "休む", "ます": "休みます", "ません": "休みません", "ました": "休みました", "ませんでした": "休みませんでした"}),
    "勉強します": ("サ変", "勉強する", {"辞書": "勉強する", "ます": "勉強します", "ません": "勉強しません", "ました": "勉強しました", "ませんでした": "勉強しませんでした"}),
    "終わります": ("1类", "終わる", {"辞書": "終わる", "ます": "終わります", "ません": "終わりません", "ました": "終わりました", "ませんでした": "終わりませんでした"}),
    "行きます": ("1类", "行く", {"辞書": "行く", "ます": "行きます", "ません": "行きません", "ました": "行きました", "ませんでした": "行きませんでした"}),
    "来ます": ("3类", "来る", {"辞書": "来る", "ます": "来ます", "ません": "来ません", "ました": "来ました", "ませんでした": "来ませんでした"}),
    "帰ります": ("1类", "帰る", {"辞書": "帰る", "ます": "帰ります", "ません": "帰りません", "ました": "帰りました", "ませんでした": "帰りませんでした"}),
    "飲みます": ("1类", "飲む", {"辞書": "飲む", "ます": "飲みます", "ません": "飲みません", "ました": "飲みました", "ませんでした": "飲みませんでした"}),
    "食べます": ("2类", "食べる", {"辞書": "食べる", "ます": "食べます", "ません": "食べません", "ました": "食べました", "ませんでした": "食べませんでした"}),
    "見ます": ("2类", "見る", {"辞書": "見る", "ます": "見ます", "ません": "見ません", "ました": "見ました", "ませんでした": "見ませんでした"}),
    "買います": ("1类", "買う", {"辞書": "買う", "ます": "買います", "ません": "買いません", "ました": "買いました", "ませんでした": "買いませんでした"}),
    "もらいます": ("1类", "もらう", {"辞書": "もらう", "ます": "もらいます", "ません": "もらいません", "ました": "もらいました", "ませんでした": "もらいませんでした"}),
    "あげます": ("2类", "あげる", {"辞書": "あげる", "ます": "あげます", "ません": "あげません", "ました": "あげました", "ませんでした": "あげませんでした"}),
    "くれます": ("2类", "くれる", {"辞書": "くれる", "ます": "くれます", "ません": "くれません", "ました": "くれました", "ませんでした": "くれませんでした"}),
    "書きます": ("1类", "書く", {"辞書": "書く", "ます": "書きます", "ません": "書きません", "ました": "書きました", "ませんでした": "書きませんでした"}),
    "撮ります": ("1类", "撮る", {"辞書": "撮る", "ます": "撮ります", "ません": "撮りません", "ました": "撮りました", "ませんでした": "撮りませんでした"}),
    "差します": ("1类", "差す", {"辞書": "差す", "ます": "差します", "ません": "差しません", "ました": "差しました", "ませんでした": "差しませんでした"}),
    "渡します": ("1类", "渡す", {"辞書": "渡す", "ます": "渡します", "ません": "渡しません", "ました": "渡しました", "ませんでした": "渡しませんでした"}),
    "教えます": ("2类", "教える", {"辞書": "教える", "ます": "教えます", "ません": "教えません", "ました": "教えました", "ませんでした": "教えませんでした"}),
    "読みます": ("1类", "読む", {"辞書": "読む", "ます": "読みます", "ません": "読みません", "ました": "読みました", "ませんでした": "読みませんでした"}),
    "聞きます": ("1类", "聞く", {"辞書": "聞く", "ます": "聞きます", "ません": "聞きません", "ました": "聞きました", "ませんでした": "聞きませんでした"}),
    "掃除します": ("サ変", "掃除する", {"辞書": "掃除する", "ます": "掃除します", "ません": "掃除しません", "ました": "掃除しました", "ませんでした": "掃除しませんでした"}),
}

REVIEW_EXTRA_BLOCKS: dict[int, list[dict]] = {
    5: [
        {
            "title": "📋 一日の予定テンプレート（模板）",
            "lines": [
                "毎朝［時刻］に起きます。",
                "［時刻］に朝ごはんを食べます。それから、［時刻］に家を出ます。",
                "［場所］には［時刻］ごろ着きます。",
                "夜は［時刻］ごろ寝ます。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× 今日に行きます　○ 今日行きます（抽象时间不加に）",
                "× ６時半を　○ ６時半に（时间点用に）",
                "× 毎朝６時に起きる　○ 起きます（叙述作息用ます形）",
                "× から・まで颠倒　○ ９時から５時まで",
            ],
        },
    ],
    6: [
        {
            "title": "📋 旅行の予定テンプレート（模板）",
            "lines": [
                "来月、［場所］へ行く予定です。",
                "［交通手段］で行きます。［起点］から［终点］まで［時間］ぐらいです。",
                "［一人／友達と］行きます。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× 東京に行きます（错强调）　○ 東京へ行きます（方向）／東京に行きます（到达点）",
                "× バスに乗ります　○ バスで行きます（手段用で）",
                "× 歩くで帰ります　○ 歩いて帰ります（て形表方式）",
                "× から・まで只用一个　○ 東京から大阪まで",
            ],
        },
    ],
    7: [
        {
            "title": "📋 カフェ注文テンプレート（模板）",
            "lines": [
                "［飲み物］にします。",
                "［物］を一つください。",
                "結構です。（婉拒）",
                "また一緒に来ましょう。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× コーヒーをします　○ コーヒーにします（选择用に）",
                "× ケーキを食べます（店内点单）　○ ケーキをください",
                "× 一つケーキ　○ ケーキを一つ（数量置后）",
            ],
        },
    ],
    8: [
        {
            "title": "📋 贈り物・お礼テンプレート（模板）",
            "lines": [
                "これ、プレゼントです。どうぞ。",
                "開けてもいいですか。 — はい、どうぞ。",
                "ありがとうございます。とても嬉しいです。",
                "お世話になりました。また会いましょう。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× プレゼントをあげました（方向错）　○ 李さんにプレゼントをあげました",
                "× もらいました（缺授受对象）　○ 小野さんにもらいました",
                "× くれました（自称视角错）　○ 森さんがくれました",
            ],
        },
    ],
}

EXTRA_QUIZ: dict[int, list[dict]] = {
    5: [
        {
            "id": "l5_q6",
            "type": "fill",
            "question": "昨日、私はあまり勉強し＿＿＿。",
            "answer": "ませんでした",
            "explanation": "",
            "grammarNodeId": "l5_g1",
        },
        {
            "id": "l5_q7",
            "type": "fill",
            "question": "朝ごはんを７時＿＿＿食べます。",
            "answer": "ごろ",
            "explanation": "",
            "grammarNodeId": "l5_g1",
        },
        {
            "id": "l5_q12",
            "type": "choice",
            "question": "下列哪句叙述日常作息正确？",
            "options": ["私は毎朝６時に起きる。", "私は毎朝６時に起きます。", "私は毎朝６時で起きます。"],
            "answer": 1,
            "explanation": "",
            "grammarNodeId": "l5_g1",
        },
    ],
    6: [
        {
            "id": "l6_q6",
            "type": "fill",
            "question": "京都＿＿＿行きます。",
            "answer": "へ",
            "explanation": "",
            "grammarNodeId": "l6_g1",
        },
        {
            "id": "l6_q7",
            "type": "fill",
            "question": "新幹線＿＿＿行きます。",
            "answer": "で",
            "explanation": "",
            "grammarNodeId": "l6_g3",
        },
        {
            "id": "l6_q12",
            "type": "choice",
            "question": "「東京から京都まで２時間半ぐらいです」中「から・まで」表示？",
            "options": ["时间点", "空间起点与终点", "工具手段", "存在场所"],
            "answer": 1,
            "explanation": "",
            "grammarNodeId": "l6_g5",
        },
    ],
    7: [
        {
            "id": "l7_q6",
            "type": "fill",
            "question": "私はコーヒー＿＿＿します。",
            "answer": "に",
            "explanation": "",
            "grammarNodeId": "l7_g1",
        },
        {
            "id": "l7_q7",
            "type": "fill",
            "question": "チーズケーキを一つ＿＿＿。",
            "answer": "ください",
            "explanation": "",
            "grammarNodeId": "l7_g2",
        },
        {
            "id": "l7_q12",
            "type": "choice",
            "question": "点咖啡时自然说法是？",
            "options": ["コーヒーを食べます", "コーヒーにします", "コーヒーがあります"],
            "answer": 1,
            "explanation": "",
            "grammarNodeId": "l7_g1",
        },
    ],
    8: [
        {
            "id": "l8_q6",
            "type": "fill",
            "question": "李さん＿＿＿プレゼントをあげました。",
            "answer": "に",
            "explanation": "",
            "grammarNodeId": "l8_g1",
        },
        {
            "id": "l8_q7",
            "type": "fill",
            "question": "小野さん＿＿＿プレゼントをもらいました。",
            "answer": "から",
            "explanation": "",
            "grammarNodeId": "l8_g2",
        },
        {
            "id": "l8_q12",
            "type": "choice",
            "question": "「森さんがくれました」中「くれます」表示？",
            "options": ["说话人给别人", "别人给说话人一方", "中立描述", "请求"],
            "answer": 1,
            "explanation": "",
            "grammarNodeId": "l8_g3",
        },
    ],
}

GRAMMAR_ZH_FIX: dict[str, str] = {
    "l6_g5": "第5课学时间范围「から～まで」，本课同一结构用于空间：起点から＋终点まで。例：東京から京都まで。",
}


def load_lessons() -> tuple[str, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, json.loads(m.group(1))


def find_lesson_span(text: str, lid: int) -> tuple[int, int] | None:
    marker = f'"lessonId": {lid},'
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.rfind("{", 0, idx)
    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
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


def save_lesson(text: str, L: dict) -> str:
    lid = L["lessonId"]
    span = find_lesson_span(text, lid)
    if not span:
        raise SystemExit(f"lessonId {lid} span not found")
    rest = text[span[1] :].lstrip()
    trailing_comma = rest.startswith("{")
    blob = serialize_lesson(L, trailing_comma=trailing_comma)
    return text[: span[0]] + blob + text[span[1] :]


def save_lessons_u2_only(text: str, lessons: list) -> None:
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in (5, 6, 7, 8):
        text = save_lesson(text, by_id[lid])
    DATA.write_text(text, encoding="utf-8")


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def fill_dialogue_chinese(L: dict) -> int:
    n = 0
    for d in L.get("dialogues") or []:
        op = d.get("opener") or {}
        jp = norm_jp(op.get("japanese", ""))
        if jp and not (op.get("chinese") or "").strip() and jp in UNIT2_DIALOGUE_ZH:
            op["chinese"] = UNIT2_DIALOGUE_ZH[jp]
            n += 1
        for r in (d.get("userTurn") or {}).get("replies") or []:
            jp2 = norm_jp(r.get("japanese", ""))
            if jp2 and not (r.get("chinese") or "").strip() and jp2 in UNIT2_DIALOGUE_ZH:
                r["chinese"] = UNIT2_DIALOGUE_ZH[jp2]
                n += 1
    return n


def patch_vocab(L: dict, lid: int) -> None:
    warn = set(VOCAB_WARN.get(lid, []))
    for v in L.get("vocab") or []:
        jp = (v.get("jp") or "").strip()
        if jp in VERB_CONJ and "動" in (v.get("pos") or ""):
            t, _, forms = VERB_CONJ[jp]
            v["conjugation"] = {"type": t, "forms": forms}


def patch_review_extension(L: dict, lid: int) -> None:
    extra = REVIEW_EXTRA_BLOCKS.get(lid, [])
    if not extra:
        return
    rext = L.get("reviewExtension") or []
    titles = {(x.get("title") or "") for x in rext}
    insert = []
    for blk in extra:
        if blk["title"] not in titles:
            insert.append(blk)
    if not insert:
        return
    # 插在「ユニットテスト予告」之前
    out = []
    for blk in rext:
        if "ユニットテスト" in (blk.get("title") or ""):
            out.extend(insert)
            insert = []
        out.append(blk)
    if insert:
        out.extend(insert)
    L["reviewExtension"] = out


def patch_quiz(L: dict, lid: int) -> None:
    qs = L.get("quizQuestions") or []
    have = {q.get("id") for q in qs}
    for q in EXTRA_QUIZ.get(lid, []):
        if q["id"] not in have:
            qs.append(q)
    L["quizQuestions"] = qs


def patch_grammar(L: dict) -> None:
    for g in L.get("grammarNodes") or []:
        gid = g.get("id") or ""
        if not (g.get("explanationZh") or "").strip() and gid in GRAMMAR_ZH_FIX:
            g["explanationZh"] = GRAMMAR_ZH_FIX[gid]


def patch_abc_chinese() -> int:
    text = ABC.read_text(encoding="utf-8")
    text = text.replace('。",,', '。",')
    n = 0
    for jp, zh in UNIT2_DIALOGUE_ZH.items():
        esc = re.escape(jp)
        pat = rf'(label: "A",\s*rank: 1,\s*japanese: "{esc}",)\s*chinese: ""'
        repl = rf'\1\n        chinese: "{zh}",'
        text, c = re.subn(pat, repl, text)
        n += c
    ABC.write_text(text, encoding="utf-8")
    return n


def patch_lesson1_flow_warn() -> None:
    """由 align 脚本写入 VOCAB_WARN 常量，供手贴 lesson-1-flow.js（避免误改 1–4 分支）。"""
    out = ROOT / "scripts" / "_unit2-vocab-warn-snippet.js"
    parts = ["  const VOCAB_WARN_BY_LESSON = {"]
    parts.append('    2: new Set(["l2_v_1", "l2_v_2", "l2_v_3", "l2_v_4", "l2_v_28", "l2_v_31"]),')
    parts.append('    3: new Set(["l3_v_2", "l3_v_3", "l3_v_4", "l3_v_5", "l3_v_6"]),')
    parts.append('    4: new Set(["l4_v_2", "l4_v_3", "l4_v_4", "l4_v_5"]),')
    for lid in (5, 6, 7, 8):
        inner = ", ".join(f'"{x}"' for x in VOCAB_WARN[lid])
        parts.append(f"    {lid}: new Set([{inner}]),")
    parts.append("  };")
    out.write_text("\n".join(parts) + "\n", encoding="utf-8")


def align_data() -> dict:
    text, lessons = load_lessons()
    stats = {"dialogue_zh": 0, "abc_zh": 0, "quiz": 0}
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in (5, 6, 7, 8):
        L = by_id[lid]
        stats["dialogue_zh"] += fill_dialogue_chinese(L)
        patch_vocab(L, lid)
        patch_review_extension(L, lid)
        before = len(L.get("quizQuestions") or [])
        patch_quiz(L, lid)
        stats["quiz"] += len(L.get("quizQuestions") or []) - before
        patch_grammar(L)
    save_lessons_u2_only(text, lessons)
    stats["abc_zh"] = patch_abc_chinese()
    patch_lesson1_flow_warn()
    return stats


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    stats = align_data()
    print("[OK] align-unit2-l1-mvp:", stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
