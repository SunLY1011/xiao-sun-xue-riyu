#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "【产品PRD】" / "新增补课文内容"
OUT = ROOT / "js" / "data" / "lessons-supplement-mvp.js"


LESSON_META = {
    1: {"theme": "自己紹介", "themeZh": "自我介绍"},
    2: {"theme": "指示語", "themeZh": "指示事物"},
    3: {"theme": "場所", "themeZh": "场所位置"},
    4: {"theme": "存在", "themeZh": "存在与数量"},
    5: {"theme": "時間", "themeZh": "时间与ます形"},
    6: {"theme": "移動", "themeZh": "移动与方向"},
    7: {"theme": "対象", "themeZh": "对象与频率"},
    8: {"theme": "手段", "themeZh": "手段与授受"},
    9: {"theme": "イ形容詞", "themeZh": "い形容词"},
    10: {"theme": "ナ形容詞", "themeZh": "な形容词"},
    11: {"theme": "好み", "themeZh": "喜好与擅长"},
    12: {"theme": "比較", "themeZh": "比较"},
    13: {"theme": "存在と数量", "themeZh": "存在与数量词"},
    14: {"theme": "買い物と日常", "themeZh": "购物与日常活动"},
    15: {"theme": "進行と許可", "themeZh": "进行时与许可"},
    16: {"theme": "描写と状態", "themeZh": "形容词て形与状态"},
    17: {"theme": "願望", "themeZh": "愿望"},
    18: {"theme": "変化", "themeZh": "变化与推测"},
    19: {"theme": "禁止と義務", "themeZh": "禁止与义务"},
    20: {"theme": "可能", "themeZh": "可能与时间"},
    21: {"theme": "経験", "themeZh": "た形与经历"},
    22: {"theme": "常体", "themeZh": "简体"},
    23: {"theme": "並列", "themeZh": "たり·场合"},
    24: {"theme": "引用", "themeZh": "引用与思う"},
}


