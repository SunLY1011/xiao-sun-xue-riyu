#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从【产品PRD】阶段课文 txt 生成 lessons-prd-unreleased-mvp.js（1–12、21–24）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "js" / "data" / "lessons-prd-unreleased-mvp.js"
DEPTH_OUT = ROOT / "js" / "data" / "lessons-prd-unreleased-depth.json"

PRD_FILES = [
    (ROOT / "【产品PRD】" / "第3阶段课文（1-4）.txt", range(1, 5)),
    (ROOT / "【产品PRD】" / "第4阶段课文（5-8）.txt", range(5, 9)),
    (ROOT / "【产品PRD】" / "第5阶段课文（9-12）.txt", range(9, 13)),
    (ROOT / "【产品PRD】" / "第6阶段课文（21-24）.txt", range(21, 25)),
]

LESSON_META = {
    1: {"headline": "李さんは中国人です", "themeZh": "自我介绍", "theme": "自己紹介"},
    2: {"headline": "これは本です", "themeZh": "指示事物", "theme": "指示語"},
    3: {"headline": "ここはデパートです", "themeZh": "场所位置", "theme": "場所"},
    4: {"headline": "部屋に机といすがあります", "themeZh": "存在与数量", "theme": "存在"},
    5: {"headline": "森さんは七時に起きます", "themeZh": "时间与ます形", "theme": "時間"},
    6: {"headline": "吉田さんは来月中国へ行きます", "themeZh": "移动与方向", "theme": "移動"},
    7: {"headline": "李さんは毎日コーヒーを飲みます", "themeZh": "对象与频率", "theme": "対象"},
    8: {"headline": "李さんは日本語で手紙を書きます", "themeZh": "手段与授受", "theme": "手段"},
    9: {"headline": "四川料理は辛いです", "themeZh": "い形容词", "theme": "イ形容詞"},
    10: {"headline": "京都の紅葉は有名です", "themeZh": "な形容词", "theme": "ナ形容詞"},
    11: {"headline": "小野さんは歌が好きです", "themeZh": "喜好与擅长", "theme": "好み"},
    12: {"headline": "李さんは森さんより若いです", "themeZh": "比较", "theme": "比較"},
    21: {"headline": "わたしはすき焼きを食べたことがあります", "themeZh": "た形与经历", "theme": "経験"},
    22: {"headline": "森さんは今晩テレビを見る", "themeZh": "简体", "theme": "常体"},
    23: {"headline": "休みの日、散歩したり買い物に行ったりします", "themeZh": "たり·场合", "theme": "並列"},
    24: {"headline": "李さんはもうすぐ来ると思います", "themeZh": "引用与思う", "theme": "引用"},
}


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def parse_links(block: str) -> list[dict]:
    links = []
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("タグ"):
            continue
        if line.startswith("🔗"):
            links.append({"type": "extension", "label": line})
        elif line.startswith("📖"):
            links.append({"type": "prerequisite", "label": line})
        elif line.startswith("⚠️"):
            links.append({"type": "contrast", "label": line})
        elif line.startswith("🏷️"):
            links.append({"type": "scene", "label": line})
    return links


def parse_tags(block: str) -> list[str]:
    m = re.search(r"タグ[：:]\s*(.+)", block)
    if not m:
        return []
    raw = m.group(1).strip()
    return [t.strip() for t in re.findall(r"#\S+", raw)] or [raw]


def split_lessons(text: str) -> list[tuple[int, str]]:
    parts = re.split(r"(?=第(\d+)課[：:])", text)
    out = []
    i = 1
    while i < len(parts):
        if i + 1 < len(parts) and parts[i].isdigit():
            lid = int(parts[i])
            body = parts[i + 1].lstrip()
            if not body.startswith("第"):
                body = f"第{lid}課：" + body
            out.append((lid, body))
            i += 2
        else:
            i += 1
    return out


def parse_nodes(section: str) -> list[dict]:
    nodes = []
    chunks = re.split(r"\n(?=ノード\d+)", section)
    for chunk in chunks:
        if not chunk.strip().startswith("ノード"):
            continue
        title_m = re.match(r"ノード\d+（?補充）?[：:]\s*(.+)", chunk)
        title = title_m.group(1).split("\n")[0].strip() if title_m else "文法"
        title_zh = title
        id_m = re.search(r"ID[：:]\s*(\S+)", chunk)
        if not id_m:
            continue
        nid = id_m.group(1).strip()
        expl_m = re.search(r"説明[：:]\s*([\s\S]*?)(?=\n例[：:]|\n関連[：:]|\nタグ[：:]|\nノード|\n第二関)", chunk)
        explanation = (expl_m.group(1).strip() if expl_m else "").replace("\n\n", "\n")
        ex_m = re.search(r"例[：:]\s*([\s\S]*?)(?=\n関連[：:]|\nタグ[：:]|\nノード|\n第二関)", chunk)
        example = (ex_m.group(1).strip() if ex_m else "").split("\n")[0]
        rel_m = re.search(r"関連[：:]\s*([\s\S]*?)(?=\nタグ[：:]|\nノード|\n第二関|$)", chunk)
        links = parse_links(rel_m.group(1) if rel_m else "")
        tags = parse_tags(chunk)
        nodes.append(
            {
                "id": nid,
                "title": title,
                "titleZh": title_zh,
                "explanation": explanation,
                "example": example,
                "links": links,
                "tags": tags,
            }
        )
    return nodes


