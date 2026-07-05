# -*- coding: utf-8 -*-
"""从 PRD 【作业】区解析 Q1–11（Q12 保留 lessons-data 综合题）"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRD_ROOT = ROOT / "【产品PRD】/新增补课文内容"

PRD_BY_LESSON: dict[int, Path] = {
    13: PRD_ROOT / "第4单元/第4单元13课.txt",
    14: PRD_ROOT / "第4单元/第4单元14课.txt",
    15: PRD_ROOT / "第4单元/第4单元15课.txt",
    16: PRD_ROOT / "第4单元/第4单元16课.txt",
    17: PRD_ROOT / "第5单元/第5单元第17课.txt",
    18: PRD_ROOT / "第5单元/第5单元第18课.txt",
    19: PRD_ROOT / "第5单元/第5单元第19课.txt",
    20: PRD_ROOT / "第5单元/第5单元第20课.txt",
    21: PRD_ROOT / "第6单元/第6单元第21课.txt",
    22: PRD_ROOT / "第6单元/第6单元第22课.txt",
    23: PRD_ROOT / "第6单元/第6单元第23课.txt",
    24: PRD_ROOT / "第6单元/第6单元第24课.txt",
}

_ANS_LETTER = {"A": 0, "B": 1, "C": 2, "D": 3}
_Q_LINE = re.compile(r"^Q(\d+)[：:]\s*(.*)$")
_ARR = re.compile(r"\s*→\s*(.+)$")


def _split_opts(line: str) -> tuple[list[str], str | None]:
    """A. x B. y → C  → (options, letter)"""
    m = re.search(r"\s+→\s*([A-D])\s*$", line)
    letter = m.group(1) if m else None
    body = re.sub(r"\s+→\s*[A-D]\s*$", "", line).strip()
    parts = re.split(r"(?:^|[\s　]+)(?=[B-D][\.．、]\s*)", body)
    opts = []
    for p in parts:
        p = re.sub(r"^[A-D][\.．、]\s*", "", p).strip()
        if p:
            opts.append(p)
    return opts, letter


def parse_prd_lesson(lid: int) -> dict[int, dict]:
    path = PRD_BY_LESSON.get(lid)
    if not path or not path.is_file():
        return {}
    text = path.read_text(encoding="utf-8")
    start = text.find("3. 選択問題")
    end = text.find("8. 作文")
    if start < 0:
        return {}
    chunk = text[start : end if end > start else len(text)]
    lines = chunk.splitlines()

    out: dict[int, dict] = {}
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = _Q_LINE.match(line)
        if not m:
            i += 1
            continue
        qi = int(m.group(1))
        if qi > 11:
            i += 1
            continue
        rest = m.group(2).strip()
        am = _ARR.search(rest)
        if am and not rest.strip().startswith("A."):
            ans = am.group(1).strip()
            qtext = _ARR.sub("", rest).strip()
            out[qi] = {
                "type": "fill",
                "question": qtext,
                "answer": ans,
                "explanationZh": f"填「{ans}」。（PRD 真源）",
            }
            i += 1
            continue
        qtext = rest
        opts: list[str] = []
        letter: str | None = None
        if rest.startswith("A.") or "A." in rest:
            opts, letter = _split_opts(rest)
        else:
            j = i + 1
            while j < len(lines) and not _Q_LINE.match(lines[j].strip()):
                nxt = lines[j].strip()
                if nxt.startswith("A.") or re.match(r"^[A-D][\.．、]", nxt):
                    opts, letter = _split_opts(nxt)
                    break
                if nxt.startswith("→"):
                    ans = nxt.lstrip("→").strip()
                    out[qi] = {
                        "type": "fill",
                        "question": qtext,
                        "answer": ans,
                        "explanationZh": f"（PRD 真源）",
                    }
                    i = j + 1
                    break
                j += 1
            else:
                i += 1
                continue
            i = j + 1
        if qi in out:
            continue
        if not opts:
            i += 1
            continue
        ans_idx = _ANS_LETTER.get(letter or "A", 0)
        out[qi] = {
            "type": "choice",
            "question": qtext,
            "options": opts,
            "answer": ans_idx,
            "explanationZh": f"选「{opts[ans_idx]}」。（PRD 真源）",
        }
        continue
    # 翻译区 Q8–11
    for sec in ("5. 翻訳", "6. 翻訳"):
        si = text.find(sec)
        if si < 0:
            continue
        sub = text[si : text.find("7.", si)]
        cur_q: int | None = None
        for line in sub.splitlines():
            line = line.strip()
            m = _Q_LINE.match(line)
            if m:
                cur_q = int(m.group(1))
                if cur_q <= 11:
                    out.setdefault(cur_q, {})["question"] = m.group(2).strip()
                    out[cur_q]["type"] = "fill"
            elif line.startswith("→") and cur_q and cur_q <= 11:
                ans = line.lstrip("→").strip()
                out[cur_q]["answer"] = ans
                out[cur_q]["explanationZh"] = "（PRD 翻译真源）"
                if re.search(r"[\u3040-\u30ff]", out[cur_q].get("question", "")):
                    out[cur_q].setdefault("explanationZh", "日译中。（PRD）")
                else:
                    out[cur_q].setdefault("explanationZh", "中译日。（PRD）")
    return {k: v for k, v in out.items() if v.get("question") and v.get("answer") is not None}


def build_canon(lesson_ids: list[int]) -> dict[int, dict[int, dict]]:
    return {lid: parse_prd_lesson(lid) for lid in lesson_ids}
