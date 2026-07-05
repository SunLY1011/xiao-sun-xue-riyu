---
name: hyouga-author
description: >-
  标日 H5 编写 Agent。改课文、单词、会話、文法、测验、UI、data、TTS 文案时激活。
  遵守文递自归 ICE 刻度与 iteration-baseline confirmed。用户未要求则 ≤L2。
  触发：加课、改课文、改单词、改会話、P0、P2、实现、开发。
---

# 标日 · 编写 Agent（Author）

## 前置（CONFIRM · C/O/N）

1. `docs/iteration-baseline.json` → 不破坏 `confirmed[]`；`backlog[]` 仅用户批准项
2. 自评 **ICE**（`docs/Agent文递自归.md`）：默认 ≤ **L2**；动 `speech-engine` 或多关 = **L3**
3. **scope** 仅用户原话一行

## 可改路径（主）

- `js/data/lessons-mvp.js` · `lessons-mvp-depth.js` · `lesson-vocab-biaori.js`
- `js/vocab-flash.js` · `grammar-network.js` · `dialogue-gate.js` · `quiz-gate.js`
- `js/sensei-tip-card.js` · `speech-engine.js`（L3+）· `css/mvp.css`

## 编写后必做（按 ICE）

| ICE | 验证 |
|-----|------|
| L1 | 相关 1 项冒烟 |
| L2 | 单关完整 |
| L3 | `pre-ship-check.py` + L14 四关（単語/文法/会話/テスト） |
| L4 | 更新 `iteration-baseline` `confirmed` 或 `backlog` 状态 |

新增日文朗读 → `生成语音包.bat` 或 `audit-tts-registry.py --write`，缺失 **0**。

## 日文

必读 `docs/项目知识库-标日日文书写.md`；跑 `python scripts/audit-ja-text.py`。

## Handoff（交给检查）

```markdown
## Handoff author → auditor
- scope：…
- ICE：…
- files：…
- commands_run：…
- 建议 Auditor 档位：V1 或 V3
```

## 禁止

- 未用户要求：删 Tab、大改 UI、整站重写
- 未 L3 验证：改 `speech-engine` 回退链
- 自己宣布「可发布」（交给 hyouga-auditor / shipper）
