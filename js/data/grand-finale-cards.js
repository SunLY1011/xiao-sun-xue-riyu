/**
 * 通关全家福 · 4×6 手机一屏（北↑南↓ · 列=春夏秋冬）
 * 格位与 scripts/grand_finale_slate.py 一致
 */
const GRAND_FINALE_LAYOUT = { cols: 4, rows: 6, total: 24, aspect: "2/3" };

const GRAND_SEASON_COLS = ["春", "夏", "秋", "冬"];

/** 行 0=北 … 行 5=南；值为 cardId（与确认版 N.png 一致） */
const GRAND_SLATE = [
  [24, 3, 5, 1],
  [8, 6, 9, 2],
  [13, 10, 14, 4],
  [17, 15, 16, 7],
  [19, 18, 20, 21],
  [12, 11, 22, 23],
];

const GRAND_FINALE_CARDS = [];
for (let row = 0; row < GRAND_SLATE.length; row++) {
  for (let col = 0; col < GRAND_SLATE[row].length; col++) {
    const cardId = GRAND_SLATE[row][col];
    GRAND_FINALE_CARDS.push({
      cardId,
      gridCol: col,
      gridRow: row,
      season: GRAND_SEASON_COLS[col],
      latitudeBand: row,
    });
  }
}

const GRAND_FINALE_SUFFIX_ZH =
  "4×6 竖屏一屏；上北下南；列序春夏秋冬；树精グルミ；无字无泡。";

/** L3 角标 · 景点名（短） */
const GRAND_SPOT_NAMES = {
  1: "知床流氷",
  2: "小樽運河",
  3: "青森ねぶた祭",
  4: "白川郷合掌造り",
  5: "日光東照宮",
  6: "松島",
  7: "富士山",
  8: "兼六園",
  9: "清水寺",
  10: "伏見稲荷大社",
  11: "嵐山竹林",
  12: "祇園",
  13: "姫路城",
  14: "奈良東大寺",
  15: "嚴島神社",
  16: "金刀比羅宮",
  17: "道後温泉",
  18: "阿波おどり",
  19: "熊本城",
  20: "別府温泉",
  21: "屋久島縄文杉",
  22: "首里城",
  23: "長崎ランタン",
  24: "高山祭",
};

/**
 * L3 每格双行日文（美工排版真源）
 * activityJp：第1行·粗·何を体験するか（祭り・名勝など）
 * placeJp：第2行·细·どこで
 */
const GRAND_SPOT_CAPTIONS = {
  1: { activityJp: "流氷クルーズ", placeJp: "北海道・知床" },
  2: { activityJp: "運河の夕景", placeJp: "北海道・小樽" },
  3: { activityJp: "ねぶた祭", placeJp: "青森県・青森" },
  4: { activityJp: "合掌造りの雪景色", placeJp: "岐阜県・白川郷" },
  5: { activityJp: "陽明門と紅葉", placeJp: "栃木県・日光" },
  6: { activityJp: "松島湾クルーズ", placeJp: "宮城県・松島" },
  7: { activityJp: "逆さ富士", placeJp: "静岡・河口湖" },
  8: { activityJp: "春の庭園散策", placeJp: "石川県・金沢" },
  9: { activityJp: "紅葉の舞台", placeJp: "京都・清水寺" },
  10: { activityJp: "千本鳥居", placeJp: "京都・伏見稲荷" },
  11: { activityJp: "竹林の小道", placeJp: "京都・嵐山" },
  12: { activityJp: "花街の夕暮れ", placeJp: "京都・祇園" },
  13: { activityJp: "桜と白鷺城", placeJp: "兵庫県・姫路" },
  14: { activityJp: "大仏と鹿", placeJp: "奈良県・奈良" },
  15: { activityJp: "海上の大鳥居", placeJp: "広島県・宮島" },
  16: { activityJp: "こんぴら参り", placeJp: "香川県・琴平" },
  17: { activityJp: "道後温泉入浴", placeJp: "愛媛県・松山" },
  18: { activityJp: "阿波おどり", placeJp: "徳島県・徳島" },
  19: { activityJp: "名城と桜", placeJp: "熊本県・熊本" },
  20: { activityJp: "地獄めぐり", placeJp: "大分県・別府" },
  21: { activityJp: "縄文杉トレイル", placeJp: "鹿児島県・屋久島" },
  22: { activityJp: "琉球の王城", placeJp: "沖縄県・那覇" },
  23: { activityJp: "ランタンフェス", placeJp: "長崎県・長崎" },
  24: { activityJp: "高山祭", placeJp: "岐阜県・高山" },
};

/**
 * L3 叠字锚点（bl/br/tl/tr/bc）· 按画面留白手工分配
 * bl=左下 br=右下 tl=左上 tr=右上 bc=底中
 */
const GRAND_CAPTION_ANCHOR = {
  1: "bl",
  2: "br",
  3: "bl",
  4: "br",
  5: "bl",
  6: "br",
  7: "bc",
  8: "bl",
  9: "br",
  10: "tl",
  11: "bl",
  12: "br",
  13: "bl",
  14: "br",
  15: "bc",
  16: "bl",
  17: "br",
  18: "bl",
  19: "br",
  20: "tl",
  21: "bl",
  22: "br",
  23: "bl",
  24: "br",
};

if (typeof window !== "undefined") {
  window.GRAND_FINALE_LAYOUT = GRAND_FINALE_LAYOUT;
  window.GRAND_SLATE = GRAND_SLATE;
  window.GRAND_FINALE_CARDS = GRAND_FINALE_CARDS;
  window.GRAND_FINALE_SUFFIX_ZH = GRAND_FINALE_SUFFIX_ZH;
  window.GRAND_SPOT_NAMES = GRAND_SPOT_NAMES;
  window.GRAND_SPOT_CAPTIONS = GRAND_SPOT_CAPTIONS;
  window.GRAND_CAPTION_ANCHOR = GRAND_CAPTION_ANCHOR;
}
