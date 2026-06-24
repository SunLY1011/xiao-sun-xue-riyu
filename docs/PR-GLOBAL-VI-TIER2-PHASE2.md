# 档 2 · Phase 2 PR 排期（全域 VI）

> 母文档：`docs/DESIGN-TOKENS-v1.md`  
> Phase 1（v286）：令牌文件、顶栏、五关降饱和基色、P1 首页符号  
> **Phase 2（v287）**：页符号统一 + 课内五关随单元混色

---

## PR-2A · 已合入本轮（v287）

| 范围 | 改动 |
|------|------|
| **课内五关 × 单元** | `curriculumApplyGateThemeVars`：单元 accent ~30% 混入 `--gate-*`；`applyUnitThemeToView` 不再覆盖珊瑚主按钮 |
| **折叠三角** | `HyougaGlyphs.setUnitGateFoldColors` 随单元更新 |
| **符号真源** | `curriculumUnitStackedTitleHtml` / `curriculumUnitProgressStarsHtml` |
| **课文首页** | 调用共享符号函数 |
| **我的·笔记** | 单元头两行+四星；课次 summary 右侧海星 |

**验收**：U1 进课 Tab 偏赤、U3 偏黄；笔记页单元行与首页同构；退出课内后折叠色恢复默认。

---

## PR-2B · 已合入（v288）

| 项 | 说明 |
|----|------|
| 课内壳层 | `#view-lesson` / `lesson-cockpit` / `#lesson-flow-body` 单元 `pageBg`；panel 描边 `--unit-border` |
| chip 令牌 | 笔记 `notes-preview-chip` → `--gate-*` |
| 档案课行 | `curriculumLessonRowInnerHtml` / `curriculumLessonCatalogRowHtml`；笔记 summary 同构，去掉折叠行 chips |

---

## PR-2C · 已合入（v288）

| 项 | 说明 |
|----|------|
| 地图站点 | `--station-accent` · dormant/active/cleared 与 `stage-accent` |
| 条带缩略 | `.journey-lesson-egg-btn.is-egg-revealed` 单元色框 |
| 设计板 | [`mock/design-system-v1-board.html`](../mock/design-system-v1-board.html)（Figma 替代） |

---

## PR-2D · 已合入（v289）· 硬编码色扫尾

| 项 | 说明 |
|----|------|
| 令牌扩展 | `--hy-star-*` · `--hy-recording-*` · `--hy-map-dormant-*` |
| 扫尾样式 | `css/vi-token-sweep.css`（海星/ABC/链式底栏/评分四维/录音/me-kp/入門轨） |

---

## 冻结边界（仍遵守）

- `unit1_lessons_1_4_mvp`：不改五关 JS 逻辑与数据  
- `notes_panel_v1`：不改 A+B+C 语义，仅符号与色  
- `p0_splash_cover_design`：不改 `cover-base` 构图
