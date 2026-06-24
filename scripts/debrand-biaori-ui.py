#!/usr/bin/env python3
"""Batch de-brand learner-visible 标日 strings in js/data."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data"

FILES = [
    DATA / "lessons-data.js",
    DATA / "lessons-supplement-mvp.js",
    DATA / "lessons-9-24-dialogue-abc.js",
    DATA / "unit2-dialogue-abc-l5-8.js",
    DATA / "unit1-dialogue-abc-l234.js",
    DATA / "l1-dialogue-abc.js",
    DATA / "lessons-catalog.js",
    DATA / "curriculum-catalog.js",
    DATA / "scenarios.js",
    DATA / "unit-strip-storyboard.js",
    DATA / "lessons-mvp.js",
]

# Order matters: longer / specific patterns first
REPLACEMENTS = [
    ("【本课课文】", "【本课课文】"),
    ("《标日初级上册》", "《标准日本语》初级上册"),
    ("标日初级上册", "初级上册"),
    ("标日初级上", "初级上册"),
    ("标日上册", "上册"),
    ("标日 P.", "教材 P."),
    ("【题源】标日第", "【题源】第"),
    ("【课文锚点】标日第", "【课文锚点】第"),
    ("模板 · 标日第", "模板 · 第"),
    ("（标日第", "（第"),
    ("与教材课文一致", "与教材课文一致"),
    ("标日第1课标准答", "与第1课课文一致"),
    ("标日主线用", "教材主线用"),
    ("标日第", "第"),  # remaining 标日第N课
    ("[标日あと学習]", "[日语初级课后练习]"),
    ("标日初级上", "初级上册"),  # comment leftovers
    ("标日", "教材"),  # last resort in data files only
]


def debrand_text(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def main() -> None:
    total = 0
    for path in FILES:
        if not path.exists():
            print("skip missing", path)
            continue
        raw = path.read_text(encoding="utf-8")
        new = debrand_text(raw)
        n = raw.count("标日")
        if new != raw:
            path.write_text(new, encoding="utf-8")
            left = new.count("标日")
            print(f"{path.name}: 标日 {n} -> {left}")
            total += n - left
        else:
            print(f"{path.name}: unchanged ({n} 标日)")
    print("replaced approx", total, "标日 occurrences")


if __name__ == "__main__":
    main()
