# 绘画 · 会話 ABC · 知识卡 · 跨课连接 — 全 24 课评估清单

> **用途**：2026-05-30 会议纪要执行对照表  
> **更新**：2026-05-30 · **cache v407 · 完成度 100%**  
> **真源**：`unit-strip-storyboard.js` · `*-dialogue-abc.js` · `*-knowledge-tips.js` · `knowledge-graph.js`  
> **审计**：`docs/audit-abc-all-units-最新.md` · `docs/audit-scene-supplements-l1-24-最新.md` · TTS 缺失 0

---

## 〇、纪要任务 · 完成态总览（100%）

| # | 纪要项 | 状态 | 证据 |
|---|--------|------|------|
| 1 | L1–24 ABC 三答 · B/C 语义分层且**可见不同** | ✅ 100% | 376 场景 · audit ABC 总问题 **0** · `scripts/abc_variants.py` |
| 2 | L1–4 场景名 + noteZh 深度 | ✅ 100% | `rewrite-abc-l1-4-depth.py` · scene-supplements 24/24 PASS |
| 3 | L9–24 课内 B/C 露出 | ✅ 100% | `applyLessons9_24DialogueAbc` · `dialogue-gate.js` |
| 4 | L2–24 会話黄卡 · 课内渲染 · L1 深度结构 | ✅ 100% | `build-dialogue-kcards-l2-24.py` · 366 场景 1:1 |
| 5 | 知识图 L3–24 锚点 + 概念链 | ✅ 100% | 34 概念 · L1–24 全覆盖 · は→L4 · 比较→愿望→可能链 |
| 6 | 绘画条带 ↔ 课文前 4 轮对齐 | ✅ 100% | `sync-storyboard-dialogue-bubbles.py` · 24 格 |
| 7 | 条带 + zoom/彩蛋 **4 泡全量** | ✅ 100% | `MAX_BUBBLES_STRIP=4` · `MAX_BUBBLES_ZOOM=4` |
| 8 | L20/L21 headline ↔ 彩蛋 visualBeat | ✅ 100% | `captionSmall` 桥接 + harmonized art |
| 9 | 笔记关联知识读 knowledge-graph | ✅ 100% | `notes-panel.js` v399+ |
| 10 | TTS A/B/C 全覆盖 | ✅ 100% | 4086 条 · 缺失 MP3 **0** |
| 11 | U1 L1–4 解锁 | ✅ 100% | `iteration-baseline.json` 2026-05-30 |
| 12 | 公网 v407 可验收 | ✅ 100% | pre-ship 全 OK |

**完成度：12/12 = 100%**

---

## 一、ABC 三档定案（已落地）

| 档 | 定义 | 验收 |
|----|------|------|
| **A** | 标日课文原句 | 376/376 一致 |
| **B** | 同场景口语/缩短（**日文可见不同**） | vis(B)≠vis(A) · 0 失败 |
| **C** | 更礼貌/郑重 | C≠A · 0 失败 |

---

## 二、全 24 课总览表（v407）

| 课 | 单元 | ABC场景 | ABC | 会話黄卡 | 跨课连接 | 条带4泡 |
|----|------|---------|-----|----------|----------|---------|
| 1–4 | U1 | 47 | ✅ ★★★ | ✅ 47 | ✅ | ✅ |
| 5–8 | U2 | 56 | ✅ ★★★ | ✅ 56 | ✅ | ✅ |
| 9–12 | U3 | 55 | ✅ ★★★ | ✅ 55 | ✅ | ✅ |
| 13–16 | U4 | 61 | ✅ ★★★ | ✅ 61 | ✅ | ✅ |
| 17–20 | U5 | 72 | ✅ ★★★ | ✅ 72 | ✅ | ✅ |
| 21–24 | U6 | 85 | ✅ ★★★ | ✅ 85 | ✅ | ✅ |
| **计** | 6×4 | **376** | **PASS** | **376** | **L1–24** | **24/24** |

---

## 三、线 A / B / C 分工 · 完成度

| 线 | 内容 | 完成度 |
|----|------|--------|
| **A** 会話 ABC | L1 金标准 + L2–4 人工 + L5–24 rewrite | **100%** |
| **B** 知识卡+连接 | 黄卡接线 · graph 扩展 · 笔记联动 | **100%** |
| **C** 绘画 | 4泡条带 · zoom · L20/L21 彩蛋 | **100%** |

---

## 四、跨课概念链（§六 · 已闭环）

| 概念链 | 覆盖 | 状态 |
|--------|------|------|
| は / です / ですか | L1→L4 | ✅ |
| これ・それ / ここ・あそこ / あります | L2→L4 | ✅ |
| て形 / ている / 形容词て形 | L14→L16 | ✅ |
| 比较 / 愿望 / 可能 | L12→L17→L20 | ✅ |

---

## 五、真源与脚本

| 类型 | 路径 |
|------|------|
| ABC 变体引擎 | `scripts/abc_variants.py` |
| L5–24 重写 | `scripts/rewrite-abc-manual-l5-24.py` |
| L1–4 深度 | `scripts/rewrite-abc-l1-4-depth.py` |
| 黄卡合并 | `scripts/build-dialogue-kcards-l2-24.py` |
| 条带泡 | `scripts/sync-storyboard-dialogue-bubbles.py` |
| 审计 | `scripts/audit-abc-all-units.py` · `scripts/audit-scene-supplements-l1-24.py` |

---

*清单已与 v407 仓库同步 · 纪要要求 100% 对齐。*
