# Skill 撰写规范

> 版本：v1.0 | 更新日期：2026-04-01 | 适用：3.0 学员

---

## 核心原则

1. **简洁是美德**：context window 是公共资源，只放模型真的不知道的内容。
2. **自由度要匹配任务复杂度**：简单任务用文字指令，脆弱任务用脚本约束。
3. **先理解，再构建**： concrete examples（真实使用场景）比抽象理论更重要。

---

## 一、目录结构

```
skill-name/
├── SKILL.md          ← 必须，唯一入口
├── scripts/          ← 可选，可执行脚本
├── references/      ← 可选，按需加载的参考文档
└── assets/          ← 可选，模板、图片等资源文件
```

**⚠️ 禁止放 README.md、CHANGELOG.md、INSTALL.md 等辅助文档。**

---

## 二、SKILL.md 格式

### 2.1 YAML 前置区（必须）

```yaml
---
name: skill-name
description: "触发场景描述。说明什么时候用这个 skill、它能做什么。50-150 字。"
---
```

**命名规则：**
- 全小写、字母+数字+横杠
- 不超过 64 字符
- 示例：`video-transcribe` / `yizhou-thinking` / `skill-finder`

**description 是触发器**：OpenClaw 用它判断何时调用这个 skill。写得不清楚，skill 就不会被正确触发。

### 2.2 Body 正文（必须）

用 Markdown 写使用说明，至少包含：

| 章节 | 必须？ | 说明 |
|------|--------|------|
| 核心定位 | ✅ | 这个 skill 是干什么的 |
| 触发场景 | ✅ | 什么情况下用它（对应 description 展开） |
| 工作流 | ✅ | 分步骤的执行流程 |
| 输出格式 | 建议 | 交付物标准格式 |
| Gotchas | ✅ | 已知坑点和禁忌 |
| 参考路由 | 建议 | 何时读哪些 references |

---

## 三、Gotchas 怎么写

这是大多数 skill 最缺的部分。格式：

```markdown
## Gotchas

1. **不要做 X**
   解释：为什么不能这样做，以及正确做法是什么。

2. **不要默认 Y**
   解释：什么情况下例外。
```

**Gotchas 的价值**：提前把"这个 skill 在哪些情况下会出错或判断偏差"写出来，比写"它能做什么"更重要。

---

## 四、references 使用规则

- 按需加载，不要一次性全灌进上下文
- 文件名要有意义，不要叫 `guide.md`
- 最多一层嵌套，不要深层引用

```markdown
## 何时读取 references

- 需要 X 时 → 读 `references/x.md`
- 需要 Y 时 → 读 `references/y.md`
```

---

## 五、字数控制

| 文件 | 控制标准 |
|------|---------|
| SKILL.md 正文 | ≤ 500 行 |
| references 单文件 | 长文件加目录索引 |
| 总体 skill 目录 | 只放必要的文件 |

超过 500 行 → 拆到 references/。
超过 10k 字 → 考虑是否需要分段。

---

## 六、完整示例骨架

```markdown
---
name: example-skill
description: "当用户说 XXX / XXX / XXX 时触发。用于：做什么事。核心输出是 XXX。"
---

# Example Skill

把它当成 XXX 的判断工具，而不是泛用模板。

## 核心定位

默认回答以下问题：
- ...
- ...

## 触发场景

- 场景 A：...
- 场景 B：...

## 工作流

### Step 1: ...
### Step 2: ...
### Step 3: ...

## 输出格式

```text
[标准输出格式]
```

## Gotchas

1. **不要做 X**
   解释：...

2. **不要默认 Y**
   解释：...

## 何时读取 references

- 需要 ... → `references/xxx.md`
- 需要 ... → `references/yyy.md`
```

---

## 七、常见错误

| 错误 | 问题 | 正确做法 |
|------|------|---------|
| description 写得太泛 | 无法触发 | 写清楚具体场景和动作词 |
| 没有 Gotchas | 容易漂移 | 至少写 2-3 条核心坑点 |
| 放 README.md | 增加噪音 | 不要放 |
| references 嵌套太深 | 找不到 | 最多一层 |
| 正文超过 500 行 | token 浪费 | 拆到 references/ |
| 命名用中文或下划线 | OpenClaw 规范不符 | 全小写横杠 |
