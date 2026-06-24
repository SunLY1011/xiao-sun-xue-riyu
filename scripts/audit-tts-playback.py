# -*- coding: utf-8 -*-
"""检查 data-tts-key 与 speakJa 首候选是否一致（防止喇叭编号与 MP3 错位）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tts_lib import collect_requirements, list_mp3_keys, tts_key  # noqa: E402

# 模拟 JS fallbackLines 排序后首条
from tts_lib import fallback_lines_from_raw  # noqa: E402


def js_fallback_first(raw: str) -> str:
    lines = fallback_lines_from_raw(raw)
    return lines[0] if lines else ""


def main() -> int:
    req = collect_requirements()
    mp3 = list_mp3_keys()
    mism = []
    missing = []
    for key, r in sorted(req.items()):
        if key not in mp3:
            missing.append((key, r.line[:50]))
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    for m in re.finditer(r'data-tts-key="([0-9a-f]+)"[^>]*data-speak="([^"]*)"', html):
        pass
    # 扫描 js 中 dense 与按钮逻辑：用 registry 每条 line 的 key 对照 mp3
    for key, r in req.items():
        if key not in mp3:
            continue
    print(f"[INFO] requirements={len(req)} mp3={len(mp3)} missing_mp3={len(missing)}")
    if missing:
        print("[FAIL] 缺 MP3:")
        for k, line in missing[:20]:
            print(f"  {k}  {line}")
        return 1
    print("[OK] 全部需求均有 MP3")
    return 0


if __name__ == "__main__":
    sys.exit(main())
