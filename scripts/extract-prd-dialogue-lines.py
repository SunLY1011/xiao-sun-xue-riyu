# -*- coding: utf-8 -*-
"""从 PRD txt 提取会話行（lesson 9–24）"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRD = ROOT / "【产品PRD】" / "新增补课文内容"

# lessonId -> glob pattern under unit folder
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

SPEAKER_PREFIX = re.compile(
    r"^(李|小野|森|山田|佐藤|鈴木|スミス|田中|張|王|カリナ|マリア|ジョン|ミラー|"
    r"李さん|小野さん|森さん|店員|客|母|父|子|娘|息子|先生|学生|A|B|C|"
    r"李（ナレーション）|ナレーション)[：:]"
)


def extract_dialogue_lines(text: str) -> list[str]:
    lines: list[str] = []
    in_dialogue = False
    for raw in text.splitlines():
        line = raw.strip()
        if "对话正文" in line or "対話正文" in line or line == "对话正文：":
            in_dialogue = True
            continue
        if in_dialogue:
            if not line:
                if lines:
                    break
                continue
            if line.startswith("【") or "会話のキーポイント" in line or "ロールプレイ" in line:
                break
            if SPEAKER_PREFIX.match(line):
                jp = SPEAKER_PREFIX.sub("", line).strip()
                if jp:
                    lines.append(jp)
            elif "：" in line and not line.startswith("「"):
                parts = line.split("：", 1)
                if len(parts) == 2 and len(parts[0]) <= 8:
                    lines.append(parts[1].strip())
    return lines


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    all_jp: set[str] = set()
    for lid, rel in sorted(LESSON_PRD.items()):
        path = PRD / rel
        if not path.is_file():
            print(f"[MISS] L{lid} {path}")
            continue
        text = path.read_text(encoding="utf-8")
        dlg = extract_dialogue_lines(text)
        print(f"L{lid}: {len(dlg)} lines from {path.name}")
        for jp in dlg:
            all_jp.add(norm_jp(jp))
    print(f"unique JP lines: {len(all_jp)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
