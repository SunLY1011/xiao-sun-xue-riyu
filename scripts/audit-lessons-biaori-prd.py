#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批次 E · 第1–24课 PRD ↔ lessons-data 单词对账（只读报告）"""
from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_ALL = ROOT / "docs" / "audit-lessons-biaori-prd-最新.md"
OUT_L2 = ROOT / "docs" / "audit-lessons-L2-24-biaori-prd-最新.md"

sys.path.insert(0, str(ROOT / "scripts"))
from biaori_prd_vocab import audit_lesson, audit_lessons_range  # noqa: E402


def status_icon(status: str) -> str:
    return {"PASS": "✅", "FAIL": "⚠️", "NO_PRD": "—", "NO_DATA": "×"}.get(
        status, "?"
    )


def render_report(results: list[dict], title: str, lesson_range: str) -> str:
    n_pass = sum(1 for r in results if r["status"] == "PASS")
    n_fail = sum(1 for r in results if r["status"] == "FAIL")
    n_no_prd = sum(1 for r in results if r["status"] == "NO_PRD")
    lines = [
        f"# {title}",
        "",
        f"> 生成：`python scripts/audit-lessons-biaori-prd.py` · 日期 {date.today().isoformat()}",
        f"> 范围：{lesson_range} · PRD 真源 `【产品PRD】/新增补课文内容/**`",
        f"> 数据真源：`js/data/lessons-data.js`",
        "",
        "## 总览",
        "",
        f"| 指标 | 数量 |",
        f"|------|------|",
        f"| 审计课次 | {len(results)} |",
        f"| 单词对账 PASS | {n_pass} |",
        f"| 单词对账 FAIL | {n_fail} |",
        f"| 缺 PRD 文件 | {n_no_prd} |",
        "",
        "## 分课矩阵",
        "",
        "| 课 | 课题 | 单词 PRD/data/UI | 对账 | 文法 | 会話 | 小测(无解析) | 作業 | 拡張 | links空 |",
        "|----|------|------------------|------|------|------|--------------|------|------|---------|",
    ]

    for r in results:
        lid = r["lessonId"]
        if r["status"] in ("NO_DATA", "NO_PRD"):
            m = r.get("metrics") or {}
            vocab_col = "—" if r["status"] == "NO_PRD" else "无课块"
            lines.append(
                f"| L{lid} | {r.get('title', '—')} | {vocab_col} | {status_icon(r['status'])} {r['status']} | "
                f"{m.get('grammar', '—')} | {m.get('dialogues', '—')} | "
                f"{m.get('quiz', '—')}({m.get('quiz_no_expl', '—')}) | "
                f"{m.get('homework', '—')} | {m.get('rext', '—')} | {m.get('links_empty', '—')} |"
            )
            continue
        c = r["cmp"]
        m = r["metrics"]
        lines.append(
            f"| L{lid} | {r.get('title', '')} | {c['prd_n']}/{c['data_n']}/{c['shown_n']} | "
            f"{status_icon(r['status'])} | {m['grammar']} | {m['dialogues']} | "
            f"{m['quiz']}({m['quiz_no_expl']}) | {m['homework']} | {m['rext']} | {m['links_empty']} |"
        )

    fails = [r for r in results if r["status"] == "FAIL"]
    if fails:
        lines += ["", "## FAIL 明细（单词）", ""]
        for r in fails:
            c = r["cmp"]
            lines.append(f"### L{r['lessonId']} · {r.get('title', '')}")
            lines.append("")
            lines.append(f"- PRD：`{r.get('prd_path', '')}`")
            lines.append(
                f"- 条数 PRD/data/UI：{c['prd_n']}/{c['data_n']}/{c['shown_n']} · "
                f"顺序一致：{'是' if c['order_ok'] else '否'} · 集合一致：{'是' if c['set_ok'] else '否'}"
            )
            if c["only_prd"]:
                lines.append(f"- PRD 有、data 无（节选）：`{'`、`'.join(c['only_prd'][:12])}`")
                if len(c["only_prd"]) > 12:
                    lines.append(f"  - …共 {len(c['only_prd'])} 项")
            if c["only_data"]:
                lines.append(f"- data 有、PRD 无（节选）：`{'`、`'.join(c['only_data'][:12])}`")
                if len(c["only_data"]) > 12:
                    lines.append(f"  - …共 {len(c['only_data'])} 项")
            lines.append("")

    no_prd = [r for r in results if r["status"] == "NO_PRD"]
    if no_prd:
        lines += ["", "## 缺 PRD 单课文件", ""]
        for r in no_prd:
            lines.append(f"- L{r['lessonId']} · {r.get('title', '')}")

    lines += [
        "",
        "## 说明",
        "",
        "- **只读**；不写 `lessons-data.js`。",
        "- 对账键：PRD 仮名/漢字 与 data `kana`/`jp` 集合 + 行序（与 L1 `check-l1-vocab-count.py` 同口径，泛化到 24 课）。",
        "- `from=grammar` 及活用占位词不计入 UI 展示列（第三数字）。",
        "- 会話 A/B/C 真源见各课 `*-dialogue-abc*.js`；本表仅统计 data 内 `dialogues` 场景数。",
        "- L1 专报仍可用：`python scripts/audit-l1-biaori-prd.py` → `docs/audit-l1-biaori-prd-最新.md`",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="PRD vocab audit L1–24")
    ap.add_argument("--from", dest="from_id", type=int, default=1)
    ap.add_argument("--to", dest="to_id", type=int, default=24)
    ap.add_argument("--out", type=str, default="")
    args = ap.parse_args()

    lo, hi = args.from_id, args.to_id
    if lo > hi:
        lo, hi = hi, lo

    results = audit_lessons_range(lo, hi)

    if lo == 2 and hi == 24:
        out_path = Path(args.out) if args.out else OUT_L2
        title = "第2–24课 · 标日 PRD 单词对账（批次 E）"
        lesson_range = f"lessonId {lo}–{hi}"
    elif lo == 1 and hi == 24:
        out_path = Path(args.out) if args.out else OUT_ALL
        title = "第1–24课 · 标日 PRD 单词对账（批次 E）"
        lesson_range = "lessonId 1–24"
    else:
        out_path = Path(args.out) if args.out else OUT_ALL
        title = f"第{lo}–{hi}课 · 标日 PRD 单词对账（批次 E）"
        lesson_range = f"lessonId {lo}–{hi}"

    report = render_report(results, title, lesson_range)
    out_path.write_text(report, encoding="utf-8")
    print(report)
    print(f"\n[OK] wrote {out_path}")

    n_fail = sum(1 for r in results if r["status"] == "FAIL")
    return 1 if n_fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
