#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Restore index.html UTF-8 from git baseline + merge notes dock / v bump."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "index.html"
CACHE = "313"
BASE_COMMIT = "078815a"

VIEW_ME = """      <section id="view-me" class="view" aria-hidden="true">
        <div class="notes-me-shell">
          <div id="notes-panel-root" class="notes-panel-root notes-panel-scroll" aria-label="笔记"></div>
          <div class="notes-me-dock" aria-label="设置与分享">
            <details class="notes-settings-fold">
              <summary class="notes-settings-summary zh-annotation">设置 · 分享链接</summary>
              <div class="notes-settings-body">
                <label class="settings-toggle">
                  <input type="checkbox" id="toggle-zh" checked />
                  <span>显示中文释义（小字灰色）</span>
                </label>
                <button type="button" class="btn ghost" id="btn-clear-mvp" style="margin-top:12px;width:100%">清除本机学习数据</button>
                <button type="button" class="btn primary btn--with-forward-icon" id="btn-share-me" style="width:100%;margin-top:10px"><span class="btn-forward-icon" aria-hidden="true"></span><span>复制学习链接</span></button>
                <a href="share.html" class="btn secondary" style="display:block;text-align:center;margin-top:10px;text-decoration:none">分享页（QR）</a>
                <p class="hint-ja footer-hint" style="margin-top:10px">朗读优先缓存 MP3 · 单词/会話/测试可 🔊🎤 跟读 · 无需登录</p>
              </div>
            </details>
          </div>
        </div>
      </section>"""

MINIAPP_HEAD = """  <script>
    (function () {
      if (/[?&]miniappPreview=1(?:&|$)/.test(location.search)) {
        document.documentElement.classList.add("hyouga-miniapp-webview");
      }
    })();
  </script>
"""


def main() -> None:
    raw = subprocess.check_output(["git", "show", f"{BASE_COMMIT}:index.html"], cwd=ROOT)
    text = raw.decode("utf-8")

    text = re.sub(
        r"<section id=\"view-me\".*?</section>",
        VIEW_ME.strip(),
        text,
        count=1,
        flags=re.S,
    )

    if "miniapp-webview.css" not in text:
        text = text.replace(
            '<link rel="stylesheet" href="css/mvp.css?v=305" />',
            '<link rel="stylesheet" href="css/mvp.css?v=305" />\n'
            '  <link rel="stylesheet" href="css/miniapp-webview.css?v=305" />',
        )

    if "miniappPreview" not in text:
        text = text.replace("</title>\n", f"</title>\n{MINIAPP_HEAD}", 1)

    if "hyouga-fold-overview.js" not in text:
        text = text.replace(
            '<script src="js/sensei-tip-card.js?v=305"></script>',
            '<script src="js/sensei-tip-card.js?v=305"></script>\n'
            '  <script src="js/hyouga-fold-overview.js?v=305"></script>',
        )

    # lesson-1-flow before l1-knowledge-card (fold overview load order)
    text = text.replace(
        '  <script src="js/l1-knowledge-card.js?v=305"></script>\n'
        '  <script src="js/grammar-network.js?v=305"></script>',
        '  <script src="js/lesson-1-flow.js?v=305"></script>\n'
        '  <script src="js/l1-knowledge-card.js?v=305"></script>\n'
        '  <script src="js/grammar-network.js?v=305"></script>',
    )
    text = re.sub(
        r"\n  <script src=\"js/lesson-1-flow\.js\?v=305\"></script>\n  <script src=\"js/notes-panel\.js",
        "\n  <script src=\"js/notes-panel.js",
        text,
        count=1,
    )

    text = re.sub(r"\?v=\d+", f"?v={CACHE}", text)

    OUT.write_text(text, encoding="utf-8", newline="\n")
    OUT.read_text(encoding="utf-8")  # validate
    print(f"[OK] wrote {OUT} cache v={CACHE}")


if __name__ == "__main__":
    main()
