#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P1：Top20 + 结构化【拡張·易错】→ 各课 reviewExtension「⚠️ よくある誤り」
P3：助词一览表（按首次课）+ 活用总表（按课节奏）→「🗂️ 参考表」
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
STRUCT = ROOT / "【标日学习资料补充】" / "结构化"
TOP20_MD = ROOT / "参考资料/03-语法补充/常见错误Top20.md"
PARTICLE_MD = ROOT / "参考资料/03-语法补充/助词用法一览表.md"
CONJ_MD = ROOT / "参考资料/03-语法补充/活用总表.md"

MARK_TOP20 = "【对照表·Top20】"
MARK_STRUCT = "【真源·易错】"
MARK_PARTICLE = "【参考资料·助词】"
MARK_CONJ = "【参考资料·活用】"
MARK_CONJ_FULL = "【参考资料·活用·総表】"
REF_TITLE = "🗂️ 参考表"
MISTAKE_HINTS = ("误用", "誤り", "误")

# 无 Top20/结构化时兜底（课次 → 一条）
SUPPLEMENT_MISTAKE: dict[int, str] = {
    2: "× これは本 → ○ これは本です（句尾です）",
    3: "× ここの部屋 → ○ この部屋（ここ+の）",
    4: "× 人がいます（ある）→ ○ 人がいます（いる）",
    6: "× 歩いてで行く → ○ 歩いて行く",
    7: "× 毎朝に起きる → ○ 毎朝起きます",
    10: "× きれいかったです → ○ きれいでした（ナ形过去）",
    12: "× 冬を好き → ○ 冬のほうが好きです（が）",
    13: "× 本が三個 → ○ 本が三冊",
    15: "× 今、食べます → ○ 食べています（进行中）",
    20: "× が弾くことができます → ○ を弾くことができます",
    22: "× 行きます京都へ → ○ 京都へ行く",
    23: "× 雨の場合は中止する → ○ 中止になります",
    24: "× と思います＝如果 → ○ と＝引用（转述）",
}

# 活用总表按课插入摘要（课次 → 行列表）
CONJ_BY_LESSON: dict[int, list[str]] = {
    5: [
        f"{MARK_CONJ} 动词ます形：五段（書く→書きます）／一段（食べる→食べます）／する→します",
        f"{MARK_CONJ} サ変・カ変：する／来る（きます）",
    ],
    9: [
        f"{MARK_CONJ} イ形容词：大きい→大きくない／大きかった／大きくて",
        f"{MARK_CONJ} 特殊：いい→よくない／よかった／よくて",
    ],
    10: [
        f"{MARK_CONJ} ナ形容词：静か→静かではない／静かだった／静かで",
    ],
    14: [
        f"{MARK_CONJ} て形音变：うつる→って；く→いて；ぐ→いで；す→して；むぶぬ→んで",
    ],
    19: [
        f"{MARK_CONJ} ない形：五段う段+ない；一段+ない；する→しない；来る→こない",
    ],
    21: [
        f"{MARK_CONJ} た形：与て形同规则（書いて→書いた）",
    ],
    22: [
        f"{MARK_CONJ} 简体：ます→辞书形；ません→ない；ました→た",
    ],
}


