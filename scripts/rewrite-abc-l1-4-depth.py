#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""L1–4 会話 ABC · 场景名锚定 + A/B/C noteZh 深度（对齐 L5+ 口径，保留手修 B/C 正文）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
L1_JS = ROOT / "js/data/l1-dialogue-abc.js"
U1_JS = ROOT / "js/data/unit1-dialogue-abc-l234.js"

sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util

_spec = importlib.util.spec_from_file_location("audit_abc", ROOT / "scripts" / "audit-abc-all-units.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

LESSON_THEME: dict[int, str] = {
    1: "自己紹介 · 出迎え",
    2: "指示語 · これ/それ/あれ",
    3: "場所 · ここ/そこ/あそこ",
    4: "存在 · あります/います",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def scene_title(dlg: dict) -> str:
    raw = (dlg.get("title") or "").strip()
    for sep in ("（", "(", "—"):
        if sep in raw:
            return raw.split(sep)[0].strip()
    return raw


def scene_title_zh(dlg: dict) -> str:
    m = re.search(r"[（(]([^）)]+)[）)]", dlg.get("title") or "")
    return m.group(1).strip() if m else ""


def parse_scene_inner(inner: str) -> dict:
    scene: dict = {"replies": _mod.parse_replies(inner)}
    gm = re.search(r'abcGuideZh:\s*"((?:\\.|[^"\\])*)"', inner)
    if gm:
        scene["abcGuideZh"] = gm.group(1).replace('\\"', '"').replace("\\\\", "\\")
    sm = re.search(r'userTurn:\s*\{\s*speaker:\s*"((?:\\.|[^"\\])*)"', inner)
    if sm:
        scene["userTurn"] = {"speaker": sm.group(1).replace('\\"', '"')}
    return scene


def load_l1_map() -> dict[str, dict]:
    text = L1_JS.read_text(encoding="utf-8")
    m = re.search(r"const L1_DIALOGUE_ABC\s*=\s*(\{[\s\S]*?\n\});", text)
    if not m:
        return {}
    block = m.group(1)
    out: dict[str, dict] = {}
    for did in re.findall(r"(?:\"|)(l1_dlg_\d+)(?:\"|):\s*\{", block):
        sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
        if sm:
            out[did] = parse_scene_inner(sm.group(1))
    return out


def load_u1_map(lid: int) -> dict[str, dict]:
    text = U1_JS.read_text(encoding="utf-8")
    m = re.search(rf"const L{lid}_DIALOGUE_ABC\s*=\s*(\{{[\s\S]*?\n\}});", text)
    if not m:
        return {}
    block = m.group(1)
    out: dict[str, dict] = {}
    for did in re.findall(r"(?:\"|)(l\d+_dlg_\d+)(?:\"|):\s*\{", block):
        sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
        if sm:
            out[did] = parse_scene_inner(sm.group(1))
    return out


def abc_guide(dlg: dict, lid: int, old: str) -> str:
    speaker = (dlg.get("userTurn") or {}).get("speaker") or "B"
    title = scene_title(dlg)
    zh = scene_title_zh(dlg)
    theme = LESSON_THEME.get(lid, "会話")
    replies = (dlg.get("userTurn") or {}).get("replies") or []
    ajp = norm_jp((replies[0].get("japanese") if replies else "") or "")
    hint = ajp[:16] + "…" if len(ajp) > 16 else ajp
    head = f"「{title}」" if title else (f"「{zh}」" if zh else "本场景")
    if zh and zh not in head:
        head += f"（{zh}）"
    base = (
        f"{head}· {theme} · {speaker}应答。"
        f"A＝课文「{hint}」；B＝同场景口语/缩短；C＝更礼貌或郑重。"
    )
    if old and any(k in old for k in ("本句由", "必学", "注意", "发起者")):
        tail = old.split("。")[0].strip()
        if tail and tail not in base and len(tail) < 48:
            base += f" {tail}。"
    return base


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def upgrade_a_note(note: str, speaker: str, title: str, theme: str) -> str:
    note = (note or "").strip()
    if note.startswith("A 标准答"):
        if title and f"「{title}」" not in note and theme not in note:
            return note.replace("A 标准答", f"A 标准答（{speaker}）", 1)
        return note
    body = note
    for old in (
        "课文原句：",
        "课文标准答：",
        "课文全套寒暄：",
        "课文两句：",
        "课文完整否定+更正：",
    ):
        if body.startswith(old):
            body = body[len(old) :].strip()
            break
    if title and f"「{title}」" not in body:
        body = f"「{title}」· {body}"
    return f"A 标准答（{speaker}）：{body}"


def upgrade_bc_note(note: str, label: str) -> str:
    note = (note or "").strip()
    if not note:
        return note
    if re.match(rf"^{label}\s", note):
        return note
    if note.startswith(f"{label}更") or note.startswith(f"{label}用") or note.startswith(f"{label}省略"):
        return f"{label} {note[len(label):].lstrip('：: ')}" if not note.startswith(f"{label} ") else note
    return f"{label} {note}"


def enrich_scene(dlg: dict, lid: int, ext: dict) -> dict:
    speaker = ext.get("userTurn", {}).get("speaker") or (dlg.get("userTurn") or {}).get("speaker") or "B"
    title = scene_title(dlg)
    theme = LESSON_THEME.get(lid, "")
    old_guide = ext.get("abcGuideZh") or ""
    replies = []
    by = {r.get("label"): r for r in ext.get("replies") or []}
    for lab in ("A", "B", "C"):
        r = by.get(lab, {})
        note = r.get("noteZh") or ""
        if lab == "A":
            note = upgrade_a_note(note, speaker, title, theme)
        else:
            note = upgrade_bc_note(note, lab)
        replies.append(
            {
                "label": lab,
                "rank": r.get("rank") or {"A": 1, "B": 2, "C": 3}[lab],
                "japanese": r.get("japanese") or "",
                "chinese": r.get("chinese") or "",
                "noteZh": note,
            }
        )
    return {
        "abcGuideZh": abc_guide(dlg, lid, old_guide),
        "userTurn": {"speaker": speaker},
        "replies": replies,
    }


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_scene(did: str, v: dict, indent: str = "  ") -> list[str]:
    lines = [f'{indent}{js_string(did)}: {{']
    lines.append(f"{indent}  abcGuideZh: {js_string(v['abcGuideZh'])},")
    lines.append(f"{indent}  userTurn: {{ speaker: {js_string(v['userTurn']['speaker'])} }},")
    lines.append(f"{indent}  replies: [")
    for r in v["replies"]:
        lines.append(f"{indent}    {{")
        lines.append(f"{indent}      label: {js_string(r['label'])},")
        lines.append(f"{indent}      rank: {r['rank']},")
        lines.append(f"{indent}      japanese: {js_string(r['japanese'])},")
        lines.append(f"{indent}      chinese: {js_string(r['chinese'])},")
        lines.append(f"{indent}      noteZh: {js_string(r['noteZh'])},")
        lines.append(f"{indent}    }},")
    lines.append(f"{indent}  ],")
    lines.append(f"{indent}}},")
    return lines


def write_l1(scenes: dict[str, dict]) -> None:
    raw = L1_JS.read_text(encoding="utf-8")
    tail_m = re.search(r"\n/\*\* 发起句", raw)
    if not tail_m:
        raise SystemExit("L1 tail (L1_OPENER_ZH) not found")
    tail = raw[tail_m.start() + 1 :]
    header = """/**
 * 第1課 · 会話 ABC 回答（A=课文 · B/C=可替换说法 + 老师提示）
 * 对齐【产品PRD】第1单元第01课 · 应用课文「出迎え」
 * depth · scripts/rewrite-abc-l1-4-depth.py
 */
"""
    body = [header, "const L1_DIALOGUE_ABC = {"]
    for did in sorted(scenes.keys(), key=lambda x: int(x.rsplit("_", 1)[-1])):
        body.extend(emit_scene(did, scenes[did]))
    body.append("};")
    L1_JS.write_text("\n".join(body) + "\n\n" + tail.lstrip(), encoding="utf-8")


def patch_u1_lesson(lid: int, scenes: dict[str, dict], text: str) -> str:
    lines = [f"const L{lid}_DIALOGUE_ABC = {{"]
    for did in sorted(scenes.keys(), key=lambda x: int(x.rsplit("_", 1)[-1])):
        lines.extend(emit_scene(did, scenes[did]))
    lines.append("};")
    new_block = "\n".join(lines)
    return re.sub(rf"const L{lid}_DIALOGUE_ABC\s*=\s*\{{[\s\S]*?\n\}};", new_block, text, count=1)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()

    l1_ext = load_l1_map()
    l1_out: dict[str, dict] = {}
    for d in lessons[1].get("dialogues") or []:
        did = d.get("id")
        if did and did in l1_ext:
            l1_out[did] = enrich_scene(d, 1, l1_ext[did])
    write_l1(l1_out)
    print(f"[OK] L1: {len(l1_out)} scenes")

    u1_text = U1_JS.read_text(encoding="utf-8")
    for lid in (2, 3, 4):
        ext_map = load_u1_map(lid)
        out: dict[str, dict] = {}
        for d in lessons[lid].get("dialogues") or []:
            did = d.get("id")
            if did and did in ext_map:
                out[did] = enrich_scene(d, lid, ext_map[did])
        u1_text = patch_u1_lesson(lid, out, u1_text)
        print(f"[OK] L{lid}: {len(out)} scenes")
    U1_JS.write_text(u1_text, encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
