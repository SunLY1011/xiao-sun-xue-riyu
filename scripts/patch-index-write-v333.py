# -*- coding: utf-8 -*-
"""index.html：四栏底栏 + view-write + v333 资源链。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
VER = "335"

NEW_NAV = f"""    <nav class="bottom-nav" aria-label="主导航">
      <a href="intro.html?v={VER}" class="nav-item nav-item--link" id="nav-intro" title="五十音·入門">
        <span class="nav-icon" aria-hidden="true"></span>
        <span class="nav-label">注音</span>
      </a>
      <button type="button" class="nav-item active" data-view="home" title="课文·学习地图">
        <span class="nav-icon" aria-hidden="true"></span>
        <span class="nav-label">课文</span>
      </button>
      <button type="button" class="nav-item" data-view="write" title="五十音·书写练习">
        <span class="nav-icon" aria-hidden="true"></span>
        <span class="nav-label">书写</span>
      </button>
      <button type="button" class="nav-item" data-view="me" title="笔记 · 复习与知识">
        <span class="nav-icon" aria-hidden="true"></span>
        <span class="nav-label">笔记</span>
      </button>
    </nav>"""

VIEW_WRITE = """
      <section id="view-write" class="view" aria-hidden="true">
        <div id="write-l0-root" class="write-l0-root" aria-label="五十音书写"></div>
      </section>
"""


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")
    text = re.sub(r"\?v=\d+", f"?v={VER}", text)

    if "write-l0.css" not in text:
        text = text.replace(
            f'  <link rel="stylesheet" href="css/journey-catalog-mobile-fix.css?v={VER}" />\n',
            f'  <link rel="stylesheet" href="css/journey-catalog-mobile-fix.css?v={VER}" />\n'
            f'  <link rel="stylesheet" href="css/write-l0.css?v={VER}" />\n',
        )

    if "view-write" not in text:
        text = text.replace(
            '      <section id="view-me" class="view" aria-hidden="true">',
            VIEW_WRITE + '\n      <section id="view-me" class="view" aria-hidden="true">',
        )

    nav_start = text.find('<nav class="bottom-nav"')
    nav_end = text.find("</nav>", nav_start) + len("</nav>")
    if nav_start < 0:
        raise SystemExit("bottom-nav not found")
    text = text[:nav_start] + NEW_NAV + text[nav_end:]

    if "write-kana-l0.js" not in text:
        text = text.replace(
            f'  <script src="js/nav-icons.js?v={VER}"></script>\n',
            f'  <script src="js/nav-icons.js?v={VER}"></script>\n'
            f'  <script src="js/data/intro-content.js?v={VER}"></script>\n'
            f'  <script src="js/write-kana-l0.js?v={VER}"></script>\n',
        )

    mount = """
    (function mountBottomNavIcons() {
      if (typeof NavIcons === "undefined") return;
      const map = [
        ["#nav-intro .nav-icon", "kana"],
        ['.bottom-nav .nav-item[data-view="home"] .nav-icon', "course"],
        ['.bottom-nav .nav-item[data-view="write"] .nav-icon', "write"],
        ['.bottom-nav .nav-item[data-view="me"] .nav-icon', "me"],
      ];
      map.forEach(([sel, key]) => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = NavIcons.html(key);
      });
    })();
"""
    if "mountBottomNavIcons" not in text:
        text = text.replace(
            "    (function mountTopShareIcons() {",
            mount + "\n    (function mountTopShareIcons() {",
        )

    INDEX.write_text(text, encoding="utf-8", newline="\n")
    print(f"[OK] patched index.html v={VER}")


if __name__ == "__main__":
    main()
