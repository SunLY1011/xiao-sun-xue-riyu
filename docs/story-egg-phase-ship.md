# 课程插画 · 三级彩蛋 · 本阶段收官（cache v93）

> 阶段范围：单元条带 L2、单课彩蛋 L1、通关全家福 L3、首页入口与真机排版验收。  
> 真源定稿：`docs/story-egg-three-tier-系统定稿.md`

## 资产真源（勿混）

| 层级 | 真源目录 / 文件 | 合成脚本 |
|------|-----------------|----------|
| L2 单元条带 | `彩蛋/单元{N}/确认版/` → `assets/story/unit-{N}-strip.webp` | `install-unit-strips-from-confirmed.py` |
| L3 通关 24 格 | `彩蛋/通关隐藏版-确认版/{1..24}.png` | `compose-egg-grand-confirmed.py` |
| L3 裁切焦点 | `scripts/grand_finale_layout.py` → `GRAND_CELL_CROP_FOCUS` | 仅裁切，禁止 AI 重绘替换确认版 |

## 收官命令（本机执行顺序）

```bat
cd /d 日语学习\scripts
python sync-story-to-eggs.py --all
python sync-grand-to-eggs.py
python compose-egg-grand-confirmed.py --install-clean
cd ..
python scripts\pre-ship-check.py
```

## 验收链接（本地 8765）

| 层级 | URL |
|------|-----|
| L1 | `index.html?v=93&storyEggLesson=1` |
| L2 | `index.html?v=93&egg=unit&unitId=1` |
| L3 | `index.html?v=93&egg=ultimate` |
| 排版 | `story-unit-phone-real.html` |

## Git / 微信

1. `git push origin main`（含 `assets/story/`、`js/story-egg*.js`、`彩蛋/` 归档）
2. GitHub Pages 约 1～2 分钟更新；分享链接 `?v=93`
3. 小程序壳：`japanese_learning_miniapp/config/h5-url.js` 已与 `CACHE_VER` 对齐
4. 微信内发链接前：手机 4G 打开公网 URL，抽测 L2 条带 + L3 第 5 行第 1 格（card 19 主人公）

## 本阶段不再展开（ backlog ）

- 我的页彩蛋图鉴、L1 全 24 课独立 `lesson-N-egg.webp` 批量绘制
- 横屏 L3 单列滑动模式（见 `docs/story-egg-responsive-验收.md`）
