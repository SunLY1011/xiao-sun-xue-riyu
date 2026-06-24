# -*- coding: utf-8 -*-
"""将作者常用说明/文档中的 ?v= 与 js/share-wechat.js CACHE_VER 对齐。"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEGACY_ORIGIN = "https://saivenwang-byte.github.io/XiaoWangXueRiyu"


def get_public_origin() -> str:
    text = (ROOT / "js" / "public-url.config.js").read_text(encoding="utf-8")
    m = re.search(r'HYOUGA_PUBLIC_ORIGIN\s*=\s*"([^"]+)"', text)
    if not m:
        raise SystemExit("[FAIL] 无法读取 HYOUGA_PUBLIC_ORIGIN")
    return m.group(1).rstrip("/")


def get_cache_ver() -> str:
    text = (ROOT / "js" / "share-wechat.js").read_text(encoding="utf-8")
    m = re.search(r'CACHE_VER\s*=\s*"(\d+)"', text)
    if not m:
        raise SystemExit("[FAIL] 无法读取 CACHE_VER")
    return m.group(1)


def replace_v_in_text(text: str, origin: str, ver: str) -> tuple[str, int]:
    total = 0
    new = text
    for base in (origin, LEGACY_ORIGIN):
        new, n = re.subn(
            rf"({re.escape(base)}/(?:index\.html|share\.html)\?v=)\d+",
            rf"\g<1>{ver}",
            new,
        )
        new, n2 = re.subn(
            rf"({re.escape(base)}/index\.html\?v=)\d+",
            rf"\g<1>{ver}",
            new,
        )
        new, n3 = re.subn(
            re.escape(LEGACY_ORIGIN) + r"(/share\.html)(?!\?v=)",
            origin + r"\1",
            new,
        )
        new, n4 = re.subn(
            re.escape(LEGACY_ORIGIN) + r"(/index\.html)(?!\?v=)",
            origin + r"\1",
            new,
        )
        new, n5 = re.subn(
            re.escape(LEGACY_ORIGIN) + r"/index\.html\?v=\d+",
            f"{origin}/index.html?v={ver}",
            new,
        )
        new, n6 = re.subn(
            re.escape(LEGACY_ORIGIN) + r"/share\.html\?v=\d+",
            f"{origin}/share.html?v={ver}",
            new,
        )
        total += n + n2 + n3 + n4 + n5 + n6
    return new, total


def sync_file(path: Path, origin: str, ver: str) -> int:
    if not path.is_file():
        return 0
    raw = path.read_text(encoding="utf-8")
    new, n = replace_v_in_text(raw, origin, ver)
    if n and new != raw:
        path.write_text(new, encoding="utf-8", newline="\n")
    return n


def main() -> int:
    origin = get_public_origin()
    ver = get_cache_ver()
    targets = [
        ROOT / "怎么用.txt",
        ROOT / "微信分享说明.txt",
        ROOT / "笔记本连接GitHub-必读.txt",
        ROOT / "docs" / "链接转发.md",
        ROOT / "Site-not-found-看这里.txt",
        ROOT / "docs" / "发布与知识库同步.md",
    ]
    total = 0
    for p in targets:
        c = sync_file(p, origin, ver)
        if c:
            print(f"[OK] 已同步 {p.relative_to(ROOT)} ({c} 处 → v={ver})")
            total += c
    if total == 0:
        print(f"[OK] 作者链接文案已与 v={ver} 一致（无需改写）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
