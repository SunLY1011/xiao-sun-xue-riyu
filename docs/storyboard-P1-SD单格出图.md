# P1 第1单元 · SD / Mini SD 单格出图手册

> **已定**：先单格 16:9 风景 → 满意后 2×2 拼 `assets/story/unit-1-strip.webp`  
> **格2**：暂不画第三组「あれ」广告牌  
> **泡**：单格阶段留白，后期 PS 贴日文（见 `storyboard-P1-第1单元-定稿.md`）

---

## 通用（每格都加）

**画幅**：16:9（建议 960×540 或 1280×720 试稿，定稿 1920×1080）

**正面提示词后缀（英文）**

```text
watercolor children's storybook illustration, hand-drawn rounded lines, soft pastel,
Gurumi tree-spirit mascot with leaf crown and small flower on head, NOT white bear NOT photorealistic,
simple cartoon background no complex texture, cherry red pastel accent #e57373 mood,
high quality, clean composition, leave empty space for manga speech bubbles
```

**负面提示词（Negative）**

```text
photorealistic, 3d render, anime screenshot, sharp perspective, realistic photo,
classroom, school desk, blackboard, generic bear mascot, kawaii blob without leaves,
detailed human face, crowded scene, blurry text, watermark, logo, english clutter,
low quality, bad anatomy, extra limbs, deformed hands
```

**Mini SD / SD 之梦 参考参数**

| 参数 | 建议 |
|------|------|
| 步数 Steps | 28–35 |
| CFG / 提示词相关性 | 7–8 |
| 采样器 | DPM++ 2M Karras 或 Euler a |
| 种子 | 固定一个 seed 试 3 张，满意后锁定 |

**参考图**：上传绘本 `D:\【私人】\【小王】\绘本` 中グルミ形象（img2img 权重 0.35–0.5 可选）

---

## 格 1 · 成田空港（先出这一张）

**画面要点**：到达大厅 · 欢迎牌「東京へようこそ」· グルミ+小行李箱 · 田中鞠躬 · 兴奋举手两眼放光

**主提示词（复制到正向 Prompt）**

```text
16:9 landscape, Narita airport arrival hall interior, simplified cartoon architecture,
warm morning indoor light, soft spring green floor and cream walls,
large welcome sign Tokyo e Yokoso with small plane or sakura icon,
cute Gurumi tree-spirit with leaf crown pulling tiny rolling suitcase,
sparkling excited eyes both hands raised happily,
simplified Japanese businessman in dark suit bowing politely mid-ground left,
wide medium shot eye level, depth with pillars and light boxes in background,
watercolor storybook, hand-drawn rounded lines, pastel with cherry red accent,
empty space top-left and bottom-right for speech bubbles later, no photorealistic
```

**格1 专用负面（可追加到通用负面后）**

```text
outdoor sky, street, hotel room, night scene, sitting on bed, angry expression
```

**贴泡预留（后期 PS，本格不出字）**

| 位置建议 | 角色 | 日文 |
|----------|------|------|
| 左上 | 田中 | はじめまして。わたしは田中です。 |
| 右下 | 李/グルミ | はじめまして。わたしは李です。中国人です。 |
| 左上二 | 田中 | 李さんは学生ですか。 |
| 右下二 | 李/グルミ | いいえ、学生じゃありません。会社員です。 |

---

## 格 2 · 空港外（格1 OK 后）

```text
16:9 landscape, outdoor plaza near airport or station exit, bright afternoon blue sky slice,
cartoon white directional signs with arrows Tokyo Station and Asakusa,
Gurumi pointing at thick map book in one hand and travel notebook under other arm,
blurred distant signboard far right background, simplified station staff with cap,
soft ground shadow, watercolor storybook pastel cherry red accent, speech bubble space
```

---

## 格 3 · 浅草雷門（格2 OK 后）

```text
16:9 landscape, Asakusa Kaminarimon red lantern gate simplified cartoon, large red chochin,
Gurumi foreground victory V pose smiling, warm afternoon light,
distant simplified department store block silhouette right background muted purple-gray,
tiny faceless tourist dots, watercolor storybook hand-drawn, not photorealistic street photo
```

小字（PS）：`ここはデパートです。` 指远景楼，非圆泡。

---

## 格 4 · 酒店夜（格3 OK 后）

```text
16:9 landscape, cozy Japanese business hotel room at night, warm orange desk lamp main light,
dark blue window night, Gurumi resting on bed edge, scattered fold map and textbook covers,
wooden desk chair television and glowing laptop on desk clearly visible,
friend as smartphone video call light or door crack silhouette only no second face,
watercolor storybook soft pastel, mood text area near face for ganbaru tomorrow not bubble
```

