# -*- coding: utf-8 -*-
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VER = "334"


def main() -> None:
    index = ROOT / "index.html"
    t = index.read_text(encoding="utf-8")
    t = re.sub(r"\?v=\d+", f"?v={VER}", t)
    insert = (
        f'  <script src="js/data/intro-content.js?v={VER}"></script>\n'
        f'  <script src="js/data/kana-stroke-guide.js?v={VER}"></script>\n'
        f'  <script src="js/write-kana-stroke-ui.js?v={VER}"></script>\n'
    )
    if "kana-stroke-guide.js" not in t:
        t = t.replace(
            f'  <script src="js/data/intro-content.js?v={VER}"></script>\n',
            insert,
        )
    index.write_text(t, encoding="utf-8", newline="\n")

    sw = ROOT / "js" / "share-wechat.js"
    sw.write_text(
        re.sub(r'CACHE_VER = "\d+"', f'CACHE_VER = "{VER}"', sw.read_text(encoding="utf-8")),
        encoding="utf-8",
        newline="\n",
    )
    print(f"[OK] v={VER}")


if __name__ == "__main__":
    main()
