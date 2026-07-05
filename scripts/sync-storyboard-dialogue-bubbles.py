#!/usr/bin/env python3
"""从 lessons-data.js 会話链提取泡，写回 unit-strip-storyboard.js（全文均匀抽样 4 泡 + headline 对齐课文）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
STORY = ROOT / "js" / "data" / "unit-strip-storyboard.js"

# 手修 sceneCloud（彩蛋/条带）· sync 只改 bubbles/headline
MANUAL_SCENE_CLOUD: dict[int, str] = {
    20: "可能 · ことができる · 〜前に",
    21: "経験 · たことがある · たあとで",
}


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def gurumi_side(speaker: str) -> bool:
    return speaker in ("李", "李秀麗", "李さん")


def all_turns(dialogues: list) -> list[tuple[str, str, str]]:
    """课文会話全链：每场景 opener + 标准答各 1 轮。"""
    lines: list[tuple[str, str, str]] = []
    for d in dialogues:
        op = d.get("opener") or {}
        sp = (op.get("speaker") or "A").strip()
        jp = (op.get("japanese") or "").strip()
        zh = (op.get("chinese") or "").strip()
        if jp:
            lines.append((sp, jp, zh))
        ut = d.get("userTurn") or {}
        replies = ut.get("replies") or []
        if replies:
            r = replies[0]
            sp2 = (ut.get("speaker") or "B").strip()
            jp2 = (r.get("japanese") or r.get("jp") or "").strip()
            zh2 = (r.get("chinese") or r.get("zh") or "").strip()
            if jp2:
                lines.append((sp2, jp2, zh2))
    return lines


def sample_four(turns: list[tuple[str, str, str]]) -> list[tuple[str, str, str]]:
    if not turns:
        return []
    if len(turns) <= 4:
        return turns
    n = len(turns)
    idxs = sorted({0, n // 3, (2 * n) // 3, n - 1})
    return [turns[i] for i in idxs]


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


def bubbles_from_lesson(L: dict) -> list[dict]:
    return turns_to_bubbles(sample_four(all_turns(L.get("dialogues") or [])))


def scene_cloud(L: dict) -> str:
    title = (L.get("lessonTitle") or "").strip()
    theme = (L.get("themeZh") or L.get("theme") or "").strip()
    ds = L.get("dialogues") or []
    tag = ""
    if ds:
        tag = (ds[0].get("title") or "").split("（")[0].strip()
    place = theme or "会話"
    if tag:
        return f"{place} · {tag}"
    return title[:24] if title else place


def patch_storyboard(lessons: dict[int, dict]) -> int:
    text = STORY.read_text(encoding="utf-8")
    n = 0
    for lid in range(1, 25):
        L = lessons.get(lid)
        if not L:
            continue
        bubbles = bubbles_from_lesson(L)
        if not bubbles:
            continue
        pat = rf"(lessonId:\s*{lid},[\s\S]*?bubbles:\s*\[)([\s\S]*?)(\],)"
        m = re.search(pat, text)
        if not m:
            print(f"[WARN] L{lid} panel not found")
            continue
        lines_js = []
        for b in bubbles:
            parts = [f'role: "{b["role"]}"', f'side: "{b["side"]}"']
            if b.get("isGurumi"):
                parts.append("isGurumi: true")
            parts.append(f'jp: "{b["jp"]}"')
            if b.get("zh"):
                parts.append(f'zh: "{b["zh"]}"')
            lines_js.append("          { " + ", ".join(parts) + " }")
        new_bubbles = ",\n".join(lines_js) + "\n        "
        text = text[: m.start(2)] + new_bubbles + text[m.end(2) :]

        headline = (L.get("lessonTitle") or "").strip()
        if headline:
            hp = rf"(lessonId:\s*{lid},[\s\S]*?headline:\s*\")([^\"]*)(\")"
            if re.search(hp, text):
                text = re.sub(hp, rf"\g<1>{headline}\g<3>", text, count=1)

        sc = MANUAL_SCENE_CLOUD.get(lid) or scene_cloud(L)
        sp = rf"(lessonId:\s*{lid},[\s\S]*?sceneCloud:\s*\")([^\"]*)(\")"
        if re.search(sp, text) and lid not in MANUAL_SCENE_CLOUD:
            text = re.sub(sp, rf"\g<1>{sc}\g<3>", text, count=1)

        n += 1
        print(f"[OK] L{lid} bubbles x{len(bubbles)} turns_total={len(all_turns(L.get('dialogues') or []))}")
    STORY.write_text(text, encoding="utf-8")
    return n


def main() -> None:
    lessons = load_lessons()
    n = patch_storyboard(lessons)
    print(f"Done: {n} panels -> {STORY}")


if __name__ == "__main__":
    main()
