#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate complete LESSONS_MVP from PRD source files.
   One file, no patches, no injections — everything inline.
   Output: js/data/lessons-data.js
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRD_DIR = ROOT / "【产品PRD】" / "新增补课文内容"
OUT = ROOT / "js" / "data" / "lessons-data.js"

def find_prd(lesson_id):
    unit = (lesson_id - 1) // 4 + 1
    ud = PRD_DIR / f"第{unit}单元"
    for name in [
        f"第{unit}单元第{lesson_id:02d}课.txt",
        f"第{unit}单元第{lesson_id}课.txt",
        f"第{unit}单元{lesson_id}课.txt",
    ]:
        p = ud / name
        if p.exists(): return p
    for p in ud.glob(f"*{lesson_id}*课*.txt"):
        return p
    raise FileNotFoundError(f"L{lesson_id} not found in {ud}")

THEMES = {
    1: ("自己紹介", "自我介绍"), 2: ("指示語", "指示事物"),
    3: ("場所", "场所位置"), 4: ("存在", "存在与数量"),
    5: ("時間", "时间与ます形"), 6: ("移動", "移动与方向"),
    7: ("対象", "对象与频率"), 8: ("手段", "手段与授受"),
    9: ("イ形容詞", "い形容词"), 10: ("ナ形容詞", "な形容词"),
    11: ("好み", "喜好与擅长"), 12: ("比較", "比较"),
    13: ("数量詞", "数量词"), 14: ("て形", "て形"),
    15: ("進行", "进行态"), 16: ("状態", "状态与描写"),
    17: ("願望", "愿望"), 18: ("変化", "变化"),
    19: ("禁止", "禁止与义务"), 20: ("可能", "可能"),
    21: ("経験", "た形与经历"), 22: ("常体", "简体"),
    23: ("並列", "たり表现"), 24: ("引用", "引用与思考"),
}

def js_dump(obj): return json.dumps(obj, ensure_ascii=False, indent=2)

# ───── parsers ─────

def parse_title(text, lid):
    m = re.match(r"第\d+課[：:]\s*(.+)", text.splitlines()[0])
    return m.group(1).strip() if m else f"第{lid}課"

def parse_vocab(text, lid):
    m = re.search(r"【单词】([\s\S]*?)(?=\n【语法】|\n発音ポイント|\n語源|\n活用予告|\n【会话】|\n【会話】|\n$)", text)
    if not m: return []
    rows, n = [], 0
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line or "仮名" in line or "発音" in line: continue
        parts = re.split(r"\t+", line)
        if len(parts) < 3: continue
        kana = parts[0].strip()
        kanji = parts[1].strip() if len(parts)>1 else kana
        pitch = parts[2].strip() if len(parts)>2 else ""
        pos = parts[3].strip() if len(parts)>3 else ""
        zh = parts[4].strip() if len(parts)>4 else ""
        n += 1
        row = {"id":f"l{lid}_v_{n}","jp":kanji or kana,"kana":kana,"pitch":pitch,"pos":pos,"meaningZh":zh,"from":"text"}
        conj = gen_conjugation(kana, pos)
        if conj: row["conjugation"] = conj
        rows.append(row)
    return rows


# ───── 活用表生成 ─────
def gen_conjugation(kana, pos):
    """Generate conjugation table from dictionary form + POS"""
    if not kana or not pos: return None
    # Detect type
    is_verb = any(t in pos for t in ("動","他五","自五","他一","自一","五段","一段","サ変","カ変"))
    is_adj_i = "イ形" in pos or "形容" in pos and kana.endswith("い")
    is_adj_na = "ナ形" in pos or "形動" in pos

    if is_verb:
        stem = verb_stem(kana, pos)
        if not stem: return None
        if "五" in pos or kana[-1] in "うつるくぐすぬぶむ":
            return godan_conj(kana, stem)
            return godan_conj(kana, stem)
        elif "一" in pos or (kana.endswith("る") and len(kana)>1):  # 一段
            return ichidan_conj(kana)
        elif "サ変" in pos or kana in ("する",):  # サ変
            return sahen_conj(kana)
        elif "カ変" in pos or "来" in kana:  # カ変
            return kahen_conj()
    elif is_adj_i:
        return i_adj_conj(kana)
    elif is_adj_na:
        return na_adj_conj(kana)
    return None

