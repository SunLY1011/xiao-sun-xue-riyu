# P0 开机封面 2.0 · 底图专用 AI 出图提示词

> **设计阶段已锁定（2026-05-25）**：[`docs/locks/P0-SPLASH-COVER-DESIGN-LOCK-20260525.md`](locks/P0-SPLASH-COVER-DESIGN-LOCK-20260525.md) · `SPLASH_ASSET_VER=21`  
> 换底图/改版式须用户解锁；烘焙脚本 `scripts/apply-splash-v1-style.py`

> **原则**：封面 = **一张底图 PNG**（`cover-base.png`）。  
> **无**「开始学习」按钮、**无**五十音说明、**无**火车图标、**无** HTML 叠字。  
> 进门方式：工程后续用编程（当前：点按整屏进入 P1）。  
> 换图：覆盖 `assets/splash/cover-base.png` → bump `js/home-splash.js` 的 `SPLASH_ASSET_VER`。

---

## 1. 交付规格

| 项 | 值 |
|----|-----|
| 画幅 | **9:16** · 逻辑 **390×844**（建议导出 **780×1688** @2x） |
| 文件 | `assets/splash/cover-base.png` |
| 底色 | 暖米黄 `#FFF8E1` 铺满全屏 |
| 地图 | 四岛抽象剪影，**尽量左右、上下撑满**，**视觉中心在屏正中** |
| 虚线 | 金色渐变虚线，**完整一条**；在圆下绘制，**圆叠在上方**，圆内线段被圆遮住 |
| 圆点 | **仅 6 个**，同款（游戏关卡感：双圈或单圈+轻发光均可），大小适中（约屏宽 9–11%） |
| 圆内文字 | **仅课程代号 `01`–`06`**（见下表）；**不出现城市名** |
| 圆的位置 | 落在对应城市在地图上的**大致地理位置**（圆只是锚点，不是站牌） |
| 顶栏 | **做进底图**：标日 あと学習 · 学習の道 · 新幹線 24 駅 |
| 禁止 | 按钮、底栏、小火车、樱花堆砌、进度红/灰解锁差异、標準日本語 |

---

## 2. 六站定稿（南→北 · 虚线途经顺序）

虚线为「绳子」隐喻，**不要求**真实时刻表；**相对地理位置**大致正确即可。

圆只标在地图上该城市的**大致位置**；**圆内、圆外均不写城市名**（福岡、東京等不出现在画面上）。

| 顺序（南→北） | 地理锚点（仅用于构图，不写字） | 圆内代号 | 对应单元 | 课表主题 |
|---------------|------------------------------|----------|----------|----------|
| 1 | 福岡一带 | **02** | 第2单元 | 公司生活①（九州） |
| 2 | 名古屋一带 | **04** | 第4单元 | 公司生活② |
| 3 | 箱根一带 | **03** | 第3单元 | 箱根旅行 |
| 4 | 東京一带 | **01** | 第1单元 | 小李赴日 |
| 5 | 仙台一带 | **05** | 第5单元 | 迎新春 |
| 6 | 札幌一带 | **06** | 第6单元 | 再见日本（北海道） |

大阪可在路径走向上**途经**，但不单独第 7 个圆（仅 6 圆）。

**图层（固定）**：① 先画**完整**金虚线 → ② 再画 6 圆（不透明，盖住圆下虚线）→ ③ 圆内写 **`01`–`06` 两位数字**（白字、粗体，不要「单元」二字）。

---

## 3. 中文提示词（完整 · 可复制）

