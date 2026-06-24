#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批次 E · 第1课 PRD 对账（委托 audit-lessons-biaori-prd · 只读）"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "audit-l1-biaori-prd-最新.md"


def main() -> int:
    cmd = [
        sys.executable,
        str(ROOT / "scripts" / "audit-lessons-biaori-prd.py"),
        "--from",
        "1",
        "--to",
        "1",
        "--out",
        str(OUT),
    ]
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
