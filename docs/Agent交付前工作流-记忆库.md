# Agent 交付前工作流 · 记忆库（项目级 · 持久）

> **用途**：跨会话、跨 Agent 的「已验收结论与踩坑」。交付前必读本文 + [Agent交付前工作流.md](./Agent交付前工作流.md)。  
> **版本沿革机器可读**：[version-history.json](./version-history.json)  
> **已确认功能基线（防遗漏/防回归）**：[iteration-baseline.json](./iteration-baseline.json)  
> **文递自归**：[项目知识库-文递自归.md](./项目知识库-文递自归.md)（概念）· [Agent文递自归.md](./Agent文递自归.md)（执行纪律）

---

## 0. 三级彩蛋 · 四金星（2026-05-21 拍板）

| 项 | 定案 |
|----|------|
| **真源** | [story-egg-three-tier-系统定稿.md](./story-egg-three-tier-系统定稿.md) |
| **四金星** | 本课 **単語·会話·文法·テスト** 四关 **全部完成且全部金星（满分）**；测验须 **全对** |
| **L1** | 每课 **单独** `lesson-{N}-egg` 图；测完 **H5 立即弹** |
| **L2** | 单元 4 课均四金星 → 全屏四格拼图（仅角标课名） |
| **L3** | 6 单元全满 → `egg-grand` **4×6 地理序**（`grand-finale-cards.js`） |
| **载体** | 彩蛋 **仅 H5**；小程序 **WebView 嵌开**；手机学完 **自动播放** |

旧「内测三关齐触发单元条带」→ 仅历史，见 `过程讨论内容/15-单元完成彩蛋讨论.md`。

---

## 1. 版本双轨（勿混淆）

| 轨道 | 当前（2026-05-21） | 说明 |
|------|-------------------|------|
| **产品版** | **1.0.1** | 给学员/你的 semver：1.0.0 冻结 → 1.0.1 小修 |
| **缓存 build** | **v=44** | `?v=44`；方案 A 四关 + **speech-engine 栈溢出已修**（见 §7） |

**不是** 1.38 / 1.40 产品版。查历史：`docs/version-history.json` → `releases[]`；Git 标签 `mvp-v1.0-wechat` = 产品 1.0.0。

---

## 2. 费用模型（已确认）

- 学员微信打开 **GitHub Pages 链接**：下载静态资源 + 本地 MP3，**无** 运行时 AI API 费。
- MVP `index.html` **未加载** `chat.js` / OpenAI。
- 🔊 = `tts-cache/*.mp3`；🎤/✓ = 浏览器 + `speech-engine.js` 本地分析。
- **仅作者本机** `python scripts/build-tts-cache.py` 用 edge-tts 生成语音（开发侧）。

---

## 3. 会話评语「两条同时出现」— 根因与验收

| 项 | 内容 |
|----|------|
| **根因** | `js/shadow-speak.js` 内 **`clearDialogueScores` 定义了两次**，后者弱实现覆盖前者，旧 panel 未清 |
| **修复** | 删除重复函数；评语只在 `dialogue-gate.js` 行下 `[data-dg-score-for]`；新 🎤/▶/🔊/✓ 前 `clearDialogueScores()` |
| **验收 UI** | 日文**下方**「本句发音」+ 四维 0–10；**不是**右侧旧版「发音 XX分」 |
| **冒烟** | L14 ②：句① ✓ 出分 → 句② 🎤 → 句① 评语必须消失 |

---

## 4. 本地预览 localhost 打不开（ERR_EMPTY_RESPONSE）

| 现象 | 原因 |
|------|------|
| `localhost:8765` Connection Failed / 未发送数据 | **未启动** `http.server`，或 **8765 僵尸进程**（端口 LISTENING 但 HTTP 无响应） |