```text
日语学习 App 竖屏开机封面底图，比例 390:844，扁平矢量插画，日系简约探索地图风，不要照片写实。

【背景】暖米黄色 #FFF8E1 铺满全屏。日本列岛抽象剪影（仅北海道、本州、四国、九州），浅灰 #E0E0E0，尽量占满画面宽度与高度，地图主体在屏幕几何中心，四周可留窄边距。外围极淡浅蓝海洋晕染。

【顶栏 · 画在图内】距顶约 10–14%：小 App 图标（珊瑚橙圆角方）。主标题「标日 あと学習」深棕粗体。副标「学習の道」珊瑚粉。小字灰「新幹線 24 駅 · 探索型学习」。不要用「標準日本語 自学の旅」。

【新干线虚线 · 隐喻绳子】沿列岛太平洋侧，从南（九州）经本州到北（北海道）弯曲。金橙渐变虚线（#ff8f00 → #ffd54f），stroke 虚线 6px 实 4px 空，线宽约 2.5–3px，轻微外发光。不要画火车、轨道枕木、车站建筑。

【六个站点 · 同款】六个圆形关卡按钮，样式统一（例如：白底、灰蓝描边、轻外发光，或双圈米白+灰蓝），直径约为屏宽 10%。圆落在对应城市在地图上的大致位置（福岡、名古屋、箱根、東京、仙台、札幌），但画面上不要写任何城市名。

从南到北，圆内仅写两位数字课程代号（白字粗体）：02、04、03、01、05、06。不要写「单元」、不要写中文副标题、不要写福岡/東京等日文地名。

【图层顺序】先画完整连续虚线 → 再画六个圆（圆不透明，盖住圆下方的虚线，使圆内线段不可见）→ 最后在圆内写 01–06 代号。六个圆全部同款，不要红/金「已通关」与灰色「未解锁」混用。

【禁止】任何按钮、「开始学习」、底栏图标、五十音说明、课名 POP 卡、小李人物、24 课列表、水印、3D、拥挤装饰。底部不要特意留大空白给按钮（整图可铺满米黄底）。

输出 PNG，无透明通道，适合微信小程序首屏。
```

---

## 4. English prompt（MJ / Gemini / DALL·E）

```text
Flat vector vertical splash BASE image for a Japanese textbook companion app, aspect ratio 390:844, full-bleed warm cream background #FFF8E1.

Top (~12%): small coral app icon, title "标日 あと学習" dark brown, subtitle "学習の道" coral pink, tiny gray "新幹線 24 駅 · 探索型学习". NOT "標準日本語".

Center: abstract Japan archipelago silhouette (Hokkaido, Honshu, Shikoku, Kyushu only), light gray #E0E0E0, scaled large and centered, filling most of the frame width and height. Pale blue ocean wash at edges.

One continuous golden dashed curved path along the Pacific side from south to north (#ff8f00 to #ffd54f gradient, 6px dash 4px gap, ~2.5px stroke, subtle glow). Metaphorical learning journey rope, NOT a literal train diagram. NO train icon.

Six identical game-level circular markers on the path, south to north, each ~10% screen width, placed at roughly correct geographic positions (Fukuoka, Nagoya, Hakone, Tokyo, Sendai, Sapporo areas) but NO city names anywhere on the image.

Opaque circles cover the dashed line underneath (line not visible under each circle). Inside each circle, only two-digit unit codes in bold white: south to north: 02, 04, 03, 01, 05, 06. No word "单元", no Japanese city kanji labels.

All six markers same visual style (no completed vs locked color states). Layer order: (1) full continuous dashed line, (2) circles on top masking the line, (3) unit numbers inside circles.

NO buttons, NO footer UI, NO kana hints, NO lesson cards, NO characters, NO watermark. Clean flat illustration. PNG, no transparency.
```

---

## 5. 分层版（即梦 / 分步）

1. 米黄满铺 + 大海淡蓝 + 四岛大图居中撑满  
2. 顶栏品牌字 + 图标  
3. **完整**金虚线（南→北）  
4. 六个同款圆盖住线上 6 点（圆下虚线被遮住）  
5. 圆内仅两位数字：02、04、03、01、05、06（无城市名）  

---

## 6. 工程（与底图分离）

| 底图有 | 工程行为 |
|--------|----------|
| `cover-base.png` | 全屏铺底，无 HTML 按钮、无灰字 |
| 尚无底图 | 米黄底 + 居中 `japan-map-splash.png` + 开发占位（金虚线 + 六圆代号） |
| 进门 | 点击封面全屏 → P1（按钮以后再做进底图或 HTML） |

---

## 7. 与封面 1.0 / Cursor SVG 区别

| | 1.0 整图 | 2.0 底图 | P1 学习地图 |
|--|----------|----------|-------------|
| 文件 | cover-full | **cover-base** | SVG + 课表 |
| 圆内 | 单元1–6 | **01–06 代号** | 进度态 |
| 按钮 | HTML | **无** | — |
| 虚线 | 可选 | **完整+圆遮挡** | 可交互 |
