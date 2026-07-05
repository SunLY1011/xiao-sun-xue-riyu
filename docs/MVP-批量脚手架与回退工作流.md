# MVP 批量脚手架 · 带比对回退工作流（Cursor 主提示词）

> **地位**：每次启动本项目、批量改仓、交付审核前的**前置条件**。  
> Agent 须先读本文件 + [workflow_definition.json](./workflow_definition.json)，再执行用户任务。  
> **与本仓已有流程对齐**：[Agent交付前工作流.md](./Agent交付前工作流.md) · [Agent文递自归.md](./Agent文递自归.md) · `docs/iteration-baseline.json`

---

## 一、给 Cursor 的主提示词（可直接复制到对话框）

```markdown
# 角色定义
你是一个严格遵循工作流、支持错误回退的 AI Agent，同时也是一名能够批量生成产品脚手架的 Editor。

## 本仓库上下文（必读本节）
- 标准 MVP 路径：环境变量 `MVP_PATH`，未设置则默认为仓库根目录 `.`
- 本仓标准 MVP = 标日 H5 MVP（含「笔记板块V1」定稿锁，见 docs/locks/NOTES-PANEL-V1-LOCK-20260525.md）
- 讨论优先：未确认前不改代码（.cursor/rules/discuss-before-act.mdc）
- 阶段 3「初始化检查」= `发布前自检.bat` 或 `python scripts/pre-ship-check.py`（Windows 用 scripts/init-check.ps1）
- 禁止擅自 push；交付前必须输出双链接 + cache v

## 核心任务 1：批量复制标准 MVP 格式并生成后续产品白板

### 标准 MVP 位置
- 递归扫描 `MVP_PATH`（默认 `.`）的目录树、命名模式、占位符 `{{PRODUCT_NAME}}` 等
- 映射规则：`docs/mvp_mapping_rules.json`（无则从 `docs/mvp_mapping_rules.example.json` 复制）

### 批量生成指令
用户给出产品列表或数量 N 时：
1. 在 `./generated_products/` 下为每个产品建独立目录
2. 复制标准 MVP 结构（排除 tts-cache、.git、generated_products 等，见 workflow_definition.json）
3. 按映射规则替换内容
4. 输出 `generated_products/products_manifest.json`
5. 支持增量：diff 标准 MVP 变更，只更新受影响文件

实现脚本：`python scripts/mvp_batch_generator.py --products product_a,product_b`

## 核心任务 2：带错误回退的硬性工作流

按下述有向图执行；每阶段完成后做 **Stage Check**，失败则回退 `rollback_target`，最多重试 3 次。

1. **明确目标** → `goal.txt`（做什么、为谁、验收标准）
2. **AGENTS.md** → 校验协作规范完整
3. **初始化检查** → init-check / pre-ship 全 OK
4. **运行任务** → 读 baseline；scope 仅用户原话
5. **代码完成** → `completion_snapshot.txt`
6. **验证与评审** → pre-ship + 日文 audit（若改数据）
7. **遇到障碍自动修复** → 修后重跑失败阶段
8. **Test&QA** → 四关/笔记冒烟
9. **运行反馈** → `feedback.md`
10. **清理与交接** → `claude-progress.md` + `workflow_status.json`

回退：维护状态栈；失败时 `python scripts/workflow_with_rollback.py --rollback-to N` 或 git 恢复。

## 执行约束
- 不确定必须问用户
- 批量生成失败只回退当前产品，不影响已成功目录
- 任何声称「可发布」前必须阶段 6 全 OK
```

---

## 二、工作流 JSON

机器可读定义：[workflow_definition.json](./workflow_definition.json)

---

## 三、脚本与命令（本仓库已提供）

| 脚本 | 用途 |
|------|------|
| `scripts/mvp_batch_generator.py` | 任务 1：批量复制 MVP + 映射 |
| `scripts/workflow_with_rollback.py` | 任务 2：阶段状态机 / 回退 / 写 workflow_status.json |
| `scripts/init-check.ps1` | 阶段 3：环境 + pre-ship 门禁 |

### 批量生成示例

```powershell
# 1. 准备映射（首次）
Copy-Item docs/mvp_mapping_rules.example.json docs/mvp_mapping_rules.json

# 2. 指定标准 MVP（可选，默认同仓根目录）
$env:MVP_PATH = "D:\【私人】\【小王】\日语学习"

# 3. 生成
python scripts/mvp_batch_generator.py --products product_alpha,product_beta
```

### 工作流示例

```powershell
python scripts/workflow_with_rollback.py --init
python scripts/workflow_with_rollback.py --stage 3 --run-check
python scripts/workflow_with_rollback.py --status
```

---

## 四、能否执行？（实话）

| 能力 | 结论 |
|------|------|
| **存 MD + JSON 作前置** | ✅ 已入库；Agent 每轮应先读本文 + `iteration-baseline.json` |
| **批量复制 MVP 格式** | ✅ 可跑 `mvp_batch_generator.py`；大仓需排除 `tts-cache` 等（已配置） |
| **内容映射到规则文件** | ✅ 需维护 `docs/mvp_mapping_rules.json` |
| **十阶段全自动回退** | ⚠️ **Cursor 对话不会自动跑状态机**；须你或 Agent **显式**执行脚本/按阶段自检，或用规则约束 |
| **防批量命令跑偏** | ✅ 靠阶段 4「只读 baseline + 仅用户 scope」+ 阶段 6 pre-ship；与「讨论优先」并列 |
| **与现有交付闸门** | ✅ 阶段 3/6/8 已映射到 `发布前自检.bat`、四关冒烟文档 |

**推荐用法**：新会话第一句发「按 `docs/MVP-批量脚手架与回退工作流.md` 从阶段 1 执行到当前任务」；批量新产品时再加「运行 mvp_batch_generator」。

---

## 五、产物文件约定

| 文件 | 阶段 |
|------|------|
| `goal.txt` | 1 |
| `AGENTS.md` | 2 |
| `completion_snapshot.txt` | 5 |
| `feedback.md` | 9 |
| `claude-progress.md` | 10 |
| `workflow_status.json` | 全程 |
| `generated_products/products_manifest.json` | 批量任务 |

以上文件可放在仓库根或 `docs/workflow-runs/YYYY-MM-DD/`（由 Agent 创建，勿提交敏感信息）。

---

## 六、修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-25 | 初版：合并用户提供的 Cursor 提示词 + 本仓 pre-ship / 笔记定稿锁映射 |
