# 三级彩蛋系统 · 产品定稿（知识库真源）

> **状态**：✅ 2026-05-21 作者拍板 · **讨论优先**：改代码前以本文为准  
> **载体**：彩蛋 **UI 仅 H5**；微信小程序 **嵌 WebView 打开**；手机端 **学完自动播放**（非小程序原生页）  
> **关联**：[我们-产品愿景-学习の道.md](./我们-产品愿景-学习の道.md) · [story-通关全家福-评审与课序对照.md](./story-通关全家福-评审与课序对照.md) · [Agent交付前工作流-记忆库.md](./Agent交付前工作流-记忆库.md)

---

## 1. 三级总览

| 级别 | 名称 | 解锁条件（拍板） | 画面 | 素材真源 |
|------|------|------------------|------|----------|
| **L1** | 单课彩蛋 | 本课 **四关全部完成**，且 **四关各 1 颗金星**（共 **4 金星/课**） | 纪念四格 + 单元要点一览 + **本课 egg 大图**（见 §3.2） | `assets/story/lesson-{N}-egg.*`（**每课一张**，与条带四格分离） |
| **L2** | 单元拼图彩蛋 | **本单元 4 课** 均满足 L1（每课 4 金星） | 全屏四格拼图；**仅角标课名**；竖屏 2×2 / 横屏 1×4 | 单元内 4 张课 egg 或 `unit-{U}-strip.webp` 现场拼（实现选型见 §5） |
| **L3** | 终极全家福 | **全部 6 单元** 均满足 L2（24 课 × 4 金星） | 全屏 **4 列 × 6 行** 地理顺序；**仅角标景点名** | `assets/story/egg-grand.webp` + `js/data/grand-finale-cards.js` |

**链式弹出（首次）**

1. **L1**：本课 **テスト 提交且四金星达成** 后立即弹出（H5 全屏）。  
2. **L2**：该单元 **第 4 课** 关闭 L1 后，若单元内 4 课均已 4 金星 → 自动弹 L2。  
3. **L3**：全册满足后，在合适时机（如最后一课 L2 关闭后）自动弹 L3；已看过记 `eggGrandSeen`。

**再次查看**：H5「マイ」→ **获得した彩蛋** 列表（课 / 单元 / 终极）。

---

## 2. 四金星判定（记忆库 · 与地图海星一致）

### 2.1 定义

**四金星（四星）** = 本课下列 **四项全部完成**，且每一项均达到 **金星（满分）** 标准，**不是**「做过即可」。

| 维度 | 对应关 | gate | 金星条件（产品层） | 技术现状（待对齐） |
|------|--------|------|-------------------|-------------------|
| 単語 | 单词 | `gate0` | 本课词表 **浏览完成 / 满分** | `gate0 === true`（待细化满分） |
| 会話 | 会话 | `gate2` | 会話 **全句跟读满分**（产品愿景：score=100） | `gate2 === true`（待接 shadow-speak 百分） |
| 文法 | 语法 | `gate1` | 本课文法网 **全部节点已阅** | `gate1 === true` |
| テスト | 测试 | `gate3` | **全题正确**（100%） | `gate3 === true`（**当前仅「做完」≠ 全对，须改**） |

**统一判定函数（目标）**

```text
isLessonFourGold(state, lessonId) :=
  countLessonGoldStars(state, lessonId) === 4
  AND lessonDimStarState(...) === "gold" for gate 0,1,2,3
  AND quizPerfect(state, lessonId) === true   // gate3 专用：全对
```

**代码锚点（现有）**

- `js/data/curriculum-catalog.js`：`LESSON_FOUR_DIMS`、`lessonDimStarState`、`countLessonGoldStars`、`curriculumLessonCleared`
- `curriculumLessonCleared` 已等于 **4 金星**；须与 **测验全对** 对齐后，再作为 L1/L2/L3 唯一开关

### 2.2 与旧讨论的关系

| 文档 | 旧表述 | 本文 |
|------|--------|------|
| `过程讨论内容/15-单元完成彩蛋讨论.md` | 内测「三关齐」 | **废止为触发条件**；仅作历史 |
| `docs/我们-产品愿景-学习の道.md` | 听·说·读·测验等 **100% 满分** | **采纳**；四关映射见上表 |
| `docs/story-通关全家福-评审与课序对照.md` | 24 课 × 4 金星 | **采纳为 L3** |

