/**
 * 第2单元第5–8课 · 会話 ABC（A=课文 · B/C=场景变体 + 提示）
 * 人工策划 · scripts/rewrite-abc-manual-l5-24.py（对齐 L1 口径；勿用旧 generate 覆盖）
 */

const L5_DIALOGUE_ABC = {
  "l5_dlg_1": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 森应答。A＝课文「６時半に起きます。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "６時半に起きます。",
        chinese: "6点半起床。",
        noteZh: "A 标准答（森）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "６時半に起きるよ。",
        chinese: "6点半起床。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（森，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "６時半に起きますね。",
        chinese: "6点半起床。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（森，非错答）.",
      },
    ],
  },
  "l5_dlg_2": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 小野应答。A＝课文「じゃあ、朝ごはんは？」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "じゃあ、朝ごはんは？",
        chinese: "那么，早饭呢？",
        noteZh: "A 标准答（小野）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "朝ごはんは？",
        chinese: "那么，早饭呢？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "じゃあ、朝ごはんはでしょうか。",
        chinese: "那么，早饭呢？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l5_dlg_3": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 森应答。A＝课文「いつも７時に食べます。それから、７時…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いつも７時に食べます。それから、７時半に家を出ます。",
        chinese: "总是7点吃。然后7点半出门。",
        noteZh: "A 标准答（森）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "それから、７時半に家を出ます。",
        chinese: "然后7点半出门。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いつも７時に食べます。それから、７時半に家を出ますね。",
        chinese: "总是7点吃。然后7点半出门。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（森，非错答）.",
      },
    ],
  },
  "l5_dlg_4": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 小野应答。A＝课文「会社には何時に着きますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "会社には何時に着きますか。",
        chinese: "几点到公司？",
        noteZh: "A 标准答（小野）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "会社には何時に着きる？",
        chinese: "几点到公司？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "会社には何時に着きますでしょうか。",
        chinese: "几点到公司？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l5_dlg_5": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 森应答。A＝课文「８時ごろです。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "８時ごろです。",
        chinese: "8点左右。",
        noteZh: "A 标准答（森）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "８時ごろだよ。",
        chinese: "8点左右。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（森，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "８時ごろでございます。",
        chinese: "8点左右。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（森，非错答）.",
      },
    ],
  },
  "l5_dlg_6": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 小野应答。A＝课文「李さんは？」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さんは？",
        chinese: "小李呢？",
        noteZh: "A 标准答（小野）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、李さんは？",
        chinese: "小李呢？",
        noteZh: "B 同场景变体：节奏快、信息略减（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さんはでしょうか。",
        chinese: "小李呢？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l5_dlg_7": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 李应答。A＝课文「私は６時に起きます。そして、朝ごはん…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私は６時に起きます。そして、朝ごはんを食べて、７時に家を出ます。",
        chinese: "我6点起床。然后吃早饭，7点出门。",
        noteZh: "A 标准答（李）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "そして、朝ごはんを食べて、７時に家を出ます。",
        chinese: "然后吃早饭，7点出门。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私は６時に起きます。そして、朝ごはんを食べて、７時に家を出ますね。",
        chinese: "我6点起床。然后吃早饭，7点出门。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l5_dlg_8": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 小野应答。A＝课文「早いですね。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "早いですね。",
        chinese: "真早啊。",
        noteZh: "A 标准答（小野）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、早いですね。",
        chinese: "真早啊。",
        noteZh: "B 同场景变体：节奏快、信息略减（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "早いですねね。",
        chinese: "真早啊。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l5_dlg_9": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 李应答。A＝课文「いいえ、森さんも早いですよ。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いいえ、森さんも早いですよ。",
        chinese: "不，森先生您也很早啊。",
        noteZh: "A 标准答（李）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "森さんも早いですよ。",
        chinese: "不，森先生您也很早啊。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いいえ、森さんも早いですます。",
        chinese: "不，森先生您也很早啊。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l5_dlg_10": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 森应答。A＝课文「李さんは昨夜何時に寝ましたか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さんは昨夜何時に寝ましたか。",
        chinese: "小李昨晚几点睡的？",
        noteZh: "A 标准答（森）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、李さんは昨夜何時に寝ましたか。",
        chinese: "小李昨晚几点睡的？",
        noteZh: "B 同场景变体：节奏快、信息略减（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さんは昨夜何時に寝ましたかね。",
        chinese: "小李昨晚几点睡的？",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（森，非错答）.",
      },
    ],
  },
  "l5_dlg_11": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 李应答。A＝课文「１１時半に寝ました。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "１１時半に寝ました。",
        chinese: "11点半睡的。",
        noteZh: "A 标准答（李）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、１１時半に寝ました。",
        chinese: "11点半睡的。",
        noteZh: "B 同场景变体：节奏快、信息略减（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "１１時半に寝ましたね。",
        chinese: "11点半睡的。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l5_dlg_12": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 森应答。A＝课文「私は１２時です。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私は１２時です。",
        chinese: "我12点（睡）。",
        noteZh: "A 标准答（森）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "私は１２時だよ。",
        chinese: "我12点（睡）。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（森，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私は１２時でございます。",
        chinese: "我12点（睡）。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（森，非错答）.",
      },
    ],
  },
  "l5_dlg_13": {
    abcGuideZh: "「朝の習慣」· 朝の習慣 · 时间表达 · 小野应答。A＝课文「みんな、頑張っていますね。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "みんな、頑張っていますね。",
        chinese: "大家都很努力呢。",
        noteZh: "A 标准答（小野）：「朝の習慣」· 朝の習慣 · 时间表达；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、みんな、頑張っていますね。",
        chinese: "大家都很努力呢。",
        noteZh: "B 同场景变体：节奏快、信息略减（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "みんな、頑張っていますねね。",
        chinese: "大家都很努力呢。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
};

