#!/usr/bin/env python3
"""第3–6单元第9–24课 · 会話 ABC（A=课文 · B/C=场景沟通变体）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ZH_JS = ROOT / "js" / "data" / "dialogue-zh-l9-24.js"
OUT = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"

sys.path.insert(0, str(ROOT / "scripts"))
try:
    from curated_dialogue_zh_l9_12 import CURATED_L9_12
    from curated_dialogue_zh_l13_24 import CURATED_L13_24
except ImportError:
    CURATED_L9_12 = {}
    CURATED_L13_24 = {}

LESSON_SCENE_HINT: dict[int, str] = {
    9: "料理の感想 · イ形容詞",
    10: "京都の紅葉 · ナ形容詞",
    11: "好き・上手 · が好き／が上手",
    12: "比較 · より／一番",
    13: "机の上 · 数量詞・ある",
    14: "て形 · 連続動作",
    15: "ている · 進行・許可",
    16: "広くて明るい · 形容詞て形",
    17: "ほしい · 愿望",
    18: "なる · 变化・推量",
    19: "ないで · 禁止・义务",
    20: "ことができる · 可能",
    21: "たことがある · 经历",
    22: "思う · 引用・传闻",
    23: "伝える · 命令・请求",
    24: "別れ · 简体・总结",
}


def load_zh_map() -> dict[str, str]:
    if not ZH_JS.is_file():
        return {}
    text = ZH_JS.read_text(encoding="utf-8")
    m = re.search(r"const\s+DIALOGUE_ZH_L9_24\s*=\s*(\{.*?\})\s*;", text, re.S)
    return json.loads(m.group(1)) if m else {}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def zh_lookup(jp: str, mp: dict[str, str]) -> str:
    from curated_zh_lookup import lookup_curated

    zh = lookup_curated(jp, CURATED_L13_24, CURATED_L9_12)
    if zh:
        return zh
    return mp.get(norm_jp(jp), "")


def variant_b(jp: str) -> str:
    s = norm_jp(jp)
    if not s:
        return jp
    for prefix in ("はい、", "いいえ、", "えっ、", "あっ、", "そうですね。"):
        if s.startswith(prefix):
            s = norm_jp(s[len(prefix) :])
            break
    s = re.sub(r"^私は\s+", "", s)
    s = re.sub(r"^わたしは\s+", "", s)
    s = re.sub(r"それから、", "", s)
    s = re.sub(r"そして、", "", s)
    s = re.sub(r"^じゃあ、", "", s)
    if s == norm_jp(jp) and "。" in s:
        parts = [p.strip() for p in s.split("。") if p.strip()]
        if len(parts) >= 2:
            s = parts[-1] + "。"
    if s == norm_jp(jp) and "いつも" in s:
        s = s.replace("いつも", "だいたい")
    return norm_jp(s) or jp


def variant_c(jp: str) -> str:
    s = norm_jp(jp)
    if not s:
        return jp
    if s.endswith("ください。"):
        return s.replace("ください。", "いただけますか。")
    if s.endswith("？"):
        body = s[:-1]
        if "ですか" in body or "ますか" in body:
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
            return "B 省略或缩短：对方已接上文、同事间节奏快时用（非错答，可沟通）。"
        return "B 与课文同句但语气更短：可用来跟读巩固原句。"
    return "C 语气更软或稍郑重：对客户/上级或想礼貌确认时用（非错答）。"


def abc_guide_zh(dlg: dict, lid: int) -> str:
    speaker = (dlg.get("userTurn") or {}).get("speaker") or "B"
    title = (dlg.get("title") or "会話").split("（")[0].strip()
    theme = LESSON_SCENE_HINT.get(lid, "会話")
    return (
        f"{title} · {theme} · 本句由{speaker}回答。"
        f"A=课文；B=省略/缩短；C=更礼貌（三种均可沟通）。"
    )


def build_entry(dlg: dict, lid: int, zh_map: dict[str, str]) -> dict | None:
    replies = (dlg.get("userTurn") or {}).get("replies") or []
    if not replies or not replies[0].get("japanese"):
        return None
    a_jp = norm_jp(replies[0]["japanese"])
    a_zh = zh_lookup(a_jp, zh_map) or (replies[0].get("chinese") or "").strip()
    speaker = (dlg.get("userTurn") or {}).get("speaker") or ""
    title = dlg.get("title") or ""
    b_jp = variant_b(a_jp)
    c_jp = variant_c(a_jp)
    if b_jp == c_jp:
        c_jp = variant_c(b_jp)
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


def emit_js(maps: dict[int, dict]) -> None:
    lines = [
        "/**",
        " * 第3–6单元第9–24课 · 会話 ABC",
        " * scripts/generate-lessons-9-24-dialogue-abc.py",
        " */",
        "const LESSONS_9_24_DIALOGUE_ABC = {",
    ]
    for lid in sorted(maps.keys()):
        mp = maps[lid]
        lines.append(f"  {lid}: {{")
        for k, v in mp.items():
            lines.append(f"    {js_string(k)}: {{")
            lines.append(f"      abcGuideZh: {js_string(v['abcGuideZh'])},")
            lines.append(f"      userTurn: {{ speaker: {js_string(v['userTurn']['speaker'])} }},")
            lines.append("      replies: [")
            for r in v["replies"]:
                lines.append("        {")
                lines.append(f"          label: {js_string(r['label'])},")
                lines.append(f"          rank: {r['rank']},")
                lines.append(f"          japanese: {js_string(r['japanese'])},")
                lines.append(f"          chinese: {js_string(r['chinese'])},")
                lines.append(f"          noteZh: {js_string(r['noteZh'])},")
                lines.append("        },")
            lines.append("      ],")
            lines.append("    },")
        lines.append("  },")
    lines.append("};")
    lines.append("")
    lines.append("function applyLessons9_24DialogueAbc(lessonId, dialogues) {")
    lines.append("  const map = LESSONS_9_24_DIALOGUE_ABC[Number(lessonId)];")
    lines.append("  if (!map || !Array.isArray(dialogues)) return dialogues;")
    lines.append("  return dialogues.map((d) => {")
    lines.append("    const ext = map[d.id];")
    lines.append("    if (!ext) return d;")
    lines.append("    const opener = { ...d.opener, chinese: d.opener?.chinese || ext.replies?.[0]?.chinese || \"\" };")
    lines.append("    return { ...d, abcGuideZh: ext.abcGuideZh, userTurn: { ...d.userTurn, ...ext.userTurn, replies: ext.replies } };")
    lines.append("  });")
    lines.append("}")
    lines.append("")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    zh_map = load_zh_map()
    lessons = load_lessons()
    maps: dict[int, dict] = {}
    for lid in range(9, 25):
        L = lessons.get(lid)
        if not L:
            print(f"[FAIL] lesson {lid}")
            return 1
        mp = {}
        for d in L.get("dialogues") or []:
            ent = build_entry(d, lid, zh_map)
            if ent and d.get("id"):
                mp[d["id"]] = ent
        maps[lid] = mp
        dlg_n = len(L.get("dialogues") or [])
        print(f"[OK] L{lid}: ABC {len(mp)}/{dlg_n}")
        if len(mp) != dlg_n:
            print(f"[WARN] L{lid} ABC mismatch")
    emit_js(maps)
    if ",," in OUT.read_text(encoding="utf-8"):
        print("[FAIL] double comma in output")
        return 1
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
