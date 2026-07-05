/**

 * 00 入門 · 注音能力全景模型 · 内容真源

 * 结构：三层（基础/协同/核心）+ Skill 模组 + 五步行法

 */

const INTRO_STORAGE_KEY = "hyouga_intro_progress_v1";



const INTRO_MODEL = {

  title: "注音能力全景模型",

  subtitle: "発音と文字",

  tagline: "对应教材入门单元 · 先地图、再分块、再开口 · 不锁正课",

};



/** 五步行法（作业法） */

const INTRO_WORKFLOW = [

  { id: 1, short: "①", label: "全景盘点", layer: "foundation" },

  { id: 2, short: "②", label: "分块突破", layer: "synergy" },

  { id: 3, short: "③", label: "规则合成", layer: "synergy" },

  { id: 4, short: "④", label: "开口验证", layer: "core" },

  { id: 5, short: "⑤", label: "回学習の道", layer: "core" },

];



/** 三层 · 与阶段 1–3 一一对应 */

const INTRO_LAYERS = [

  {

    id: "foundation",

    phase: 1,

    label: "基础",

    labelJa: "基礎",

    titleZh: "基础层 · 全景地图",

    daysHint: "建议 2–3 天 · 每天 10 分钟",

    goal: "点格听音",

    anchor: "五十音不是字母，是音表",

    check: "あ行五音能听辨",

  },

  {

    id: "synergy",

    phase: 2,

    label: "协同",

    labelJa: "協調",

    titleZh: "协同层 · 分块联动",

    daysHint: "建议 2–3 天 · 每天 10 分钟",

    goal: "分色块练",

    anchor: "浊音 = 清音 + 两点",

    check: "が/か · きゃ · がっこう 能听辨",

  },

  {

    id: "core",

    phase: 3,

    label: "核心",

    labelJa: "核心",

    titleZh: "核心层 · 开口进站",

    daysHint: "建议 2–4 天 · 每天 10–15 分钟",

    goal: "跟读 · 回首页",

    anchor: "ひらがな/カタカナ = 同一首歌两种字体",

    check: "3 句寒暄能跟读",

  },

];



/** 8 能力域（全景池 · 侧栏说明用） */

const INTRO_CAPABILITY_DOMAINS = [

  "结构认知",

  "清音听辨",

  "浊半浊",

  "拗音合成",

  "节奏音",

  "文字系统",

  "寒暄语",

  "元学习",

];



const INTRO_GOJUON_DAN = ["あ", "い", "う", "え", "お"];



/** 清音 · あ行～わ行 */

const INTRO_GOJUON_SEION = [

  { row: "あ行", cells: [{ kana: "あ", romaji: "a", hint: "开口大，像 A" }, { kana: "い", romaji: "i" }, { kana: "う", romaji: "u" }, { kana: "え", romaji: "e" }, { kana: "お", romaji: "o" }] },

  { row: "か行", cells: [{ kana: "か", romaji: "ka" }, { kana: "き", romaji: "ki", hint: "像 key" }, { kana: "く", romaji: "ku" }, { kana: "け", romaji: "ke" }, { kana: "こ", romaji: "ko" }] },

  { row: "さ行", cells: [{ kana: "さ", romaji: "sa" }, { kana: "し", romaji: "shi", special: true }, { kana: "す", romaji: "su" }, { kana: "せ", romaji: "se" }, { kana: "そ", romaji: "so" }] },

  { row: "た行", cells: [{ kana: "た", romaji: "ta" }, { kana: "ち", romaji: "chi", special: true }, { kana: "つ", romaji: "tsu", special: true }, { kana: "て", romaji: "te" }, { kana: "と", romaji: "to" }] },

  { row: "な行", cells: [{ kana: "な", romaji: "na" }, { kana: "に", romaji: "ni" }, { kana: "ぬ", romaji: "nu" }, { kana: "ね", romaji: "ne" }, { kana: "の", romaji: "no" }] },

  { row: "は行", cells: [{ kana: "は", romaji: "ha" }, { kana: "ひ", romaji: "hi" }, { kana: "ふ", romaji: "fu", special: true }, { kana: "へ", romaji: "he" }, { kana: "ほ", romaji: "ho" }] },

  { row: "ま行", cells: [{ kana: "ま", romaji: "ma" }, { kana: "み", romaji: "mi" }, { kana: "む", romaji: "mu" }, { kana: "め", romaji: "me" }, { kana: "も", romaji: "mo" }] },

  { row: "や行", cells: [{ kana: "や", romaji: "ya" }, null, { kana: "ゆ", romaji: "yu" }, null, { kana: "よ", romaji: "yo" }] },

  { row: "ら行", cells: [{ kana: "ら", romaji: "ra" }, { kana: "り", romaji: "ri" }, { kana: "る", romaji: "ru" }, { kana: "れ", romaji: "re" }, { kana: "ろ", romaji: "ro" }] },

  { row: "わ行", cells: [{ kana: "わ", romaji: "wa" }, null, null, null, { kana: "を", romaji: "o", hint: "写作を，读 o" }] },

  { row: "ん", cells: [{ kana: "ん", romaji: "n", hint: "独立一拍" }] },

];



