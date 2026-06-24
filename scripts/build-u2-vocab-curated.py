#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 scripts/vocab_tips_curated_u2.py · 第2单元 L5–8 精品逐词知识卡（141 条）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "scripts" / "vocab_tips_curated_u2.py"
L78_FALLBACK = ROOT / "scripts" / "vocab_tips_curated_l78_snapshot.py"

TIME_SUFFIX = {"時", "分", "半"}
TIME_WORDS = {
    "今": ("表现在时刻；今何時ですか。", "l5_g3"),
    "午前": ("午前９時；上午时段。", "l5_g2"),
    "午後": ("午後３時；下午。", "l5_g2"),
    "朝": ("毎朝６時に起きます。（课文）", "l5_g3"),
    "晩": ("毎晩１０時に寝ます。", "l5_g2"),
    "夜": ("夜１１時；与晩区分了解。", "l5_g2"),
}
FREQ_L5 = {
    "毎朝": ("毎朝６時半に起きます。", "l5_g3"),
    "毎晩": ("毎晩寝ます；频率后接ます形，不加に。", "l5_g2"),
    "毎日": ("毎日働きます；与钟点「に」并用注意语序。", "l5_g2"),
    "毎週": ("毎週１回；本课先识读。", "l5_g2"),
    "毎月": ("毎月；时间频率副词。", "l5_g2"),
    "毎年": ("毎年；与来月等名词区分。", "l5_g2"),
    "いつも": ("いつも＝总是；第7课再系统讲程度。", "l5_g2"),
    "たいてい": ("たいてい＝大致；后接肯定。", "l5_g2"),
    "時々": ("時々；第7课与频率副词对比。", "l5_g2"),
    "あまり": ("あまり～ない；本课预习，须否定。", "l5_g2"),
    "全然": ("全然～ない；须否定。", "l5_g2"),
}

TRANSPORT = {
    "電車": "電車で行きます。",
    "バス": "私はバスで家へ帰ります。（课文）",
    "タクシー": "タクシーで；で＋交通工具。",
    "自転車": "自転車で；也可歩いて。",
    "ひこうき": "飛行機で；ひこうき＝飛行機表记。",
    "フェリー": "フェリーで渡ります。",
    "しんかんせん": "李さんは新幹線で大阪へ行きました。（课文）",
}

