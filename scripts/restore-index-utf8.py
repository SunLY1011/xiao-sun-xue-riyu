# -*- coding: utf-8 -*-
"""从 git HEAD 恢复 index.html UTF-8，并写入当前 CACHE_VER 与样式链。"""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CACHE_VER = "335"  # bump when re-running restore


def main() -> None:
    raw = subprocess.check_output(["git", "show", "HEAD:index.html"], cwd=str(ROOT))
    text = raw.decode("utf-8")
    text = re.sub(r"\?v=\d+", f"?v={CACHE_VER}", text)
    if "journey-catalog-mobile-fix.css" not in text:
        text = text.replace(
            f'  <link rel="stylesheet" href="css/vi-typography-sweep.css?v={CACHE_VER}" />\n',
            f'  <link rel="stylesheet" href="css/vi-typography-sweep.css?v={CACHE_VER}" />\n'
            f'  <link rel="stylesheet" href="css/journey-catalog-mobile-fix.css?v={CACHE_VER}" />\n',
        )
    INDEX.write_text(text, encoding="utf-8", newline="\n")
    print(f"[OK] restored index.html UTF-8 cache v={CACHE_VER}")


if __name__ == "__main__":
    main()