def load_lessons() -> tuple[str, re.Match, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, m, json.loads(m.group(2))


def save_lessons(text: str, m: re.Match, lessons: list) -> None:
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")


def find_block(L: dict, title_hint: str) -> dict | None:
    for b in L.get("reviewExtension") or []:
        if title_hint in (b.get("title") or ""):
            return b
    return None


def parse_top20() -> dict[int, list[str]]:
    """每课至多 1 条 Top20（表内一课一行）。"""
    out: dict[int, list[str]] = {}
    for line in TOP20_MD.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or "---" in line or line.startswith("| #"):
            continue
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 5 or not parts[0].isdigit() or not parts[3].isdigit():
            continue
        lid = int(parts[3])
        if lid in out:
            continue
        out[lid] = [
            f"{MARK_TOP20} × {parts[1]} → ○ {parts[2]}（{parts[4]}）"
        ]
    return out


def parse_conj_full_l5() -> list[str]:
    """第5课 · 扩展参考表顶部：动词/形容词活用总表（长表）。"""
    lines = [
        f"{MARK_CONJ_FULL} 标日初级上册 · 动词·形容词活用总表（查阅用，不必一次背完）",
    ]
    stop = False
    for raw in CONJ_MD.read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if s.startswith("## 按课"):
            stop = True
        if stop:
            continue
        if not s or s.startswith(">"):
            continue
        if s.startswith("# "):
            lines.append(s[2:].strip())
        elif s.startswith("## "):
            lines.append(s[3:].strip())
        elif s.startswith("### "):
            lines.append(s[4:].strip())
        elif s.startswith("|") or s.startswith("**"):
            lines.append(s.replace("**", ""))
    lines.append(
        "【知识延展】イ形活用见第9课、ナ形见第10课；て形见第14课；ない形见第19课；た形见第21课。"
    )
    return lines


def parse_structured_mistakes() -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}
    for p in STRUCT.rglob("*-真源补丁.txt"):
        m = re.search(r"第0?(\d+)课", p.stem)
        if not m:
            continue
        lid = int(m.group(1))
        body = p.read_text(encoding="utf-8")
        sec = re.search(r"【拡張·易错】([\s\S]*?)【/", body)
        if not sec:
            continue
        for line in sec.group(1).splitlines():
            line = line.strip()
            if line.startswith("×"):
                out.setdefault(lid, []).append(f"{MARK_STRUCT} {line}")
    return out


def parse_particles_by_lesson() -> dict[int, list[str]]:
    out: dict[int, list[str]] = {}
    for line in PARTICLE_MD.read_text(encoding="utf-8").splitlines():
        if not line.startswith("|") or "---" in line or "助词" in line[:6]:
            continue
        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 4 or not parts[2].isdigit():
            continue
        lid = int(parts[2])
        out.setdefault(lid, []).append(
            f"{MARK_PARTICLE} {parts[0]}：{parts[1]} — {parts[3]}"
        )
    return out


def merge_lines(existing: list[str], new_lines: list[str], markers: tuple[str, ...]) -> list[str]:
    kept = [ln for ln in existing if not any(m in ln for m in markers)]
    merged = []
    seen = set()
    for ln in new_lines + kept:
        if ln not in seen:
            seen.add(ln)
            merged.append(ln)
    return merged


def patch_mistakes(L: dict, lid: int, top20: dict, struct: dict) -> bool:
    block = find_block(L, "误")
    if not block:
        return False
    lines: list[str] = []
    lines.extend(top20.get(lid, [])[:1])
    lines.extend(struct.get(lid, []))
    if lid in SUPPLEMENT_MISTAKE:
        sup = f"{MARK_STRUCT} {SUPPLEMENT_MISTAKE[lid]}"
        if not any(SUPPLEMENT_MISTAKE[lid] in ln for ln in lines):
            lines.append(sup)
    if not lines and lid >= 2:
        return False
    block["lines"] = merge_lines(block.get("lines") or [], lines, (MARK_TOP20, MARK_STRUCT))
    return True


def patch_reference(L: dict, lid: int, particles: dict, extra_conj: list[str]) -> bool:
    block = find_block(L, REF_TITLE)
    if not block:
        return False
    new_lines: list[str] = []
    if lid == 5:
        new_lines.extend(parse_conj_full_l5())
    new_lines.extend(extra_conj)
    new_lines.extend(particles.get(lid, []))
    if not new_lines:
        return False
    block["lines"] = merge_lines(
        block.get("lines") or [],
        new_lines,
        (MARK_PARTICLE, MARK_CONJ, MARK_CONJ_FULL),
    )
    return True


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    top20 = parse_top20()
    struct = parse_structured_mistakes()
    particles = parse_particles_by_lesson()
    text, m, lessons = load_lessons()
    n_mistake = n_ref = 0
    for L in lessons:
        lid = L.get("lessonId")
        if not lid or lid < 2:
            continue
        if patch_mistakes(L, lid, top20, struct):
            n_mistake += 1
        conj = CONJ_BY_LESSON.get(lid, [])
        if patch_reference(L, lid, particles, conj):
            n_ref += 1
    save_lessons(text, m, lessons)
    print(f"[OK] patch-review-extension-p1-p3: 误用块 {n_mistake} 课 · 参考表 {n_ref} 课")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
