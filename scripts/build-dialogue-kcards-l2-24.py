#!/usr/bin/env python3
"""L1–24 会話场景黄卡 · L1 深度（opener + A 课文 + B/C 提示 + 文法链接）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "audit_abc", ROOT / "scripts" / "audit-abc-all-units.py"
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
load_l1_abc = _mod.load_l1_abc
load_u1_abc = _mod.load_u1_abc
load_u2_abc = _mod.load_u2_abc
load_924_abc = _mod.load_924_abc


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def merge_abc() -> dict[int, dict[str, dict]]:
    out: dict[int, dict[str, dict]] = {}
    out.update(load_l1_abc())
    out.update(load_u1_abc())
    out.update(load_u2_abc())
    out.update(load_924_abc())
    return out


def grammar_ref(d: dict, lid: int) -> str:
    gid = d.get("grammarNodeId") or d.get("grammarId")
    if gid:
        return gid
    m = re.match(r"l(\d+)_", d.get("id") or "")
    return f"l{lid}_g1" if m else f"l{lid}_g1"


def tip_for_scene(d: dict, idx: int, lid: int, abc: dict | None) -> dict:
    op = d.get("opener") or {}
    ut = d.get("userTurn") or {}
    replies = ut.get("replies") or [{}]
    r0 = replies[0]
    lines: list[dict] = []
    title = (d.get("title") or "").split("（")[0].strip()
    sp = (ut.get("speaker") or "B").strip()
    ojp = (op.get("japanese") or "").strip()
    ozh = (op.get("chinese") or "").strip()
    rjp = (r0.get("japanese") or r0.get("jp") or "").strip()
    rzh = (r0.get("chinese") or r0.get("zh") or "").strip()

    by: dict[str, dict] = {}
    if abc and abc.get("replies"):
        for r in abc["replies"]:
            by[r.get("label", "")] = r

    a = by.get("A", {})
    b = by.get("B", {})
    c = by.get("C", {})

    if ojp:
        teach = f"发起句（{op.get('speaker', 'A')}）：对照课文朗读。"
        if title:
            teach = f"「{title}」· {teach}"
        lines.append({"ja": ojp, "zh": ozh or teach})

    ajp = (a.get("japanese") or rjp).strip()
    if ajp:
        anote = (a.get("noteZh") or "").strip()
        lines.append(
            {
                "ja": ajp,
                "zh": (a.get("chinese") or rzh or f"课文标准答（{sp}）。")
                + (f" {anote}" if anote and anote not in (a.get("chinese") or "") else ""),
            }
        )
    elif rjp:
        lines.append({"ja": rjp, "zh": rzh or f"应答（{sp}）：见 ABC 之 A 轨。"})

    bnote = (b.get("noteZh") or "").strip()
    if bnote and b.get("japanese") and b["japanese"] != ajp:
        bzh = (b.get("chinese") or "").strip()
        if bzh and bzh != (a.get("chinese") or rzh) and "（更短/口语）" not in bzh:
            lines.append({"ja": b["japanese"], "zh": bzh})
        else:
            lines.append({"ja": b["japanese"], "zh": bnote})

    cnote = (c.get("noteZh") or "").strip()
    if cnote and c.get("japanese") and c["japanese"] not in (ajp, b.get("japanese")):
        czh = (c.get("chinese") or "").strip()
        if czh and czh != (a.get("chinese") or rzh) and "（更礼貌）" not in czh:
            lines.append({"ja": c["japanese"], "zh": czh})
        else:
            lines.append({"ja": c["japanese"], "zh": cnote})

    if len(lines) == 1 and title:
        lines.append({"zh": f"本场景练习「{title}」；完成 ABC 三答后听录评分。"})

    gref = grammar_ref(d, lid)
    return {
        "lines": lines[:5],
        "links": [
            {"label": "→ 会話", "gate": 2},
            {"label": "→ 文法", "gate": 1, "ref": gref},
        ],
    }


def js_dialogue_block(dmap: dict[int, list]) -> str:
    parts = [f"  {lid}: {json.dumps(dmap[lid], ensure_ascii=False, indent=4)}" for lid in sorted(dmap)]
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
        raise SystemExit(f"DIALOGUE_BY_LESSON missing in {path}")
    path.write_text(text, encoding="utf-8")


def merge_l1_dialogue(path: Path, tips: list) -> None:
    text = path.read_text(encoding="utf-8")
    block = "  const DIALOGUE = " + json.dumps(tips, ensure_ascii=False, indent=4) + ";\n"
    text = re.sub(r"  const DIALOGUE = \[[\s\S]*?\];\n", block, text, count=1)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    abc_all = merge_abc()
    u1: dict[int, list] = {}
    u2: dict[int, list] = {}
    u924: dict[int, list] = {}
    l1_tips: list = []
    for lid in range(1, 25):
        ds = lessons[lid].get("dialogues") or []
        abc_map = abc_all.get(lid, {})
        tips = [
            tip_for_scene(d, i, lid, abc_map.get(d.get("id", "")))
            for i, d in enumerate(ds)
        ]
        if lid == 1:
            l1_tips = tips
        elif lid <= 4:
            u1[lid] = tips
        elif lid <= 8:
            u2[lid] = tips
        else:
            u924[lid] = tips
        print(f"[OK] L{lid}: {len(tips)} kcards")
    merge_l1_dialogue(ROOT / "js/data/l1-knowledge-tips.js", l1_tips)
    merge_into_tips(ROOT / "js/data/unit1-knowledge-tips.js", u1)
    merge_into_tips(ROOT / "js/data/unit2-knowledge-tips.js", u2)
    merge_into_tips(ROOT / "js/data/lessons-9-24-knowledge-tips.js", u924)
    print("Merged L1–24 dialogue kcards (L1 depth pattern)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
