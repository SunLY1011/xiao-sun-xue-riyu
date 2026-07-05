#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
笔记联动 · 1+3：从 knowledge-tips DIALOGUE + ABC noteZh 写入 dialogueKeyPoints；
L5–24 grammarNodes.explanationZh 薄字段补全（笔记「课本/学霸」用）。

  python scripts/sync-notes-knowledge-linkage.py
  python scripts/sync-notes-knowledge-linkage.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

L1_TIPS = ROOT / "js" / "data" / "l1-knowledge-tips.js"

TIPS_SOURCES: list[tuple[int, int, Path]] = [
    (2, 4, ROOT / "js" / "data" / "unit1-knowledge-tips.js"),
    (5, 8, ROOT / "js" / "data" / "unit2-knowledge-tips.js"),
    (9, 24, ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js"),
]

ABC_L1 = ROOT / "js" / "data" / "l1-dialogue-abc.js"
ABC_U1 = ROOT / "js" / "data" / "unit1-dialogue-abc-l234.js"
ABC_U2 = ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js"
ABC_924 = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"

LESSON_RANGE = range(1, 25)


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def slice_js_object(text: str, marker: str) -> str:
    idx = text.find(marker)
    if idx < 0:
        return ""
    start = text.find("{", idx)
    if start < 0:
        return ""
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return ""


def extract_brace_block(text: str, start: int) -> str:
    if start < 0 or start >= len(text) or text[start] != "{":
        return ""
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return ""


def extract_js_object(text: str, marker: str) -> dict | list | None:
    blob = slice_js_object(text, marker)
    if not blob:
        return None
    blob = re.sub(r",(\s*[}\]])", r"\1", blob)
    blob = re.sub(r"(?m)^(\s*)(\d+)(\s*):", r'\1"\2"\3:', blob)
    try:
        return json.loads(blob)
    except json.JSONDecodeError:
        return None


def extract_js_array(text: str, marker: str) -> list | None:
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.find("[", idx)
    if start < 0:
        return None
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            continue
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                blob = text[start : i + 1]
                blob = re.sub(r",(\s*[}\]])", r"\1", blob)
                try:
                    return json.loads(blob)
                except json.JSONDecodeError:
                    return None
    return None


def load_dialogue_by_lesson(path: Path) -> dict[int, list]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    raw = extract_js_object(text, "const DIALOGUE_BY_LESSON")
    if not isinstance(raw, dict):
        return {}
    return {int(k): v for k, v in raw.items()}


def load_l1_dialogue() -> dict[int, list]:
    if not L1_TIPS.exists():
        return {}
    text = L1_TIPS.read_text(encoding="utf-8")
    arr = extract_js_array(text, "const DIALOGUE")
    if not isinstance(arr, list):
        return {}
    return {1: arr}


def parse_abc_keypoints_from_text(text: str) -> list[str]:
    points: list[str] = []
    seen: set[str] = set()

    def add(s: str) -> None:
        t = re.sub(r"\s+", " ", (s or "").strip())
        if not t or len(t) < 6 or t in seen:
            return
        seen.add(t)
        points.append(t)

    for m in re.finditer(
        r'abcGuideZh:\s*"((?:\\.|[^"\\])*)"',
        text,
    ):
        guide = m.group(1).replace('\\"', '"').strip()
        head = guide.split("·")[0].strip() if guide else ""
        if head and len(head) > 8:
            add(f"【场景】{head}")

    for m in re.finditer(
        r'label:\s*"([ABC])"[^}]*?japanese:\s*"((?:\\.|[^"\\])*)"[^}]*?noteZh:\s*"((?:\\.|[^"\\])*)"',
        text,
        re.S,
    ):
        label, jp, note = (
            m.group(1),
            m.group(2).replace('\\"', '"').strip(),
            m.group(3).replace('\\"', '"').strip(),
        )
        if label == "A" or not note or "课文原句" in note:
            continue
        add(f"「{jp}」（{label}轨）{note}")

    return points


def load_abc_by_lesson() -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}

    def merge(lid: int, pts: list[str]) -> None:
        if not pts:
            return
        out.setdefault(lid, []).extend(pts)

    if ABC_L1.exists():
        block = slice_js_object(ABC_L1.read_text(encoding="utf-8"), "const L1_DIALOGUE_ABC")
        if block:
            merge(1, parse_abc_keypoints_from_text(block))

    if ABC_U1.exists():
        u1 = ABC_U1.read_text(encoding="utf-8")
        for lid in (2, 3, 4):
            block = slice_js_object(u1, f"const L{lid}_DIALOGUE_ABC")
            if block:
                merge(lid, parse_abc_keypoints_from_text(block))

    if ABC_U2.exists():
        u2 = ABC_U2.read_text(encoding="utf-8")
        for lid in (5, 6, 7, 8):
            block = slice_js_object(u2, f"const L{lid}_DIALOGUE_ABC")
            if block:
                merge(lid, parse_abc_keypoints_from_text(block))

    if ABC_924.exists():
        t924 = ABC_924.read_text(encoding="utf-8")
        for lid in range(9, 25):
            m = re.search(rf"(?m)^\s*{lid}\s*:\s*\{{", t924)
            if not m:
                continue
            start = t924.find("{", m.start())
            block = extract_brace_block(t924, start)
            if block:
                merge(lid, parse_abc_keypoints_from_text(block))

    return out


