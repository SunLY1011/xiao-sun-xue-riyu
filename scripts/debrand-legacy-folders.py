#!/usr/bin/env python3
"""De-brand 标日 in legacy folders: 发布包, 手机微信版, mock."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRS = [ROOT / "发布包", ROOT / "手机微信版", ROOT / "mock"]

REPLACEMENTS = [
    ("标日闯关 · 14/16/18课", "日语初级课后练习"),
    ("标日闯关 · 第14/16/18课（知识地图+练习）", "日语初级课后练习（知识地图+练习）"),
    ("标日闯关 · 第14/16/18课", "日语初级课后练习"),
    ("标日闯关", "日语初级课后练习"),
    ("标日课后巩固 · 微信版", "日语初级课后练习 · 微信版"),
    ("标日课后巩固", "日语初级课后练习"),
    ("标日あと学習", "日语初级课后练习"),
    ("标日 あと学習", "日语初级课后练习"),
    ("標日 あと学習", "日语初级课后练习"),
    ("標日学習", "日语初级课后练习"),
    ("标日学习", "日语学习"),
    ("标日 · 手机微信版", "日语初级 · 手机微信版"),
    ("标日第14/16/18课", "初级上第14/16/18课"),
    ("标日本地服务", "日语本地服务"),
    ("顶多 标日学习", "顶多 日语学习"),
    ("打开首屏：标日学习", "打开首屏：日语学习"),
]


def main() -> None:
    for d in DIRS:
        if not d.is_dir():
            continue
        for path in d.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {
                ".html",
                ".js",
                ".json",
                ".txt",
                ".bat",
                ".md",
                ".css",
            }:
                continue
            try:
                raw = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            new = raw
            for old, rep in REPLACEMENTS:
                new = new.replace(old, rep)
            if new != raw:
                path.write_text(new, encoding="utf-8")
                print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
