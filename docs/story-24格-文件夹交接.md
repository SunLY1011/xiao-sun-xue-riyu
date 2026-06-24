# 六单元 · 24 格 · 文件夹交接流程

> **画风定稿**：你确认更喜欢 **上一版**（三视图グルミ + 水彩绘本感四格，即当前 `unit-1-strip.webp` 那套）。  
> **精神原型（防跑偏）**：[story-strip-soul-lock.md](./story-strip-soul-lock.md) — 单元弧 + 标日 headline 画面 + 课文型泡。  
> **原则**：先搭大框架（24 张单格或 6 条带），细节你本地修，修完用文件夹一次性换进 App。

---

## 1. 目录约定（你修图后往里放）

```text
assets/story/incoming/
  unit-1/
    panel-1.png            ← 条带用 · 无台词泡（拼 unit-1-strip.webp）
    panel-1-dialogue.png   ← 可选 · 手机点格可有泡；不强求，无则只用 panel-N.png
    panel-2.png … panel-4-dialogue.png
  unit-2/
    panel-1.png … panel-4.png
  …
  unit-6/
    panel-1.png … panel-4.png
```

- 格式：**PNG 或 WebP**，建议 16:9（如 1920×1080 或 1024×574，脚本会统一缩放）。
- **`panel-N.png` / 条带合成源**：**画面上零字**（纪念章/风景画）；课文泡只放 `panel-N-dialogue.png`，**不拼进** `unit-N-strip.webp`。
- 也可整页条带：放 `unit-3/strip.webp`，脚本会**直接复制**为 `unit-3-strip.webp`（跳过拼版）。

文件名必须是小写 `panel-1` … `panel-4`（也认 `1.png` … `4.png`）。

---

## 2. 你本地怎么做（大框架）

| 阶段 | 你做 | 我做 |
|------|------|------|
| A | 按分镜出 24 张（画风跟上一版 + 三视图） | 分镜真源：`unit-strip-storyboard.js` · 审阅 `storyboard-preview.html` |
| B | 一张一张修（泡、字、水印、窗景等） | — |
| C | 修好的图放进 `incoming/unit-N/` | 你 @ 我 或说「已放入 incoming」 |
| D | — | 跑安装脚本 → 生成 `unit-N-strip.webp` |

**暂时不管**：泡文案对错、中学生漫画线稿风（已搁置）。

---

## 3. 安装命令（你把文件夹贴好后）

```bash
python scripts/install-story-strips-from-folder.py
# 只装某一单元：
python scripts/install-story-strips-from-folder.py --unit 3
# 只看缺哪些、不写入：
python scripts/install-story-strips-from-folder.py --dry-run
```

产出：`assets/story/unit-{1..6}-strip.webp`（App 自动读取）。

验收：`StoryRewardDev.preview(1)` … `preview(6)`。

**脚本流水线**（出草稿后本地可再修 incoming）：

```bash
python scripts/harmonize-gurumi-panels.py --unit 2
python scripts/finish-unit-strip.py --unit 2 --source auto
python scripts/sync-story-to-eggs.py --unit 2
```

**第一阶段（当前）**：只产出 **clean 单格 + strip**；画面满构图、**不预留泡区**；默认**不**生成 `panel-N-dialogue.png`。需要贴泡时再：

```bash
python scripts/finish-unit-strip.py --unit 2 --with-dialogue
```

**彩蛋归档**（`D:\【私人】\【小王】\日语学习\彩蛋\单元N\`）：与 txt 提示词同目录，存放条带 + 单格 clean/dialogue + 可选 `draft/`、`harmonized/`。见 `彩蛋/README.md`。

---

## 4. 六单元场景索引（出图清单）

| 单元 | 条带标题 | 四格场景（简） |
|------|----------|----------------|
| 1 | はじめまして、東京！ | 成田 → 站台 → 浅草 → 酒店夜 |
| 2 | おはよう、会社 | 通勤 → 约会 → 购物 → 在家学习 |
| 3 | 旅行の思い出 | 教室认人 → 公园红叶散步 → 教室日语 → 办公室比较 |
| 4 | がんばってください | 同上 |
| 5 | お正月 | 同上 |
| 6 | また会いましょう | 同上 |

单格文案/泡：`docs/storyboard-P1-第1单元-定稿.md`（P1）；其余单元数据在 `js/data/unit-strip-storyboard.js`。

---

## 5. 画风锚点（上一版）

- 角色：`assets/story/gurumi-turnaround-v1.png`
- 反例（过幼绘本风）：`assets/story/style-notes/ref-picturebook-too-young-*.png`
- 说明：`docs/story-gurumi-character-lock.md`

---

## 6. 修订

| 日期 | 说明 |
|------|------|
| 2026-05-22 | 定稿上一版画风；建立 incoming 文件夹交接 |
