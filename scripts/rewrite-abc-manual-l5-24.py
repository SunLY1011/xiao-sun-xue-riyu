#!/usr/bin/env python3
"""L5–24 会話 ABC · 人工策划重写（对齐 L1 口径：A=课文 · B/C 语义分层且日文不同）

停用 generate-unit2-dialogue-abc.py / generate-lessons-9-24-dialogue-abc.py 覆盖手修。
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ZH_JS = ROOT / "js" / "data" / "dialogue-zh-l9-24.js"
OUT_L5_8 = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"
OUT_L9_24 = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"

sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util

def _load_gen(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_gen58 = _load_gen("gen58", ROOT / "scripts" / "generate-unit2-dialogue-abc.py")
UNIT2_DIALOGUE_ZH = getattr(_gen58, "UNIT2_DIALOGUE_ZH", {})
LESSON_SCENE_HINT = {
    **_gen58.LESSON_SCENE_HINT,
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

try:
    from curated_dialogue_zh_l9_12 import CURATED_L9_12
    from curated_dialogue_zh_l13_24 import CURATED_L13_24
    from curated_zh_lookup import lookup_curated
except ImportError:
    CURATED_L9_12 = {}
    CURATED_L13_24 = {}

    def lookup_curated(jp, *a):
        return ""


from abc_variants import (  # noqa: E402
    audit_visible,
    b_chinese,
    is_narrative,
    norm_jp,
    note_b,
    note_c,
    variant_b,
    variant_c,
    vis_norm,
)

NARRATIVE_RE = re.compile(r"^[（(].*[）)]$")


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def load_zh_l9_24() -> dict[str, str]:
    if not ZH_JS.is_file():
        return {}
    text = ZH_JS.read_text(encoding="utf-8")
    m = re.search(r"const\s+DIALOGUE_ZH_L9_24\s*=\s*(\{.*?\})\s*;", text, re.S)
    return json.loads(m.group(1)) if m else {}


def zh_lookup(jp: str, lid: int, zh_map: dict[str, str]) -> str:
    n = norm_jp(jp)
    if lid <= 8:
        return UNIT2_DIALOGUE_ZH.get(n, "")
    z = lookup_curated(n, CURATED_L13_24, CURATED_L9_12)
    if z:
        return z
    return zh_map.get(n, "")


def abc_guide(dlg: dict, lid: int) -> str:
    speaker = (dlg.get("userTurn") or {}).get("speaker") or "B"
    title = (dlg.get("title") or "会話").split("（")[0].strip()
    theme = LESSON_SCENE_HINT.get(lid, "会話")
    replies = (dlg.get("userTurn") or {}).get("replies") or []
    ajp = (replies[0].get("japanese") if replies else "") or ""
    hint = ajp[:18] + "…" if len(ajp) > 18 else ajp
    return (
        f"「{title}」· {theme} · {speaker}应答。"
        f"A＝课文「{hint}」；B＝同场景口语/缩短；C＝更礼貌或郑重。"
    )


def build_entry(dlg: dict, lid: int, zh_map: dict[str, str]) -> dict | None:
    replies = (dlg.get("userTurn") or {}).get("replies") or []
    if not replies or not replies[0].get("japanese"):
        return None
    a_jp = norm_jp(replies[0]["japanese"])
    a_zh = (replies[0].get("chinese") or "").strip() or zh_lookup(a_jp, lid, zh_map)
    speaker = (dlg.get("userTurn") or {}).get("speaker") or ""
    b_jp = variant_b(a_jp)
    c_jp = variant_c(a_jp)
    if b_jp == c_jp and not is_narrative(a_jp):
        c_jp = variant_c(b_jp + " ")
        if c_jp == b_jp:
            c_jp = a_jp[:-1] + "ね。" if a_jp.endswith("。") else a_jp + "ね"
    title = (dlg.get("title") or "会話").split("（")[0].strip()
    theme = LESSON_SCENE_HINT.get(lid, "会話")
    b_zh = (
        zh_lookup(b_jp, lid, zh_map)
        if b_jp != a_jp and zh_lookup(b_jp, lid, zh_map)
        else b_chinese(a_zh, a_jp, b_jp)
    )
    c_zh = zh_lookup(c_jp, lid, zh_map) if c_jp != a_jp else a_zh
    return {
        "abcGuideZh": abc_guide(dlg, lid),
        "userTurn": {"speaker": speaker},
        "replies": [
            {
                "label": "A",
                "rank": 1,
                "japanese": a_jp,
                "chinese": a_zh,
                "noteZh": f"A 标准答（{speaker}）：「{title}」· {theme}；与教材会話一致.",
            },
            {
                "label": "B",
                "rank": 2,
                "japanese": b_jp,
                "chinese": b_zh or a_zh,
                "noteZh": note_b(a_jp, b_jp, speaker),
            },
            {
                "label": "C",
                "rank": 3,
                "japanese": c_jp,
                "chinese": c_zh or a_zh,
                "noteZh": note_c(a_jp, c_jp, speaker),
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


def write_l5_8(maps: dict[int, dict]) -> None:
    header = """/**
 * 第2单元第5–8课 · 会話 ABC（A=课文 · B/C=场景变体 + 提示）
 * 人工策划 · scripts/rewrite-abc-manual-l5-24.py（对齐 L1 口径；勿用旧 generate 覆盖）
 */
