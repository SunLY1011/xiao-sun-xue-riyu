#!/usr/bin/env python3
"""第13–24课 · 会話 A 轨中文（本课课文口径 · 批 B–D P1）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
_JSON = ROOT / "scripts" / "data" / "curated_zh_l13_24.json"


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def _load() -> dict[str, str]:
    data = json.loads(_JSON.read_text(encoding="utf-8"))
    return {norm_jp(k): v for k, v in data.items()}


CURATED_L13_24: dict[str, str] = _load()
