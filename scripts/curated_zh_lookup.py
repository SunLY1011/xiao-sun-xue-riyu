#!/usr/bin/env python3
"""curated 会話中文 · 键查找（含 ** 脏标记回退）"""
from __future__ import annotations

import re


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def strip_md_artifacts(key: str) -> str:
    return re.sub(r"\*+", "", key)


def lookup_curated(jp: str, *maps: dict[str, str]) -> str:
    key = norm_jp(jp)
    if not key:
        return ""
    for mp in maps:
        if not mp:
            continue
        zh = mp.get(key)
        if zh:
            return zh
    clean = strip_md_artifacts(key)
    if clean != key:
        for mp in maps:
            if not mp:
                continue
            zh = mp.get(clean)
            if zh:
                return zh
    return ""
