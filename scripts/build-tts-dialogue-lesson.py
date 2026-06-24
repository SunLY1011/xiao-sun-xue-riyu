# -*- coding: utf-8 -*-
"""按课生成会話/9–24 朗读 MP3（仅补缺）。用法：
  python scripts/build-tts-dialogue-lesson.py --lesson 13
  python scripts/build-tts-dialogue-lesson.py --from 13 --to 16
"""
from __future__ import annotations

import argparse
import asyncio
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tts_lib import (  # noqa: E402
    SKIP_FIELDS,
    SKIP_PREFIX,
    STRING_KEYS,
    field_name_before,
    fallback_lines_from_raw,
    list_mp3_keys,
    tts_key,
    write_registry,
)

OUT_DIRS = [ROOT / "tts-cache", ROOT / "发布包" / "tts-cache"]
VOICE = "ja-JP-NanamiNeural"
# 与 index.html 会話 ABC 一致（按课补缺时按 lessonId 过滤块）
DIALOGUE_ABC_BY_LESSON = [
    (1, 1, ROOT / "js" / "data" / "l1-dialogue-abc.js"),
    (2, 4, ROOT / "js" / "data" / "unit1-dialogue-abc-l234.js"),
    (5, 8, ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"),
    (9, 24, ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"),
]


def safe_print(msg: str) -> None:
    out = msg.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(
        sys.stdout.encoding or "utf-8", errors="replace"
    )
    try:
        print(out)
    except Exception:
        print(out.encode("ascii", errors="replace").decode("ascii"))


async def generate_one(jp: str, dest: Path) -> bool:
    try:
        import edge_tts
    except ImportError:
        print("请先运行: pip install edge-tts")
        sys.exit(1)
    communicate = edge_tts.Communicate(jp, VOICE)
    await communicate.save(str(dest))
    return dest.stat().st_size > 200


def lesson_chunk(text: str, lesson_id: int) -> str:
    start_m = re.search(rf"^\s*{lesson_id}\s*:\s*\{{", text, re.MULTILINE)
    if not start_m:
        return ""
    start = start_m.start()
    next_m = re.search(rf"^\s*{lesson_id + 1}\s*:\s*\{{", text[start + 1 :], re.MULTILINE)
    end = start + 1 + next_m.start() if next_m else len(text)
    return text[start:end]


def collect_lesson_phrases(lesson_from: int, lesson_to: int) -> dict[str, str]:
    req: dict[str, str] = {}
    for lo, hi, path in DIALOGUE_ABC_BY_LESSON:
        if lesson_to < lo or lesson_from > hi:
            continue
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for lid in range(max(lesson_from, lo), min(lesson_to, hi) + 1):
            chunk = lesson_chunk(text, lid)
            if not chunk:
                continue
            for m in STRING_KEYS.finditer(chunk):
                raw = m.group(1).replace('\\"', '"').strip()
                if SKIP_PREFIX.match(raw):
                    continue
                fname = field_name_before(chunk, m.start())
                if fname in SKIP_FIELDS:
                    continue
                for jp in fallback_lines_from_raw(raw):
                    if jp:
                        req[tts_key(jp)] = jp
    return req


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lesson", type=int, help="单课，如 13")
    ap.add_argument("--from", dest="from_lesson", type=int, default=9)
    ap.add_argument("--to", type=int, default=24)
    args = ap.parse_args()
    if args.lesson is not None:
        lo = hi = args.lesson
    else:
        lo, hi = args.from_lesson, args.to
    phrases = collect_lesson_phrases(lo, hi)
    mp3 = list_mp3_keys()
    todo = [(k, jp) for k, jp in sorted(phrases.items()) if k not in mp3]
    safe_print(f"lesson {lo}-{hi}: phrases={len(phrases)} missing={len(todo)}")
    if not todo:
        write_registry()
        return
    for out_dir in OUT_DIRS:
        out_dir.mkdir(parents=True, exist_ok=True)
    ok = fail = 0
    for i, (k, jp) in enumerate(todo, 1):
        dest = OUT_DIRS[0] / f"{k}.mp3"
        try:
            if await generate_one(jp, dest):
                ok += 1
                for out_dir in OUT_DIRS[1:]:
                    d = out_dir / f"{k}.mp3"
                    if not d.exists():
                        d.write_bytes(dest.read_bytes())
                safe_print(f"[{i}/{len(todo)}] OK {k} {jp[:40]}")
            else:
                fail += 1
                safe_print(f"[{i}/{len(todo)}] FAIL {k}")
        except Exception as e:
            fail += 1
            safe_print(f"[{i}/{len(todo)}] ERR {k} {e}")
    write_registry()
    safe_print(f"done ok={ok} fail={fail}")


if __name__ == "__main__":
    asyncio.run(main())