def verb_stem(kana, pos):
    if "五" in pos or "う段" in pos:
        return kana[:-1] if len(kana)>1 else kana
    if "一" in pos or kana.endswith("る"):
        return kana[:-1] if len(kana)>1 else kana
    return kana[:-1] if len(kana)>1 else kana

def godan_conj(kana, stem):
    end = kana[-1]
    row_map = {"う":"わ","つ":"た","る":"ら","く":"か","ぐ":"が","す":"さ","ぬ":"な","ぶ":"ば","む":"ま"}
    i_map   = {"う":"い","つ":"ち","る":"り","く":"き","ぐ":"ぎ","す":"し","ぬ":"に","ぶ":"び","む":"み"}
    e_map   = {"う":"え","つ":"て","る":"れ","く":"け","ぐ":"げ","す":"せ","ぬ":"ね","ぶ":"べ","む":"め"}
    o_map   = {"う":"お","つ":"と","る":"ろ","く":"こ","ぐ":"ご","す":"そ","ぬ":"の","ぶ":"ぼ","む":"も"}
    a_row = row_map.get(end, end)
    return {
        "type": "五段動詞",
        "forms": {
            "否定（ない）": stem + a_row + "ない",
            "礼貌（ます）": stem + i_map.get(end, end) + "ます",
            "て形": godan_te(kana, stem, end),
            "た形": godan_ta(kana, stem, end),
            "意志（う）": stem + o_map.get(end, end) + "う",
        }
    }

def godan_te(kana, stem, end):
    rules = {"う":"って","つ":"って","る":"って","く":"いて","ぐ":"いで","す":"して","ぬ":"んで","ぶ":"んで","む":"んで"}
    return stem + rules.get(end, "って")

def godan_ta(kana, stem, end):
    rules = {"う":"った","つ":"った","る":"った","く":"いた","ぐ":"いだ","す":"した","ぬ":"んだ","ぶ":"んだ","む":"んだ"}
    return stem + rules.get(end, "った")

def ichidan_conj(kana):
    stem = kana[:-1]
    return {
        "type": "一段動詞",
        "forms": {
            "否定（ない）": stem + "ない",
            "礼貌（ます）": stem + "ます",
            "て形": stem + "て",
            "た形": stem + "た",
        }
    }

def sahen_conj(kana):
    return {
        "type": "サ変動詞",
        "forms": {
            "否定（ない）": "しない",
            "礼貌（ます）": "します",
            "て形": "して",
            "た形": "した",
        }
    }

def kahen_conj():
    return {
        "type": "カ変動詞",
        "forms": {
            "否定（ない）": "来ない（こない）",
            "礼貌（ます）": "来ます（きます）",
            "て形": "来て（きて）",
            "た形": "来た（きた）",
        }
    }

def i_adj_conj(kana):
    stem = kana[:-1]
    return {
        "type": "イ形容詞",
        "forms": {
            "否定（ない）": stem + "くない",
            "过去（た）": stem + "かった",
            "て形": stem + "くて",
            "副词化": stem + "く",
        }
    }

def na_adj_conj(kana):
    return {
        "type": "ナ形容詞",
        "forms": {
            "否定": kana + "ではない",
            "过去": kana + "だった",
            "连体（修饰）": kana + "な",
            "副词化": kana + "に",
        }
    }

