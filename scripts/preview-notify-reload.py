# -*- coding: utf-8 -*-
"""Agent 改 UI 完成后调用一次 → 真机预览框刷新（需 local-preview-server.py --watch）"""
from __future__ import annotations

import sys
import urllib.error
import urllib.request

URL = "http://127.0.0.1:8765/__preview_reload/bump"


def main() -> int:
    try:
        req = urllib.request.Request(URL, method="POST", data=b"")
        with urllib.request.urlopen(req, timeout=2) as r:
            body = r.read().decode("utf-8", errors="replace")
        print(f"[OK] 已通知真机预览刷新 · {body.strip()}")
        return 0
    except urllib.error.URLError as e:
        print(
            "[WARN] 无法通知预览刷新（请先运行 重启本地服务.bat 或 Cursor真机持续预览.bat）",
            file=sys.stderr,
        )
        print(f"       {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
