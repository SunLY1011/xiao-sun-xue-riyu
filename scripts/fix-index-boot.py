# -*- coding: utf-8 -*-
"""去掉 index.html BOM，加入微信/浏览器打不开时的引导与兜底。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SRC = ROOT / "index.html.fromgh"

BOOT_SCRIPT = """  <script>
    (function () {
      var OFFICIAL = "https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html";
      var host = location.hostname;
      var path = location.pathname || "";
      if (/github\\.io$/i.test(host)) {
        if (path === "/" || path === "") {
          location.replace(OFFICIAL + (location.search || "?v=346"));
          return;
        }
        if (/^\\/XiaoWangXueRiyu\\/?$/i.test(path)) {
          location.replace(OFFICIAL + (location.search || "?v=346"));
          return;
        }
      }
      window.__hyougaBootFailTimer = setTimeout(function () {
        var splash = document.getElementById("home-splash-overlay");
        var root = document.getElementById("splash-root");
        if (!splash || splash.classList.contains("is-hidden")) return;
        if (root && root.querySelector(".splash-btn-start")) return;
        if (document.getElementById("hyouga-boot-fallback")) return;
        var ver = (location.search.match(/[?&]v=(\\d+)/) || [])[1] || "346";
        var url = OFFICIAL + "?v=" + ver;
        var box = document.createElement("div");
        box.id = "hyouga-boot-fallback";
        box.setAttribute(
          "style",
          "position:fixed;inset:0;z-index:10000;background:#FFF8E1;padding:max(24px,env(safe-area-inset-top)) 20px;text-align:center;font-family:system-ui,sans-serif"
        );
        box.innerHTML =
          '<p style="font-size:18px;font-weight:700;margin:24px 0 8px;color:#37474f">页面未正常加载</p>' +
          '<p style="font-size:14px;line-height:1.6;color:#607d8b">请用<strong>完整链接</strong>打开（须含 <code>XiaoWangXueRiyu-v2/index.html</code>）</p>' +
          '<p style="word-break:break-all;font-size:13px;margin:16px 0"><a href="' +
          url +
          '">' +
          url +
          "</a></p>" +
          '<a href="' +
          url +
          '" style="display:inline-block;margin-top:12px;padding:13px 22px;background:#ff7043;color:#fff;border-radius:999px;text-decoration:none;font-weight:700">进入学习</a>';
        document.body.appendChild(box);
      }, 5000);
    })();
  </script>
"""

SPLASH_OLD = '    <div id="splash-root" class="splash-root"></div>'
SPLASH_NEW = """    <div id="splash-root" class="splash-root">
      <p class="splash-boot-loading" style="text-align:center;padding:48px 16px;font-size:15px;color:#78909c">加载中…</p>
    </div>"""


def main() -> None:
    src = SRC if SRC.is_file() else INDEX
    text = src.read_bytes()
    if text.startswith(b"\xef\xbb\xbf"):
        text = text[3:]
    html = text.decode("utf-8")

    if "hyouga-boot-fallback" not in html:
        html = html.replace("</title>\n", "</title>\n" + BOOT_SCRIPT + "\n", 1)
    html = html.replace(SPLASH_OLD, SPLASH_NEW)

    INDEX.write_text(html, encoding="utf-8", newline="\n")
    print(f"[OK] {INDEX} (no BOM, boot guard)")


if __name__ == "__main__":
    main()
