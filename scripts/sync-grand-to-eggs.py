#!/usr/bin/env python3
"""同步通关全家福资产到 彩蛋/grand/。"""
from __future__ import annotations

import shutil
from pathlib import Path

from grand_finale_layout import (
    CARD_COUNT,
    EGG_GRAND,
    EGG_OUT,
    GRAND,
    card_path,
    resolve_egg_txt,
)


def main() -> None:
    EGG_OUT.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []

    egg_txt = resolve_egg_txt()
    if egg_txt:
        dest = EGG_OUT / "通关全家福.txt"
        shutil.copy2(egg_txt, dest)
        copied.append(dest.name)

    if EGG_GRAND.is_file():
        dest = EGG_OUT / "egg-grand.webp"
        shutil.copy2(EGG_GRAND, dest)
        copied.append(dest.name)

    for kind in ("clean", "harmonized", "draft"):
        files = [card_path(i, kind) for i in range(1, CARD_COUNT + 1)]
        if all(p.is_file() for p in files):
            sub = EGG_OUT / kind
            sub.mkdir(exist_ok=True)
            for p in files:
                shutil.copy2(p, sub / p.name)
                copied.append(f"{kind}/{p.name}")

    print(f"sync -> {EGG_OUT} ({len(copied)} files)")


if __name__ == "__main__":
    main()
