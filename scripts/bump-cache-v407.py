#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VER = "407"


def bump_text(path: Path) -> None:
    if not path.exists():
        return
    t = path.read_text(encoding="utf-8")
    t2 = re.sub(r"\?v=\d+", f"?v={VER}", t)
    t2 = re.sub(r'CACHE_BOOT = "\d+"', f'CACHE_BOOT = "{VER}"', t2)
    if path.name == "share-wechat.js":
        t2 = re.sub(r'CACHE_VER = "\d+"', f'CACHE_VER = "{VER}"', t2)
    if t2 != t:
        path.write_text(t2, encoding="utf-8", newline="\n")
        print(f"[OK] {path.relative_to(ROOT)}")


def main() -> None:
    for rel in [
        "index.html",
        "intro.html",
        "share.html",
        "cursor-miniapp-phone.html",
        "js/share-wechat.js",
        "怎么用.txt",
        "微信分享说明.txt",
        "笔记本连接GitHub-必读.txt",
        "docs/链接转发.md",
    ]:
        bump_text(ROOT / rel)
    bl = ROOT / "docs/iteration-baseline.json"
    if bl.exists():
        t = bl.read_text(encoding="utf-8")
        t = re.sub(r'"cache": "\d+"', f'"cache": "{VER}"', t, count=1)
        bl.write_text(t, encoding="utf-8", newline="\n")
        print("[OK] iteration-baseline.json")
    vh = ROOT / "docs/version-history.json"
    if vh.exists():
        data = json.loads(vh.read_text(encoding="utf-8"))
        entry = {
            "cache": VER,
            "date": "2026-05-30",
            "note": "纪要100%对齐：ABC可见B/C分层+条带4泡+知识图闭环+101 TTS",
        }
        if isinstance(data, list):
            if not data or data[0].get("cache") != VER:
                data.insert(0, entry)
            vh.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        else:
            t = vh.read_text(encoding="utf-8")
            t = re.sub(r'"cache": "\d+"', f'"cache": "{VER}"', t, count=1)
            vh.write_text(t, encoding="utf-8", newline="\n")
        print("[OK] version-history.json")
    print(f"DONE cache v={VER}")


if __name__ == "__main__":
    main()
