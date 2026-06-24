#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""逐课逐场景 · ABC/黄卡 补充审核（标记需增补项）"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "docs" / "audit-scene-supplements-l1-24-最新.md"
OVERRIDES = ROOT / "scripts" / "scene-supplements-overrides.json"

_spec = importlib.util.spec_from_file_location("audit_abc", ROOT / "scripts" / "audit-abc-all-units.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def parse_scene_inner(inner: str) -> dict:
    scene: dict = {"replies": _mod.parse_replies(inner)}
    gm = re.search(r'abcGuideZh:\s*"((?:\\.|[^"\\])*)"', inner)
    if gm:
        scene["abcGuideZh"] = gm.group(1).replace('\\"', '"').replace("\\\\", "\\")
    return scene


def merge_abc() -> dict[int, dict[str, dict]]:
    out: dict[int, dict[str, dict]] = {}

    def load_block(path: Path, const: str, lids: list[int]) -> None:
        text = path.read_text(encoding="utf-8")
        for lid in lids:
            m = re.search(rf"const L{lid}_DIALOGUE_ABC\s*=\s*(\{{[\s\S]*?\n\}});", text)
            if not m:
                out[lid] = {}
                continue
            block = m.group(1)
            scenes = {}
            for did in re.findall(r"(?:\"|)(l\d+_dlg_\d+)(?:\"|):\s*\{", block):
                sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', block)
                if sm:
                    scenes[did] = parse_scene_inner(sm.group(1))
            out[lid] = scenes

    l1 = (ROOT / "js/data/l1-dialogue-abc.js").read_text(encoding="utf-8")
    m1 = re.search(r"const L1_DIALOGUE_ABC\s*=\s*(\{[\s\S]*?\n\});", l1)
    if m1:
        scenes = {}
        for did in re.findall(r"(?:\"|)(l1_dlg_\d+)(?:\"|):\s*\{", m1.group(1)):
            sm = re.search(rf'(?:\"|){re.escape(did)}(?:\"|):\s*\{{([\s\S]*?)\n  \}},', m1.group(1))
            if sm:
                scenes[did] = parse_scene_inner(sm.group(1))
        out[1] = scenes

    load_block(ROOT / "js/data/unit1-dialogue-abc-l234.js", "L", [2, 3, 4])
    load_block(ROOT / "js/data/unit2-dialogue-abc-l5-8.js", "L", [5, 6, 7, 8])

    text924 = (ROOT / "js/data/lessons-9-24-dialogue-abc.js").read_text(encoding="utf-8")
    for lid in range(9, 25):
        m = re.search(rf"  {lid}:\s*\{{([\s\S]*?)\n  \}},", text924)
        if not m:
            out[lid] = {}
            continue
        block = m.group(1)
        scenes = {}
        for did in re.findall(r'"(l\d+_dlg_\d+)":\s*\{', block):
            sm = re.search(rf'"{re.escape(did)}":\s*\{{([\s\S]*?)\n    \}},', block)
            if sm:
                scenes[did] = parse_scene_inner(sm.group(1))
        out[lid] = scenes
    return out


def scene_title(dlg: dict) -> str:
    raw = (dlg.get("title") or "").strip()
    for sep in ("（", "(", "—", "·"):
        if sep in raw:
            raw = raw.split(sep)[0].strip()
    return raw


def audit_scene(lid: int, did: str, dlg: dict, abc: dict | None) -> list[str]:
    issues = []
    if not abc or not abc.get("replies"):
        issues.append("缺 ABC 数据")
        return issues
    guide = abc.get("abcGuideZh") or ""
    if "A=课文；B=缩短" in guide or "三种均可沟通" in guide:
        issues.append("abcGuide 仍为旧模板")
    title = scene_title(dlg)
    if title and title not in guide and f"「{title}」" not in guide:
        short = title[:4]
        if short and short not in guide:
            issues.append("abcGuide 未锚定场景名")
    by = {r["label"]: r for r in abc["replies"]}
    a = by.get("A", {})
    if "课文原句" in (a.get("noteZh") or "") and "A 标准答" not in (a.get("noteZh") or ""):
        issues.append("A noteZh 模板句")
    b, c = by.get("B", {}), by.get("C", {})
    if b.get("chinese") and "（更短/口语）" in b.get("chinese", ""):
        issues.append("B 中文未单独撰写")
    if c.get("chinese") and "（更礼貌）" in c.get("chinese", ""):
        issues.append("C 中文未单独撰写")
    return issues


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    abc_all = merge_abc()
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8")) if OVERRIDES.is_file() else {}

    rows: list[str] = []
    total_issues = 0
    scenes_with_issues = 0
    pass_lessons = []
    for lid in range(1, 25):
        ds = lessons[lid].get("dialogues") or []
        lesson_issues = 0
        for i, d in enumerate(ds):
            did = d.get("id") or f"l{lid}_dlg_{i}"
            iss = audit_scene(lid, did, d, abc_all.get(lid, {}).get(did))
            if did in overrides:
                iss = [x for x in iss if x not in ("abcGuide 仍为旧模板", "A noteZh 模板句", "abcGuide 未锚定场景名")]
            if iss:
                lesson_issues += 1
                scenes_with_issues += 1
                total_issues += len(iss)
                rows.append(f"- **L{lid}** `{did}`：{' · '.join(iss)}")
        st = "✅" if lesson_issues == 0 else f"⚠️ {lesson_issues}/{len(ds)}"
        print(f"L{lid:2d} {st}")
        if lesson_issues == 0:
            pass_lessons.append(lid)

    md = [
        "# 逐课场景 · ABC 补充审核（最新）",
        "",
        f"**PASS 课次**：{len(pass_lessons)}/24（{pass_lessons}）",
        f"**需增补场景**：{scenes_with_issues}/376 · **问题条数**：{total_issues}",
        f"**手修覆盖**：{len(overrides)} 场景（`scripts/scene-supplements-overrides.json`）",
        "",
        "> L1–4 已 depth（rewrite-abc-l1-4-depth.py）；L5–24 已 rewrite + kcard 合并。",
        "",
        "## 明细（仅 FAIL 场景）",
        "",
    ]
    md.extend(rows if rows else ["- 无"])
    OUT.write_text("\n".join(md), encoding="utf-8")
    print(f"报告 -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
