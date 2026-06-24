/**
 * 入門 · 假名「先生のひとこと」真源（点字弹出）
 * 字段：memoryZh 怎么记 · cautionZh 注意 · noteJa 先生短句（可选）
 */
const INTRO_KANA_TIP_OVERRIDES = {
  あ: {
    soundLikeZh: "鸭子「あー」叫（あひる）",
    soundIcon: "🦆",
    memoryZh: "开口大、音拉长",
    cautionZh: "别用汉语第四声「啊」砸下去",
  },
  し: {
    soundLikeZh: "小老鼠「しし」/ 安静吸气的「shi—」",
    soundIcon: "🐭",
    memoryZh: "舌面前，像英语 she 开头",
    cautionZh: "不要读成拼音 si",
    demo: "しんぶん",
  },
  ち: {
    soundLikeZh: "钟表「ちょんちょん」的 chi（短）",
    soundIcon: "⏱",
    memoryZh: "齿音 ch，很短",
    cautionZh: "不要读 ti / 汉语 qi",
    demo: "ちず",
  },
  つ: {
    soundLikeZh: "「つっ」啄木鸟啄树（短促 ts）",
    soundIcon: "🪵",
    memoryZh: "cats 里的 ts，无尾音",
    cautionZh: "不要读 tu",
    demo: "つき",
  },
  ふ: {
    soundLikeZh: "吹蜡烛「ふー」、双唇轻擦",
    soundIcon: "🕯",
    memoryZh: "像吹气，不是汉语 f/h 重擦",
    cautionZh: "嘴唇不要咬紧",
    demo: "ふね",
  },
  ん: { memoryZh: "独立一拍，鼻音轻", cautionZh: "别吞掉；别读成「嗯」很重" },
  を: { memoryZh: "字形を，发音同 お", cautionZh: "助词「を」读 o，不是 wo" },
  じ: { memoryZh: "同 し 口型 + 浊音振动", cautionZh: "ぢ 日常多写作 じ，听感相同", tag: "浊音" },
  ぢ: { memoryZh: "发音同 じ", cautionZh: "词汇里很少见，听到按 ji 记", tag: "浊音" },
  づ: { memoryZh: "发音同 ず", cautionZh: "几乎听不出与 ず 的差别", tag: "浊音" },
  ぱ: { memoryZh: "は行 + ゜ 半浊", cautionZh: "嘴唇微振，比 ば 更轻", tag: "半浊" },
  きゃ: { memoryZh: "き + 小ゃ，一整拍", cautionZh: "❌ 不要 ki-ya 拆两拍", tag: "拗音", demo: "きゃく" },
  しゃ: { memoryZh: "し + 小ゃ", cautionZh: "嘴型一次到位", tag: "拗音" },
  ちゃ: { memoryZh: "ち + 小ゃ", cautionZh: "同上一拍规则", tag: "拗音" },
  っ: { memoryZh: "小つ：中间顿一拍", cautionZh: "がっこう 拍手体会中间停", tag: "促音" },
  い: { soundLikeZh: "拉嘴角「い—」像微笑不出声", soundIcon: "😊", memoryZh: "短、平", cautionZh: "不要拖成长音" },
  う: { soundLikeZh: "乌鸦「うう」轻圆唇", soundIcon: "🐦", memoryZh: "嘴唇微圆", cautionZh: "别读成重「乌」" },
  え: { soundLikeZh: "诶？的轻「え」", soundIcon: "❓", memoryZh: "口型扁", cautionZh: "" },
  お: { soundLikeZh: "木偶「おー」拖一点", soundIcon: "🎎", memoryZh: "圆唇开口", cautionZh: "" },
  か: { soundLikeZh: "敲木鱼「かっ」清 k", soundIcon: "🪵", memoryZh: "送气轻", cautionZh: "对比 が 不振动" },
  き: { soundLikeZh: "钥匙碰撞「キン」", soundIcon: "🔑", memoryZh: "ki 短", cautionZh: "" },
  く: { soundLikeZh: "枯叶碎「くっ」", soundIcon: "🍂", memoryZh: "ku 短促", cautionZh: "" },
  け: { soundLikeZh: "ケータイ「け」轻", soundIcon: "📱", memoryZh: "ke 扁口", cautionZh: "" },
  こ: { soundLikeZh: "石子落「こ」", soundIcon: "🪨", memoryZh: "ko 短", cautionZh: "" },
  さ: { soundLikeZh: "洒落「さっ」", soundIcon: "💧", memoryZh: "sa 清", cautionZh: "" },
  す: { soundLikeZh: "吸溜「すー」", soundIcon: "🥤", memoryZh: "su 扁", cautionZh: "别与 shi 混" },
  せ: { soundLikeZh: "セール「せ」", soundIcon: "🏷", memoryZh: "se 短", cautionZh: "" },
  そ: { soundLikeZh: "嗖「そっ」", soundIcon: "💨", memoryZh: "so 清", cautionZh: "" },
  た: { soundLikeZh: "踏地「たん」", soundIcon: "👣", memoryZh: "ta 清", cautionZh: "" },
  て: { soundLikeZh: "铁链「てん」", soundIcon: "⛓", memoryZh: "te 短", cautionZh: "" },
  と: { soundLikeZh: "咚「とん」", soundIcon: "🥁", memoryZh: "to 清", cautionZh: "" },
  な: { soundLikeZh: "なーに「な」平", soundIcon: "🍆", memoryZh: "na 鼻音轻", cautionZh: "" },
  に: { soundLikeZh: "ニコ「にっ」", soundIcon: "😄", memoryZh: "ni 短", cautionZh: "" },
  ぬ: { soundLikeZh: "ぬるぬる滑「ぬ」", soundIcon: "🧴", memoryZh: "nu 圆唇", cautionZh: "" },
  ね: { soundLikeZh: "猫叫「ねこ」的 ne", soundIcon: "🐱", memoryZh: "ne 平", cautionZh: "" },
  の: { soundLikeZh: "のど「の」轻", soundIcon: "🗣", memoryZh: "no 短", cautionZh: "" },
  は: { soundLikeZh: "哈气「はー」轻", soundIcon: "💨", memoryZh: "ha 清", cautionZh: "助词常读 wa" },
  ひ: { soundLikeZh: "ひらめき「ひ」", soundIcon: "💡", memoryZh: "hi 短", cautionZh: "" },
  へ: { soundLikeZh: "へい「へ」扁", soundIcon: "➡", memoryZh: "he 轻", cautionZh: "" },
  ほ: { soundLikeZh: "ほら「ほ」圆", soundIcon: "👋", memoryZh: "ho 清", cautionZh: "" },
  ま: { soundLikeZh: "まま「ま」平", soundIcon: "👶", memoryZh: "ma 双唇", cautionZh: "" },
  み: { soundLikeZh: "みみ「み」", soundIcon: "👂", memoryZh: "mi 短", cautionZh: "" },
  む: { soundLikeZh: "むっ「む」圆唇", soundIcon: "🐮", memoryZh: "mu 闭唇", cautionZh: "" },
  め: { soundLikeZh: "めだま「め」", soundIcon: "👁", memoryZh: "me 扁", cautionZh: "" },
  も: { soundLikeZh: "もも「も」", soundIcon: "🍑", memoryZh: "mo 圆", cautionZh: "" },
  や: { soundLikeZh: "やあ「や」开", soundIcon: "📣", memoryZh: "ya 短", cautionZh: "" },
  ゆ: { soundLikeZh: "ゆっくり「ゆ」", soundIcon: "🐌", memoryZh: "yu 圆", cautionZh: "" },
  よ: { soundLikeZh: "よいしょ「よ」", soundIcon: "💪", memoryZh: "yo 短", cautionZh: "" },
  ら: { soundLikeZh: "らっぱ「ら」弹舌轻", soundIcon: "📯", memoryZh: "ra 轻快", cautionZh: "" },
  り: { soundLikeZh: "りん「り」", soundIcon: "🔔", memoryZh: "ri 短", cautionZh: "" },
  る: { soundLikeZh: "るるる「る」一卷", soundIcon: "🌀", memoryZh: "ru 卷舌轻", cautionZh: "" },
  れ: { soundLikeZh: "れい「れ」", soundIcon: "🧊", memoryZh: "re 短", cautionZh: "" },
  ろ: { soundLikeZh: "ろく「ろ」", soundIcon: "6️⃣", memoryZh: "ro 清", cautionZh: "" },
  わ: { soundLikeZh: "わあ「わ」圆", soundIcon: "🙌", memoryZh: "wa 短", cautionZh: "" },
  ん: { soundLikeZh: "嗯？轻鼻音「ん—」", soundIcon: "🤫", memoryZh: "独立一拍", cautionZh: "别读太重" },
  が: { soundLikeZh: "がばん「が」振动", soundIcon: "🔔", tag: "浊音" },
  ざ: { soundLikeZh: "ざざっ「ざ」", soundIcon: "⚡", tag: "浊音" },
  じ: { soundLikeZh: "じろ「じ」振动", soundIcon: "🐭", tag: "浊音" },
  ず: { soundLikeZh: "ずるずる「ず」", soundIcon: "🍜", tag: "浊音" },
  ぜ: { soundLikeZh: "ぜん「ぜ」", soundIcon: "🧘", tag: "浊音" },
  ぞ: { soundLikeZh: "ぞう「ぞ」低", soundIcon: "🐘", tag: "浊音" },
  だ: { soundLikeZh: "だん「だ」浊", soundIcon: "🥁", tag: "浊音" },
  ど: { soundLikeZh: "どん「ど」", soundIcon: "🚪", tag: "浊音" },
  ば: { soundLikeZh: "ばん「ば」振", soundIcon: "🎺", tag: "浊音" },
  び: { soundLikeZh: "びび「び」", soundIcon: "🐝", tag: "浊音" },
  ぶ: { soundLikeZh: "ぶつ「ぶ」", soundIcon: "👊", tag: "浊音" },
  べ: { soundLikeZh: "べん「べ」", soundIcon: "✏", tag: "浊音" },
  ぼ: { soundLikeZh: "ぼー「ぼ」", soundIcon: "🎵", tag: "浊音" },
  ぴ: { soundLikeZh: "ぴか「ぴ」轻振", soundIcon: "✨", tag: "半浊" },
  ぷ: { soundLikeZh: "ぷー「ぷ」", soundIcon: "🫧", tag: "半浊" },
  ぺ: { soundLikeZh: "ぺこ「ぺ」", soundIcon: "🐶", tag: "半浊" },
  ぽ: { soundLikeZh: "ぽん「ぽ」", soundIcon: "📮", tag: "半浊" },
  きゅ: { soundLikeZh: "キュー「きゅ」一拍", soundIcon: "🎬", tag: "拗音" },
  きょ: { soundLikeZh: "きょろ「きょ」", soundIcon: "👀", tag: "拗音" },
  しゅ: { soundLikeZh: "しゅっ「しゅ」", soundIcon: "🚿", tag: "拗音" },
  しょ: { soundLikeZh: "しょっ「しょ」", soundIcon: "📸", tag: "拗音" },
  ちゅ: { soundLikeZh: "ちゅう「ちゅ」", soundIcon: "🍡", tag: "拗音" },
  ちょ: { soundLikeZh: "ちょこ「ちょ」", soundIcon: "🍫", tag: "拗音" },
  にゃ: { soundLikeZh: "にゃん「にゃ」", soundIcon: "🐱", tag: "拗音" },
  ひゃ: { soundLikeZh: "ひゃっ「ひゃ」", soundIcon: "⚡", tag: "拗音" },
  みゃ: { soundLikeZh: "みゃく「みゃ」", soundIcon: "💓", tag: "拗音" },
  りゃ: { soundLikeZh: "りゃく「りゃ」", soundIcon: "📉", tag: "拗音" },
  ぎゅ: { soundLikeZh: "ぎゅう「ぎゅ」", soundIcon: "🐂", tag: "拗音" },
  さん: { soundLikeZh: "三「さん」尾音轻", soundIcon: "3️⃣", tag: "拨音", memoryZh: "ん 收尾" },
  ほん: { soundLikeZh: "本「ほん」", soundIcon: "📕", tag: "拨音" },
  にほん: { soundLikeZh: "日本「にほん」", soundIcon: "🇯🇵", tag: "拨音", demo: "にほん" },
  おばさん: { soundLikeZh: "阿姨：3 拍", soundIcon: "👩", tag: "长音", memoryZh: "短おばさん" },
  おばあさん: { soundLikeZh: "奶奶：4 拍（あ 拖长）", soundIcon: "👵", tag: "长音", memoryZh: "多一拍あ" },
  がっこう: { soundLikeZh: "が・っ・こう 中间顿", soundIcon: "🏫", tag: "促音", memoryZh: "っ 停一拍" },
};

