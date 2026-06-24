#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""全 6 单元 · 会話 ABC 质量审计（结构 + B/C 日文分层 + TTS）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "docs" / "audit-abc-all-units-最新.md"

sys.path.insert(0, str(ROOT / "scripts"))
from tts_lib import fallback_lines_from_raw, list_mp3_keys, tts_key  # noqa: E402

UNITS: dict[int, tuple[int, int, str]] = {
    1: (1, 4, "unit1"),
    2: (5, 8, "unit2"),
    3: (9, 12, "unit3"),
    4: (13, 16, "unit4"),
    5: (17, 20, "unit5"),
    6: (21, 24, "unit6"),
}

NARRATIVE_RE = re.compile(r"^[（(].*[）)]$")


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def parse_replies(block: str) -> list[dict]:
    reps = []
    for rm in re.finditer(
        r'label:\s*"([ABC])"[\s\S]*?japanese:\s*"((?:\\.|[^"\\])*)"[\s\S]*?chinese:\s*"((?:\\.|[^"\\])*)"',
        block,
    ):
        note_m = re.search(
            rf'label:\s*"{rm.group(1)}"[\s\S]*?noteZh:\s*"((?:\\.|[^"\\])*)"',
            block,
        )
        reps.append(
            {
                "label": rm.group(1),
                "japanese": rm.group(2).replace('\\"', '"'),
                "chinese": rm.group(3).replace('\\"', '"'),
                "noteZh": (note_m.group(1).replace('\\"', '"') if note_m else ""),
            }
        )
    return reps


def load_l1_abc() -> dict[int, dict[str, dict]]:
    text = (ROOT / "js/data/l1-dialogue-abc.js").read_text(encoding="utf-8")
    # L1 maps by dialogue id in L1_DIALOGUE_ABC object
    m = re.search(r"const L1_DIALOGUE_ABC\s*=\s*(\{[\s\S]*?\n\});", text)
    if not m:
        return {1: {}}
    block = m.group(1)
    scenes = {}
    for did in re.findall(r"(?:\"|)(l1_dlg_\d+)(?:\"|):\s*\{", block):
        sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
        if sm:
            scenes[did] = {"replies": parse_replies(sm.group(1))}
    return {1: scenes}


def load_u1_abc() -> dict[int, dict[str, dict]]:
    text = (ROOT / "js/data/unit1-dialogue-abc-l234.js").read_text(encoding="utf-8")
    out: dict[int, dict[str, dict]] = {}
    for lid in (2, 3, 4):
        m = re.search(rf"const L{lid}_DIALOGUE_ABC\s*=\s*(\{{[\s\S]*?\n\}});", text)
        if not m:
            out[lid] = {}
            continue
        block = m.group(1)
        scenes = {}
        for did in re.findall(r"(?:\"|)(l\d+_dlg_\d+)(?:\"|):\s*\{", block):
            sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
            if sm:
                scenes[did] = {"replies": parse_replies(sm.group(1))}
        out[lid] = scenes
    return out


def load_u2_abc() -> dict[int, dict[str, dict]]:
    text = (ROOT / "js/data/unit2-dialogue-abc-l5-8.js").read_text(encoding="utf-8")
    out: dict[int, dict[str, dict]] = {}
    for lid in (5, 6, 7, 8):
        m = re.search(rf"const L{lid}_DIALOGUE_ABC\s*=\s*(\{{[\s\S]*?\n\}});", text)
        if not m:
            out[lid] = {}
            continue
        block = m.group(1)
        scenes = {}
        for did in re.findall(r"(?:\"|)(l\d+_dlg_\d+)(?:\"|):\s*\{", block):
            sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
            if sm:
                scenes[did] = {"replies": parse_replies(sm.group(1))}
        out[lid] = scenes
    return out


def load_924_abc() -> dict[int, dict[str, dict]]:
    text = (ROOT / "js/data/lessons-9-24-dialogue-abc.js").read_text(encoding="utf-8")
    out: dict[int, dict[str, dict]] = {}
    for lid in range(9, 25):
        if lid < 24:
            pat = rf"  {lid}: \{{(.*?)  {lid + 1}: \{{"
        else:
            pat = r"  24: \{(.*)\n  \},\n\};"
        bm = re.search(pat, text, re.S)
        if not bm:
            out[lid] = {}
            continue
        chunk = bm.group(1)
        scenes = {}
        for did in re.findall(r'"((?:l\d+_dlg_\d+))":\s*\{', chunk):
            sm = re.search(rf'"{re.escape(did)}":\s*\{{([\s\S]*?)\n    \}},', chunk)
            if sm:
                scenes[did] = {"replies": parse_replies(sm.group(1))}
        out[lid] = scenes
    return out


