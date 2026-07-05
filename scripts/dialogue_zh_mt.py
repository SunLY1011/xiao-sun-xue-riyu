#!/usr/bin/env python3
"""会話中文 · 机翻痕迹检测（只检不改）"""
from __future__ import annotations

import re
from dataclasses import dataclass

# 标日 H5 常见机翻/脏数据模式
MT_PATTERNS: list[tuple[str, str]] = [
    (r"虽然.+?但是", "机翻转折「虽然…但是」"),
    (r"虽然[\u3040-\u30ff\u4e00-\u9fff]", "中日混杂「虽然+日文」"),
    (r"[\u3040-\u30ff]{6,}", "中文栏长段假名"),
    (r"行き了|聞き了|すぎ了|あり不|忘れ不|飲ま不", "错字（了/不）"),
    (r"何吗", "「什么吗」错字"),
    (r"です呢[。！]|でした呢[。！]", "句末「です呢」"),
    (r"\*\*李\*\*\*\*", "脏标记 **李****"),
    (r"^[^。！？\n]*[\u3040-\u30ff][^。！？\n]*$", "整句似为日文未译"),
]

KANA_RE = re.compile(r"[\u3040-\u30ff]")
CJK_RE = re.compile(r"[\u4e00-\u9fff]")


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def kana_ratio(text: str) -> float:
    if not text:
        return 0.0
    k = len(KANA_RE.findall(text))
    c = len(CJK_RE.findall(text))
    total = k + c + len(re.findall(r"[A-Za-z0-9]", text))
    return k / total if total else 0.0


def is_bad_zh(zh: str, jp: str = "") -> bool:
    zh = (zh or "").strip()
    if not zh:
        return True
    for pat, _ in MT_PATTERNS:
        if re.search(pat, zh):
            return True
    if kana_ratio(zh) > 0.35 and len(zh) > 8:
        return True
    if jp and norm_jp(zh) == norm_jp(jp):
        return True
    return False


def scan_text(zh: str, jp: str = "") -> list[str]:
    reasons: list[str] = []
    if not (zh or "").strip():
        reasons.append("中文为空")
        return reasons
    for pat, label in MT_PATTERNS:
        if re.search(pat, zh):
            reasons.append(label)
    if kana_ratio(zh) > 0.35 and len(zh) > 8:
        reasons.append(f"假名占比过高({kana_ratio(zh):.0%})")
    if jp and norm_jp(zh) == norm_jp(jp):
        reasons.append("中文与日文相同")
    return reasons


@dataclass
class Hit:
    lesson_id: int
    dlg_id: str
    field: str
    japanese: str
    chinese: str
    reasons: list[str]
