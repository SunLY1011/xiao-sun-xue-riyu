# -*- coding: utf-8 -*-
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VER = "346"


def bump_text(path: Path) -> None:
    if not path.exists():
        return
    t = path.read_text(encoding="utf-8")
    t2 = re.sub(r"\?v=\d+", f"?v={VER}", t)
    if path.name == "share-wechat.js":
        t2 = re.sub(r'CACHE_VER = "\d+"', f'CACHE_VER = "{VER}"', t2)
    if t2 != t:
        path.write_text(t2, encoding="utf-8", newline="\n")


def main() -> None:
    for rel in [
        "index.html",
        "intro.html",
        "js/share-wechat.js",
        "怎么用.txt",
        "微信分享说明.txt",
        "笔记本连接GitHub-必读.txt",
        "Site-not-found-看这里.txt",
        "docs/链接转发.md",
        "docs/iteration-baseline.json",
    ]:
        bump_text(ROOT / rel)
    vh = ROOT / "docs" / "version-history.json"
    if vh.exists():
        t = vh.read_text(encoding="utf-8")
        t = re.sub(r'"cache": "\d+"', f'"cache": "{VER}"', t, count=1)
        vh.write_text(t, encoding="utf-8", newline="\n")
    print(f"[OK] cache v={VER}")


if __name__ == "__main__":
    main()
