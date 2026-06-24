# 24 课 MVP 全课审计 · PM 审核 · 验收路径（唯一真源）

> **更新**：2026-05-30 · cache **v=410** · **L1–24 内容层已 ship**（见 [L1-24-收官报告-v410.md](./L1-24-收官报告-v410.md)）  
> **金标参照课**：第 **14** 课  
> **机器审计**：`python scripts/audit-curriculum-mvp.py` → `docs/curriculum-mvp-audit.json`（脚本待适配合并后数据源）

---

## 1. 结论（产品经理 · 拍板）

| 维度 | 现状 | 判定 |
|------|------|------|
| 目录 / 可进入 | 24 课均在 `LESSONS_MVP` 合并后可点（`testcard=1` 或 dev 模式） | ✅ 结构齐 |
| 四关骨架 | 24 课均有 文法 / 会話 / 测验 数据 | ✅ 能跑通 |
| **对齐 L14 金标深度** | 仅 **14 / 16 / 18** 达冻结 MVP；**13–20** 为阶段二银标；**1–12、21–24** 为 PRD 自动铜标 | ⚠️ **须分波补齐** |
| 语音 TTS | 全局 `audit-tts-registry` 缺失 0（v93） | ✅ 工程过关 |
| 彩蛋 L1/L2/L3 | 条带 / 插画 / 通关 24 景已铺（见 story-egg 阶段文档） | ✅ 可验收 |

**PM 结论**：可以 **内测全目录 + 彩蛋**；**不宜**对学员宣称「24 课均为 L14 同级深度」。补齐顺序见 §4，与 [FULL-VERSION-ROADMAP.md](./FULL-VERSION-ROADMAP.md) 一致。

---

## 2. 分课档位（人工审定 · 对照金标）

| 档位 | 课次 | 数据源 | 相对 L14 缺口（摘要） |
|------|------|--------|----------------------|
| **金标 GOLD** | 14, 16, 18 | `lessons-mvp.js` + depth 满配 | 无（冻结 MVP） |
| **银标 SILVER** | 13, 15, 17, 19, 20 | `lessons-stage2-mvp.js` | 缺部分 `nodePatches` / `difficultVocabHints`；测验多为 **3** 题；文法节点标题待精修 |
| **铜标 BRONZE** | 1–12, 21–24 | `lessons-prd-unreleased-mvp.js`（自动生成） | 会話 **chinese 常空**；无 `nodePatches`；测验 **3** 题；多数无 `questionTts`；无 `lessonTitleRuby`；无 `lesson-vocab-biaori` 行 |
| **缺失** | — | — | **0 课**（无空壳课号） |

详细计数见 `docs/curriculum-mvp-audit.json` 每课 `gaps[]`。

---

## 3. 金标（L14）检查项 · 补齐必达

每课对齐须满足（Author 播种 / Review 对照）：

| # | 维度 | 金标要求 |
|---|------|----------|
| 1 | 文法节点 | ≥5 个，具 `title` / `titleZh` / `explanation` / `example` / `links` |
| 2 | 文法補足 | `lessons-mvp-depth.js` → `nodePatches` + `denseList` 含 `zh` |
| 3 | 単語 | `vocab` ≥8 或接入 `lesson-vocab-biaori.js`；`difficultVocabHints` + `lessonCoachSummary` |
| 4 | 会話 | 1 场景；`opener` + 3×`replies`；`noteJa` + `noteZh`；**`chinese` 非空** |
| 5 | 测验 | ≥4 题；填空带 **`questionTts` 完整句**；`grammarNodeId` 挂钩 |
| 6 | TTS | 新增日文 → `生成语音包.bat` → `audit-tts-registry.py` 缺失 0 |
| 7 | 标题 | `lessonTitleRuby` 覆盖课名汉字 |

---

## 4. 补齐 waves（执行顺序）

```text
Wave A（已完成）  MVP 冻结课 14 / 16 / 18 + 工程 pre-ship + 彩蛋 L1/L2/L3

Wave B（进行中）  阶段二 13 / 15 / 17 / 19 / 20
  → 作者手修 stage2 JS + depth nodePatches + 第 4 测验题 + TTS 补录

Wave C（计划）    PRD 自动课 1–12
  → 改 PRD / generate-lessons-from-prd.py：chinese←noteZh、questionTts、quiz×4
  → 作者补 nodePatches + difficultVocabHints（按课语法点）

Wave D（计划）    21–24
  → 先补 PRD 文稿，再重跑 generate + Wave C 同流程

横切              Part-0 入門（intro.html）· 不锁正课 · 见 Part-0-播种检查表.md
```

