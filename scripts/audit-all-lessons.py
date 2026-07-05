import json, re, sys

d = open("js/data/lessons-data.js", "r", encoding="utf-8").read()
lessons = json.loads(d[d.index("["):d.rindex("]") + 1])

print("=== 1. 数据完整性 ===")
print(f"{'课':>3} {'标题':<22} {'词':>3} {'法':>2} {'zh':>2} {'例':>2} {'明':>2} {'测':>3} {'话':>3} {'SB':>8} {'关联':>3} {'状态'}")
issues = []
for l in sorted(lessons, key=lambda x: x["lessonId"]):
    lid = l["lessonId"]
    t = (l.get("lessonTitle", "") or "")[:20]
    v = len(l.get("vocab", []))
    gn = l.get("grammarNodes", [])
    g = len(gn)
    gn_zh = sum(1 for n in gn if n.get("titleZh", "") and len(n.get("titleZh", "")) > 1)
    gn_ex = sum(1 for n in gn if n.get("example", ""))
    gn_exp = sum(1 for n in gn if n.get("explanationZh", ""))
    q = len(l.get("quizQuestions", []))
    dg = len(l.get("dialogues", []))
    sb = l.get("summaryBlocks", [])
    sb_keys = [b.get("key", "") for b in sb]
    re_sec = l.get("reviewExtension", [])
    cross = 0
    for s in re_sec:
        if "まとめ" in s.get("title", ""):
            for ln in s.get("lines", []):
                if re.match(r"第\d+课", ln):
                    cross += 1
    flags = []
    if gn_zh < g: flags.append(f"titleZh缺{g-gn_zh}")
    if gn_ex < g: flags.append(f"example缺{g-gn_ex}")
    if gn_exp < g: flags.append(f"explain缺{g-gn_exp}")
    if v == 0: flags.append("无词")
    if q == 0: flags.append("无测")
    if dg == 0: flags.append("无话")
    if cross == 0: flags.append("无关联")
    status = "⚠ " + ",".join(flags) if flags else "✅"
    if status != "✅": issues.append((lid, status))
    print(f"{lid:>3} {t:<22} {v:>3} {g:>2} {gn_zh:>2} {gn_ex:>2} {gn_exp:>2} {q:>3} {dg:>3} {str(sb_keys):>8} {cross:>3} {status}")

print(f"\n问题课数: {len(issues)}/24")
for lid, s in issues:
    print(f"  L{lid}: {s}")

# 2. Check for machine-translation patterns in Chinese text
print("\n=== 2. 翻译质量检测 ===")
mach_patterns = [
    ("的", "过于频繁用「的」"),
    ("相当于", "机械翻译词「相当于」"),
    ("表示", "机械翻译词「表示」"),
    ("用于", "机械翻译词「用于」"),
    ("...等等", "机械翻译词「...等等」"),
]
for l in sorted(lessons, key=lambda x: x["lessonId"]):
    lid = l["lessonId"]
    gn = l.get("grammarNodes", [])
    bad = []
    for n in gn:
        zh = n.get("explanationZh", "") or ""
        if len(zh) > 80 and "相当于" in zh:
            bad.append(f"{n['id']}: 含'相当于'")
    if bad:
        print(f"  L{lid}: {bad[0]}")

# 3. Check cross-lesson completeness  
print("\n=== 3. 跨课关联统计 ===")
total_cross = sum(
    sum(1 for ln in s.get("lines", []) if re.match(r"第\d+课", ln))
    for l in lessons
    for s in l.get("reviewExtension", [])
    if "まとめ" in s.get("title", "")
)
print(f"关联总数: {total_cross}")

# 4. Summary
print(f"\n=== 4. 总结 ===")
print(f"总词数: {sum(len(l.get('vocab',[])) for l in lessons)}")
print(f"总语法: {sum(len(l.get('grammarNodes',[])) for l in lessons)}")
print(f"总测验: {sum(len(l.get('quizQuestions',[])) for l in lessons)}")
print(f"总对话: {sum(len(l.get('dialogues',[])) for l in lessons)}")
gn_total = sum(len(l.get("grammarNodes", [])) for l in lessons)
gn_zh_ok = sum(sum(1 for n in l.get("grammarNodes", []) if n.get("titleZh", "") and len(n.get("titleZh", "")) > 1) for l in lessons)
gn_ex_ok = sum(sum(1 for n in l.get("grammarNodes", []) if n.get("example", "")) for l in lessons)
print(f"语法titleZh完整: {gn_zh_ok}/{gn_total}")
print(f"语法example完整: {gn_ex_ok}/{gn_total}")
