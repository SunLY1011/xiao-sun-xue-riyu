# MVP · 第2单元 · 第5–8課（五关课文）

> **模板**：`docs/MVP-L1-完整规范.md` · **对照**：`docs/MVP-UNIT1-LESSONS-1-4-FREEZE.md`  
> **cache**：`v=248`  
> **L1 严齐**：`python scripts/audit-unit2-vs-l1-mvp.py` → ✅ 达标（2026-05-25）  
> **课次**：`lessonId` **5–8**（第2单元）

## 范围

| 项 | 内容 |
|----|------|
| 结构 | **単語 → 会話 → 文法 → 作業 → 拡張**（五 Tab） |
| 壳 | `Lesson1Flow` + `isUnit2Mvp(5–8)` · `app.js` `isMvpFiveGate` |
| 会話 ABC | `js/data/unit2-dialogue-abc-l5-8.js` · **A=课文 · B/C=场景沟通变体**（`generate-unit2-dialogue-abc.py`）· UI 同 L1 `renderL1AbcReplyList` |
| 金星 | 5 颗/课（与 U1 L1–4 同维度） |
| 校验 | `python scripts/validate-unit2-mvp-lessons.py` |
| 生成 ABC | `python scripts/generate-unit2-dialogue-abc.py` |

## 未改（冻结）

- 第1单元第1–4课：`isUnit1Mvp` 条件与数据锁不变。

## 验收

1. `python scripts/validate-unit2-mvp-lessons.py` → 课 5–8 **[OK]**，ABC 条数 = 会話句数。  
2. 本地 `http://localhost:8765/index.html?v=248` → 第5–8课五 Tab、会話 A/B/C。  
3. `发布前自检.bat` 全 **[OK]**。
