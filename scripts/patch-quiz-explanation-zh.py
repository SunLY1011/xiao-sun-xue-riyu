#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P1 · 为 lessons-data 课内小测补 explanationZh（L2–24 批量；L1 已有专表则跳过）

优先用 homeworkSections 里 Qn → 行；其次文法节点 titleZh / explanationZh 首句。
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

_Q_NUM = re.compile(r"_q(\d+)$", re.I)
_Q_LINE = re.compile(r"^Q(\d+)[：:]")
_ARROW = re.compile(r"^→\s*(.+)$")
_CHOICE_ARROW = re.compile(
    r"^([A-D])(?:[\.．、])?\s*(?:（([^）]+)）|\(([^)]+)\))?\s*$"
)
_BLANK = re.compile(r"[＿_]+")
_JA = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
_ZH = re.compile(r"[\u4e00-\u9fff]")
_CHOICE_SPLIT = re.compile(r"(?:^|[\s　]+)([B-D])[\.．、]\s*")


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def grammar_index(L: dict) -> dict[str, dict]:
    return {g["id"]: g for g in (L.get("grammarNodes") or []) if g.get("id")}


def grammar_hint(g: dict | None, max_len: int = 72) -> str:
    if not g:
        return ""
    title = (g.get("titleZh") or g.get("title") or "").strip()
    raw = g.get("explanationZh") or ""
    if isinstance(raw, list):
        body = " ".join(str(x) for x in raw if x)
    else:
        body = str(raw).strip()
    lines = [ln.strip() for ln in body.split("\n") if ln.strip()] if body else []
    first = lines[0] if lines else ""
    if title and first:
        if first == title or first in title or title in first:
            second = lines[1] if len(lines) > 1 else ""
            s = f"{title}：{second}" if second else title
        else:
            s = f"{title}：{first}"
    elif title:
        s = title
    else:
        s = first
    if len(s) > max_len:
        s = s[: max_len - 1] + "…"
    return s


def parse_homework_hints(L: dict) -> dict[int, str]:
    """Q 序号 → homework「→」行解析出的提示（含括号内中文）。"""
    hints: dict[int, str] = {}
    current_q: int | None = None
    for sec in L.get("homeworkSections") or []:
        for line in sec.get("lines") or []:
            if not isinstance(line, str):
                continue
            s = line.strip()
            mq = _Q_LINE.match(s)
            if mq:
                current_q = int(mq.group(1))
                continue
            ma = _ARROW.match(s)
            if not ma or current_q is None:
                continue
            tail = ma.group(1).strip()
            mc = _CHOICE_ARROW.match(tail)
            if mc:
                letter = mc.group(1)
                note = (mc.group(2) or mc.group(3) or "").strip()
                if note:
                    hints[current_q] = note
                else:
                    hints[current_q] = f"选 {letter}"
            else:
                hints[current_q] = tail
    return hints


def parse_choice_options(options) -> list[str]:
    if isinstance(options, list):
        s = options[0] if len(options) == 1 else " ".join(str(x) for x in options)
    else:
        s = str(options or "")
    s = s.strip()
    if not s:
        return []
    parts = _CHOICE_SPLIT.split(s)
    out: list[str] = []
    if parts and parts[0] and not re.match(r"^[B-D]$", parts[0]):
        out.append(parts[0].strip())
    i = 1
    while i < len(parts):
        if i + 1 < len(parts):
            out.append(parts[i + 1].strip())
            i += 2
        else:
            i += 1
    if not out:
        out = [p.strip() for p in re.split(r"[　\s]+", s) if p.strip()]
    return out


def is_chinese_answer(ans: str) -> bool:
    return bool(ans) and bool(_ZH.search(ans)) and not _JA.search(ans.replace("JC", ""))