def kcard_to_points(scenes: list) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add(s: str) -> None:
        t = re.sub(r"\s+", " ", (s or "").strip())
        if not t or t in seen:
            return
        seen.add(t)
        out.append(t)

    for scene in scenes or []:
        for line in scene.get("lines") or []:
            ja = (line.get("ja") or "").strip()
            zh = (line.get("zh") or "").strip()
            if not ja:
                if zh.startswith("场景「"):
                    add(zh.replace("·", "："))
                continue
            if not zh or re.match(r"^(发起句|应答)", zh):
                zh = "对照课文会話链朗读；ABC 三答见会話关。"
            add(f"「{ja}」：{zh}")
    return out


def _norm_key(s: str) -> str:
    t = re.sub(r"\s+", "", (s or ""))
    t = re.sub(r"[「」『』（）()【】\[\]：:，,。．.·]", "", t)
    return t[:48]


def merge_keypoints(existing: list[str], generated: list[str], cap: int = 56) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for p in existing or []:
        t = (p or "").strip()
        if not t:
            continue
        k = _norm_key(t)
        if k in seen:
            continue
        seen.add(k)
        out.append(t)
    for p in generated or []:
        t = (p or "").strip()
        if not t:
            continue
        k = _norm_key(t)
        if k in seen:
            continue
        seen.add(k)
        out.append(t)
        if len(out) >= cap:
            break
    return out[:cap]


def build_dialogue_keypoints(
    lid: int,
    dialogue_map: dict[int, list],
    abc_pts: list[str],
    existing: list[str] | None = None,
) -> list[str]:
    generated = kcard_to_points(dialogue_map.get(lid, []))
    seen = set(generated)
    for p in abc_pts:
        if p not in seen:
            generated.append(p)
            seen.add(p)
    return merge_keypoints(existing or [], generated)


def is_thin_explanation(zh: str, title_zh: str) -> bool:
    z = (zh or "").strip()
    t = (title_zh or "").strip()
    if not z:
        return True
    if z == t:
        return True
    if len(z) < 28 and "\n" not in z:
        return True
    if re.fullmatch(r"[～〜].+", z):
        return True
    return False


def enrich_explanation_zh(node: dict) -> str:
    zh = (node.get("explanationZh") or "").strip()
    title_zh = (node.get("titleZh") or node.get("title") or "").strip()
    if not is_thin_explanation(zh, title_zh):
        return zh

    parts: list[str] = []
    if title_zh and title_zh not in zh:
        parts.append(title_zh)
    expl = (node.get("explanation") or "").strip()
    if expl and expl not in title_zh and expl not in zh and not re.fullmatch(r"[～〜].+", expl):
        parts.append(f"句型：{expl}")
    exzh = node.get("exampleZh") or []
    if exzh and isinstance(exzh, list):
        first = str(exzh[0]).strip()
        if first:
            parts.append(f"例：{first}")
    links = node.get("links") or []
    cross = [
        str(l.get("label") or "").strip()
        for l in links
        if l.get("label") and re.search(r"第\s*\d+\s*课", str(l.get("label")))
    ][:3]
    if cross:
        parts.append("关联：" + "；".join(cross))
    if not parts:
        return zh or title_zh
    return "\n".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--from-lesson", type=int, default=1)
    ap.add_argument("--to-lesson", type=int, default=24)
    args = ap.parse_args()
    lo, hi = args.from_lesson, args.to_lesson

    dialogue_map: dict[int, list] = load_l1_dialogue()
    for _a, _b, path in TIPS_SOURCES:
        dialogue_map.update(load_dialogue_by_lesson(path))

    abc_by_lesson = load_abc_by_lesson()

    text, m, lessons = load_lessons()
    kp_count = 0
    gram_count = 0

    for les in lessons:
        lid = int(les.get("lessonId") or 0)
        if lid < lo or lid > hi:
            continue

        new_kp = build_dialogue_keypoints(
            lid,
            dialogue_map,
            abc_by_lesson.get(lid, []),
            les.get("dialogueKeyPoints") or [],
        )
        if new_kp:
            les["dialogueKeyPoints"] = new_kp
            kp_count += 1

        for node in les.get("grammarNodes") or []:
            old = (node.get("explanationZh") or "").strip()
            new = enrich_explanation_zh(node)
            if new and new != old:
                node["explanationZh"] = new
                gram_count += 1

    print(f"[INFO] lessons {lo}-{hi}: dialogueKeyPoints updated={kp_count} lessons")
    print(f"[INFO] grammarNodes.explanationZh enriched={gram_count} nodes")

    if args.dry_run:
        sample = next((x for x in lessons if x.get("lessonId") == 5), None)
        if sample:
            print("[SAMPLE L5 dialogueKeyPoints]", *sample.get("dialogueKeyPoints", [])[:4], sep="\n  ")
        return 0

    save_lessons(text, m, lessons)
    print(f"[OK] wrote {DATA.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
