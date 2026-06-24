# 第 4 单元 · 彩蛋场景重绘（树精グルミ · 条带零字）

> **真源**：`彩蛋/单元4/4单元（13、14、15、16）md.txt`  
> **弧**：名古屋书店 → デパート购物 → 休息室读报 → 酒店宽敞  
> **后缀**：同 [storyboard-P1-单元1-彩蛋重绘.md](./storyboard-P1-单元1-彩蛋重绘.md)

## 格 1 · 机の上に本が三冊あります

```text
Low-angle Nagoya bookstore afternoon sunbeams, Gurumi tree-spirit business scarf on tiptoes reaching high shelf book,
trembling leg sweat bead holds two books basket floor three books, Nagoya Castle golden shachihoko upper left window,
dust motes in light NO readable shelf labels, watercolor picture book full-bleed ...
```

## 格 2 · 昨日デパートへ行って、買い物をしました

```text
Eye-level Nagoya department store, Gurumi tree-spirit hat scarf holding shopping bags reading receipt delighted crescent eyes,
new shoes bag nearby, abstract floor guide blocks NO Japanese, glass wall Nagoya TV Tower Oasis 21 blue dusk lights,
warm interior cool outside, watercolor picture book ...
```

## 格 3 · 小野さんは今新聞を読んでいます

```text
Straight-on company break room dusk, Gurumi tree-spirit business scarf on sofa hidden behind oversized newspaper tiny hands,
only two round eyes and leaf crown visible above paper scanning, steaming coffee side table,
JR Central Towers purple-orange sky through window, NO readable headlines, watercolor picture book ...
```

## 格 4 · ホテルの部屋は広くて明るいです

```text
High-angle wide 20mm Nagoya hotel room, Gurumi tree-spirit casual indoor clothes center arms spread wide marveling spacious bright room,
large bed desk floor lamp wardrobe vase lilies open suitcase folded clothes,
window Nagoya Port Ferris wheel colorful lights water reflection aquarium silhouette,
warm lamps cool blue night outside, watercolor picture book full-bleed ...
```

## 工程

```bash
python scripts/harmonize-gurumi-panels.py --unit 4
python scripts/finish-unit-strip.py --unit 4
python scripts/sync-story-to-eggs.py --unit 4
```
