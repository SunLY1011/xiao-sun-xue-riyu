# グルミ（李さん）· 四格人物一致性锁定

> **三视图真源**：`assets/story/gurumi-turnaround-v1.png`（用户定稿）  
> **备用**：`gurumi-turnaround-v2.png`  
> **工程锚点**：`gurumi-reference.png`（同 v1，供 img2img / 生成参考）

---

## 1. 必须一致的要素

| 部位 | 定案 |
|------|------|
| 躯干 | 棕色树皮纹理、矮胖、短腿 |
| 头冠 | 圆冠绿叶 + **粉色五瓣樱花** 多点分布 |
| 脸 | 圆眼（格1：棕色大眼+高光）；**禁止**格间一会点眼一会闭眼除非分镜要求 |
| 腰 | **白色粗编绳**（shimenawa）+ 正面结 |
| 纸垂 | 红 / 黄 / 蓝 三折 zigzag **shide** 各 1–2 条 |
| 行李 | **橙色四轮硬箱** + 黑拉杆（每格在场景则出现） |
| 线条 | 软铅笔水彩描边，无锐角动漫线 |

---

## 2. 分格姿势（可变）

| 格 | 姿势 | 表情 |
|----|------|------|
| 1 | 步行拉箱 | 兴奋睁眼 |
| 2 | 站定指向 | 微笑睁眼 |
| 3 | 双手 V | 笑眼可弯月 |
| 4 | 坐床 | 放松弯月眼 |

姿势可换，**叶冠+绳+纸垂+箱色号** 不能换。

---

## 2b. 每格人数（全单元）

> **用户配角参考板（定案）**：`assets/story/companion-style-reference.png`  
> 主图左 = **默认**；右栏蓝圈写实站员 = **禁止**；右栏红圈精灵 = **可选**。

| 角色 | 规则 |
|------|------|
| **グルミ（李さん）** | 每格 **只画 1 个**；禁止同格 2+ 树精、背景再出现一个グルミ |
| **人类配角（默认·方法 A）** | **暖色透光剪影 / 风影**：柜台后、门边、远景；半透明、金橙轮廓光、**无五官**、可伸手势。同参考板**主图左侧**站员。锚图：`unit-1-panel-4-final.png`、`unit-2-panel-4-draft.png` |
| **人类配角（禁止·勿学蓝圈）** | 彩蛋 txt / AI 常出的「弯腰站员正脸、水彩写实乘务员」——**不要**。无脸、无眼、无鼻唇 |
| **配角正面** | **默认禁止**他人正面脸/正面半身。全格**仅グルミ**可正面 |
| **可选·方法 B** | 非人类**精灵陪体**（淡蓝雾状、耳机围巾等），仅分镜明确需要「同行灵」时用；**不能**代替课文里的日本人站员 |
| **地标** | 若分镜要求富士山 → 须 **明确可认** 的富士轮廓+雪顶，勿用含糊远山代替 |

### 方法 A · 英文 prompt 片段（人类配角）

```text
human staff behind counter as warm golden translucent silhouette, rim light glow,
no facial features no eyes no nose, soft watercolor haze, gesture only,
NOT detailed portrait NOT leaning toward camera
```

---

## 3. AI 重绘时（Mini SD / SD 之梦）

1. **上传参考**：`gurumi-reference.png` + `unit-1-panel-1-draft.png`
2. **img2img 强度**：0.45–0.55（保留场景，锁人物）
3. **正向追加**（英文）：

```text
exact same Gurumi tree mascot as reference image, identical leaf crown cherry blossoms,
white shimenawa belt red yellow blue paper streamers, orange suitcase,
watercolor picture book style, soft brown trunk, do not change character design
```

4. **负面**（务必含「他人正面」）：

```text
different character, human child, bear, white mascot, missing shimenawa, no flowers,
anime sharp eyes, 3d render, photorealistic human,
human face front view, detailed human face, station attendant facing camera, bowing businessman portrait,
second character looking at viewer, realistic eyes on human
```

5. **配角构图偏好**（彩蛋 txt 写「站员弯腰」时改写成）：

- 站员：侧后方弯腰、或逆光剪影伸手，**不露正脸**
- 接机人：门外背影 / 风影鞠躬轮廓，**不画西装正面**
- カラオケ 客人：拍手的手与肩膀虚化，**无观众正脸**

---

## 4. 程序化后处理（已提供脚本）

```bash
python scripts/harmonize-gurumi-panels.py
python scripts/finish-unit1-strip.py
```

对格 2–4 **角色区**做格1色彩统计对齐 + 全图轻量色调统一。

**第一阶段**：只交付 `*-clean.png` + `unit-N-strip.webp`；不生成贴泡图、画面不预留泡区。见 `story-strip-soul-lock.md` §1a。