---

## 格 4 · 验收（2026-05-22）

**文件**：`assets/story/unit-1-panel-4-draft.png`  
**结论**：✅ **可定稿**（门边团影+手机 = 视频朋友）

| 项 | 状态 |
|----|------|
| 夜酒店 · 台灯 · 窗外夜景 | ✅ |
| 床 + 地图 + 中日辞典 | ✅ |
| 机・椅子・テレビ・パソコン | ✅ |
| 门边剪影持机（非第二主角脸） | ✅ |
| `ganbaru tomorrow` | ⚠️ PS 改 **明日も頑張ろう**（小字，非圆泡） |

---

## 拼版

**草稿预览**（未修水印/泡）：

```bash
python scripts/compose-unit-strip.py --unit 1 -o assets/story/unit-1-strip-draft.webp
```

**正式版前 PS 清单**

| 格 | 处理 |
|----|------|
| 1 | 欢迎牌可改 `東京へようこそ`；贴 l1-d1 泡 |
| 2 | `Asakua`→Asakusa；腋下加小笔记本；贴 l2-d1 泡 |
| 3 | **去豆包水印**；`ここはデパート` 箭头指百货；贴 l3-d1 泡 |
| 4 | `明日も頑張ろう`；贴 l4-d1 泡 |

1. 四格修好后导出 PNG（同比例 16:9）  
2. 再跑上面脚本，输出 `assets/story/unit-1-strip.webp`  
3. 验收：`StoryRewardDev.preview(1)` 或完成第1单元四课后点 🎁

---

## 格 1 · 验收（2026-05-22）

**文件**：`assets/story/unit-1-panel-1-draft.png`  
**结论**：✅ **可定稿**，作为格 2–4 画风锚点。

| 项 | 状态 |
|----|------|
| 成田到达大厅 + 暖光 | ✅ |
| 欢迎牌 Tokyo e Yokoso + 樱花飞机 | ✅（后期可 PS 改「東京へようこそ」） |
| グルミ 叶冠樱花 + 小橙行李箱 | ✅ |
| 田中西装鞠躬 | ✅ |
| 绘本水彩 + 赤橙点缀 | ✅ |
| 兴奋表情（キラキラ） | ✅ |
| 泡区留白 | ⚠️ 右上/左下可再留一点空（贴泡时裁切 16:9 时注意） |

## 格 2 · 验收（2026-05-22）

**文件**：`assets/story/unit-1-panel-2-draft.png`  
**结论**：✅ **可定稿**（与格1画风连续）

| 项 | 状态 |
|----|------|
| 户外午后 + 水彩绘本 | ✅ |
| グルミ 造型/橙箱/注连绳 与格1一致 | ✅ |
| 站員蓝制服 | ✅ |
| 指示牌 東京駅 + Asakusa | ✅（牌面 `Asakua` 拼版前 PS 改 **Asakusa**） |
| 地图册（これ） | ✅ |
| 行程笔记本（それ） | ⚠️ 未单独出现 → 贴泡前 PS 在腋下加小笔记本即可，不必重跑 |
| 远景「あれ」牌 | — 按约定不做 |

**场景说明**：成田「站外」画成了站台广场，课文泡仍成立，保留。

---

## 格 3 · 验收（2026-05-22）

**文件**：`assets/story/unit-1-panel-3-draft.png`  
**结论**：✅ **可定稿**

| 项 | 状态 |
|----|------|
| 浅草雷門（ここ）+ 远景百货（あそこ） | ✅ |
| グルミ V 手势 + 橙行李箱 | ✅ |
| 小字 `ここはデパートです。` | ✅ 指远景楼方向；拼版前可加小箭头指向右侧楼 |
| 画风与格1–2连续 | ✅ |
| 水印「豆包AI生成」 | ❌ **拼版前必裁/修掉** |

**贴泡**（PS）：同行左上 · グルミ 右下 · l3-d1 四句问路句。

---

**格 2–4 追加锁定词（与格1一致）**

```text
same Gurumi tree-spirit design as panel 1: green leaf crown pink cherry blossoms,
brown trunk body white shimenawa belt with red yellow blue paper streamers,
orange rolling suitcase, watercolor picture book style warm yellow green pastel,
soft pencil outlines, NOT photorealistic
```

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-05-22 | 用户确认分镜；格2 不加あれ；格1 Mini SD 参数定稿 |
| 2026-05-22 | 格1 成稿验收通过 · `unit-1-panel-1-draft.png` |
