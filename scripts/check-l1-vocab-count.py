# -*- coding: utf-8 -*-
"""对账：第1课 PRD 单词表 vs lessons-data.js 与 UI 过滤"""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRD = ROOT / "【产品PRD】" / "新增补课文内容" / "第1单元" / "第1单元第01课.txt"
DATA = ROOT / "js" / "data" / "lessons-data.js"


def parse_prd_vocab(text: str) -> list[dict]:
    rows = []
    in_vocab = False
    for line in text.splitlines():
        s = line.strip()
        if s == "【单词】":
            in_vocab = True
            continue
        if in_vocab and s.startswith("【"):
            break
        if not in_vocab or not s or s.startswith("仮名"):
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        rows.append(
            {
                "kana": parts[0].strip().replace("〜", "～"),
                "jp": parts[1].strip().replace("〜", "～"),
                "pitch": parts[2].strip(),
                "pos": parts[3].strip(),
                "meaningZh": parts[4].strip(),
            }
        )
    return rows


def parse_data_vocab(js: str) -> list[dict]:
    m = re.search(r'"lessonId": 1,.*?"vocab": \[(.*?)\],\s*"grammarNodes"', js, re.S)
    if not m:
        return []
    block = m.group(1)
    items = []
    for chunk in re.finditer(
        r'\{\s*"id": "l1_v_\d+".*?\}',
        block,
        re.S,
    ):
        c = chunk.group(0)
        def field(name):
            fm = re.search(rf'"{name}": "([^"]*)"', c)
            return fm.group(1) if fm else ""
        items.append(
            {
                "id": field("id"),
                "jp": field("jp").replace("〜", "～"),
                "kana": field("kana").replace("〜", "～"),
                "pitch": field("pitch"),
                "pos": field("pos"),
                "meaningZh": field("meaningZh"),
                "from": field("from"),
            }
        )
    return items


def ui_filter(v: dict) -> bool:
    jp = v.get("jp") or ""
    return v.get("from") != "grammar" and not re.search(r"形$|ください$|ましょう", jp)


def main():
    prd = parse_prd_vocab(PRD.read_text(encoding="utf-8"))
    data = parse_data_vocab(DATA.read_text(encoding="utf-8"))
    shown = [v for v in data if ui_filter(v)]
    dropped = [v for v in data if not ui_filter(v)]

    print(f"PRD 单词: {len(prd)}")
    print(f"lessons-data vocab: {len(data)}")
    print(f"UI 过滤后: {len(shown)}")
    if dropped:
        print("被 UI 误过滤:")
        for v in dropped:
            print(f"  - {v['id']} {v['jp']} from={v.get('from')}")

    prd_kana = [r["kana"] for r in prd]
    data_kana = [v["kana"] for v in data]
    for i, r in enumerate(prd):
        if i >= len(data_kana) or r["kana"] != data_kana[i]:
            print(f"顺序/内容偏差 @{i+1}: PRD {r['kana']}/{r['jp']} vs DATA {data_kana[i] if i < len(data_kana) else '—'}")
            break
    else:
        if len(prd) == len(data):
            print("顺序与 PRD 表一致（按 kana 行）")

    prd_set = {r["kana"] for r in prd}
    data_set = {v["kana"] for v in data}
    print("PRD 有、data 无:", [r["kana"] for r in prd if r["kana"] not in data_set])
    print("data 有、PRD 无:", [v["kana"] for v in data if v["kana"] not in prd_set])

    return 0 if len(prd) == len(data) == len(shown) else 1


if __name__ == "__main__":
    raise SystemExit(main())
