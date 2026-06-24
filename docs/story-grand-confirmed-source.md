# 通关全家福 · 确认版真源（项目记忆）

## 锁定路径

```
D:\【私人】\【小王】\日语学习\彩蛋\通关隐藏版-确认版
```

- 单景原图：`{1..24}.png`（场景 ID，与 `GRAND_SLATE` 格内 `cardId` 一致）
- 合成归档：`合成用/card-{01..24}.png`、`egg-grand-4x6.webp`
- 说明文档：`通关隐藏版全家福md.txt`

## 原则

1. **禁止**用 AI 重绘替换上述确认版原图（除非产品另开新批次）。
2. 允许的操作：**裁切焦点**、色调 harmonize（可选）、4×6 合成、同步到 `assets/story/grand/`。
3. 第 5 行第 1 列 = `GRAND_SLATE[4][0]` = **card 19**（熊本城）；主人公在原图**左下**，裁切焦点 `fx=0`（见 `GRAND_CELL_CROP_FOCUS`）。

## 命令

```bash
cd scripts
python compose-egg-grand-confirmed.py --install-clean
```

输出：

- `assets/story/grand/card-{NN}-clean.png`（及 draft）
- `assets/story/egg-grand.webp`

调整某一格的裁切：编辑 `scripts/grand_finale_layout.py` 中 `GRAND_CELL_CROP_FOCUS`，再跑上述命令。
