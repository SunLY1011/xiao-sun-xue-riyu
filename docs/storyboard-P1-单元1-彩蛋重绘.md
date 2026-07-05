# 第 1 单元 · 彩蛋场景重绘（树精グルミ · 条带零字）

> **真源**：`彩蛋/单元1/彩蛋-单元1（1-4）md.txt`  
> **角色**：`assets/story/gurumi-turnaround-v1.png` · `assets/story/companion-style-reference.png`（配角剪影定案）· `docs/story-gurumi-character-lock.md`  
> **输出**：`assets/story/unit-1-panel-{1..4}-draft.png` → harmonize → `finish-unit-strip.py --unit 1`

## 通用后缀（每格正向末尾）

```text
watercolor picture book illustration, soft pencil lines, 16:9 landscape,
Gurumi tree-spirit mascot: brown bark trunk, round green leaf crown with pink cherry blossoms,
white shimenawa rope belt, red yellow blue paper streamers shide,
orange four-wheel suitcase with black handle, NOT white fluffy ball NOT bear NOT human child,
exactly one Gurumi with visible face, all other humans as warm golden translucent silhouette behind counter or in doorway,
rim light glow no facial features no eyes, back view only,
NO detailed watercolor flight attendant portrait NO leaning staff facing camera,
NO readable text NO letters NO Japanese signs NO logos on signs use abstract color blocks only,
full-bleed composition no empty corners reserved for speech bubbles, complete scenic illustration
```

## 通用负面

```text
photorealistic, 3d, anime sharp lineart, white mascot, missing shimenawa, missing leaf crown,
readable text, watermark, logo, classroom, multiple Gurumi characters,
human face front view, detailed human face, facing camera, portrait, eye contact from human
```

---

## 格 1 · 李さんは中国人です

```text
Narita airport arrival lobby, bright modern interior, center composition,
Gurumi in tiny travel hat and backpack holding red passport with sakura sticker,
mini orange suitcase at feet, sparkling excited eyes mouth slightly open,
abstract large welcome panel with warm colors and plane icon NO readable words,
through tall glass window faint Tokyo Tower and blue sky, cherry petals in sunbeam,
soft golden side light from right, gentle lens flare,
watercolor picture book ...
```

## 格 2 · これは本です

```text
Diagonal composition, small gift shop inside Narita airport,
Gurumi on tiptoes reaching toward glass wind chime on shelf, curious upward gaze,
station attendant as back view or side silhouette bending toward shelf, face not visible,
shelves with folding fans maneki-neko souvenirs, warm shop ceiling light window backlight,
through shop window ANA airplane blue tail on tarmac, focus on tiny hand and wind chime,
watercolor picture book ...
```

## 格 3 · ここはデパートです

```text
Rule of thirds, Asakusa station plaza sunny morning,
Gurumi with small scarf tilted head pointing at large tourist map board, folded map in other hand,
attendant as side/back silhouette arm pointing right, face turned away, soft bokeh giant red Kaminarimon lantern NO characters on lantern,
direction signs and small police box, crisp warm daylight,
watercolor picture book ...
```

## 格 4 · 部屋に机といすがあります

```text
Frame composition Japanese business hotel room at night,
Gurumi in casual indoor clothes sitting on bed looking around room satisfied smile,
bed desk chair TV closet clearly visible, hotel key card nearby,
desk lamp warm orange inside, cool blue city lights outside window,
Tokyo Skytree illuminated over Sumida River reflection, no second character face,
watercolor picture book ...
```

---

## 工程命令

```bash
python scripts/fix-unit1-panel-bugs.py   # 格2 去块 · 格3/4 源图修正（可选）
python scripts/harmonize-gurumi-panels.py --unit 1
python scripts/finish-unit-strip.py --unit 1
python scripts/sync-story-to-eggs.py --unit 1
```

预览：`storyboard-preview.html` · App：`StoryRewardDev.preview(1)`