def fill_hint(q: dict, hw: str, g: dict | None) -> str:
    ans = str(q.get("answer") or "").strip()
    gh = grammar_hint(g, 56)
    if hw and hw not in ("A", "B", "C", "D") and len(hw) > 1:
        if _ZH.search(hw):
            return f"{hw}。{gh}" if gh else hw
        if _JA.search(hw):
            return f"应填「{hw}」。{gh}" if gh else f"应填「{hw}」。"
        return f"{hw}。{gh}" if gh else hw
    if is_chinese_answer(ans):
        return f"参考译文：{ans}。{gh}" if gh else f"参考译文：{ans}。"
    if ans:
        return f"空格里填「{ans}」。{gh}" if gh else f"空格里填「{ans}」。"
    return gh or "对照本课作業区同题。"


def choice_hint(q: dict, hw: str, g: dict | None) -> str:
    opts = parse_choice_options(q.get("options"))
    idx = q.get("answer")
    if isinstance(idx, (int, float)) and opts and 0 <= int(idx) < len(opts):
        correct = opts[int(idx)].strip()
    else:
        correct = ""
    question = q.get("question") or ""

    if hw and re.match(r"^选\s*[A-D]$", hw) and correct:
        base = f"选「{correct}」"
    elif hw and len(hw) > 1 and hw not in ("A", "B", "C", "D"):
        base = hw
    elif correct:
        base = f"选「{correct}」"
    else:
        base = "见本课语法要点"

    if "【综合】" in question or "综合" in question:
        if correct:
            return f"综合题：正确项为「{correct}」。{grammar_hint(g, 52)}"
        return grammar_hint(g) or "综合题：对照本课四个文法点。"

    if hw and (len(hw) >= 10 or "「" in hw):
        return hw
    if hw and len(hw) >= 2:
        short = (g.get("titleZh") or "").strip() if g else ""
        if short and short not in hw:
            return f"{hw}。{short}"
        return hw

    gh = grammar_hint(g, 52)
    if gh and base:
        return f"{base}。{gh}"
    return base or gh or "对照本课文法节点。"


def build_explanation(q: dict, hw_hints: dict[int, str], grams: dict[str, dict]) -> str:
    m = _Q_NUM.search(q.get("id") or "")
    qn = int(m.group(1)) if m else 0
    hw = hw_hints.get(qn, "").strip()
    gid = q.get("grammarNodeId") or ""
    g = grams.get(gid)

    if q.get("type") == "choice":
        return choice_hint(q, hw, g)
    return fill_hint(q, hw, g)


def patch_lesson(L: dict, min_lesson: int = 2, redo: bool = False) -> int:
    lid = L.get("lessonId") or 0
    if lid < min_lesson:
        return 0
    hw_hints = parse_homework_hints(L)
    grams = grammar_index(L)
    n = 0
    for q in L.get("quizQuestions") or []:
        if not redo and (q.get("explanationZh") or q.get("explanation") or "").strip():
            continue
        zh = build_explanation(q, hw_hints, grams).strip()
        if not zh:
            continue
        q["explanationZh"] = zh
        n += 1
    return n


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--redo", action="store_true", help="重写 L2–24 已有 explanationZh")
    ap.add_argument("--from", dest="from_id", type=int, default=2)
    args = ap.parse_args()

    text, m, lessons = load_lessons()
    total = 0
    by_lesson: list[str] = []
    for L in lessons:
        lid = L.get("lessonId") or 0
        if lid < args.from_id:
            continue
        n = patch_lesson(L, min_lesson=args.from_id, redo=args.redo)
        if n:
            by_lesson.append(f"L{lid}:{n}")
            total += n
    save_lessons(text, m, lessons)

    # 统计剩余空缺
    remain = 0
    for L in lessons:
        for q in L.get("quizQuestions") or []:
            if not (q.get("explanationZh") or q.get("explanation") or "").strip():
                remain += 1

    print(f"[OK] patch-quiz-explanation-zh: added {total} · {', '.join(by_lesson[:12])}")
    if len(by_lesson) > 12:
        print(f"     … +{len(by_lesson) - 12} lessons")
    print(f"[OK] quiz still missing explanation: {remain}")
    return 0 if remain == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
