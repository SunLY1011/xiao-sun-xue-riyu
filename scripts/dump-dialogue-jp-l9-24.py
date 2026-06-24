# -*- coding: utf-8 -*-
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
text = (ROOT / "js/data/lessons-data.js").read_text(encoding="utf-8")
lessons = {L["lessonId"]: L for L in json.loads(re.search(r"const LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S).group(1))}

def norm(s):
    return re.sub(r"\s+", " ", (s or "").strip())

seen = {}
for lid in range(9, 25):
    for d in lessons[lid].get("dialogues") or []:
        for key in ("opener",):
            jp = norm((d.get(key) or {}).get("japanese", ""))
            if jp:
                seen[jp] = lid
        for r in (d.get("userTurn") or {}).get("replies") or []:
            jp = norm(r.get("japanese", ""))
            if jp:
                seen[jp] = lid

for jp in sorted(seen.keys()):
    print(jp)
