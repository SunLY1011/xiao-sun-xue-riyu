# 全域视觉令牌 v1 · DESIGN-TOKENS

> **状态**：已拍板 2026-05-25（档 2 · Q1–Q8）  
> **CSS 真源**：`css/design-tokens.css`  
> **样张页**：`mock/design-tokens-v1-sample.html` · **设计板（Figma 替代）**：`mock/design-system-v1-board.html`  
> **关联**：`docs/封面配色说明.md` · `docs/DESIGN-L0-图标与人设全景.md` · `docs/首页与マイ-信息架构与视觉统筹（讨论稿）.md`

---

## 1. 拍板摘要

| 项 | 决定 |
|----|------|
| 档位 | **档 2** 全域 VI（分 PR 落地，不整站重写） |
| Q1 主行动色 | **珊瑚** `#ff8a80`（顶栏改浅后，按钮/底栏激活仍珊瑚） |
| Q2 顶栏 | **米黄底** `#fff8e1` + **海军字** `#1e3a5f`；高度 **48px**（原 52px，多给主内容区） |
| Q3 五关 | **功能五色 + 降饱和**；单元染色留档 2 后续 |
| Q4 P1 首页 | 符号表：去开发感文案、**4 颗单元星**、日语两行标题 |
| Q5 笔记 | **仅 token 对齐**，不改 V1 语义结构 |
| Q6 入門 | **紫系独立**（`body.intro-body` 不动原则） |
| Q7 文档+样张 | 本文 + `mock/design-tokens-v1-sample.html` |
| Q8 封面锁 | **允许** App 壳层与 P0→P1 转场；`cover-base` 构图仍见锁文档 |

---

## 2. 令牌分层

```text
品牌层     hy-brand-*     海军 / 珊瑚 / 道蓝 / 米黄面
壳层       hy-top-*       顶栏（贴封面情绪）
MVP 桥接   mvp-*          按钮、底栏、正文棕字
五关       gate-{0-4}-*   单词/文法/会話/作業/拡張（降饱和）
目录单元   curriculum     赤橙黄绿青蓝紫（封面配色说明 · 不变）
入門       intro-body     紫系（独立，不并入 mvp-primary）
```

---

## 3. 五关 ↔ gate 编号

| 关 | `data-gate` | 中文 | accent |
|----|-------------|------|--------|
| 単語 | 0 | 单词 | `--gate-0-accent` |
| 文法 | 1 | 文法 | `--gate-1-accent` |
| 会話 | 2 | 会話 | `--gate-2-accent` |
| 作業 | 3 | 作业 | `--gate-3-accent` |
| 拡張 | 4 | 扩展 | `--gate-4-accent` |

工程映射见 `js/lesson-1-flow.js` · `js/hyouga-glyphs.js`（折叠三角色与令牌一致）。

---

## 4. 自洽原则

1. **页面**：`body.mvp-app` 底 = 米黄，与封面 `#fff8e1` 一致；进课后不「跳珊瑚墙」。  
2. **课文**：五关色只表达「模块类型」，不抢单元 `stage-accent`。  
3. **单元**：手风琴左条仍用 `CURRICULUM_STAGE_THEMES`。  
4. **整体**：主 CTA = 珊瑚；导航标题 = 海军；路径/学習の道 = `#4a6fa5`。

---

## 5. 档 2 进度

| 阶段 | cache | 内容 |
|------|-------|------|
| Phase 1 | v286 | 令牌、顶栏、五关基色降饱和、P1 四星两行 |
| **Phase 2A** | **v287** | **符号统一（笔记↔首页）· 五关×单元混色** |
| **Phase 2B** | **v288** | 课内壳层、笔记课行同构、chip→gate |
| **Phase 2C** | **v288** | 地图站点、条带缩略、[`design-system-v1-board.html`](../mock/design-system-v1-board.html) |
| **Phase 2D** | **v289** | 硬编码色扫尾 · [`vi-token-sweep.css`](../css/vi-token-sweep.css) |
| **Phase 2E** | **v328** | 字号/图标/配色美化（仅 CSS）· [`vi-typography-sweep.css`](../css/vi-typography-sweep.css) |

---

## 6. 修订

| 日期 | 内容 |
|------|------|
| 2026-05-25 | v1 立项；Q1–Q8 拍板；`design-tokens.css` 落地 |
