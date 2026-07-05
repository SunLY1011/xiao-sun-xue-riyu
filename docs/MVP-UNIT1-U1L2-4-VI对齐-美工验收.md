# 第1单元第2–4课 · MVP/VI 对齐 · 美工与五关验收单

> **MVP 真源**：`docs/MVP-L1-完整规范.md`（第1课）  
> **设计 Tokens**：§六（色 `#1565c0` 単語 … `#00695c` 拡張、字号、间距）  
> **工程真源**：`Lesson1Flow` + `isUnit1MvpPanel()`（lessonId 1–4）  
> **cache**：246

---

## 一、美工 Agent 派单摘要（hyouga-product-pm → design-review）

| 派单 Skill | 用途 |
|------------|------|
| `advanced-xhs-visual-design` | Tokens、五关色条、折叠层级 |
| `brand-voice-system` | 按钮文案、hint 语气 |
| design-review 流程 | 第2课 vs 第1课截图 diff |

**验收方式**：本地 `?v=246` → 第1课与第2课同关并排对比（微信竖屏 390×844）。

---

## 二、五关逐项对照（第2–4课 vs 第1课 MVP）

### ① 単語

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 外壳 | `l1-gate-panel` + 左色条蓝 | 同 `Lesson1Flow.mountVocab` | ✅ |
| 序号 | `l1-seq-num` 1…N | 同 | ✅ |
| 日文/读音/中文 | 15px jp + 11px zh `#78909c` | 同 | ✅ |
| 注意/延伸标签 | 双行槽 + 展开箭头 | 第2–4 有指示词 warn 集 | ✅ |
| 发音/语源/予告折叠 | `l1-vocab-supp` 手风琴 | 同 | ✅ |
| 底栏 | 传送链 + 单词完了→会話 | 同 + lessonId 文案 | ✅ |

### ② 会話

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 外壳 | `l1GatePanelHtml` 无顶栏 H2 | `isUnit1MvpPanel` | ✅ |
| 折叠条 | 序号 + 日文预览 + 标题中文 | 同（非 💬 前缀） | ✅ |
| 句内 | 开场灰底 + secondary「本句听完」 | `renderL1OpenerBlock` + unit1 版 | ✅ |
| 中文灰字 | 展开下 `zh-annotation` | **已补** `dialogues.chinese`（脚本） | ✅ |
| ABC | A/B/C + 黄提示 | 同第1课（`unit1-dialogue-abc-l234.js`） | ✅ |
| 底栏 | 链 + 会話完了→文法 | `switchGate(1)` | ✅ |

### ③ 文法

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 外壳 | `l1GatePanelHtml` | `isUnit1MvpPanel` | ✅ |
| 折叠条 | 序号 + 标题 + 中文 + 折叠图标 | 同 | ✅ |
| 知识卡 | `L1KnowledgeCard` 槽 | 第2–4 用 `explanationZh` 折行 | ✅ |
| 底栏 | 链 + 文法完了→作業 | `switchGate(3)` | ✅ |

### ④ 作業

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 折叠 | `gw-group` + 序号 | 同 `mountHomework` | ✅ |
| 题型排版 | `l1-prose-list` ×/○/Q/→ | 同 | ✅ |
| 小テスト | 問題 n/m + 🔊 | `QuizGate` + `l1Scope` 紫关样式 | ✅ |
| 底栏 | 作業完了→拡張 | 同 | ✅ |

### ⑤ 拡張

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 折叠块 | `gw-group` 序号标题 | 同 `mountExtension` | ✅ |
| 分类 | 発音/文法/敬语/予告/会話要点… | 按 `summaryBlocks` | ✅ |
| 底栏 | 第N课完了→第N+1课 / 本单元 | `chainMetaFor(lid)` | ✅ |

### ⑥ 课文简介（进课前）

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 模块左边框色 | 蓝/绿/橙/紫/青 | `ov-mod-details[data-gate]` | ✅ |
| 模块图标 | 🃏💬📖📝📋 | **已补** `ov-mod-label` 显示 icon | ✅ |
| 手风琴 | 单开 | 同 | ✅ |

### ⑦ 顶栏 Tab（cockpit）

| 检查项 | MVP | 第2–4课 | 状态 |
|--------|-----|---------|------|
| 五色选中底 | 同 COCKPIT_TABS | `isUnit1MvpFiveGate` | ✅ |
| 无 ✅ 完成勾 | 灰底区分 | 同 | ✅ |
| path 海星 | 第1课无条 | 第2–4 同第1课空 rail | ✅ |

---

## 三、VI / CI 固定项（全单元一致）

- 主色 `--c-primary` `#d32f2f`：简介主题、易错（笔记，非课内）
- 五关轨色：単語 `#1565c0`、会話 `#2e7d32`、文法 `#e65100`、作業 `#6a1b9a`、拡張 `#00695c`
- 字体层级：见 MVP §六（H3 15px、Body ZH 11px `#78909c`、Hint 11px `#b0bec5`）
- 操作：🔊🎤▶ 行内右栏（ShadowSpeak / SpeakUI）

---

## 四、脚本与数据

| 脚本 | 作用 |
|------|------|
| `scripts/fill-unit1-dialogue-chinese.py` | 第2–4课会話 `chinese` 标日对照 |
| `scripts/validate-unit1-mvp-lessons.py` | 五关数据字段齐 |

---

## 五、美工回归清单（勾选）

- [ ] 第2课 単語：与第1课同屏 diff 无多余顶栏字
- [ ] 第2课 会話：折叠序号、灰字译文、底链
- [ ] 第2课 文法：折叠条 + 知识卡底槽
- [ ] 第2课 作業：折叠 + 小テスト 紫关内样式
- [ ] 第2课 拡張：底栏「第2课完了→第3课」
- [ ] 第3、4课 抽测各 1 关

---

## 六、改动文件（本轮）

`js/dialogue-gate.js` · `js/grammar-network.js` · `js/lesson-1-flow.js` · `js/lesson-overview.js` · `js/quiz-gate.js` · `css/mvp.css` · `js/data/lessons-data.js`（会話中文）· `scripts/fill-unit1-dialogue-chinese.py`
