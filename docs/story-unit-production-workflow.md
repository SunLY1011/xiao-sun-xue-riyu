# 单元四格 · 制作流程与开工校对（Agent / 美工必读）

> **用途**：每个单元在 `彩蛋/单元N/` 都有一套**分镜 + AI 提示词**真源。任何出图、改 `unit-strip-storyboard.js`、跑 harmonize/finish **之前**，必须先完成本文 **§2 开工校对**，再按 **§4 标准流水线** 执行。  
> **精神锁**：[`story-strip-soul-lock.md`](./story-strip-soul-lock.md) · **角色锁**：[`story-gurumi-character-lock.md`](./story-gurumi-character-lock.md)

---

## 1. 真源链（从提示词到 App）

```text
彩蛋/单元N/*.txt          ← 你写的四层分镜 + 🎨 AI 提示词（场景真源）
        ↓ 校对对齐
js/data/unit-strip-storyboard.js   ← visualBeat · layers · 会話泡（App/预览）
        ↓ 树精グルミ英文后缀覆盖（旧 txt 里「白毛绒」须改写）
docs/storyboard-PN-单元N-*.md      ← 可选：整单元英文合并稿（单元 1 已有范例）
        ↓
assets/story/unit-N-panel-{1..4}-draft.png → harmonize → clean → strip.webp
        ↓
彩蛋/单元N/（sync） · assets/story/locked/unit-N/（定稿后 lock）
```

**条带铁律（第一阶段）**：`clean` + `strip.webp` **零字、无泡、满画幅**；泡只在 App 叠层或 `--with-dialogue` 后置。

---

## 2. 开工校对（必做 · 对齐后再动手）

对目标单元 **N**，逐项打勾；有一项 ❌ 则先改文档/数据，**禁止**直接出图或覆盖 `assets/story/unit-N-*`。

### 2.0 竖屏真比例预览（排版验收）

每单元 `finish` 出 `unit-N-strip.webp` 后，在 **9∶16**（或 **9∶6**）手机框内查看弹层真实占位：

- 本地：`http://127.0.0.1:8765/story-unit-phone-real.html?unit=N`
- 右侧自动显示：**条带高度**、**条带下方留白 px/%**、**屏外遮罩区**（可放彩蛋/按钮的参考）

条带默认 **竖排四格**（约 1080×2438，`--layout vertical`），竖屏满宽、无深色 letterbox；横屏时 App 自动识别比例。角标小字在 `story-reward.js` 叠层（非烧录进图）。

**确认版直出**（避免叠影/黑块）：

```bash
python scripts/install-unit-strips-from-confirmed.py --skip-lock-check
# 默认：确认版 → 1080×608 单格 → raw-clean → 竖排 strip；不加 --harmonize
```

### 2.1 一键脚本（建议）

```bash
python scripts/preflight-unit-strip.py --unit N
```

脚本会列出：彩蛋 txt 是否存在、四课 `curriculum-catalog` headline、`unit-strip-storyboard.js` 每格 `visualBeat` / `sceneCloud`、锁定状态、待补 note。

### 2.2 人工校对表（与脚本对照）

| # | 校对项 | 对照真源 | 通过标准 |
|---|--------|----------|----------|
| A | 单元提示词文件 | 下表「彩蛋 txt」列 | 文件存在；四课各有一段 `第X課` + `🎨 AI提示词` |
| B | 标日 headline | `js/data/curriculum-catalog.js` `LESSON_META[id].headline` | 每格 `lessonId` 与 headline 一致；冲突见 [`story-strip-匹配度-双列.md`](./story-strip-匹配度-双列.md) |
| C | 分镜数据 | `js/data/unit-strip-storyboard.js` `unitId: N` | 每格有 `visualBeat`（或写明 `note` 待补）；`unitArcZh` 概括四格弧 |
| D | 场景 vs 会话 | 同上 `bubbles` + 彩蛋 txt「课文主题」 | 画面是**课文型场景**（非教室语法图）；泡文案可后补，场景必须先对 |
| E | グルミ 造型 | [`story-gurumi-character-lock.md`](./story-gurumi-character-lock.md) | 树精三视图；**非** txt 里旧版 white fluffy；英文后缀必带 shimenawa / leaf crown |
| F | 人类配角 | 角色锁 + 单元 1 样张 | 默认**暖金色风影剪影**；无他人正脸（单元 1 格 2 为用户特批保留） |
| G | 可读文字 | soul-lock §1a | 条带目标：**无**招牌/泡/水印字；彩蛋 txt 里的日文招牌在出图时改为 **abstract color blocks** |
| H | 地理/地图标签 | App `curriculum-catalog` 单元 `titleZh` vs 彩蛋场景 | **出图以彩蛋 txt 为准**（例：单元 2 App 标九州，彩蛋为东京→大阪）见匹配度 doc §单元 2 |
| I | 单元英文合并稿 | `docs/storyboard-P*-单元N-*.md`（若有） | 与彩蛋 txt 四格一一对应；含通用正/负面后缀 |
| J | 锁定状态 | `assets/story/LOCKED.json` | 已 LOCK 单元：**不得**改 clean/strip，除非用户解锁后重跑 lock 脚本 |

