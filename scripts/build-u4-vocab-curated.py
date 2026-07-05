#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 scripts/vocab_tips_curated_u4.py · 第4单元 L13–16 精品逐词知识卡"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
EXPORT = ROOT / "scripts" / "_u4_vocab_export.json"
OUT = ROOT / "scripts" / "vocab_tips_curated_u4.py"

# 第14课 · て形（辞書形 → て）
TE_BY_JP: dict[str, tuple[str, str]] = {
    "行く": ("行って", "1类·く→いて特例"),
    "帰る": ("帰って", "1类·る→って"),
    "聞く": ("聞いて", "1类·く→いて"),
    "言う": ("言って", "1类·う→って"),
    "呼ぶ": ("呼んで", "1类·ぶ→んで"),
    "取る": ("取って", "1类·る→って"),
    "書く": ("書いて", "1类·く→いて"),
    "泳ぐ": ("泳いで", "1类·ぐ→いで"),
    "死ぬ": ("死んで", "1类·ぬ→んで"),
    "待つ": ("待って", "1类·つ→って"),
    "食べる": ("食べて", "2类·る→て"),
    "寝る": ("寝て", "2类"),
    "起きる": ("起きて", "2类"),
    "掛ける": ("掛けて", "2类·挂电话／开灯"),
    "上げる": ("上げて", "2类"),
    "見る": ("見て", "2类"),
    "出かける": ("出かけて", "2类"),
    "点ける": ("点けて", "2类·开灯"),
    "閉める": ("閉めて", "2类·关门窗"),
    "開ける": ("開けて", "2类"),
    "する": ("して", "3类サ変"),
    "来る": ("来て", "3类カ変"),
    "勉強する": ("勉強して", "3类"),
    "練習する": ("練習して", "3类"),
}

# 第15课 · て形 → ています
TEIRU_BY_JP: dict[str, str] = {
    "読む": "読んでいます",
    "書く": "書いています",
    "聞く": "聞いています",
    "見る": "見ています",
    "飲む": "飲んでいます",
    "食べる": "食べています",
    "話す": "話しています",
    "返す": "返しています",
    "出かける": "出かけています",
    "遊ぶ": "遊んでいます",
    "働く": "働いています",
    "急ぐ": "急いでいます",
    "休む": "休んでいます",
    "結婚する": "結婚しています",
    "心配する": "心配しています",
}

# 第16课 · イ形て / ナ形で / 自动词ている
I_ADJ_TE: dict[str, str] = {
    "広い": "広くて",
    "狭い": "狭くて",
    "明るい": "明るくて",
    "暗い": "暗くて",
    "新しい": "新しくて",
    "古い": "古くて",
}
NA_ADJ_DE: dict[str, str] = {
    "静か": "静かで",
    "賑やか": "賑やかで",
    "綺麗": "きれいで",
    "便利": "便利で",
    "大変": "大変で",
    "丈夫": "丈夫で",
    "安全": "安全で",
}
STATE_IRU: dict[str, str] = {
    "割れる": "割れています",
    "壊れる": "壊れています",
    "折れる": "折れています",
    "閉まる": "閉まっています",
    "点く": "点いています",
    "開く": "開いています",
    "知っている": "知っています",
    "閉まっている": "閉まっています",
    "点いている": "点いています",
    "開いている": "開いています",
}

COUNTER_USE: dict[str, str] = {
    "～冊": "本・ノート・雑誌；机の上に本が三冊あります。",
    "～枚": "紙・切手・葉書・写真；切手五枚。",
    "～台": "機械・車；パソコン一台。",
    "～個": "小物；卵六個。×本三個。",
    "～本": "細長物；鉛筆三本・ビール二本。",
    "～匹": "小動物；猫二匹。",
    "～人": "人間；学生五人。",
    "～杯": "飲み物；コーヒー二杯。",
    "～回": "回数；一回・何回。",
}

COUNTER_Q: dict[str, str] = {
    "何冊": "本が何冊ありますか。",
    "何枚": "切手が何枚ありますか。",
    "何台": "パソコンが何台ありますか。",
    "何個": "冷蔵庫に卵が何個ありますか。（课文）",
    "何本": "鉛筆が何本ありますか。",
    "何匹": "部屋に猫が何匹いますか。",
    "何人": "学生が何人いますか。",
    "何杯": "コーヒーを何杯飲みますか。",
    "何回": "何回行きましたか。",
}

