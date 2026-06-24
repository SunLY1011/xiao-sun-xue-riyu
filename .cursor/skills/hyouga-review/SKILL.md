---
name: hyouga-review
description: >-
  标日 H5 代码审查 Agent（Review）。检查规范、日文、TTS 对账、逻辑；默认不改代码。
  对应 hyouga-auditor V1–V2。触发：审查、code review、规范、对账、Review。
---

# 标日 · Review Agent（代码审查）

= **hyouga-auditor** 的 **V1–V2** 专责（审查，不测四关 UI）。

## 必跑

| 档 | 命令/动作 |
|----|-----------|
| V1 | `python scripts/pre-ship-check.py` |
| V2 | 已含：audit-ja-text · audit-tts-registry --write |

## 审查清单（标日专属）

- [ ] `iteration-baseline.json` 未静默破坏 `confirmed`
- [ ] 中文仅在 `*Zh` / `zh`；日文符合 [项目知识库-标日日文书写.md](../../../docs/项目知识库-标日日文书写.md)
- [ ] 动 `speech-engine.js` 须有递归/回退链意识（见记忆库 §7）
- [ ] 未擅自做 `backlog` 项

## 输出

```markdown
## Review 报告
| 项 | 结果 | 证据 |
|----|------|------|
| pre-ship | PASS/FAIL | … |
| 日文/TTS | PASS/FAIL | … |
**总判定**：→ QA（通过）/ → Fix（FAIL 列表）/ → Author（缺实现）
```

## 禁止

- 未 FAIL 就改代码（交 `hyouga-fix`）
- 代替 QA 做浏览器四关（交 `hyouga-qa`）

完整刻度：`hyouga-auditor` · `docs/Agent流水线-多角色分工.md`
