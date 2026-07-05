#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 U3/U5/U6 精品逐词知识卡 · vocab_tips_curated_u3/u5/u6.py"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
LEGACY = ROOT / "scripts" / "vocab_tips_curated_data.py"

OUT_U3 = ROOT / "scripts" / "vocab_tips_curated_u3.py"
OUT_U5 = ROOT / "scripts" / "vocab_tips_curated_u5.py"
OUT_U6 = ROOT / "scripts" / "vocab_tips_curated_u6.py"


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def load_legacy_hand() -> dict[str, dict]:
    """从 vocab_tips_curated_data 抽取 _BASE_912 与 L17–24 注意词（生成前运行）。"""
    text = LEGACY.read_text(encoding="utf-8")
    out: dict[str, dict] = {}
    for block_name in ("CURATED", "_BASE_912"):
        m = re.search(rf"{block_name}: dict\[str, dict\] = \{{", text)
        if not m:
            m = re.search(rf"{block_name} = \{{", text)
        if not m:
            continue
        start = m.end()
        depth = 1
        i = start
        while i < len(text) and depth:
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
            i += 1
        block = text[start : i - 1]
        for vm in re.finditer(
            r'"(l\d+_v_\d+)":\s*\{\s*"zh":\s*\[(.*?)\],\s*"ref":\s*"([^"]+)"',
            block,
            re.S,
        ):
            vid, inner, ref = vm.group(1), vm.group(2), vm.group(3)
            lines = re.findall(r'"((?:[^"\\]|\\.)*)"', inner)
            if lines:
                out[vid] = {"zh": lines, "ref": ref}
    return out


