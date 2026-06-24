# MVP 冻结 · 第1单元 · 第1課（自己紹介）【已锁定】

> **冻结日期**：2026-05-25  
> **用户锁定确认**：2026-05-25（课文板块 MVP 完成，转入笔记板块）  
> **资源 cache**：`v=246`（以 [MVP-UNIT1-LESSONS-1-4-FREEZE.md](./MVP-UNIT1-LESSONS-1-4-FREEZE.md) 为准）  
> **课次**：`lessonId: 1` · 第1单元（**1–4课** 见同目录 `MVP-UNIT1-LESSONS-1-4-FREEZE.md`）  
> **机器基线**：`docs/iteration-baseline.json` → `unit1_lessons_1_4_mvp` · `unit1_lesson1_mvp`  
> **阶段归档**：`过程讨论内容/20-20260525-L1五关提示统一与课内UI阶段归档.md`  
> **本地**：http://localhost:8765/index.html?v=246  
> **公网**（push 后生效）：https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=246

**锁定后禁止**（无用户明示不得改）：`js/lesson-1-flow.js` · 第1課课内五关数据契约 · `js/data/l1-knowledge-tips.js`（课1）· `js/data/l1-dialogue-abc.js`。

本冻结范围 **仅第1課课内五关**；不表示全 24 课或第 14/16/18 三课 MVP 被替换（后者见 `docs/MVP-FREEZE.md`）。

---

## 范围（已交付 · 用户确认）

| 项 | 内容 |
|----|------|
| 结构 | **単語 → 会話 → 文法 → 作業 → 拡張**（五 Tab；与旧四关课 14/16/18 路由分离） |
| 数据真源 | `js/data/lessons-data.js`（lessonId 1）· `js/data/l1-knowledge-tips.js` · `js/data/l1-dialogue-abc.js` |
| 単語范式 | [项目知识库-课内单词标黄范式.md](./项目知识库-课内单词标黄范式.md)（标黄/延伸/三键 · 改单词前必读） |
| 课内壳 | `js/lesson-1-flow.js`（课1 起型；**课1–4** 见 `MVP-UNIT1-LESSONS-1-4-FREEZE.md`） |
| 提示 | `js/sensei-tip-card.js` + `l1Scope`：**「提示：」+ ▾** 五关统一折叠；`.l1-tip-slot` 槽位 |
| 单词序号 | `--l1-seq-size: 26px` 栅格，与文法/作业关对齐 |
| 传送链 | 底栏中文路径 + 分关色主按钮 + 进度 `完了（n/m）` |
| UI | 五 Tab 同尺寸；序号徽章/折叠条随当前关配色（蓝/绿/橙/紫/青） |
| 拡張排版 | `l1-prose-list`：×○ 对齐、参考表 Tab 三列、作业题号分层 |
| 知识关联 A | `js/data/knowledge-graph.js` · `js/knowledge-link.js`；**第2課起**显示跨课 chip |
| 会話 | ABC 变体、发起句中文、L1 折叠条单 ▸ |
| 作業 | 两个「翻訳問題」合并；Q3/改错/发音句与本课范围对齐 |
| 顶栏 | 课内「首页」+ 房子图标；分享 / 二维码页分图标 |

## 不在本课 MVP（明确延后）

- 第 **5–12** 课五关 UI 批量套用（**第1–4课已锁**，见 `MVP-UNIT1-LESSONS-1-4-FREEZE.md`）
- 阶段 B：课内知识链子图 / Obsidian 导出
- 全课 `lessons-mvp-depth.js` 回归（仓库已改为 `lessons-data.js` 单源；pre-ship 脚本待对齐）

## 验收（第1課）

1. 打开 `index.html?v=146` → 第1課 → 逐关冒烟五 Tab。
2. 会話/文法/作業/拡張：序号色与当前 Tab 一致（非单词蓝错位）。
3. 第2課 → 文法 → 提示下「关联」出现第1課 chip 并可跳转。
4. `python scripts/pre-ship-check.py`：第1課 28 词 `[OK]`；全站自检若有 `[FAIL]` 见下节。

## 发布前自检说明（2026-05-25）

| 检查项 | 状态 |
|--------|------|
| CACHE_VER 与 index `?v=` | 146 已对齐 |
| 第1課 PRD 单词 28 | OK |
| `lessons-mvp-depth.js` | 脚本仍引用旧路径 → **全站 FAIL**；**不阻塞本课 MVP 冻结** |
| 文档 cache 号部分 txt | 需跑 `同步发布与知识库.bat` 或手动改文案中的 `?v=` |

## 关联文档

| 文档 | 用途 |
|------|------|
| `docs/story-unit-1-LOCKED.md` | 单元1 四格条带（彩蛋 L2，与课内独立） |
| `docs/课程MVP-补课任务单.md` | 全课审计补课（课 2+） |
| `docs/Agent交付前工作流-记忆库.md` | §10 本冻结摘要 |

## 下一阶段

- **笔记板块**（当前主线）：见 `过程讨论内容/19-20260525-笔记板块规范.md` · `docs/笔记板块-开工说明.md`  
- **第2課**：按本课模板扩展五关 + 补全 `knowledge-graph.json` 锚点（**勿动**已锁第1課壳）  
- **单元1 第2–4課**：已并入 `MVP-UNIT1-LESSONS-1-4-FREEZE.md`（v246 锁定）  

用户明确要求 **push 公网** 时再执行 `git push`；冻结表示仓库内定稿基线已写入。
