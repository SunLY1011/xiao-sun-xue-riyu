#!/usr/bin/env python3
"""扫描会話中文机翻痕迹 · lessons-data + lessons-9-24-dialogue-abc"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
OUT = ROOT / "docs" / "audit-dialogue-zh-mt.md"

sys.path.insert(0, str(ROOT / "scripts"))
from dialogue_zh_mt import Hit, norm_jp, scan_text  # noqa: E402


def load_lessons(ids: range) -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1)) if L["lessonId"] in ids}


def load_abc() -> dict:
    text = ABC.read_text(encoding="utf-8")
    # parse LESSONS_9_24_DIALOGUE_ABC loosely via regex per lesson
    out: dict[int, dict] = {}
    for lid in range(9, 25):
        m = re.search(rf"  {lid}: \{{(.*?)  {lid + 1}: \{{", text, re.S)
        if not m and lid == 24:
            m = re.search(r"  24: \{(.*)\},\n\};\n\nfunction apply", text, re.S)
        if not m:
            continue
        chunk = m.group(1)
        for did in re.findall(r'"((?:l\d+_dlg_\d+))":\s*\{', chunk):
            am = re.search(
                rf'"{re.escape(did)}":\s*\{{.*?label:\s*"A".*?chinese:\s*"([^"]*)"',
                chunk,
                re.S,
            )
            jm = re.search(
                rf'"{re.escape(did)}":\s*\{{.*?label:\s*"A".*?japanese:\s*"([^"]*)"',
                chunk,
                re.S,
            )
            if am and jm:
                out.setdefault(lid, {})[did] = {
                    "japanese": jm.group(1),
                    "chinese": am.group(1),
                }
    return out


def scan_lesson(L: dict, abc_map: dict, source: str) -> list[Hit]:
    lid = L["lessonId"]
    hits: list[Hit] = []
    for d in L.get("dialogues") or []:
        did = d.get("id", "")
        op = d.get("opener") or {}
        jp = norm_jp(op.get("japanese", ""))
        ch = (op.get("chinese") or "").strip()
        if jp:
            rs = scan_text(ch, jp)
            if rs:
                hits.append(Hit(lid, did, f"{source}/opener", jp, ch, rs))
        if did in abc_map:
            jp2 = norm_jp(abc_map[did].get("japanese", ""))
            ch2 = (abc_map[did].get("chinese") or "").strip()
            rs2 = scan_text(ch2, jp2)
            if rs2:
                hits.append(Hit(lid, did, f"{source}/ABC-A", jp2, ch2, rs2))
    return hits


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--from-lesson", type=int, default=9)
    ap.add_argument("--to-lesson", type=int, default=24)
    args = ap.parse_args()
    ids = range(args.from_lesson, args.to_lesson + 1)
    lessons = load_lessons(ids)
    abc = load_abc()
    all_hits: list[Hit] = []
    for lid in ids:
        L = lessons.get(lid)
        if not L:
            continue
        all_hits.extend(scan_lesson(L, abc.get(lid, {}), "data"))

    lines = [
        "# 会話中文 · 机翻痕迹审计",
        "",
        f"**扫描课次**：{min(ids)}–{max(ids)} · **命中**：{len(all_hits)} 条",
        "",
        "| 课 | 场景 | 字段 | 问题 | 日文（截） | 中文（截） |",
        "|----|------|------|------|------------|------------|",
    ]
    for h in all_hits[:200]:
        lines.append(
            f"| L{h.lesson_id} | {h.dlg_id} | {h.field} | {'；'.join(h.reasons)} | "
            f"{h.japanese[:28]} | {h.chinese[:28]} |"
        )
    if len(all_hits) > 200:
        lines.append(f"\n… 另有 {len(all_hits) - 200} 条")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    if all_hits:
        print(f"[FAIL] dialogue-zh-mt: {len(all_hits)} hits -> {OUT}")
        return 1
    print(f"[OK] dialogue-zh-mt: {min(ids)}–{max(ids)} 无命中 -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
