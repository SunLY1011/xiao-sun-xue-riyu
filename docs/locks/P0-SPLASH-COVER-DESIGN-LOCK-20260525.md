# P0 开机封面 · 设计阶段定稿锁（LOCKED）

> **锁定日期**：2026-05-25  
> **用户确认**：「可以按美工方案改」+「锁定这个封面设计阶段的成果」  
> **真源底图**：`地图/64649377-e0e1-4239-a073-118630981bb6 (1).png` → 烘焙 `assets/splash/cover-base.png`  
> **资源版本**：`SPLASH_ASSET_VER=21`（`js/home-splash.js`）

---

## 名称

**P0 开机封面 · SPLASH Cover 2.0 设计锁**（非 P1 学习地图）

> **2026-05-25 补充**：用户解锁后允许 **App 壳层**（顶栏米黄+海军、全域令牌）与封面情绪对齐；**仍禁止**改 `cover-base.png` 构图与六圆编号。

---

## 设计意图（一句话）

米黄纯色底 + 橘红渐变列岛 + **蓝色**新幹线路径（与「学習の道」同色）+ 六站白圆编号 + 顶品牌 / 底 CTA；**不**做左侧课表、不做封面五十音大圆。

---

## 范围（本锁含）

### 底图 `assets/splash/cover-base.png`

| 项 | 定稿 |
|----|------|
| 画布 | 853×1844（与 390×844 同比例 `contain`） |
| 背景 | 纯色 `#FFF8E1` `rgb(255,248,225)`，无底纹 |
| 列岛 | 橙红渐变（南浅北深，与「开始学习」按钮同系） |
| 虚线 | `#4A6FA5` `rgb(74,111,165)` |
| 六站圆 | 白圆 + 圆内编号，南→北 **02 · 04 · 03 · 01 · 05 · 06** |
| 再生脚本 | `scripts/apply-splash-v1-style.py`（须从源图重跑，禁止手改 PNG 像素） |

### HTML 叠层 `js/home-splash.js` + `css/mvp.css`（`.splash-screen--complete`）

| 区块 | 内容 |
|------|------|
| 品牌 | Logo · **标日 あと学習** · **学習の道** · **新幹線 24 駅**（仅一行副标） |
| CTA | **轻触进入学习地图** · **开始学习**（橘红渐变 pill，宽约 300px）· 底注「注音 · 五十音在底栏「注音」」 |
| 交互 | 仅 `#btn-splash-start` 进入 P1；整屏不点穿 |
| 布局 token | `--splash-brand-inset-top: 54px` · `--splash-cta-inset-bottom: 56px` · `--splash-cover-anchor-y: 94%` · `object-fit: contain` |

### 预览 / 标尺

| 文件 | 用途 |
|------|------|
| `splash-cover-live-preview.html` | 实时预览 + 上/中/下分区标尺 |
| `mock/home-splash-v3-phone.html` | 旧版区域测量参考（非本锁 UI 真源） |

---

## 明确不含（勿擅自加回封面）

- 左侧 **1–6 + XXX** 课表线框（属 mock，属 **P1**）
- 封面 **50音图** 大圆（五十音 → 底栏「注音」/ `intro.html`）
- 六单元 **七色 POP**、24 课 pill、课名长文
- 城市地名、TRAVEL JAPAN 水印、手机红描边框
- 整屏点击进 P1（已改为仅主按钮）

---

## 与线框/mock 的关系

| 文档/图 | 角色 |
|---------|------|
| `mock/home-splash-v1.png` | 早期情绪参考（已弃「太丑」稿） |
| 用户线框（左列 XXX + 黄线 + 50音圆） | **结构讨论用**，非本锁实现 |
| `docs/P0-开机页-美工与产品策划提示词提纲.md` | 产品边界真源 |
| 本锁 | **工程 + 美工交付冻结** |

---

## 主要文件（改动须用户明示解锁）

```
assets/splash/cover-base.png
js/home-splash.js
css/mvp.css                    （.splash-screen--complete · .home-splash-overlay）
index.html                     （#home-splash-overlay · home-splash.js 引用）
scripts/apply-splash-v1-style.py
splash-cover-live-preview.html
```

回退底图源：`地图/64649377-e0e1-4239-a073-118630981bb6 (1).png`

---

## 验收快照（设计阶段）

- [ ] `splash-cover-live-preview.html` 黄条 `SPLASH_ASSET_VER=21`
- [ ] 底图为纯色米黄、虚线为蓝、六圆可见
- [ ] 微信/App 内主按钮为橘红（非 `btn.primary` 蓝）
- [ ] 品牌区位置：顶 safe + 54px；CTA：底 safe + 56px

---

## 解锁 / 改版流程

1. 用户明确「解锁封面」或「封面 V2」  
2. 更新本文件状态 + `docs/iteration-baseline.json` → `p0_splash_cover_design`  
3. 若换底图：重跑 `apply-splash-v1-style.py` 并 **bump `SPLASH_ASSET_VER`**  
4. 美工大改（上下留白构图）→ 新源图 + 新锁文件 `…-LOCK-YYYYMMDD-v2.md`

---

## 关联

- `docs/P0-开机封面-整图AI出图提示词.md`  
- `docs/封面配色说明.md` § 开机  
- `docs/我们-产品愿景-学习の道.md` · P0/P1 分层
