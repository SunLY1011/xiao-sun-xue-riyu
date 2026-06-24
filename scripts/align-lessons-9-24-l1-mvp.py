#!/usr/bin/env python3
"""第3–6单元第9–24课 · 严格对齐第1课 MVP 数据"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
ABC = ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js"
ZH_JS = ROOT / "js" / "data" / "dialogue-zh-l9-24.js"
FLOW = ROOT / "js" / "lesson-1-flow.js"

LESSON_IDS = list(range(9, 25))

VERB_CONJ: dict[str, tuple[str, str, dict[str, str]]] = {
    "行きます": ("1类", "行く", {"辞書": "行く", "ます": "行きます", "ません": "行きません", "ました": "行きました", "ませんでした": "行きませんでした"}),
    "来ます": ("3类", "来る", {"辞書": "来る", "ます": "来ます", "ません": "来ません", "ました": "来ました", "ませんでした": "来ませんでした"}),
    "食べます": ("2类", "食べる", {"辞書": "食べる", "ます": "食べます", "ません": "食べません", "ました": "食べました", "ませんでした": "食べませんでした"}),
    "飲みます": ("1类", "飲む", {"辞書": "飲む", "ます": "飲みます", "ません": "飲みません", "ました": "飲みました", "ませんでした": "飲みませんでした"}),
    "見ます": ("2类", "見る", {"辞書": "見る", "ます": "見ます", "ません": "見ません", "ました": "見ました", "ませんでした": "見ませんでした"}),
    "読みます": ("1类", "読む", {"辞書": "読む", "ます": "読みます", "ません": "読みません", "ました": "読みました", "ませんでした": "読みませんでした"}),
    "書きます": ("1类", "書く", {"辞書": "書く", "ます": "書きます", "ません": "書きません", "ました": "書きました", "ませんでした": "書きませんでした"}),
    "話します": ("1类", "話す", {"辞書": "話す", "ます": "話します", "ません": "話しません", "ました": "話しました", "ませんでした": "話しませんでした"}),
    "買います": ("1类", "買う", {"辞書": "買う", "ます": "買います", "ません": "買いません", "ました": "買いました", "ませんでした": "買いませんでした"}),
    "待ちます": ("1类", "待つ", {"辞書": "待つ", "ます": "待ちます", "ません": "待ちません", "ました": "待ちました", "ませんでした": "待ちませんでした"}),
    "帰ります": ("1类", "帰る", {"辞書": "帰る", "ます": "帰ります", "ません": "帰りません", "ました": "帰りました", "ませんでした": "帰りませんでした"}),
    "作ります": ("1类", "作る", {"辞書": "作る", "ます": "作ります", "ません": "作りません", "ました": "作りました", "ませんでした": "作りませんでした"}),
    "教えます": ("2类", "教える", {"辞書": "教える", "ます": "教えます", "ません": "教えません", "ました": "教えました", "ませんでした": "教えませんでした"}),
    "覚えます": ("2类", "覚える", {"辞書": "覚える", "ます": "覚えます", "ません": "覚えません", "ました": "覚えました", "ませんでした": "覚えませんでした"}),
    "忘れます": ("2类", "忘れる", {"辞書": "忘れる", "ます": "忘れます", "ません": "忘れません", "ました": "忘れました", "ませんでした": "忘れませんでした"}),
}

UNIT_EXTRA_REVIEW: dict[int, list[dict]] = {
    3: [
        {
            "title": "📋 味・感想テンプレート（模板）",
            "lines": [
                "［料理］は［イ形容詞］です。",
                "とても［い］ですが、［い］です。",
                "あまり［い］くないです。",
                "［い］すぎます。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× 辛いでした　○ 辛かったです（イ形容詞过去）",
                "× おいしいくない　○ おいしくない",
                "× あまり辛いです　○ あまり辛くないです",
                "× いいくなかった　○ よくなかった（いい的特殊变化）",
            ],
        },
    ],
    4: [
        {
            "title": "📋 て形・状態テンプレート（模板）",
            "lines": [
                "［场所］で［动词て形］、［动词ます］。",
                "今、［对象］を［ている］。",
                "［形容词く］て［形容词い］です。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× 行って、買い物をします（错）　○ 行って、買い物をしました",
                "× 読んでいる　○ 読んでいます（丁寧）",
                "× 広いで明るい　○ 広くて明るい",
            ],
        },
    ],
    5: [
        {
            "title": "📋 愿望・义务テンプレート（模板）",
            "lines": [
                "［物］がほしいです。",
                "［动词辞書形］ことができます。",
                "［动词ない形］でください。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× ほしいです（他人物欲错）　○ 李さんは本がほしいと言いました",
                "× 行くことができます　○ 行くことができます（自他区分）",
                "× 忘れないでください（混）　○ 鍵を忘れないでください",
            ],
        },
    ],
    6: [
        {
            "title": "📋 经历・伝言テンプレート（模板）",
            "lines": [
                "［た形］ことがあります。",
                "［と思います］。",
                "［と言いました］。",
            ],
        },
        {
            "title": "⚠️ よくある誤り（常见误用）",
            "lines": [
                "× 食べたことがあります（错助词）　○ すき焼きを食べたことがあります",
                "× 行くと思います（引用错）　○ 行くと思います（小句简体）",
                "× 来ないでください　○ 来ないでください（禁止简体）",
            ],
        },
    ],
}


def load_dialogue_zh() -> dict[str, str]:
    text = ZH_JS.read_text(encoding="utf-8")
    m = re.search(r"const\s+DIALOGUE_ZH_L9_24\s*=\s*(\{.*?\})\s*;", text, re.S)
    return json.loads(m.group(1)) if m else {}


def unit_for_lesson(lid: int) -> int:
    if lid <= 12:
        return 3
    if lid <= 16:
        return 4
    if lid <= 20:
        return 5
    return 6


def auto_vocab_warn(L: dict) -> list[str]:
    ids: list[str] = []
    for v in L.get("vocab") or []:
        pos = v.get("pos") or ""
        if any(x in pos for x in ("動", "イ形容", "ナ形容", "助")):
            ids.append(v["id"])
        if len(ids) >= 8:
            break
    if len(ids) < 4:
        for v in L.get("vocab") or []:
            if v["id"] not in ids:
                ids.append(v["id"])
            if len(ids) >= 6:
                break
    return ids


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
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
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
    blob = serialize_lesson(L, trailing_comma=trailing_comma)
    return text[: span[0]] + blob + text[span[1] :]


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def fill_dialogue_chinese(L: dict, zh_map: dict[str, str]) -> int:
    n = 0
    for d in L.get("dialogues") or []:
        op = d.get("opener") or {}
        jp = norm_jp(op.get("japanese", ""))
        if jp and not (op.get("chinese") or "").strip() and jp in zh_map:
            op["chinese"] = zh_map[jp]
            n += 1
        for r in (d.get("userTurn") or {}).get("replies") or []:
            jp2 = norm_jp(r.get("japanese", ""))
            if jp2 and not (r.get("chinese") or "").strip() and jp2 in zh_map:
                r["chinese"] = zh_map[jp2]
                n += 1
    return n


def patch_vocab(L: dict) -> None:
    for v in L.get("vocab") or []:
        jp = (v.get("jp") or "").strip()
        if jp in VERB_CONJ and "動" in (v.get("pos") or ""):
            t, _, forms = VERB_CONJ[jp]
            v["conjugation"] = {"type": t, "forms": forms}


def patch_review_extension(L: dict, lid: int) -> None:
    extra = UNIT_EXTRA_REVIEW.get(unit_for_lesson(lid), [])
    if not extra:
        return
    rext = L.get("reviewExtension") or []
    titles = {(x.get("title") or "") for x in rext}
    insert = [blk for blk in extra if blk["title"] not in titles]
    if not insert:
        return
    out = []
    for blk in rext:
        if "ユニットテスト" in (blk.get("title") or ""):
            out.extend(insert)
            insert = []
        out.append(blk)
    if insert:
        out.extend(insert)
    L["reviewExtension"] = out


def patch_quiz(L: dict, lid: int) -> None:
    """小测由 enrich-lessons-9-24-l1-depth.py 从作業区重建；此处仅保证 ≤12。"""
    qs = L.get("quizQuestions") or []
    L["quizQuestions"] = qs[:12]


def patch_abc_chinese(zh_map: dict[str, str]) -> int:
    if not ABC.is_file():
        return 0
    text = ABC.read_text(encoding="utf-8")
    text = text.replace('。",,', '。",')
    n = 0
    for jp, zh in zh_map.items():
        if not zh:
            continue
        esc = re.escape(jp)
        pat = rf'(label: "A",\s*rank: 1,\s*japanese: "{esc}",)\s*chinese: ""'
        repl = rf'\1\n          chinese: "{zh}",'
        text, c = re.subn(pat, repl, text)
        n += c
    ABC.write_text(text, encoding="utf-8")
    return n


def patch_lesson1_flow_warn(warn_by_lesson: dict[int, list[str]]) -> None:
    out = ROOT / "scripts" / "_lessons9-24-vocab-warn-snippet.js"
    parts = ["  // 9–24 由 align-lessons-9-24-l1-mvp.py 生成 · 合并进 VOCAB_WARN_BY_LESSON"]
    for lid in sorted(warn_by_lesson.keys()):
        inner = ", ".join(f'"{x}"' for x in warn_by_lesson[lid])
        parts.append(f"    {lid}: new Set([{inner}]),")
    out.write_text("\n".join(parts) + "\n", encoding="utf-8")


def align_data() -> dict:
    zh_map = load_dialogue_zh()
    text, lessons = load_lessons()
    stats = {"dialogue_zh": 0, "abc_zh": 0, "quiz_added": 0}
    by_id = {L["lessonId"]: L for L in lessons}
    warn_map: dict[int, list[str]] = {}
    for lid in LESSON_IDS:
        L = by_id[lid]
        stats["dialogue_zh"] += fill_dialogue_chinese(L, zh_map)
        patch_vocab(L)
        patch_review_extension(L, lid)
        before = len(L.get("quizQuestions") or [])
        patch_quiz(L, lid)
        stats["quiz_added"] += len(L.get("quizQuestions") or []) - before
        warn_map[lid] = auto_vocab_warn(L)
        text = save_lesson(text, L)
    DATA.write_text(text, encoding="utf-8")
    stats["abc_zh"] = patch_abc_chinese(zh_map)
    patch_lesson1_flow_warn(warn_map)
    return stats, warn_map


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    stats, warn_map = align_data()
    print("[OK] align-lessons-9-24:", stats)
    print(f"VOCAB_WARN lessons: {len(warn_map)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
