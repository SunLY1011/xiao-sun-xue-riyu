# -*- coding: utf-8 -*-
"""国内发行（Gitee Pages / COS）应上传的静态资源清单。"""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 相对仓库根目录；学员 H5 运行时需要的入口与资源
SHIP_DIRS = (
    "js",
    "css",
    "assets",
    "icons",
    "tts-cache",
)

SHIP_FILES = (
    "index.html",
    "share.html",
    "intro.html",
    "preview.html",
    "storyboard-preview.html",
    "story-grand-preview.html",
    "story-grand-confirmed.html",
    "sw.js",
)

EXCLUDE_DIR_NAMES = {
    ".git",
    ".cursor",
    "node_modules",
    "docs",
    "scripts",
    "mock",
    "japanese_learning_miniapp",
    "Self Study Japanese",
    "发布包",
    "上传包",
    "generated_products",
    "_pptx_extract",
}

EXCLUDE_SUFFIXES = (".pyc", ".sqlite", ".sqlite-shm", ".sqlite-wal")


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIR_NAMES:
        return True
    if path.suffix.lower() in EXCLUDE_SUFFIXES:
        return True
    name = path.name
    if name.startswith(".") and name not in (".nojekyll",):
        return True
    if name.endswith(".bat") or name.endswith(".py"):
        return True
    return False


def iter_ship_files(root: Path | None = None):
    """Yield repo-relative POSIX paths for domestic static deploy."""
    base = root or ROOT
    seen: set[str] = set()

    for name in SHIP_FILES:
        p = base / name
        if p.is_file() and not should_skip(p):
            rel = p.relative_to(base).as_posix()
            if rel not in seen:
                seen.add(rel)
                yield rel

    for dname in SHIP_DIRS:
        d = base / dname
        if not d.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(d):
            dirnames[:] = [
                n for n in dirnames if n not in EXCLUDE_DIR_NAMES and not n.startswith(".")
            ]
            for fn in filenames:
                fp = Path(dirpath) / fn
                if should_skip(fp):
                    continue
                rel = fp.relative_to(base).as_posix()
                if rel not in seen:
                    seen.add(rel)
                    yield rel

    # 根目录微信/备案校验 txt
    for fp in base.glob("*.txt"):
        if should_skip(fp):
            continue
        if fp.name.lower().startswith("mp_verify") or "verify" in fp.name.lower():
            rel = fp.relative_to(base).as_posix()
            if rel not in seen:
                seen.add(rel)
                yield rel


def count_ship_files(root: Path | None = None) -> int:
    return sum(1 for _ in iter_ship_files(root))
