#!/usr/bin/env python3
"""第2单元第5–8课 · 会話 ABC（严格映射 MVP：A=课文 · B/C=场景沟通变体）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"

# 与 align-unit2-l1-mvp.py 一致 · A 轨中文
UNIT2_DIALOGUE_ZH: dict[str, str] = {
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

LESSON_SCENE_HINT: dict[int, str] = {
    5: "朝の習慣 · 时间表达",
    6: "旅行の計画 · 移动与へ/で/から/まで",
    7: "カフェで注文 · を/にします/ください",
    8: "プレゼント · 授受动词",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def zh_lookup(jp: str) -> str:
    return UNIT2_DIALOGUE_ZH.get(norm_jp(jp), "")


def variant_b(jp: str) -> str:
    s = norm_jp(jp)
    if not s:
        return jp
    # 省略主语 / 应答前缀
    for prefix in ("はい、", "いいえ、", "えっ、", "あっ、", "そうですね。"):
        if s.startswith(prefix):
            s = norm_jp(s[len(prefix) :])
            break
    s = re.sub(r"^私は\s+", "", s)
    s = re.sub(r"^わたしは\s+", "", s)
    s = re.sub(r"それから、", "", s)
    s = re.sub(r"そして、", "", s)
    s = re.sub(r"^じゃあ、", "", s)
    # 双句留后句
    if s == norm_jp(jp) and "。" in s:
        parts = [p.strip() for p in s.split("。") if p.strip()]
        if len(parts) >= 2:
            s = parts[-1] + "。"
    # いつも→だいたい
    if s == norm_jp(jp) and "いつも" in s:
        s = s.replace("いつも", "だいたい")
    # 问句缩短
    if s == norm_jp(jp) and s.endswith("ですか。"):
        s = s.replace("ですか。", "ですか。")  # keep
    if s == norm_jp(jp) and "でしょうか" not in s and s.endswith("？"):
        inner = s[:-1]
        if len(inner) > 12:
            s = inner[: min(20, len(inner))] + "？"
    return norm_jp(s) or jp


def variant_c(jp: str) -> str:
    s = norm_jp(jp)
    if not s:
        return jp
    if s.endswith("ください。"):
        return s.replace("ください。", "いただけますか。")
    if s.endswith("？"):
        body = s[:-1]
        if body.endswith("は") or "ですか" in body or "ますか" in body:
            return body + "でしょうか。"
        return body + "かな。"
    if s.endswith("。"):
        body = s[:-1]
        if body.endswith("です") and "ですか" not in body:
            if "ありがとう" in body:
                return body + "。本当にありがとうございます。"
            return body + "ね。"
        if body.endswith("ます"):
            return body + "ね。"
        if body.endswith("でした"):
            return body + "ね。"
    if "（" in s:
        return s
    return s + "ね。"


def zh_for_variant(a_jp: str, b_jp: str, a_zh: str, label: str) -> str:
    direct = zh_lookup(b_jp)
    if direct:
        return direct
    if not a_zh:
        return ""
    if label == "B":
        if b_jp == a_jp:
            return a_zh
        if len(b_jp) < len(a_jp):
            return a_zh + "（更短、接上文）"
        return a_zh + "（同事聊天常用说法）"
    if label == "C":
        if b_jp == a_jp:
            return a_zh + "（语气更软）"
        return a_zh + "（更礼貌/郑重）"
    return ""


def note_for_variant(label: str, speaker: str, title: str, a_jp: str, v_jp: str) -> str:
    scene = title.split("（")[0] if title else "会話"
    if label == "A":
        return f"课文原句（{speaker}）。{scene}场景标准答，与教材课文一致。"
    if label == "B":
        if v_jp != a_jp:
            return f"B 省略或缩短：对方已接上文、同事间节奏快时用（非错答，可沟通）。"
        return "B 与课文同句但语气更短：可用来跟读巩固原句。"
    return "C 语气更软或稍郑重：对客户/上级或想礼貌确认时用（非错答）。"


def abc_guide_zh(dlg: dict, lid: int) -> str:
    title = (dlg.get("title") or "").split("（")[0]
    speaker = (dlg.get("userTurn") or {}).get("speaker") or "B"
    theme = LESSON_SCENE_HINT.get(lid, "")
    return (
        f"{theme} · 本句由{speaker}回答。"
        f"A=课文；B=同场景缩短/省略说法；C=更软或更礼貌说法（三种均可沟通）。"
    )


def build_entry(dlg: dict, lid: int) -> dict | None:
    replies = (dlg.get("userTurn") or {}).get("replies") or []
    if not replies or not replies[0].get("japanese"):
        return None
    a_jp = norm_jp(replies[0]["japanese"])
    a_zh = (replies[0].get("chinese") or "").strip() or zh_lookup(a_jp)
    speaker = (dlg.get("userTurn") or {}).get("speaker") or ""
    title = dlg.get("title") or ""
    b_jp = variant_b(a_jp)
    c_jp = variant_c(a_jp)
    if b_jp == c_jp:
        c_jp = variant_c(b_jp)
    if b_jp == a_jp and c_jp == a_jp:
        b_jp = a_jp.replace("いつも", "だいたい") if "いつも" in a_jp else a_jp + " "
        b_jp = norm_jp(b_jp) or a_jp
    return {
        "abcGuideZh": abc_guide_zh(dlg, lid),
        "userTurn": {"speaker": speaker},
        "replies": [
            {
                "label": "A",
                "rank": 1,
                "japanese": a_jp,
                "chinese": a_zh,
                "noteZh": note_for_variant("A", speaker, title, a_jp, a_jp),
            },
            {
                "label": "B",
                "rank": 2,
                "japanese": b_jp,
                "chinese": zh_for_variant(a_jp, b_jp, a_zh, "B"),
                "noteZh": note_for_variant("B", speaker, title, a_jp, b_jp),
            },
            {
                "label": "C",
                "rank": 3,
                "japanese": c_jp,
                "chinese": zh_for_variant(a_jp, c_jp, a_zh, "C"),
                "noteZh": note_for_variant("C", speaker, title, a_jp, c_jp),
            },
        ],
    }


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_map(name: str, mp: dict) -> list[str]:
    lines = [f"const {name} = {{"]
    for k, v in mp.items():
        lines.append(f"  {js_string(k)}: {{")
        lines.append(f"    abcGuideZh: {js_string(v['abcGuideZh'])},")
        lines.append(f"    userTurn: {{ speaker: {js_string(v['userTurn']['speaker'])} }},")
        lines.append("    replies: [")
        for r in v["replies"]:
            lines.append("      {")
            lines.append(f"        label: {js_string(r['label'])},")
            lines.append(f"        rank: {r['rank']},")
            lines.append(f"        japanese: {js_string(r['japanese'])},")
            lines.append(f"        chinese: {js_string(r['chinese'])},")
            lines.append(f"        noteZh: {js_string(r['noteZh'])},")
            lines.append("      },")
        lines.append("    ],")
        lines.append("  },")
    lines.append("};")
    return lines


def main() -> int:
    lessons = load_lessons()
    maps: dict[int, dict] = {}
    for lid in (5, 6, 7, 8):
        L = lessons.get(lid)
        if not L:
            print(f"[FAIL] lesson {lid} missing")
            return 1
        mp = {}
        for d in L.get("dialogues") or []:
            ent = build_entry(d, lid)
            if ent and d.get("id"):
                mp[d["id"]] = ent
        maps[lid] = mp
        n = len(mp)
        dlg_n = len(L.get("dialogues") or [])
        if n != dlg_n:
            print(f"[WARN] lesson {lid}: ABC {n}/{dlg_n}")
        print(f"[OK] lesson {lid}: {n} scenes × ABC")

    header = """/**
 * 第2单元第5–8课 · 会話 ABC（A=课文 · B/C=场景变体 + 提示）
 * 由 scripts/generate-unit2-dialogue-abc.py 生成；可手修后重跑
 */
