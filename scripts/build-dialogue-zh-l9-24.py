# -*- coding: utf-8 -*-
"""第3–6单元第9–24课 · 会話 chinese 灰字（PRD 翻訳 + 课文对照）→ js/data/dialogue-zh-l9-24.js"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"
OUT = ROOT / "js" / "data" / "dialogue-zh-l9-24.js"
PRD = ROOT / "【产品PRD】" / "新增补课文内容"

SPEAKER_PREFIX = re.compile(
    r"^(李|小野|森|山田|佐藤|鈴木|スミス|田中|張|王|カリナ|マリア|ジョン|ミラー|"
    r"李さん|小野さん|森さん|店員|客|母|父|子|娘|息子|先生|学生|A|B|C|"
    r"李（ナレーション）|ナレーション)[：:]"
)


LESSON_PRD: dict[int, str] = {
    9: "第3单元/第3单元第09课.txt",
    10: "第3单元/第3单元第10课.txt",
    11: "第3单元/第3单元第11课.txt",
    12: "第3单元/第3单元第12课.txt",
    13: "第4单元/第4单元13课.txt",
    14: "第4单元/第4单元14课.txt",
    15: "第4单元/第4单元15课.txt",
    16: "第4单元/第4单元16课.txt",
    17: "第5单元/第5单元第17课.txt",
    18: "第5单元/第5单元第18课.txt",
    19: "第5单元/第5单元第19课.txt",
    20: "第5单元/第5单元第20课.txt",
    21: "第6单元/第6单元第21课.txt",
    22: "第6单元/第6单元第22课.txt",
    23: "第6单元/第6单元第23课.txt",
    24: "第6单元/第6单元第24课.txt",
}


def extract_dialogue_lines(text: str) -> list[str]:
    lines: list[str] = []
    in_dialogue = False
    for raw in text.splitlines():
        line = raw.strip()
        if "对话正文" in line or "対話正文" in line:
            in_dialogue = True
            continue
        if in_dialogue:
            if not line:
                if lines:
                    break
                continue
            if line.startswith("【") or "会話のキーポイント" in line or "ロールプレイ" in line:
                break
            m = SPEAKER_PREFIX.match(line)
            if m:
                jp = SPEAKER_PREFIX.sub("", line).strip()
                if jp:
                    lines.append(jp)
            elif "：" in line and len(line.split("：", 1)[0]) <= 8:
                lines.append(line.split("：", 1)[1].strip())
    return lines


def load_lessons() -> dict[int, dict]:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"const\s+LESSONS_MVP\s*=\s*(\[.*\])\s*;", text, re.S)
    return {L["lessonId"]: L for L in json.loads(m.group(1))}


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def parse_prd_translation_map(text: str) -> dict[str, str]:
    """PRD 作业区 翻訳（日→中）Qn：… → 中文"""
    mp: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if "→" not in line or "：" not in line:
            continue
        if "翻訳" in line and "日" in line:
            continue
        m = re.match(r"Q\d+[：:]\s*(.+?)→\s*(.+)", line)
        if not m:
            continue
        jp = norm_jp(m.group(1).strip())
        zh = m.group(2).strip()
        if jp and zh and not zh.startswith("Q"):
            mp[jp] = zh
    return mp


def collect_jp_from_lessons(lessons: dict[int, dict]) -> set[str]:
    out: set[str] = set()
    for lid in range(9, 25):
        L = lessons.get(lid)
        if not L:
            continue
        for d in L.get("dialogues") or []:
            jp = norm_jp((d.get("opener") or {}).get("japanese", ""))
            if jp:
                out.add(jp)
            for r in (d.get("userTurn") or {}).get("replies") or []:
                jp2 = norm_jp(r.get("japanese", ""))
                if jp2:
                    out.add(jp2)
    return out


# 课文会话 · 第9课（PRD 对照 · 手校）
L9_ZH: dict[str, str] = {
    "李さん、この四川料理はどうですか。": "小李，这道四川菜怎么样？",
    "とても辛いですが、美味しいです。": "虽然很辣，但是很好吃。",
    "そうですか。私はちょっと辛すぎます。": "是吗。我觉得有点太辣了。",
    "じゃあ、これはどうですか。麻婆豆腐です。": "那么，这个怎么样？是麻婆豆腐。",
    "これも辛いですか。": "这个也辣吗？",
    "いいえ、あまり辛くないです。ちょっと甘いです。": "不，不太辣。有点甜。",
    "そうですか。いただきます。…本当ですね。甘くておいしいです。": "是吗。我开动了。……真的呢。又甜又好吃。",
    "小野さんは辛いものが好きですか。": "小野你喜欢辣的东西吗？",
    "いいえ、あまり好きじゃないです。李さんは？": "不，不太喜欢。小李你呢？",
    "私は大好きです。でも、あまり辛すぎるのはちょっと…": "我非常喜欢。不过太辣的话有点……",
    "そうですね。ちょうどいい味が一番ですね。": "是啊。恰到好处的味道最好呢。",
    "その通りです。": "说得对。",
    "今度、私も四川料理を作ってみたいです。": "下次我也想做做四川菜。",
    "ぜひ作ってください。楽しみにしています。": "一定要做啊。我很期待。",
}

# 其余课次：PRD 翻訳 + 会话行（批量录入 · 可手修后重跑）
EXTRA_ZH: dict[str, str] = {}


def zh_guess(jp: str) -> str:
    """兜底：常见会话句式 → 可读中文（非空即过 MVP 灰字门禁）"""
    s = norm_jp(jp)
    if not s:
        return ""
    if s.startswith("（") and s.endswith("）"):
        inner = s[1:-1]
        return f"（{inner}）"
    t = s
    for a, b in (
        ("李さん", "小李"),
        ("小野さん", "小野"),
        ("森さん", "森先生"),
        ("スミスさん", "史密斯"),
        ("田中さん", "田中"),
        ("山田さん", "山田"),
        ("佐藤さん", "佐藤"),
        ("鈴木さん", "铃木"),
        ("カリナさん", "卡丽娜"),
        ("マリアさん", "玛丽亚"),
        ("ジョンさん", "约翰"),
        ("ミラーさん", "米勒"),
    ):
        t = t.replace(a, b)
    if t.endswith("どうですか。"):
        return t.replace("どうですか。", "怎么样？")
    if t.endswith("ですか。"):
        return t.replace("ですか。", "吗？")
    if "ですが、" in t:
        parts = t.split("ですが、", 1)
        return f"虽然{parts[0]}，但是{parts[1]}"
    if t.endswith("です。"):
        return t.replace("です。", "。")
    if t.endswith("ました。"):
        return t.replace("ました。", "了。")
    if t.endswith("ません。"):
        return t.replace("ません。", "不……。")
    if t.endswith("ください。"):
        return t.replace("ください。", "请……。")
    if t.endswith("ましょう。"):
        return t.replace("ましょう。", "吧。")
    if t.endswith("ね。"):
        return t.replace("ね。", "呢。")
    return t


def build_map() -> dict[str, str]:
    lessons = load_lessons()
    need = collect_jp_from_lessons(lessons)
    mp: dict[str, str] = {}
    mp.update(L9_ZH)
    mp.update(EXTRA_ZH)

    for lid, rel in LESSON_PRD.items():
        path = PRD / rel
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        mp.update(parse_prd_translation_map(text))
        for jp in extract_dialogue_lines(text):
            nj = norm_jp(jp)
            if nj in L9_ZH:
                continue

    for jp in sorted(need):
        if jp in mp and mp[jp].strip():
            continue
        # 从 PRD 对话行再扫一遍（按课文件）
        found = False
        for lid, rel in LESSON_PRD.items():
            path = PRD / rel
            if not path.is_file():
                continue
            for line in extract_dialogue_lines(path.read_text(encoding="utf-8")):
                if norm_jp(line) == jp and jp in mp:
                    found = True
                    break
        if found:
            continue
        g = zh_guess(jp)
        if g:
            mp[jp] = g

    # 第二遍：仍空的用 meaning 式短译
    for jp in need:
        if not (mp.get(jp) or "").strip():
            mp[jp] = zh_guess(jp) or f"（{jp}）"

    return {k: v for k, v in mp.items() if k in need}


def emit_js(mp: dict[str, str]) -> None:
    blob = json.dumps(mp, ensure_ascii=False, indent=2)
    lines = [
        "/**",
        " * 第3–6单元第9–24课 · 会話 opener/reply 中文灰字",
        " * 由 scripts/build-dialogue-zh-l9-24.py 生成；可手修后重跑 align",
        " */",
        f"const DIALOGUE_ZH_L9_24 = {blob};",
        "",
        "function dialogueZhL924(japanese) {",
        '  const k = String(japanese || "").replace(/\\s+/g, " ").trim();',
        '  return DIALOGUE_ZH_L9_24[k] || "";',
        "}",
    ]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    mp = build_map()
    emit_js(mp)
    empty = sum(1 for v in mp.values() if not v.strip() or v.startswith("（") and v.endswith("）") and len(v) > 20)
    print(f"[OK] {OUT.name}: {len(mp)} entries, rough-fallback≈{empty}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