def parse_grammar(text, lid):
    m = re.search(r"【语法】([\s\S]*?)(?=\n【助詞カード】|\n【対比表】|\n【敬語|【会话】|\n【会話】|\n【作业】|\n$)", text)
    if not m: return []
    block = m.group(1).strip()
    parts = re.split(r"(?=\n?ノード\d+[：:])", "\n"+block)
    nodes, idx = [], 0
    for part in parts:
        if not part.strip().startswith("ノード"): continue
        idx += 1
        lines = part.strip().splitlines()
        title = re.sub(r"^ノード\d+[：:]\s*", "", lines[0]).strip()
        body = "\n".join(lines[1:])
        pattern_m = re.search(r"(?:句型|用法)[：:]\s*(.+?)(?:\n|$)", body)
        meaning_m = re.search(r"(?:意义|意味)[：:]\s*(.+?)(?:\n|$)", body)
        note_m = re.search(r"(?:注意|教师讲解要点|教师补充|补充)[：:]\s*([\s\S]*?)(?=\n例句|\n例[：:]|\nノード|\n(?:\d+\.)|\Z)", body)
        ex_m = re.search(r"(?:例句|例)[：:]\s*([\s\S]*?)(?=\n注意[：:]|\n教师讲解|\n教师补充|\n语调|\nノード|\Z)", body)
        title_zh = ""
        if meaning_m:
            title_zh = meaning_m.group(1).strip()
        else:
            parts_t = title.split("（")
            if len(parts_t)>1: title_zh = parts_t[1].rstrip("）")
        if not title_zh:
            # Last resort: use first line of body / description text
            desc = body.strip().splitlines()
            if desc:
                first = desc[0].strip()
                if "：" in first:
                    first = first.split("：",1)[0].strip()
                title_zh = first[:30]
        explain_ja = (pattern_m.group(1).strip() if pattern_m else title)
        explain_zh = title_zh
        if note_m:
            extra = re.sub(r"\n{2,}","\n", note_m.group(1).strip())
            explain_zh = (explain_zh + "\n" + extra) if explain_zh else extra
        if not explain_zh:
            explain_zh = explain_ja[:80]
        examples, ex_zh = [], []
        if ex_m:
            for ln in ex_m.group(1).splitlines():
                ln = ln.strip()
                if not ln: continue
                if any(kw in ln for kw in ("教师讲解","教师补充","注意","语调区别")): break
                if "→" in ln:
                    jp, zh = ln.split("→",1)
                    examples.append(jp.strip())
                    ex_zh.append(zh.strip())
                else:
                    examples.append(ln)
        # Fallback: extract from tab-separated table with 示例 column
        if not examples:
            in_table = False
            for ln in body.splitlines():
                ln = ln.strip()
                if not ln: continue
                if re.search(r"示例|例[文句用]", ln): in_table = True; continue
                if in_table:
                    parts = re.split(r"\t+", ln)
                    if len(parts) >= 3 and re.search(r"[\u3040-\u309f\u30a0-\u30ff]", parts[-1]):
                        examples.append(parts[-1].strip())
                        if len(examples) >= 3: break

        example = examples[0] if examples else ""
        nodes.append({
            "id": f"l{lid}_g{idx}",
            "title": title,
            "titleZh": title_zh,
            "explanation": explain_ja,
            "explanationZh": explain_zh,
            "example": example,
            "exampleZh": ex_zh,
            "links": [],
            "tags": [],
        })
    return nodes

