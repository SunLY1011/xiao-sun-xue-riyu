#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""讲义腔中文 → 口语解析（grammar/作業/拡張/测验 · 批次 D）"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "js" / "data" / "lessons-data.js"

# 顺序敏感：先长后短
REPLACEMENTS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"表示说话时刻正在进行的动作（现在进行时）"), "说话时正在做的动作（现在进行时）"),
    (re.compile(r"表示动作发生后，其结果状态持续存在"), "动作结束后，结果状态还在持续"),
    (re.compile(r"表示做某事所用的工具、语言、方法等"), "说明用什么工具、语言或方式做某事"),
    (re.compile(r"表示移动的方向或目的地"), "说明移动的方向或目的地"),
    (re.compile(r"表示移动的手段、方式"), "说明交通方式或移动手段"),
    (re.compile(r"表示动作的直接对象（宾语）"), "宾语用「を」标出"),
    (re.compile(r"表示做某事（动作性愿望）"), "想做某事（动词愿望）"),
    (re.compile(r"表示想要某物（名词性愿望）"), "想要某样东西（名词愿望）"),
    (re.compile(r"表示有做某事的能力或客观上的可能性"), "能够做某事／有可能做某事"),
    (re.compile(r"表示允许做某事（可以）"), "允许做某事（可以说「可以…」）"),
    (re.compile(r"表示请求许可（礼貌问法）"), "礼貌地问「可以吗？」"),
    (re.compile(r"表示说话时刻正在进行的动作"), "说话时正在做的动作"),
    (re.compile(r"表示过去的状态或过去的名词判断"), "说明过去的状态或判断"),
    (re.compile(r"表示过去的动作或状态"), "说明过去的动作或状态"),
    (re.compile(r"表示现在的状态或现在的名词判断"), "说明现在的状态"),
    (re.compile(r"表示将来的计划（预定做）"), "打算做某事（预定）"),
    (re.compile(r"表示转折（虽然…但是）"), "转折：虽然…但是…"),
    (re.compile(r"表示推测或确认（吧）"), "推测或确认（吧）"),
    (re.compile(r"表示轻微的疑问（口语）"), "口气较随意的疑问"),
    (re.compile(r"表示「在…的情况下」"), "在…情况下"),
    (re.compile(r"表示「是否…」"), "是否…（嵌入疑问）"),
    (re.compile(r"表示「根据…（不同而不同）」"), "根据…而不同"),
    (re.compile(r"表示「的…方法」"), "…的做法"),
    (re.compile(r"表示「的…」"), "…的"),
    (re.compile(r"表示比较基准"), "比较时以…为基准"),
    (re.compile(r"表示选择偏好"), "比较后更选哪一个"),
    (re.compile(r"表示在某个范围内最"), "在范围内最…"),
    (re.compile(r"表示同一与否"), "一样还是不一样"),
    (re.compile(r"用于轻松的非正式场合"), "口语、非正式场合常用"),
    (re.compile(r"用于说明书、注意事项等书面语或正式口语"), "书面说明或正式场合常用"),
    (re.compile(r"用于请求/允许"), "请求许可或表示允许"),
    (re.compile(r"用于提出话题（铺垫）"), "先引出话题（铺垫）"),
    (re.compile(r"用于轻松的"), "口气轻松的场合用"),
    (re.compile(r"用于"), "用在"),
    (re.compile(r"表示"), "说明"),
    (re.compile(r"进行形"), "进行时"),
    (re.compile(r"进行态"), "进行时"),
    (re.compile(r"进行/习惯"), "正在做／习惯"),
    (re.compile(r"进行、习惯"), "正在做、习惯"),
    (re.compile(r"（进行）"), "（正在做）"),
    (re.compile(r"的意思，"), "的意思，"),  # keep natural
    (re.compile(r"的意思。"), "的意思。"),
    (re.compile(r"本课主要使用"), "本课重点用"),
    (re.compile(r"本课扩展为"), "本课还用来表示"),
    (re.compile(r"与「を使って」意思相近"), "和「を使って」差不多"),
    (re.compile(r"意思相近"), "意思差不多"),
    (re.compile(r"意思相同"), "意思一样"),
]

# 不改：角色扮演「进行对话」、单元测「进行…测试」、语法术语「进行时」已单独处理
SKIP_IF_MATCH = re.compile(
    r"进行(对话|接机|点单|单元|第\d|复习|扮演)|"
    r"课题\d|两人一组|"
    r"测试|"
    r"听录音"
)


def polish(text: str) -> str:
    if not text or not isinstance(text, str):
        return text
    if SKIP_IF_MATCH.search(text):
        return text
    out = text
    for pat, repl in REPLACEMENTS:
        out = pat.sub(repl, out)
    return out


def polish_value(v):
    if isinstance(v, str):
        return polish(v)
    if isinstance(v, list):
        return [polish_value(x) for x in v]
    if isinstance(v, dict):
        return {k: polish_value(x) for k, x in v.items()}
    return v


def walk_lesson(L: dict) -> int:
    n = 0
    before = json.dumps(L, ensure_ascii=False)

    for g in L.get("grammarNodes") or []:
        for key in ("titleZh", "explanationZh", "explanation"):
            if key in g:
                g[key] = polish_value(g[key])
    for sec in L.get("homeworkSections") or []:
        sec["title"] = polish(sec.get("title", ""))
        sec["lines"] = polish_value(sec.get("lines"))
    for q in L.get("quizQuestions") or []:
        for key in ("explanation", "explanationZh", "questionZh"):
            if key in q:
                q[key] = polish_value(q[key])
    for key in ("dialogueKeyPoints", "rolePlayTasks", "lessonCoachSummary"):
        if key in L:
            L[key] = polish_value(L[key])
    for block in L.get("reviewExtension") or []:
        block["title"] = polish(block.get("title", ""))
        block["lines"] = polish_value(block.get("lines"))
    for block in L.get("summaryBlocks") or []:
        if "lines" in block:
            block["lines"] = polish_value(block["lines"])

    after = json.dumps(L, ensure_ascii=False)
    return 1 if before != after else 0


def load_save() -> int:
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"(const\s+LESSONS_MVP\s*=\s*)(\[.*\])(\s*;)", text, re.S)
    lessons = json.loads(m.group(2))
    changed = 0
    for L in lessons:
        if L.get("lessonId") == 1:
            continue  # 第1课冻结：讲义腔改写跳过
        changed += walk_lesson(L)
    new_json = json.dumps(lessons, ensure_ascii=False, indent=2)
    DATA.write_text(text[: m.start(2)] + new_json + text[m.end(2) :], encoding="utf-8")
    return changed


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    n = load_save()
    print(f"[OK] patch-zh-lecture-tone: {n} lessons touched")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
