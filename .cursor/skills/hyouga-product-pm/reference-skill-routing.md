# Skill 路由表 · hyouga-product-pm 派单用

## 一、按产品域

| 产品域 | 逻辑真源 | 内容/数据 | UI | 视觉 QA |
|--------|----------|-----------|-----|---------|
| 首页·学习の道 | 愿景 §2、纪要 03/07/08 | `curriculum-catalog.js` | `journey-home.js` | **advanced-xhs-visual-design** · design-review |
| P0 开机封面 | `docs/P0-开机页-美工与产品策划提示词提纲.md` | `assets/splash/` | `home-splash.js` | **advanced-xhs-visual-design** · **yizhou-ppt** |
| 00 入門 | 纪要 10–13、INTEPOINT 11 | `intro-content.js` `intro-kana-tips.js` | `intro-guide.js` | 本 PM §4 视觉规约 |
| 课内四关 | 范式、冻结课 | `lessons-*.js` | `dialogue-gate` `quiz-gate`… | design-review |
| 语音 | TTS 规范 | `speech-engine` `tts-cache` | `speak-ui` | review V2 |
| 进度·星 | 纪要 04 | `mvp-storage.js` | 封面海星 | — |
| マイ督导 | 纪要 04 P1b | 待建 | 待建 | plan-design-review |

## 二、按工作类型

| 工作类型 | Skill | 产出 |
|----------|-------|------|
| 需求澄清 | **hyouga-product-pm** | 讨论稿、拍板项 |
| 任务拆分 | hyouga-orchestrator（文档约定） | `docs/tasks/round-*.json` |
| 写码 | hyouga-author / 当前 Agent | PR |
| 日文/TTS | 项目知识库-标日日文书写 | — |
| 发版 | hyouga-shipper + pre-ship-check | 链接 |

## 二b、3.0 学员 Skill 包（项目 + 全局）

> **全局**：`%USERPROFILE%\.cursor\skills\`（55 个全量）  
> **本项目**：`.cursor/skills/`（按文件夹精选 20 个 + hyouga 专属）  
> **重装**：`python scripts/install-yizhou-3-skills.py`  
> **清单**：`.cursor/skills/PROJECT-SKILLS-MANIFEST.md` · `docs/yizhou-3.0-skills-INDEX.md`

| 3.0 文件夹 | Skill | 何时派单 |
|------------|-------|----------|
| 01-AI增强 | **context-engineering-agent** | 复杂任务上下文包、规则沉淀 |
| 01-AI增强 | **agent-eval-loop** | 交付自检表、评测闭环 |
| 01-AI增强 | **multi-agent-orchestrator** | 多角色拆单（配合 hyouga-orchestrator） |
| 01-AI增强 | **active-agent** | 用户说「直接帮我做」自主执行 |
| 01-AI增强 | **skill-finder** | 缺能力时选型安装 |
| 02-内容创作 | **advanced-xhs-visual-design** | 封面/卡片/信息图/生图 prompt |
| 02-内容创作 | **brand-voice-system** | 品牌文案、标日あと 语气 |
| 02-内容创作 | **hook-angle-lab** | 开机页副标、引导语钩子 |
| 02-内容创作 | **course-design-agent** | 入門/单元/课序教学结构 |
| 03-开发工具 | **repo-context-compiler** | 大型仓库模块图、Agent 上下文包 |
| 03-开发工具 | **code-review-ci** | PR/CI 失败审查 |
| 03-开发工具 | **skill-creator** · **skill-vetter** | 新建/审查 Skill |
| 04-浏览器 | **browser-automation** | 双通道预览、冒烟 QA |
| 06-知识学习 | **learning-loop** | 学习材料→练习/复盘（课内延伸） |
| 06-知识学习 | **yizhou-thinking** | 产品取舍、发版节奏 |
| 06-知识学习 | **meeting-notes-actions** | 纪要→行动项（对齐讨论优先） |
| 07-效率工具 | **yizhou-ppt** · **editable-pptx-builder** | 演示稿/PPT 交付美工 |
| 07-效率工具 | **workflow-automation-builder** | bat/脚本流水线设计 |

## 三、入門 Skill 模组映射（产品层）

| SK | 能力域 | 实现文件 | 扩展时改 |
|----|--------|----------|----------|
| SK-01 | 全景表 | intro-guide 全景表 | intro-content GOJUON |
| SK-02 | 读表要点 | details / 先生卡 | intro-kana-tips |
| SK-04 | 易错四音 | 协同 trap 块 | INTRO_SPECIAL + tips |
| SK-05 | 浊半浊 | 协同 dakuon 块 | SYNERGY rules |
| SK-06 | 拗音 | 协同 youon 块 | 同上 |
| SK-07 | 长促拨 | 协同 rhythm 块 | 拍子 UI → author |
| SK-08–10 | 字·寒暄·教室 | 核心层 | intro-content |
| 💡 先生卡 | 点字记忆 | intro-kana-tip.js | intro-kana-tips.js |

## 四、并行子 Agent（Cursor Task）

| 场景 | subagent_type | 说明 |
|------|---------------|------|
| 广搜仓库 | explore | 找文件/惯例 |
| 多模块实现 | generalPurpose | 拍板后批量改 |
| 视觉走查 | design-review 流程 | 截图对比 |

PM **不** 直接跑 implement；先出 §6 模板再派单。