def parse_dialogue(section: str, lesson_id: int) -> list[dict]:
    m = re.search(r"会話[：:]\s*(.+?)\n", section)
    title = m.group(1).strip() if m else "会話練習"
    did = f"l{lesson_id}_dialogue_main"
    lines = section.splitlines()
    opener = None
    replies: list[dict] = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("A\t") or (line.startswith("A") and "\t" in line):
            jp = line.split("\t", 1)[-1].strip()
            opener = {"speaker": "A", "japanese": jp, "chinese": ""}
        elif re.match(r"Bの返事[①②③123]", line):
            i += 1
            jp_lines = []
            while i < len(lines):
                ln = lines[i].strip()
                if ln.startswith("💡") or ln.startswith("Bの返事") or ln.startswith("第三関") or ln.startswith("Q"):
                    break
                if ln and not ln.startswith("役"):
                    jp_lines.append(ln)
                i += 1
            jp = "".join(jp_lines) if len(jp_lines) == 1 else "\n".join(jp_lines)
            note_ja = ""
            note_zh = ""
            if i < len(lines) and lines[i].strip().startswith("💡"):
                tip = lines[i].strip().lstrip("💡").strip()
                note_ja = tip
                note_zh = tip
                i += 1
            if jp:
                replies.append({"japanese": jp, "chinese": "", "noteJa": note_ja, "noteZh": note_zh})
            continue
        i += 1
    if not opener and replies:
        opener = {"speaker": "A", "japanese": "（会話を始めます）", "chinese": ""}
    if not opener:
        return []
    return [
        {
            "id": did,
            "title": title,
            "sceneEmoji": "📖",
            "scenePlace": title,
            "opener": opener,
            "userTurn": {"speaker": "B", "replies": replies[:3] or [{"japanese": "はい。", "chinese": ""}]},
        }
    ]


def parse_quiz(section: str, lesson_id: int) -> list[dict]:
    qs = []
    q_blocks = re.split(r"(?=Q\d+（)", section)
    qi = 0
    for block in q_blocks:
        if not block.strip().startswith("Q"):
            continue
        qi += 1
        qid = f"l{lesson_id}_q{qi}"
        is_fill = "穴埋め" in block[:20]
        is_choice = "選択" in block[:20]
        qtext_m = re.search(r"Q\d+（[^）]+）[：:]\s*(.+?)(?=\n\n|\nA\.|\n正解)", block, re.S)
        question = (qtext_m.group(1).strip() if qtext_m else "").split("\n")[0]
        ans_m = re.search(r"正解[：:]\s*([A-D]|[^\n]+)", block)
        expl_m = re.search(r"解説[：:]\s*(.+)", block)
        explanation = expl_m.group(1).strip() if expl_m else ""
        grammar_m = re.search(r"grammarNodeId", block)
        gnode = None
        if not grammar_m and "l" in block:
            pass
        if is_choice:
            opts = []
            for om in re.finditer(r"^([A-D])\.\s*(.+)$", block, re.M):
                opts.append(om.group(2).strip())
            if len(opts) < 2:
                inline = re.findall(r"([A-D])\.\s*([^\sA-D]+)", block)
                opts = [b for _, b in inline]
            ans_raw = ans_m.group(1).strip() if ans_m else "A"
            ans_idx = "ABCD".index(ans_raw[0]) if ans_raw and ans_raw[0] in "ABCD" else 0
            qs.append(
                {
                    "id": qid,
                    "type": "choice",
                    "question": question,
                    "options": opts[:4] if opts else ["は", "が", "の", "に"],
                    "answer": ans_idx,
                    "explanation": explanation,
                    "grammarNodeId": gnode,
                }
            )
        elif is_fill:
            answer = ans_m.group(1).strip() if ans_m else ""
            qs.append(
                {
                    "id": qid,
                    "type": "fill",
                    "question": question,
                    "answer": answer,
                    "explanation": explanation,
                    "grammarNodeId": gnode,
                }
            )
    if qs and qs[0].get("grammarNodeId") is None:
        pass
    return qs[:4]


def attach_grammar_to_quiz(nodes: list[dict], quizzes: list[dict]) -> None:
    default = nodes[0]["id"] if nodes else None
    for q in quizzes:
        if not q.get("grammarNodeId") and default:
            q["grammarNodeId"] = default


