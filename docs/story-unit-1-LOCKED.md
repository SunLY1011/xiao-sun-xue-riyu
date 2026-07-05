# 第 1 单元四格 · 画面锁定（LOCKED）

> **状态**: 🔒 已定稿 · 2026-05-21  
> **不可再改**（除非显式解锁重绘）：`assets/story/unit-1-panel-{1..4}-clean.png`、`unit-1-strip.webp`

## 定稿来源

用户选定 4 张画面 → `scripts/apply-unit1-liked-sources.py`（去泡/去字/去暗块）→ harmonize → `finish-unit-strip.py`（仅 clean + strip）。

| 格 | 課 | 场景 |
|----|-----|------|
| 1 | 李さんは中国人です | 成田大厅 · 护照 · 东京塔 |
| 2 | これは本です | 机场売店 · 风铃 |
| 3 | ここはデパートです | 站前 · 地图 · 远景塔 |
| 4 | 部屋に机といすがあります | 酒店夜 · 晴空塔 |

## 锁定副本（存档）

`assets/story/locked/unit-1/` — 与 App 真源字节一致，含 `MANIFEST.md` 校验和。

## 画面铁律（本单元）

- **零字**：条带与 clean 单格无可读日文/中文/招牌字
- **无泡**：不生成 `*-dialogue.png` 进条带
- **无暗块**：无半透明矩形 UI 瑕疵
- **グルミ**：树精三视图；条带仅 1 个グルミ/格

## 重锁命令

```bash
python scripts/apply-unit1-liked-sources.py   # 若换源图
python scripts/harmonize-gurumi-panels.py --unit 1
python scripts/finish-unit-strip.py --unit 1
python scripts/lock-unit-strip.py --unit 1
```

## 相关真源

- 分镜：`js/data/unit-strip-storyboard.js`（unitId: 1）
- 精神：`docs/story-strip-soul-lock.md`
- 角色：`docs/story-gurumi-character-lock.md`
- 彩蛋归档：`彩蛋/单元1/`
