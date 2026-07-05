# 第3–6单元第9–24课 · L1 MVP 对齐说明

> 模板：第1课五关 + 会話 ABC（A=课文 · B/C=场景变体）  
> 工程壳：`Lesson1Flow` · `dialogue-gate` · `curriculumIsMvpFiveGateLesson(9–24)`

## 数据管线

1. `python scripts/build-dialogue-zh-l9-24.py` → `js/data/dialogue-zh-l9-24.js`
2. `python scripts/align-lessons-9-24-l1-mvp.py` → `lessons-data.js`（仅替换 lesson 9–24 块）
3. `python scripts/generate-lessons-9-24-dialogue-abc.py` → `js/data/lessons-9-24-dialogue-abc.js`
4. 再跑一次 align（补 ABC 的 A 轨 chinese）

## 验收

```bat
python scripts/audit-lessons-9-24-vs-l1-mvp.py
python scripts/_audit-l9-24.py
```

## 缓存

`CACHE_VER=250` · `index.html?v=250`
