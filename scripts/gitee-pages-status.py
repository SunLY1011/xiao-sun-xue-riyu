# -*- coding: utf-8 -*-
"""检查 Gitee 仓库 Pages 是否已开通、公网链接是否可访问。"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "docs" / "deploy-target.json"
SHARE = ROOT / "js" / "share-wechat.js"


def read_cache_ver() -> str:
    m = re.search(r'CACHE_VER\s*=\s*"(\d+)"', SHARE.read_text(encoding="utf-8"))
    return m.group(1) if m else "?"


def gitee_repo_meta(owner: str, repo: str) -> dict:
    url = f"https://gitee.com/api/v5/repos/{owner}/{repo}"
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.loads(r.read().decode("utf-8"))


def probe(url: str) -> int:
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except urllib.error.URLError:
        return 0


def main() -> int:
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    ch = data["channels"]["gitee"]
    owner = ch.get("giteeUser", "saivenwang-byte")
    repo = ch.get("repo", "xiao-wang-xue-riyu-v2")
    origin = ch.get("publicOrigin", "").rstrip("/")
    ver = read_cache_ver()
    learn = f"{origin}/index.html?v={ver}"

    print(f"[INFO] 仓库  {owner}/{repo}")
    print(f"[INFO] 学员链 {learn}")

    try:
        meta = gitee_repo_meta(owner, repo)
    except Exception as e:
        print(f"[FAIL] 无法读取 Gitee API：{e}")
        return 1

    has_page = meta.get("has_page")
    pushed = meta.get("pushed_at", "?")
    print(f"[INFO] has_page={has_page}  pushed_at={pushed}")

    code = probe(learn)
    print(f"[INFO] HTTP {code} → {learn}")

    if has_page and code == 200:
        print("[OK] Gitee Pages 已开通且链接可访问")
        return 0

    if not has_page:
        print("[BLOCK] Pages 未启动 → 双击 打开Gitee-Pages设置.bat")
    if code != 200:
        print("[BLOCK] 公网不可访问（404/未部署）→ 登录 Gitee 启动 Pages 后等 1～3 分钟")

    # 本地是否已推
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
        print(f"[INFO] 本地 HEAD {out[:8]}")
    except Exception:
        pass

    print("[HINT] 备份 GitHub：https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html?v=" + ver)
    return 1


if __name__ == "__main__":
    sys.exit(main())
