# 单元四格 · 精神原型锁定（Soul Lock · 美工 / Agent 必读）

> **用途**：出图、改图、写 `unit-strip-storyboard.js` 前 **先读本文**，再读单元页（P1 定稿 / Pn 框架 / 备案表）。  
> **目标**：服务**标日课文主线**，不炫技、不跑偏 MVP 练句场景。  
> **真源链**：`story-art-brief` → `storyboard-备案` → `storyboard-P1-第1单元-定稿`（混合规则）→ `unit-strip-storyboard.js`

### 单元锁定状态

| 单元 | 状态 | 文档 |
|------|------|------|
| **1** | 🔒 LOCKED（2026-05-21） | `docs/story-unit-1-LOCKED.md` · `assets/story/locked/unit-1/` |
| 2–6 | 进行中 | — |

---

## 1. 产品精神（一句话）

**彩带四格 = 把这一单元四课课文，放进一条短旅行/生活弧里，用グルミ演李さん，在真实场合说出与课文标题一致的那类话。**

不是语法图解，不是与课文无关的「好看场景」。

### 1a. 制作优先级 · 第一阶段（2026-05-21 定调）

**先把每个单元的 4 张干净单格 + 无泡条带做完**；泡、画内字、`*-dialogue.png` 一律后置。

| 做 | 不做（第一阶段） |
|----|------------------|
| `unit-N-panel-{1..4}-clean.png` | `*-dialogue.png`（除非显式 `--with-dialogue`） |
| `unit-N-strip.webp`（4 格合成，满画幅） | 画内预留「泡区」空白角 |
| 场景满构图、グルミ + 风影配角 | PS/脚本贴日文泡、角标小字 |

出图 prompt：**不要** `leave empty space for speech bubbles`；构图按完整风景/场景画满。

```bash
python scripts/harmonize-gurumi-panels.py --unit N
python scripts/finish-unit-strip.py --unit N
python scripts/sync-story-to-eggs.py --unit N
python scripts/lock-unit-strip.py --unit N   # 定稿后写入 locked/
```

泡以后可加在：App 画外区、`--with-dialogue`、或 HTML 叠层（`story-comic-ui`），**不影响**条带收藏图。

### 1b. 双轨交付：纪念章 vs 通关札（2026-05-21 定调）

| 形态 | 有没有字 | 作用 |
|------|----------|------|
| **四联条带** `unit-N-strip.webp` | **零字** | 像风景画 / 旅行纪念章 / 打卡拼图——**收藏用**，拼完后日语已不重要 |
| **通关弹层** | **有字（画外）** | 单元旁白 `unitArcZh`、标题等，**裱在画框上下**，不压进画面 |
| **单格文件** `panel-N.png`（clean） | 零字 | 与条带一致，可裁切 |
| **单格** `panel-N-dialogue.png` | 可有泡 | 手机点格时**可选用**；**不强求**；无泡则用 `panel-N.png`（clean）即可 |

**美工铁律**：写入 `strip.webp` 与 `panel-N.png` 的图，禁止任何日文/中文/招牌可读文字（路牌用抽象色块代替）。

---

## 2. 三层结构（全册锁定 · 来自 P1 混合 v3）

| 层 | 回答什么 | 真源（按优先级） | 禁止 |
|----|----------|------------------|------|
| **① 单元情绪弧** | 这四格合起来像哪一集？ | `storyboard-备案` 各单元「单元一句」+ 地图段 | 四格互无关的拼图 |
| **② 格画面** | 这一格课文**最有画面感的一瞬**？ | `curriculum-catalog.js` **headline** + 备案表「画面」列 + `visualBeat` | 只跟 MVP `lesson-dialogues` 场景走而脱离 headline |
| **③ 对白泡** | 谁在场合里说了哪类话？ | ① `lesson-dialogues.js` 会話原文（与②同场景或可映射）→ ② 标日 headline **语法关键词句** → ③ 标 **待补课文** 再画 | 编造与 headline 无关的练句 |

**定格原则**（备案）：一格 = 一课 = 一课主线瞬间，不是四课剧情挤一格。

---

## 3. 角色与画风（不跑偏）