def is_narrative(jp: str) -> bool:
    s = re.sub(r"\s+", " ", (jp or "").strip())
    return bool(NARRATIVE_RE.match(s)) or "ナレーション" in s


def vis_norm(s: str) -> str:
    return re.sub(r"[\s、，,.!?？!！:：;；「」『』""\"'（）()]", "", (s or ""))


def audit_scene(lid: int, did: str, reps: list[dict], mp3: set[str]) -> list[str]:
    issues = []
    if len(reps) != 3:
        issues.append(f"{did}: replies={len(reps)}")
        return issues
    by = {r["label"]: r for r in reps}
    if set(by) != {"A", "B", "C"}:
        issues.append(f"{did}: labels={sorted(by)}")
    a = by.get("A", {})
    b, c = by.get("B", {}), by.get("C", {})
    if not a.get("japanese") or not a.get("chinese"):
        issues.append(f"{did}: A缺字段")
    for lab, r in (("B", b), ("C", c)):
        if not r.get("japanese") or not r.get("chinese"):
            issues.append(f"{did}: {lab}缺字段")
        if lab in ("B", "C") and not r.get("noteZh"):
            issues.append(f"{did}: {lab}缺noteZh")
    aj = a.get("japanese", "")
    if not is_narrative(aj):
        if b.get("japanese") == aj:
            issues.append(f"{did}: B日文= A")
        if c.get("japanese") == aj:
            issues.append(f"{did}: C日文= A")
        if vis_norm(b.get("japanese", "")) == vis_norm(aj):
            issues.append(f"{did}: B可见= A（仅标点/空格差异）")
    for r in reps:
        for line in fallback_lines_from_raw(r.get("japanese", "")):
            k = tts_key(line)
            if k not in mp3:
                issues.append(f"{did}: TTS缺 {r['label']} {k}")
    return issues


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    abc_all: dict[int, dict[str, dict]] = {}
    abc_all.update(load_l1_abc())
    abc_all.update(load_u1_abc())
    abc_all.update(load_u2_abc())
    abc_all.update(load_924_abc())
    mp3 = list_mp3_keys()

    rows = []
    all_issues: list[tuple[int, str]] = []
    for unit, (lo, hi, _name) in UNITS.items():
        u_issues = 0
        u_scenes = 0
        for lid in range(lo, hi + 1):
            dlg_ids = [d["id"] for d in (lessons[lid].get("dialogues") or []) if d.get("id")]
            abc = abc_all.get(lid, {})
            u_scenes += len(dlg_ids)
            miss = set(dlg_ids) - set(abc)
            if miss:
                for did in sorted(miss):
                    all_issues.append((lid, f"缺ABC {did}"))
                    u_issues += 1
            for did in dlg_ids:
                sc = abc.get(did, {})
                for msg in audit_scene(lid, did, sc.get("replies") or [], mp3):
                    all_issues.append((lid, msg))
                    u_issues += 1
            st = "PASS" if not any(i[0] == lid for i in all_issues) else "FAIL"
            rows.append(f"| 第{unit}单元 | L{lid} | {len(dlg_ids)} | {len(abc)} | {st} |")
        print(f"[{'OK' if u_issues == 0 else 'FAIL'}] 第{unit}单元 L{lo}–{hi}: {u_scenes}场景 问题{u_issues}")

    md = [
        "# 全 6 单元 会話 ABC 审计（最新）",
        "",
        f"**总问题**：{len(all_issues)}",
        "",
        "| 单元 | 课 | dialogues | ABC | 判定 |",
        "|------|-----|-----------|-----|------|",
        *rows,
        "",
        "## 明细",
        "",
    ]
    if all_issues:
        for lid, msg in all_issues[:150]:
            md.append(f"- L{lid}: {msg}")
    else:
        md.append("- 无")
    OUT.write_text("\n".join(md), encoding="utf-8")
    print(f"报告 -> {OUT.relative_to(ROOT)}")
    return 1 if all_issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
