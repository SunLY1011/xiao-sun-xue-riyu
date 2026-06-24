# 项目工作流 · Strict MVP Rollback Pipeline

> 适用：本项目的所有批量生成、内容映射、代码修改任务  
> 原则：阶段比对 → 失败回退 → 重试 → 不跳阶段  
> 更新：2026-05-25

---

## 一、核心规则

1. **任何修改前，先跑本工作流**
2. **每阶段完成必须比对期望结果，失败自动回退**
3. **一个阶段通过才进入下一阶段**
4. **批量操作逐产品执行，一个失败不影响已成功的**

---

## 二、工作流阶段

| 阶段 | 名称 | 检查项 | 失败回退到 |
|------|------|--------|-----------|
| 1 | 明确目标 | `goal.txt` 含三要素（做什么/为谁做/验收标准） | — |
| 2 | 初始化检查 | 环境、依赖、目录结构就绪 | 1 |
| 3 | 运行任务 | 代码/数据生成完成 | 2 |
| 4 | 静态检查 | `node --check` 全部通过 | 3 |
| 5 | 对齐验证 | 输出 vs 标准模板逐字段比对 | 4 |
| 6 | 浏览器验收 | 用户确认页面渲染正确 | 5 |
| 7 | 文档更新 | 完成报告/会议纪要写入 | 6 |

---

## 三、本项目具体配置

### 标准 MVP 位置
```
标准模板：docs/MVP/标准课文模块.md
数据源：  【产品PRD】/新增补课文内容/第N单元/
映射规则：docs/MVP/mvp_mapping_rules.json
```

### 回退机制
```
git checkout 179266e -- js/app.js    # 恢复 L1 MVP 冻结版
git checkout 179266e -- index.html   # 恢复入口页面
node --check js/app.js               # 验证回退成功
```

### 检查命令
```bash
# 数据完整性
python scripts/_mvp-check.py

# 语法验证
node --check js/app.js
node --check js/data/lessons-data.js
node --check js/data/curriculum-catalog.js

# 渲染验证 (浏览器手动)
http://localhost:8765/index.html?v=最新版本
```

---

## 四、批量生成流程（应用于本项目）

```
标准MVP (L1)
    │
    ├── 1. 确认 L1 模板完整（所有5关正常）
    ├── 2. 提取映射规则（从 标准课文模块.md）
    ├── 3. 生成目标课数据（generate-all-lessons.py）
    ├── 4. 添加渲染路径（app.js isUnit1Lesson）
    ├── 5. 静态检查（node --check ×3）
    ├── 6. 浏览器逐课验收
    └── 7. 写入完成报告
```

---

## 五、引用脚本

完整 Python 工作流控制器见 `scripts/workflow_with_rollback.py`（参考实现）。

当前项目使用 git 快照方式回退：
- 快照点：`179266e`（MVP L1 冻结版）
- 恢复命令：`git checkout 179266e -- <file>`
