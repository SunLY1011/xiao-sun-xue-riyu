#!/usr/bin/env python3
"""本地预览分镜页 · 固定端口 8777（避免 8766 多实例冲突）"""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import webbrowser

PORT = 8777
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)


def main() -> int:
    os.chdir(ROOT)
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
            url = f"http://127.0.0.1:{PORT}/storyboard-preview.html"
            print(f"Serving: {ROOT}")
            print(f"Open:    {url}")
            print("Press Ctrl+C to stop.")
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} busy: {e}", file=sys.stderr)
        print("Close other servers or edit PORT in serve-storyboard.py", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
