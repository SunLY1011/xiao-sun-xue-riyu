#!/usr/bin/env python3
"""将 lessons-prd-unreleased-depth.json 合并进 lessons-mvp-depth.js 的 LESSON_DEPTH_PATCH。"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEPTH_JS = ROOT / "js" / "data" / "lessons-mvp-depth.js"
PATCH_JSON = ROOT / "js" / "data" / "lessons-prd-unreleased-depth.json"


def main() -> None:
    patch = json.loads(PATCH_JSON.read_text(encoding="utf-8"))
    text = DEPTH_JS.read_text(encoding="utf-8")
    m = re.search(r"(const LESSON_DEPTH_PATCH = \{)([\s\S]*?)(\n\};)", text)
    if not m:
        raise SystemExit("LESSON_DEPTH_PATCH not found")
    body = m.group(2)
    for lid, data in sorted(patch.items(), key=lambda x: int(x[0])):
        inner = json.dumps(data, ensure_ascii=False, indent=2)
        inner = "\n".join("    " + line for line in inner.splitlines())
        block = f"{lid}: {inner}"
        pat = rf"\n  {lid}: \{{[\s\S]*?\n  \}},?"
        if re.search(pat, body):
            body = re.sub(pat, "\n  " + block + ",", body, count=1)
        else:
            body = body.rstrip().rstrip(",") + ",\n  " + block
    new_text = text[: m.start(2)] + body + text[m.end(2) :]
    DEPTH_JS.write_text(new_text, encoding="utf-8")
    print(f"merged {len(patch)} lessons into {DEPTH_JS.name}")


if __name__ == "__main__":
    main()
