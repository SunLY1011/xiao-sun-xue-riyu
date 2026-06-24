# Part-0（入門）播种检查表

> **定位**：発音と文字 · 随时参照的リファレンス，**不锁** 第 1–24 课。  
> **文稿来源**：[【产品PRD】/Part-0（入门基础）.txt](../【产品PRD】/Part-0（入门基础）.txt)  
> **实现策略**：A 期 — 复用 `GrammarNetwork` 卡片 + `denseList` 表格式 🔊；不做点阵 UI 第一版。

---

## 1. 工程约定

| 项 | 约定 |
|----|------|
| `lessonId` | `0`（数字零） |
| 首页 | 独立入口 `入門 · 発音と文字`，**不**并入 `LESSONS_MVP` 进度环（或 `introDone` 单独字段） |
| 四关 | **无単語关**（或可选极短あ行）；Tab 建议：**①発音** / **②会話** / **③確認** |
| 锁课 | **否**（`state.settings.zeroBeginnerHint` 仅软提示） |
| TTS | 清音 46 + 浊半浊 + 主要拗音 ≈ 100+ 行；单独跑 `build-tts-cache.py` 后查缺失 0 |
| 发版 | `cache v47+`，文档可增 `MVP-INTRO` 小节 |

---

## 2. 文件落盘

| 文件 | 内容 |
|------|------|
| `js/data/lessons-mvp.js` | 增加 `lessonId: 0` 一条 **或** 新建 `js/data/lessons-intro.js`（推荐后者，首页/filter 分离） |
| `js/data/lessons-mvp-depth.js` | `0: { nodePatches, conversationScenesAdd, quizReplace }` |
| `js/data/lesson-vocab-biaori.js` | 可省略，或 `0: []` |
| `js/app.js` | 首页入門按钮；`getLessonMvp(0)` / `enterLesson(0, gate)`；进度不写 `gate1–3` 到标日课 |
| `index.html` | 若新 js，加 script 标签 |

---

## 3. 第一关 · 文法节点（8 + 补充）

PRD 节点 → `grammarNodes[]`（与 14 课同字段）

| PRD ID | title | 要点 | links / tags |
|--------|-------|------|----------------|
| intro_gojuon | 五十音図とは | 46 音、行/段、书写コツ | 🔗 濁音・拗音 |
| intro_seion | 清音 | **denseList 表**：あ行～ん，每格 `jp` `kana` `label`（罗马字） | 📖 gojuon |
| intro_dakuon | 濁音・半濁音 | 表格 + ぢ/じ 同音注 | 📖 seion |
| intro_youon | 拗音 | きゃ行列表 | 📖 dakuon |
| intro_chouon_sokuon | 長音・促音・撥音 | text + list 例 | 📖 seion |
| intro_accent | アクセント（補充） | supplement: true | 🏷️ |
| intro_moji | 文字の種類（補充） | ひらがな/カタカナ/漢字 | 🏷️ |
| intro_classroom | 教室表現（補充） | わかりました、もう一度… | 🏷️ |

**清音表 TTS 行示例**（`denseList.items`）：

```javascript
{ label: "あ行", jp: "あ", kana: "あ", zh: "a" },
{ label: "", jp: "い", kana: "い", zh: "i" },
// … か行 かきくけこ …
```

**验收**：每格 🔊 只读日语假名；`showChineseZh` 开时显示 `zh` 罗马字提示。

---

## 4. 第二关 · 会話（3 段）

| PRD 场景 | dialogue id 建议 | 返事数 |
|----------|-------------------|--------|
| 朝のあいさつ | intro_scene_morning | 3 |
| 初めまして | intro_scene_introduce | 3 |
| お礼とお詫び | intro_scene_thanks | 3 |

字段与 14 课相同：`opener` / `userTurn.replies[]` / `noteJa` / `noteZh` / `npcReaction`。  
**验收**：三返事同屏；🔊🎤▶✓；无「选错扣分」。

---

## 5. 第三关 · 测验（5 题）

| PRD | id | type | 要点 |
|-----|-----|------|------|
| Q1 | intro_q1 | choice | し → shi |
| Q2 | intro_q2 | choice | 浊音 が |
| Q3 | intro_q3 | choice | 拗音 |
| Q4 | intro_q4 | fill | おはよう___ → ございます |
| Q5 | intro_q5 | choice | こちらこそ |

每题：`questionTts`、`explanation` / `explanationZh`（可选）。

---

## 6. 播种完成自检

- [ ] `python scripts/audit-ja-text.py`
- [ ] `python scripts/build-tts-cache.py`（入門新行）
- [ ] `python scripts/audit-tts-registry.py --write` → 缺失 0
- [ ] 本地：入門三关冒烟 + 不影响 L14 四关回归
- [ ] `pre-ship-check.py` 全绿
- [ ] `iteration-baseline.json` 追加 `confirmed` 条目 `part-0-intro-a`
- [ ] 首页：入門入口可见；进入第 14 课**无**解锁拦截

---

## 7. 与完整版关系

- **不阻塞** 阶段二（13/15/17/19/20）：可并行，但默认 **P1 先合并**。  
- **不替代** 第 1–12 课：零基础「语法地基」仍靠标日正课顺序。  
- B 期（五十音点阵 UI）单列 backlog，不在 A 期验收范围内。
