#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VER = "410"
for rel in ["index.html", "intro.html", "share.html", "js/share-wechat.js", "js/public-url.config.js", "docs/链接转发.md"]:
    p = ROOT / rel
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8")
    t = re.sub(r"\?v=\d+", f"?v={VER}", t)
    t = re.sub(r'CACHE_BOOT = "\d+"', f'CACHE_BOOT = "{VER}"', t)
    t = re.sub(r'CACHE_VER = "\d+"', f'CACHE_VER = "{VER}"', t)
    t = re.sub(
        r'window\.HYOUGA_TTS_CACHE_VER\s*=\s*"[^"]*";',
        f'window.HYOUGA_TTS_CACHE_VER = "{VER}";',
        t,
    )
    p.write_text(t, encoding="utf-8")
print(f"[OK] cache bump v={VER}")
