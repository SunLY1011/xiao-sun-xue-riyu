#!/usr/bin/env python3
"""兼容入口 → finish-unit-strip.py --unit 1"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    script = ROOT / "scripts" / "finish-unit-strip.py"
    args = [sys.executable, str(script), "--unit", "1", *sys.argv[1:]]
    raise SystemExit(subprocess.call(args))


if __name__ == "__main__":
    main()
