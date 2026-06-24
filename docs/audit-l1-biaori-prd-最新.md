# 第1课 · 标日 PRD 对账报告（批次 E）

> 生成：`python scripts/audit-l1-biaori-prd.py` · 日期 2026-05-26
> PRD：`【产品PRD】\新增补课文内容\第1单元\第1单元第01课.txt`
> 数据：`js/data/lessons-data.js` lessonId=1

## 总判定

| 项 | 结果 |
|----|------|
| 单词 PRD↔data 条数 | 28 / 28（UI 展示 28） |
| 单词对账 | ✅ PASS |
| 文法节点 | 4 |
| 会話场景（data） | 10 |
| ABC 变体条数（l1-dialogue-abc.js） | 0 |
| 小测题 | 12（无解析文案 0） |
| 作業段 | 9 |
| 拡張块 | 5 |
| 文法 links 空节点 | 0 |

## 说明

- 本脚本 **只读**；不写 lessons-data。
- 会話 A/B/C 真源在 `l1-dialogue-abc.js`，本表仅统计 data 内 `dialogues` 场景数。
- 解析微调跑 `python scripts/patch-l1-explanation-zh.py`（不动 `lesson-1-flow.js`）。