/** 清音易错 · 假名 + 中文谐音助记 + 示范词（以 🔊 为准） */
const INTRO_SPECIAL_ROMAJI = [
  { kana: "し", homophone: "诗", homophoneNote: "轻读", demo: "しんぶん", demoZh: "报纸" },
  { kana: "ち", homophone: "七", homophoneNote: "齿音", demo: "ちず", demoZh: "地图" },
  { kana: "つ", homophone: "刺", homophoneNote: "短促", demo: "つき", demoZh: "月亮" },
  { kana: "ふ", homophone: "夫", homophoneNote: "双唇轻擦", demo: "ふね", demoZh: "船" },
];

/** 协同层 · 分色块（左栏类目 + 右栏规律与组合） */
const INTRO_SYNERGY_CATEGORIES = [
  {
    id: "SK-04",
    theme: "trap",
    label: "清音易错",
    skillLabel: "SK-04",
  },
  {
    id: "SK-05",
    theme: "dakuon",
    label: "浊音·半浊",
    skillLabel: "SK-05",
    rules: [
      { text: "清音 + ゛ → 浊音", samples: ["か", "が", "き", "ぎ", "く", "ぐ"] },
      { text: "さ行 + ゛", samples: ["さ", "ざ", "し", "じ", "す", "ず"] },
      { text: "た行 + ゛", samples: ["た", "だ", "ち", "ぢ", "つ", "づ"] },
      { text: "は行 + ゛ → ば行", samples: ["は", "ば", "ひ", "び", "ふ", "ぶ"] },
      { text: "は行 + ゜ → ぱ行（半浊）", samples: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] },
    ],
  },
  {
    id: "SK-06",
    theme: "youon",
    label: "拗音",
    skillLabel: "SK-06",
    rules: [
      { text: "い段 + 小ゃ → きゃ（一拍）", samples: ["きゃ", "きゅ", "きょ"] },
      { text: "し行 + 小ゃゅょ", samples: ["しゃ", "しゅ", "しょ"] },
      { text: "ち行 + 小ゃゅょ", samples: ["ちゃ", "ちゅ", "ちょ"] },
      { text: "に・ひ・み・り + 小ゃゅょ", samples: ["にゃ", "ひゃ", "みゃ", "りゃ", "ぎゅ"] },
    ],
  },
  {
    id: "SK-07",
    theme: "rhythm",
    label: "长·促·拨",
    skillLabel: "SK-07",
    rules: [
      { text: "长音 · 元音多一拍", pairs: [{ a: "おばさん", b: "おばあさん" }] },
      { text: "促音 · っ 中间顿一拍", pairs: [{ a: "がこう", b: "がっこう" }] },
      { text: "拨音 · ん 收尾轻", samples: ["さん", "ほん", "にほん"] },
    ],
  },
];



const INTRO_COMPOSITION_RULES = [

  { id: "youon", title: "拗音公式", formula: "い段 + 小ゃゅょ = 一整拍", example: "き + ゃ → きゃ", bad: "❌ ki-ya 两拍" },

  { id: "dakuon", title: "浊音公式", formula: "清音 + ゛（半浊 + ゜）", example: "か → が", bad: "口型不变，声带振动" },

  { id: "chouon", title: "长音公式", formula: "元音拖长一拍", example: "おばあさん", bad: "おばさん ≠ おばあさん" },

];



const INTRO_MINIMAL_PAIRS = [
  { a: "おばさん", aZh: "阿姨", b: "おばあさん", bZh: "奶奶", lesson: "长音差一拍", aBeats: 3, bBeats: 4 },
  { a: "がこう", aZh: "（无此词）", b: "がっこう", bZh: "学校", lesson: "促音っ 中间顿", aBeats: 3, bBeats: 4 },
];



/** Skill 模组 · 协同层分块 */