const L6_DIALOGUE_ABC = {
  "l6_dlg_1": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「はい、京都へ行く予定です。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "はい、京都へ行く予定です。",
        chinese: "嗯，打算去京都。",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "京都へ行く予定です。",
        chinese: "嗯，打算去京都。",
        noteZh: "B 同场景变体：节奏快、信息略减（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "はい、京都へ行く予定でございます。",
        chinese: "嗯，打算去京都。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l6_dlg_2": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 小野应答。A＝课文「いいですね。何で行きますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いいですね。何で行きますか。",
        chinese: "好啊。坐什么去？",
        noteZh: "A 标准答（小野）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "何で行きますか。",
        chinese: "坐什么去。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いいですね。何で行きますでしょうか。",
        chinese: "好啊。坐什么去？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l6_dlg_3": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「新幹線で行きます。東京から京都まで２…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "新幹線で行きます。東京から京都まで２時間半ぐらいです。",
        chinese: "坐新干线。从东京到京都大约两个半小时。",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "東京から京都まで２時間半ぐらいです。",
        chinese: "从东京到京都大约两个半小时。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "新幹線で行きます。東京から京都まで２時間半ぐらいでございます。",
        chinese: "坐新干线。从东京到京都大约两个半小时。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l6_dlg_4": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 小野应答。A＝课文「一人で行きますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "一人で行きますか。",
        chinese: "一个人去吗？",
        noteZh: "A 标准答（小野）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "一人で行きる？",
        chinese: "一个人去吗？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "一人で行きますでしょうか。",
        chinese: "一个人去吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l6_dlg_5": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「いいえ、友達と一緒に行きます。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いいえ、友達と一緒に行きます。",
        chinese: "不，和朋友一起去。",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "友達と一緒に行きます。",
        chinese: "不，和朋友一起去。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いいえ、友達と一緒に行きますね。",
        chinese: "不，和朋友一起去。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l6_dlg_6": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 小野应答。A＝课文「そうですか。楽しみですね。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "そうですか。楽しみですね。",
        chinese: "是吗。很期待啊。",
        noteZh: "A 标准答（小野）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "楽しみですね。",
        chinese: "很期待啊。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "そうですか。楽しみですねね。",
        chinese: "是吗。很期待啊。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l6_dlg_7": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「小野さんもどこかへ行きますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "小野さんもどこかへ行きますか。",
        chinese: "小野你也打算去哪儿吗？",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "小野さんもどこかへ行きる？",
        chinese: "小野你也打算去哪儿吗？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "小野さんもどこかへ行きますでしょうか。",
        chinese: "小野你也打算去哪儿吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l6_dlg_8": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 小野应答。A＝课文「私はまだ決めていません。温泉に行きた…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私はまだ決めていません。温泉に行きたいです。",
        chinese: "我还没定。想去泡温泉。",
        noteZh: "A 标准答（小野）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "温泉に行きたいです。",
        chinese: "想去泡温泉。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私はまだ決めていません。温泉に行きたいでございます。",
        chinese: "我还没定。想去泡温泉。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l6_dlg_9": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「箱根はどうですか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "箱根はどうですか。",
        chinese: "箱根怎么样？",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、箱根はどうですか。",
        chinese: "箱根怎么样？",
        noteZh: "B 同场景变体：节奏快、信息略减（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "箱根はどうでしょうか。",
        chinese: "箱根怎么样？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l6_dlg_10": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 小野应答。A＝课文「箱根もいいですね。ちょっと考えます。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "箱根もいいですね。ちょっと考えます。",
        chinese: "箱根也不错。我再想想。",
        noteZh: "A 标准答（小野）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ちょっと考えます。",
        chinese: "我再想想。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "箱根もいいですね。ちょっと考えますね。",
        chinese: "箱根也不错。我再想想。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l6_dlg_11": {
    abcGuideZh: "「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで · 李应答。A＝课文「じゃあ、また後で。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "じゃあ、また後で。",
        chinese: "那回头再说。",
        noteZh: "A 标准答（李）：「旅行の計画」· 旅行の計画 · 移动与へ/で/から/まで；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "また後で。",
        chinese: "那回头再说。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "じゃあ、また後でね。",
        chinese: "那回头再说。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
};

const L7_DIALOGUE_ABC = {
  "l7_dlg_1": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「すみません、ちょっとまだ… 李さん、…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "すみません、ちょっとまだ… 李さん、何にしますか。",
        chinese: "不好意思，还没……小李，你点什么？",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "すみません、ちょっとまだ… 李さん、何にしる？",
        chinese: "不好意思，还没……小李，你点什么？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "すみません、ちょっとまだ… 李さん、何にしますでしょうか。",
        chinese: "不好意思，还没……小李，你点什么？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_2": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 李应答。A＝课文「私はコーヒーにします。小野さんは？」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私はコーヒーにします。小野さんは？",
        chinese: "我点咖啡。小野呢？",
        noteZh: "A 标准答（李）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "小野さんは？",
        chinese: "小野呢？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私はコーヒーにします。小野さんはでしょうか。",
        chinese: "我点咖啡。小野呢？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l7_dlg_3": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「私は紅茶にします。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私は紅茶にします。",
        chinese: "我点红茶。",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "私は紅茶にしるよ。",
        chinese: "我点红茶。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（小野，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私は紅茶にしますね。",
        chinese: "我点红茶。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_4": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 店員应答。A＝课文「コーヒーと紅茶ですね。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "店員" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "コーヒーと紅茶ですね。",
        chinese: "咖啡和红茶是吧。",
        noteZh: "A 标准答（店員）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、コーヒーと紅茶ですね。",
        chinese: "咖啡和红茶是吧。",
        noteZh: "B 同场景变体：节奏快、信息略减（店員，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "コーヒーと紅茶ですねね。",
        chinese: "咖啡和红茶是吧。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（店員，非错答）.",
      },
    ],
  },
  "l7_dlg_5": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「はい。それと、ケーキもありますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "はい。それと、ケーキもありますか。",
        chinese: "嗯。还有蛋糕吗？",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "それと、ケーキもありますか。",
        chinese: "还有蛋糕吗。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "はい。それと、ケーキもありますでしょうか。",
        chinese: "嗯。还有蛋糕吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_6": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 店員应答。A＝课文「はい、あります。今日はチーズケーキと…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "店員" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "はい、あります。今日はチーズケーキとショートケーキです。",
        chinese: "有的。今天是芝士蛋糕和海绵蛋糕。",
        noteZh: "A 标准答（店員）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "今日はチーズケーキとショートケーキです。",
        chinese: "今天是芝士蛋糕和海绵蛋糕。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（店員，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "はい、あります。今日はチーズケーキとショートケーキでございます。",
        chinese: "有的。今天是芝士蛋糕和海绵蛋糕。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（店員，非错答）.",
      },
    ],
  },
  "l7_dlg_7": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「じゃあ、チーズケーキを一つください。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "じゃあ、チーズケーキを一つください。",
        chinese: "那请给我一个芝士蛋糕。",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "チーズケーキを一つください。",
        chinese: "那请给我一个芝士蛋糕。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "じゃあ、チーズケーキを一ついただけますでしょうか。",
        chinese: "那请给我一个芝士蛋糕。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_8": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 李应答。A＝课文「私は結構です。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私は結構です。",
        chinese: "我不用了。",
        noteZh: "A 标准答（李）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "私は結構だよ。",
        chinese: "我不用了。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（李，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私は結構でございます。",
        chinese: "我不用了。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l7_dlg_9": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 店員应答。A＝课文「かしこまりました。少々お待ちください…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "店員" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "かしこまりました。少々お待ちください。",
        chinese: "好的。请稍等。",
        noteZh: "A 标准答（店員）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "少々お待ちください。",
        chinese: "请稍等。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（店員，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "かしこまりました。少々お待ちいただけますでしょうか。",
        chinese: "好的。请稍等。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（店員，非错答）.",
      },
    ],
  },
  "l7_dlg_10": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · B应答。A＝课文「（数分後）」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "B" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "（数分後）",
        chinese: "（几分钟后）",
        noteZh: "A 标准答（B）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "（数分後）",
        chinese: "（几分钟后）",
        noteZh: "B 与课文同句：叙述/旁白块，三种选项均为跟读（非选答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "（数分後）",
        chinese: "（几分钟后）",
        noteZh: "C 与课文同句：叙述块跟读用.",
      },
    ],
  },
  "l7_dlg_11": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「李さんはよくカフェへ来ますか。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さんはよくカフェへ来ますか。",
        chinese: "小李常来咖啡馆吗？",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "李さんはよくカフェへ来る？",
        chinese: "小李常来咖啡馆吗？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さんはよくカフェへ来ますでしょうか。",
        chinese: "小李常来咖啡馆吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_12": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 李应答。A＝课文「いいえ、あまり来ません。小野さんは？」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いいえ、あまり来ません。小野さんは？",
        chinese: "不，不太来。小野呢？",
        noteZh: "A 标准答（李）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "小野さんは？",
        chinese: "小野呢？",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いいえ、あまり来ません。小野さんはでしょうか。",
        chinese: "不，不太来。小野呢？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l7_dlg_13": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「私はときどき来ます。ここは静かでいい…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "私はときどき来ます。ここは静かでいいですね。",
        chinese: "我偶尔来。这里很安静，不错。",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ここは静かでいいですね。",
        chinese: "这里很安静，不错。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "私はときどき来ます。ここは静かでいいですねね。",
        chinese: "我偶尔来。这里很安静，不错。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l7_dlg_14": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 李应答。A＝课文「そうですね。また一緒に来ましょう。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "そうですね。また一緒に来ましょう。",
        chinese: "是啊。下次一起来吧。",
        noteZh: "A 标准答（李）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "また一緒に来ましょう。",
        chinese: "下次一起来吧。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "そうですね。また一緒に来ましょうね。",
        chinese: "是啊。下次一起来吧。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l7_dlg_15": {
    abcGuideZh: "「カフェで注文」· カフェで注文 · を/にします/ください · 小野应答。A＝课文「はい、ぜひ。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "はい、ぜひ。",
        chinese: "好的，一定。",
        noteZh: "A 标准答（小野）：「カフェで注文」· カフェで注文 · を/にします/ください；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ぜひ。",
        chinese: "好的，一定。",
        noteZh: "B 同场景变体：节奏快、信息略减（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "はい、ぜひね。",
        chinese: "好的，一定。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
};