def js_dump(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def find_lesson_file(lesson_id: int) -> Path:
    if lesson_id == 0:
        return SRC_DIR / "50音图" / "50音图基础入门.txt"
    unit = (lesson_id - 1) // 4 + 1
    unit_dir = SRC_DIR / f"第{unit}单元"
    candidates = [
        unit_dir / f"第{unit}单元第{lesson_id:02d}课.txt",
        unit_dir / f"第{unit}单元第{lesson_id}课.txt",
        unit_dir / f"第{unit}单元{lesson_id}课.txt",
        unit_dir / f"第{unit}单元第{lesson_id}課.txt",
        unit_dir / f"第{unit}单元{lesson_id}課.txt",
    ]
    for p in candidates:
        if p.exists():
            return p
    hits = sorted(unit_dir.glob(f"*{lesson_id}*课*.txt"))
    if hits:
        return hits[0]
    hits = sorted(unit_dir.glob(f"*{lesson_id}*課*.txt"))
    if hits:
        return hits[0]
    raise FileNotFoundError(f"Lesson file not found for {lesson_id} in {unit_dir}")


def parse_vocab(text: str, lesson_id: int) -> list[dict]:
    m = re.search(r"【单词】([\s\S]*?)(?=\n【语法】|\n発音ポイント|\n語源メモ|\n活用予告|\n【会话】|\n【会話】|\n$)", text)
    if not m:
        return []
    block = m.group(1)
    rows = []
    n = 0
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("仮名") or line.startswith("漢字"):
            continue
        if "発音ポイント" in line:
            break
        parts = re.split(r"\t+", line)
        if len(parts) < 3:
            continue
        kana = parts[0].strip()
        kanji = parts[1].strip() if len(parts) >= 2 else ""
        pitch = parts[2].strip() if len(parts) >= 3 else ""
        pos = parts[3].strip() if len(parts) >= 4 else ""
        zh = parts[4].strip() if len(parts) >= 5 else ""
        jp = kanji or kana
        if not jp:
            continue
        n += 1
        rows.append(
            {
                "id": f"l{lesson_id}_v_{n}",
                "jp": jp,
                "kana": kana if kana else jp,
                "pitch": pitch,
                "pos": pos,
                "meaningZh": zh,
                "from": "text",
            }
        )
    seen = set()
    out = []
    for r in rows:
        if r["id"] in seen:
            continue
        seen.add(r["id"])
        out.append(r)
    return out


def parse_grammar(text: str, lesson_id: int) -> list[dict]:
    m = re.search(r"【语法】([\s\S]*?)(?=\n【助詞カード】|\n【会话】|\n【会話】|\n【作业】|\n$)", text)
    if not m:
        return []
    block = m.group(1).strip()
    nodes = []
    parts = re.split(r"(?=\n?ノード\d+[：:])", "\n" + block)
    idx = 0
    for part in parts:
        if not part.strip().startswith("ノード"):
            continue
        idx += 1
        head = part.strip().splitlines()[0].strip()
        title = re.sub(r"^ノード\d+[：:]\s*", "", head).strip()
        body = "\n".join(part.strip().splitlines()[1:]).strip()
        pattern_m = re.search(r"(?:句型|用法|時制|词|詞)[：:]\s*([^\n]+)", body)
        meaning_m = re.search(r"(?:意义|意味)[：:]\s*([^\n]+)", body)
        note_m = re.search(r"(?:注意|教师讲解要点|补充|语调区别|教师补充|教师讲解)[：:]\s*([\s\S]*?)(?=\n例句[：:]|\n例[：:]|\nノード|\Z)", body)
        ex_m = re.search(r"(?:例句|例)[：:]\s*([\s\S]*?)(?=\n注意[：:]|\n教师讲解|\n教师补充[：:]|\n语调区别|\nノード|\Z)", body)
        examples = []
        example_zh = []
        if ex_m:
            for ln in ex_m.group(1).splitlines():
                ln = ln.strip()
                if not ln:
                    continue
                if "→" in ln:
                    parts = ln.split("→", 1)
                    jp = parts[0].strip()
                    zh = parts[1].strip() if len(parts) > 1 else ""
                    if jp:
                        examples.append(jp)
                    if zh:
                        example_zh.append(zh)
                elif not any(kw in ln for kw in ("教师讲解", "教师补充", "注意", "补充", "语调区别")):
                    examples.append(ln)
        example = examples[0] if examples else ""
        explanation = (pattern_m.group(1).strip() if pattern_m else "").strip()
        explanation_zh = ""
        title_zh = ""
        if meaning_m:
            title_zh = meaning_m.group(1).strip()
            explanation_zh = title_zh
        if not title_zh:
            parts_title = title.split("（")
            if len(parts_title) > 1:
                title_zh = parts_title[1].rstrip("）")
        if note_m:
            extra = re.sub(r"\n{2,}", "\n", note_m.group(1).strip())
            if extra:
                explanation_zh = (explanation_zh + "\n" + extra).strip() if explanation_zh else extra
        if not explanation:
            explanation = title
        nodes.append(
            {
                "id": f"l{lesson_id}_g{idx}",
                "title": title or "文法",
                "titleZh": title_zh,
                "explanation": explanation,
                "explanationZh": explanation_zh,
                "example": example,
                "exampleZh": example_zh,
                "links": [],
                "tags": [],
            }
        )
    return nodes


def parse_particle_card(text: str, lesson_id: int) -> dict | None:
    m = re.search(r"【助詞カード】([\s\S]*?)(?=\n【対比表】|\n【会话】|\n【会話】|\n【作业】|\n$)", text)
    if not m:
        return None
    block = "\n".join([ln.rstrip() for ln in m.group(1).splitlines()]).strip()
    if not block:
        return None
    head = block.splitlines()[0].strip()
    title = head if head else f"助詞カード（第{lesson_id}課）"
    explanation_lines = []
    for ln in block.splitlines()[1:]:
        t = ln.strip()
        if not t:
            continue
        explanation_lines.append(t)
    return {
        "id": f"l{lesson_id}_g_particle",
        "title": title,
        "titleZh": "",
        "explanation": title,
        "explanationZh": "\n".join(explanation_lines).strip(),
        "example": "",
        "links": [],
        "tags": ["#助詞"],
    }


def parse_dialogues_bundle(text: str, lesson_id: int) -> tuple[list[dict], list[str], list[str], list[str]]:
    m = re.search(r"【会话】([\s\S]*?)(?=\n【作业】|\n$)", text)
    if not m:
        m = re.search(r"【会話】([\s\S]*?)(?=\n【作业】|\n$)", text)
    if not m:
        return ([], [], [], [])
    block = m.group(1)
    lines = [ln.rstrip() for ln in block.splitlines()]

    def strip_sp(s: str) -> str:
        return re.sub(r"^[^：:]{1,6}[：:]\s*", "", (s or "").strip())

    basic_lines: list[str] = []
    in_basic = False
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if t.startswith("基本课文"):
            in_basic = True
            continue
        if in_basic:
            if t.startswith("应用课文") or t.startswith("对话正文"):
                break
            if t.startswith("说明："):
                break
            if t.startswith("—"):
                continue
            basic_lines.append(t)

    script: list[str] = []
    in_script = False
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if t.startswith("对话正文"):
            in_script = True
            continue
        if in_script:
            if t.startswith("会話のキーポイント") or t.startswith("ロールプレイ") or t.startswith("【"):
                break
            script.append(t)

    scene_title = ""
    for ln in lines:
        t = ln.strip()
        if t.startswith("应用课文") and "：" in t:
            scene_title = t.split("：", 1)[1].strip()
            break
    if not scene_title:
        scene_title = "会話"

    pairs: list[tuple[str, str]] = []
    for raw in script:
        t = raw.strip()
        if not t:
            continue
        msp = re.match(r"^([^：:]{1,6})[：:]\s*(.+)$", t)
        if msp:
            pairs.append((msp.group(1).strip(), msp.group(2).strip()))
        else:
            pairs.append(("", strip_sp(t)))

    dialogues: list[dict] = []
    if len(pairs) >= 2:
        for i in range(0, len(pairs) - 1):
            sp_a, ja_a = pairs[i]
            sp_b, ja_b = pairs[i + 1]
            dialogues.append(
                {
                    "id": f"l{lesson_id}_dlg_{i+1}",
                    "title": scene_title,
                    "sceneEmoji": "📖",
                    "scenePlace": f"{i+1}",
                    "opener": {"speaker": sp_a or "A", "japanese": strip_sp(ja_a), "chinese": ""},
                    "userTurn": {
                        "speaker": sp_b or "B",
                        "replies": [{"japanese": strip_sp(ja_b), "chinese": "", "noteJa": "", "noteZh": ""}],
                    },
                }
            )

    key_points: list[str] = []
    in_kp = False
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if t.startswith("会話のキーポイント"):
            in_kp = True
            continue
        if in_kp:
            if t.startswith("ロールプレイ") or t.startswith("【"):
                break
            key_points.append(t)

    roleplay: list[str] = []
    in_rp = False
    for ln in lines:
        t = ln.strip()
        if not t:
            continue
        if t.startswith("ロールプレイ課題"):
            in_rp = True
            continue
        if in_rp:
            if t.startswith("【"):
                break
            roleplay.append(t)

    return (dialogues, key_points, roleplay, basic_lines)

def parse_quiz(text: str, lesson_id: int) -> list[dict]:
    m = re.search(r"【作业】([\s\S]*?)(?=$)", text)
    if not m:
        return []
    block = m.group(1)
    qs = []
    for q_m in re.finditer(r"(Q\d+)[：:]\s*([^\n]+)\n([\s\S]*?)(?=\nQ\d+[：:]|\Z)", block):
        qno = q_m.group(1)
        qtext = q_m.group(2).strip()
        body = q_m.group(3)
        qid = f"l{lesson_id}_" + qno.lower()
        if re.search(r"^[A-D]\.", body, re.M):
            opts = []
            for om in re.finditer(r"^([A-D])\.\s*([^\n]+)", body, re.M):
                opts.append(om.group(2).strip())
            if len(opts) == 1:
                inline = "A. " + opts[0]
                opts = []
                for im in re.finditer(r"([A-D])\.\s*([^A-D]+?)(?=(?:\s*[A-D]\.)|$)", inline):
                    opts.append(im.group(2).strip(" 　\t"))
            ans = None
            ans_m = re.search(r"→\s*([A-D])", body)
            if ans_m:
                ans = "ABCD".index(ans_m.group(1))
            if opts and ans is not None:
                qs.append(
                    {
                        "id": qid,
                        "type": "choice",
                        "question": qtext,
                        "options": opts[:4],
                        "answer": ans,
                        "explanation": "",
                        "grammarNodeId": f"l{lesson_id}_g1",
                    }
                )
        else:
            ans_m = re.search(r"→\s*([^\n]+)", body)
            ans = ans_m.group(1).strip() if ans_m else ""
            if ans:
                qs.append(
                    {
                        "id": qid,
                        "type": "fill",
                        "question": qtext,
                        "answer": ans,
                        "explanation": "",
                        "grammarNodeId": f"l{lesson_id}_g1",
                    }
                )
        if len(qs) >= 99:
            break
    return qs


def parse_homework_sections(text: str) -> list[dict]:
    m = re.search(r"【作业】([\s\S]*?)(?=\n【复习与扩展】|\n$)", text)
    if not m:
        return []
    block = "\n".join([ln.rstrip() for ln in m.group(1).splitlines()]).strip()
    if not block:
        return []
    sections = []
    cur = None
    for ln in block.splitlines():
        t = ln.strip()
        if not t:
            continue
        mhead = re.match(r"^(\d+)\.\s*(.+)$", t)
        if mhead:
            if cur and cur["lines"]:
                sections.append(cur)
            cur = {"title": mhead.group(2).strip(), "lines": []}
            continue
        if cur is None:
            cur = {"title": "作业", "lines": []}
        cur["lines"].append(t)
    if cur and cur["lines"]:
        sections.append(cur)
    return sections


def parse_summary_blocks(text: str) -> list[dict]:
    blocks = []
    for key, head_re, stop_re in [
        ("pronunciation", r"発音ポイント", r"(?:語源メモ|活用予告|【语法】|【会话】|【会話】|【作业】)"),
        ("etymology", r"語源メモ", r"(?:活用予告|【语法】|【会话】|【会話】|【作业】)"),
        ("preview", r"活用予告", r"(?:【语法】|【会话】|【会話】|【作业】)"),
        ("honorific", r"【敬語レベル表示】", r"(?:【接続表】|【自他動詞|【会话】|【会話】|【作业】)"),
    ]:
        m = re.search(rf"({head_re}[\s\S]*?)(?=\n(?:{stop_re})|\n【|\Z)", text)
        if not m:
            continue
        raw = "\n".join([ln.rstrip() for ln in m.group(1).splitlines()]).strip()
        if not raw:
            continue
        title = raw.splitlines()[0].strip()
        lines = [ln.strip() for ln in raw.splitlines()[1:] if ln.strip()]
        if lines:
            blocks.append({"key": key, "title": title, "lines": lines})
    return blocks


def parse_review_extension(text: str) -> dict:
    m = re.search(r"【复习与扩展】([\s\S]*?)$", text)
    if not m:
        return {}
    raw = m.group(1).strip()
    if not raw:
        return {}
    sections = []
    cur_title = ""
    cur_lines = []
    in_table = False
    for ln in raw.splitlines():
        t = ln.strip()
        if not t:
            continue
        if t.startswith("📖") or t.startswith("🗂") or t.startswith("📝"):
            if cur_title and cur_lines:
                sections.append({"title": cur_title, "lines": cur_lines})
            cur_title = t
            cur_lines = []
            in_table = False
            continue
        cur_lines.append(t)
    if cur_title and cur_lines:
        sections.append({"title": cur_title, "lines": cur_lines})
    return {"sections": sections} if sections else {}


def parse_title(text: str, lesson_id: int) -> str:
    first = text.splitlines()[0].strip()
    m = re.match(r"第\d+課[：:]\s*(.+)", first)
    return m.group(1).strip() if m else f"第{lesson_id}課"


def build_one(lesson_id: int) -> dict:
    p = find_lesson_file(lesson_id)
    text = p.read_text(encoding="utf-8", errors="replace")
    title = parse_title(text, lesson_id)
    meta = LESSON_META.get(lesson_id, {})
    vocab = parse_vocab(text, lesson_id)
    nodes = parse_grammar(text, lesson_id)
    particle = parse_particle_card(text, lesson_id)
    if particle:
        nodes.append(particle)
    dialogues, dialogue_kp, roleplay, basic_text = parse_dialogues_bundle(text, lesson_id)
    quiz = parse_quiz(text, lesson_id)
    homework = parse_homework_sections(text)
    summary_blocks = parse_summary_blocks(text)
    review_ext = parse_review_extension(text)
    if not nodes:
        nodes = [
            {
                "id": f"l{lesson_id}_g1",
                "title": "文法",
                "titleZh": "",
                "explanation": "（準備中）",
                "explanationZh": "",
                "example": "",
                "links": [],
                "tags": [],
            }
        ]
    for q in quiz:
        if not q.get("grammarNodeId"):
            q["grammarNodeId"] = nodes[0]["id"]
    return {
        "lessonId": lesson_id,
        "lessonTitle": title,
        "lessonTitleRuby": [],
        "theme": meta.get("theme", ""),
        "themeZh": meta.get("themeZh", ""),
        "vocab": vocab,
        "grammarNodes": nodes,
        "dialogues": dialogues,
        "quizQuestions": quiz,
        "basicText": basic_text,
        "dialogueKeyPoints": dialogue_kp,
        "rolePlayTasks": roleplay,
        "homeworkSections": homework,
        "summaryBlocks": summary_blocks,
        "reviewExtension": review_ext.get("sections", []),
    }


def main() -> None:
    lessons = []
    for lid in range(1, 25):
        lessons.append(build_one(lid))
    js = (
        "/** 自动生成：来自【产品PRD】/新增补课文内容 · 勿手改（改 txt 后重跑 scripts/generate-lessons-from-supplement.py） */\n"
        + "const LESSONS_SUPPLEMENT_MVP = "
        + js_dump(lessons)
        + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"Wrote: {OUT}")


if __name__ == '__main__':
    main()