| 项 | 锁定 |
|----|------|
| 主人公 | **仅 1 个 グルミ = 李さん** / 格；造型 `gurumi-turnaround-v1.png` |
| 人类配角 | **方法 A**：暖色透光剪影（见 `assets/story/companion-style-reference.png` 主图）；**禁止**蓝圈式写实正脸站员；全格**只有グルミ**可正面 |
| 画风 | 水彩绘本；条带 **无泡**，泡仅在 `*-dialogue.png` / App 叠字 |
| 叙述 | 泡内角色名用 **李**；条带收藏名用备案 **stripTitle** |

详见 [story-gurumi-character-lock.md](./story-gurumi-character-lock.md)。

---

## 4. 画幅四层（正片 + 彩蛋 · 制作参考）

| 层 | 内容 | 在条带图里 |
|----|------|------------|
| **L1** | 课文场景核（headline 一眼可读） | 必须 |
| **L2** | 当地彩蛋背板（地标、名物、风俗） | 弱化远景，≤3 点/格 |
| **L3** | グルミ 动作神态 + 风影配角 | 必须 |
| **L4** | 近景日产道具（扇子、明信片…） | 1～2 个/格 |

字段可写在 `unit-strip-storyboard.js` → `layers: { L1, L2, L3, L4 }`（待逐单元补全）。

## 5. 出图前检查单（Scale · 每格必过）

```text
□ 本单元「单元一句」在四格串词里读得通？
□ 本格 headline（curriculum-catalog）里的名词/动词在画面里看得见？
□ 场景属于本单元地图段/生活弧（如 P3=箱根旅行），不是东京日常教室乱入？
□ 仅 1 个 グルミ？配角是风影不是灰块贴图？
□ 画面中无他人正面脸/正面半身？（站员、同学等仅背影或剪影）
□ 条带/ clean 单格：画面上无任何可读文字？
□ 课文泡只存在于 dialogue 单格或 App 画外区，不在 strip 合成里？
□ 未使用已搁置「中学生硬线漫画」风？
```

---

## 6. 第 3 单元 · 锁定示例（照此执行，不另发明场景）

**单元一句**（备案）：李（グルミ）第一次离开东京去箱根一带放松。  
**条带**：`旅行の思い出` · 色板黄 · 本州西

| 格 | 标日 headline | 画面主线（备案） | 泡应含的课文型 |
|----|---------------|------------------|----------------|
| 1 | 四川料理は辛いです | 旅行巴士/便当 · 辣 · 扇嘴 | 辛い / おいしい |
| 2 | 京都の紅葉は有名です | 红叶山道 · 拍照 | 有名 / きれい |
| 3 | 小野さんは歌が好きです | 巴士内唱歌 · 拍手 | 歌が好き / 上手 |
| 4 | 李さんは森さんより若いです | 温泉街明信片 · 一高一矮 | より若い / 背が高い |

格4定案（2026-05-21）：**より若い+明信片+风影身高**；土产纠结仅 L4 小道具。双列说明见 [story-strip-匹配度-双列.md](./story-strip-匹配度-双列.md)。

数据真源：`js/data/unit-strip-storyboard.js`（unitId: 3）· 评估记录 [storyboard-P3-第3单元-课文对齐评估.md](./storyboard-P3-第3单元-课文对齐评估.md)。

---

## 7. Agent 分工（回顾项目 MD）

| 步骤 | 角色 | 文档 |
|------|------|------|
| 锁精神 + 填 visualBeat | 分镜 / PM | 本文 + 备案 + `unit-strip-storyboard.js` |
| 出草稿 | 美工 AI | [storyboard-绘画提示词-合并版.md](./storyboard-绘画提示词-合并版.md) + 三视图 |
| 调色 / 无泡条带 | 工程脚本 | `harmonize-gurumi-panels.py` · `finish-unit-strip.py` · `sync-story-to-eggs.py` → `彩蛋/单元N/` |
| 用户替换 | 你 | `incoming/unit-N/` → `install-story-strips-from-folder.py` |

---

## 8. 修订

| 日期 | 说明 |
|------|------|
| 2026-05-21 | 初版：P1 混合三层 + P3 标日对齐后锁定，防 MVP/炫技跑偏 |
| 2026-05-21 | 条带/四联：零泡；单格：可有泡但不强求（用户定调） |
| 2026-05-21 | U1 彩蛋样张重绘 · 匹配度双列 doc · U3 格4 より若い 锁定 |
| 2026-05-21 | 用户定调：尽量避免人类配角正面，仅グルミ可正面 |
| 2026-05-21 | 全家福隐藏彩蛋：24 课×4 金星 → `egg-grand.webp` · `curriculumGrandFinaleUnlocked` |