def parse_lesson(lesson_id: int, body: str) -> dict:
    meta = LESSON_META.get(lesson_id, {})
    first = body.split("\n", 1)[0].strip()
    title_m = re.match(r"第\d+課[：:]\s*(.+)", first)
    lesson_title = title_m.group(1).strip() if title_m else meta.get("headline", f"第{lesson_id}課")
    next_lesson = r"第\d+課[：:]"
    g_sec = re.search(
        rf"(?:第一関[：:]|二、基本文法)([\s\S]*?)(?=第二関|第三関|三、表現|四、|会話練習|五、テスト|{next_lesson}|$)",
        body,
    )
    d_sec = re.search(
        rf"(?:第二関[：:]|会話練習[：:])([\s\S]*?)(?=第三関|五、テスト|{next_lesson}|$)",
        body,
    )
    if not d_sec:
        d_sec = re.search(rf"会話練習[：:]([\s\S]*?)(?=五、テスト|{next_lesson}|$)", body)
    q_sec = re.search(rf"(?:第三関[：:]|五、テスト)([\s\S]*?)(?={next_lesson}|$)", body)
    nodes = parse_nodes((g_sec.group(1) if g_sec and g_sec.lastindex else g_sec.group(0)) if g_sec else "")
    d_body = (d_sec.group(1) if d_sec and d_sec.lastindex else d_sec.group(0)) if d_sec else ""
    dialogues = parse_dialogue(d_body, lesson_id)
    q_body = (q_sec.group(1) if q_sec and q_sec.lastindex else q_sec.group(0)) if q_sec else ""
    quizzes = parse_quiz(q_body, lesson_id)
    attach_grammar_to_quiz(nodes, quizzes)
    if len(quizzes) < 3 and nodes:
        while len(quizzes) < 3:
            n = nodes[len(quizzes) % len(nodes)]
            quizzes.append(
                {
                    "id": f"l{lesson_id}_q_auto_{len(quizzes)+1}",
                    "type": "fill",
                    "question": n["example"].replace("。", "＿＿＿。") if "。" in n["example"] else n["example"] + "＿＿＿",
                    "answer": "",
                    "explanation": n["explanation"][:80],
                    "grammarNodeId": n["id"],
                }
            )
    return {
        "lessonId": lesson_id,
        "lessonTitle": lesson_title,
        "lessonTitleRuby": [],
        "theme": meta.get("theme", ""),
        "themeZh": meta.get("themeZh", ""),
        "grammarNodes": nodes,
        "dialogues": dialogues,
        "quizQuestions": quizzes,
    }


def lesson_to_js(lesson: dict, indent: int = 2) -> str:
    return json.dumps(lesson, ensure_ascii=False, indent=2)


def build_vocab(lesson: dict) -> list[dict]:
    lid = lesson["lessonId"]
    seen = set()
    vocab = []
    for n in lesson.get("grammarNodes", []):
        ex = n.get("example", "")
        for word in re.findall(r"[\u3040-\u30ff\u4e00-\u9fffー]{2,}", ex):
            if word in seen or len(word) > 12:
                continue
            seen.add(word)
            vocab.append(
                {
                    "id": f"l{lid}_v_{len(vocab)}",
                    "jp": word,
                    "kana": word,
                    "meaningZh": n.get("titleZh", n.get("title", "")),
                    "example": ex[:60],
                    "from": "grammar",
                }
            )
            if len(vocab) >= 8:
                return vocab
    if lesson.get("dialogues"):
        op = lesson["dialogues"][0].get("opener", {})
        jp = op.get("japanese", "")
        if jp and jp not in seen:
            vocab.insert(
                0,
                {
                    "id": f"l{lid}_v_opener",
                    "jp": jp[:20],
                    "kana": jp[:20],
                    "meaningZh": lesson["themeZh"],
                    "example": jp,
                    "from": "dialogue",
                },
            )
    return vocab[:10]


def main() -> int:
    lessons = []
    depth = {}
    for path, _ in PRD_FILES:
        if not path.is_file():
            print(f"[FAIL] missing {path}")
            return 1
        text = path.read_text(encoding="utf-8")
        for lid, body in split_lessons(text):
            if lid not in LESSON_META:
                continue
            lesson = parse_lesson(lid, body)
            if not lesson["grammarNodes"]:
                print(f"[WARN] lesson {lid} no nodes")
            lessons.append(lesson)
            depth[str(lid)] = {
                "lessonCoachSummary": {
                    "subtitle": "本課の要点",
                    "lines": [
                        {
                            "ja": (
                                " ".join(lesson["grammarNodes"][0]["explanation"].split())[:120]
                                if lesson["grammarNodes"]
                                else lesson["lessonTitle"]
                            ),
                            "zh": lesson["themeZh"],
                        }
                    ],
                },
                "vocab": build_vocab(lesson),
            }
            print(f"ok lesson {lid}: {len(lesson['grammarNodes'])} nodes, {len(lesson['quizQuestions'])} quiz")

    lessons.sort(key=lambda x: x["lessonId"])
    header = "/** 自动生成：PRD 第1–12 / 21–24 課 · 勿手改（改 PRD 后重跑 generate-lessons-from-prd.py） */\nconst LESSONS_PRD_UNRELEASED_MVP = "
    OUT.write_text(header + json.dumps(lessons, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    DEPTH_OUT.write_text(json.dumps(depth, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(lessons)} lessons)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
