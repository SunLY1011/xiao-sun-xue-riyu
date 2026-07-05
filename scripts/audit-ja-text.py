# -*- coding: utf-8 -*-
"""Audit Japanese text fields for Chinese punctuation / spacing issues."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data"
FILES = [
    "lessons-mvp.js",
    "lessons-mvp-depth.js",
    "lesson-vocab-biaori.js",
    "lessons-detailed.js",
    "mini-cards.js",
]

JA_KEYS = re.compile(
    r"(japanese|jp|example|meaningJa|question|questionTts|pattern|title|explain|explanation|noteJa|kana|text|bad|good)\s*:\s*\"((?:\\.|[^\"\\])*)\"",
    re.MULTILINE,
)

SKIP_KEYS = {"titleZh", "questionZh", "optionsZh", "explanationZh"}


def main() -> int:
    total = 0
    for name in FILES:
        path = DATA / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for m in JA_KEYS.finditer(text):
            key, val = m.group(1), m.group(2).replace('\\"', '"')
            if key in SKIP_KEYS:
                continue
            if re.fullmatch(r"[\u4e00-\u9fff\s、。，]+", val) and not re.search(
                r"[\u3040-\u30ff]", val
            ):
                continue
            line = text[: m.start()].count("\n") + 1
            issues = []
            if "，" in val:
                issues.append("中文逗号「，」")
            if "；" in val:
                issues.append("中文分号")
            if re.search(r"[\u3040-\u9fffァ-ヶ] [\u3040-\u9fffァ-ヶ]", val):
                issues.append("半角空格夹在日文间")
            if "　" in val:
                issues.append("全角空格")
            if re.search(r" / ", val):
                issues.append("半角「 / 」并列（应改为、／・或分句）")
            if "／" in val and " / " not in val:
                pass
            if re.search(r"[\u3040-\u9fff]／[\u3040-\u9fff]", val):
                pass
            if "／" in val and key == "kana":
                issues.append("kana 用全角斜线（应改为・）")
            for msg in issues:
                total += 1
                sys.stdout.buffer.write(
                    f"{name}:{line} [{key}] {msg}\n  {val[:70]}\n".encode("utf-8")
                )
    sys.stdout.buffer.write(f"\nTotal issues: {total}\n".encode("utf-8"))
    return 1 if total else 0


if __name__ == "__main__":
    raise SystemExit(main())
