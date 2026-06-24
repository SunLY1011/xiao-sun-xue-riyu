# -*- coding: utf-8 -*-
"""
语音包编号对账（发布前必跑）

  喇叭侧：每条需朗读的日文 → 编号 key（= data-tts-key = tts-cache 文件名）
  语音包：tts-cache/{key}.mp3

  要求：requiredCount 条需求 = 均有 MP3；mp3FileCount 可多（历史遗留）但 missing 必须为 0。

  python scripts/audit-tts-registry.py
  python scripts/audit-tts-registry.py --write   # 更新 docs/tts-registry.json
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tts_lib import (  # noqa: E402
    CACHE_DIR,
    collect_requirements,
    write_registry,
)

TINY = 800
HUGE = 120_000


def safe_print(msg: str) -> None:
    sys.stdout.buffer.write((msg + "\n").encode("utf-8", errors="replace"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="写入 docs/tts-registry.json")
    parser.add_argument(
        "--full",
        action="store_true",
        help="含 scenarios / 发布包（默认仅 MVP index 加载的数据）",
    )
    args = parser.parse_args()

    if not CACHE_DIR.is_dir():
        safe_print("ERROR: tts-cache/ 不存在，请先运行 生成语音包.bat")
        return 1

    req_map = collect_requirements(full_repo=args.full)
    from tts_lib import build_registry, list_mp3_keys, write_registry

    if args.write:
        write_registry(full_repo=args.full)

    report = build_registry(req_map, full_repo=args.full)
    mp3_keys = list_mp3_keys()
    required = set(req_map.keys())
    missing_keys = sorted(required - mp3_keys)
    orphan_keys = sorted(mp3_keys - required)

    tiny = []
    huge = []
    for key in sorted(required):
        f = CACHE_DIR / f"{key}.mp3"
        if not f.exists():
            continue
        sz = f.stat().st_size
        if sz < TINY:
            tiny.append((key, sz, req_map[key].line[:50]))
        if sz > HUGE:
            huge.append((key, sz, req_map[key].line[:50]))

    safe_print("=== TTS 语音包编号对账 ===")
    safe_print(f"需朗读（喇叭）  {len(required)} 条  ← 每条对应 key = data-tts-key")
    safe_print(f"tts-cache MP3  {len(mp3_keys)} 个文件")
    safe_print(f"缺失 MP3      {len(missing_keys)}")
    safe_print(f"多余 MP3      {len(orphan_keys)}（未在扫描表中出现，可保留）")

    if len(required) == len(mp3_keys) and not missing_keys and not orphan_keys:
        safe_print("\n[OK] 数量一致且无缺失：喇叭侧与语音包一一对应")
    elif not missing_keys:
        safe_print("\n[OK] 无缺失；MP3 数量与需求不完全相等（有多余历史文件无妨）")
    else:
        safe_print("\n[FAIL] 有缺失，请运行: python scripts/build-tts-cache.py")

    if missing_keys:
        safe_print(f"\n[MISS] 缺 MP3（前 30 条，seq 见 docs/tts-registry.json）:")
        for i, key in enumerate(missing_keys[:30], 1):
            r = req_map[key]
            safe_print(f"  #{i:04d} key={key}  {r.line[:55]}")
            safe_print(f"         来源: {r.sources[0]}")

    if orphan_keys and len(orphan_keys) <= 30:
        safe_print(f"\n[ORPHAN] 多余 MP3 {len(orphan_keys)} 个（示例）:")
        for key in orphan_keys[:15]:
            safe_print(f"  {key}.mp3")
    elif orphan_keys:
        safe_print(f"\n[INFO] 多余 MP3 {len(orphan_keys)} 个（历史/旧文案，不影响播放）")

    if report.get("collisionGroups"):
        safe_print(f"\n[WARN] 哈希冲突 {len(report['collisionGroups'])} 组（不同句同 key）")

    if tiny:
        safe_print(f"\n[WARN] 过小文件 {len(tiny)}:")
        for key, sz, line in tiny[:8]:
            safe_print(f"  {key} ({sz}B) ← {line}")

    if huge:
        safe_print(f"\n[WARN] 过大文件 {len(huge)}:")
        for key, sz, line in huge[:5]:
            safe_print(f"  {key} ({sz}B) ← {line}")

    if args.write:
        safe_print(f"\n已写入 docs/tts-registry.json（共 {len(required)} 条）")

    return 1 if missing_keys else 0


if __name__ == "__main__":
    sys.exit(main())
