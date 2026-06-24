#!/usr/bin/env python3
"""Audit learner-visible 标日 mentions (one-off report helper)."""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
unit_map = {i: (i - 1) // 4 + 1 for i in range(1, 25)}


def split_lessons(path: Path):
    text = path.read_text(encoding="utf-8")
    parts = re.split(r'"lessonId"\s*:\s*(\d+)', text)
    rows = []
    for i in range(1, len(parts), 2):
        lid = int(parts[i])
        chunk = parts[i + 1] if i + 1 < len(parts) else ""
        hits = list(re.finditer("标日", chunk))
        if not hits:
            continue
        mod = {"作業Tab": 0, "拡張Tab": 0, "测验Tab": 0, "其他": 0}
        for m in hits:
            ctx = chunk[max(0, m.start() - 120) : m.start() + 60]
            if "【本课课文】" in ctx:
                mod["作業Tab"] += 1
            elif "【题源】" in ctx or "question" in ctx and "综合" in ctx:
                mod["测验Tab"] += 1
            elif any(
                k in ctx
                for k in ("拡張", "模板", "ユニットテスト", "课文锚点", "参考资料")
            ):
                mod["拡張Tab"] += 1
            else:
                mod["其他"] += 1
        rows.append({"课": lid, "单元": unit_map[lid], "合计": len(hits), **mod})
    return rows


def main():
    rows = split_lessons(ROOT / "js/data/lessons-data.js")
    print(json.dumps(rows, ensure_ascii=False, indent=2))
    print("TOTAL", sum(r["合计"] for r in rows), "lessons", len(rows))


if __name__ == "__main__":
    main()
