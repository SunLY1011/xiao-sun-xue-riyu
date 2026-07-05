# MVP 阶段冻结 · 标日三课 H5（1.0.1）

> **冻结日期**：2026-05-21  
> **Git 标签**：`mvp-v1.0.1-biaori-141618`  
> **产品版本**：1.0.1 · **资源 cache**：v=46  
> **公网**：https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=46

本文件为 **MVP 阶段性成果绑定** 的单一事实来源。新功能（24 课、P3 课内链接等）在 **新分支 / 新 cache** 上迭代，默认不改动本冻结范围。

**第1单元第1課**（五关课内壳）另见冻结文档：[MVP-UNIT1-LESSON1-FREEZE.md](./MVP-UNIT1-LESSON1-FREEZE.md)（cache **146**）。

---

## 范围（已交付）

| 项 | 内容 |
|----|------|
| 课次 | 第 **14 / 16 / 18** 课 |
| 结构 | 每课四关：**単語 → 会話 → 文法 → テスト** |
| 会話 | 多场景、三选返事、无对错惩罚；🔊🎤▶✓ 跟读与单条评分 |
| 文法 | 方案 A 先生卡片 + 補足深度；denseList 中文灰字 |
| 単語 | 一课一词表 + 难词一行提示 + 先生まとめ |
| TTS | 嵌入 `tts-cache/` MP3，`pre-ship-check` 缺失 0 |
| UI | 固定滚动区 + 进度 `N/M` + 可见滚动条 + 关内操作提示 |
| 工程 | 文递自归基线、`pre-ship-check.py`、Agent 流水线文档 |

## 不在本 MVP（明确延后）

见 `docs/iteration-baseline.json` → `backlog`：

- P3 轻量课内链接（迷你浮层跳转）
- 24 课全目录听说读写
- 首次进入遮罩向导（可选二期）

## 内测 · 首页进度种子

`js/mvp-storage.js` 在每次 `loadMvpState` 时将 **第 14 / 16 / 18 课** 三关标为已通关（金黄站点），便于内测看路径；**当前应学**仍按课序落在下一课（通常为 **第 13 课** 高亮）。上架前可关闭 `MVP_INTERNAL_SEED_CLEARED`。

## 验收

- 清单：[MVP收官-手机验收清单.md](./MVP收官-手机验收清单.md)
- 本地：`发布前自检.bat` → 全部 `[OK]` 后再 push

## 版本与仓库

| 引用 | 路径 |
|------|------|
| 机器可读沿革 | `docs/version-history.json` → `mvp_freeze` |
| 迭代 confirmed | `docs/iteration-baseline.json` |
| 学员话术 | `VERSION.md` |
| 家长/学员说明（可发微信） | [MVP-学员与家长说明.md](./MVP-学员与家长说明.md) |

## 下一阶段启动条件

用户单独提供 PR/需求文档后，从 `backlog` 取项；**禁止**在未确认前扩展课次或重写 `app.js` 路由（见 baseline `forbidden_without_explicit_user_request`）。
