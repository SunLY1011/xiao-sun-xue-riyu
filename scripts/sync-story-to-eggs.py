#!/usr/bin/env python3
"""将 assets/story 中已完成的条带与单格，同步到 彩蛋/单元N/ 归档。"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
EGGS = ROOT / "彩蛋"

# 单元 N → 彩蛋/单元N
UNIT_DIR = {i: EGGS / f"单元{i}" for i in range(1, 7)}


def sync_unit(unit: int, *, include_dialogue: bool = False) -> list[str]:
    out_dir = UNIT_DIR[unit]
    out_dir.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []

    strip = STORY / f"unit-{unit}-strip.webp"
    if strip.is_file():
        dest = out_dir / f"unit-{unit}-strip.webp"
        shutil.copy2(strip, dest)
        copied.append(dest.name)

    for i in range(1, 5):
        clean = STORY / f"unit-{unit}-panel-{i}-clean.png"
        if clean.is_file():
            dest = out_dir / f"unit-{unit}-panel-{i}-clean.png"
            shutil.copy2(clean, dest)
            copied.append(dest.name)
        if include_dialogue:
            dlg = STORY / f"unit-{unit}-panel-{i}-dialogue.png"
            if dlg.is_file():
                dest = out_dir / f"unit-{unit}-panel-{i}-dialogue.png"
                shutil.copy2(dlg, dest)
                copied.append(dest.name)

    harmonized = [STORY / f"unit-{unit}-panel-{i}-harmonized.png" for i in range(1, 5)]
    if all(p.is_file() for p in harmonized):
        sub = out_dir / "harmonized"
        sub.mkdir(exist_ok=True)
        for p in harmonized:
            dest = sub / p.name
            shutil.copy2(p, dest)
            copied.append(f"harmonized/{dest.name}")

    draft = [STORY / f"unit-{unit}-panel-{i}-draft.png" for i in range(1, 5)]
    if all(p.is_file() for p in draft):
        sub = out_dir / "draft"
        sub.mkdir(exist_ok=True)
        for p in draft:
            dest = sub / p.name
            shutil.copy2(p, dest)
            copied.append(f"draft/{dest.name}")

    return copied


def main() -> None:
    ap = argparse.ArgumentParser(description="同步条带到 彩蛋/单元N/")
    ap.add_argument("--unit", type=int, action="append", help="仅同步指定单元（可多次）")
    ap.add_argument("--all", action="store_true", help="尝试同步 1–6")
    ap.add_argument(
        "--with-dialogue",
        action="store_true",
        help="同时复制 panel-N-dialogue.png（默认仅 strip + clean）",
    )
    args = ap.parse_args()
    units = args.unit if args.unit else (list(range(1, 7)) if args.all else list(range(1, 7)))

    for u in units:
        if u not in UNIT_DIR:
            print(f"skip invalid unit {u}")
            continue
        files = sync_unit(u, include_dialogue=args.with_dialogue)
        if files:
            print(f"unit {u} -> {UNIT_DIR[u]} ({len(files)} files)")
            for f in files:
                print(f"  {f}")
        else:
            print(f"unit {u}: nothing to copy (no strip/clean panels)")


if __name__ == "__main__":
    main()