"""
    body = [header]
    for name, lid in [("L5_DIALOGUE_ABC", 5), ("L6_DIALOGUE_ABC", 6), ("L7_DIALOGUE_ABC", 7), ("L8_DIALOGUE_ABC", 8)]:
        body.extend(emit_map(name, maps[lid]))
        body.append("")
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
    OUT_L5_8.write_text("\n".join(body) + "\n", encoding="utf-8")


def write_l9_24(maps: dict[int, dict]) -> None:
    header = """/**
 * 第3–6单元第9–24课 · 会話 ABC（A=课文 · B/C=场景变体）
 * 人工策划 · scripts/rewrite-abc-manual-l5-24.py（对齐 L1 口径；勿用旧 generate 覆盖）
 */
"""
    body = [header, "const LESSONS_9_24_DIALOGUE_ABC = {"]
    for lid in range(9, 25):
        body.append(f"  {lid}: {{")
        for k, v in maps[lid].items():
            body.append(f"    {js_string(k)}: {{")
            body.append(f"      abcGuideZh: {js_string(v['abcGuideZh'])},")
            body.append(f"      userTurn: {{ speaker: {js_string(v['userTurn']['speaker'])} }},")
            body.append("      replies: [")
            for r in v["replies"]:
                body.append("        {")
                body.append(f"          label: {js_string(r['label'])},")
                body.append(f"          rank: {r['rank']},")
                body.append(f"          japanese: {js_string(r['japanese'])},")
                body.append(f"          chinese: {js_string(r['chinese'])},")
                body.append(f"          noteZh: {js_string(r['noteZh'])},")
                body.append("        },")
            body.append("      ],")
            body.append("    },")
        body.append("  },")
    body.append("};")
    body.append(
        """
/** 合并第9–24课课文对话与 ABC 扩展 */
function applyLessons9_24DialogueAbc(lessonId, dialogues) {
  const map = LESSONS_9_24_DIALOGUE_ABC[Number(lessonId)];
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
    OUT_L9_24.write_text("\n".join(body) + "\n", encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    zh_map = load_zh_l9_24()
    maps: dict[int, dict] = {}
    for lid in range(5, 25):
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
        print(f"[OK] L{lid}: {len(mp)} scenes")
    sb, sc, sv = audit_visible(maps)
    print(f"[AUDIT] B==A: {sb} · C==A: {sc} · vis(B)==vis(A): {sv}")
    write_l5_8({k: maps[k] for k in range(5, 9)})
    write_l9_24({k: maps[k] for k in range(9, 25)})
    print(f"Wrote {OUT_L5_8.name} + {OUT_L9_24.name}")
    return 0 if sb == 0 and sc == 0 and sv == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
