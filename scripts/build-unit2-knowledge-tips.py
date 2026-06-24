#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 js/data/unit2-knowledge-tips.js · 第5–8课逐词知识卡（对齐 L1）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "js" / "data" / "unit2-knowledge-tips.js"

sys.path.insert(0, str(ROOT / "scripts"))
from vocab_tips_curated_data import CURATED  # noqa: E402

LESSON_META: dict[int, dict] = {
    5: {
        "gram_ref": "l5_g3",
        "gram_label": "时间・ます形",
        "hw": {
            "発音": "「時・分」音变：4=よじ、7=しち、9=くじ；半＝はん。",
            "活用": "ます／ません／ました／ませんでした四种时态。",
            "選択": "具体时刻＋に；から～まで＝时间段。",
            "穴埋め": "×毎朝に起きます → ○毎朝起きます（频率不加に）。",
            "翻訳": "中译日：几点用「何時に」；half past 用「半」。",
            "総合": "Q12：に时刻、からまで、ます形敬体。",
            "作文": "写一日作息：［時刻］に起きます／働きます。",
        },
        "ext": {
            "pronunciation": "时刻音变见 summaryBlocks；「ごろ」≈大约。",
            "grammar": "現在・未来ます形・に时刻・からまで・ごろ。",
            "mistakes": "×今に → ○今；あまり・全然须否定（预习）。",
            "template": "毎朝［時］に［动词ます］。",
        },
    },
    6: {
        "gram_ref": "l6_g1",
        "gram_label": "へ・で・から・まで",
        "hw": {
            "発音": "交通工具名词声调稳定；ひこうき→飛行機。",
            "選択": "へ方向；で手段；から～まで起终点。",
            "穴埋め": "×歩くで帰る → ○歩いて帰る。",
            "総合": "Q12：新幹線で大阪へ；助词搭配。",
            "作文": "来月［场所］へ［で］行きます。",
        },
        "ext": {
            "grammar": "へ・で・から・まで・どこ／何。",
            "mistakes": "で本课=交通；第8课=语言工具。",
            "template": "［时间］［へ］行きます／［で］帰ります。",
        },
    },
    7: {
        "gram_ref": "l7_g1",
        "gram_label": "を・频率・邀请",
        "hw": {
            "発音": "动词分类先识读；本课他动+を。",
            "活用": "他动词四种ます形；を+宾语。",
            "選択": "を宾语／に选择／あまり・ぜんぜん+否定。",
            "総合": "Q12 敬体ます与を搭配。",
            "間違い": "×コーヒーをします → ○にします。",
            "作文": "用频率副词+を+ませんか写邀请。",
        },
        "ext": {
            "pronunciation": "お茶の「お」美化语；频率词程度差异见 summaryBlocks。",
            "grammar": "を・频率・ませんか／ましょう・をください 四节点。",
            "mistakes": "对照拡張：にします／をください／数量置后。",
            "template": "カフェ注文模板：［飲み物］にします。",
        },
    },
    8: {
        "gram_ref": "l8_g1",
        "gram_label": "で・授受",
        "hw": {
            "選択": "で手段 vs 第6课交通で；授受方向。",
            "総合": "Q12 日本語で／あげる・くれる・もらう。",
            "間違い": "授受主语方向；×友達が私にあげた→もらった。",
            "作文": "写赠送/接受经历，用で+授受动词。",
        },
        "ext": {
            "grammar": "で（语言工具）・あげる・くれる・もらう。",
            "mistakes": "×私は先生に本をあげた → 对长辈用差し上げる等。",
            "template": "プレゼント・お礼の手紙场景。",
        },
    },
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def first_grammar_ref(lesson: dict) -> str:
    nodes = lesson.get("grammarNodes") or []
    return (nodes[0].get("id") if nodes else "") or f"l{lesson['lessonId']}_g1"


def find_basic_line(lesson: dict, jp_fragment: str) -> str:
    for line in lesson.get("basicText") or []:
        if jp_fragment in line:
            return line
    return ""


def auto_tip(v: dict, lesson: dict) -> tuple[list[str], str]:
    lid = lesson["lessonId"]
    vid = v["id"]
    jp = (v.get("jp") or "").split("／")[0].strip()
    pos = v.get("pos") or ""
    mzh = (v.get("meaningZh") or "").strip()
    meta = LESSON_META.get(lid, {})
    ref = meta.get("gram_ref") or first_grammar_ref(lesson)
    lines: list[str] = []

    if vid in CURATED:
        return CURATED[vid]["zh"], CURATED[vid].get("ref", ref)

    ctx = find_basic_line(lesson, jp)
    if ctx:
        lines.append(f"课文：{ctx}")
    elif mzh:
        lines.append(f"本课词义：{mzh}；请结合会話 ABC 的 A 轨。")

    if lid == 7 and (pos.startswith("動") or "動(" in pos):
        lines.append("他动词+を；自动词（行く等）不用を。")
    elif lid == 8 and jp in ("日本語", "英語", "中国語", "何語"):
        lines.append("语言名词+で：日本語で書きます。")
    elif lid == 8 and vid in ("l8_v_5", "l8_v_6", "l8_v_7") or jp.endswith("ます") and "もら" in jp or "あげ" in jp or "くれ" in jp:
        lines.append("授受动词：分清给予者/接受者主语与に／から。")
    elif pos.startswith("動") or "動(" in pos:
        conj = (v.get("conjugation") or {}).get("forms")
        if conj:
            lines.append("动词ます形四种时态；见单词栏活用。")
        else:
            lines.append("动词ます形叙述；时间に、方向へ、手段で（本课/上课）。")
    elif pos == "助":
        lines.append("助词回到当课文法例句。")
    elif pos == "副":
        lines.append("频率副词：あまり・ぜんぜん须否定呼应。")
    elif pos == "名":
        lines.append("名词搭配を／に／で 按课内句型。")

    if not lines:
        lines.append(f"第{lid}课词汇；朗读基本课文。")
    return lines, ref


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_vocab_entry(vid: str, lines: list[str], ref: str) -> str:
    link_gram = f'{{ label: "→ 文法", gate: 1, ref: {js_str(ref)} }}'
    parts = ["    lines: ["]
    for ln in lines:
        parts.append(f"      {{ zh: {js_str(ln)} }},")
    parts.append("    ],")
    parts.append(f"    links: [conv, {link_gram}],")
    return f"  {js_str(vid)}: {{\n" + "\n".join(parts) + "\n  },"


def emit_map(lid: int, m: dict) -> str:
    rows = [
        f'    {js_str(k)}: {{ lines: [{{ zh: {js_str(v)} }}], links: [conv] }},'
        for k, v in m.items()
    ]
    return f"  {lid}: {{\n" + "\n".join(rows) + "\n  }},"


def build() -> str:
    lessons = load_lessons()
    vocab_entries: list[str] = []
    hw_by: list[str] = []
    ext_by: list[str] = []

    for lid in range(5, 9):
        L = lessons.get(lid)
        if not L:
            continue
        meta = LESSON_META.get(lid, {})
        if meta.get("hw"):
            hw_by.append(emit_map(lid, meta["hw"]))
        if meta.get("ext"):
            ext_by.append(emit_map(lid, meta["ext"]))
        for v in L.get("vocab") or []:
            vid = v.get("id")
            if not vid:
                continue
            lines, ref = auto_tip(v, L)
            vocab_entries.append(emit_vocab_entry(vid, lines, ref))

    return f'''/** 第2单元第5–8课 · 知识卡（对齐第1课 L1KnowledgeTips 口径）
 * 生成：python scripts/build-unit2-knowledge-tips.py
 */
const Unit2KnowledgeTips = (function () {{
  const conv = {{ label: "→ 会話", gate: 2 }};
  const vocab = {{ label: "→ 単語", gate: 0 }};

  const VOCAB = {{
{chr(10).join(vocab_entries)}
  }};

  const HW_BY_LESSON = {{
{chr(10).join(hw_by) if hw_by else "  /* none */"}
  }};

  const EXT_BY_LESSON = {{
{chr(10).join(ext_by) if ext_by else "  /* none */"}
  }};

  const HW_DEFAULT = {{
    発音: {{ lines: [{{ zh: "注意「時・分」音变（4=よじ、7=しち等）。" }}], links: [vocab] }},
    活用: {{ lines: [{{ zh: "本课动词四种ます形：ます／ません／ました／ませんでした。" }}], links: [vocab] }},
    選択: {{ lines: [{{ zh: "助词题：に时间、へ方向、で手段、から～まで。" }}], links: [conv] }},
    穴埋め: {{ lines: [{{ zh: "填空看清时态与助词槽位。" }}], links: [conv] }},
    翻訳: {{ lines: [{{ zh: "日译中保留时间表达；中译日用ます形。" }}], links: [conv] }},
    総合: {{ lines: [{{ zh: "综合题对照当课课文与 gate Q12。" }}], links: [conv] }},
    間違い: {{ lines: [{{ zh: "改错：助词混用、授受方向、辞書形叙述。" }}], links: [conv] }},
    作文: {{ lines: [{{ zh: "作文套用拡張模板。" }}], links: [conv] }},
    聴解: {{ lines: [{{ zh: "听力配合🔊；先看课文录音。" }}], links: [conv] }},
    小テスト: {{ lines: [{{ zh: "交互小测12题；错题回文法节点。" }}], links: [conv] }},
  }};

  const EXT_DEFAULT = {{
    pronunciation: {{ lines: [{{ zh: "发音要点见 summaryBlocks。" }}], links: [vocab] }},
    etymology: {{ lines: [{{ zh: "词源注释助记音读。" }}], links: [vocab] }},
    preview: {{ lines: [{{ zh: "活用予告=下节课形，先识读。" }}], links: [vocab] }},
    honorific: {{ lines: [{{ zh: "ます形即丁寧体。" }}], links: [conv] }},
    template: {{ lines: [{{ zh: "模板块替换［］口头练习。" }}], links: [conv] }},
    mistakes: {{ lines: [{{ zh: "常见误用=阅卷高频。" }}], links: [conv] }},
    keyPoints: {{ lines: [{{ zh: "会話要点=课文关键词；ABC A 轨。" }}], links: [conv] }},
    rolePlay: {{ lines: [{{ zh: "角色扮演按课题换人名・场所。" }}], links: [conv] }},
    grammar: {{ lines: [{{ zh: "文法まとめ=当课节点；对照例句。" }}], links: [{{ label: "→ 文法", gate: 1 }}] }},
    basicText: {{ lines: [{{ zh: "基本课文四句=文法主干。" }}], links: [conv] }},
  }};

  function vocabTip(v) {{
    if (!v) return null;
    if (VOCAB[v.id]) return VOCAB[v.id];
    return null;
  }}

  function grammar(node) {{
    if (!node) return null;
    const zh = (node.explanationZh || node.titleZh || "").trim();
    if (!zh) return null;
    const lines = zh.split(/\\n+/)
      .slice(0, 4)
      .map((t) => ({{ zh: t.trim() }}))
      .filter((l) => l.zh);
    return lines.length ? {{ lines, links: [conv, vocab] }} : null;
  }}

  function homeworkTitle(title, lessonId) {{
    const lid = Number(lessonId);
    const per = HW_BY_LESSON[lid];
    const t = title || "";
    if (per) {{
      for (const k of Object.keys(per)) {{
        if (t.includes(k)) return per[k];
      }}
    }}
    for (const k of Object.keys(HW_DEFAULT)) {{
      if (t.includes(k)) return HW_DEFAULT[k];
    }}
    return {{ lines: [{{ zh: "对照课本・会話・文法完成本块。" }}], links: [conv] }};
  }}

  function extensionKey(key, title, lessonId) {{
    const lid = Number(lessonId);
    const per = EXT_BY_LESSON[lid];
    const pool = per ? {{ ...EXT_DEFAULT, ...per }} : EXT_DEFAULT;
    if (key && pool[key]) return pool[key];
    const tit = title || "";
    if (tit.includes("テンプレート") || tit.includes("模板")) return pool.template;
    if (tit.includes("誤り") || tit.includes("误用")) return pool.mistakes;
    if (tit.includes("キーポイント")) return pool.keyPoints;
    if (tit.includes("ロールプレイ") || tit.includes("扮演")) return pool.rolePlay;
    if (tit.includes("まとめ") && !tit.includes("文法")) {{
      return {{ lines: [{{ zh: "迄今总结含课文锚点。" }}], links: [conv] }};
    }}
    return {{ lines: [{{ zh: "本块与当课五关交叉对照。" }}], links: [conv] }};
  }}

  return {{ vocab: vocabTip, grammar, homeworkTitle, extensionKey }};
}})();
'''


def main() -> int:
    OUT.write_text(build(), encoding="utf-8")
    n = OUT.read_text(encoding="utf-8").count("_v_")
    print(f"[OK] wrote {OUT} (~{n} vocab id refs)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