"""
    body: list[str] = [header]
    body.extend(emit_map("L5_DIALOGUE_ABC", maps[5]))
    body.append("")
    body.extend(emit_map("L6_DIALOGUE_ABC", maps[6]))
    body.append("")
    body.extend(emit_map("L7_DIALOGUE_ABC", maps[7]))
    body.append("")
    body.extend(emit_map("L8_DIALOGUE_ABC", maps[8]))
    body.append(
        """
const UNIT2_DIALOGUE_ABC_BY_LESSON = {
  5: L5_DIALOGUE_ABC,
  6: L6_DIALOGUE_ABC,
  7: L7_DIALOGUE_ABC,
  8: L8_DIALOGUE_ABC,
};

/** 合并第5–8课课文对话与 ABC 扩展 */
function applyUnit2DialogueAbc(lessonId, dialogues) {
  const map = UNIT2_DIALOGUE_ABC_BY_LESSON[Number(lessonId)];
  if (!map || !Array.isArray(dialogues)) return dialogues;
  return dialogues.map((d) => {
    const ext = map[d.id];
    if (!ext) return d;
    const opener = {
      ...d.opener,
      ...(ext.opener || {}),
      chinese: ext.openerZh || d.opener?.chinese || "",
    };
    const userTurn = {
      ...d.userTurn,
      ...ext.userTurn,
      replies: ext.replies || d.userTurn?.replies || [],
    };
    return {
      ...d,
      abcGuideZh: ext.abcGuideZh,
      userTurn,
      opener,
    };
  });
}
"""
    )
    OUT.write_text("\n".join(body) + "\n", encoding="utf-8")
    text = OUT.read_text(encoding="utf-8")
    if ",," in text:
        print("[FAIL] syntax: double comma in output")
        return 1
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