def parse_dialogues(text, lid):
    m = re.search(r"【会话】([\s\S]*?)(?=\n【作业】|\n$)", text)
    if not m: m = re.search(r"【会話】([\s\S]*?)(?=\n【作业】|\n$)", text)
    if not m: return [], [], [], []
    block = m.group(1)

    # Basic text
    basic = []
    in_basic = False
    for ln in block.splitlines():
        t = ln.strip()
        if not t: continue
        if "基本课文" in t:
            in_basic = True; continue
        if in_basic:
            if "应用课文" in t or "场景" in t: break
            if t.startswith("—"): continue
            if t.startswith("说明"): break
            basic.append(t)

    # Scene info
    scene_title, scene_emoji = "会話", "📖"
    for ln in block.splitlines():
        t = ln.strip()
        if "应用课文" in t and "：" in t:
            scene_title = t.split("：",1)[1].strip()
        if "出迎" in t: scene_emoji = "🛬"
        elif "買い物" in t or "買" in t: scene_emoji = "🛍️"
        elif "食事" in t or "食" in t: scene_emoji = "🍽️"
        elif "旅行" in t: scene_emoji = "✈️"
        elif "空港" in t or "飛行" in t: scene_emoji = "🛬"
        elif "病院" in t: scene_emoji = "🏥"
        elif "学校" in t: scene_emoji = "🏫"
        elif "駅" in t: scene_emoji = "🚉"

    # Dialogue script
    script = []
    in_script = False
    for ln in block.splitlines():
        t = ln.strip()
        if not t: continue
        if t.startswith("对话正文"): in_script = True; continue
        if in_script:
            if "会話のキーポイント" in t or "ロールプレイ" in t or t.startswith("【"): break
            script.append(t)

    # Parse speaker:line pairs
    pairs = []
    for raw in script:
        raw = raw.strip()
        if not raw: continue
        ms = re.match(r"^([^：:]{1,6})[：:]\s*(.+)", raw)
        if ms:
            pairs.append((ms.group(1).strip(), ms.group(2).strip()))
        else:
            pairs.append(("", raw))

    # Build dialogue entries (sequential pairs)
    dialogues = []
    for i in range(len(pairs)-1):
        sp_a, ja_a = pairs[i]
        sp_b, ja_b = pairs[i+1]
        dialogues.append({
            "id": f"l{lid}_dlg_{i+1}",
            "title": scene_title,
            "sceneEmoji": scene_emoji,
            "scenePlace": str(i+1),
            "opener": {"speaker": sp_a or "A", "japanese": ja_a, "chinese": ""},
            "userTurn": {"speaker": sp_b or "B", "replies": [{"japanese": ja_b, "chinese": "", "noteJa": "", "noteZh": ""}]},
        })

    # Key points
    key_points = []
    in_kp = False
    for ln in block.splitlines():
        t = ln.strip()
        if not t: continue
        if "会話のキーポイント" in t: in_kp = True; continue
        if in_kp:
            if "ロールプレイ" in t or t.startswith("【"): break
            key_points.append(t)

    # Role play
    roleplay = []
    in_rp = False
    for ln in block.splitlines():
        t = ln.strip()
        if not t: continue
        if "ロールプレイ課題" in t: in_rp = True; continue
        if in_rp:
            if t.startswith("【"): break
            roleplay.append(t)

    return dialogues, basic, key_points, roleplay

def parse_quiz(text, lid):
    m = re.search(r"【作业】([\s\S]*?)(?=\n【复习与扩展】|\n$)", text)
    if not m: return []
    block = m.group(1)
    qs = []
    for qm in re.finditer(r"(Q\d+)[：:]\s*([^\n]+)\n([\s\S]*?)(?=\nQ\d+[：:]|\n\d+\.|\Z)", block):
        qno = qm.group(1)
        qtext = qm.group(2).strip()
        body = qm.group(3)
        qid = f"l{lid}_" + qno.lower()
        # Check if multiple choice
        opts_raw = re.findall(r"^([A-D])\.\s*(.+)", body, re.M)
        if opts_raw:
            opts = [o[1].strip() for o in opts_raw]
            ans_m = re.search(r"→\s*([A-D])", body)
            ans = "ABCD".index(ans_m.group(1)) if ans_m else 0
            qs.append({
                "id": qid, "type": "choice",
                "question": qtext, "options": opts,
                "answer": ans, "explanation": "", "grammarNodeId": f"l{lid}_g1",
            })
        else:
            # Fill-in
            ans_m = re.search(r"→\s*(.+)", body)
            ans = ans_m.group(1).strip() if ans_m else ""
            if ans and "根据实际" not in ans and "听录音" not in qtext:
                qs.append({
                    "id": qid, "type": "fill",
                    "question": qtext, "answer": ans,
                    "explanation": "", "grammarNodeId": f"l{lid}_g1",
                })
    return qs

def parse_homework(text):
    m = re.search(r"【作业】([\s\S]*?)(?=\n【复习与扩展】|\n$)", text)
    if not m: return []
    block = m.group(1)
    sections, cur = [], None
    for ln in block.splitlines():
        t = ln.strip()
        if not t: continue
        mh = re.match(r"^(\d+)\.\s*(.+)", t)
        if mh:
            if cur and cur["lines"]: sections.append(cur)
            cur = {"title": mh.group(2).strip(), "lines": []}
            continue
        if cur is None: cur = {"title": "作业", "lines": []}
        cur["lines"].append(t)
    if cur and cur["lines"]: sections.append(cur)
    return sections

