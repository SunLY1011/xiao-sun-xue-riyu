#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""本地完整冒烟：三级彩蛋 + 关键静态资源（须 http://127.0.0.1:8765）。"""
from __future__ import annotations

import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "http://127.0.0.1:8765"
PORT = 8765

FAILURES: list[str] = []
CHECKS = 0


def ok(msg: str) -> None:
    global CHECKS
    CHECKS += 1
    print(f"[OK] {msg}")


def fail(msg: str) -> None:
    global CHECKS
    CHECKS += 1
    FAILURES.append(msg)
    print(f"[FAIL] {msg}")


def fetch(path: str, min_bytes: int = 100) -> tuple[int, bytes]:
    url = f"{BASE}{path}" if path.startswith("/") else f"{BASE}/{path}"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            body = r.read()
            if len(body) < min_bytes:
                raise ValueError(f"body too small ({len(body)} B)")
            return r.status, body
    except Exception as e:
        raise OSError(f"{url}: {e}") from e


def get_cache_ver() -> str:
    text = (ROOT / "js" / "share-wechat.js").read_text(encoding="utf-8")
    m = re.search(r'CACHE_VER\s*=\s*"(\d+)"', text)
    if not m:
        raise SystemExit("[FAIL] 无法读取 CACHE_VER")
    return m.group(1)


def check_server() -> None:
    try:
        st, body = fetch("/index.html", min_bytes=500)
        if st != 200:
            fail(f"index.html status {st}")
        else:
            ok("本地服务 8765 · index.html 可访问")
    except OSError as e:
        fail(str(e))
        print("\n请先运行：打开本地预览.bat 或 python scripts/start-local-server.py")
        sys.exit(1)


def check_page(path: str, must_contain: list[str], label: str) -> None:
    try:
        _, body = fetch(path, min_bytes=200)
        text = body.decode("utf-8", errors="replace")
        missing = [s for s in must_contain if s not in text]
        if missing:
            fail(f"{label} 缺少: {', '.join(missing[:3])}")
        else:
            ok(label)
    except OSError as e:
        fail(f"{label}: {e}")


def check_asset(path: str, min_bytes: int, label: str) -> None:
    try:
        fetch(path, min_bytes=min_bytes)
        ok(label)
    except OSError as e:
        fail(f"{label}: {e}")


def main() -> int:
    ver = get_cache_ver()
    print(f"=== 本地彩蛋冒烟 · CACHE_VER={ver} · {BASE} ===\n")

    check_server()

    v = f"?v={ver}"
    check_page(
        f"/index.html{v}",
        ["story-egg.js", "story-egg-viewport.js", "lesson-recap.js", "grand-finale-cards.js"],
        "index.html 脚本引用",
    )
    check_page(
        f"/story-unit-phone-real.html{v}",
        ["story-phone-preview.js", "mvp.css"],
        "竖屏验收页",
    )
    check_page(
        f"/story-egg-preview.html",
        ["story-egg", "egg"],
        "彩蛋预览 hub",
    )

    # L2/L3 关键图
    check_asset("/assets/story/unit-1-strip.webp", 10_000, "L2 unit-1-strip.webp")
    check_asset("/assets/story/egg-grand.webp", 5_000, "L3 egg-grand.webp")
    check_asset("/assets/story/grand/card-19-clean.png", 5_000, "L3 card-19-clean（第5行第1格）")

    for cid in (1, 12, 24):
        n = f"{cid:02d}"
        check_asset(f"/assets/story/grand/card-{n}-clean.png", 3_000, f"L3 card-{n}-clean")

    # JS 语法粗检：能下载且含 StoryEgg
    try:
        _, body = fetch(f"/js/story-egg.js{v}", min_bytes=500)
        if b"StoryEgg" not in body and b"openLessonEgg" not in body:
            fail("story-egg.js 内容异常")
        else:
            ok("story-egg.js 可加载")
    except OSError as e:
        fail(str(e))

    try:
        from grand_finale_slate import GRAND_SLATE  # noqa: PLC0415

        card19 = GRAND_SLATE[4][0]
        if card19 != 19:
            fail(f"GRAND_SLATE[4][0] 应为 19，实际 {card19}")
        else:
            ok("GRAND_SLATE 第5行第1列 = card 19")
    except Exception as e:
        fail(f"slate 校验: {e}")

    print(f"\n=== 完成 {CHECKS} 项 · 失败 {len(FAILURES)} ===")
    if FAILURES:
        for f in FAILURES:
            print(f"  - {f}")
        print("\n手动浏览器验收：")
        print(f"  {BASE}/index.html{v}&egg=ultimate")
        print(f"  {BASE}/index.html{v}&egg=unit&unitId=1")
        print(f"  {BASE}/index.html{v}&storyEggLesson=14")
        print(f"  {BASE}/story-unit-phone-real.html{v}&tier=l3")
        return 1

    print("\n自动化全绿。建议浏览器再点一次（约 3 分钟）：")
    print(f"  1) {BASE}/story-egg-preview.html")
    print(f"  2) {BASE}/index.html{v}&egg=ultimate")
    print(f"  3) {BASE}/story-unit-phone-real.html{v}&tier=l2&unit=1")
    return 0


if __name__ == "__main__":
    sys.path.insert(0, str(ROOT / "scripts"))
    raise SystemExit(main())
