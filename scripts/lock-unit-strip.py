#!/usr/bin/env python3
"""将已定稿单元的 clean 四格 + strip 写入 assets/story/locked/ 并写 MANIFEST。"""
from __future__ import annotations

import argparse
import hashlib
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORY = ROOT / "assets" / "story"

FILES = (
    "unit-{u}-panel-1-clean.png",
    "unit-{u}-panel-2-clean.png",
    "unit-{u}-panel-3-clean.png",
    "unit-{u}-panel-4-clean.png",
    "unit-{u}-strip.webp",
)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def lock_unit(unit: int) -> Path:
    dest = STORY / "locked" / f"unit-{unit}"
    dest.mkdir(parents=True, exist_ok=True)
    rows: list[str] = []
    for tpl in FILES:
        name = tpl.format(u=unit)
        src = STORY / name
        if not src.is_file():
            raise FileNotFoundError(src)
        out = dest / name
        shutil.copy2(src, out)
        rows.append(f"| `{name}` | `{sha256(src)}` | {src.stat().st_size} |")

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    manifest = dest / "MANIFEST.md"
    manifest.write_text(
        "\n".join(
            [
                f"# Unit {unit} · LOCKED",
                "",
                f"- **锁定日期（UTC）**: {ts}",
                f"- **App 条带**: `assets/story/unit-{unit}-strip.webp`",
                f"- **单格**: `unit-{unit}-panel-{{1..4}}-clean.png`",
                "",
                "## 文件校验",
                "",
                "| 文件 | sha256 (16) | bytes |",
                "|------|-------------|-------|",
                *rows,
                "",
                "## 修改规则",
                "",
                "锁定后勿直接改 `assets/story/unit-{u}-panel-*-clean.png` 或 strip。",
                "需重绘时：新图 → `incoming/unit-{u}/` → harmonize → finish → 再执行本脚本覆盖锁定副本。",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(f"locked unit {unit} -> {dest}")
    return dest


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, required=True)
    args = ap.parse_args()
    lock_unit(args.unit)


if __name__ == "__main__":
    main()