**校对输出（建议写在 PR/会话里）**：

```text
单元 N 开工校对 — 2026-05-__
A✓ B✓ C✓ …  |  冲突：第9课 彩蛋=箱根辣食 / headline=四川料理 → 执行定案见匹配度双列
下一步：harmonize --unit N / 或先补 visualBeat 再出图
```

---

## 3. 六单元 · 提示词与文档索引

| 单元 | 课程 | 彩蛋提示词真源（每单元一套） | 英文/重绘合并稿 | 框架 / 评估 | 锁定 |
|------|------|------------------------------|-----------------|-------------|------|
| **1** | 1–4 | [`彩蛋/单元1/彩蛋-单元1（1-4）md.txt`](../彩蛋/单元1/彩蛋-单元1（1-4）md.txt) | [`storyboard-P1-单元1-彩蛋重绘.md`](./storyboard-P1-单元1-彩蛋重绘.md) | [P1 定稿](./storyboard-P1-第1单元-定稿.md) · [四格整体感](./storyboard-P1-四格整体感.md) | 🔒 [`story-unit-1-LOCKED.md`](./story-unit-1-LOCKED.md) |
| **2** | 5–8 | [`彩蛋/单元2/彩蛋-单元2（5-8）md.txt`](../彩蛋/单元2/彩蛋-单元2（5-8）md.txt) | [`storyboard-P2-单元2-彩蛋重绘.md`](./storyboard-P2-单元2-彩蛋重绘.md) | [P2 框架](./storyboard-P2-第2单元-框架.md)（出图以彩蛋为准） | 已定稿待验收 |
| **3** | 9–12 | [`彩蛋/单元3/3单元（9、10、11、12）md.txt`](../彩蛋/单元3/3单元（9、10、11、12）md.txt) | [`storyboard-P3-单元3-彩蛋重绘.md`](./storyboard-P3-单元3-彩蛋重绘.md) | [P3 框架](./storyboard-P3-第3单元-框架.md) · [课文对齐评估](./storyboard-P3-第3单元-课文对齐评估.md) | 已定稿待验收 |
| **4** | 13–16 | [`彩蛋/单元4/4单元（13、14、15、16）md.txt`](../彩蛋/单元4/4单元（13、14、15、16）md.txt) | [`storyboard-P4-单元4-彩蛋重绘.md`](./storyboard-P4-单元4-彩蛋重绘.md) | 备案表 P4 | 已定稿待验收 |
| **5** | 17–20 | [`彩蛋/单元5/第5单元（17、18、19、20）md.txt`](../彩蛋/单元5/第5单元（17、18、19、20）md.txt) | [`storyboard-P5-单元5-彩蛋重绘.md`](./storyboard-P5-单元5-彩蛋重绘.md) | 备案表 P5 | 已定稿待验收 |
| **6** | 21–24 | [`彩蛋/单元6/第6单元（21、22、23、24）md.txt`](../彩蛋/单元6/第6单元（21、22、23、24）md.txt) | [`storyboard-P6-单元6-彩蛋重绘.md`](./storyboard-P6-单元6-彩蛋重绘.md) | 备案表 P6 · 格4 与单元1旅行装呼应 | 已定稿待验收 |

**全册绘画通用词**（画风/负面）：[`storyboard-绘画提示词-合并版.md`](./storyboard-绘画提示词-合并版.md) · SD 参数：[`storyboard-P1-SD单格出图.md`](./storyboard-P1-SD单格出图.md)

**隐藏通关**（非单元条带）：[`彩蛋/通关全家福.txt`](../彩蛋/通关全家福.txt) · [`storyboard-grand-24-彩蛋重绘.md`](./storyboard-grand-24-彩蛋重绘.md) · **8×3** · `preflight-grand-finale.py`

