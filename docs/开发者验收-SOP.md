# 开发者验收 SOP（强制红线 · 发链接/交差前必读）

> **地位**：与 [Agent交付前工作流.md](./Agent交付前工作流.md) 并列；**开发者/Agent 向用户交付前** 必须按本文件执行。  
> **满配测试卡**：[测试卡-满级链接.md](./测试卡-满级链接.md)  
> **24 课深度缺口**：[课程MVP全课审计与验收路径.md](./课程MVP全课审计与验收路径.md)

---

## 一、你是谁、要看什么

| 角色 | 你要的界面 | 正确入口（不要用 legacy） |
|------|------------|---------------------------|
| **开发者（电脑）** | 竖屏真机框内跑完整 App | 日常改 UI：**`打开双通道预览.bat`**（见 [双通道验收-浏览器与手机真机框.md](./双通道验收-浏览器与手机真机框.md)）；满配四关/彩蛋：**`开发者竖屏验收.bat`** → `dev-phone-preview.html` |
| **开发者（手机）** | 满配全开、无通关锁 | 公网/本机链接必须带 **`testcard=1&developer=1`** |
| **学员** | 正常闯关 | 仅 `index.html?v=N`，**禁止**带 testcard |

---

## 二、强制流程（R0→R7）

```text
R0  读 iteration-baseline.json + 本 SOP + 双通道验收 doc
R0b 改 UI：打开双通道预览.bat → A 浏览器 + B 390×844 持续强刷对照
R1  电脑：开发者竖屏验收.bat → 看 iframe 内 App（满配）
R2  电脑：story-unit-phone-real.html → 彩蛋 L1/L2/L3 排版
R3  python scripts/pre-ship-check.py → 全部 [OK]
R4  python scripts/audit-curriculum-mvp.py → 24 课有课包
R5  手机：仅当 R1–R4 通过后，发 v=N&testcard=1&developer=1
R6  PM 勾选 docs/课程MVP-补课任务单.md（深度未齐不得写「金标已齐」）
R7  用户要求时再 git push；push 后等 1～2 分钟再测公网
```

**禁止**：未跑 R3 就说「已上传、可用」；**禁止**给开发者发不带 `testcard=1` 的链接。

---

## 三、满配链接（复制即用）

### 电脑竖屏（推荐）

```
http://127.0.0.1:8765/dev-phone-preview.html
```

### 本机满配 App

```
http://127.0.0.1:8765/index.html?v=94&testcard=1&developer=1
```

### 手机公网满配（push 后）

```
https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=94&testcard=1&developer=1
```

`developer=1` 与 `testcard=1` 等价开启满配，并写入 localStorage；**学员链接不要带这两个参数**。

---

## 四、满配时应看到什么

| 检查项 | 通过标准 |
|--------|----------|
| 顶栏 | 「标日 あと学習」中文正常，**无** `??`、**无** `</a>` 乱码 |
| 底栏 | **课文 · 我的 · 注音**（文法在点进某课后的四关里） |
| 六单元 | 均为 **4/4 課 · 単元完了**（或 24/24 进度） |
| 点课名 | 进入 **単語 / 会話 / 文法 / テスト** 四关 |
| 课右小图 | L1 彩蛋（条带分镜图，非裂图） |
| 单元 👁 | L2 条带可开 |
| 深链 | `&egg=ultimate` / `&egg=unit&unitId=1` / `&storyEggLesson=14` |

---

## 五、为何手机曾出现「看不到课 / 乱码」

| 现象 | 原因 | 处理 |
|------|------|------|
| 大面积 `??`、按钮无效 | `index.html` 曾编码损坏（v93） | 已热修 **v94+**，须换新链接并清微信缓存 |
| 猫头鹰、情景/练习底栏 | 打开了 **legacy.html 旧版** | 旧版已跳转新版；只用 **index.html** |
| 单元 1–3 显示 0/4、灰锁 | 链接**未带** `testcard=1` | 开发者链接必须带满配参数 |
| 第 1 课插画空白 | 无 `lesson-1-egg.webp` | 已改优先用 **unit-1-panel-*-clean.png** |
| 「24 课金标全齐」 | 表述错误 | 仅 14/16/18 金标；其余为银/铜（见审计文档） |

---

## 六、相关文件索引（行动大纲放哪）

| 文件 | 用途 |
|------|------|
| **本文件** `docs/开发者验收-SOP.md` | 开发者交付红线（你问的大纲） |
| `docs/Agent交付前工作流.md` | Agent 发版前机器检查 |
| `docs/Agent文递自归.md` | 迭代纪律 |
| `docs/测试卡-满级链接.md` | 满配参数说明 |
| `docs/课程MVP全课审计与验收路径.md` | 24 课深度分档 |
| `PROJECT_SPEC.md` | 项目总索引 |
| `.cursor/rules/` | Cursor 自动规则（若存在 wendi-zigui） |

---

## 七、关闭满配

- URL 加 `&testcard=0`
- 或「我的」→ 清除学习数据
