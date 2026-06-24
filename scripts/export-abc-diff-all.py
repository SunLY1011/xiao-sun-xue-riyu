#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""全 6 单元 L1–24 会話 ABC 逐场景 A/B/C 导出 CSV + MD"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT_MD = ROOT / "docs" / "export-abc-diff-L1-24.md"
OUT_CSV = ROOT / "docs" / "export-abc-diff-L1-24.csv"

sys.path.insert(0, str(ROOT / "scripts"))
import importlib.util

spec = importlib.util.spec_from_file_location("audit_sup", ROOT / "scripts/audit-scene-supplements-l1-24.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

UNITS = {
    1: (1, 4, "第1单元"),
    2: (5, 8, "第2单元"),
    3: (9, 12, "第3单元"),
    4: (13, 16, "第4单元"),
    5: (17, 20, "第5单元"),
    6: (21, 24, "第6单元"),
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def scene_title(dlg: dict) -> str:
    return (dlg.get("title") or "").split("（")[0].strip()


def collect_rows(lessons: dict, abc_all: dict) -> list[dict]:
    rows: list[dict] = []
    for unit, (lo, hi, uname) in UNITS.items():
        for lid in range(lo, hi + 1):
            ds = lessons[lid].get("dialogues") or []
            abc = abc_all.get(lid, {})
            for i, d in enumerate(ds):
                did = d.get("id") or ""
                sc = abc.get(did, {})
                reps = {r["label"]: r for r in sc.get("replies") or []}
                op = d.get("opener") or {}
                rows.append(
                    {
                        "unit": unit,
                        "unit_name": uname,
                        "lesson": lid,
                        "scene_idx": i + 1,
                        "scene_id": did,
                        "scene_title": scene_title(d),
                        "opener_jp": (op.get("japanese") or "").strip(),
                        "opener_zh": (op.get("chinese") or "").strip(),
                        "speaker": (sc.get("userTurn") or d.get("userTurn") or {}).get("speaker", ""),
                        "abc_guide": sc.get("abcGuideZh", ""),
                        "a_jp": reps.get("A", {}).get("japanese", ""),
                        "a_zh": reps.get("A", {}).get("chinese", ""),
                        "a_note": reps.get("A", {}).get("noteZh", ""),
                        "b_jp": reps.get("B", {}).get("japanese", ""),
                        "b_zh": reps.get("B", {}).get("chinese", ""),
                        "b_note": reps.get("B", {}).get("noteZh", ""),
                        "c_jp": reps.get("C", {}).get("japanese", ""),
                        "c_zh": reps.get("C", {}).get("chinese", ""),
                        "c_note": reps.get("C", {}).get("noteZh", ""),
                    }
                )
    return rows


def write_csv(rows: list[dict]) -> None:
    if not rows:
        return
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def write_md(rows: list[dict]) -> None:
    lines = [
        "# 全 24 课会話 ABC 逐场景对照（A/B/C）",
        "",
        f"**场景数**：{len(rows)} · **生成**：scripts/export-abc-diff-all.py",
        "",
    ]
    cur_lesson = None
    for r in rows:
        key = (r["lesson"], r["unit_name"])
        if key != cur_lesson:
            cur_lesson = key
            lines += ["", f"## {r['unit_name']} · 第 {r['lesson']} 课", ""]
        lines += [
            f"### 场景 {r['scene_idx']} · {r['scene_title']}（{r['scene_id']}）",
            "",
            f"- **发起**：{r['opener_jp']} / {r['opener_zh']}",
            f"- **应答者**：{r['speaker']}",
            f"- **abcGuideZh**：{r['abc_guide']}",
            "",
            "| 档 | 日文 | 中文 | noteZh |",
            "|----|------|------|--------|",
            f"| A | {r['a_jp']} | {r['a_zh']} | {r['a_note']} |",
            f"| B | {r['b_jp']} | {r['b_zh']} | {r['b_note']} |",
            f"| C | {r['c_jp']} | {r['c_zh']} | {r['c_note']} |",
            "",
        ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    lessons = load_lessons()
    abc = mod.merge_abc()
    rows = collect_rows(lessons, abc)
    write_csv(rows)
    write_md(rows)
    print(f"[OK] {len(rows)} scenes -> {OUT_MD.name} + {OUT_CSV.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
