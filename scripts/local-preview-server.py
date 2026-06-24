# -*- coding: utf-8 -*-
"""
本地静态服务（8765）+ 改码即刷信号 /__preview_reload
供 cursor-miniapp-phone.html?live=1 轮询；Agent 可 python scripts/preview-notify-reload.py
"""
from __future__ import annotations

import argparse
import json
import http.server
import socket
import socketserver
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT_DEFAULT = 8765

RELOAD = {"n": 0, "at": ""}
RELOAD_LOCK = threading.Lock()

WATCH_DIRS = ("js", "css", "docs")
WATCH_ROOT_FILES = (
    "index.html",
    "intro.html",
    "cursor-miniapp-phone.html",
)
WATCH_SUFFIXES = {".css", ".js", ".html", ".mdc"}


def bump_reload(reason: str = "manual") -> None:
    with RELOAD_LOCK:
        RELOAD["n"] = int(time.time() * 1000)
        RELOAD["at"] = time.strftime("%H:%M:%S") + f" · {reason}"


def _collect_watch_files() -> list[Path]:
    out: list[Path] = []
    for name in WATCH_ROOT_FILES:
        p = ROOT / name
        if p.is_file():
            out.append(p)
    for sub in WATCH_DIRS:
        d = ROOT / sub
        if not d.is_dir():
            continue
        for p in d.rglob("*"):
            if p.is_file() and p.suffix.lower() in WATCH_SUFFIXES:
                out.append(p)
    return out


def watch_loop(interval: float, debounce: float) -> None:
    files = _collect_watch_files()
    mtimes = {p: p.stat().st_mtime for p in files if p.exists()}
    last_bump = 0.0
    while True:
        time.sleep(interval)
        changed = False
        for p in list(mtimes.keys()):
            if not p.exists():
                changed = True
                continue
            try:
                m = p.stat().st_mtime
            except OSError:
                continue
            if mtimes.get(p) != m:
                mtimes[p] = m
                changed = True
        if changed and (time.time() - last_bump) >= debounce:
            bump_reload("save")
            last_bump = time.time()


def _make_preview_server(port: int, handler, host: str = "0.0.0.0") -> socketserver.ThreadingTCPServer:
    """默认绑定 0.0.0.0 支持局域网访问，可通过 --host 参数指定"""
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    # 如果指定了特定 host（如 127.0.0.1），直接使用
    if host != "0.0.0.0":
        return socketserver.ThreadingTCPServer((host, port), handler)
    # 尝试 IPv6 双栈（支持局域网）
    try:
        class _Dual(socketserver.ThreadingTCPServer):
            address_family = socket.AF_INET6
            allow_reuse_address = True
        srv = _Dual(("::", port), handler)
        srv.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        return srv
    except OSError:
        return socketserver.ThreadingTCPServer(("0.0.0.0", port), handler)


class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # 静默 __preview_reload 的 404 日志
        if fmt and "/__preview_reload" in str(fmt):
            return
        super().log_message(fmt, *args)

    def _send_reload_json(self, code: int = 200) -> None:
        with RELOAD_LOCK:
            body = json.dumps(RELOAD, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/__preview_reload":
            self._send_reload_json()
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path in ("/__preview_reload", "/__preview_reload/bump"):
            bump_reload("agent")
            self._send_reload_json()
            return
        self.send_error(404)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="0.0.0.0", help="监听地址，默认 0.0.0.0（局域网可用）")
    ap.add_argument("--port", type=int, default=PORT_DEFAULT)
    ap.add_argument("--watch", action="store_true", help="监听 css/js/html 保存后 bump")
    ap.add_argument("--watch-interval", type=float, default=1.0)
    ap.add_argument("--debounce", type=float, default=0.6)
    args = ap.parse_args()

    bump_reload("start")

    if args.watch:
        t = threading.Thread(
            target=watch_loop,
            args=(args.watch_interval, args.debounce),
            daemon=True,
        )
        t.start()
        print(f"[watch] 改码即刷 · 监听 js/css/html · debounce {args.debounce}s")

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = _make_preview_server(args.port, PreviewHandler, args.host)
    # 获取实际监听地址
    actual_host = httpd.server_address[0]
    with httpd:
        print(f"[OK] http://127.0.0.1:{args.port}/ · 本机开发")
        print(f"     手机局域网 http://{actual_host}:{args.port}/ · 需同一 WiFi")
        print(f"     Cursor 请用 127.0.0.1（勿用 localhost，避免 IPv6 拒连）")
        print(f"     真机框 http://127.0.0.1:{args.port}/cursor-miniapp-phone.html?live=1")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[stop]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
