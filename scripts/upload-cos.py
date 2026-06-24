# -*- coding: utf-8 -*-
"""上传学员 H5 静态资源到腾讯云 COS（国内正式 B 路径）。"""
from __future__ import annotations

import argparse
import json
import mimetypes
import sys
from pathlib import Path

import importlib.util

ROOT = Path(__file__).resolve().parents[1]
TARGET_JSON = ROOT / "docs" / "deploy-target.json"
SECRETS = ROOT / "docs" / "deploy-secrets.local.json"

_spec = importlib.util.spec_from_file_location(
    "domestic_ship_files",
    ROOT / "scripts" / "domestic-ship-files.py",
)
_domestic = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_domestic)
iter_ship_files = _domestic.iter_ship_files
count_ship_files = _domestic.count_ship_files


def load_json(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(f"[FAIL] 缺少 {path.relative_to(ROOT)}")
    return json.loads(path.read_text(encoding="utf-8"))


def guess_content_type(rel: str) -> str:
    ct, _ = mimetypes.guess_type(rel)
    if ct:
        return ct
    if rel.endswith(".js"):
        return "application/javascript; charset=utf-8"
    if rel.endswith(".css"):
        return "text/css; charset=utf-8"
    if rel.endswith(".html"):
        return "text/html; charset=utf-8"
    if rel.endswith(".json"):
        return "application/json; charset=utf-8"
    if rel.endswith(".mp3"):
        return "audio/mpeg"
    return "application/octet-stream"


def upload_with_sdk(
    bucket: str,
    region: str,
    prefix: str,
    secret_id: str,
    secret_key: str,
    dry_run: bool,
    limit: int | None,
) -> tuple[int, int]:
    try:
        from qcloud_cos import CosConfig, CosS3Client  # type: ignore
    except ImportError:
        raise SystemExit(
            "[FAIL] 未安装 cos-python-sdk-v5。请运行：\n"
            "  pip install cos-python-sdk-v5"
        )

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    client = CosS3Client(config)
    prefix = prefix.strip("/")
    ok = fail = 0

    for i, rel in enumerate(iter_ship_files()):
        if limit is not None and i >= limit:
            break
        key = f"{prefix}/{rel}" if prefix else rel
        local = ROOT / rel.replace("/", "\\") if "\\" in str(ROOT) else ROOT / rel
        if not local.is_file():
            print(f"[SKIP] 不存在 {rel}")
            continue
        if dry_run:
            print(f"[DRY] {rel} -> cos://{bucket}/{key}")
            ok += 1
            continue
        try:
            with open(local, "rb") as fp:
                client.put_object(
                    Bucket=bucket,
                    Body=fp,
                    Key=key,
                    ContentType=guess_content_type(rel),
                )
            ok += 1
            if ok % 200 == 0:
                print(f"[OK] 已上传 {ok} 个文件…")
        except Exception as exc:  # noqa: BLE001
            fail += 1
            print(f"[FAIL] {rel}: {exc}")
    return ok, fail


def main() -> None:
    ap = argparse.ArgumentParser(description="上传国内发行静态资源到腾讯云 COS")
    ap.add_argument("--dry-run", action="store_true", help="只列出将上传的文件")
    ap.add_argument("--limit", type=int, default=None, help="最多上传 N 个（调试）")
    ap.add_argument("--count-only", action="store_true", help="只统计文件数")
    args = ap.parse_args()

    total = count_ship_files()
    print(f"[INFO] 国内发行清单共 {total} 个文件")

    if args.count_only:
        return

    data = load_json(TARGET_JSON)
    cos_ch = data.get("channels", {}).get("cos", {})
    bucket = (cos_ch.get("bucket") or "").strip()
    region = (cos_ch.get("region") or "ap-guangzhou").strip()
    prefix = (cos_ch.get("prefix") or "").strip().strip("/")

    if "REPLACE" in bucket:
        raise SystemExit(
            "[FAIL] 请先在 docs/deploy-target.json 填写 cos.bucket（桶名-APPID）"
        )

    if args.dry_run:
        upload_with_sdk(bucket, region, prefix, "", "", True, args.limit)
        print(f"[DRY-RUN] 将上传至多 {args.limit or total} 个文件到 {bucket}")
        return

    if not SECRETS.is_file():
        raise SystemExit(
            f"[FAIL] 复制 docs/deploy-secrets.example.json 为\n"
            f"       docs/deploy-secrets.local.json 并填入 SecretId/SecretKey"
        )
    sec = load_json(SECRETS)
    sid = (sec.get("cosSecretId") or "").strip()
    sk = (sec.get("cosSecretKey") or "").strip()
    if not sid or not sk or "复制" in sid:
        raise SystemExit("[FAIL] deploy-secrets.local.json 中 SecretId/SecretKey 未填写")

    ok, fail = upload_with_sdk(bucket, region, prefix, sid, sk, False, args.limit)
    print(f"[DONE] 成功 {ok}，失败 {fail}")
    if fail:
        raise SystemExit(1)
    print(
        "[NEXT] CDN 刷新 index.html、sw.js、js/public-url.config.js；"
        "运行 python scripts/apply-deploy-target.py --channel cos"
    )


if __name__ == "__main__":
    main()
