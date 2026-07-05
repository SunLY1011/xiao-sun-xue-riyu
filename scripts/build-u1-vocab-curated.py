#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 scripts/vocab_tips_curated_u1.py · 第1单元 L2–4 精品逐词知识卡"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "scripts" / "vocab_tips_curated_u1.py"

# 课文关键词 → (说明, 文法 ref)
L2_KO = {
    "これ": ("これは离说话人近的事物；会話 A 轨常用。", "l2_g1"),
    "それ": ("それ＝离听话人近；これ／あれ对照记忆。", "l2_g1"),
    "あれ": ("あれ＝离双方都远；看不见场所用あそこ（第3课）。", "l2_g1"),
    "この": ("この＋名词＝这个…；の 的所属见 l2_g3。", "l2_g2"),
    "その": ("その＋名词；问所属用だれの（l2_g4）。", "l2_g2"),
    "あの": ("あの＋名词；远称连体。", "l2_g2"),
    "本": ("これは本です；指示词+名词+です。", "l2_g1"),
    "辞書": ("それは辞書です；会話「これ／それ」入门。", "l2_g1"),
    "雑誌": ("それは雑誌です；并列指示练习。", "l2_g1"),
    "新聞": ("あれは新聞です；远称示例。", "l2_g1"),
    "ノート": ("これはノートです。", "l2_g1"),
    "手帳": ("それは手帳です。", "l2_g1"),
    "鉛筆": ("それは鉛筆じゃありません；否定用じゃありません。", "l2_g1"),
    "かばん": ("これはかばんです。", "l2_g1"),
    "時計": ("あれは時計です。", "l2_g1"),
    "車": ("これは車です。", "l2_g1"),
    "コンピュータ": ("これはコンピュータです；外来语名词。", "l2_g1"),
    "テレビ": ("あれはテレビです。", "l2_g1"),
    "だれ": ("だれの＋名词；所属疑问。", "l2_g4"),
    "どれ": ("どれが～ですか；不能单独どれですか。", "l2_g4"),
}

L3_KO = {
    "ここ": ("ここは教室です；场所指示＝这里。", "l3_g1"),
    "そこ": ("そこは事務所です；那里。", "l3_g1"),
    "あそこ": ("あそこは食堂です；远处场所。", "l3_g1"),
    "どこ": ("教室はどこですか；疑问场所。", "l3_g2"),
    "こちら": ("こちらは会社の食堂です；礼貌说法。", "l3_g1"),
    "そちら": ("そちらは会議室です。", "l3_g1"),
    "あちら": ("あちらは受付です。", "l3_g1"),
    "どちら": ("お国はどちらですか。", "l3_g2"),
    "学校": ("ここは学校です；场所+は+名词。", "l3_g1"),
    "図書館": ("図書館はあそこです；主语可省略ここ。", "l3_g1"),
    "銀行": ("銀行はそこです。", "l3_g1"),
    "郵便局": ("郵便局はあそこです。", "l3_g1"),
    "病院": ("病院はどこですか。", "l3_g2"),
}

L4_KO = {
    "あります": ("机の上に本があります；无生命存在。", "l4_g1"),
    "います": ("あそこに猫がいます；有生命存在。", "l4_g1"),
    "上": ("机の上に…；方位名词+の+名词。", "l4_g4"),
    "下": ("机の下に…", "l4_g4"),
    "前": ("駅の前に…", "l4_g4"),
    "後ろ": ("いすの後ろに…", "l4_g4"),
    "中": ("箱の中に…", "l4_g4"),
    "隣": ("隣に…＝旁边。", "l4_g4"),
    "いくつ": ("りんごはいくつありますか；数量疑问。", "l4_g3"),
    "いくら": ("これはいくらですか；价钱（第14课再练）。", "l4_g3"),
}

LESSON_DEFAULT_REF = {2: "l2_g1", 3: "l3_g1", 4: "l4_g1"}
LESSON_KO = {2: L2_KO, 3: L3_KO, 4: L4_KO}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def find_basic_line(lesson: dict, jp: str) -> str:
    key = jp.split("／")[0].strip()[:4]
    for line in lesson.get("basicText") or []:
        if key and key in line:
            return line
    return ""


def tip_for(v: dict, lesson: dict) -> tuple[list[str], str]:
    lid = lesson["lessonId"]
    jp = (v.get("jp") or "").split("／")[0].strip()
    mzh = (v.get("meaningZh") or "").strip()
    ref = LESSON_DEFAULT_REF[lid]
    lines: list[str] = []

    ko = LESSON_KO.get(lid, {})
    if jp in ko:
        lines.append(ko[jp][0])
        ref = ko[jp][1]
    else:
        for key, (zh, r) in ko.items():
            if key in jp:
                lines.append(zh)
                ref = r
                break

    ctx = find_basic_line(lesson, jp)
    if ctx and not any("课文" in x for x in lines):
        lines.insert(0, f"课文：{ctx}")

    if not lines and mzh:
        lines.append(f"本课：{mzh}；结合会話 ABC 的 A 轨朗读。")
    if not lines:
        lines.append(f"第{lid}课词汇；先听会話再记。")

    if lid == 4 and jp in ("あります", "います"):
        pass
    elif lid == 4 and (v.get("pos") or "").startswith("名"):
        lines.append("存在句：场所+に+物が+あります／人が+います。")

    return lines[:3], ref


def main() -> int:
    lessons = load_lessons()
    entries: list[str] = []
    for lid in (2, 3, 4):
        L = lessons[lid]
        for v in L.get("vocab") or []:
            vid = v.get("id")
            if not vid or v.get("from") not in (None, "text", ""):
                continue
            zh_lines, ref = tip_for(v, L)
            zh_js = json.dumps(zh_lines, ensure_ascii=False)
            entries.append(f'    "{vid}": {{"zh": {zh_js}, "ref": "{ref}"}},')

    body = "\n".join(entries)
    OUT.write_text(
        f'''# -*- coding: utf-8 -*-
"""第1单元 L2–4 精品逐词知识卡 · 由 build-u1-vocab-curated.py 生成"""

U1_CURATED: dict[str, dict] = {{
{body}
}}
''',
        encoding="utf-8",
    )
    print(f"[OK] wrote {OUT} ({len(entries)} entries)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