function applyDefaultSound(kana, base) {
  if (base.soundLikeZh) return base;
  const ov = INTRO_KANA_TIP_OVERRIDES[kana];
  if (ov?.soundLikeZh) {
    return { ...base, soundLikeZh: ov.soundLikeZh, soundIcon: ov.soundIcon || base.soundIcon };
  }
  return { ...base, soundLikeZh: "先点 🔊 听标准音，再模仿口型", soundIcon: "👂" };
}

function buildIntroKanaTipMap() {
  const map = {};

  function set(kana, tip) {
    if (!kana) return;
    map[kana] = { kana, ...tip };
  }

  INTRO_GOJUON_SEION.forEach((row) => {
    (row.cells || []).forEach((c) => {
      if (!c || !c.kana) return;
      const ov = INTRO_KANA_TIP_OVERRIDES[c.kana];
      const tip = applyDefaultSound(c.kana, {
        romaji: c.romaji,
        memoryZh: ov?.memoryZh || c.hint || `${row.row} · 先听 🔊`,
        cautionZh: ov?.cautionZh || (c.special ? "易错音 · 以 🔊 为准" : ""),
        soundLikeZh: ov?.soundLikeZh,
        soundIcon: ov?.soundIcon,
        homophone: ov?.homophone,
        noteJa: ov?.noteJa,
        demo: ov?.demo,
        tag: ov?.tag,
      });
      set(c.kana, tip);
    });
  });

  INTRO_SPECIAL_ROMAJI.forEach((s) => {
    const base = map[s.kana] || {};
    const ov = INTRO_KANA_TIP_OVERRIDES[s.kana] || {};
    set(s.kana, {
      ...base,
      memoryZh: ov.memoryZh || base.memoryZh || `谐音「${s.homophone}」${s.homophoneNote}`,
      cautionZh: ov.cautionZh || base.cautionZh || "",
      homophone: s.homophone,
      demo: s.demo,
      noteJa: ov.noteJa || base.noteJa,
      tag: "易错",
    });
  });

  Object.keys(INTRO_KANA_TIP_OVERRIDES).forEach((k) => {
    if (!map[k]) set(k, INTRO_KANA_TIP_OVERRIDES[k]);
    else map[k] = { ...map[k], ...INTRO_KANA_TIP_OVERRIDES[k] };
  });

  ["が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "ど", "ば", "び", "ぶ", "べ", "ぼ"].forEach((k) => {
    if (!map[k]) set(k, applyDefaultSound(k, { memoryZh: "清音加 ゛，口型不变", cautionZh: "声带振动", tag: "浊音" }));
    else map[k] = applyDefaultSound(k, map[k]);
  });

  ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"].forEach((k) => {
    if (!map[k]) set(k, applyDefaultSound(k, { memoryZh: "は行 + ゜", cautionZh: "比浊音更轻", tag: "半浊" }));
    else map[k] = applyDefaultSound(k, map[k]);
  });

  ["きゃ", "きゅ", "きょ", "しゃ", "しゅ", "しょ", "ちゃ", "ちゅ", "ちょ", "にゃ", "ひゃ", "みゃ", "りゃ", "ぎゅ"].forEach((k) => {
    if (!map[k]) set(k, applyDefaultSound(k, { memoryZh: "い段 + 小ゃゅょ = 一拍", cautionZh: "别拆成两个音节", tag: "拗音" }));
    else map[k] = applyDefaultSound(k, map[k]);
  });

  return map;
}

const INTRO_KANA_TIPS = buildIntroKanaTipMap();

function getIntroKanaTip(kana) {
  const key = (kana || "").trim();
  if (!key) return null;
  if (INTRO_KANA_TIPS[key]) return { ...INTRO_KANA_TIPS[key] };
  return applyDefaultSound(key, {
    kana: key,
    memoryZh: "点 🔊 听一遍，再跟读",
    cautionZh: "",
  });
}