### 2.3 存储结构（建议扩展 `state`）

```json
{
  "lessons": {
    "14": {
      "gate0": true,
      "gate1": true,
      "gate2": true,
      "gate3": true,
      "quizScore": 5,
      "quizTotal": 5,
      "quizPerfect": true,
      "fourGoldAt": 1716200000000
    }
  },
  "story": {
    "eggs": {
      "lesson": { "14": { "seen": true, "unlockedAt": 1716200000000 } },
      "unit": { "4": { "seen": false } },
      "ultimate": { "seen": false }
    },
    "pendingEgg": null,
    "eggGrandSeen": false
  }
}
```

---

## 3. L1 · 单课彩蛋

### 3.1 触发

- **时机**：`gate3` 提交后，若 `isLessonFourGold(lessonId)` → **立即** `showLessonEgg(lessonId)`  
- **禁止**：仅三关齐、测验有错仍弹

### 3.2 画面（竖屏 · 产品稿 2026-05-21）

**布局自上而下（与作者截图一致）**

| 区块 | 内容 |
|------|------|
| 顶栏 | 小字 **单课彩蛋** + **第 N 課 · 场景名** + 副标题 `stripTitle` + ✕ |
| 信息卡 | **本单元 · 重要信息** + 单元中文名（如 小李赴日） |
| 列表 | **1–4** 行：角标场景名 + 本课要点一句（`cornerZh` + `lessonCoachSummary` 首条 zh）；**当前课** 行加粗 |
| 主图 | **本课** `lesson-{N}-egg`（无则回退 `unit-{U}-panel-{格}-clean.png`）；左下角角标如 **成田抵日** |
| 底栏 | **分享成绩**（预留）· **继续下一课**（关闭 → 回首页；第 4 课且单元全四金星则排队 L2） |

**说明**：单课完成屏带 **全单元 4 课要点一览**，便于连贯复习；主图仍是 **刚完成那一课** 的 egg。

### 3.3 素材

- **每课单独一张** `egg` 插图（**不是**条带四格中的一格）  
- 目录约定：`assets/story/lesson-{1..24}-egg.webp`（或 `.png`）  
- 美工 brief：课文场景 + 树精グルミ · **条带零字**（与 `storyboard-PN-单元N-彩蛋重绘.md` 同规）

---

## 4. L2 · 单元拼图彩蛋

### 4.1 触发

- **条件**：单元内 **4 课** 全部 `isLessonFourGold`  
- **时机**：该单元 **最后一课（第 4 课）** 的 L1 弹层 **关闭后**，自动 `showUnitEgg(unitId)`  
- **含义**：「本单元完成，且本单元全部 4 颗星（每课 4 金星）」

### 4.2 画面

- **100% 屏幕** = 四张图；**无**大标题、**无**课文摘要  
- 每张图 **右下角**：半透明黑底 + 极小字，如 `第14課 · 買い物`（仅课名短标）  
- 竖屏 **2×2**；横屏 **1×4**；图间 **无间隙**；背景 **纯黑**  
- 图源：优先 **4 张课 egg** 拼接；备选 `unit-{U}-strip.webp`（若与 egg 画风统一）

### 4.3 与现有 `StoryReward` 单元弹窗

- 现有：单元四课「四关齐」即弹竖排条带 + 要点（`js/story-reward.js`）  
- **目标**：L2 改为 **全屏拼图模式**；条带弹窗可降级为「再次查看」入口，或合并进 L2

---

## 5. L3 · 终极 24 景

### 5.1 触发

- **条件**：**6 单元 × 4 课** = 24 课，全部 `isLessonFourGold`（等价于「6 单元均完成且每课 4 金星」）  
- **时机**：最后一课 L2 关闭后，或回首页时 `pendingEgg: 'ultimate'`  
- **判定**：`curriculumGrandFinaleUnlocked(state)`（须与 §2 测验全对对齐后仍成立）

### 5.2 画面与排版（拍板）