| 操作 | 命令 |
|------|------|
| 推荐 | 双击 **`打开本地预览.bat`**（自动起服务 + 带 `?v=`） |
| 仍失败 | 双击 **`重启本地服务.bat`**（会结束**所有**占用 8765 的进程），再开预览 bat |
| 根因补充 | 多次点 bat 会叠 **4 个** `python -m http.server`，端口 LISTENING 但 HTTP 无响应 |
| 禁止 | 未起服务就发 `localhost:8765` 链接；用 Cursor 内嵌浏览器却不跑 bat |

探测：`python scripts/start-local-server.py --probe`

---

## 5. 发布前全局检查清单（机器 + 人）

### 机器（必跑）

```bat
发布前自检.bat
```

等价 `python scripts/pre-ship-check.py`：

1. `?v=` = `CACHE_VER`
2. 单词 meaningZh、课外 zh、audit-ja-text
3. `audit-tts-registry.py --write` → **缺失 0**
4. 存在 `打开本地预览.bat`

### 人工（改会話/语音/UI 后）

1. **先** `Cursor真机持续预览.bat` 或 `cursor-miniapp-phone.html?live=1` — 见 **§15 铁律**
2. 每一次保存后，真机框内须为最新 UI；再声称修好
3. L14 ② 评语切换（见 §3）
4. L14 ② 文法 🔊 不「朗读失败」
5. 单词灰字 + 🔊

### 交付反馈块

见 [Agent交付前工作流.md](./Agent交付前工作流.md) 第五节；**本地 HTTP 探测失败时不得写「本地可开」**。

---

## 7. 四关全挂「読み込みエラー」— 根因（勿再犯）

| 项 | 内容 |
|----|------|
| **现象** | 単語/文法/会話/テスト 仅显示加载错误，像「界面被删」 |
| **根因** | `speech-engine.js`：`fallbackLines()` → `sortCandidatesByPrimary()` → `primaryTtsKey()` → 再调 `fallbackLines()` **无限递归** |
| **修复** | `since_cache=44`：`sort` 用 `preferredTtsKeyFromObj`，禁止在 sort 路径调 `primaryTtsKey` |
| **纪律** | 改 `speech-engine.js` 必跑 [Agent文递自归.md](./Agent文递自归.md) §五 四关回归；入账 `iteration-baseline.json` |

---

## 8. 文递自归 · ICE 刻度（摘要）

完整见 [Agent文递自归.md](./Agent文递自归.md)：

- **L0～L2**：小改；用户未要求则停在此档  
- **L3**：动语音/多关 → `pre-ship-check` + 四关冒烟  
- **L4**：仅做 `iteration-baseline.json` → `backlog` 里用户已批项  
- **L5**：删功能/大改 UI → **禁止**除非用户逐条点名  

每轮：**C 读基线 → O 本轮 scope → N 最小文件 → F 验证 → I 更新 JSON → R 交付反馈块**

---

## 9. 用户问题登记（2026-05-25 · 执行清单）

**真源**：[执行清单-用户问题与验收.md](./执行清单-用户问题与验收.md) · 一键：`用户问题验收.bat`

| ID | 要点 | 状态 |
|----|------|------|
| U-01～U-04 | 我的·笔记：加高、外点收起、课/单元/全册、从マイ进课返回マイ | done |
| U-05 | 全局 🔊 浅灰 `#9e9e9e` | done |
| U-06 | 五十音：勿批量 prefetch；滚动误触禁弹 600ms | done |
| U-07 | 语音：1101 条对账缺失 0；`TTS-语音包强制审核与防复发.md` | done |
| U-08～U-09 | 会話🔊 / iframe：须 8765 HTTP，非 file:// | 交付前手验 |
| U-10 | 封面 | backlog |
| U-11 | 课内去掉五星横条；会話纵向折叠句 | done |
| U-12 | 文法纵向折叠；点开见说明+例句；无 前へ/次へ | done |

**交付前必跑**：`发布前自检.bat` → `docs/TTS-对账报告-最新.md` 缺失 0。

---

## 10. 第1单元第1課 MVP 冻结（2026-05-25）

