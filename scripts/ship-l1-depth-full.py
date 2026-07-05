#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""纪要全量补全 · 一键流水线（L1 精写 / GRAMMAR / 条带高光 / ABC 导出 / 解锁）"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "docs/iteration-baseline.json"
VER = "408"


def run(cmd: list[str]) -> None:
    print(f"\n>>> {' '.join(cmd)}")
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode != 0:
        raise SystemExit(r.returncode)


def unlock_baseline() -> None:
    data = json.loads(BASELINE.read_text(encoding="utf-8"))
    today = str(date.today())
    data.setdefault("unit1_lesson1_mvp", {})["status"] = "unlocked"
    data["unit1_lesson1_mvp"]["unlocked_at"] = today
    data["unit1_lesson1_mvp"]["note"] = "用户 2026-05-30 明示：L1–24 精写/GRAMMAR/条带高光 全量补全"
    data.setdefault("unit1_lessons_1_4_mvp", {})["status"] = "unlocked"
    data.setdefault("all_lessons_l1_24_content", {
        "status": "unlocked",
        "unlocked_at": today,
        "scope": "ABC/黄卡/单词/文法/条带/知识图",
        "note": "冻结单元内容层解冻；五关壳 lesson-1-flow 仍慎改",
    })
    data.setdefault("current", {})["cache"] = VER
    BASELINE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] iteration-baseline unlocked + cache={VER}")


def bump_cache() -> None:
    for rel in [
        "index.html",
        "intro.html",
        "share.html",
        "js/share-wechat.js",
        "docs/链接转发.md",
    ]:
        p = ROOT / rel
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8")
        t = re.sub(r"\?v=\d+", f"?v={VER}", t)
        t = re.sub(r'CACHE_BOOT = "\d+"', f'CACHE_BOOT = "{VER}"', t)
        if p.name == "share-wechat.js":
            t = re.sub(r'CACHE_VER = "\d+"', f'CACHE_VER = "{VER}"', t)
        p.write_text(t, encoding="utf-8")
    print(f"[OK] cache bump v={VER}")


def main() -> int:
    unlock_baseline()
    run([sys.executable, "scripts/build-l1-depth-vocab-all.py"])
    run([sys.executable, "scripts/build-grammar-kcards-l2-24.py"])
    run([sys.executable, "scripts/build-dialogue-kcards-l2-24.py"])
    run([sys.executable, "scripts/sync-storyboard-highlights.py"])
    run([sys.executable, "scripts/export-abc-diff-all.py"])
    run([sys.executable, "scripts/build-tts-cache.py", "--workers", "8"])
    run([sys.executable, "scripts/audit-abc-all-units.py"])
    run([sys.executable, "scripts/audit-scene-supplements-l1-24.py"])
    run([sys.executable, "scripts/bump-cache-v408.py"])
    run([sys.executable, "scripts/pre-ship-check.py"])
    print("\n[DONE] ship-l1-depth-full")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
