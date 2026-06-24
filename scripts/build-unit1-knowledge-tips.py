#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 js/data/unit1-knowledge-tips.js · 第2–4课逐词知识卡（对齐 L1）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "js" / "data" / "unit1-knowledge-tips.js"

sys.path.insert(0, str(ROOT / "scripts"))
from vocab_tips_curated_data import CURATED  # noqa: E402

LESSON_META: dict[int, dict] = {
    2: {
        "gram_ref": "l2_g1",
        "hw": {
            "発音": "「は」读 wa；「の」轻读。",
            "選択": "これ／それ／あれ＋です；この／その／あの＋名词。",
            "総合": "Q12：指示词+所属だれの。",
        },
        "ext": {
            "grammar": "これ・それ・あれ／この・その・あの／～の～です。",
            "mistakes": "×どれですか → ○どれが～ですか。",
        },
    },
    3: {
        "gram_ref": "l3_g1",
        "hw": {
            "選択": "ここ・そこ・あそこ＋は…ですか。",
            "総合": "Q12：场所+は+名词；あそこは…です（新信息）。",
        },
        "ext": {
            "grammar": "ここ・そこ・あそこ；こちら系列；どこですか。",
            "mistakes": "あれ（物）vs あそこ（场所）。",
        },
    },
    4: {
        "gram_ref": "l4_g1",
        "hw": {
            "活用": "あります／います；いる只用于有生命。",
            "総合": "Q12：存在句+数量いくつ。",
        },
        "ext": {
            "grammar": "あります／います；に存在；方位词+の。",
            "mistakes": "×机の上に猫があります → ○猫がいます。",
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
    vid = v["id"]
    lid = lesson["lessonId"]
    meta = LESSON_META.get(lid, {})
    ref = meta.get("gram_ref") or first_grammar_ref(lesson)
    if vid in CURATED:
        return CURATED[vid]["zh"], CURATED[vid].get("ref", ref)
    jp = (v.get("jp") or "").split("／")[0].strip()
    mzh = (v.get("meaningZh") or "").strip()
    lines: list[str] = []
    ctx = find_basic_line(lesson, jp)
    if ctx:
        lines.append(f"课文：{ctx}")
    elif mzh:
        lines.append(f"本课：{mzh}。")
    lines.append(f"第{lid}课；对照文法 {ref} 与会話 A 轨。")
    return lines[:3], ref


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

    for lid in (2, 3, 4):
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
            if not vid or v.get("from") not in (None, "text", ""):
                continue
            lines, ref = auto_tip(v, L)
            vocab_entries.append(emit_vocab_entry(vid, lines, ref))

    return f'''/** 第1单元第2–4课 · 知识卡（对齐第1课 L1KnowledgeTips 口径）
 * 生成：python scripts/build-unit1-knowledge-tips.py
 */
const Unit1KnowledgeTips = (function () {{
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
    発音: {{ lines: [{{ zh: "注意「は」读 wa；长音表记与课本一致。" }}], links: [vocab] }},
    活用: {{ lines: [{{ zh: "本课名词句为主；动词活用从第5课起。" }}], links: [vocab] }},
    選択: {{ lines: [{{ zh: "助词・指示词题对照课文。" }}], links: [conv] }},
    穴埋め: {{ lines: [{{ zh: "填空保留です／じゃありません。" }}], links: [conv] }},
    翻訳: {{ lines: [{{ zh: "日译中保留指示词距离感。" }}], links: [conv] }},
    総合: {{ lines: [{{ zh: "综合题对照当课课文与 gate Q12。" }}], links: [conv] }},
    間違い: {{ lines: [{{ zh: "改错：指示词距离・どれが。" }}], links: [conv] }},
    作文: {{ lines: [{{ zh: "用本课句型描述身边物品/场所。" }}], links: [conv] }},
    聴解: {{ lines: [{{ zh: "听力配合🔊；先听会話 A 轨。" }}], links: [conv] }},
    小テスト: {{ lines: [{{ zh: "交互小测12题；错题回文法节点。" }}], links: [conv] }},
  }};

  const EXT_DEFAULT = {{
    pronunciation: {{ lines: [{{ zh: "发音要点见 summaryBlocks。" }}], links: [vocab] }},
    etymology: {{ lines: [{{ zh: "词源注释助记。" }}], links: [vocab] }},
    preview: {{ lines: [{{ zh: "预告下单元语法，先识读。" }}], links: [vocab] }},
    honorific: {{ lines: [{{ zh: "です＝丁寧体；普通体第22课。" }}], links: [conv] }},
    template: {{ lines: [{{ zh: "模板块替换［］口头练习。" }}], links: [conv] }},
    mistakes: {{ lines: [{{ zh: "常见误用对照课文句型。" }}], links: [conv] }},
    keyPoints: {{ lines: [{{ zh: "会話要点=课文关键词。" }}], links: [conv] }},
    rolePlay: {{ lines: [{{ zh: "角色扮演替换物品/场所名词。" }}], links: [conv] }},
    grammar: {{ lines: [{{ zh: "文法まとめ=当课节点。" }}], links: [{{ label: "→ 文法", gate: 1 }}] }},
    basicText: {{ lines: [{{ zh: "基本课文=文法主干。" }}], links: [conv] }},
  }};

  function vocabTip(v) {{
    if (!v) return null;
    return VOCAB[v.id] || null;
  }}

  function grammar(node) {{
    if (!node) return null;
    const zh = (node.explanationZh || node.titleZh || "").trim();
    if (!zh) return null;
    const lines = String(zh).split(/\\n+/)
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
