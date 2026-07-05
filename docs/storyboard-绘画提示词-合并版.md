# 单元四格 · 绘画提示词合并版（Gurumi + 课文混合）

> **状态**：P1 可整页生成 · P2–P6 见 `js/data/unit-strip-storyboard.js`  
> **版式真源**：[storyboard-画幅与版式-定案.md](./storyboard-画幅与版式-定案.md)  
> **勿用**探索地图封面里的人物/表情画四格。

---

## 0. 每张 unit 条带 · 通用前缀（英文，贴到绘画 AI）

```text
One single image, 16:9 landscape aspect ratio, 1920x1080.
2x2 equal comic panel grid (yonkoma), thin white gutters between panels.
Reading order: top-left, top-right, bottom-left, bottom-right.
Gurumi style: cute round soft creature from picture book reference (NOT generic white bear),
watercolor / crayon storybook texture, warm pastel, soft shadow, white highlights.
Japanese manga speech bubbles with rounded tails, legible Japanese text inside bubbles.
No chat UI, no separate cards, no photorealistic map — one unified illustration page.
```

---

## 1. 画风与角色（合并自你的 Gurumi 提示词 + 项目 brief）

| 项 | 内容 |
|----|------|
| 主角 | **ぐるみ ＝ 李さん**（同一角色；造型以绘本 `D:\【私人】\【小王】\绘本` 为准） |
| 性格 | 好奇、略冒失、努力 |
| 配角 | **风影/叶影**陪跑（背影、侧影、门框/手机光剪影）；锚图 P1 格4 门边、P2 格4 门口。**禁止**他人正面脸/正面半身、扁平灰块、写实第二主角；**仅グルミ**可画正面五官 |
| 台词规则 | **泡内 = 下列日文课文句**；情绪句（わあ日本だ等）只画 **表情**，不写进泡 |

---

## P1 · はじめまして、東京！（第1–4課 · 赤系 pastel）

**Panel 1 · top-left · Lesson 1 · 成田空港**

- Scene: Arrival hall, small suitcase, abstract welcome panel (no readable text); optional back/silhouette of greeter, **no frontal human face**.
- Bubbles:  
  - 田中：はじめまして。わたしは田中です。  
  - 李/ぐるみ：はじめまして。わたしは李です。中国人です。  
  - (optional) 田中：李さんは学生ですか。 / 李：いいえ、学生じゃありません。会社員です。

**Panel 2 · top-right · Lesson 2 · 空港外**

- Scene: Outdoor signs 東京駅・浅草; station staff; Gurumi points at map book (これ) and notebook (それ).
- Bubbles:  
  - 站員：これは何ですか。 / 李：これは本です。  
  - 站員：それは何ですか。 / 李：それはノートです。

**Panel 3 · bottom-left · Lesson 3 · 浅草**

- Scene: Kaminarimon = ここ; distant department store silhouette = あそこ; victory pose.
- Small caption (not bubble): ここはデパートです。
- Bubbles:  
  - 同行：すみません、図書館はどこですか。 / 李：図書館はあそこです。  
  - 同行：食堂はどこですか。 / 李：食堂はここです。

**Panel 4 · bottom-right · Lesson 4 · ホテル**

- Scene: Night hotel room, desk, chair, TV, maps and textbook on bed.
- Expression only: 明日も頑張ろう (no bubble).
- Bubbles:  
  - 朋友：部屋に何がありますか。 / 李：机と椅子があります。  
  - 朋友：テレビはありますか。 / 李：はい、あります。パソコンもあります。

**Color accent:** soft red / cherry pastel `#e57373` mood.

---

## P2–P6

**出图前必读**：[story-strip-soul-lock.md](./story-strip-soul-lock.md)（单元一句 + headline 画面 + 风影配角 + 单グルミ）。

逐格以 **`js/data/unit-strip-storyboard.js`** 的 `unitArcZh` / `visualBeat` / `headline` 为准；禁止仅用 MVP `lesson-dialogues` 场景出图。

| 单元 | 单元一句（备案） | headline 画面关键词 |
|------|------------------|---------------------|
| P2 | 按日本时钟生活 | 通勤/约会/购物/在家学习 |
| P3 | 第一次去箱根放松 | 辣便当/京都红叶/巴士唱歌/温泉明信片 |
| P4 | 几件事连起来做 | 见备案 P4 表 |
| P5–P6 | 见备案 | 见备案 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-22 | 初版：通用 16:9 2×2 + P1 四格合并（GPT 旅行弧 + 课文泡） |
