# Cursor 提示词 · 首页封面地图重绘

> 使用方式：复制全文到 Cursor Composer，逐段执行

---

## 任务目标

在现有日本列岛抽象地图上，增加新干线虚线路径 + 6 个城市标注点，形成首页封面视觉。

## 现有条件

- 地图 SVG：240×360 视口，`js/journey-home.js` → `renderMapCore()` 渲染
- 已有 7 个站点坐标：`CURRICULUM_UNIT_MAP_POINTS`（`js/data/curriculum-catalog.js`）
- 站点连接函数：`curriculumShinkansenUnitPathD()`
- 地图当前被 `display:none` 隐藏

## 修改要求

### 1. 启用并美化地图

- 移除 `style="display:none"`
- 地图背景：浅灰日本列岛剪影（已有）
- 添加浅蓝色海洋底色

### 2. 新干线虚线

- 用 SVG `<path>` 绘制，`stroke-dasharray="6,4"` 实现虚线效果
- 颜色：金色渐变（`#ff8f00` → `#ffd54f`）
- 线宽：2.5px
- 路径轨迹：从南（九州）→ 北（北海道），按真实新干线走向
- 穿越城市顺序：**福冈 → 广岛 → 大阪 → 京都 → 名古屋 → 东京 → 仙台 → 札幌**

```
福冈 (120, 240)
    ↓
广岛 (100, 200)
    ↓
大阪 (140, 170)
    ↓
京都 (145, 155)
    ↓
名古屋 (150, 140)
    ↓
东京 (165, 120)
    ↓
仙台 (170, 80)
    ↓
札幌 (160, 30)
```

### 3. 六个城市站点标注（对应 6 个单元）

每个站点显示：
- 圆形标记（12px，白底 + 红色边框 `#d32f2f`）
- 城市编号（1~6，白色数字，与单元顺序一致）
- 城市名称（11px 日文，下方）

| 编号 | 城市 | 坐标 | 对应单元 | 单元名 |
|:--:|------|------|:--:|------|
| 1 | 東京 | (165, 120) | U1 | 小李赴日 |
| 2 | 大阪 | (140, 170) | U2 | 公司生活① |
| 3 | 箱根 | (155, 130) | U3 | 箱根旅行 |
| 4 | 名古屋 | (150, 140) | U4 | 公司生活② |
| 5 | 仙台 | (170, 80) | U5 | 迎新春 |
| 6 | 札幌 | (160, 30) | U6 | 再见日本 |

### 4. 交互

- 已通关的站点：实心红色 + 金色外圈
- 未解锁的站点：灰色虚框
- 点击站点可展开对应单元
- 站点间用新干线虚线连接

### 5. 技术实现

修改文件：
1. `js/journey-home.js` — 更新 `renderMapCore()`，添加虚线 SVG、城市标记
2. `js/data/curriculum-catalog.js` — 更新 `CURRICULUM_UNIT_MAP_POINTS` 为真实坐标
3. `css/mvp.css` — 添加 `.shinkansen-line` `.map-city-marker` 样式

SVG 虚线示例：
```html
<path d="M120,240 L100,200 L140,170 L145,155 L150,140 L165,120 L170,80 L160,30"
  fill="none" stroke="url(#shinkansenGrad)" stroke-width="2.5"
  stroke-dasharray="6,4" stroke-linecap="round" />
```

城市标记示例：
```html
<g class="map-city" data-city="1" data-unit="1">
  <circle cx="165" cy="120" r="12" fill="#fff" stroke="#d32f2f" stroke-width="2" />
  <text x="165" y="124" text-anchor="middle" font-size="10" fill="#d32f2f" font-weight="bold">1</text>
  <text x="165" y="142" text-anchor="middle" font-size="11" fill="#333">東京</text>
  <text x="165" y="154" text-anchor="middle" font-size="9" fill="#999">小李赴日</text>
</g>
```

---

## 执行步骤

1. 修改 `CURRICULUM_UNIT_MAP_POINTS` 坐标为新值
2. 修改 `renderMapCore()` 添加虚线路径 + 6 个城市标记
3. 添加 CSS 动画（虚线流动效果）
4. 移除 `display:none`
5. `node --check` 验证语法