- **保持现有 4×6 地理顺序**（`GRAND_SLATE` / `grand-finale-cards.js`），**不**改为提示词草稿里的 6×4 课序表  
- 展示：竖屏按 **4 列 × 6 行** 读图；横屏可 **6×4** 或 **8×3** 自适应（实现细节）  
- 每格 **画面中央** 双行日文（数据 `GRAND_SPOT_CAPTIONS`）：**第1行粗** = 体验/活动（如 ねぶた祭）；**第2行细** = 地点（如 青森県・青森）；美工出图时画面 **无字**，字由 H5 叠字  
- 合成图：`assets/story/egg-grand.webp`  
- 性能：懒加载 / 分块；已看过本地缓存；**不提供** 成就重置

### 5.3 分享

- H5 内「分享到朋友圈」按钮；小程序 WebView 内可调 `wx` 分享（桥接层，非原生彩蛋页）

---

## 6. 载体与自动播放

| 项 | 定案 |
|----|------|
| 彩蛋 UI | **仅 H5**（`index.html` + 新模块 `js/story-egg.js` 或扩展 `story-reward.js`） |
| 小程序 | **不** 做 WXML 原生彩蛋页；课内/测完 → **打开 H5 URL**（带 `lessonId` / `egg=lesson|unit|ultimate`） |
| 自动播放 | 学员在 **手机** 完成当关后，**自动** 拉起对应 H5 彩蛋（WebView 或系统浏览器），无需手动进「我的」再找 |
| 本地预览 | `http://127.0.0.1:8765/story-egg-preview.html`（导航）· App `index.html?v=…` · 双击 `打开彩蛋预览.bat` |

**小程序集成要点（待实现）**

- `pages/courseDetail/test/test.js`：四金星达成 → `navigateTo` WebView `…/index.html?egg=lesson&lessonId=14&v=…`  
- 单元/终极：由 H5 `state.story.pendingEgg` 链式处理；小程序回首页时同步打开 H5 亦可

---

## 7. 实现差距清单（开发前必读）

| 项 | 现状 | 目标 |
|----|------|------|
| 测验金星 | `quiz-gate` 记录 `quizPerfect`；`lessonDimStarState` gate3 仅满分金星 | ✅ 已对齐 |
| L1 弹层 | `js/story-egg.js` 产品稿布局 | ✅ 四金星首次自动弹；`?storyEggLesson=1` |
| L1 素材 | 无 `lesson-N-egg` | 回退 panel-clean；美工出 24 张 egg |
| L2 | `StoryEgg.openUnitEgg` 全屏 2×2/横 1×4 | ✅ 仅角标课名；🎁/单元第4课 L1 关闭后链式 |
| L3 | `StoryEgg.openUltimateEgg` 4×6 格 + `GRAND_SPOT_NAMES` | ✅ 仅景点角标；懒加载单卡 |
| 我的页彩蛋库 | 无 | H5 マイ + 小程序 myRecord 入口 |
| 小程序测完 | `navigateBack` | 改跳 H5 自动播 L1 |

---

## 8. 伪代码 · 触发链

```text
onQuizSubmitted(lessonId):
  if !isLessonFourGold(lessonId): return
  unlockLessonEgg(lessonId)
  showLessonEgg(lessonId)          // H5 立即

onLessonEggClosed(lessonId):
  unitId = getUnitIdForLesson(lessonId)
  if isLastLessonInUnit(lessonId) && isUnitFourGold(unitId):
    queueEgg("unit", unitId)
    showUnitEgg(unitId)

onUnitEggClosed(unitId):
  if isGrandFinaleUnlocked():
    queueEgg("ultimate")
    showUltimateEgg()

function isUnitFourGold(unitId):
  return unit.lessonIds.every(id => isLessonFourGold(id))

function isGrandFinaleUnlocked():
  return all lessonIds 1..24.every(id => isLessonFourGold(id))
```

---

## 9. 变更记录

| 日期 | 说明 |
|------|------|
| 2026-05-21 | 作者拍板：四金星=四关全满分；课 egg 独立图；单元=4课全金星；终极=6单元+4×6地理；H5自动播+小程序嵌开 |

---

**Agent**：改 `curriculum-catalog` / `quiz-gate` / `story-egg` 前请先读 §2 与 §7，并在 PR/提交说明中引用本文路径。
