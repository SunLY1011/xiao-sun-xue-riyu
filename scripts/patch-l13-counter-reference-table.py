#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""第13课 · 助数詞一览表写入 reviewExtension「🗂️ 参考表」"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
TABLE_MD = ROOT / "参考资料/03-语法补充/助数詞一览表.md"
MARKER = "【参考资料·助数詞一览】"
REF_TITLE = "🗂️ 参考表"


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def table_lines() -> list[str]:
    out = [MARKER, "量词（本课及以前出现）· 音变见表末："]
    for line in TABLE_MD.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or "---" in line or "量词" in line:
            continue
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 12 or parts[0] in ("量词", ""):
            continue
        if parts[0].startswith("〜"):
            out.append(
                f"・{parts[0]}（{parts[1]}）1={parts[2]} 2={parts[3]} … 10={parts[11]} · 课{parts[12]}"
            )
    out.append("促音变：1·6·8·10 ；浊音变：3 ；半浊音变：1·6·8·10（〜本/杯/匹/分等）")
    return out


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, m, lessons = load_lessons()
    L = next(x for x in lessons if x.get("lessonId") == 13)
    blocks = L.get("reviewExtension") or []
    ref = next((b for b in blocks if REF_TITLE in (b.get("title") or "")), None)
    if not ref:
        raise SystemExit("L13 reviewExtension 参考表 not found")
    lines = [ln for ln in (ref.get("lines") or []) if MARKER not in ln]
    insert = table_lines()
    lines = insert + lines
    ref["lines"] = lines
    save_lessons(text, m, lessons)
    print("[OK] patch-l13-counter-reference-table: L13 参考表已插入助数詞一览")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
