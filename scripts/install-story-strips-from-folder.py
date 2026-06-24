#!/usr/bin/env python3
"""从 assets/story/incoming/ 安装用户修好的四格 → unit-{n}-strip.webp"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"
INCOMING = STORY / "incoming"
COMPOSE = ROOT / "scripts" / "compose-unit-strip.py"


def panel_paths(unit_dir: Path) -> list[Path] | None:
    if not unit_dir.is_dir():
        return None
    strip = unit_dir / "strip.webp"
    if strip.is_file():
        return None  # 信号：整页条带
    found: list[Path] = []
    for i in range(1, 5):
        for name in (f"panel-{i}.png", f"panel-{i}.webp", f"{i}.png", f"{i}.webp"):
            p = unit_dir / name
            if p.is_file():
                found.append(p)
                break
        else:
            return None
    return found


def install_unit(unit_id: int, dry_run: bool) -> str:
    unit_dir = INCOMING / f"unit-{unit_id}"
    out = STORY / f"unit-{unit_id}-strip.webp"

    if not unit_dir.is_dir():
        return f"skip unit-{unit_id}: 无目录 {unit_dir.relative_to(ROOT)}"

    strip_one = unit_dir / "strip.webp"
    if strip_one.is_file():
        if dry_run:
            return f"ok unit-{unit_id}: 将复制 strip.webp → {out.name}"
        shutil.copy2(strip_one, out)
        return f"ok unit-{unit_id}: copied strip.webp"

    panels = panel_paths(unit_dir)
    if not panels:
        return f"skip unit-{unit_id}: 需要 panel-1..4 或 strip.webp"

    if dry_run:
        names = ", ".join(p.name for p in panels)
        return f"ok unit-{unit_id}: 将拼版 [{names}] → {out.name}"

    import subprocess

    cmd = [
        sys.executable,
        str(COMPOSE),
        "--unit",
        str(unit_id),
        "--panels",
        *[str(p) for p in panels],
        "-o",
        str(out),
    ]
    subprocess.run(cmd, check=True)
    return f"ok unit-{unit_id}: composed {out.name}"


def main() -> None:
    ap = argparse.ArgumentParser(description="从 incoming/ 安装单元四格条带")
    ap.add_argument("--unit", type=int, choices=range(1, 7), help="只处理指定单元")
    ap.add_argument("--dry-run", action="store_true", help="只检查不写入")
    args = ap.parse_args()

    units = [args.unit] if args.unit else list(range(1, 7))
    print(f"incoming: {INCOMING}")
    for u in units:
        print(install_unit(u, args.dry_run))

    if not args.dry_run:
        print("done → assets/story/unit-{n}-strip.webp")


if __name__ == "__main__":
    main()