**禁止**：未过 Review 整文件覆盖 `lessons-mvp.js` 内 14/16/18（见 `MVP-FREEZE.md`）。

---

## 5. PM ↔ 审核官 · 自归循环（每 wave 必跑）

| 轮次 | 角色 | 动作 | 通过标准 |
|------|------|------|----------|
| R0 | **PM** | 读本文件 §2 + `curriculum-mvp-audit.json`，确认 wave 范围 | 课次列表与 roadmap 一致 |
| R1 | **Author** | 按 §3 改 `lessons-*-mvp.js` / `lessons-mvp-depth.js` | 单课四关可进、无控制台报错 |
| R2 | **审核官** | `python scripts/pre-ship-check.py` | 全部 `[OK]` |
| R3 | **审核官** | `python scripts/audit-curriculum-mvp.py` | 目标课 `gaps` 缩短；银→金 |
| R4 | **审核官** | `python scripts/audit-ja-text.py` | PASS |
| R5 | **QA** | 满级测试卡 + 抽 2 课四关（见下 §6） | 中日显示、🔊、测验满分逻辑 |
| R6 | **PM** | 勾选 `docs/课程MVP-补课任务单.md` 对应课 | 可写入 `iteration-baseline.json` confirmed |
| R7 | **Shipper** | bump cache、`git push`、GitHub Pages 探活 | 公网 `?v=` 与本地一致 |

未通过：**回到 R1**，不 bump 学员-facing 版本。

---

## 6. 完整验收路径（发给你 / 手机）

### 6.1 满级测试卡（测 24 课 + 彩蛋 · 不必打关）

**真源**：[测试卡-满级链接.md](./测试卡-满级链接.md)

| 场景 | URL |
|------|-----|
| 本机 | `http://127.0.0.1:8765/index.html?v=93&testcard=1` |
| 手机同 WiFi | 运行 **`手机同WiFi预览-满级测试卡.bat`**，复制终端「手机」行 |
| 深链 L3 | `…&testcard=1&egg=ultimate` |
| 深链 L2 U1 | `…&testcard=1&egg=unit&unitId=1` |
| 深链 L1 L14 | `…&testcard=1&storyEggLesson=14` |

### 6.2 一键本地脚本

| 脚本 | 作用 |
|------|------|
| `打开满级测试卡.bat` | 8765 + 自检 + 浏览器 |
| `本地彩蛋完整测试.bat` | pre-ship + story-egg-smoke |
| `课程MVP审计.bat` | 全课 MVP 缺口表 + JSON |
| `发布前自检.bat` | 发布闸门 |

### 6.3 学员正式入口（无 testcard）

- 公网：`https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=93`  
- 须 **push 完成** 后有效；见 `VERSION.md`

### 6.4 按档位抽测建议

| 档位 | 建议抽测课 | 重点看 |
|------|------------|--------|
| 金标 | 14 | 文法補足灰字、会話三选一、测验填空🔊 |
| 银标 | 13 或 20 | 四关能否通关、条带 👁 |
| 铜标 | 1 或 21 | 会話中文是否显示、测验是否仅 3 题 |

---

## 7. 相关文件索引

| 用途 | 路径 |
|------|------|
| 课包合并 | `js/data/lessons-mvp.js` ← stage2 + prd-unreleased |
| 深度补丁 | `js/data/lessons-mvp-depth.js` |
| 标日词表 | `js/data/lesson-vocab-biaori.js`（现仅 13–20 + 14/16/18） |
| 目录真源 | `js/data/curriculum-catalog.js` |
| MVP 冻结 | `docs/MVP-FREEZE.md` |
| 路线图 | `docs/FULL-VERSION-ROADMAP.md` |
| 迭代基线 | `docs/iteration-baseline.json` |
| PM 导演手册 | `docs/PRODUCT-PM-全局导演手册.md` |
| 补课勾选单 | `docs/课程MVP-补课任务单.md` |
| 彩蛋阶段 | `docs/story-egg-phase-ship.md` |

---

## 8. 审核官本轮记录（v93）

| 检查 | 结果 |
|------|------|
| `pre-ship-check.py` | **PASS**（cache v93 · TTS 缺失 0 · audit-ja PASS） |
| `audit-curriculum-mvp.py` | **24/24 有课包**；金标 3 课；银标 5 课；铜标 16 课 |
| PM 放行范围 | 全目录内测 + 彩蛋验收；**不全网宣称 24 课金标深度** |

下一轮 Wave B 完成后：更新本表 + `curriculum-mvp-audit.json` + bump cache。