def tip_l9(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if jp == "辛い":
        return [
            "课文：四川料理は辛いです。",
            "イ形四形：辛い／辛くない／辛かった／辛くなかった。",
        ], "l9_g1"
    if jp == "おいしい":
        return [
            "会話：とても辛いですが、美味しいです。",
            "否定「おいしくない」；勿读「おいしいかった」。",
        ], "l9_g3"
    if "イ形容" in pos or pos == "イ形":
        return [
            f"イ形容詞「{jp}」：い→くない／かった／くなかった。",
            "丁寧体：［い］です／［く］ないです。",
        ], "l9_g1"
    if jp == "あまり":
        return ["あまり～ない；须否定。", "×あまり辛い → ○あまり辛くない。"], "l9_g2"
    if jp in ("とても", "少し"):
        return [f"程度副词+イ形；{jp}辛いです。"], "l9_g1"
    if jp == "が":
        return ["辛いですが、美味しいです。转折。", "が前为原因／对比。"], "l9_g3"
    if jp == "寒い":
        return ["天气冷用「寒い」；物凉用「冷たい」。", "昨日は寒かったです。"], "l9_g1"
    if jp == "冷たい":
        return ["（物）凉；飲み物が冷たいです。", "≠寒い（天气）。"], "l9_g1"
    return [f"{zh}；第9课イ形活用・が・あまり。"], "l9_g1"


def tip_l10(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if jp == "有名":
        return ["课文：京都の紅葉は有名です。", "ナ形：有名です／ではありません／でした。"], "l10_g1"
    if jp == "きれい":
        return ["紅葉が本当にきれいでした。", "×きれいかった → ○きれいでした。"], "l10_g2"
    if jp == "静か":
        return ["この町は静かです。", "词干+です；勿加「く」。"], "l10_g1"
    if "ナ形容" in pos or pos == "ナ形":
        return [f"ナ形「{jp}」：词干＋です／ではありません／でした。", "×{jp}かった → ○{jp}でした。".format(jp=jp)], "l10_g1"
    if jp in ("どう", "いかが"):
        return ["京都はどうでしたか。", "征求感想。"], "l10_g4"
    return [f"{zh}；ナ形四种时态。"], "l10_g1"


def tip_l11(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if jp == "好き":
        return ["课文：小野さんは歌が好きです。", "对象用「が」，不用「を」。"], "l11_g1"
    if jp in ("上手", "下手", "得意", "苦手"):
        return [f"「{jp}」：～が{jp}です。", "×～を{jp} → ○が{jp}。"], "l11_g2"
    if jp == "嫌い":
        return ["～が嫌いです；程度弱于「大嫌い」。", "对象「が」。"], "l11_g1"
    if jp == "大好き":
        return ["程度强于「好き」。", "歌が大好きです。"], "l11_g1"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；好恶用「が」：{jp.replace('ます','')}が好きです。"], "l11_g1"
    return [f"{zh}；好き・上手・下手・得意。"], "l11_g1"


def tip_l12(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if jp == "広い":
        return ["课文：中国は日本より広いです。", "AはBより［い］です。"], "l12_g1"
    if jp == "狭い":
        return ["狭い↔広い。", "より／のほうが 比较。"], "l12_g1"
    if jp == "より":
        return ["比较基准：日本より。", "AよりBのほうが…。"], "l12_g1"
    if jp == "のほうが":
        return ["AのほうがBより［い］です。", "「ほう」=更…那个。"], "l12_g2"
    if jp == "一番":
        return ["クラスで一番背が高いです。", "范围内最高级。"], "l12_g3"
    if jp.startswith("どちら"):
        return [f"「{jp}」；二者比较礼貌问法。", "季節はどちらが好きですか。"], "l12_g1"
    if "イ形容" in pos:
        return [f"イ形比较：{jp}い／{jp}くない。", "より+形容词。"], "l12_g1"
    return [f"{zh}；より・のほうが・一番。"], "l12_g1"


def tip_l17(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    stem = jp.replace("ます", "").replace("る", "")
    if jp == "ほしい" or "ほしい" in jp:
        return ["课文：新しい洋服がほしいです。", "欲しい对象用「が」。"], "l17_g1"
    if "たい" in jp or jp.endswith("たい"):
        return ["行きたいです；动作愿望。", "何を食べたいですか。"], "l17_g2"
    if "ほしが" in jp or "たが" in jp:
        return ["第三人称愿望（了解）。", "李さんは車をほしがっています。"], "l17_g3"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；{jp}→辞書形+たい／がほしい。"], "l17_g2"
    return [f"{zh}；ほしい・たい。"], "l17_g1"


def tip_l18(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "くなる" in jp or jp.endswith("なる"):
        pass
    if jp in ("小さい", "大きい", "高い", "低い") or "イ形容" in pos:
        return [f"イ形：{jp}→{jp[:-1]}くなりました。", "携帯が小さくなりました。"], "l18_g1"
    if "ナ形容" in pos or jp in ("便利", "静か", "有名"):
        return [f"ナ形：{jp}になりました。", "生活が便利になりました。"], "l18_g2"
    if jp == "ほうがいい":
        return ["運動したほうがいいですよ。", "否定：吸わないほうがいい。"], "l18_g4"
    if "かもしれ" in jp:
        return ["明日は雨が降るかもしれません。", "也许；了解。"], "l18_g5"
    if jp.endswith("く") and len(jp) <= 4:
        return ["音を小さくしてください。", "人为变化くする。"], "l18_g3"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；变化・建议・推测本课语法。", "对照文法节点。"], "l18_g1"
    return [f"{zh}；くなる／になる／ほうがいい。"], "l18_g1"


def tip_l19(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "ない" in jp and "ください" not in jp:
        return ["ない形：食べる→食べない。", "×食べないでください 与 ないで 区分。"], "l19_g1"
    if "なければ" in jp:
        return ["出さなければなりません；义务。", "しなければなりません。"], "l19_g2"
    if "なくても" in jp:
        return ["来なくてもいい；不必。", "许可不必。"], "l19_g3"
    if jp == "かぎ" or "忘れ" in jp:
        return ["かぎを忘れないでください。", "ないでください＝请不要。"], "l19_g1"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；ます→ない形（见活用表）。", "ないで／なければ／なくても。"], "l19_g1"
    return [f"{zh}；ない形・义务・不必。"], "l19_g1"


def tip_l20(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "ことができる" in jp or "ことができます" in jp:
        return ["弾くことができます。", "辞書形+ことができる。"], "l20_g1"
    if "前に" in jp:
        return ["寝る前に；辞書形+前に。", "顺序：A前に、Bします。"], "l20_g3"
    if pos == "名" and jp == "辞書形":
        return ["可能形前用辞書形。", "見ることができる。"], "l20_g1"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；{jp.replace('ます','')}ることができます。"], "l20_g1"
    return [f"{zh}；可能形・前に。"], "l20_g1"


def tip_l21(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "たことが" in jp:
        return ["食べたことがあります；经验。", "日本に行ったことがありますか。"], "l21_g2"
    if jp == "あとで" or "後で" in jp:
        return ["食事をしたあとで、散歩します。", "た形+あとで。"], "l21_g3"
    if "ましょうか" in jp:
        return ["切符を買いましょうか。", "提议帮忙。"], "l21_g4"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；た形：{jp.replace('ます','')}た。", "たことがあります。"], "l21_g1"
    return [f"{zh}；经验・あとで。"], "l21_g2"


def tip_l22(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if jp == "予定":
        return ["送別会をする予定だ。", "辞書形+予定だ。"], "l22_g2"
    if jp in ("けど", "けれど"):
        return ["聞きたいんだけど…；口语铺垫。", "ですが→けど（友达）。"], "l22_g3"
    if jp == "かな":
        return ["来るかな；轻微疑问。", "敬体：来ますか。"], "l22_g4"
    if "方" in jp and "作り" in jp:
        return ["作り方を教えてくれる？", "～方＝…的方法。"], "l22_g6"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；简体：{jp.replace('ます','')}る。", "毎晩テレビを見る。"], "l22_g1"
    return [f"{zh}；简体・予定・けど。"], "l22_g1"


def tip_l23(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "たり" in jp:
        return ["散歩したり買い物に行ったり。", "たり…たり＝又…又。"], "l23_g1"
    if jp == "場合":
        return ["雨の場合は行きません。", "条件句。"], "l23_g2"
    if "かどうか" in jp:
        return ["行くかどうか分かりません。", "是否。"], "l23_g3"
    if jp == "によって":
        return ["人によって違います。", "因人而异。"], "l23_g5"
    if "あるか" in jp or jp == "どこ":
        return ["どこにあるか教えてください。", "间接疑问。"], "l23_g4"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；たり・場合・かどうか。", "对照课文。"], "l23_g1"
    return [f"{zh}；たり・場合。"], "l23_g1"


def tip_l24(v: dict) -> tuple[list[str], str]:
    jp, pos, zh = v["jp"], v["pos"], v["zh"]
    if "と思" in jp:
        return ["来ると思います。", "小句+と思います。"], "l24_g1"
    if "と言" in jp:
        return ["田中さんは行かないと言いました。", "引用转述。"], "l24_g2"
    if "んです" in jp or jp.endswith("んです"):
        return ["痛いんです；说明理由。", "行きたいんですが…铺垫。"], "l24_g3"
    if jp == "お元気で":
        return ["お元気で；告别祝愿。", "固定寒暄。"], "l24_g2"
    if jp == "お気をつけて":
        return ["送行：お気をつけてください。", "固定表达。"], "l24_g2"
    if pos.startswith("動") or "動(" in pos:
        return [f"{zh}；と思う・と言う・んです。", "第24课收束表达。"], "l24_g1"
    return [f"{zh}；转述・告别。"], "l24_g1"


BUILDERS: dict[int, object] = {
    **{i: tip_l9 for i in range(9, 10)},
    **{i: tip_l10 for i in range(10, 11)},
    **{i: tip_l11 for i in range(11, 12)},
    **{i: tip_l12 for i in range(12, 13)},
    **{i: tip_l17 for i in range(17, 21)},
    **{i: tip_l21 for i in range(21, 25)},
}


def build_range(
    lesson_ids: list[int],
    legacy: dict[str, dict],
) -> dict[str, dict]:
    lessons = load_lessons()
    out: dict[str, dict] = {}
    for lid in lesson_ids:
        fn = BUILDERS[lid]
        for v in lessons[lid].get("vocab") or []:
            vid = v["id"]
            if vid in legacy:
                out[vid] = legacy[vid]
                continue
            zh_lines, ref = fn(
                {"jp": v.get("jp", ""), "pos": v.get("pos", ""), "zh": v.get("meaningZh", "")}
            )
            out[vid] = {"zh": zh_lines, "ref": ref}
    out.update({k: v for k, v in legacy.items() if any(k.startswith(f"l{lid}_") for lid in lesson_ids)})
    return out


def emit_py(name: str, var: str, curated: dict[str, dict]) -> str:
    lines = [
        "# -*- coding: utf-8 -*-",
        f'"""{name} · 由 build-u3-u5-u6-vocab-curated.py 生成"""',
        "",
        f"{var}: dict[str, dict] = {{",
    ]

    def sort_key(vid: str) -> tuple[int, int]:
        a, _, b = vid.partition("_v_")
        return int(a[1:]), int(b)

    for vid in sorted(curated.keys(), key=sort_key):
        ent = curated[vid]
        lines.append(
            f'    {json.dumps(vid, ensure_ascii=False)}: '
            f'{{"zh": {json.dumps(ent["zh"], ensure_ascii=False)}, '
            f'"ref": {json.dumps(ent["ref"], ensure_ascii=False)}}},'
        )
    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    legacy = load_legacy_hand()
    u3 = build_range([9, 10, 11, 12], legacy)
    u5 = build_range([17, 18, 19, 20], legacy)
    u6 = build_range([21, 22, 23, 24], legacy)
    OUT_U3.write_text(emit_py("第3单元 L9–12", "U3_CURATED", u3), encoding="utf-8")
    OUT_U5.write_text(emit_py("第5单元 L17–20", "U5_CURATED", u5), encoding="utf-8")
    OUT_U6.write_text(emit_py("第6单元 L21–24", "U6_CURATED", u6), encoding="utf-8")
    print(f"[OK] U3 {len(u3)} · U5 {len(u5)} · U6 {len(u6)} · legacy hand {len(legacy)}")


if __name__ == "__main__":
    main()
