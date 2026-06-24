#!/usr/bin/env python3
"""清理第2–7课作業段重复锚点与空行（幂等修复）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
IDS = list(range(2, 8))


def load_lessons():
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return text, json.loads(m.group(1))


def find_span(text: str, lid: int):
    marker = f'"lessonId": {lid},'
    idx = text.find(marker)
    start = text.rfind("{", 0, idx)
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(text) and text[end] == ",":
                    end += 1
                return start, end
    return None


def serialize(L, trailing):
    lines = json.dumps(L, ensure_ascii=False, indent=2).split("\n")
    blob = "  " + lines[0] + "\n" + "\n".join("  " + ln for ln in lines[1:])
    if trailing and not blob.rstrip().endswith(","):
        blob = blob.rstrip() + ","
    return blob


def dedupe_section_lines(lines: list) -> list:
    out: list[str] = []
    seen_anchor = False
    for ln in lines:
        if not isinstance(ln, str) or not ln.strip():
            continue
        if "【本课课文】" in ln or "【题源】" in ln:
            if seen_anchor and ("【本课课文】" in ln or ln.startswith("【题源】")):
                continue
            seen_anchor = True
        out.append(ln)
    return out


def clean(L: dict) -> int:
    n = 0
    for sec in L.get("homeworkSections") or []:
        old = sec.get("lines") or []
        new = dedupe_section_lines(old)
        if new != old:
            sec["lines"] = new
            n += 1
    for block in L.get("reviewExtension") or []:
        old = block.get("lines") or []
        new = [ln for ln in old if isinstance(ln, str) and ln.strip()]
        if new != old:
            block["lines"] = new
            n += 1
    return n


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    text, lessons = load_lessons()
    by = {L["lessonId"]: L for L in lessons}
    total = 0
    for lid in IDS:
        total += clean(by[lid])
        span = find_span(text, lid)
        rest = text[span[1] :].lstrip()
        text = text[: span[0]] + serialize(by[lid], rest.startswith("{")) + text[span[1] :]
    DATA.write_text(text, encoding="utf-8")
    print(f"[OK] dedupe-homework-anchors-l2-7: {total} sections")


if __name__ == "__main__":
    main()