| 项 | 定案 |
|----|------|
| **文档** | [MVP-UNIT1-LESSON1-FREEZE.md](./MVP-UNIT1-LESSON1-FREEZE.md) |
| **cache** | **146** |
| **课内** | 五关 `lesson-1-flow.js`；提示无「老师」字样；底栏传送链 + 分关色 |
| **关联** | 阶段 A：`knowledge-graph.js`；第1課不显示跨课 chip；第2課起 |
| **勿混** | 旧 MVP 三课 14/16/18 仍见 `MVP-FREEZE.md` |

---

## 11. 课内单词 · 标黄范式（2026-05-25 · 通用准则）

> **真源全文**：[项目知识库-课内单词标黄范式.md](./项目知识库-课内单词标黄范式.md)  
> **凡改単語关 UI/数据/延伸文案，开工前必须先读该文 + 本节。**

| 项 | 定案 |
|----|------|
| **适用范围** | 课内单词表编写与展示的**项目通用范式**；先 **U1L1 MVP**，未要求不扩 24 课 |
| **默认** | 行内仅：日文 + 读音 + 一条中文义；右 **🔊 🎤 ▶** |
| **标黄** | **白/纯黄二态**（禁渐变）；注意词 `.is-vocab-warn`；延伸 **▸ 黄钮**；见 [产品设计规范-平面轻量UI.md](./产品设计规范-平面轻量UI.md) |
| **延伸** | `l1-knowledge-tips.js`；**行内折叠**，禁止全屏挡朗读 |
| **禁止** | 每词都黄；`app.js` 第二套 `l1-vocab-wrap`；单词关第四键 ✓ 评分 |
| **实现** | `lesson-1-flow.js` `mountVocab` + `ShadowSpeak`；样式 `css/mvp.css` `.l1-vocab-*` |
| **密度/统筹** | [项目知识库-U1L1-MVP-UI统筹审查.md](./项目知识库-U1L1-MVP-UI统筹审查.md) — 改 U1L1 UI **前置必读** |

---

## 12. U1L1 MVP · UI 统筹（2026-05-25）

> **真源**：[项目知识库-U1L1-MVP-UI统筹审查.md](./项目知识库-U1L1-MVP-UI统筹审查.md)

| 项 | 定案 |
|----|------|
| **折叠态单词** | 白盒细框、横排铺满、优先一行；延伸展开 **浅灰** 非黄 |
| **图标分工** | 灰=听录播；彩▸=折叠；黄路标=注意 |
| **审查表** | §1 总表：✅/🔧/⚠️/📋 状态，推广它课前复跑 |

---

## 14. 第1单元第1課课文 MVP 锁定（2026-05-25）

| 项 | 定案 |
|----|------|
| **状态** | `unit1_lesson1_mvp` → **locked** · cache **225** |
| **文档** | `docs/MVP-UNIT1-LESSON1-FREEZE.md` |
| **禁改** | `js/lesson-1-flow.js` 及第1課课内五关数据（无用户明示） |
| **下一主线** | 笔记板块 V2 → `docs/笔记板块-开工说明.md` · 规范 19 |

---

## 13. 第1課五关提示统一（cache 225 · 2026-05-25）

| 项 | 定案 |
|----|------|
| **交互** | 単語/会話/文法/作業/拡張均为 **「提示：」+ ▾**，默认收起 |
| **实现** | `SenseiTipCard` 的 `l1Scope`；槽位 `.l1-tip-slot` |
| **单词序号** | 与 `--l1-seq-size: 26px` 栅格对齐，勿再写 22px 覆盖 |
| **归档** | `过程讨论内容/20-20260525-L1五关提示统一与课内UI阶段归档.md` |

---

## 15. 双界面交付 + 双通道验收（2026-05-25 拍板 · 2026-05-26 双界面成文）

