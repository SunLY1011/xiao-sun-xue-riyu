#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""标日 PRD 单词表解析 · lessons-data 对账共用库（批次 E）"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRD_ROOT = ROOT / "【产品PRD】" / "新增补课文内容"
DATA = ROOT / "js" / "data" / "lessons-data.js"

_UI_FILTER_JP = re.compile(r"形$|ください$|ましょう")


def parse_prd_vocab(text: str) -> list[dict]:
    """PRD 【单词】段 · 仮名/漢字/声調/品詞/中国語"""
    rows: list[dict] = []
    in_vocab = False
    for line in text.splitlines():
        s = line.strip()
        if s == "【单词】":
            in_vocab = True
            continue
        if in_vocab and s.startswith("【"):
            break
        if not in_vocab or not s or s.startswith("仮名"):
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        rows.append(
            {
                "kana": parts[0].strip().replace("〜", "～"),
                "jp": parts[1].strip().replace("〜", "～"),
                "pitch": parts[2].strip(),
                "pos": parts[3].strip(),
                "meaningZh": parts[4].strip(),
            }
        )
    return rows


def lesson_id_from_prd_stem(stem: str) -> int | None:
    # 第1单元第02课 → 2；第4单元13课 → 13
    m = re.search(r"第0*(\d+)课$", stem)
    if m:
        return int(m.group(1))
    m = re.search(r"单元0*(\d+)课", stem)
    if m:
        return int(m.group(1))
    nums = re.findall(r"第0*(\d+)课", stem)
    if nums:
        return int(nums[-1])
    return None


def build_prd_index() -> dict[int, Path]:
    idx: dict[int, Path] = {}
    if not PRD_ROOT.is_dir():
        return idx
    for p in PRD_ROOT.rglob("*.txt"):
        lid = lesson_id_from_prd_stem(p.stem)
        if lid is None or lid < 1 or lid > 24:
            continue
        if lid not in idx or len(p.name) > len(idx[lid].name):
            idx[lid] = p
    return idx


def load_all_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise FileNotFoundError("LESSONS_MVP not found in lessons-data.js")
    return {L["lessonId"]: L for L in json.loads(m.group(1)) if L.get("lessonId")}


def vocab_from_lesson(L: dict) -> list[dict]:
    rows: list[dict] = []
    for v in L.get("vocab") or []:
        rows.append(
            {
                "id": v.get("id") or "",
                "jp": (v.get("jp") or "").replace("〜", "～"),
                "kana": (v.get("kana") or "").replace("〜", "～"),
                "pitch": v.get("pitch") or "",
                "pos": v.get("pos") or "",
                "meaningZh": v.get("meaningZh") or "",
                "from": v.get("from") or "",
            }
        )
    return rows


def ui_filter(v: dict) -> bool:
    jp = v.get("jp") or ""
    return v.get("from") != "grammar" and not _UI_FILTER_JP.search(jp)


def vocab_match_keys(row: dict) -> set[str]:
    """对账主键：读音 + 表记（PRD 仮名/漢字 列可能与 data jp/kana 对调）"""
    keys: set[str] = set()
    for field in ("kana", "jp"):
        val = (row.get(field) or "").strip()
        if val:
            keys.add(val)
            keys.add(val.split("／")[0].split("/")[0].strip())
    return keys


def compare_vocab(prd_rows: list[dict], data_rows: list[dict]) -> dict:
    shown = [v for v in data_rows if ui_filter(v)]
    prd_keys = [vocab_match_keys(r) for r in prd_rows]
    data_keys = [vocab_match_keys(v) for v in data_rows]

    def row_match(i: int) -> bool:
        if i >= len(prd_keys) or i >= len(data_keys):
            return False
        return bool(prd_keys[i] & data_keys[i])

    order_ok = len(prd_rows) == len(data_rows) and all(
        row_match(i) for i in range(len(prd_rows))
    )

    prd_union: set[str] = set()
    for k in prd_keys:
        prd_union |= k
    data_union: set[str] = set()
    for k in data_keys:
        data_union |= k

    only_prd = sorted(prd_union - data_union)
    only_data = sorted(data_union - prd_union)

    set_ok = not only_prd and not only_data
    count_ok = len(prd_rows) == len(data_rows)
    ui_ok = len(shown) == len([v for v in data_rows if ui_filter(v)])

    return {
        "prd_n": len(prd_rows),
        "data_n": len(data_rows),
        "shown_n": len(shown),
        "order_ok": order_ok,
        "set_ok": set_ok,
        "count_ok": count_ok,
        "only_prd": only_prd,
        "only_data": only_data,
        "pass": count_ok and set_ok and order_ok,
    }


def lesson_metrics(L: dict) -> dict:
    quiz = L.get("quizQuestions") or []
    return {
        "grammar": len(L.get("grammarNodes") or []),
        "dialogues": len(L.get("dialogues") or []),
        "quiz": len(quiz),
        "quiz_no_expl": sum(
            1
            for q in quiz
            if not (q.get("explanationZh") or q.get("explanation") or "").strip()
        ),
        "homework": len(L.get("homeworkSections") or []),
        "rext": len(L.get("reviewExtension") or []),
        "links_empty": sum(
            1 for g in (L.get("grammarNodes") or []) if not (g.get("links") or [])
        ),
    }


def audit_lesson(lid: int, prd_path: Path | None, L: dict | None) -> dict:
    if L is None:
        return {"lessonId": lid, "status": "NO_DATA", "prd_path": prd_path}
    if prd_path is None or not prd_path.is_file():
        return {
            "lessonId": lid,
            "title": L.get("lessonTitle", ""),
            "status": "NO_PRD",
            "metrics": lesson_metrics(L),
        }
    prd_rows = parse_prd_vocab(prd_path.read_text(encoding="utf-8"))
    data_rows = vocab_from_lesson(L)
    cmp = compare_vocab(prd_rows, data_rows)
    try:
        rel = prd_path.relative_to(ROOT).as_posix()
    except ValueError:
        rel = str(prd_path)
    return {
        "lessonId": lid,
        "title": L.get("lessonTitle", ""),
        "prd_path": rel,
        "status": "PASS" if cmp["pass"] else "FAIL",
        "cmp": cmp,
        "metrics": lesson_metrics(L),
    }


def audit_lessons_range(lo: int = 1, hi: int = 24) -> list[dict]:
    if lo > hi:
        lo, hi = hi, lo
    prd_idx = build_prd_index()
    lessons = load_all_lessons()
    return [
        audit_lesson(lid, prd_idx.get(lid), lessons.get(lid))
        for lid in range(lo, hi + 1)
    ]