LOC_WORDS = {"上", "下", "前", "後ろ", "左", "右", "中", "外", "隣", "横"}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def tip_l13(v: dict) -> tuple[list[str], str]:
    vid, jp, pos, zh = v["id"], v["jp"], v["pos"], v["zh"]
    if jp in COUNTER_USE:
        return [COUNTER_USE[jp], "名＋数＋助数词＋あります／います。"], "l13_g1"
    if jp in COUNTER_Q:
        return [COUNTER_Q[jp], "何＋助数词；答：数＋助数词。"], "l13_g4"
    if jp == "どのくらい":
        return [
            "数量・程度疑问：卵がどのくらいありますか。",
            "≈どれくらい；本课与助数词连用。",
        ], "l13_g4"
    if jp in LOC_WORDS:
        return [f"場所：机の{jp}に…；{jp}に本があります。"], "l13_g2"
    if jp == "机":
        return ["课文：机の上に本が三冊あります。", "存在句：場所に＋物が＋数＋あります。"], "l13_g1"
    if jp == "本":
        return ["本が三冊あります；书用「冊」不用「個」。", "×本三個 → ○本三冊。"], "l13_g1"
    if jp == "卵":
        return ["冷蔵庫に卵が何個ありますか。（课文）", "小圆物用「個」。"], "l13_g3"
    if jp == "猫":
        return ["部屋に猫が二匹います。（课文）", "动物用「います」不用「あります」。"], "l13_g1"
    if jp == "犬":
        return ["犬も「匹」；犬が一匹います。"], "l13_g1"
    if jp == "ノート":
        return ["このノートを三冊ください。（会話）", "动作中数量：を＋数＋助数词。"], "l13_g3"
    if jp == "切手":
        return ["切手五枚；薄平物用「枚」。"], "l13_g1"
    if jp == "林檎":
        return ["りんごは「個」；林檎＝苹果汉字。"], "l13_g1"
    if jp == "蜜柑":
        return ["みかんは「個」。"], "l13_g1"
    if jp == "冷蔵庫":
        return ["冷蔵庫に卵が…；存在场所用「に」。"], "l13_g3"
    return [f"{zh}；第13课配数量词与存在句。"], "l13_g2"


