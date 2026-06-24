/** 跨课链接 · 約10秒ミニカード（静的） */
const MINI_CARDS = {
  masu_kei: {
    title: "ます形（第5課）",
    titleRuby: [{ kanji: "形", reading: "けい" }],
    explain: "動詞の基本の形。〜ます、〜ました。",
    example: "書きます、食べます。",
    exampleRuby: [{ kanji: "書", reading: "か" }, { kanji: "食", reading: "た" }],
  },
  ta_kei: {
    title: "た形",
    explain: "て形と同じ変化のしかた。過去のことに使う。",
    example: "書いて → 書いた",
  },
  te_kei_l14: {
    title: "動詞のて形（第14課）",
    explain: "文をつなぐ形。グループによって変化がちがう。",
    example: "書く→書いて、食べる→食べて",
    exampleRuby: [{ kanji: "書", reading: "か" }],
  },
  adj_te_l16: {
    title: "形容詞のて形（第16課）",
    explain: "い形容詞は「くて」、な形容詞は「で」。",
    example: "広くて、明るいです。",
    exampleRuby: [{ kanji: "広", reading: "ひろ" }, { kanji: "明", reading: "あか" }],
  },
  meishi_te_l17: {
    title: "名詞のて形（第17課）",
    explain: "名詞＋で、いろいろな名詞をつなぐ。",
    example: "学生で、中国人です。",
  },
  jidoushi_tadoushi: {
    title: "自動詞と他動詞（第18課）",
    explain: "自動詞は「が」、他動詞は「を」。",
    example: "開く（自動）⇔ 開ける（他動）",
    exampleRuby: [{ kanji: "開", reading: "あ" }],
  },
  tekudasai_masenka_l20: {
    title: "〜てくださいませんか（第20課）",
    explain: "ていねいにお願いする言い方。",
    example: "少しお手伝いしていただけませんか。",
  },
  ta_atode_l22: {
    title: "〜たあとで（第22課）",
    explain: "〜てからと似ているが、少しカタい言い方。",
    example: "食事のあとで、散歩します。",
  },
  youni_naru_l32: {
    title: "〜ようになる（第32課）",
    explain: "だんだんそう変わる、能力ができる。",
    example: "日本語が話せるようになりました。",
    exampleRuby: [{ kanji: "話", reading: "はな" }],
  },
  koto_ni_suru_l25: {
    title: "〜ことにする（第25課）",
    explain: "自分で決めること。",
    example: "毎日、運動することにしました。",
  },
  hou_ga_ii_l24: {
    title: "〜たらいい（第24課）",
    explain: "アドバイス。「〜したらいいですよ」。",
    example: "病院に行ったらいいですよ。",
  },
  nai_de_kudasai_l19: {
    title: "〜ないでください（第19課）",
    explain: "「〜しないでください」とお願いする。",
    example: "ここでタバコを吸わないでください。",
  },
};

function getMiniCard(key) {
  if (!key) return null;
  return MINI_CARDS[key] || null;
}

function miniCardKeyFromLink(link) {
  if (link.miniCardKey) return link.miniCardKey;
  const map = {
    "第5课": "masu_kei",
    "第5課": "masu_kei",
    ます形: "masu_kei",
    た形: "ta_kei",
    "第17课": "meishi_te_l17",
    "第20课": "tekudasai_masenka_l20",
    "第22课": "ta_atode_l22",
    "第32课": "youni_naru_l32",
    "第25课": "koto_ni_suru_l25",
    "第24课": "hou_ga_ii_l24",
    "第19课": "nai_de_kudasai_l19",
    l14_teform: "te_kei_l14",
    l16_adj_teform: "adj_te_l16",
    l18_transitivity: "jidoushi_tadoushi",
  };
  if (link.targetNodeId && MINI_CARDS[link.targetNodeId]) return link.targetNodeId;
  if (link.external && map[link.external]) return map[link.external];
  return null;
}
