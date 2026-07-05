# MVP 冻结 · 第1单元 · 第1–4課（五关课文）【已锁定】

> **冻结日期**：2026-05-25  
> **用户锁定确认**：2026-05-25（第1单元第1、2、3、4课课文五关 + 会話 ABC）  
> **资源 cache**：`v=246`（`js/share-wechat.js` · `index.html`）  
> **课次**：`lessonId` **1–4** · 第1单元  
> **机器基线**：`docs/iteration-baseline.json` → `unit1_lessons_1_4_mvp` · `confirmed[]`  
> **本地**：http://localhost:8765/index.html?v=246  
> **公网**（push 后生效）：https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=246  

**锁定后禁止**（无用户明示不得改）：

| 范围 | 文件 / 契约 |
|------|-------------|
| 五关壳（1–4课） | `js/lesson-1-flow.js` · `js/app.js`（`isUnit1MvpFiveGate`） |
| 会話 ABC | `js/data/l1-dialogue-abc.js`（课1）· `js/data/unit1-dialogue-abc-l234.js`（课2–4） |
| 会話 UI | `js/dialogue-gate.js`（`isUnit1AbcDialogue` · `applyUnit1DialogueAbc`） |
| 课1 提示 | `js/data/l1-knowledge-tips.js` |
| 课1–4 课内数据 | `js/data/lessons-data.js` 中 `lessonId` 1–4 之五关字段（単詞/会話/文法/作業/拡張） |

第1課单独归档仍见 [MVP-UNIT1-LESSON1-FREEZE.md](./MVP-UNIT1-LESSON1-FREEZE.md)（并入本锁，cache 以本文件为准）。

本冻结 **仅第1单元前四课课内五关**；不替换课 14/16/18 三课 MVP（见 `docs/MVP-FREEZE.md`）。

---

## 范围（已交付 · 用户确认）

| 项 | 内容 |
|----|------|
| 结构 | **単語 → 会話 → 文法 → 作業 → 拡張**（五 Tab） |
| 课次 | 第 **1** 課 自己紹介 · 第 **2** 課 これ/それ/あれ · 第 **3** 課 ここ/あそこ · 第 **4** 課 部屋/あります |
| 数据真源 | `js/data/lessons-data.js`（lessonId 1–4） |
| 会話 ABC | **A**＝课文标准答 · **B/C**＝同问不同场景可选说法 + 黄底「提示」 |
| 会話句数 | 课1：10 · 课2：13 · 课3：12 · 课4：12 |
| 通关海星 | **5 颗/课**（単語·会話·文法·作業·拡張）；满星 → 本课彩蛋；四课满星 → 单元四格彩蛋 |
| 课内壳 | `Lesson1Flow` + `isUnit1MvpPanel()` / `isUnit1MvpFiveGate()` |
| UI | 与课1 MVP 同：五色 Tab、`l1-gate-panel`、折叠序号、底链、`完了（n/m）` |
| 校验 | `scripts/validate-unit1-mvp-lessons.py`（字段齐） |

### 会話 ABC 教学约定（产品锁）

> 行级真源（全课 1–24 同一逻辑）：[会話-ABC三答-产品真源.md](./会話-ABC三答-产品真源.md)

- **发起句**：标日课文对话问题（`opener` 日文 + 下中文）。  
- **A**：课文标准答 — **第 1 行日文、第 2 行中文**（应用课文原句 + 翻译）。  
- **B/C**：场景变体 — **第 1 行日文、第 2 行中文、第 3 行中文场景说明**（何时对谁、与 A 的差异）；**非对错题**。  
- **禁止**：取消或简化 B/C；第三行说明不得默认藏进折叠「提示」才可读。  
- 课2–4 数据：`js/data/unit1-dialogue-abc-l234.js`（37 场景 × 3 答）。

---

## 不在本锁范围（明确延后）

- 第 **5–12** 课五关批量套用  
- 全 24 课 `lessons-data.js` 其余课次正文大改  
- 笔记板块（见 `notes_panel_v1` 独立锁）  
- 单元四格彩蛋条带（见 `docs/story-unit-1-LOCKED.md`）

---

## 验收

1. `python scripts/pre-ship-check.py` → 全 **[OK]**，`cache=246`。  
2. 第1–4课各打开五 Tab；**会話** 每句可见 A/B/C + 提示。  
3. 第1课行为与 v225 冻结一致（提示槽、知识关联 chip 等）。

---

## 关联文档

| 文档 | 用途 |
|------|------|
| [MVP-L1-完整规范.md](./MVP-L1-完整规范.md) | 模板课规范 |
| [MVP-UNIT1-U1L2-4-VI对齐-美工验收.md](./MVP-UNIT1-U1L2-4-VI对齐-美工验收.md) | 课2–4 五关对照 |
| [项目知识库-课内单词标黄范式.md](./项目知识库-课内单词标黄范式.md) | 単語关（改词前必读） |
| [story-unit-1-LOCKED.md](./story-unit-1-LOCKED.md) | 单元1 漫画条带（与课内独立） |

---

## Agent 约束

- 新会话先读 `docs/iteration-baseline.json` → `unit1_lessons_1_4_mvp.status === "locked"`。  
- 不得擅自改 `backlog` 中「课5+五关套用」提前做进 1–4 课。  
- 用户明确要求 **push** 时再 `git push`。