---

## 4. 标准制作流水线（每单元相同）

| 步骤 | 动作 | 命令 / 产出 |
|------|------|-------------|
| 0 | **开工校对** | `preflight-unit-strip.py --unit N` + §2.2 打勾 |
| 1 | 从彩蛋 txt 提炼英文格 prompt | 复制 `🎨 AI提示词` 块 + **树精后缀**（见单元 1 重绘 doc 通用后缀） |
| 2 | 出四格草稿 | `assets/story/unit-N-panel-{1..4}-draft.png` 或 `incoming/unit-N/panel-{1..4}.png` |
| 3 | 调色统一 | `python scripts/harmonize-gurumi-panels.py --unit N` |
| 4 | clean + 条带 | `python scripts/finish-unit-strip.py --unit N`（默认无 dialogue） |
| 5 | 同步彩蛋目录 | `python scripts/sync-story-to-eggs.py --unit N` |
| 6 | 用户验收后锁定 | `python scripts/lock-unit-strip.py --unit N` → 更新 `LOCKED.json` + `docs/story-unit-N-LOCKED.md` |

**单元 1 特例**：用户选定样张 → `scripts/apply-unit1-liked-sources.py` 再 harmonize/finish。

**交接**：[`story-24格-文件夹交接.md`](./story-24格-文件夹交接.md)

---

## 5. 从彩蛋 txt 到出图：提示词改写规则

彩蛋 txt 多为早期「白毛绒 Gurumi」+ 可读招牌描述，出图时必须叠加项目现行规则：

| txt 里常见写法 | 执行时改为 |
|----------------|------------|
| round white fluffy creature | tree-spirit：bark trunk, leaf crown, shimenawa, paper shide（见角色锁） |
| welcome sign reads 「東京へようこそ」 | abstract warm color panel, plane icon, **NO readable text** |
| 站员小姐正脸 / 弯腰对视 | warm golden silhouette, back/side only, **no human face** |
| leave space for bubbles | **full-bleed** scenic composition（soul-lock §1a） |
| watercolor pastel only | + `story-art-brief` 绘本感 + 单元 1 样张色调 |

每单元建议新增 **`docs/storyboard-PN-单元N-彩蛋重绘.md`**：从 txt 拆四格英文 + 贴通用正/负面（单元 1 为范本）。

---

## 6. 四课 headline 速查（校对 B 用）

| 课 | headline |
|----|----------|
| 1 | 李さんは中国人です |
| 2 | これは本です |
| 3 | ここはデパートです |
| 4 | 部屋に机といすがあります |
| 5 | 森さんは七時に起きます |
| 6 | 吉田さんは来月中国へ行きます |
| 7 | 李さんは毎日コーヒーを飲みます |
| 8 | 李さんは日本語で手紙を書きます |
| 9 | 四川料理は辛いです |
| 10 | 京都の紅葉は有名です |
| 11 | 小野さんは歌が好きです |
| 12 | 李さんは森さんより若いです |
| 13 | 机の上に本が三冊あります |
| 14 | 昨日デパートへ行って、買い物をしました |
| 15 | 小野さんは今新聞を読んでいます |
| 16 | ホテルの部屋は広くて明るいです |
| 17 | わたしは新しい洋服がほしいです |
| 18 | 携帯電話はとても小さくなりました |
| 19 | 部屋のかぎを忘れないでください |
| 20 | スミスさんはピアノを弾くことができます |
| 21 | わたしはすき焼きを食べたことがあります |
| 22 | 森さんは今晩テレビを見る |
| 23 | 休みの日、散歩したり買い物に行ったりします |
| 24 | 李さんはもうすぐ来ると思います |

`unit-strip-storyboard.js` 中 `note: 标题「…」待补` 的格子 = **C 项未通过**，须先补 `visualBeat` 再出图。

---

## 7. Agent 强制顺序（摘要）

1. 读本文 + soul-lock + 角色锁  
2. 打开该单元 **彩蛋 txt** 与 **storyboard.js** 对照 §2  
3. 有冲突 → 查匹配度双列 / 问用户定案  
4. 通过校对 → 出图 / 脚本  
5. 验收 → `lock-unit-strip.py` + `story-unit-N-LOCKED.md`

---

## 8. 修订

| 日期 | 说明 |
|------|------|
| 2026-05-21 | 初版：六单元提示词索引 + 开工校对表 + 流水线 + preflight 脚本 |
