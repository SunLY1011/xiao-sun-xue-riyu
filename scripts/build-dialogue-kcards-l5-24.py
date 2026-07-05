#!/usr/bin/env python3
"""L5–24 会話场景黄卡 · 生成 DIALOGUE_BY_LESSON 并合并进 knowledge-tips.js"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT_SNIPPET = ROOT / "docs" / "_dialogue-kcards-l5-24-snippet.js"
TIPS_FILES = {
    range(5, 9): ROOT / "js" / "data" / "unit2-knowledge-tips.js",
    range(9, 25): ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def grammar_ref(d: dict, lid: int) -> str:
    gid = d.get("grammarNodeId") or d.get("grammarId")
    if gid:
        return gid
    m = re.match(r"l(\d+)_", d.get("id") or "")
    return f"l{lid}_g1" if m else f"l{lid}_g1"


def tip_for_scene(d: dict, idx: int, lid: int) -> dict:
    op = d.get("opener") or {}
    ut = d.get("userTurn") or {}
    replies = ut.get("replies") or [{}]
    r0 = replies[0]
    lines: list[dict] = []
    title = (d.get("title") or "").split("（")[0].strip()
    if title:
        lines.append({"zh": f"场景「{title}」· 第 {idx + 1} 句"})
    ojp = (op.get("japanese") or "").strip()
    ozh = (op.get("chinese") or "").strip()
    if ojp:
        lines.append({"ja": ojp, "zh": ozh or "发起句：对照课文朗读。"})
    rjp = (r0.get("japanese") or r0.get("jp") or "").strip()
    rzh = (r0.get("chinese") or r0.get("zh") or "").strip()
    sp = (ut.get("speaker") or "B").strip()
    if rjp:
        lines.append({"ja": rjp, "zh": rzh or f"应答（{sp}）：见 ABC 之 A 轨。"})
    elif not ojp:
        lines.append({"zh": "对照课文会話链朗读本场景。"})
    gref = grammar_ref(d, lid)
    return {
        "lines": lines,
        "links": [
            {"label": "→ 会話", "gate": 2},
            {"label": "→ 文法", "gate": 1, "ref": gref},
        ],
    }


def build_dialogue_map(lessons: dict[int, dict], lids: range) -> dict[int, list]:
    out: dict[int, list] = {}
    for lid in lids:
        ds = lessons.get(lid, {}).get("dialogues") or []
        out[lid] = [tip_for_scene(d, i, lid) for i, d in enumerate(ds)]
    return out


def js_dialogue_block(dmap: dict[int, list]) -> str:
    parts = []
    for lid in sorted(dmap.keys()):
        parts.append(f"  {lid}: {json.dumps(dmap[lid], ensure_ascii=False, indent=4)}")
    return "const DIALOGUE_BY_LESSON = {\n" + ",\n".join(parts) + "\n};\n"


def merge_into_tips(path: Path, dmap: dict[int, list]) -> None:
    text = path.read_text(encoding="utf-8")
    block = js_dialogue_block(dmap)
    if "DIALOGUE_BY_LESSON" in text:
        text = re.sub(
            r"const DIALOGUE_BY_LESSON = \{[\s\S]*?\};\n\n",
            block + "\n",
            text,
            count=1,
        )
    else:
        text = text.replace(
            "  function grammar(node) {",
            block
            + "\n  function dialogue(sceneIdx, lessonId) {\n"
            + "    const lid = Number(lessonId);\n"
            + "    const list = DIALOGUE_BY_LESSON[lid];\n"
            + "    if (!list) return null;\n"
            + "    return list[sceneIdx] || null;\n"
            + "  }\n\n"
            + "  function grammar(node) {",
        )
        old_return = re.search(
            r"return \{ vocab: vocabTip, grammar, homeworkTitle, extensionKey \};",
            text,
        )
        if old_return:
            text = text.replace(
                old_return.group(0),
                "return { vocab: vocabTip, dialogue, grammar, homeworkTitle, extensionKey };",
            )
        elif "return { vocab: vocabTip, grammar," in text and "dialogue" not in text:
            text = re.sub(
                r"return \{ vocab: vocabTip, grammar,([^}]+)\};",
                r"return { vocab: vocabTip, dialogue, grammar,\1};",
                text,
                count=1,
            )
    path.write_text(text, encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    d58 = build_dialogue_map(lessons, range(5, 9))
    d924 = build_dialogue_map(lessons, range(9, 25))
    full = {**d58, **d924}
    OUT_SNIPPET.write_text(js_dialogue_block(full), encoding="utf-8")
    merge_into_tips(TIPS_FILES[range(5, 9)], d58)
    merge_into_tips(TIPS_FILES[range(9, 25)], d924)
    total = sum(len(v) for v in full.values())
    print(f"[OK] L5-24 dialogue kcards: {total} scenes")
    print(f"     snippet -> {OUT_SNIPPET.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
