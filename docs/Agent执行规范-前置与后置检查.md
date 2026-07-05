# Agent 执行规范 · 前置条件与后置检查

## 一、全会决策（启动前必须读取）

### 1. 真源对齐原则
- **权威内容**：以《中日交流标准日本语·初级》为唯一对齐基准。
- **可执行真源**：【产品PRD】/新增补课文内容/ 中的 txt 文件为已对齐后的标日版真源，小程序内容差异以此为准补齐。

### 2. 课程结构标准（24课全量同构）
- 每课字段必须齐全：lessonId、lessonTitle、theme/themeZh、vocab、grammarNodes、dialogues、quizQuestions、basicText、homeworkSections、summaryBlocks、dialogueKeyPoints、rolePlayTasks、reviewExtension
- 五栏学习流程：単語 → 会話 → 文法 → 作業 → まとめ

### 3. 中文弱化规范
- 中文仅辅助理解：字号小2号，颜色 `rgba(62,39,35,0.45)`
- 朗读音频仅对日语发音，不读中文

### 4. 内容归属规则
- 单词类 → 単語板块
- 语法类 → 文法板块
- 会话类 → 会話板块
- 课后作业 → 作業板块
- 总结与扩展（发音/语源/敬語/复习延伸） → まとめ板块

### 5. 会话拆分规则
- 以标日课文"对话正文"为准逐句拆分
- 课文外（会話キーポイント/ロールプレイ）归入まとめ板块
- 自动检测：单回复 → 显示"逐句聽讀"；多回复 → 显示"三种说法"

### 6. 测试题规则
- 以标日为准的习题归入 quizQuestions（用于小测试）
- 其他作业归入 homeworkSections（显示在作業栏）

---

## 二、前置检查（启动执行前必做）

1. **读取 PRD**：确认当前对齐目标（试点课次 / 全量范围）
2. **读取真源 txt**：确认要修改的课文内容来自正确的 txt 文件
3. **检查脚本加载顺序**：`index.html` 中 `lessons-supplement-mvp.js` 必须在 `lessons-mvp.js` 之前加载
4. **检查数据文件是否存在**：`js/data/lessons-supplement-mvp.js` 是否已生成
5. **确认生成器可运行**：`scripts/generate-lessons-from-supplement.py` 无语法错误

---

## 三、后置检查（执行完毕后必做）

1. **重新运行生成器**：
   ```
   python scripts/generate-lessons-from-supplement.py
   ```
   确认输出 "Wrote: ... lessons-supplement-mvp.js"

2. **Node.js 语法验证**：
   ```
   node -e "require('./js/data/lessons-supplement-mvp.js'); console.log('OK')"
   ```

3. **预览无报错**：打开 `http://localhost:8000/index.html`，确认浏览器 Console 无 JS 错误

4. **逐栏验收**：
   - 単語栏：单词列表完整显示（中文仅辅助，朗读只读日语）
   - 会話栏：对话逐句可播放
   - 文法栏：语法卡片可展开
   - 作業栏：作业分栏完整，基本课文可见
   - まとめ栏：发音/语源/敬語/会話要点/角色扮演/复习扩展 全部可见

5. **数据完整性统计**：每课的 vocab/grammarNodes/dialogues/quizQuestions/homeworkSections/summaryBlocks/reviewExtension 数量非零
