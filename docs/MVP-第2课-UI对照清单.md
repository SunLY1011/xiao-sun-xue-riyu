# 第2课 · 与 MVP（第1课）UI 对照清单

> 对照：`docs/MVP-L1-完整规范.md` · 实现：`Lesson1Flow` + `isUnit1MvpPanel()`  
> 批量修复 cache **244**（2026-05-25）

## 核查结论（修复前 → 已处理）

| 板块 | MVP（第1课） | 第2课修复前 | 处理 |
|------|-------------|------------|------|
| **顶栏 Tab** | 五关同色、无 ✅ | 已一致 | 无需改 |
| **単語** | `l1-gate-panel` + 序号 + 传送链 | 已走 `Lesson1Flow.mountVocab` | 无需改 |
| **会話·外壳** | `l1GatePanelHtml`，无 H2/顶栏说明 | `l1-flow-wrap` +「第2課·会話」+ 操作图例 | ✅ 改 `isUnit1MvpPanel` → 同第1课面板 |
| **会話·折叠条** | `l1-seq-num` + 日文预览 + 中文 hint | `💬` +「第N句·预览」 | ✅ 同第1课 `sceneFoldSummary` |
| **会話·句内** | 开场灰底块 + 本句听完（secondary） | 场景头 + primary +「下一句」 | ✅ 第2课用 `renderL1OpenerBlock` + secondary 听完 |
| **会話·底栏** | 传送链 +「会話完了→文法」 | 仅单按钮、无链 | ✅ `bindChainFooter` + `switchGate(1)` |
| **文法·外壳** | `l1GatePanelHtml` | H2 + 进度条 + 普通 footer | ✅ 同第1课面板 |
| **文法·折叠条** | 序号 + 日文标题 + 中文 + 折叠图标 | `📖` + 标签式摘要 | ✅ 同第1课 `nodeFoldSummary` |
| **文法·底栏** | 传送链 + 必学计数 | 普通「文法完了」 | ✅ `bindChainFooter` + `switchGate(3)` |
| **作業** | 折叠题型 + 内嵌小テスト + 链底 | 已走 `mountHomework` | 无需改 |
| **拡張** | `gw-group` 序号 + 链底「第2课完了→第3课」 | 已走 `mountExtension` | 无需改 |

## 仍与第1课**有意**不同（非缺陷）

| 项 | 说明 |
|----|------|
| 会話 ABC | 与第1课同：`l1-dialogue-abc.js`（课1）· `unit1-dialogue-abc-l234.js`（课2–4） |
| 会話中文灰字 | 第2课 `dialogues[].chinese` 多为空，展开后无译文行（**数据待补**，见下） |
| 知识卡 | 第1课 `L1KnowledgeTips`；第2–4课作业/扩展用通用 fallback |

## 数据待补（下一轮）

- 第2课会話：为 `opener` / `replies` 补 `chinese`（标日课文对照），与 MVP §4.2「展开后中文翻译」一致。

## 改动文件

- `js/dialogue-gate.js` — `isUnit1MvpPanel()`
- `js/grammar-network.js` — `isUnit1MvpPanel()`
- `js/app.js` — 关闭第2课 `l1Flow` 旁路
