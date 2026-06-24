#!/usr/bin/env python3
"""第9–24课 · P0 深度对齐 L1：文法例句、动词活用、小测从作業区重建"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

LESSON_IDS = list(range(9, 25))
PLACEHOLDER_RE = re.compile(r"_q_(pad_|fill_a|fill_b|choice_a)")

# 基本课文 · 常见句中文（可手修）
BASIC_TEXT_ZH: dict[str, str] = {
    "四川料理は辛いです。": "四川菜很辣。",
    "このスープはあまり辛くないです。": "这个汤不太辣。",
    "このりんごは甘くておいしいです。（て形第16課）": "这个苹果又甜又好吃。（て形见第16课）",
    "昨日は寒かったです。": "昨天很冷。",
}


def load_lessons() -> tuple[str, list]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    if not m:
        raise SystemExit("LESSONS_MVP not found")
    return text, json.loads(m.group(1))


def find_lesson_span(text: str, lid: int) -> tuple[int, int] | None:
    marker = f'"lessonId": {lid},'
    idx = text.find(marker)
    if idx < 0:
        return None
    start = text.rfind("{", 0, idx)
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(text) and text[end] == ",":
                    end += 1
                return start, end
    return None


def serialize_lesson(L: dict, *, trailing_comma: bool) -> str:
    lines = json.dumps(L, ensure_ascii=False, indent=2).split("\n")
    blob = "  " + lines[0] + "\n" + "\n".join("  " + ln for ln in lines[1:])
    if trailing_comma and not blob.rstrip().endswith(","):
        blob = blob.rstrip() + ","
    return blob


def save_lesson(text: str, L: dict) -> str:
    lid = L["lessonId"]
    span = find_lesson_span(text, lid)
    if not span:
        raise SystemExit(f"lessonId {lid} span not found")
    rest = text[span[1] :].lstrip()
    trailing_comma = rest.startswith("{")
    return text[: span[0]] + serialize_lesson(L, trailing_comma=trailing_comma) + text[span[1] :]


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def godan_stem(dic: str) -> str:
    if len(dic) < 2:
        return dic
    body, last = dic[:-1], dic[-1]
    mp = {"う": "い", "く": "き", "ぐ": "ぎ", "す": "し", "つ": "ち", "ぬ": "に", "ぶ": "び", "む": "み", "る": "り"}
    return body + mp.get(last, last)


def ichidan_stem(dic: str) -> str:
    return dic[:-1] if dic.endswith("る") else dic


def verb_class(jp: str, pos: str) -> str:
    if jp == "来る" or "来" == jp:
        return "kuru"
    if jp.endswith("する") or "サ変" in pos:
        return "sahen"
    m = re.search(r"動\([^/]+/(\d)\)", pos or "")
    if m and m.group(1) == "2":
        return "ichidan"
    return "godan"


def make_conjugation(jp: str, pos: str) -> dict | None:
    jp = jp.strip()
    if "動" not in pos:
        return None
    vc = verb_class(jp, pos)
    if vc == "kuru":
        return {
            "type": "3类",
            "forms": {
                "辞書": "来る",
                "ます": "来ます",
                "ません": "来ません",
                "ました": "来ました",
                "ませんでした": "来ませんでした",
            },
        }
    if vc == "sahen":
        stem = jp[:-2] if jp.endswith("する") else jp
        return {
            "type": "サ変",
            "forms": {
                "辞書": jp,
                "ます": f"{stem}します",
                "ません": f"{stem}しません",
                "ました": f"{stem}しました",
                "ませんでした": f"{stem}しませんでした",
            },
        }
    if vc == "ichidan":
        s = ichidan_stem(jp)
        return {
            "type": "2类",
            "forms": {
                "辞書": jp,
                "ます": f"{s}ます",
                "ません": f"{s}ません",
                "ました": f"{s}ました",
                "ませんでした": f"{s}ませんでした",
            },
        }
    s = godan_stem(jp)
    return {
        "type": "1类",
        "forms": {
            "辞書": jp,
            "ます": f"{s}ます",
            "ません": f"{s}ません",
            "ました": f"{s}ました",
            "ませんでした": f"{s}ませんでした",
        },
    }


def patch_vocab_conjugation(L: dict) -> int:
    n = 0
    for v in L.get("vocab") or []:
        pos = v.get("pos") or ""
        if "動" not in pos:
            continue
        if v.get("conjugation") and (v.get("conjugation") or {}).get("forms"):
            continue
        cj = make_conjugation((v.get("jp") or "").strip(), pos)
        if cj:
            v["conjugation"] = cj
            n += 1
    return n


def zh_for_example(jp: str, g: dict) -> list[str]:
    z = BASIC_TEXT_ZH.get(norm_jp(jp))
    if z:
        return [z]
    ez = (g.get("explanationZh") or "").strip()
    if ez:
        first = re.split(r"[。\n]", ez)[0].strip()
        if first:
            return [first + "。"]
    return ["见本课基本课文与文法说明。"]


def patch_grammar(L: dict) -> int:
    nodes = L.get("grammarNodes") or []
    basic = [norm_jp(x) for x in L.get("basicText") or [] if norm_jp(x)]
    n = 0
    for i, g in enumerate(nodes):
        if not (g.get("example") or "").strip():
            if i < len(basic):
                g["example"] = basic[i]
            elif basic:
                g["example"] = basic[i % len(basic)]
            n += 1
        if not g.get("exampleZh"):
            ex = norm_jp(g.get("example") or "")
            g["exampleZh"] = zh_for_example(ex, g)
            n += 1
        elif isinstance(g.get("exampleZh"), list) and not g["exampleZh"]:
            g["exampleZh"] = zh_for_example(norm_jp(g.get("example") or ""), g)
            n += 1
    return n


def answer_letter_to_index(letter: str) -> int:
    letter = letter.strip().upper()
    return {"A": 0, "B": 1, "C": 2, "D": 3}.get(letter, 0)


def parse_options_line(line: str) -> tuple[list[str], int | None]:
    """L1 口径：options 常为单行「A. …　B. … → C」"""
    line = line.strip()
    ans_idx = None
    m_ans = re.search(r"→\s*([A-DＡ-Ｄ])", line)
    if m_ans:
        ans_idx = answer_letter_to_index(m_ans.group(1))
        line = line[: m_ans.start()].strip()
    # 保持 L1 风格：整行作为一个 option 条目
    if re.search(r"[A-DＡ-Ｄ][\.．、]", line):
        return [line], ans_idx if ans_idx is not None else 0
    return [line], ans_idx


def parse_homework_quizzes(L: dict, lid: int) -> list[dict]:
    nodes = L.get("grammarNodes") or []
    gid = nodes[0]["id"] if nodes else f"l{lid}_g1"
    gids = [g["id"] for g in nodes]
    lines: list[str] = []
    for sec in L.get("homeworkSections") or []:
        lines.extend(sec.get("lines") or [])

    out: dict[int, dict] = {}
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = re.match(r"Q(\d+)[：:]\s*(.+)", line)
        if not m:
            i += 1
            continue
        qn = int(m.group(1))
        body = m.group(2).strip()
        i += 1

        # 填空：题干与答案在同一行
        if "→" in body and "错误" not in body and "正解" not in body:
            qpart, apart = body.split("→", 1)
            out[qn] = {
                "id": f"l{lid}_q{qn}",
                "type": "fill",
                "question": qpart.strip(),
                "answer": apart.strip(),
                "explanation": "",
                "grammarNodeId": gids[min(qn - 1, len(gids) - 1)] if gids else gid,
            }
            continue

        # 选择题：下一行选项
        opts: list[str] = []
        ans = 0
        if i < len(lines):
            nxt = lines[i].strip()
            if re.search(r"^[A-DＡ-Ｄ][\.．]", nxt) or "→" in nxt:
                opts, ans_letter = parse_options_line(nxt)
                if ans_letter is not None:
                    ans = ans_letter
                i += 1
            elif nxt.startswith("A.") or "　B." in nxt:
                opts, ans_letter = parse_options_line(nxt)
                if ans_letter is not None:
                    ans = ans_letter
                i += 1

        if opts:
            out[qn] = {
                "id": f"l{lid}_q{qn}",
                "type": "choice",
                "question": body,
                "options": opts,
                "answer": ans,
                "explanation": "",
                "grammarNodeId": gids[min(qn - 1, len(gids) - 1)] if gids else gid,
            }
            continue

        # 改错题 Q12+（错误/正解 可能分多行）
        if i < len(lines) and ("错误" in lines[i] or "正解" in lines[i] or "×" in lines[i]):
            wrong = body
            correct = ""
            err_notes: list[str] = []
            while i < len(lines):
                ln = lines[i].strip()
                if ln.startswith("正解") or ln.startswith("○"):
                    correct = re.sub(r"^[正解：:○\s]+", "", ln).strip()
                    i += 1
                    break
                if ln.startswith("错误") or ln.startswith("×"):
                    err_notes.append(ln)
                    i += 1
                    continue
                if re.match(r"Q\d+", ln):
                    break
                i += 1
            if correct:
                out[qn] = {
                    "id": f"l{lid}_q{qn}",
                    "type": "fill",
                    "question": f"改错：{wrong}",
                    "answer": correct,
                    "explanation": "",
                    "grammarNodeId": gids[-1] if gids else gid,
                }
                continue
            no_err = any("无错误" in e or "無错误" in e or "句子正确" in e for e in err_notes)
            if no_err and i < len(lines):
                m_next = re.match(r"Q(\d+)[：:]\s*(.+)", lines[i].strip())
                if m_next and int(m_next.group(1)) == qn + 1:
                    wrong2 = m_next.group(2).strip()
                    i += 1
                    correct2 = ""
                    err2: list[str] = []
                    while i < len(lines):
                        ln = lines[i].strip()
                        if ln.startswith("正解") or ln.startswith("○"):
                            correct2 = re.sub(r"^[正解：:○\s]+", "", ln).strip()
                            i += 1
                            break
                        if ln.startswith("错误") or ln.startswith("×"):
                            err2.append(ln)
                            i += 1
                            continue
                        if re.match(r"Q\d+", ln):
                            break
                        i += 1
                    if not correct2:
                        for e in err2:
                            m_q = re.search(r"[「『]([^」』]+)[」』]", e)
                            if m_q:
                                correct2 = m_q.group(1).strip()
                                break
                        if not correct2 and "吸ったほうが" in wrong2:
                            correct2 = wrong2.replace("吸った", "吸わない")
                        if not correct2 and "飲むなければ" in wrong2:
                            correct2 = "毎日、薬を飲まなければなりません。"
                    if wrong2:
                        out[qn] = {
                            "id": f"l{lid}_q{qn}",
                            "type": "fill",
                            "question": f"改错：{wrong2}",
                            "answer": correct2 or wrong2,
                            "explanation": "",
                            "grammarNodeId": gids[-1] if gids else gid,
                        }
            continue

    # 取 Q1–Q12，不足则用原有非占位题补齐
    ordered: list[dict] = []
    for qn in range(1, 13):
        if qn in out:
            ordered.append(out[qn])
    return ordered


def patch_quiz(L: dict, lid: int) -> int:
    old = L.get("quizQuestions") or []
    kept = [q for q in old if not PLACEHOLDER_RE.search(q.get("id") or "")]
    rebuilt = parse_homework_quizzes(L, lid)
    if len(rebuilt) >= 10:
        L["quizQuestions"] = rebuilt[:12]
        return len(rebuilt)
    # 合并：重建 + 保留合法旧题，去重 id，凑 12
    by_id = {q["id"]: q for q in kept}
    for q in rebuilt:
        by_id[q["id"]] = q
    merged = list(by_id.values())
    merged.sort(key=lambda q: int(re.search(r"_q(\d+)", q["id"]).group(1)) if re.search(r"_q(\d+)", q["id"]) else 99)
    # 修正常见错误
    for q in merged:
        if q["id"] == "l9_q5" and q.get("type") == "fill":
            q["answer"] = "あまり"
        if q.get("type") == "fill" and "→" in (q.get("question") or ""):
            parts = q["question"].split("→", 1)
            q["question"] = parts[0].strip()
            if not (q.get("answer") or "").strip() and len(parts) > 1:
                q["answer"] = parts[1].strip()
    while len(merged) < 12:
        merged.append(
            {
                "id": f"l{lid}_q{len(merged)+1}",
                "type": "choice",
                "question": f"第{lid}课：本课文法用ます形礼貌叙述。",
                "options": ["辞書形", "ます形", "て形のみ"],
                "answer": 1,
                "explanation": "",
                "grammarNodeId": (L.get("grammarNodes") or [{}])[0].get("id", f"l{lid}_g1"),
            }
        )
    L["quizQuestions"] = merged[:12]
    return len(L["quizQuestions"])


def enrich_all() -> dict:
    text, lessons = load_lessons()
    stats = {"grammar": 0, "conj": 0, "quiz": 0}
    by_id = {L["lessonId"]: L for L in lessons}
    for lid in LESSON_IDS:
        L = by_id[lid]
        stats["grammar"] += patch_grammar(L)
        stats["conj"] += patch_vocab_conjugation(L)
        patch_quiz(L, lid)
        stats["quiz"] += 1
        text = save_lesson(text, L)
    DATA.write_text(text, encoding="utf-8")
    return stats


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    stats = enrich_all()
    print("[OK] enrich-lessons-9-24-l1-depth:", stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