| 项 | 定案 |
|----|------|
| **首要执行** | [学员端双界面显示标准-首要执行.md](./学员端双界面显示标准-首要执行.md) — **①** Cursor `cursor-miniapp-phone.html?live=1`（390×844 **切换页壳尺寸不变**）· **②** 微信 https `?v=CACHE_VER` |
| **真源** | [双通道验收-浏览器与手机真机框.md](./双通道验收-浏览器与手机真机框.md) |
| **前置（改 UI/课内/マイ/笔记/入門）** | 双击 **`打开双通道预览.bat`**；`8765` 须 probe OK |
| **通道 A** | `index.html?v=CACHE_VER` — 浏览器全宽，改码后 **Ctrl+F5** 持续对照 |
| **通道 B** | `cursor-miniapp-phone.html?live=1` — **390×844** 壳 · web-view **753** 高 · 约 4 秒自动刷新 |
| **铁律** | **每一次**刷星/改 UI → 最终态必须在 B 内目视；Cursor **Simple Browser** 固定上址 |
| **一键** | **`Cursor真机持续预览.bat`** |
| **交付前终检** | `发布前自检.bat` 全 OK **之后**，仍须在真机框目视；交付块写明「真机框 live 已目视」 |
| **勿替代** | 开发者满配四关/彩蛋仍用 `dev-phone-preview.html`（[开发者验收-SOP.md](./开发者验收-SOP.md)），与 B **并列** |
| **禁止** | 仅 Cursor 全宽预览、不刷新就交付；`file://` 验收；用公网链在本机代替改码验收 |

---

## 6. 修订记录（记忆库）

| 日期 | 记入内容 |
|------|----------|
| 2026-05-25 | **铁律** · `?live=1` 持续同步 · `Cursor真机持续预览.bat` · `miniapp-real-device-preview-iron-law.mdc` |
| 2026-05-25 | **§15 双通道验收** · `打开双通道预览.bat` · `docs/双通道验收-浏览器与手机真机框.md` · pre-ship 校验 |
| 2026-05-26 | **双界面首要执行** · `docs/学员端双界面显示标准-首要执行.md` · Cursor L1–L3 锁定壳 · 汇编 R10/R12 |
| 2026-05-25 | **§14 U1L1 课文 MVP locked** · 笔记 V2 开工 `docs/笔记板块-开工说明.md` |
| 2026-05-25 | **§13 L1 提示统一** cache **225** · 阶段归档 `过程讨论内容/20-…` |
| 2026-05-25 | **§12 U1L1 UI 统筹** · 高密度单词 · 延伸灰底 · `项目知识库-U1L1-MVP-UI统筹审查.md` |
| 2026-05-25 | **L3 图标全景** · 听录播灰无框 · 折叠彩三角 · `hyouga-glyphs.js` · `产品设计规范-L3图标全景清单.md` |
| 2026-05-25 | **平面轻量 UI** · `docs/产品设计规范-平面轻量UI.md` · `.cursor/rules/flat-lightweight-ui.mdc` |
| 2026-05-25 | **§11 课内单词标黄范式** · `docs/项目知识库-课内单词标黄范式.md` · 改単語前必读 |
| 2026-05-25 | **§10 第1单元第1課 MVP 冻结** cache **146** · `docs/MVP-UNIT1-LESSON1-FREEZE.md` · `iteration-baseline` `unit1_lesson1_mvp` |
| 2026-05-25 | §9 用户问题 U-01～U-10；执行清单 + `用户问题验收.bat` |
| 2026-05-21 | 版本双轨 1.0.1/cache40；费用模型；评语 duplicate 根因；localhost 僵尸端口；全局检查清单 |
| 2026-05-21 | 方案 A cache41：`sensei-tip-card.js` 四关「先生のひとこと」；文法取消翻面 `gn-scroll` |
| 2026-05-21 | 朗读 cache42：MP3 预热复用、箭头句与 dense 对齐、preferTtsKey、停播不杀全部预热 |
| 2026-05-21 | cache44：speech-engine 递归修复；`Agent文递自归` + `iteration-baseline.json` 增量基线 |
| 2026-05-21 | 用户定名「文递自归」入库；`pre-ship-check` 校验基线文档与 cache 一致 |
| 2026-05-21 | 名称更正：原「迭代弟子规」→ `Agent文递自归.md` |
