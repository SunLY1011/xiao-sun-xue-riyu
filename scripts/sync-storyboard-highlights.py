#!/usr/bin/env python3
"""条带 4 泡 + highlightBubbles 剩余课文高光（逐格补全）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
STORY = ROOT / "js" / "data" / "unit-strip-storyboard.js"
OVERRIDES = ROOT / "scripts" / "storyboard-highlight-overrides.json"

MANUAL_SCENE_CLOUD: dict[int, str] = {
    20: "可能 · ことができる · 〜前に",
    21: "経験 · たことがある · たあとで",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def load_overrides() -> dict[str, list[str]]:
    if not OVERRIDES.is_file():
        return {}
    return json.loads(OVERRIDES.read_text(encoding="utf-8"))


def gurumi_side(speaker: str) -> bool:
    return speaker in ("李", "李秀麗", "李さん")


def all_turns(dialogues: list) -> list[tuple[str, str, str]]:
    lines: list[tuple[str, str, str]] = []
    for d in dialogues:
        op = d.get("opener") or {}
        sp = (op.get("speaker") or "A").strip()
        jp = (op.get("japanese") or "").strip()
        zh = (op.get("chinese") or "").strip()
        if jp and not re.match(r"^[（(].*[）)]$", jp):
            lines.append((sp, jp, zh))
        ut = d.get("userTurn") or {}
        replies = ut.get("replies") or []
        if replies:
            r = replies[0]
            sp2 = (ut.get("speaker") or "B").strip()
            jp2 = (r.get("japanese") or r.get("jp") or "").strip()
            zh2 = (r.get("chinese") or r.get("zh") or "").strip()
            if jp2 and not re.match(r"^[（(].*[）)]$", jp2):
                lines.append((sp2, jp2, zh2))
    return lines


def sample_four_indices(n: int) -> set[int]:
    if n <= 4:
        return set(range(n))
    return {0, n // 3, (2 * n) // 3, n - 1}


def pick_highlights(
    turns: list[tuple[str, str, str]], strip_idx: set[int], override_jps: list[str]
) -> list[tuple[str, str, str]]:
    if override_jps:
        out: list[tuple[str, str, str]] = []
        jp_map = {jp: (sp, jp, zh) for sp, jp, zh in turns}
        for jp in override_jps:
            if jp in jp_map:
                out.append(jp_map[jp])
        return out[:8]
    rest = [t for i, t in enumerate(turns) if i not in strip_idx]
    if not rest:
        return []
    if len(rest) <= 6:
        return rest
    step = max(1, len(rest) // 6)
    return [rest[i] for i in range(0, len(rest), step)][:6]


def turns_to_bubbles(turns: list[tuple[str, str, str]]) -> list[dict]:
    out: list[dict] = []
    for sp, jp, zh in turns:
        side = "right" if gurumi_side(sp) else "left"
        role = "李" if gurumi_side(sp) else sp
        b: dict = {"role": role, "side": side, "jp": jp}
        if gurumi_side(sp):
            b["isGurumi"] = True
        if zh:
            b["zh"] = zh
        out.append(b)
    return out


def bubble_js_lines(bubbles: list[dict]) -> str:
    lines_js = []
    for b in bubbles:
        parts = [f'role: "{b["role"]}"', f'side: "{b["side"]}"']
        if b.get("isGurumi"):
            parts.append("isGurumi: true")
        parts.append(f'jp: "{b["jp"]}"')
        if b.get("zh"):
            parts.append(f'zh: "{b["zh"]}"')
        lines_js.append("          { " + ", ".join(parts) + " }")
    return ",\n".join(lines_js) + "\n        "


def patch_array(text: str, lid: int, field: str, bubbles: list[dict]) -> str:
    if not bubbles:
        return text
    pat = rf"(lessonId:\s*{lid},[\s\S]*?{field}:\s*\[)([\s\S]*?)(\],)"
    m = re.search(pat, text)
    if m:
        return text[: m.start(2)] + bubble_js_lines(bubbles) + text[m.end(2) :]
    insert_pat = rf"(lessonId:\s*{lid},[\s\S]*?bubbles:\s*\[[\s\S]*?\],)(\s*\n)"
    m2 = re.search(insert_pat, text)
    if not m2:
        return text
    block = (
        f"\n        highlightBubbles: [\n        {bubble_js_lines(bubbles)}],"
    )
    return text[: m2.end(1)] + block + text[m2.end(1) :]


def main() -> int:
    lessons = load_lessons()
    overrides = load_overrides()
    text = STORY.read_text(encoding="utf-8")
    text = re.sub(r"\n\s*highlightBubbles:\s*\[[\s\S]*?\],", "", text)
    n = 0
    for lid in range(1, 25):
        L = lessons.get(lid)
        if not L:
            continue
        turns = all_turns(L.get("dialogues") or [])
        if not turns:
            continue
        idx = sample_four_indices(len(turns))
        strip = turns_to_bubbles([turns[i] for i in sorted(idx)])
        hi_turns = pick_highlights(turns, idx, overrides.get(str(lid), overrides.get(f"l{lid}", [])))
        hi_bubbles = turns_to_bubbles(hi_turns)

        pat = rf"(lessonId:\s*{lid},[\s\S]*?bubbles:\s*\[)([\s\S]*?)(\],)"
        m = re.search(pat, text)
        if not m:
            print(f"[WARN] L{lid} bubbles not found")
            continue
        text = text[: m.start(2)] + bubble_js_lines(strip) + text[m.end(2) :]
        text = patch_array(text, lid, "highlightBubbles", hi_bubbles)
        n += 1
        print(f"[OK] L{lid} strip={len(strip)} highlight={len(hi_bubbles)} total_turns={len(turns)}")

    STORY.write_text(text, encoding="utf-8")
    print(f"Done: {n} panels -> {STORY}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
