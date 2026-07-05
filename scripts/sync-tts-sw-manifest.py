# -*- coding: utf-8 -*-
"""同步 tts-cache/sw-manifest.json 与 public-url.config.js / CACHE_VER"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "js" / "public-url.config.js"
SHARE = ROOT / "js" / "share-wechat.js"
OUT = ROOT / "tts-cache" / "sw-manifest.json"


def read_ver() -> str:
    if SHARE.is_file():
        m = re.search(r'CACHE_VER\s*=\s*["\'](\d+)["\']', SHARE.read_text(encoding="utf-8"))
        if m:
            return m.group(1)
    return "0"


def read_public_origin() -> str:
    if not PUBLIC.is_file():
        return ""
    text = PUBLIC.read_text(encoding="utf-8")
    m = re.search(r'HYOUGA_PUBLIC_ORIGIN\s*=\s*["\'](https://[^"\']+)["\']', text, re.I)
    return m.group(1).rstrip("/") if m else ""


def read_tts_origin() -> str:
    if not PUBLIC.is_file():
        return ""
    text = PUBLIC.read_text(encoding="utf-8")
    m = re.search(
        r'HYOUGA_TTS_ORIGIN\s*=\s*["\'](https://[^"\']+)["\']',
        text,
        re.I,
    )
    if m:
        return m.group(1).rstrip("/") + "/tts-cache/"
    pub = read_public_origin()
    return (pub + "/tts-cache/") if pub else ""


def main() -> None:
    ver = read_ver()
    tts_base = read_tts_origin()
    data = {
        "cacheVer": ver,
        "ttsBase": tts_base,
        "batchSize": 40,
        "note": "由 scripts/sync-tts-sw-manifest.py 维护；与 js/public-url.config.js 一致",
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] {OUT.relative_to(ROOT)} cacheVer={ver}")


if __name__ == "__main__":
    main()
