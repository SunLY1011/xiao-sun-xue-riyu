# -*- coding: utf-8 -*-
"""合并 书写板块/data/kana-hiragana.json 手工路径 → build 用 HIRA_MANUAL_FULL 坐标（1024）。"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VB = 1024
JSON_PATH = ROOT / "书写板块" / "data" / "kana-hiragana.json"


def rel_to_abs(strokes: list[dict]) -> list[list[list[float]]]:
    out: list[list[list[float]]] = []
    for st in sorted(strokes, key=lambda s: s.get("order", 0)):
        pts = st.get("path") or []
        out.append([[round(p["x"] * VB), round(p["y"] * VB)] for p in pts])
    return out


def load_json_manual_full() -> dict[str, list[list[list[float]]]]:
    if not JSON_PATH.is_file():
        return {}
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    full: dict[str, list[list[list[float]]]] = {}
    for ch in data.get("characters") or []:
        kana = ch.get("kana")
        if not kana:
            continue
        full[kana] = rel_to_abs(ch.get("strokes") or [])
    return full


if __name__ == "__main__":
    merged = load_json_manual_full()
    for k, v in merged.items():
        print(k, len(v), "strokes", [len(s) for s in v])
