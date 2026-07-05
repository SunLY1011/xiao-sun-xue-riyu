# -*- coding: utf-8 -*-
"""校验 tts-cache（兼容入口 → audit-tts-registry.py）。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if __name__ == "__main__":
    script = ROOT / "scripts" / "audit-tts-registry.py"
    sys.exit(subprocess.run([sys.executable, str(script)], cwd=str(ROOT)).returncode)
