#!/usr/bin/env python3
"""单元四格开工校对：对齐彩蛋 txt、curriculum headline、storyboard.js。"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 与 docs/story-unit-production-workflow.md §3 一致
EGG_TXT: dict[int, str] = {
    1: "彩蛋/单元1/彩蛋-单元1（1-4）md.txt",
    2: "彩蛋/单元2/彩蛋-单元2（5-8）md.txt",
    3: "彩蛋/单元3/3单元（9、10、11、12）md.txt",
    4: "彩蛋/单元4/4单元（13、14、15、16）md.txt",
    5: "彩蛋/单元5/第5单元（17、18、19、20）md.txt",
    6: "彩蛋/单元6/第6单元（21、22、23、24）md.txt",
}

LESSON_HEADLINES: dict[int, str] = {
    1: "李さんは中国人です",
    2: "これは本です",
    3: "ここはデパートです",
    4: "部屋に机といすがあります",
    5: "森さんは七時に起きます",
    6: "吉田さんは来月中国へ行きます",
    7: "李さんは毎日コーヒーを飲みます",
    8: "李さんは日本語で手紙を書きます",
    9: "四川料理は辛いです",
    10: "京都の紅葉は有名です",
    11: "小野さんは歌が好きです",
    12: "李さんは森さんより若いです",
    13: "机の上に本が三冊あります",
    14: "昨日デパートへ行って、買い物をしました",
    15: "小野さんは今新聞を読んでいます",
    16: "ホテルの部屋は広くて明るいです",
    17: "わたしは新しい洋服がほしいです",
    18: "携帯電話はとても小さくなりました",
    19: "部屋のかぎを忘れないでください",
    20: "スミスさんはピアノを弾くことができます",
    21: "わたしはすき焼きを食べたことがあります",
    22: "森さんは今晩テレビを見る",
    23: "休みの日、散歩したり買い物に行ったりします",
    24: "李さんはもうすぐ来ると思います",
}

DERIVED_EN_DOC: dict[int, str] = {
    1: "docs/storyboard-P1-单元1-彩蛋重绘.md",
    2: "docs/storyboard-P2-单元2-彩蛋重绘.md",
    3: "docs/storyboard-P3-单元3-彩蛋重绘.md",
    4: "docs/storyboard-P4-单元4-彩蛋重绘.md",
    5: "docs/storyboard-P5-单元5-彩蛋重绘.md",
    6: "docs/storyboard-P6-单元6-彩蛋重绘.md",
}


def load_locked() -> dict:
    p = ROOT / "assets/story/LOCKED.json"
    if not p.is_file():
        return {}
    return json.loads(p.read_text(encoding="utf-8")).get("units", {})


def _unit_block(js: str, unit: int) -> str:
    start_m = re.search(rf"unitId:\s*{unit},", js)
    if not start_m:
        return ""
    start = start_m.start()
    next_m = re.search(rf"unitId:\s*{unit + 1},", js[start + 8 :])
    end = start + 8 + next_m.start() if next_m else len(js)
    return js[start:end]


def parse_unit_panels(js: str, unit: int) -> list[dict]:
    """从 unit-strip-storyboard.js 粗解析指定单元的 panels。"""
    block = _unit_block(js, unit)
    if not block:
        return []
    out: list[dict] = []
    for ch in re.finditer(
        r"lessonId:\s*(\d+),([\s\S]*?)(?=lessonId:\s*\d+,|\n\s*\],)",
        block,
    ):
        body = ch.group(0)
        lid = int(ch.group(1))
        sc = re.search(r'sceneCloud:\s*"([^"]*)"', body)
        vb = re.search(r'visualBeat:\s*\n\s*"([^"]*)"', body) or re.search(
            r'visualBeat:\s*"([^"]*)"', body
        )
        hd = re.search(r'headline:\s*"([^"]*)"', body)
        note = re.search(r'note:\s*"([^"]*)"', body)
        out.append(
            {
                "lessonId": lid,
                "sceneCloud": sc.group(1) if sc else "",
                "visualBeat": vb.group(1) if vb else "",
                "headline": hd.group(1) if hd else "",
                "note": note.group(1) if note else "",
            }
        )
    return out


def check_egg_txt(path: Path, lessons: list[int]) -> tuple[bool, list[str]]:
    if not path.is_file():
        return False, ["文件不存在"]
    text = path.read_text(encoding="utf-8", errors="replace")
    issues: list[str] = []
    if "AI提示词" not in text and "🎨" not in text:
        issues.append("未找到 🎨 AI提示词 块")
    for lid in lessons:
        if f"第{lid}課" not in text and f"第{lid}课" not in text:
            issues.append(f"txt 内缺少 第{lid}課 段落")
    return len(issues) == 0, issues


def main() -> None:
    ap = argparse.ArgumentParser(description="单元四格开工校对")
    ap.add_argument("--unit", type=int, required=True, choices=range(1, 7))
    args = ap.parse_args()
    u = args.unit
    lessons = [u * 4 - 3 + i for i in range(4)]

    print(f"\n=== 单元 {u} 开工校对 ===\n")
    print("必读: docs/story-unit-production-workflow.md §2\n")

    # A 彩蛋 txt
    rel = EGG_TXT[u]
    egg_path = ROOT / rel
    ok, issues = check_egg_txt(egg_path, lessons)
    mark = "OK" if ok else "FAIL"
    print(f"[A] 彩蛋提示词  {rel}  -> {mark}")
    for i in issues:
        print(f"    - {i}")

    # B headlines
    print("\n[B] curriculum headline（四课）")
    for lid in lessons:
        print(f"    L{lid}: {LESSON_HEADLINES.get(lid, '?')}")

    # C storyboard.js
    js_path = ROOT / "js/data/unit-strip-storyboard.js"
    js = js_path.read_text(encoding="utf-8")
    panels = parse_unit_panels(js, u)
    print(f"\n[C] unit-strip-storyboard.js  unitId={u}  ({len(panels)} panels)")
    all_vb = True
    for p in panels:
        lid = p["lessonId"]
        vb = p["visualBeat"].strip()
        flag = "OK" if vb else "MISSING visualBeat"
        if not vb:
            all_vb = False
        print(f"    L{lid}: {flag}")
        if p["sceneCloud"]:
            print(f"         sceneCloud: {p['sceneCloud'][:72]}...")
        if vb:
            print(f"         visualBeat: {vb[:72]}...")
        if p["note"]:
            print(f"         note: {p['note']}")
    if len(panels) != 4:
        print(f"    WARN: 期望 4 panels，解析到 {len(panels)}")

    # I derived en doc
    en = DERIVED_EN_DOC.get(u)
    if en:
        exists = (ROOT / en).is_file()
        print(f"\n[I] 英文合并稿  {en}  -> {'OK' if exists else 'MISSING'}")
    else:
        print(f"\n[I] 英文合并稿  （待写 storyboard-P*-单元{u}-彩蛋重绘.md）")

    # J lock
    locked = load_locked()
    key = str(u)
    if key in locked:
        print(f"\n[J] 锁定状态  LOCKED since {locked[key].get('locked', '?')}")
        print(f"    勿改 clean/strip；见 {locked[key].get('doc', '')}")
    else:
        print("\n[J] 锁定状态  未锁定")

    # assets
    print("\n[产出] assets/story/")
    for i in range(1, 5):
        clean = ROOT / f"assets/story/unit-{u}-panel-{i}-clean.png"
        print(f"    panel-{i}-clean: {'有' if clean.is_file() else '无'}")
    strip = ROOT / f"assets/story/unit-{u}-strip.webp"
    print(f"    strip.webp: {'有' if strip.is_file() else '无'}")

    print("\n--- 结论 ---")
    blockers: list[str] = []
    if not ok:
        blockers.append("彩蛋 txt")
    if not all_vb or len(panels) != 4:
        blockers.append("storyboard visualBeat/格数")
    if blockers:
        print("建议先修:", ", ".join(blockers), "→ 再出图")
    else:
        print("文档对齐基本就绪，可进入 harmonize / finish / 出图")
    print()


if __name__ == "__main__":
    main()
