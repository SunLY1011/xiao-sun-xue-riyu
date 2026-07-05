# -*- coding: utf-8 -*-
"""
生成嵌入日语语音包：edge-tts ja-JP-NanamiNeural → tts-cache/*.mp3
运行：pip install edge-tts && python scripts/build-tts-cache.py

输出目录（同时写入）：
  - tts-cache/          ← MVP 主站 index.html 使用
  - 发布包/tts-cache/   ← U 盘 / 发布包
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tts_lib import collect_requirements, tts_key, write_registry  # noqa: E402

OUT_DIRS = [ROOT / "tts-cache", ROOT / "发布包" / "tts-cache"]
VOICE = "ja-JP-NanamiNeural"
APP_BUILD = 48
DEFAULT_WORKERS = 8


def collect_phrases() -> set[str]:
    req = collect_requirements()
    return {r.line for r in req.values()}


async def generate_one(jp: str, dest: Path) -> bool:
    import edge_tts

    communicate = edge_tts.Communicate(jp, VOICE)
    await communicate.save(str(dest))
    return dest.stat().st_size > 200


def safe_print(msg: str) -> None:
    out = msg.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(
        sys.stdout.encoding or "utf-8", errors="replace"
    )
    try:
        print(out)
    except Exception:
        print(out.encode("ascii", errors="replace").decode("ascii"))


def copy_to_publish(primary: Path, key: str) -> None:
    for out_dir in OUT_DIRS[1:]:
        dest = out_dir / f"{key}.mp3"
        if not dest.exists():
            dest.write_bytes(primary.read_bytes())


async def process_phrase(
    sem: asyncio.Semaphore,
    i: int,
    total: int,
    jp: str,
    counters: dict[str, int],
) -> str:
    k = tts_key(jp)
    primary = OUT_DIRS[0] / f"{k}.mp3"
    if primary.exists() and primary.stat().st_size > 200:
        copy_to_publish(primary, k)
        counters["skip"] += 1
        return k
    async with sem:
        try:
            if await generate_one(jp, primary):
                copy_to_publish(primary, k)
                counters["ok"] += 1
                if counters["ok"] % 25 == 0 or i <= 5:
                    safe_print(f"[{i}/{total}] OK {k} {jp[:40]}")
            else:
                counters["fail"] += 1
                safe_print(f"[{i}/{total}] FAIL {k}")
        except Exception as e:
            counters["fail"] += 1
            safe_print(f"[{i}/{total}] ERR {k} {e!r}")
    return k


async def main(workers: int) -> None:
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        print("请先运行: pip install edge-tts")
        sys.exit(1)

    phrases = sorted(collect_phrases())
    safe_print(f"phrases={len(phrases)} voice={VOICE} workers={workers}")

    for out_dir in OUT_DIRS:
        out_dir.mkdir(parents=True, exist_ok=True)

    sem = asyncio.Semaphore(max(1, workers))
    counters = {"ok": 0, "skip": 0, "fail": 0}
    keys: list[str] = []
    batch_size = 64
    for start in range(0, len(phrases), batch_size):
        chunk = phrases[start : start + batch_size]
        batch_tasks = [
            process_phrase(sem, start + j + 1, len(phrases), jp, counters)
            for j, jp in enumerate(chunk)
        ]
        keys.extend(await asyncio.gather(*batch_tasks))
        safe_print(
            f"... progress {min(start + batch_size, len(phrases))}/{len(phrases)} "
            f"new={counters['ok']} skip={counters['skip']} fail={counters['fail']}"
        )

    write_registry()
    manifest = {
        "version": APP_BUILD,
        "voice": VOICE,
        "engine": "edge-tts",
        "count": len(keys),
        "keys": keys,
        "note": "编号对账见 docs/tts-registry.json；key=ttsCacheKey=data-tts-key",
    }
    for out_dir in OUT_DIRS:
        (out_dir / "index.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    safe_print(f"DONE new={counters['ok']} skip={counters['skip']} fail={counters['fail']}")
    safe_print(str(OUT_DIRS[0]))
    safe_print("registry: docs/tts-registry.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    args = parser.parse_args()
    asyncio.run(main(args.workers))