const L8_DIALOGUE_ABC = {
  "l8_dlg_1": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 小野应答。A＝课文「まあ、ありがとうございます。開けても…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "まあ、ありがとうございます。開けてもいいですか。",
        chinese: "哎呀，谢谢。可以打开吗？",
        noteZh: "A 标准答（小野）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "開けてもいいですか。",
        chinese: "可以打开吗。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "まあ、ありがとうございます。開けてもいいでしょうか。",
        chinese: "哎呀，谢谢。可以打开吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l8_dlg_2": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「はい、どうぞ。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "はい、どうぞ。",
        chinese: "嗯，请。",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "どうぞ。",
        chinese: "嗯，请。",
        noteZh: "B 同场景变体：节奏快、信息略减（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "はい、どうぞね。",
        chinese: "嗯，请。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l8_dlg_3": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 小野应答。A＝课文「わあ、きれいな箱ですね。何が入ってい…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "わあ、きれいな箱ですね。何が入っていますか。",
        chinese: "哇，盒子好漂亮。里面是什么？",
        noteZh: "A 标准答（小野）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "何が入っていますか。",
        chinese: "里面是什么。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "わあ、きれいな箱ですね。何が入っていますでしょうか。",
        chinese: "哇，盒子好漂亮。里面是什么？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l8_dlg_4": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「中にクッキーやキャンディなどが入って…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "中にクッキーやキャンディなどが入っています。",
        chinese: "里面有饼干、糖果等。",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "中にクッキーやキャンディなどが入っているよ。",
        chinese: "里面有饼干、糖果等。",
        noteZh: "B 口语体：です→だよ/るよ，轻松场合用（李，非错答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "中にクッキーやキャンディなどが入っていますね。",
        chinese: "里面有饼干、糖果等。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l8_dlg_5": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 小野应答。A＝课文「ありがとうございます。とても嬉しいで…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "ありがとうございます。とても嬉しいです。",
        chinese: "谢谢。非常高兴。",
        noteZh: "A 标准答（小野）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "とても嬉しいです。",
        chinese: "非常高兴。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "ありがとうございます。とても嬉しいです。心より感謝いたします。",
        chinese: "谢谢。非常高兴。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（小野，非错答）.",
      },
    ],
  },
  "l8_dlg_6": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「いいえ、どういたしまして。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "いいえ、どういたしまして。",
        chinese: "不客气。",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "どういたしまして。",
        chinese: "不客气。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "いいえ、どういたしましてね。",
        chinese: "不客气。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（李，非错答）.",
      },
    ],
  },
  "l8_dlg_7": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 森应答。A＝课文「李さん、先月はありがとうございました…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さん、先月はありがとうございました。私からもプレゼントです。",
        chinese: "小李，上个月谢谢你。我也送你礼物。",
        noteZh: "A 标准答（森）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "私からもプレゼントです。",
        chinese: "我也送你礼物。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さん、先月はありがとうございますございました。私からもプレゼントです。",
        chinese: "小李，上个月谢谢你。我也送你礼物。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（森，非错答）.",
      },
    ],
  },
  "l8_dlg_8": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「えっ、いいんですか。開けてもいいです…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "えっ、いいんですか。開けてもいいですか。",
        chinese: "诶，可以吗。可以打开吗？",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "開けてもいいですか。",
        chinese: "可以打开吗。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "えっ、いいんですか。開けてもいいでしょうか。",
        chinese: "诶，可以吗。可以打开吗？",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l8_dlg_9": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 森应答。A＝课文「もちろん。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "もちろん。",
        chinese: "当然。",
        noteZh: "A 标准答（森）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、もちろん。",
        chinese: "当然。",
        noteZh: "B 同场景变体：节奏快、信息略减（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "もちろんね。",
        chinese: "当然。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（森，非错答）.",
      },
    ],
  },
  "l8_dlg_10": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「あっ、日本の文房具ですね。とても便利…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "あっ、日本の文房具ですね。とても便利そうです。",
        chinese: "啊，是日本的文具。看起来很实用。",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "とても便利そうです。",
        chinese: "看起来很实用。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "あっ、日本の文房具ですね。とても便利そうでございます。",
        chinese: "啊，是日本的文具。看起来很实用。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l8_dlg_11": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 森应答。A＝课文「どうぞ使ってください。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "どうぞ使ってください。",
        chinese: "请用吧。",
        noteZh: "A 标准答（森）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "どうぞ使ってちょうだい。",
        chinese: "请用吧。",
        noteZh: "B 同场景变体：节奏快、信息略减（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "どうぞ使っていただけますでしょうか。",
        chinese: "请用吧。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（森，非错答）.",
      },
    ],
  },
  "l8_dlg_12": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 李应答。A＝课文「森さん、小野さん、本当にありがとうご…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "李" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "森さん、小野さん、本当にありがとうございました。",
        chinese: "森先生、小野，真的非常感谢。",
        noteZh: "A 标准答（李）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、森さん、小野さん、本当にありがとうございました。",
        chinese: "森先生、小野，真的非常感谢。",
        noteZh: "B 同场景变体：节奏快、信息略减（李，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "森さん、小野さん、本当にありがとうございますございました。",
        chinese: "森先生、小野，真的非常感谢。",
        noteZh: "C 更礼貌：对上级/客户或正式场合可选（李，非错答）.",
      },
    ],
  },
  "l8_dlg_13": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · B应答。A＝课文「（後日、李からお礼の手紙を書くシーン…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "B" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "（後日、李からお礼の手紙を書くシーン）",
        chinese: "（日后，小李写感谢信的场景）",
        noteZh: "A 标准答（B）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "（後日、李からお礼の手紙を書くシーン）",
        chinese: "（日后，小李写感谢信的场景）",
        noteZh: "B 与课文同句：叙述/旁白块，三种选项均为跟读（非选答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "（後日、李からお礼の手紙を書くシーン）",
        chinese: "（日后，小李写感谢信的场景）",
        noteZh: "C 与课文同句：叙述块跟读用.",
      },
    ],
  },
  "l8_dlg_14": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · B应答。A＝课文「李（ナレーション）：小野さんと森さん…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "B" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李（ナレーション）：小野さんと森さんに、日本語でお礼の手紙を書きます。",
        chinese: "李（旁白）：给小野和森写日语感谢信。",
        noteZh: "A 标准答（B）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "李（ナレーション）：小野さんと森さんに、日本語でお礼の手紙を書きます。",
        chinese: "李（旁白）：给小野和森写日语感谢信。",
        noteZh: "B 与课文同句：叙述/旁白块，三种选项均为跟读（非选答）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李（ナレーション）：小野さんと森さんに、日本語でお礼の手紙を書きます。",
        chinese: "李（旁白）：给小野和森写日语感谢信。",
        noteZh: "C 与课文同句：叙述块跟读用.",
      },
    ],
  },
  "l8_dlg_15": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 小野应答。A＝课文「李さんから手紙が来ました。日本語で書…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さんから手紙が来ました。日本語で書いてありますね。",
        chinese: "小李来信了。是用日语写的呢。",
        noteZh: "A 标准答（小野）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "日本語で書いてありますね。",
        chinese: "是用日语写的呢。",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さんから手紙が来ました。日本語で書いてありますねね。",
        chinese: "小李来信了。是用日语写的呢。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
  "l8_dlg_16": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 森应答。A＝课文「読みましょう。『お世話になりました。…」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "森" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "読みましょう。『お世話になりました。日本でとても楽しかったです。また会いましょう。』",
        chinese: "我们来读吧。「承蒙关照。在日本很开心。再会吧。」",
        noteZh: "A 标准答（森）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "読みましょう。『お世話になりました。』",
        chinese: "我们来读吧。「承蒙关照。在日本很开心。再会吧。」",
        noteZh: "B 更短：省略前半或应答词，同事间接上文时用（森，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "読みましょう。『お世話になりました。日本でとても楽しかったです。また会いましょう。』ね",
        chinese: "我们来读吧。「承蒙关照。在日本很开心。再会吧。」",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（森，非错答）.",
      },
    ],
  },
  "l8_dlg_17": {
    abcGuideZh: "「プレゼントを渡す」· プレゼント · 授受动词 · 小野应答。A＝课文「李さんは日本語が上手ですね。」；B＝同场景口语/缩短；C＝更礼貌或郑重。",
    userTurn: { speaker: "小野" },
    replies: [
      {
        label: "A",
        rank: 1,
        japanese: "李さんは日本語が上手ですね。",
        chinese: "小李日语真好啊。",
        noteZh: "A 标准答（小野）：「プレゼントを渡す」· プレゼント · 授受动词；与教材会話一致.",
      },
      {
        label: "B",
        rank: 2,
        japanese: "ええ、李さんは日本語が上手ですね。",
        chinese: "小李日语真好啊。",
        noteZh: "B 同场景变体：节奏快、信息略减（小野，可沟通）.",
      },
      {
        label: "C",
        rank: 3,
        japanese: "李さんは日本語が上手ですねね。",
        chinese: "小李日语真好啊。",
        noteZh: "C 语气更软：句末「ね」等，缓和确认时用（小野，非错答）.",
      },
    ],
  },
};


const UNIT2_DIALOGUE_ABC_BY_LESSON = {
  5: L5_DIALOGUE_ABC,
  6: L6_DIALOGUE_ABC,
  7: L7_DIALOGUE_ABC,
  8: L8_DIALOGUE_ABC,
};

/** 合并第5–8课课文对话与 ABC 扩展 */
function applyUnit2DialogueAbc(lessonId, dialogues) {
  const map = UNIT2_DIALOGUE_ABC_BY_LESSON[Number(lessonId)];
  if (!map || !Array.isArray(dialogues)) return dialogues;
  return dialogues.map((d) => {
    const ext = map[d.id];
    if (!ext) return d;
    const opener = {
      ...d.opener,
      ...(ext.opener || {}),
      chinese: ext.openerZh || d.opener?.chinese || "",
    };
    const userTurn = {
      ...d.userTurn,
      ...ext.userTurn,
      replies: ext.replies || d.userTurn?.replies || [],
    };
    return {
      ...d,
      abcGuideZh: ext.abcGuideZh,
      userTurn,
      opener,
    };
  });
}

