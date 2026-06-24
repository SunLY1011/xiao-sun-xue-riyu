# -*- coding: utf-8 -*-
"""将 docs/deploy-target.json 的频道写入 public-url / share-wechat / 小程序 h5-url。"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET_JSON = ROOT / "docs" / "deploy-target.json"
PUBLIC = ROOT / "js" / "public-url.config.js"
SHARE = ROOT / "js" / "share-wechat.js"
MINIAPP = ROOT / "japanese_learning_miniapp" / "config" / "h5-url.js"


def load_target() -> dict:
    if not TARGET_JSON.is_file():
        raise SystemExit(f"[FAIL] 缺少 {TARGET_JSON.relative_to(ROOT)}")
    return json.loads(TARGET_JSON.read_text(encoding="utf-8"))


def save_target(data: dict) -> None:
    TARGET_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def read_cache_ver() -> str:
    text = SHARE.read_text(encoding="utf-8")
    m = re.search(r'CACHE_VER\s*=\s*"(\d+)"', text)
    if not m:
        raise SystemExit("[FAIL] 无法读取 js/share-wechat.js CACHE_VER")
    return m.group(1)


def resolve_channel(data: dict, channel: str, gitee_user: str, cos_domain: str) -> dict:
    ch = dict(data["channels"][channel])
    if channel == "gitee":
        user = (gitee_user or ch.get("giteeUser") or "").strip()
        repo = ch.get("repo", "XiaoWangXueRiyu")
        if user:
            ch["giteeUser"] = user
            ch["publicOrigin"] = f"https://{user}.gitee.io/{repo}"
        ch["ttsOrigin"] = ch.get("ttsOrigin") or ""
    elif channel == "cos":
        domain = (cos_domain or ch.get("publicOrigin") or "").strip().rstrip("/")
        if domain:
            ch["publicOrigin"] = domain
            ch["ttsOrigin"] = ch.get("ttsOrigin") or domain
    else:
        ch["ttsOrigin"] = ch.get("ttsOrigin") or ""
    return ch


def validate_channel(ch: dict, channel: str) -> None:
    origin = (ch.get("publicOrigin") or "").strip()
    if not origin or "REPLACE" in origin:
        raise SystemExit(
            f"[FAIL] 频道 {channel} 的 publicOrigin 未配置。"
            f"请编辑 docs/deploy-target.json 或用 --gitee-user / --cos-domain。"
        )
    if not origin.startswith("https://"):
        raise SystemExit(f"[FAIL] publicOrigin 须为 https:// 开头：{origin}")


def patch_public(origin: str, tts_origin: str, cache_ver: str) -> None:
    text = PUBLIC.read_text(encoding="utf-8")
    text = re.sub(
        r'window\.HYOUGA_PUBLIC_ORIGIN\s*=\s*"[^"]*";',
        f'window.HYOUGA_PUBLIC_ORIGIN = "{origin}";',
        text,
        count=1,
    )
    if tts_origin:
        tts_line = f'window.HYOUGA_TTS_ORIGIN =\n  "{tts_origin}";'
    else:
        tts_line = 'window.HYOUGA_TTS_ORIGIN = "";'
    text = re.sub(
        r"window\.HYOUGA_TTS_ORIGIN\s*=\s*(?:\n\s*)?\"[^\"]*\";",
        tts_line,
        text,
        count=1,
    )
    text = re.sub(
        r'window\.HYOUGA_TTS_CACHE_VER\s*=\s*"[^"]*";',
        f'window.HYOUGA_TTS_CACHE_VER = "{cache_ver}";',
        text,
        count=1,
    )
    PUBLIC.write_text(text, encoding="utf-8")


def patch_share(origin: str) -> None:
    text = SHARE.read_text(encoding="utf-8")
    text = re.sub(
        r'const OFFICIAL_ORIGIN\s*=\s*"[^"]*";',
        f'const OFFICIAL_ORIGIN = "{origin}";',
        text,
        count=1,
    )
    SHARE.write_text(text, encoding="utf-8")


def patch_miniapp(origin: str, cache_ver: str) -> None:
    if not MINIAPP.is_file():
        return
    text = MINIAPP.read_text(encoding="utf-8")
    text = re.sub(
        r'const CACHE_VER\s*=\s*"[^"]*";',
        f'const CACHE_VER = "{cache_ver}";',
        text,
        count=1,
    )
    text = re.sub(
        r'const ORIGIN\s*=\s*"[^"]*";',
        f'const ORIGIN = "{origin}";',
        text,
        count=1,
    )
    MINIAPP.write_text(text, encoding="utf-8")


def run_sync_manifest() -> None:
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "sync-tts-sw-manifest.py")],
        cwd=ROOT,
        check=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="应用 deploy-target 频道到仓库 JS 配置")
    ap.add_argument(
        "--channel",
        choices=("github", "gitee", "cos"),
        help="要激活的频道（默认读 deploy-target.json active）",
    )
    ap.add_argument("--gitee-user", help="Gitee 用户名，覆盖 deploy-target.json")
    ap.add_argument("--cos-domain", help="COS/CDN 正式域名，如 https://learn.example.com")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-save-active", action="store_true", help="不写入 active 字段")
    args = ap.parse_args()

    data = load_target()
    channel = args.channel or data.get("active", "github")
    if channel not in data.get("channels", {}):
        raise SystemExit(f"[FAIL] 未知频道: {channel}")

    ch = resolve_channel(data, channel, args.gitee_user or "", args.cos_domain or "")
    validate_channel(ch, channel)

    origin = ch["publicOrigin"].rstrip("/")
    tts = (ch.get("ttsOrigin") or "").strip().rstrip("/")
    cache_ver = read_cache_ver()

    print(f"[INFO] 频道={channel} ({ch.get('label', '')})")
    print(f"       HYOUGA_PUBLIC_ORIGIN = {origin}")
    print(f"       HYOUGA_TTS_ORIGIN      = {tts or '(同源)'}")
    print(f"       CACHE_VER              = {cache_ver}")

    if args.dry_run:
        print("[DRY-RUN] 未写入文件")
        return

    patch_public(origin, tts, cache_ver)
    patch_share(origin)
    patch_miniapp(origin, cache_ver)

    if not args.no_save_active:
        data["active"] = channel
        if channel == "gitee" and ch.get("giteeUser"):
            data["channels"]["gitee"]["giteeUser"] = ch["giteeUser"]
            data["channels"]["gitee"]["publicOrigin"] = origin
        if channel == "cos" and args.cos_domain:
            data["channels"]["cos"]["publicOrigin"] = origin
            data["channels"]["cos"]["ttsOrigin"] = tts or origin
        save_target(data)

    run_sync_manifest()
    print("[OK] 已写入 public-url.config.js / share-wechat.js / h5-url.js")
    print("[OK] 已同步 tts-cache/sw-manifest.json")
    if channel in ("gitee", "cos"):
        print("[NEXT] 上传整站静态资源后，微信 4G 验收首课语音")


if __name__ == "__main__":
    main()
