# Cursor 推荐设置（作者本机）

> Agent **无法**替你勾选 IDE；请在本机对照开启。规则以仓库 `.cursor/rules/` + `PROJECT_SPEC.md` 为准。

---

## 1. Rules（规则）

路径：**Cursor Settings → Rules, Commands → Project Rules**

本仓库规则文件已写好 `alwaysApply: true`（见各 `.mdc` 头部）。你只需在 Cursor 里**不要手动 Disable** 下列规则：

确认以下规则为 **Enabled**（类型应为 Always Apply 或等效）：

| 规则文件 | 作用 |
|----------|------|
| `wendi-zigui-core.mdc` | 文递自归术语与前置软自检 |
| `agent-delivery-gate.mdc` | 交付前硬流程 |
| `agent-pipeline-router.mdc` | 多角色流水线路由（编写/检查/发布） |
| `pre-ship-checklist.mdc` | 与 `pre-ship-check.py` 绑定 |
| `biaori-japanese-text.mdc` | 标日日文（编辑 data 时） |
| `japanese-tts.mdc` | 语音包（编辑 TTS 相关时） |

**项目 Skills**（`.cursor/skills/`）：

| Skill | 角色 |
|-------|------|
| `hyouga-orchestrator` | PM / 调度 |
| `hyouga-author` | Dev |
| `hyouga-review` | Review |
| `hyouga-qa` | QA |
| `hyouga-fix` | Fix (sub) |
| `hyouga-shipper` | Release |
| `hyouga-auditor` | Review+QA 合体 |

**说明**：官方优先使用 `.cursor/rules/*.mdc`，不是根目录 `.cursorrules`。根目录 `.cursorrules` 仅作迁移提示。

---

## 2. 建议开启的选项（名称因版本略有差异）

在 **Cursor Settings** 中尽量开启：

1. **Project rules / Automatically include project rules** — 对话时带入项目规则  
2. **Codebase indexing** — 便于 Agent 检索 `PROJECT_SPEC.md`、`docs/`  
3. 若有 **Rules precedence**：Team Rules > Project Rules > User Rules（团队版）

**不存在或无需执着寻找的开关**（网传名称，2026 文档未单独列出）：

- “Always prioritize .cursorrules” — 已改用 `.cursor/rules`  
- “Enable context awareness” — 用索引 + `@PROJECT_SPEC.md` 即可  

---

## 3. User Rules（可选 · 全局）

在 **User Rules** 可加一句个人偏好，例如：

```text
本仓库日语学习项目：术语「文递自归」定义以 PROJECT_SPEC.md 与 docs/项目知识库-文递自归.md 为准；改代码前读 iteration-baseline.json。
```

---

## 4. 多 Agent 一键提示词（复制首条消息）

```text
你是「标日课后巩固 H5」多 Agent 系统（仓库 Skill 已配置，禁止另起一套规范）：

- PM：hyouga-orchestrator — 读 PROJECT_SPEC、iteration-baseline、输出 docs/tasks/round-*.json
- Dev：hyouga-author — 只改任务单内文件，ICE≤L2（用户未要求不更高）
- Review：hyouga-review — V1–V2，pre-ship 全 OK 才通过
- QA：hyouga-qa — V3，L14 四关冒烟
- Fix：hyouga-fix — 仅 Review/QA 的 FAIL，L1 修完必须再 Review
- Release：hyouga-shipper — R1 交付块；未说我「push/上传」不得 git push

流程：PM 拆任务 → Dev → Review → QA →（FAIL→Fix→Review）→ Release → 我验收。
禁止跳过 python scripts/pre-ship-check.py。
铁律（每一次改 UI/刷星）：Cursor Simple Browser 固定打开 http://127.0.0.1:8765/cursor-miniapp-phone.html?live=1（保存后自动刷新）；或 Cursor真机持续预览.bat。交付前须在真机框内目视最新态。见 miniapp-real-device-preview-iron-law.mdc · docs/双通道验收-浏览器与手机真机框.md。

现在请 PM Agent 处理我的需求：[在这里写需求]
```

**常用简令**

| 你说 | 等价 |
|------|------|
| 全流程发布 MVP | PM O3 → … → Shipper R1 |
| 用 QA 全局检查 | `hyouga-qa` V3 |
| 审查一下 | `hyouga-review` V1–V2 |

---

## 5. 新会话建议 @ 引用


大改或新 Agent 会话时，首条消息可带：

`@PROJECT_SPEC.md` `@docs/iteration-baseline.json`

---

## 6. 修订记录

| 日期 | 内容 |
|------|------|
| 2026-05-21 | 初版：替代非官方的 .cursorprofile 自动加载预期 |
| 2026-05-21 | 六角色合并 + 多 Agent 一键提示词 |