MONTH_WEEK = {
    "来月": "来月中国へ行きます。（课文）",
    "先月": "先月行きました；过去用ました。",
    "今月": "今月；时间名词。",
    "来週": "来週；へ行きます。",
    "先週": "先週帰りました。",
    "今週": "今週。",
    "来年": "来年；将来。",
    "去年": "去年行きました。",
    "今年": "今年。",
    "明日": "明日行きます。",
    "昨日": "昨日帰りました。",
    "明後日": "明後日。",
    "一昨日": "一昨日。",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def load_l78_hand() -> dict[str, dict]:
    """L7–L8 手写精品：优先从已生成的 u2 文件，其次 snapshot。"""
    out: dict[str, dict] = {}
    if L78_FALLBACK.exists():
        ns: dict = {}
        exec(L78_FALLBACK.read_text(encoding="utf-8"), ns)
        snap = ns.get("U2_L78_SNAPSHOT") or ns.get("U2_CURATED") or {}
        out = {k: v for k, v in snap.items() if k.startswith("l7_") or k.startswith("l8_")}
        if len(out) >= 70:
            return out
    src = OUT if OUT.exists() else L78_FALLBACK
    if not src.exists():
        return out
    text = src.read_text(encoding="utf-8")
    for m in re.finditer(
        r'"(l[78]_v_\d+)":\s*\{\s*"zh":\s*\[(.*?)\],\s*"ref":\s*"([^"]+)"',
        text,
        re.S,
    ):
        vid, inner, ref = m.group(1), m.group(2), m.group(3)
        lines = re.findall(r'"((?:[^"\\]|\\.)*)"', inner)
        if lines:
            out[vid] = {"zh": lines, "ref": ref}
    return out


def tip_l5(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    stem = jp.replace("ます", "")
    if jp == "起きます":
        return [
            "课文：森さんは７時に起きます。",
            "具体时刻＋に；2类动词ます形。",
        ], "l5_g3"
    if jp == "寝ます":
        return [
            "课文：昨日、何時に寝ましたか。",
            "过去式「寝ました」问睡觉时间。",
        ], "l5_g2"
    if jp == "働きます":
        return [
            "课文：田中さんは９時から５時まで働きます。",
            "から～まで＝从…到…；时间段。",
        ], "l5_g4"
    if jp == "勉強します":
        return ["勉強します；サ変动词。", "図書館で勉強します（第6课で）。"], "l5_g1"
    if jp in ("休みます", "終わります"):
        return [f"{zh}；ます形叙述日常作息。", "时间用に／から～まで。"], "l5_g1"
    if jp == "時":
        return [
            "～時＝…点；７時、９時。",
            "音变：4=よじ、7=しち、9=くじ（见发音块）。",
        ], "l5_g2"
    if jp == "分":
        return ["～分；１０分、３０分。", "６時半＝6:30（半＝はん）。"], "l5_g2"
    if jp == "半":
        return ["６時半に起きます。（课文）", "半读はん；附在时刻后。"], "l5_g2"
    if jp in TIME_WORDS:
        line, ref = TIME_WORDS[jp]
        return [line, f"{zh}；本课时间表达。"], ref
    if jp in FREQ_L5:
        line, ref = FREQ_L5[jp]
        return [line, f"{zh}。"], ref
    if jp == "それから":
        return ["それから＝然后；连接时间顺序。", "接続词，放句首。"], "l5_g1"
    if pos == "名" and jp in ("デパート", "銀行", "図書館", "美術館"):
        return [f"{zh}；场所へ行きます／で働きます（第6课）。"], "l5_g1"
    return [f"{zh}；第5课·时间・ます形。"], "l5_g1"


def tip_l6(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if jp == "行きます":
        return [
            "课文：来月中国へ行きます。",
            "移动方向へ；未来用ます。",
        ], "l6_g1"
    if jp == "来ます":
        return ["3类カ変；友達が来ます。", "起点から：東京から来ました。"], "l6_g1"
    if jp == "帰ります":
        return ["私はバスで家へ帰ります。（课文）", "帰る＝回去；へ方向。"], "l6_g1"
    if jp in TRANSPORT:
        return [TRANSPORT[jp], "手段・交通工具＋で。"], "l6_g3"
    if jp == "あるいて":
        return [
            "歩いて帰ります；て形表方式。",
            "×歩くで → ○歩いて（不再加で）。",
        ], "l6_g3"
    if jp == "へ":
        return [
            "方向助词：中国へ行きます。",
            "强调方向；到达也可用に。",
        ], "l6_g1"
    if jp == "で":
        return [
            "手段：バスで、新幹線で。",
            "≠第8课语言で；本课=交通方式。",
        ], "l6_g3"
    if jp == "から":
        return ["起点：東京から京都まで。", "与まで成对。"], "l6_g2"
    if jp == "まで":
        return ["终点：５時まで働きます（第5课）／大阪まで。", "から～まで。"], "l6_g2"
    if jp == "どこ":
        return ["どこへ行きますか。", "疑问词+へ。"], "l6_g4"
    if jp == "何":
        return ["何で行きますか＝用什么方式。", "何＋で。"], "l6_g4"
    if jp in MONTH_WEEK:
        return [MONTH_WEEK[jp], f"{zh}；时间词修饰行きます。"], "l6_g1"
    if jp == "一人で":
        return ["一人で行きます＝独自。", "で表方式／状态。"], "l6_g3"
    if jp == "友達":
        return ["友達と行きます（と＝和，第11课）。"], "l6_g1"
    if jp == "どのぐらい":
        return ["どのぐらい＝多久／多远。", "本课问路程时间。"], "l6_g5"
    if jp == "真っ直ぐ":
        return ["真っ直ぐ行ってください；方向指示。"], "l6_g1"
    return [f"{zh}；へ・で・から・まで 按课内句型。"], "l6_g1"


def tip_l7(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if pos.startswith("動") or "動(" in pos:
        if "します" in jp and jp not in ("勉強します",):
            return [f"他动+を：{jp.replace('ます','')}ます＋を。", "自动词不用を宾语。"], "l7_g1"
    if jp.endswith("にします") or jp in ("コーヒー", "お茶"):
        return ["选择用「にします」；×をします。", "会話点单核心。"], "l7_g4"
    if jp in ("いつも", "よく", "時々", "あまり", "ぜんぜん"):
        return [f"频率副词；あまり・ぜんぜん须否定。", "课文：時々テニスをします。"], "l7_g2"
    if "ませんか" in jp or jp == "一緒に":
        return ["一緒に…ませんか＝邀请。", "见课文映画を見ませんか。"], "l7_g3"
    return [f"{zh}；を・频率・邀请。"], "l7_g1"


def tip_l8(v: dict) -> tuple[list[str], str]:
    jp, zh, pos = v["jp"], v["zh"], v["pos"]
    if jp in ("日本語", "英語", "中国語", "何語"):
        return [f"{jp}で手紙を書きます。", "语言・工具＋で。"], "l8_g1"
    if "もらい" in jp:
        return ["视点=接受者；友達からもらいました。", "に／から。"], "l8_g4"
    if "あげ" in jp:
        return ["主语=给予者；对长辈慎用。", "妹にプレゼントをあげます。"], "l8_g2"
    if "くれ" in jp:
        return ["主语=给予方；先生がくれました。", "不能用于「我给别人」。"], "l8_g3"
    if jp in ("借ります", "貸します", "差します", "渡します", "教えます"):
        return [f"{zh}；授受・で 本课搭配。", "见基本课文与拡張。"], "l8_g2"
    return [f"{zh}；で手段 vs 第6课交通で。"], "l8_g1"


HAND_PATCH: dict[str, dict] = {
    "l5_v_4": {"zh": ["休みます；会社を休みます＝请假。", "ます形四种时态见单词栏。"], "ref": "l5_g1"},
    "l6_v_33": {"zh": ["ちょっと待ってください；一会儿。", "第14课てください再学。"], "ref": "l6_g1"},
}


def build() -> dict[str, dict]:
    lessons = load_lessons()
    l78 = load_l78_hand()
    out: dict[str, dict] = {}
    fns = {5: tip_l5, 6: tip_l6, 7: tip_l7, 8: tip_l8}
    for lid in range(5, 9):
        for v in lessons[lid].get("vocab") or []:
            vid = v["id"]
            if lid in (7, 8) and vid in l78:
                out[vid] = l78[vid]
                continue
            zh_lines, ref = fns[lid](
                {"jp": v.get("jp", ""), "pos": v.get("pos", ""), "zh": v.get("meaningZh", "")}
            )
            out[vid] = {"zh": zh_lines, "ref": ref}
    out.update(HAND_PATCH)
    # 再次强制 L7–L8 手写覆盖
    out.update(l78)
    return out


def emit_py(curated: dict[str, dict]) -> str:
    lines = [
        '# -*- coding: utf-8 -*-',
        '"""第2单元 L5–8 精品逐词知识卡 · 由 build-u2-vocab-curated.py 生成"""',
        "",
        "U2_CURATED: dict[str, dict] = {",
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
    curated = build()
    OUT.write_text(emit_py(curated), encoding="utf-8")
    l78_n = sum(1 for k in curated if k.startswith("l7_") or k.startswith("l8_"))
    print(f"[OK] {OUT.name} · {len(curated)} entries (L7–8 hand {l78_n})")


if __name__ == "__main__":
    main()