def parse_summary(text):
    blocks = []
    for key, head_re, stop_re in [
        ("pronunciation", r"発音ポイント", r"語源メモ|活用予告|【语法】|【会话】|【会話】|【作业】"),
        ("etymology", r"語源メモ", r"活用予告|【语法】|【会话】|【会話】|【作业】"),
        ("preview", r"活用予告", r"【语法】|【会话】|【会話】|【作业】"),
        ("honorific", r"【敬語レベル表示】", r"【接続表】|【自他|【会话】|【会話】|【作业】"),
    ]:
        m = re.search(rf"({head_re}[\s\S]*?)(?=\n(?:{stop_re})|\n【|\Z)", text)
        if not m: continue
        raw = "\n".join([ln.rstrip() for ln in m.group(1).splitlines()]).strip()
        if not raw: continue
        title = raw.splitlines()[0].strip()
        lines = [ln.strip() for ln in raw.splitlines()[1:] if ln.strip()]
        if lines: blocks.append({"key": key, "title": title, "lines": lines})
    return blocks

def parse_review(text):
    m = re.search(r"【复习与扩展】([\s\S]*?)$", text)
    if not m: return []
    raw = m.group(1).strip()
    if not raw: return []
    sections, cur_title, cur_lines = [], "", []
    for ln in raw.splitlines():
        t = ln.strip()
        if not t: continue
        if t.startswith("📖") or t.startswith("🗂") or t.startswith("📝"):
            if cur_title and cur_lines: sections.append({"title": cur_title, "lines": cur_lines})
            cur_title = t; cur_lines = []
            continue
        cur_lines.append(t)
    if cur_title and cur_lines: sections.append({"title": cur_title, "lines": cur_lines})
    return sections

def build_one(lid):
    path = find_prd(lid)
    text = path.read_text(encoding="utf-8", errors="replace")
    title = parse_title(text, lid)
    theme, theme_zh = THEMES.get(lid, ("", ""))
    vocab = parse_vocab(text, lid)
    grammar = parse_grammar(text, lid)
    dialogues, basic, kp, rp = parse_dialogues(text, lid)
    quiz = parse_quiz(text, lid)
    homework = parse_homework(text)
    summary = parse_summary(text)
    review = parse_review(text)

    if not grammar:
        grammar = [{"id": f"l{lid}_g1", "title": "文法", "titleZh": "", "explanation": "（準備中）", "explanationZh": "", "example": "", "links": [], "tags": []}]
    for q in quiz:
        if not q.get("grammarNodeId"): q["grammarNodeId"] = grammar[0]["id"]

    return {
        "lessonId": lid,
        "lessonTitle": title,
        "lessonTitleRuby": [],
        "theme": theme,
        "themeZh": theme_zh,
        "vocab": vocab,
        "grammarNodes": grammar,
        "dialogues": dialogues,
        "quizQuestions": quiz,
        "basicText": basic,
        "dialogueKeyPoints": kp,
        "rolePlayTasks": rp,
        "homeworkSections": homework,
        "summaryBlocks": summary,
        "reviewExtension": review,
    }

def main():
    lessons = [build_one(i) for i in range(1, 25)]
    total_vocab = sum(len(l["vocab"]) for l in lessons)
    total_grammar = sum(len(l["grammarNodes"]) for l in lessons)
    total_quiz = sum(len(l["quizQuestions"]) for l in lessons)
    total_dlg = sum(len(l["dialogues"]) for l in lessons)
    js = (
        "/** 自动生成：来自【产品PRD】/新增补课文内容 */\n"
        + "const LESSONS_MVP = " + js_dump(lessons) + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"Generated: {OUT}")
    print(f"  lessons: {len(lessons)}")
    print(f"  vocab: {total_vocab}")
    print(f"  grammar nodes: {total_grammar}")
    print(f"  quiz questions: {total_quiz}")
    print(f"  dialogue entries: {total_dlg}")

if __name__ == "__main__":
    main()
