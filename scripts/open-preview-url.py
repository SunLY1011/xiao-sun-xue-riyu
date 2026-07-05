# -*- coding: utf-8 -*-
"""用 Edge / Chrome 打开本地预览链接，避免默认 Electron 壳（如 @opencode-aidesktop）关窗崩溃。"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def _edge_paths() -> list[Path]:
    pf = os.environ.get("ProgramFiles(x86)") or os.environ.get("ProgramFiles") or ""
    pf64 = os.environ.get("ProgramFiles") or ""
    return [
        Path(pf) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
        Path(pf64) / "Microsoft" / "Edge" / "Application" / "msedge.exe",
    ]


def _chrome_paths() -> list[Path]:
    local = os.environ.get("LOCALAPPDATA") or ""
    return [
        Path(local) / "Google" / "Chrome" / "Application" / "chrome.exe",
        Path(os.environ.get("ProgramFiles", "")) / "Google" / "Chrome" / "Application" / "chrome.exe",
    ]


def open_preview_url(url: str) -> tuple[str, int]:
    for p in _edge_paths():
        if p.is_file():
            subprocess.Popen([str(p), url], close_fds=True)
            return ("msedge", 0)
    for p in _chrome_paths():
        if p.is_file():
            subprocess.Popen([str(p), url], close_fds=True)
            return ("chrome", 0)
    if sys.platform == "win32":
        os.startfile(url)  # noqa: S606 — 兜底：系统默认浏览器
        return ("default", 0)
    subprocess.Popen(["xdg-open", url])
    return ("xdg-open", 0)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url", help="http://127.0.0.1:8765/...")
    args = ap.parse_args()
    browser, code = open_preview_url(args.url)
    print(f"[OK] opened via {browser}: {args.url}")
    return code


if __name__ == "__main__":
    sys.exit(main())
