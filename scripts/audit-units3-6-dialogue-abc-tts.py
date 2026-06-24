#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第3–6单元（L9–24）会話 ABC + 语音包 · 只读审计"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from tts_lib import fallback_lines_from_raw, list_mp3_keys, tts_key  # noqa: E402

DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
OUT = ROOT / "docs" / "audit-units3-6-dialogue-abc-tts-最新.md"

UNITS: dict[int, tuple[int, int]] = {
    3: (9, 12),
    4: (13, 16),
    5: (17, 20),
    6: (21, 24),
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def parse_abc_lessons() -> dict[int, dict[str, dict]]:
    text = ABC.read_text(encoding="utf-8")
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
        scenes: dict[str, dict] = {}
        for did in re.findall(r'"((?:l\d+_dlg_\d+))":\s*\{', chunk):
            sm = re.search(
                rf'"{re.escape(did)}":\s*\{{([\s\S]*?)\n    \}},',
                chunk,
            )
            block = sm.group(1) if sm else ""
            gm = re.search(r'abcGuideZh:\s*"((?:\\.|[^"\\])*)"', block)
            guide = gm.group(1).replace('\\"', '"') if gm else ""
            replies = []
            for rm in re.finditer(
                r'label:\s*"([ABC])"[\s\S]*?japanese:\s*"((?:\\.|[^"\\])*)"[\s\S]*?chinese:\s*"((?:\\.|[^"\\])*)"',
                block,
            ):
                note_m = re.search(
                    rf'label:\s*"{rm.group(1)}"[\s\S]*?noteZh:\s*"((?:\\.|[^"\\])*)"',
                    block,
                )
                replies.append(
                    {
                        "label": rm.group(1),
                        "japanese": rm.group(2).replace('\\"', '"'),
                        "chinese": rm.group(3).replace('\\"', '"'),
                        "noteZh": (note_m.group(1).replace('\\"', '"') if note_m else ""),
                    }
                )
            scenes[did] = {"abcGuideZh": guide, "replies": replies}
        out[lid] = scenes
    return out


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    lessons = load_lessons()
    abc_map = parse_abc_lessons()
    mp3 = list_mp3_keys()
    issues: list[tuple[int, str, str]] = []
    rows: list[str] = []

    for unit, (lo, hi) in UNITS.items():
        unit_issues = 0
        unit_scenes = 0
        for lid in range(lo, hi + 1):
            L = lessons[lid]
            dlg_ids = [d["id"] for d in (L.get("dialogues") or []) if d.get("id")]
            abc = abc_map.get(lid, {})
            unit_scenes += len(dlg_ids)
            miss = sorted(set(dlg_ids) - set(abc))
            extra = sorted(set(abc) - set(dlg_ids))
            if miss or extra:
                issues.append((lid, "id_mismatch", f"缺ABC={miss} 多余={extra}"))
            for did in dlg_ids:
                sc = abc.get(did)
                if not sc:
                    continue
                if not sc["abcGuideZh"]:
                    issues.append((lid, did, "缺 abcGuideZh"))
                reps = sc["replies"]
                if len(reps) != 3:
                    issues.append((lid, did, f"replies={len(reps)}≠3"))
                labels = sorted(r["label"] for r in reps)
                if labels != ["A", "B", "C"]:
                    issues.append((lid, did, f"labels={labels}"))
                for r in reps:
                    if not r["japanese"] or not r["chinese"]:
                        issues.append((lid, did, f"{r['label']} 缺 japanese/chinese"))
                    if r["label"] in ("B", "C") and not r["noteZh"]:
                        issues.append((lid, did, f"{r['label']} 缺 noteZh"))
                    for line in fallback_lines_from_raw(r["japanese"]):
                        k = tts_key(line)
                        if k not in mp3:
                            issues.append((lid, did, f"TTS缺 {r['label']} key={k}"))
                for d in L.get("dialogues") or []:
                    if d.get("id") != did:
                        continue
                    ojp = (d.get("opener") or {}).get("japanese", "")
                    for line in fallback_lines_from_raw(ojp):
                        k = tts_key(line)
                        if k not in mp3:
                            issues.append((lid, did, f"TTS缺 opener key={k}"))
            lid_issues = [i for i in issues if i[0] == lid]
            st = "OK" if not lid_issues else "FAIL"
            rows.append(
                f"| 第{unit}单元 | L{lid} | {len(dlg_ids)} | {len(abc)} | {st} | {len(lid_issues)} |"
            )
            unit_issues += len(lid_issues)
        print(
            f"[{'OK' if unit_issues == 0 else 'FAIL'}] 第{unit}单元 L{lo}–{hi}: "
            f"{hi - lo + 1}课 {unit_scenes}场景 问题{unit_issues}"
        )

    md = [
        "# 第3–6单元 会話 ABC + 语音包 审计",
        "",
        f"**范围**：第9–24课 · **总问题**：{len(issues)}",
        "",
        "| 单元 | 课 | dialogues | ABC场景 | 判定 | 问题数 |",
        "|------|-----|-----------|---------|------|--------|",
        *rows,
        "",
        "## 明细",
        "",
    ]
    if issues:
        for lid, ref, msg in issues[:120]:
            md.append(f"- L{lid} `{ref}`: {msg}")
        if len(issues) > 120:
            md.append(f"\n… 另有 {len(issues) - 120} 条")
    else:
        md.append("- 无")
    OUT.write_text("\n".join(md), encoding="utf-8")

    print(f"\n合计 {sum(len(lessons[i].get('dialogues') or []) for i in range(9,25))} 场景 | 问题 {len(issues)}")
    print(f"报告 -> {OUT.relative_to(ROOT)}")
    if issues:
        print("[FAIL] 未全部完成")
        return 1
    print("[PASS] ABC 三轨 + 语音包 全部对齐")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