const INTRO_SKILLS_SYNERGY = [

  {

    id: "SK-04",

    title: "清音易错四音",

    tag: "2-A",

    summary: "し・ち・つ・ふ 别按汉语拼音猜",

    verify: "能说出 shi/chi/tsu/fu 与 si/ti/tu/hu 的区别",

  },

  {

    id: "SK-05",

    title: "浊音·半浊音对比",

    tag: "2-B",

    summary: "清音上加゛/゜，口型基本不变",

    samples: ["が", "ぎ", "ぐ", "げ", "ご", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ", "か", "き"],

    verify: "交替听 が/か 5 遍能分辨",

  },

  {

    id: "SK-06",

    title: "拗音合成",

    tag: "2-C",

    summary: "きゃ 是一拍，不是两个音节",

    samples: ["きゃ", "しゅ", "ちょ", "りゃ", "ぎゅ"],

    verify: "嘴型一次到位读完 きゃ",

  },

  {

    id: "SK-07",

    title: "长音·促音·拨音",

    tag: "2-D",

    summary: "拍子决定意思；っ 中间停顿",

    verify: "能跟读 がっこう 并用手打拍",

  },

];



/** Skill 模组 · 核心层 */

const INTRO_SKILLS_CORE = [

  { id: "SK-08", title: "三种文字分工", tag: "3-1", summary: "ひらがな骨架 · カタカナ外来 · 漢字表意" },

  { id: "SK-09", title: "寒暄跟读", tag: "3-2", summary: "先会说 4 句礼貌用语" },

  { id: "SK-10", title: "教室应急句", tag: "3-2b", summary: "听不懂时马上能用" },

];



const INTRO_SCRIPT_TYPES = [

  { icon: "📝", name: "ひらがな", zh: "平假名", desc: "柔软字形 · 助词、语法、固有词", example: "わたし・は・を" },

  { icon: "🅺", name: "カタカナ", zh: "片假名", desc: "硬朗字形 · 外来语、强调", example: "コーヒー・パン" },

  { icon: "漢", name: "漢字", zh: "汉字", desc: "有含义 · 本阶段只认识即可", example: "飲・学・日" },

];



const INTRO_GREETINGS = [

  { jp: "おはようございます", zh: "早上好（礼貌）", scene: "早晨" },

  { jp: "こんにちは", zh: "你好（白天）", scene: "白天见面" },

  { jp: "ありがとうございます", zh: "谢谢", scene: "收到帮助" },

  { jp: "すみません", zh: "对不起 / 劳驾", scene: "道歉或搭话前" },

];



const INTRO_CLASSROOM = [

  { jp: "もう一度言ってください", zh: "请再说一遍" },

  { jp: "ゆっくり話してください", zh: "请说慢一点" },

  { jp: "わかりました", zh: "明白了" },

];



const INTRO_APP_GUIDE = [

  { n: 1, title: "你在这里", text: "00 入門 = 发音与文字全景，随时回来当发音词典。" },

  { n: 2, title: "跟五步行法", text: "①全景 ②分块 ③合成 ④开口 ⑤进第1課；完成一层可标记。" },

  { n: 3, title: "正课怎么走", text: "回首页 → 地图第 1 站；每课：単語→会話→文法→テスト。" },

  { n: 4, title: "怎么算学会", text: "入門：层内自测 + 寒暄；正课：三关通关刷星（后续）。" },

];



/** @deprecated 保留别名供旧引用 */

const INTRO_PHASES = INTRO_LAYERS.map((L) => ({

  id: L.phase,

  titleJa: L.labelJa,

  titleZh: L.titleZh,

  daysHint: L.daysHint,

  goal: L.goal,

  steps: [],

  check: L.check,

}));



function loadIntroProgress() {

  const base = { phaseDone: [false, false, false], firstVisit: true, hermesCollapsed: false };

  try {

    const raw = localStorage.getItem(INTRO_STORAGE_KEY);

    if (!raw) return base;

    const parsed = JSON.parse(raw);

    const done = Array.isArray(parsed.phaseDone) ? [...parsed.phaseDone] : [...base.phaseDone];

    while (done.length < 3) done.push(false);

    return {

      ...base,

      ...parsed,

      phaseDone: done.slice(0, 3),

      firstVisit: parsed.firstVisit === false ? false : true,

      hermesCollapsed: !!parsed.hermesCollapsed,

    };

  } catch {

    return base;

  }

}



function saveIntroProgress(p) {

  localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify({ ...p, firstVisit: false }));

}


