# -*- coding: utf-8 -*-
"""生成若干缺失 MP3（语法例句等）"""
import asyncio
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tts-cache"
VOICE = "ja-JP-NanamiNeural"

PHRASES = [
    "なる",
    "寒くなりました。",
    "元気になりました。",
    "自然の変化",
    "部屋をきれいにします。",
    "さむくなる",
    "げんきになる",
    "しぜんのへんか",
    "あく",
    "あける",
    "携帯電話はとても小さくなりました。",
    "します",
    "なりました",
    "しました",
    "なっています",
    "もちましょうか",
    "ひろくて",
    "ひろい",
    "ひろく",
    "この部屋は広くて明るいです。",
]


def tts_key(jp: str) -> str:
    h = 0
    for ch in jp:
        h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
    return format(h, "x")


async def main() -> None:
    import edge_tts

    OUT.mkdir(exist_ok=True)
    for t in PHRASES:
        key = tts_key(t)
        dest = OUT / f"{key}.mp3"
        await edge_tts.Communicate(t, VOICE).save(str(dest))
        print(f"ok {key} {t} {dest.stat().st_size}")


if __name__ == "__main__":
    asyncio.run(main())
