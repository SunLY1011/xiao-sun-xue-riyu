# 三级彩蛋 · 多机型与横竖屏验收（v92 锁定）

## 已实现（代码层）

| 能力 | 实现 |
|------|------|
| 安全区 | `env(safe-area-inset-*)` + 浮动关闭/继续按钮 |
| 动态视口 | `100dvh`、L1 滚动区 `min(92dvh, …)` |
| 横竖屏 | `js/story-egg-viewport.js` 写入 `--egg-vv-w/h`；`data-egg-orientation` |
| L2 条带 | `object-fit: contain`，横屏按可视高度缩放，不裁切变形 |
| L3 网格 | **固定 4×6 地理序**（北↑南↓·列=春夏秋冬）；横屏整体缩放居中，**不重排为 6×4**（避免格子错位） |
| L1 层级 | `css/story-egg-typography.css`：日语主色 `#263238`，中文辅色 `#90a4ae`；会話行内喇叭 |

## 建议验收矩阵

在 **http://127.0.0.1:8765** 打开（勿用 `file://`）：

- iPhone SE / 14 / 14 Pro Max（`story-unit-phone-real.html` 预设）
- 安卓窄屏（360×780）、平板竖屏（768×1024）、iPad 横屏（1024×768）
- 旋转 90°：L2 条带应完整可见；L3 仍为 4 列 6 行，仅缩小边距

## 已知边界（需产品确认时再扩）

1. **L3 横屏极矮屏**（如手机横屏高度 &lt; 400px）：格子会变小，字幕仍叠在格内底栏；若需「横屏单列滑动浏览 24 格」可另开一版交互。
2. **桌面浏览器拉宽窗口**：按移动 H5 设计，两侧留黑边属预期；非响应式桌面站。
3. **微信小程序 WebView**：依赖系统 WebView 对 `dvh` / `visualViewport` 的支持；极旧机型可能回退为 `vh`，误差约 1 条状态栏高度。

## L3 第 5 行第 1 列（card 19 · 熊本城）

- 格位：`GRAND_SLATE[4][0]` → **cardId 19**
- **真源**：`彩蛋/通关隐藏版-确认版/19.png`（见 `docs/story-grand-confirmed-source.md`）
- v93：左对齐裁切 `GRAND_CELL_CROP_FOCUS[19]=(0.0, 0.5)`，无 AI 重绘
- 验收：`index.html?v=93&egg=ultimate` 第 5 行第 1 格，左下 **树精主人公** 完整入画

## 24 格主人公目检清单

每格须满足：tiny Gurumi、shimenawa、**恰好一张 Gurumi 脸**（见 storyboard 通用后缀）。

| 行↓ 列→ | 春 | 夏 | 秋 | 冬 |
|---------|----|----|----|-----|
| 北 1 | 24 | 3 | 5 | 1 |
| 2 | 8 | 6 | 9 | 2 |
| 3 | 13 | 10 | 14 | 4 |
| 4 | 17 | 15 | 16 | 7 |
| 5 | **19** | 18 | 20 | 21 |
| 南 6 | 12 | 11 | 22 | 23 |

若某格仍缺主人公，对该 `cardId` 执行：

```bash
cd scripts
python install-grand-drafts.py --only <id> --src-dir <生成图目录>
python harmonize-grand-cards.py --only <id>
python finish-grand-finale.py --source harmonized
```
