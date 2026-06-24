/**
 * 知识点关联图 · 阶段 A（静态真源）
 * anchors：课内锚点 → conceptId[]
 * concepts：概念 → 跨课 refs（第 2 课起在提示中显示其他课）
 */
const KNOWLEDGE_GRAPH = {
  version: 1,
  concepts: {
    "particle-wa": {
      label: "助词は（读 wa）",
      refs: [
        { lessonId: 1, anchorId: "l1_g1", gate: 1, label: "第1课・はです", role: "intro" },
        { lessonId: 2, anchorId: "l2_g3", gate: 1, label: "第2课・は…の…です", role: "extend" },
        { lessonId: 3, anchorId: "l3_g3", gate: 1, label: "第3课・ここは…", role: "extend" },
        { lessonId: 4, anchorId: "l4_g2", gate: 1, label: "第4课・位置は", role: "review" },
      ],
    },
    "particle-no": {
      label: "名詞の「の」",
      refs: [
        { lessonId: 1, anchorId: "l1_g4", gate: 1, label: "第1课・の", role: "intro" },
        { lessonId: 2, anchorId: "l2_g3", gate: 1, label: "第2课・所属のの", role: "extend" },
      ],
    },
    "desu-plain": {
      label: "〜です（肯定）",
      refs: [
        { lessonId: 1, anchorId: "l1_g1", gate: 1, label: "第1课・はです", role: "intro" },
        { lessonId: 2, anchorId: "l2_g3", gate: 1, label: "第2课・です", role: "review" },
      ],
    },
    "desu-neg": {
      label: "〜ではありません",
      refs: [{ lessonId: 1, anchorId: "l1_g2", gate: 1, label: "第1课・否定", role: "intro" }],
    },
    "desu-question": {
      label: "〜ですか",
      refs: [
        { lessonId: 1, anchorId: "l1_g3", gate: 1, label: "第1课・ですか", role: "intro" },
        { lessonId: 1, anchorId: "l1_v_22", gate: 0, label: "第1课・はい/そうです", role: "review" },
      ],
    },
    "reply-hai-sou": {
      label: "はい、そうです",
      refs: [
        { lessonId: 1, anchorId: "l1_v_22", gate: 0, label: "第1课・はい", role: "intro" },
        { lessonId: 1, anchorId: "l1_dlg_0", gate: 2, label: "第1课・会話①", role: "review" },
      ],
    },
    "kore-sore-are": {
      label: "これ・それ・あれ",
      refs: [
        { lessonId: 2, anchorId: "l2_g1", gate: 1, label: "第2课・指示代词", role: "intro" },
        { lessonId: 1, anchorId: "l1_g4", gate: 1, label: "第1课・の（预告）", role: "preview" },
      ],
    },
    "kono-sono-ano": {
      label: "この・その・あの",
      refs: [{ lessonId: 2, anchorId: "l2_g2", gate: 1, label: "第2课・连体词", role: "intro" }],
    },
    "desu-ne": {
      label: "〜ですね",
      refs: [{ lessonId: 2, anchorId: "l2_g4", gate: 1, label: "第2课・ですね", role: "intro" }],
    },
    "san-suffix": {
      label: "〜さん",
      refs: [{ lessonId: 1, anchorId: "l1_v_4", gate: 0, label: "第1课・さん", role: "intro" }],
    },
    "koko-soko-asoko": {
      label: "ここ・そこ・あそこ",
      refs: [
        { lessonId: 3, anchorId: "l3_g1", gate: 1, label: "第3课・场所指示", role: "intro" },
        { lessonId: 2, anchorId: "l2_g1", gate: 1, label: "第2课・これ/それ（对照）", role: "preview" },
      ],
    },
    "doko-desu": {
      label: "どこですか",
      refs: [
        { lessonId: 3, anchorId: "l3_g2", gate: 1, label: "第3课・どこ", role: "intro" },
        { lessonId: 4, anchorId: "l4_g2", gate: 1, label: "第4课・位置", role: "extend" },
      ],
    },
    "arimasu-imasu": {
      label: "あります・います",
      refs: [
        { lessonId: 4, anchorId: "l4_g1", gate: 1, label: "第4课・存在", role: "intro" },
        { lessonId: 3, anchorId: "l3_g3", gate: 1, label: "第3课・に あります", role: "preview" },
      ],
    },
    "i-adjective": {
      label: "い形容詞（きれい 等）",
      refs: [
        { lessonId: 3, anchorId: "l3_g4", gate: 1, label: "第3课・とても きれい", role: "intro" },
        { lessonId: 4, anchorId: "l4_g3", gate: 1, label: "第4课・部屋描写", role: "extend" },
      ],
    },
    "donata-desu": {
      label: "どなたですか",
      refs: [
        { lessonId: 2, anchorId: "l2_g5", gate: 1, label: "第2课・どなた", role: "intro" },
        { lessonId: 2, anchorId: "l2_dlg_2", gate: 2, label: "第2课・会話③", role: "review" },
      ],
    },
    "masu-form": {
      label: "动词ます形",
      refs: [
        { lessonId: 5, anchorId: "l5_g1", gate: 1, label: "第5课・ます形", role: "intro" },
        { lessonId: 5, anchorId: "l5_dlg_0", gate: 2, label: "第5课・会話①", role: "review" },
      ],
    },
    "ni-time": {
      label: "时刻＋に",
      refs: [
        { lessonId: 5, anchorId: "l5_g3", gate: 1, label: "第5课・に时刻", role: "intro" },
        { lessonId: 5, anchorId: "l5_g4", gate: 1, label: "第5课・から～まで", role: "extend" },
      ],
    },
    "e-de-move": {
      label: "へ・で（移动）",
      refs: [
        { lessonId: 6, anchorId: "l6_g1", gate: 1, label: "第6课・へ/で", role: "intro" },
        { lessonId: 6, anchorId: "l6_dlg_0", gate: 2, label: "第6课・会話①", role: "review" },
      ],
    },
    "ni-shimasu": {
      label: "を／にします",
      refs: [
        { lessonId: 7, anchorId: "l7_g2", gate: 1, label: "第7课・にします", role: "intro" },
        { lessonId: 7, anchorId: "l7_dlg_0", gate: 2, label: "第7课・会話①", role: "review" },
      ],
    },
    "give-receive": {
      label: "授受动词",
      refs: [
        { lessonId: 8, anchorId: "l8_g1", gate: 1, label: "第8课・あげる/もらう", role: "intro" },
        { lessonId: 8, anchorId: "l8_dlg_0", gate: 2, label: "第8课・会話①", role: "review" },
      ],
    },
    "i-adj-taste": {
      label: "イ形容詞（味觉）",
      refs: [
        { lessonId: 9, anchorId: "l9_g1", gate: 1, label: "第9课・辛い/おいしい", role: "intro" },
        { lessonId: 3, anchorId: "l3_g4", gate: 1, label: "第3课・きれい（对照）", role: "preview" },
      ],
    },
    "na-adjective": {
      label: "ナ形容詞",
      refs: [
        { lessonId: 10, anchorId: "l10_g1", gate: 1, label: "第10课・有名です", role: "intro" },
        { lessonId: 10, anchorId: "l10_dlg_0", gate: 2, label: "第10课・会話①", role: "review" },
      ],
    },
    "ga-suki": {
      label: "が好き／が上手",
      refs: [
        { lessonId: 11, anchorId: "l11_g1", gate: 1, label: "第11课・が好き", role: "intro" },
        { lessonId: 11, anchorId: "l11_g2", gate: 1, label: "第11课・が上手", role: "extend" },
      ],
    },
    "yori-ichiban": {
      label: "より／一番",
      refs: [
        { lessonId: 12, anchorId: "l12_g1", gate: 1, label: "第12课・比较", role: "intro" },
        { lessonId: 12, anchorId: "l12_dlg_0", gate: 2, label: "第12课・会話①", role: "review" },
        { lessonId: 17, anchorId: "l17_g1", gate: 1, label: "第17课・愿望（对照）", role: "extend" },
        { lessonId: 20, anchorId: "l20_g1", gate: 1, label: "第20课・可能（对照）", role: "extend" },
      ],
    },
    "te-form": {
      label: "て形",
      refs: [
        { lessonId: 14, anchorId: "l14_g1", gate: 1, label: "第14课・て形", role: "intro" },
        { lessonId: 14, anchorId: "l14_dlg_0", gate: 2, label: "第14课・会話①", role: "review" },
      ],
    },
    "te-iru": {
      label: "ている",
      refs: [
        { lessonId: 15, anchorId: "l15_g1", gate: 1, label: "第15课・ている", role: "intro" },
        { lessonId: 15, anchorId: "l15_dlg_0", gate: 2, label: "第15课・会話①", role: "review" },
      ],
    },
    "kotoga-dekiru": {
      label: "ことができる",
      refs: [
        { lessonId: 20, anchorId: "l20_g1", gate: 1, label: "第20课・可能", role: "intro" },
        { lessonId: 20, anchorId: "l20_dlg_0", gate: 2, label: "第20课・会話①", role: "review" },
        { lessonId: 17, anchorId: "l17_g1", gate: 1, label: "第17课・愿望（对照）", role: "preview" },
      ],
    },
    "plain-form": {
      label: "简体（普通体）",
      refs: [
        { lessonId: 24, anchorId: "l24_g1", gate: 1, label: "第24课・简体", role: "intro" },
        { lessonId: 1, anchorId: "l1_g1", gate: 1, label: "第1课・です（对照）", role: "preview" },
      ],
    },
    "counter-suffix": {
      label: "数量词・助数词",
      refs: [
        { lessonId: 13, anchorId: "l13_g1", gate: 1, label: "第13课・数量词", role: "intro" },
        { lessonId: 13, anchorId: "l13_dlg_0", gate: 2, label: "第13课・会話①", role: "review" },
        { lessonId: 4, anchorId: "l4_g1", gate: 1, label: "第4课・数量（预告）", role: "preview" },
      ],
    },
    "te-form-chain": {
      label: "て形・连续动作",
      refs: [
        { lessonId: 14, anchorId: "l14_g1", gate: 1, label: "第14课・て形", role: "intro" },
        { lessonId: 15, anchorId: "l15_g1", gate: 1, label: "第15课・ている", role: "extend" },
        { lessonId: 16, anchorId: "l16_g1", gate: 1, label: "第16课・形容词て形", role: "extend" },
      ],
    },
    "adj-te": {
      label: "形容词て形",
      refs: [
        { lessonId: 16, anchorId: "l16_g1", gate: 1, label: "第16课・広くて", role: "intro" },
        { lessonId: 16, anchorId: "l16_dlg_0", gate: 2, label: "第16课・会話①", role: "review" },
        { lessonId: 14, anchorId: "l14_g1", gate: 1, label: "第14课・て形（对照）", role: "preview" },
      ],
    },
    "hoshii": {
      label: "〜がほしい",
      refs: [
        { lessonId: 17, anchorId: "l17_g1", gate: 1, label: "第17课・愿望", role: "intro" },
        { lessonId: 17, anchorId: "l17_dlg_0", gate: 2, label: "第17课・会話①", role: "review" },
        { lessonId: 12, anchorId: "l12_g1", gate: 1, label: "第12课・比较（对照）", role: "preview" },
      ],
    },
    "naru-change": {
      label: "〜なる（变化）",
      refs: [
        { lessonId: 18, anchorId: "l18_g1", gate: 1, label: "第18课・变化", role: "intro" },
        { lessonId: 18, anchorId: "l18_dlg_0", gate: 2, label: "第18课・会話①", role: "review" },
      ],
    },
    "naide": {
      label: "〜ないで（禁止）",
      refs: [
        { lessonId: 19, anchorId: "l19_g1", gate: 1, label: "第19课・ないで", role: "intro" },
        { lessonId: 19, anchorId: "l19_dlg_0", gate: 2, label: "第19课・会話①", role: "review" },
      ],
    },
    "ta-koto": {
      label: "〜たことがある",
      refs: [
        { lessonId: 21, anchorId: "l21_g1", gate: 1, label: "第21课・经历", role: "intro" },
        { lessonId: 21, anchorId: "l21_dlg_0", gate: 2, label: "第21课・会話①", role: "review" },
      ],
    },
    "to-omo": {
      label: "〜と思う",
      refs: [
        { lessonId: 22, anchorId: "l22_g1", gate: 1, label: "第22课・思う", role: "intro" },
        { lessonId: 22, anchorId: "l22_dlg_0", gate: 2, label: "第22课・会話①", role: "review" },
        { lessonId: 24, anchorId: "l24_dlg_0", gate: 2, label: "第24课・引用", role: "extend" },
      ],
    },
    "tari": {
      label: "〜たり〜たり",
      refs: [
        { lessonId: 23, anchorId: "l23_g1", gate: 1, label: "第23课・たり", role: "intro" },
        { lessonId: 23, anchorId: "l23_dlg_0", gate: 2, label: "第23课・会話①", role: "review" },
      ],
    },
  },
  anchors: {
    l1_g1: ["particle-wa", "desu-plain"],
    l1_g2: ["desu-neg"],
    l1_g3: ["desu-question"],
    l1_g4: ["particle-no", "kore-sore-are"],
    l1_v_4: ["san-suffix"],
    l1_v_22: ["desu-question", "reply-hai-sou"],
    l1_dlg_0: ["reply-hai-sou", "particle-no", "desu-question"],
    l2_g1: ["kore-sore-are"],
    l2_g2: ["kono-sono-ano"],
    l2_g3: ["particle-wa", "particle-no", "desu-plain"],
    l2_g4: ["desu-ne"],
    l2_g5: ["donata-desu"],
    l2_dlg_2: ["donata-desu", "kore-sore-are"],
    l3_g1: ["koko-soko-asoko"],
    l3_g2: ["doko-desu"],
    l3_g3: ["arimasu-imasu"],
    l3_g4: ["i-adjective"],
    l4_g1: ["arimasu-imasu"],
    l4_g2: ["doko-desu"],
    l4_g3: ["i-adjective"],
    l4_dlg_0: ["arimasu-imasu", "i-adjective"],
    l5_g1: ["masu-form"],
    l5_g3: ["ni-time"],
    l5_g4: ["ni-time"],
    l5_dlg_0: ["masu-form", "ni-time"],
    l6_g1: ["e-de-move"],
    l6_dlg_0: ["e-de-move"],
    l7_g2: ["ni-shimasu"],
    l7_dlg_0: ["ni-shimasu"],
    l8_g1: ["give-receive"],
    l8_dlg_0: ["give-receive"],
    l9_g1: ["i-adj-taste", "i-adjective"],
    l9_dlg_0: ["i-adj-taste"],
    l10_g1: ["na-adjective"],
    l10_dlg_0: ["na-adjective"],
    l11_g1: ["ga-suki"],
    l11_g2: ["ga-suki"],
    l11_dlg_0: ["ga-suki"],
    l12_g1: ["yori-ichiban"],
    l12_dlg_0: ["yori-ichiban"],
    l14_g1: ["te-form", "te-form-chain"],
    l14_dlg_0: ["te-form", "te-form-chain"],
    l15_g1: ["te-iru", "te-form-chain"],
    l15_dlg_0: ["te-iru", "te-form-chain"],
    l20_g1: ["kotoga-dekiru"],
    l20_dlg_0: ["kotoga-dekiru"],
    l24_g1: ["plain-form"],
    l24_dlg_0: ["plain-form", "to-omo"],
    l13_g1: ["counter-suffix"],
    l13_dlg_0: ["counter-suffix"],
    l16_g1: ["adj-te", "te-form-chain"],
    l16_dlg_0: ["adj-te"],
    l17_g1: ["hoshii"],
    l17_dlg_0: ["hoshii"],
    l18_g1: ["naru-change"],
    l18_dlg_0: ["naru-change"],
    l19_g1: ["naide"],
    l19_dlg_0: ["naide"],
    l21_g1: ["ta-koto"],
    l21_dlg_0: ["ta-koto"],
    l22_g1: ["to-omo"],
    l22_dlg_0: ["to-omo"],
    l23_g1: ["tari"],
    l23_dlg_0: ["tari"],
  },
};
