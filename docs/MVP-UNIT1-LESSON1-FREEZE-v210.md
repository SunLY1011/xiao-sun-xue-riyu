# MVP 冻结 · 第1单元 · 第1課

> **冻结日期**：2026-05-25  
> **资源 cache**：`v=210`  
> **课次**：`lessonId: 1` · 第1单元「小李赴日」  
> **本地**：http://localhost:8765/index.html?v=210

---

## 冻结范围（仅第1課课内）

| 模块 | 状态 | 说明 |
|------|------|------|
| 单词关 | ✅ 冻结 | 28词表格式排版 + 🔊🎤▶ 三键 + 词变预留 |
| 会话关 | ✅ 冻结 | 折叠横条 + ABC变体 + 会话要点 |
| 文法关 | ✅ 冻结 | 语法卡片 + exampleZh兼容 |
| 作業关 | ✅ 冻结 | 选择题+填空题 |
| 拡張关 | ✅ 冻结 | 分类折叠（发音/语法/敬语/语源/会话/总结） |

## 数据源

- `js/data/lessons-data.js` — 24课单一数据源
- `js/data/l1-knowledge-tips.js` — L1知识点卡片
- `js/data/l1-dialogue-abc.js` — L1会话变体

## 核心文件

| 文件 | 说明 |
|------|------|
| `js/app.js` | L1单词直接渲染 + 五关路由 |
| `js/lesson-1-flow.js` | L1五关流程 |
| `js/data/lessons-mvp.js` | helper函数 |
| `js/data/lessons-mvp-depth.js` | getLessonVocab等 |
| `css/mvp.css` | 全部样式（含CI/VI tokens） |

## 不在此次冻结

- 第2–24课
- 笔记页完整功能
- 封面首页修改
- 单词变形展示（代码预留，L1无动词）
