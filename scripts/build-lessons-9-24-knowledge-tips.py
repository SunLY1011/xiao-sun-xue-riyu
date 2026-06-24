#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 js/data/lessons-9-24-knowledge-tips.js · 逐词知识卡 + 当课作業/拡張提示

对齐 L1KnowledgeTips / Unit2KnowledgeTips 口径。
用法：python scripts/build-lessons-9-24-knowledge-tips.py [--from 9] [--to 24]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"

sys.path.insert(0, str(ROOT / "scripts"))
from vocab_tips_curated_data import CURATED  # noqa: E402

LESSON_META: dict[int, dict] = {
    9: {
        "gram_ref": "l9_g1",
        "gram_label": "イ形容詞",
        "hw": {
            "発音": "朗读イ形四形（辛いです／辛くない／辛かった／辛くなかった）；注意促音与声调。",
            "活用": "活用ドリル对照文法节点；「いい」用よい系列。",
            "選択": "先判イ形时态，再看「あまり」是否接否定、「が」转折。",
            "穴埋め": "填空注意词尾「い」变「く」再接ない／かった。",
            "翻訳": "日译中保留「が」转折；中译日形容词用です形。",
            "総合": "Q12 综合题对照课文四川料理は辛いです。",
            "作文": "用とても・あまり～ない・～が造味觉评价句。",
            "聴解": "听形容词时态与程度副词；配合课文🔊。",
        },
        "ext": {
            "pronunciation": "本课イ形声调见 summaryBlocks；「おいしい」③型勿读错。",
            "grammar": "四个文法节点：イ形活用・あまり～ない・が・すぎる（了解）。",
            "mistakes": "改错常考「辛いでした→辛かった」「あまり辛い→あまり辛くない」。",
            "template": "味・感想模板：［料理］は［い］ですが…",
        },
    },
    10: {
        "gram_ref": "l10_g1",
        "gram_label": "ナ形容詞",
        "hw": {
            "発音": "ナ形词干声调稳定；「きれい」①型。",
            "活用": "ナ形：词干＋です／ではありません／でした。",
            "選択": "勿把ナ形当成イ形改「く」尾。",
            "総合": "Q12 区分イ形与ナ形过去式。",
            "作文": "描写地点・物品用「有名／静か／便利」等。",
        },
        "ext": {
            "grammar": "ナ形与イ形对照表见拡張参考表。",
            "mistakes": "×きれいかった → ○きれいでした。",
        },
    },
    11: {
        "gram_ref": "l11_g1",
        "gram_label": "～が好き／上手",
        "hw": {
            "選択": "好恶・擅长用「が」，不用「を」。",
            "作文": "写自己的好きなもの・得意なこと。",
        },
        "ext": {
            "mistakes": "×料理を上手 → ○料理が上手。",
        },
    },
    12: {
        "gram_ref": "l12_g1",
        "gram_label": "より・のほうが・一番",
        "hw": {
            "活用": "比较句两事物都要出现；より前是比较基准。",
            "総合": "Q12 注意敬体「です」与イ形词尾。",
        },
        "ext": {
            "template": "AはBより［い］です／Aのほうが［い］です。",
        },
    },
    13: {
        "gram_ref": "l13_g1",
        "gram_label": "助数词・存在句",
        "hw": {
            "発音": "助数词声调随数词；「三冊」さんさつ、「何冊」なんさつ。",
            "活用": "数词+助数词位置：名が数+助数词+あります／います。",
            "選択": "先选助数词（冊/個/枚/匹/台/本），再选あります／います。",
            "穴埋め": "存在句：場所に＋物が＋数；×机の上に本三冊。",
            "翻訳": "中译日保留「が」；多少用「何+助数词」。",
            "総合": "Q12：书用冊、卵用個、猫用匹+います。",
            "作文": "描写房间物品数量：机の上に…が…冊あります。",
        },
        "ext": {
            "grammar": "四节点：助数词·语顺·动作中数量·どのくらい。",
            "mistakes": "×本三個→○本三冊；×猫二匹ある→○います；×卵何冊→○何個。",
            "template": "場所に＋名が＋数+助数词+あります／います。",
        },
    },
    14: {
        "gram_ref": "l14_g2",
        "gram_label": "て形",
        "hw": {
            "活用": "1类く→いて/ぐ→いで/す→して；2类る→て；3类する→して、来る→来て。",
            "選択": "连接动作用て形；请求用てください；之后用てから。",
            "穴埋め": "×行くて→○行って；×書くて→○書いて。",
            "総合": "Q12：食べてから；×帰るて／書くてください。",
            "作文": "昨日、［へ行って］、［をしました］。",
        },
        "ext": {
            "grammar": "て形·てください·てから·ましょうか。",
            "mistakes": "×デパートへ行くて→○行って；ましょうか=提议帮忙。",
            "template": "Aて、Bします／Aてから、Bします／…てください。",
        },
    },
    15: {
        "gram_ref": "l15_g1",
        "gram_label": "～ています",
        "hw": {
            "選択": "正在进行「今…ています」；习惯「毎日…ています」。",
            "穴埋め": "许可：撮ってもいいですか；×撮るても。",
            "総合": "Q12：読んでいます；×今食べます（进行）。",
            "作文": "今…ています／毎朝…ています。",
        },
        "ext": {
            "grammar": "进行·习惯·てもいいです（か）。",
            "mistakes": "×今読みます→○読んでいます；全然须接否定。",
            "template": "今［て形+います］／［て形+もいいですか］。",
        },
    },
    16: {
        "gram_ref": "l16_g1",
        "gram_label": "イ／ナ形て形・状態ています",
        "hw": {
            "活用": "イ形：い→くて；ナ形：词干+で。",
            "選択": "并列広くて明るい；状态窓が割れている。",
            "総合": "Q12：広くて；×広いで；×割れます（状态）。",
            "作文": "部屋は［くて］［くて］ですが…",
        },
        "ext": {
            "grammar": "イ形て·ナ形で·自动词ている·が转折·という（了解）。",
            "mistakes": "×静かなきれい→○静かできれい；知る→知っている。",
            "template": "この［い］くて［い］です／［が］［い］です。",
        },
    },
    17: {
        "gram_ref": "l17_g1",
        "gram_label": "ほしい・たい",
        "hw": {
            "選択": "欲しい・たい对象用「が」；×をほしい。",
            "穴埋め": "たい前用辞書形：食べたい、行きたい。",
            "総合": "Q12：がほしい／行きたい；第三人称ほしがる了解。",
            "作文": "わたしは［がほしい］／［へ行きたい］です。",
        },
        "ext": {
            "grammar": "がほしい・たい・ほしがる（了解）・んですが。",
            "mistakes": "×新しい服をほしい → ○がほしい。",
            "template": "［名］がほしいです／［辞書形］たいです。",
        },
    },
    18: {
        "gram_ref": "l18_g1",
        "gram_label": "～くなる・になる",
        "hw": {
            "活用": "イ形：い→くなる；ナ形：になりました。",
            "選択": "人为变化用くする；天气用くなる。",
            "総合": "Q12：小さくなりました／ほうがいい／かもしれません。",
        },
        "ext": {
            "grammar": "くなる・になる・くする・ほうがいい・かもしれない。",
            "mistakes": "×小さいなりました → ○小さくなりました。",
            "template": "［い］くなりました／［ナ形］になりました。",
        },
    },
    19: {
        "gram_ref": "l19_g1",
        "gram_label": "ない形・义务",
        "hw": {
            "活用": "1类：行く→行かない；3类：する→しない、来る→来ない。",
            "選択": "ないでください vs なければなりません vs なくてもいい。",
            "総合": "Q12：忘れないで／出さなければ／来なくてもいい。",
        },
        "ext": {
            "grammar": "ない形作り方・ないで・なければ・なくても。",
            "mistakes": "×行くない → ○行かない；义务用なければ。",
        },
    },
    20: {
        "gram_ref": "l20_g1",
        "gram_label": "ことができる",
        "hw": {
            "活用": "可能：辞書形+ことができる；五段う→え段+る。",
            "選択": "×見ますことができる → ○見ることができる。",
            "総合": "Q12：弾くことができる；前に＝…之前。",
            "作文": "わたしは［辞書形］ことができます。",
        },
        "ext": {
            "grammar": "可能形・ことができる・辞書形+前に。",
            "mistakes": "可能形与ます形混用；前に接辞書形。",
            "template": "［辞書形］ことができます／［辞書形］前に。",
        },
    },
    21: {
        "gram_ref": "l21_g2",
        "gram_label": "たことがある",
        "hw": {
            "活用": "た形：食べる→食べた；与て形对应记忆。",
            "選択": "经验：たことがあります；×たことがありますか敬体。",
            "総合": "Q12：食べたことがある；あとで；ましょうか。",
        },
        "ext": {
            "grammar": "た形・たことがある・あとで・ましょうか。",
            "mistakes": "×食べたことがあります → ○あります（经验问句）。",
            "template": "［た形］ことがあります／［た形］あとで。",
        },
    },
    22: {
        "gram_ref": "l22_g1",
        "gram_label": "简体",
        "hw": {
            "選択": "友达用简体：見る；对客户仍用ます形。",
            "総合": "Q12：毎晩見る；予定だ；けど／かな。",
            "作文": "用简体写短消息（了解）。",
        },
        "ext": {
            "grammar": "简体体系・予定だ・けど・かな・～方。",
            "mistakes": "×見ます（简体句中）→ ○見る。",
            "template": "［辞書形］予定だ／…んだけど。",
        },
    },
    23: {
        "gram_ref": "l23_g1",
        "gram_label": "たり・場合",
        "hw": {
            "活用": "たり…たり：又…又；场合は行きません。",
            "選択": "かどうか＝是否；によって＝因…而异。",
            "総合": "Q12：散歩したり；雨の場合は。",
        },
        "ext": {
            "grammar": "たり・場合・かどうか・间接疑问・によって。",
            "mistakes": "×行きますたり → ○行ったり。",
            "template": "［たり］…［たり］します／［場合］は。",
        },
    },
    24: {
        "gram_ref": "l24_g1",
        "gram_label": "と思う・と言う",
        "hw": {
            "選択": "と思います＝认为；と言いました＝说过。",
            "総合": "Q12：来ると思います；んです理由；告别表达。",
            "作文": "用と思う写看法；お元気で告别。",
        },
        "ext": {
            "grammar": "と思う・と言う・んです・お元気で。",
            "mistakes": "引用句用简体／です 按规则；んです接说明。",
            "template": "［小句］と思います／［小句］と言いました。",
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
        lines.append(f"本课词义：{mzh}；请结合会話 ABC 的 A 轨记忆。")

    if "イ形容" in pos:
        lines.append("イ形容詞：い→くない／かった／くなかった；丁寧体加「です」。")
    elif "ナ形容" in pos:
        lines.append("ナ形容詞：词干＋です／ではありません／でした；勿用「く」尾。")
    elif pos.startswith("動") or pos.startswith("動("):
        conj = (v.get("conjugation") or {}).get("forms")
        if conj:
            lines.append("动词活用见单词栏「活用」折叠；会話用ます形叙述。")
        else:
            lines.append("动词ます形：对象「を」、时间「に」、地点「へ／で」按当课文法。")
    elif pos == "助":
        lines.append("助词题回到当课文法例句；勿按中文语序硬套。")
    elif pos == "名":
        lines.append("名词多与「は／が／を／に」搭配；见文法节点。")
    elif pos == "副":
        lines.append("副词修饰动词或形容词；注意否定与过去呼应。")
    elif not lines:
        lines.append(f"第{lid}课词汇；对照基本课文朗读。")

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
    body = "\n".join(parts)
    return f"  {js_str(vid)}: {{\n{body}\n  },"


def emit_hw_lesson(lid: int, hw: dict) -> str:
    rows = []
    for k, zh in hw.items():
        rows.append(f'    {js_str(k)}: {{ lines: [{{ zh: {js_str(zh)} }}], links: [conv] }},')
    return f"  {lid}: {{\n" + "\n".join(rows) + "\n  }},"


def emit_ext_lesson(lid: int, ext: dict) -> str:
    rows = []
    for k, zh in ext.items():
        rows.append(
            f'    {js_str(k)}: {{ lines: [{{ zh: {js_str(zh)} }}], links: [conv] }},'
        )
    return f"  {lid}: {{\n" + "\n".join(rows) + "\n  }},"


def build(from_lid: int, to_lid: int) -> str:
    lessons = load_lessons()
    vocab_entries: list[str] = []
    hw_by: list[str] = []
    ext_by: list[str] = []

    for lid in range(from_lid, to_lid + 1):
        L = lessons.get(lid)
        if not L:
            continue
        meta = LESSON_META.get(lid, {})
        if meta.get("hw"):
            hw_by.append(emit_hw_lesson(lid, meta["hw"]))
        if meta.get("ext"):
            ext_by.append(emit_ext_lesson(lid, meta["ext"]))
        for v in L.get("vocab") or []:
            vid = v.get("id")
            if not vid:
                continue
            lines, ref = auto_tip(v, L)
            vocab_entries.append(emit_vocab_entry(vid, lines, ref))

    vocab_block = "\n".join(vocab_entries)
    hw_block = "\n".join(hw_by) if hw_by else "  /* none */"
    ext_block = "\n".join(ext_by) if ext_by else "  /* none */"

    return f'''/** 第3–6单元第9–24课 · 知识卡（对齐第1课 L1KnowledgeTips 口径）
 * 生成：python scripts/build-lessons-9-24-knowledge-tips.py
 * 课 {from_lid}–{to_lid} · 逐词 VOCAB + 当课作業/拡張侧栏提示
 */
const Lessons924KnowledgeTips = (function () {{
  const conv = {{ label: "→ 会話", gate: 2 }};
  const vocab = {{ label: "→ 単語", gate: 0 }};

  const VOCAB = {{
{vocab_block}
  }};

  const HW_BY_LESSON = {{
{hw_block}
  }};

  const EXT_BY_LESSON = {{
{ext_block}
  }};

  const HW_DEFAULT = {{
    発音: {{ lines: [{{ zh: "注意声调・促音・长音；配合课文🔊朗读。" }}], links: [vocab] }},
    活用: {{ lines: [{{ zh: "活用见单词栏或文法节点四种时态。" }}], links: [vocab] }},
    選択: {{ lines: [{{ zh: "选择题先判时态与敬体，再选助词。" }}], links: [conv] }},
    穴埋め: {{ lines: [{{ zh: "填空看清词尾变化与助词槽位。" }}], links: [conv] }},
    翻訳: {{ lines: [{{ zh: "日译中保留「が・の」等；中译日用です／ます形。" }}], links: [conv] }},
    総合: {{ lines: [{{ zh: "综合题对照当课课文与 gate Q12。" }}], links: [conv] }},
    間違い: {{ lines: [{{ zh: "改错对照拡張「常见误用」。" }}], links: [conv] }},
    作文: {{ lines: [{{ zh: "作文套用拡張模板，替换［］内词。" }}], links: [conv] }},
    聴解: {{ lines: [{{ zh: "听力配合🔊；无音频先读课文。" }}], links: [conv] }},
    小テスト: {{ lines: [{{ zh: "交互小测12题；错题回文法节点。" }}], links: [conv] }},
  }};

  const EXT_DEFAULT = {{
    pronunciation: {{ lines: [{{ zh: "发音要点见 summaryBlocks。" }}], links: [vocab] }},
    etymology: {{ lines: [{{ zh: "语源注释助记汉字读法。" }}], links: [vocab] }},
    preview: {{ lines: [{{ zh: "活用予告=下节课形，先识读。" }}], links: [vocab] }},
    honorific: {{ lines: [{{ zh: "です＝丁寧体；对长辈避免简体。" }}], links: [conv] }},
    template: {{ lines: [{{ zh: "模板块可替换［］做口头练习。" }}], links: [conv] }},
    mistakes: {{ lines: [{{ zh: "常见误用=阅卷高频；对照会話 A 轨。" }}], links: [conv] }},
    keyPoints: {{ lines: [{{ zh: "会話要点=课文关键词组。" }}], links: [conv] }},
    rolePlay: {{ lines: [{{ zh: "角色扮演按课题换人名・场所。" }}], links: [conv] }},
    grammar: {{ lines: [{{ zh: "文法まとめ=当课全部节点；逐条朗读例句。" }}], links: [{{ label: "→ 文法", gate: 1 }}] }},
    basicText: {{ lines: [{{ zh: "基本课文四句=文法主干。" }}], links: [{{ label: "→ 文法", gate: 1 }}] }},
  }};

  function vocabTip(v) {{
    if (!v) return null;
    if (VOCAB[v.id]) return VOCAB[v.id];
    return null;
  }}

  function grammar(node) {{
    if (!node) return null;
    const zh = (node.explanationZh || node.titleZh || "").trim();
    if (zh) {{
      const lines = zh.split(/\\n+/)
        .slice(0, 4)
        .map((t) => ({{ zh: t.trim() }}))
        .filter((l) => l.zh);
      if (lines.length) return {{ lines, links: [conv, vocab] }};
    }}
    return {{ lines: [{{ zh: "对照例句朗读；有疑问点开文法例句。" }}], links: [{{ label: "→ 文法", gate: 1 }}] }};
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
      return {{ lines: [{{ zh: "迄今总结含课文锚点；对照参考表。" }}], links: [conv] }};
    }}
    return {{ lines: [{{ zh: "本块与当课五关交叉对照。" }}], links: [conv] }};
  }}

  return {{ vocab: vocabTip, grammar, homeworkTitle, extensionKey }};
}})();
'''


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="from_lid", type=int, default=9)
    ap.add_argument("--to", dest="to_lid", type=int, default=24)
    args = ap.parse_args()
    js = build(args.from_lid, args.to_lid)
    OUT.write_text(js, encoding="utf-8")
    n_vocab = js.count('": {')
    print(f"[OK] wrote {OUT} (lessons {args.from_lid}-{args.to_lid}, ~{n_vocab} vocab tips)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
