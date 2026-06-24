# 「笔记板块V1」定稿锁

> **锁定日期**：2026-05-25  
> **Git 标签**：`lock/notes-panel-v1-20260525`  
> **缓存版本**：`?v=242`（`js/share-wechat.js` · `CACHE_VER`）

---

## 名称

**「笔记板块V1」定稿锁**（Notes Panel V1 · Learning Recap Lock）

---

## 范围（本锁含）

| 模块 | 说明 |
|------|------|
| 底栏「笔记」 | `#notes-panel-root` · `js/notes-panel.js` |
| 学习计时 | 累计 / 今日一行 · `js/study-timer.js` |
| 课次手风琴 | 1–24 课 · 六单元色条与左边线 |
| 课本 / 老师 / 学霸 | 分色折叠块 · 数据来自 `LESSONS_MVP` |
| 易错知识点 | 仅测验错题；单元/课次汇总；语写动法混色标；**红大字正解在上、蓝小字曾错在下** |
| 关联知识 | 弹窗不跳课；课次行右侧 **倒空心三角+顶横线** 可点开图例 |
| 我的笔记 | `js/learning-notes.js` · 失焦保存 · 橙点 |

## 不含 / 非本锁交付

- 非人工编写的 2–24 课「笔记完成稿」（仍为课内数据自动汇总）
- 第 1 课五关流程（`lesson-1-flow` · 见 `docs/MVP-UNIT1-LESSON1-FREEZE.md`）
- 课文目录 / 首页地图上的易错摘要（backlog）

---

## 规范与开工

- `过程讨论内容/19-20260525-笔记板块规范.md`
- `docs/笔记板块-开工说明.md`

---

## 主要文件

```
js/notes-panel.js
js/app.js          （renderMe → NotesPanel）
js/study-timer.js
js/learning-notes.js
css/mvp.css        （.notes-*）
index.html
js/share-wechat.js （CACHE_VER=242）
```

---

## 链接

| 用途 | URL |
|------|-----|
| 本地 | http://localhost:8765/index.html?v=242 |
| 公网 | https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=242 |

---

## 回滚

```bash
git checkout lock/notes-panel-v1-20260525
```

或从该 tag 新建分支继续改笔记 V2，**勿**在未讨论情况下改动本锁文件语义（尤其 U1L1 五关）。