def tip_l14(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if jp in TE_BY_JP:
        te, note = TE_BY_JP[jp]
        lines = [f"て形：{jp}→{te}（{note}）。"]
        if jp == "行く":
            lines.append("课文：デパートへ行って、買い物しました。")
            return lines, "l14_g2"
        if jp == "食べる":
            lines.append("ご飯を食べてから、勉強します。（てから）")
            return lines, "l14_g4"
        if jp == "書く":
            lines.append("ここに名前を書いてください。（てください）")
            return lines, "l14_g3"
        if jp == "持つ" or jp == "取る":
            pass
        return lines, "l14_g2"
    if jp == "買い物":
        return ["行って、買い物をしました；て形连接两动作。"], "l14_g2"
    if jp == "デパート":
        return ["デパートへ行って…；へ＋行く。"], "l14_g2"
    if jp == "ご飯":
        return ["食べてから＝吃完之后；から前须て形。"], "l14_g4"
    if jp == "荷物":
        return ["荷物が重いですね。私が持ちましょうか。（课文·提议）"], "l14_g5"
    return [f"{zh}；本课重点て形连接与请求。"], "l14_g2"


def tip_l15(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if jp in TEIRU_BY_JP:
        lines = [f"进行／习惯：{TEIRU_BY_JP[jp]}。"]
        if jp == "読む":
            lines.insert(0, "课文：小野さんは今新聞を読んでいます。")
            return lines, "l15_g1"
        if jp == "毎朝":
            return ["毎朝6時に起きています。（课文·习惯）", "时间＋に＋ています。"], "l15_g2"
        return lines, "l15_g1"
    if jp == "写真":
        return ["写真を撮ってもいいですか。（许可）", "て＋もいいですか＝可以…吗。"], "l15_g4"
    if jp == "今":
        return ["今…ています＝正在进行。", "×今…ます → 进行用ています。"], "l15_g1"
    if jp == "毎日":
        return ["毎日…ています＝习惯动作。", "毎朝6時に起きています。"], "l15_g2"
    if jp == "全然":
        return ["全然～ない＝完全不（须否定）。", "×全然食べます → ○全然食べません。"], "l15_g1"
    if jp == "まだ":
        return ["まだ…ていません＝还没…。", "与「もう」对照。"], "l15_g1"
    return [f"{zh}；本课～ています／～てもいいです。"], "l15_g1"


def tip_l16(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if jp in I_ADJ_TE:
        te = I_ADJ_TE[jp]
        lines = [f"イ形て：{jp}→{te}；広くて明るいです。"]
        if jp == "広い":
            lines[0] = "课文：この部屋は広くて明るいです。"
        return lines, "l16_g1"
    if jp in NA_ADJ_DE:
        return [f"ナ形：{jp}→{NA_ADJ_DE[jp]}；静かできれいです。", "词干＋で，不用「く」。"], "l16_g2"
    if jp in STATE_IRU or jp in ("割れる", "壊れる", "閉まる", "開く", "点く"):
        st = STATE_IRU.get(jp, "")
        if jp == "割れる":
            return ["课文：窓が割れています。", "结果状态；非「割れます」进行。"], "l16_g3"
        if jp == "閉まる":
            return ["ドアが閉まっています。（自动词）", "他动「閉める」≠自动「閉まる」。"], "l16_g3"
        if st:
            return [f"状態：{st}。", "自动词＋ています＝处于…状态。"], "l16_g3"
    if jp == "知る":
        return ["×知ります（状态）→ ○知っています。", "知る→知っている＝已经知道。"], "l16_g3"
    if jp == "と言う":
        return ["「富士山」という山があります。", "～という＝叫做…（了解）。"], "l16_g5"
    if jp == "ホテル":
        return ["このホテルの部屋は広くて明るいですが…（が转折）"], "l16_g4"
    if jp == "窓":
        return ["窓が割れています／窓から庭が見えます。"], "l16_g3"
    return [f"{zh}；イ／ナ形て形或状態ています。"], "l16_g1"


# 人工加厚（覆盖生成器单行 fallback）
HAND_PATCH: dict[str, dict] = {
    "l13_v_2": {"zh": ["机のそばに椅子があります。", "存在句同样：場所に＋物が＋あります。"], "ref": "l13_g2"},
    "l13_v_11": {"zh": ["鋏⓪；文具名词，计数用「丁／把」了解即可，本课重点在冊・枚。"], "ref": "l13_g1"},
    "l14_v_44": {"zh": ["すぐ＝马上；すぐ帰ります。", "副词放动词前，本课て形句可连用。"], "ref": "l14_g2"},
    "l15_v_34": {"zh": ["ちょっと＝稍微；ちょっと待ってください。", "请求常用；与许可句可并用。"], "ref": "l15_g4"},
    "l16_v_33": {"zh": ["エアコンはついています。（会話）", "つく→点いている；自动词状态。"], "ref": "l16_g3"},
}


def build() -> dict[str, dict]:
    lessons = load_lessons()
    out: dict[str, dict] = {}
    builders = {13: tip_l13, 14: tip_l14, 15: tip_l15, 16: tip_l16}
    for lid, fn in builders.items():
        for v in lessons[lid].get("vocab") or []:
            vid = v["id"]
            zh_lines, ref = fn(
                {"id": vid, "jp": v.get("jp", ""), "pos": v.get("pos", ""), "zh": v.get("meaningZh", "")}
            )
            out[vid] = {"zh": zh_lines, "ref": ref}
    out.update(HAND_PATCH)
    return out


def emit_py(curated: dict[str, dict]) -> str:
    lines = [
        '# -*- coding: utf-8 -*-',
        '"""第4单元 L13–16 精品逐词知识卡 · 由 build-u4-vocab-curated.py 生成"""',
        "",
        "U4_CURATED: dict[str, dict] = {",
    ]
    for vid in sorted(curated.keys(), key=lambda x: (int(x.split("_")[0][1:]), int(x.split("_")[-1]))):
        ent = curated[vid]
        zh = ent["zh"]
        ref = ent["ref"]
        zh_repr = json.dumps(zh, ensure_ascii=False)
        lines.append(f'    {json.dumps(vid, ensure_ascii=False)}: {{"zh": {zh_repr}, "ref": {json.dumps(ref, ensure_ascii=False)}}},')
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    curated = build()
    OUT.write_text(emit_py(curated), encoding="utf-8")
    print(f"[OK] {OUT.name} · {len(curated)} entries")


if __name__ == "__main__":
    main()
