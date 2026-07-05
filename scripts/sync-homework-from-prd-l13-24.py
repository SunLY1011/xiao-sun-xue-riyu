#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第13–24课 · 从 PRD【作业】同步 homeworkSections 正文（P0 深化）

- 同步段 1–6、8–9；段 7 保留 lessons-data 内「総合」块（与小测 Q12 一致）
- 每段加【本课课文】锚点（与 align-homework 一致）
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
PRD_ROOT = ROOT / "【产品PRD】" / "新增补课文内容"
LESSON_IDS = list(range(13, 25))

# 加载 BIAORI_ANCHOR / anchor_block
_align_path = ROOT / "scripts" / "align-homework-extension-biaori-l2-4.py"
_spec = importlib.util.spec_from_file_location("align_hw", _align_path)
_align = importlib.util.module_from_spec(_spec)
assert _spec.loader
_spec.loader.exec_module(_align)
anchor_block = _align.anchor_block
BIAORI_ANCHOR = _align.BIAORI_ANCHOR

SECTION_TITLES = {
    1: "発音練習",
    2: "活用ドリル",
    3: "選択問題",
    4: "穴埋め問題",
    5: "翻訳（日→中）",
    6: "翻訳（中→日）",
    8: "作文ミニタスク",
    9: "聴解問題（预留，需音频）",
}


def prd_path(lid: int) -> Path:
    unit = (lid - 1) // 4 + 1
    d = PRD_ROOT / f"第{unit}单元"
    for pat in (f"第{unit}单元{lid}课.txt", f"第{unit}单元第{lid:02d}课.txt"):
        p = d / pat
        if p.is_file():
            return p
    hits = list(d.glob(f"*{lid}*课.txt"))
    if len(hits) == 1:
        return hits[0]
    raise FileNotFoundError(f"PRD L{lid} not found under {d}")


def parse_prd_homework(body: str) -> dict[int, list[str]]:
    m = re.search(r"【作业】\s*\n(.*?)(?=\n【)", body, re.S)
    if not m:
        return {}
    chunks = re.split(r"\n(?=\d+\.\s)", m.group(1).strip())
    out: dict[int, list[str]] = {}
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        head_m = re.match(r"^(\d+)\.\s*(.+)$", chunk.splitlines()[0])
        if not head_m:
            continue
        num = int(head_m.group(1))
        if num == 7:
            continue
        lines = [ln.rstrip() for ln in chunk.splitlines()[1:] if ln.strip()]
        out[num] = lines
    return out


def hw_header(lid: int) -> str:
    focus = BIAORI_ANCHOR[lid]["grammar_focus"]
    return f"【本课课文】第{lid}课 · 语法：{focus}"


def build_sections(lid: int, prd_secs: dict[int, list[str]], existing: list) -> list[dict]:
    by_title = {s.get("title", ""): s for s in existing}
    sec7 = None
    for s in existing:
        t = s.get("title") or ""
        if "総合" in t or ("間違い" in t and "Q12" in " ".join(s.get("lines") or [])):
            sec7 = s
            break
    if not sec7:
        for s in existing:
            if "間違い" in (s.get("title") or "") or "総合" in (s.get("title") or ""):
                sec7 = s
                break

    result: list[dict] = []
    for num in range(1, 10):
        if num == 7:
            if sec7:
                lines = list(sec7.get("lines") or [])
                if lines and hw_header(lid) not in lines[0]:
                    lines = [hw_header(lid)] + [
                        ln for ln in lines if not ln.startswith("【本课课文】") and not ln.startswith("【题源】")
                    ]
                sec7 = {**sec7, "lines": lines}
                result.append(sec7)
            continue
        title = SECTION_TITLES.get(num)
        if not title:
            continue
        content = prd_secs.get(num)
        if not content:
            old = by_title.get(title) or next(
                (s for s in existing if title[:4] in (s.get("title") or "")), None
            )
            if old:
                result.append(old)
            continue
        lines = [hw_header(lid)] + content if num != 1 else anchor_block(lid) + content
        result.append({"title": title, "lines": lines})

    return result


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    text, m, lessons = load_lessons()
    n = 0
    for L in lessons:
        lid = L.get("lessonId")
        if lid not in LESSON_IDS:
            continue
        if lid not in BIAORI_ANCHOR:
            print(f"[WARN] L{lid} no BIAORI_ANCHOR")
            continue
        prd_body = prd_path(lid).read_text(encoding="utf-8")
        prd_secs = parse_prd_homework(prd_body)
        if not prd_secs:
            print(f"[WARN] L{lid} no 【作业】 in PRD")
            continue
        old = L.get("homeworkSections") or []
        L["homeworkSections"] = build_sections(lid, prd_secs, old)
        n += 1
    save_lessons(text, m, lessons)
    print(f"[OK] sync-homework-from-prd-l13-24: {n} lessons")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
