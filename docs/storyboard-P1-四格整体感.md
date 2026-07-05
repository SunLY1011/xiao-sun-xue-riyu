# P1 四格 · 整体感（1–3 白天 vs 4 夜景）

## 问题

拼成 2×2 后，格 1–3 是明亮户外樱花系，格 4 是冷蓝室内夜景，**像两套图硬拼**。

## 已做（工程）

| 项 | 说明 |
|----|------|
| 条带无泡 | `unit-1-strip.webp` 用 `panel-*-clean.png` 拼，字在 App 点格放大时用数据叠（可读） |
| 单格有泡 | `panel-*-dialogue.png` / `incoming/...-dialogue.png` 供大图或导出 |
| 格4暖调 | `finish-unit1-strip.py` 从格3 混约 28% 暖色 + 略提亮室内 |

## 你出图时可再加强（任选）

1. **格3 用黄昏**（不是大正午），格4 仍是夜，但中间有「一天过去」感。  
2. **格4 窗外**：暖黄楼灯为主，少纯冷蓝；台灯与格 1–3 阳光同色系。  
3. **四格统一**：同一 LUT / 同一套 pastel 饱和度（你 PS 一批调）。  
4. **重出格4 提示词追加**：`warm orange lamp light like previous panels, cozy evening not cold sci-fi night, window city lights golden yellow`

逻辑仍是「晚上酒店」，只是**色温接上**前三格。
