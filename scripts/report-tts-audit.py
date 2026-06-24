# -*- coding: utf-8 -*-
"""
生成 TTS 语音包对账报告（Markdown，供发布前归档）

  python scripts/report-tts-audit.py
  python scripts/report-tts-audit.py --write-registry   # 先更新 docs/tts-registry.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from tts_lib import CACHE_DIR, collect_requirements, list_mp3_keys, write_registry  # noqa: E402

OUT = ROOT / "docs" / "TTS-对账报告-最新.md"
PUBLISH_DIR = ROOT / "发布包" / "tts-cache"


def safe_print(msg: str) -> None:
    sys.stdout.buffer.write((msg + "\n").encode("utf-8", errors="replace"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-registry", action="store_true")
    args = parser.parse_args()

    if not CACHE_DIR.is_dir():
        safe_print("ERROR: tts-cache/ 不存在")
        return 1

    if args.write_registry:
        write_registry()

    req = collect_requirements()
    root_keys = list_mp3_keys()
    pub_keys = (
        {p.stem for p in PUBLISH_DIR.glob("*.mp3")} if PUBLISH_DIR.is_dir() else set()
    )
    missing = sorted(set(req.keys()) - root_keys)
    missing_pub = sorted(set(req.keys()) - pub_keys)

    reg_path = ROOT / "docs" / "tts-registry.json"
    reg = {}
    if reg_path.is_file():
        try:
            reg = json.loads(reg_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            reg = {}

    now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M %Z")
    lines = [
        "# TTS 语音包对账报告（最新）",
        "",
        f"> 生成时间：**{now}**  ",
        f"> 命令：`python scripts/report-tts-audit.py`",
        "",
        "## 结论（发布门禁）",
        "",
    ]

    if missing:
        lines.append(f"- **未通过**：根目录 `tts-cache/` 缺 **{len(missing)}** 条必需 MP3")
        lines.append("- 修复：`生成语音包.bat` → `批量检查语音包.bat` → 本脚本重跑")
    else:
        lines.append(
            f"- **通过**：需朗读 **{len(req)}** 条，根目录 MP3 **{len(root_keys)}** 个，缺失 **0**"
        )

    if PUBLISH_DIR.is_dir():
        if missing_pub:
            lines.append(
                f"- **发布包**：`发布包/tts-cache/` 缺 **{len(missing_pub)}** 条（请再跑 `生成语音包.bat` 同步双目录）"
            )
        else:
            lines.append(
                f"- **发布包**：`发布包/tts-cache/` **{len(pub_keys)}** 个文件，必需条 **0** 缺失"
            )
    else:
        lines.append("- **发布包**：`发布包/tts-cache/` 目录不存在（U 盘版需生成）")

    lines += [
        "",
        "## 数量一览",
        "",
        "| 指标 | 数值 |",
        "|------|------|",
        f"| 需朗读（喇叭侧） | {len(req)} |",
        f"| 根目录 tts-cache MP3 | {len(root_keys)} |",
        f"| 缺失 MP3（根目录） | {len(missing)} |",
        f"| 多余 MP3（历史遗留） | {len(root_keys - set(req.keys()))} |",
        f"| registry.requiredCount | {reg.get('requiredCount', '—')} |",
        f"| registry.missingCount | {reg.get('missingCount', '—')} |",
        "",
        "## 说明：不是「语音包丢了」的常见真因",
        "",
        "仓库内 MP3 **齐全** 时，用户仍可能看到「朗读失败 / 首次加载语音包」，通常是下面几类：",
        "",
        "| # | 现象 | 真因 | 避免 |",
        "|---|------|------|------|",
        "| 1 | 朗读失败、iframe 白屏 | 用 `file://` 或未起 **8765** HTTP 服务 | 只用 `打开本地预览.bat` / `开发者竖屏验收.bat` |",
        "| 2 | 公网第一次慢、像没包 | Git push **未包含** `tts-cache/*.mp3` → Pages 404 | push 前 `git status` 确认 mp3 已提交 |",
        "| 3 | 每次点喇叭都像「重新下载」 | 浏览器对 **每个 hash 文件** 首次 `fetch`/解码；`?v=` 只刷新 JS/CSS **不删** MP3 | 属正常；完整包已在 `tts-cache/`，非在线逐句付费 |",
        "| 4 | 五十音页卡死、自己弹层 | 入門页 **批量 prefetch** 上百条 MP3 + 误触假名 | 入門已 `skipPrefetch`；勿在滚动时点格 |",
        "| 5 | 新增日文没声音 | 文案进了 JS **没跑** `生成语音包.bat` | 改数据后必跑对账，缺失必须为 0 |",
        "",
        "详见：[TTS-语音包强制审核与防复发.md](./TTS-语音包强制审核与防复发.md)",
        "",
    ]

    if missing:
        lines.append("## 缺失列表（前 50 条）")
        lines.append("")
        for key in missing[:50]:
            r = req[key]
            lines.append(f"- `{key}.mp3` — {r.line[:60]} — `{r.sources[0]}`")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("完整 key 清单：`docs/tts-registry.json` · 规范：`docs/TTS-语音包编号规范.md`")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    safe_print(f"已写入 {OUT.relative_to(ROOT)}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
