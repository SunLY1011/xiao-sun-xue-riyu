/** PRD V1.0：第13–20課（MVP 8課）· 四関 · 日本語データ */
const LESSONS_MVP = [
  {
    lessonId: 14,
    lessonTitle: "昨日デパートへ行って、買い物をしました",
    lessonTitleRuby: [
      { kanji: "昨日", reading: "きのう" },
      { kanji: "行", reading: "い" },
      { kanji: "買", reading: "か" },
      { kanji: "物", reading: "もの" },
    ],
    theme: "買い物と日常",
    themeZh: "购物与日常活动",
    grammarNodes: [
      {
        id: "l14_teform",
        title: "動詞のて形",
        titleZh: "动词て形",
        titleRuby: [{ kanji: "動詞", reading: "どうし" }, { kanji: "形", reading: "けい" }],
        explanation:
          "動詞のて形は、文と文をつなぐときに使う形です。動詞のグループによって作り方が変わります。",
        example: "書く→書いて、待つ→待って、読む→読んで、食べる→食べて、する→して、来る→来て",
        links: [
          { type: "prerequisite", label: "📖 前：ます形（第5課）", miniCardKey: "masu_kei" },
          { type: "extension", label: "🔗 後：形容詞のて形（第16課）", targetNodeId: "l16_adj_teform", miniCardKey: "adj_te_l16" },
          { type: "extension", label: "🔗 後：た形", miniCardKey: "ta_kei" },
        ],
        tags: ["#動詞活用", "#接続の基本"],
      },
      {
        id: "l14_tekudasai",
        title: "～てください",
        titleZh: "请～",
        explanation:
          "だれかに何かをしてほしいときに使います。「～て」だけだと友だちことば、「～てください」はていねいです。",
        example: "ちょっと待ってください。",
        links: [
          { type: "prerequisite", label: "📖 前：動詞のて形", targetNodeId: "l14_teform" },
          { type: "extension", label: "🔗 後：～ないでください（第19課）", miniCardKey: "nai_de_kudasai_l19" },
        ],
        tags: ["#依頼", "#ていねい"],
      },
      {
        id: "l14_tekara",
        title: "～てから",
        titleZh: "做完再～",
        explanation: "まずAをする。そのあとでBをする。順番をはっきり言いたいときに使います。",
        example: "家へ帰ってから、勉強します。",
        exampleRuby: [
          { kanji: "家", reading: "いえ" },
          { kanji: "帰", reading: "かえ" },
          { kanji: "勉強", reading: "べんきょう" },
        ],
        links: [
          { type: "prerequisite", label: "📖 前：動詞のて形", targetNodeId: "l14_teform" },
          { type: "contrast", label: "⚠️ 比：～たあとで（第22課）", miniCardKey: "ta_atode_l22" },
        ],
        tags: ["#順番", "#時間"],
      },
      {
        id: "l14_teiru_action",
        title: "～ています（動作の進行）",
        titleZh: "正在进行",
        explanation: "今、まさにしていることを言うときに使います。",
        example: "今、手紙を書いています。",
        exampleRuby: [
          { kanji: "手紙", reading: "てがみ" },
          { kanji: "書", reading: "か" },
        ],
        extensions: [{ jp: "手紙", zh: "信" }],
        links: [
          { type: "prerequisite", label: "📖 前：動詞のて形", targetNodeId: "l14_teform" },
          {
            type: "contrast",
            label: "⚠️ 比：〜ています（結果の状態）",
            targetNodeId: "l16_teiru_result",
            contrastWith: "l14_teiru_action",
          },
        ],
        tags: ["#進行中", "#今"],
      },
      {
        id: "l14_mashouka",
        title: "～ましょうか",
        titleZh: "我来帮你～吗",
        explanation:
          "「私がしましょうか？」と申し出るときの言い方。「〜ましょう」よりやさしい感じ。「か」がつくので、相手が「いいえ」と言えます。",
        example: "傘を貸しましょうか。",
        exampleRuby: [{ kanji: "傘", reading: "かさ" }, { kanji: "貸", reading: "か" }],
        links: [
          { type: "prerequisite", label: "📖 前：ます形（第5課）", miniCardKey: "masu_kei" },
          {
            type: "contrast",
            label: "⚠️ 比：〜ましょう vs 〜ましょうか",
            contrastPair: ["〜ましょう（いっしょに）", "〜ましょうか（私が）"],
          },
        ],
        tags: ["#申し出", "#親切"],
      },
    ],
    dialogues: [
      {
        id: "l14_dialogue",
        title: "買い物のあとで",
        opener: {
          speaker: "A",
          japanese: "昨日デパートへ行って、買い物をしました。",
          japaneseRuby: [
            { kanji: "昨日", reading: "きのう" },
            { kanji: "買", reading: "か" },
            { kanji: "物", reading: "もの" },
          ],
          chinese: "昨天去百货商场买东西了。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "いいですね。何を買いましたか。",
              japaneseRuby: [{ kanji: "何", reading: "なに" }, { kanji: "買", reading: "か" }],
              chinese: "真好啊。买了什么？",
              noteJa: "「いいですね」＋質問。まずほめてから聞くと、会話が自然に続く。",
              noteZh: "先夸奖再提问，比直接问更柔和自然。",
            },
            {
              japanese: "そうですか。私も行きたいです。",
              japaneseRuby: [{ kanji: "私", reading: "わたし" }, { kanji: "行", reading: "い" }],
              chinese: "是吗。我也想去。",
              noteJa: "「そうだったんですか」＝知らなかった気持ち。「行きたかった」で本当は行けなかったことを言える。",
              noteZh: "表示事先不知道，并说自己其实想去。",
            },
            {
              japanese: "デパートですか。どこのですか。",
              chinese: "百货商店吗？哪一家的？",
              noteJa: "「へえ」で興味。「どこの」＋「今度行ってみたい」で話を広げる。",
              noteZh: "表示兴趣，追问地点并表达自己也想去。",
            },
          ],
        },
      },
    ],
    quizQuestions: [
      {
        id: "l14_q1",
        type: "fill",
        question: "今、手紙を＿＿＿。（書く）",
        answer: "書いています",
        explanation: "「今」があるから「〜ています」を使う。",
        grammarNodeId: "l14_teiru_action",
      },
      {
        id: "l14_q2",
        type: "choice",
        question: "一緒に映画を見＿＿＿。",
        options: ["ませんか", "ましょうか", "てください", "ています"],
        answer: 0,
        explanation: "「ませんか」は一緒に何かをしようと誘うときに使う。",
        grammarNodeId: "l14_mashouka",
      },
      {
        id: "l14_q3",
        type: "fill",
        question: "ちょっと待って＿＿＿。",
        answer: "ください",
        explanation: "「〜てください」で「お願いします」の意味。",
        grammarNodeId: "l14_tekudasai",
      },
      {
        id: "l14_q4",
        type: "choice",
        question: "家へ＿＿＿から、勉強します。",
        options: ["帰る", "帰って", "帰った", "帰ります"],
        answer: 1,
        explanation: "「〜てから」の前はて形。「帰る」→「帰って」。",
        grammarNodeId: "l14_tekara",
      },
    ],
  },
  {
    lessonId: 16,
    lessonTitle: "ホテルの部屋は広くて明るいです",
    lessonTitleRuby: [
      { kanji: "部屋", reading: "へや" },
      { kanji: "広", reading: "ひろ" },
      { kanji: "明", reading: "あか" },
    ],
    theme: "様子の説明",
    themeZh: "描述物体与人物特征",
    grammarNodes: [
      {
        id: "l16_adj_teform",
        title: "形容詞のて形",
        titleZh: "形容词て形",
        explanation:
          "イ形容詞は「い」を「くて」に、ナ形容詞は「だ」を「で」に変えます。いくつもの形容詞をつなげられます。",
        example: "この部屋は広くて明るいです。",
        exampleRuby: [{ kanji: "広", reading: "ひろ" }, { kanji: "明", reading: "あか" }],
        links: [
          { type: "prerequisite", label: "📖 前：動詞のて形（第14課）", targetNodeId: "l14_teform", miniCardKey: "te_kei_l14" },
          { type: "extension", label: "🔗 後：名詞のて形（第17課）", miniCardKey: "meishi_te_l17" },
        ],
        tags: ["#形容詞", "#並列"],
      },
      {
        id: "l16_ga",
        title: "～が、～",
        titleZh: "虽然…但是",
        explanation: "「でも」より少しやわらかい言い方。前と後ろが反対のことや、ただの前置きのときもあります。",
        example: "日本語は難しいですが、面白いです。",
        exampleRuby: [{ kanji: "日本語", reading: "にほんご" }, { kanji: "難", reading: "むずか" }, { kanji: "面白", reading: "おもしろ" }],
        links: [{ type: "contrast", label: "⚠️ 比：〜けど（カジュアル）", contrastPair: ["〜が（ていねい）", "〜けど（友だち）"] }],
        tags: ["#逆接", "#前置き"],
      },
      {
        id: "l16_teiru_result",
        title: "～ています（結果の状態）",
        titleZh: "结果状态",
        explanation:
          "何かが起こって、その結果が今も見えているときに使います。「自動詞＋ている」が多い。誰がやったかは言わず、今の状態だけ。",
        example: "窓が割れています。",
        exampleRuby: [{ kanji: "窓", reading: "まど" }, { kanji: "割", reading: "わ" }],
        extensions: [{ jp: "割れる", zh: "破裂（自动）" }],
        core: true,
        links: [
          { type: "prerequisite", label: "📖 前：動詞のて形（第14課）", targetNodeId: "l14_teform", miniCardKey: "te_kei_l14" },
          {
            type: "contrast",
            label: "⚠️ 比：動作の進行 vs 結果の状態",
            targetNodeId: "l14_teiru_action",
            contrastWith: "l16_teiru_result",
          },
          { type: "extension", label: "🔗 後：自動詞・他動詞（第18課）", targetNodeId: "l18_transitivity", miniCardKey: "jidoushi_tadoushi" },
        ],
        tags: ["#状態", "#自動詞"],
      },
      {
        id: "l16_de_cause",
        title: "～で（原因）",
        titleZh: "因为（客观）",
        explanation:
          "名詞のあとにつけて「〜が理由で」と言う。病気や天気など、自分ではコントロールできないことに使うことが多い。",
        example: "風邪で学校を休みました。",
        exampleRuby: [{ kanji: "風邪", reading: "かぜ" }, { kanji: "学校", reading: "がっこう" }, { kanji: "休", reading: "やす" }],
        links: [
          {
            type: "contrast",
            label: "⚠️ 比：〜から vs 〜で",
            contrastPair: ["〜から（気持ち・判断）", "〜で（客観的な原因）"],
          },
        ],
        tags: ["#原因", "#理由"],
      },
      {
        id: "l16_toiu",
        title: "～という～",
        titleZh: "叫…的",
        explanation: "相手が知らない名前やことばを紹介するときに使います。",
        example: "それは「さくら」という花です。",
        exampleRuby: [{ kanji: "花", reading: "はな" }],
        links: [
          {
            type: "contrast",
            label: "⚠️ 比：〜と言う vs 〜という",
            contrastPair: ["〜と言う（そのまま引用）", "〜という（名前の説明）"],
          },
        ],
        tags: ["#名前", "#説明"],
      },
    ],
    dialogues: [
      {
        id: "l16_dialogue",
        title: "ホテルの感想",
        opener: {
          speaker: "A",
          japanese: "ホテルの部屋はどうでしたか。",
          japaneseRuby: [{ kanji: "部屋", reading: "へや" }],
          chinese: "酒店的房间怎么样？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "広くて、とてもきれいでした。でも、ちょっと高かったです。",
              japaneseRuby: [{ kanji: "広", reading: "ひろ" }, { kanji: "高", reading: "たか" }],
              chinese: "宽敞漂亮，但有点贵。",
              noteJa: "良い点＋「でも」＋悪い点。誠実な言い方。",
              noteZh: "优点+转折+缺点，平衡表达。",
            },
            {
              japanese: "思ったより広くて、快適でした。また泊まりたいです。",
              japaneseRuby: [{ kanji: "思", reading: "おも" }, { kanji: "広", reading: "ひろ" }, { kanji: "泊", reading: "と" }],
              chinese: "比想象中宽敞舒适，还想再住。",
              noteJa: "予想との比較＋感想＋次の希望。「思ったより」は日常会話でよく使う。",
              noteZh: "对比预期+好感+收尾愿望。",
            },
            {
              japanese: "まあまあでした。駅からちょっと遠かったけど、静かでよかったです。",
              japaneseRuby: [{ kanji: "駅", reading: "えき" }, { kanji: "遠", reading: "とお" }, { kanji: "静", reading: "しず" }],
              chinese: "还行，离车站稍远但安静。",
              noteJa: "あいまい評価＋具体的な長所短所。「まあまあ」は悪くないけど特別すごくもない。",
              noteZh: "模糊评价+具体长短处，不夸张。",
            },
          ],
        },
      },
    ],
    quizQuestions: [
      {
        id: "l16_q1",
        type: "choice",
        question: "この部屋は＿＿＿明るいです。",
        options: ["広い", "広くて", "広く", "広いで"],
        answer: 1,
        explanation: "イ形容詞＋て形は「い」→「くて」。",
        grammarNodeId: "l16_adj_teform",
      },
      {
        id: "l16_q2",
        type: "choice",
        question: "窓が＿＿＿。",
        options: ["割る", "割っている", "割れている", "割った"],
        answer: 2,
        explanation: "結果の状態は自動詞＋ている。",
        grammarNodeId: "l16_teiru_result",
      },
      {
        id: "l16_q3",
        type: "fill",
        question: "風邪＿＿＿学校を休みました。",
        answer: "で",
        explanation: "名詞のあとに「で」を付けて、客観的な原因を表します。",
        grammarNodeId: "l16_de_cause",
      },
    ],
  },
  {
    lessonId: 18,
    lessonTitle: "携帯電話はとても小さくなりました",
    lessonTitleRuby: [
      { kanji: "携帯", reading: "けいたい" },
      { kanji: "電話", reading: "でんわ" },
      { kanji: "小", reading: "ちい" },
    ],
    theme: "変化と決断",
    themeZh: "变化与自我决定",
    grammarNodes: [
      {
        id: "l18_naru",
        title: "～になる（自然の変化）",
        titleZh: "变得（自然）",
        titleSpeak: "なる",
        titleKana: "なる",
        titleRuby: [
          { kanji: "自然", reading: "しぜん" },
          { kanji: "変化", reading: "へんか" },
        ],
        explanation: "自然に、ひとりでに変わること。イ形容詞は「い」→「く」＋なる。ナ形容詞は「に」＋なる。",
        example: "寒くなりました。元気になりました。",
        exampleZh: "变冷了。／变得有精神了。",
        exampleRuby: [{ kanji: "寒", reading: "さむ" }, { kanji: "元気", reading: "げんき" }],
        links: [
          {
            type: "contrast",
            label: "⚠️ 比：〜なる vs 〜する",
            targetNodeId: "l18_suru",
            contrastWith: "l18_naru",
          },
        ],
        tags: ["#変化", "#自然"],
      },
      {
        id: "l18_suru",
        title: "～する（人が変える）",
        titleZh: "把…弄成",
        explanation: "人がわざと変えるとき。イ形容詞は「く」＋する。ナ形容詞は「に」＋する。",
        example: "部屋をきれいにします。",
        exampleRuby: [{ kanji: "部屋", reading: "へや" }, { kanji: "綺麗", reading: "きれい" }],
        links: [
          {
            type: "contrast",
            label: "⚠️ 比：〜なる vs 〜する",
            targetNodeId: "l18_naru",
            contrastWith: "l18_suru",
          },
          { type: "extension", label: "🔗 後：〜ことにする（第25課）", miniCardKey: "koto_ni_suru_l25" },
        ],
        tags: ["#変化", "#意志"],
      },
      {
        id: "l18_transitivity",
        title: "自動詞と他動詞",
        titleZh: "自他动词",
        explanation:
          "自動詞は「〜が＋自動詞」、ものが自分で変わる感じ。他動詞は「〜を＋他動詞」、人が動かす・変える。ペアで覚えると便利。",
        example: "ドアが開く（自動詞）／ドアを開ける（他動詞）",
        exampleRuby: [{ kanji: "開", reading: "あ" }],
        links: [
          { type: "prerequisite", label: "📖 前：〜ています（結果の状態）", targetNodeId: "l16_teiru_result" },
          {
            type: "contrast",
            label: "⚠️ 比：自動詞＋ている vs 他動詞＋ている",
            contrastPair: ["自動詞＋ている（状態）", "他動詞＋ている（進行）"],
          },
        ],
        tags: ["#自動詞", "#他動詞"],
      },
      {
        id: "l18_hougaii",
        title: "～ほうがいい",
        titleZh: "最好…",
        explanation: "「こっちの方がいいですよ」とアドバイス。動詞のた形につける。",
        example: "早く寝たほうがいいです。",
        exampleRuby: [{ kanji: "早", reading: "はや" }, { kanji: "寝", reading: "ね" }],
        links: [
          { type: "prerequisite", label: "📖 前：動詞のた形", miniCardKey: "ta_kei" },
          { type: "extension", label: "🔗 後：〜たらいい（第24課）", miniCardKey: "hou_ga_ii_l24" },
        ],
        tags: ["#助言", "#アドバイス"],
      },
      {
        id: "l18_deshou",
        title: "～でしょう／～かもしれません",
        titleZh: "大概/也许",
        explanation:
          "確かじゃないけど「たぶん〜」。「でしょう」の方が自信がある。「かもしれません」は「もしかしたら」。",
        example: "明日は雨でしょう。遅れるかもしれません。",
        exampleRuby: [{ kanji: "明日", reading: "あした" }, { kanji: "雨", reading: "あめ" }, { kanji: "遅", reading: "おく" }],
        links: [
          {
            type: "contrast",
            label: "⚠️ 比：でしょう vs かもしれません",
            contrastPair: ["でしょう（たぶんそう）", "かもしれません（わからない）"],
          },
        ],
        tags: ["#推測", "#不確か"],
      },
    ],
    dialogues: [
      {
        id: "l18_dialogue",
        title: "最近の変化",
        opener: {
          speaker: "A",
          japanese: "最近、携帯電話はとても小さくなりましたね。",
          japaneseRuby: [
            { kanji: "最近", reading: "さいきん" },
            { kanji: "携帯", reading: "けいたい" },
            { kanji: "電話", reading: "でんわ" },
            { kanji: "小", reading: "ちい" },
          ],
          chinese: "最近手机变得很小了呢。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "ええ、そして機能も多くなりました。でも、私は大きい画面のほうがいいです。",
              japaneseRuby: [{ kanji: "機能", reading: "きのう" }, { kanji: "私", reading: "わたし" }, { kanji: "画面", reading: "がめん" }],
              chinese: "是啊功能多了，但我更喜欢大屏幕。",
              noteJa: "同意＋追加＋自分の意見。「〜のほうがいい」で好みを言う。",
              noteZh: "同意+补充+个人偏好。",
            },
            {
              japanese: "そうですね。小さすぎると、見にくいかもしれませんね。",
              japaneseRuby: [{ kanji: "見", reading: "み" }],
              chinese: "是啊，太小可能看不清。",
              noteJa: "同意＋心配の推測。「かもしれません」で断定しない。",
              noteZh: "同意+委婉推测，语气柔和。",
            },
            {
              japanese: "本当に。技術の進歩はすごいですね。でも私は古い大きい携帯のほうが使いやすいです。",
              japaneseRuby: [{ kanji: "技術", reading: "ぎじゅつ" }, { kanji: "進歩", reading: "しんぽ" }, { kanji: "使", reading: "つか" }],
              chinese: "真的，技术进步厉害，但我更爱用老款大屏手机。",
              noteJa: "強い共感＋感想＋自分の基準。「本当に」は「ええ」より強め。",
              noteZh: "强共感+评价+使用习惯理由。",
            },
          ],
        },
      },
    ],
    quizQuestions: [
      {
        id: "l18_q1",
        type: "choice",
        question: "部屋を＿＿＿します。",
        options: ["きれい", "きれいに", "きれく", "きれいになる"],
        answer: 1,
        explanation: "ナ形容詞＋にする。人が変える意味。",
        grammarNodeId: "l18_suru",
      },
      {
        id: "l18_q2",
        type: "choice",
        question: "寒く＿＿＿ね。",
        options: ["します", "なりました", "しました", "なる"],
        answer: 1,
        explanation: "自然に変わるので「なる」。",
        grammarNodeId: "l18_naru",
      },
      {
        id: "l18_q3",
        type: "choice",
        question: "明日は雨＿＿＿。",
        options: ["かもしれません", "でしょう", "ほうがいい", "なります"],
        answer: 1,
        explanation: "推測は「でしょう」。",
        grammarNodeId: "l18_deshou",
      },
    ],
  },
];

function mergeStageLessonsIntoMvp(stageList) {
  if (!Array.isArray(stageList)) return;
  stageList.forEach((lesson) => {
    const idx = LESSONS_MVP.findIndex((x) => x.lessonId === lesson.lessonId);
    if (idx >= 0) LESSONS_MVP[idx] = lesson;
    else LESSONS_MVP.push(lesson);
  });
  LESSONS_MVP.sort((a, b) => a.lessonId - b.lessonId);
}

if (typeof LESSONS_STAGE2_MVP !== "undefined") mergeStageLessonsIntoMvp(LESSONS_STAGE2_MVP);
if (typeof LESSONS_PRD_UNRELEASED_MVP !== "undefined") mergeStageLessonsIntoMvp(LESSONS_PRD_UNRELEASED_MVP);

const LINK_STYLES = {
  prerequisite: { color: "#4A90D9", icon: "📖" },
  contrast: { color: "#E53935", icon: "⚠️" },
  extension: { color: "#43A047", icon: "🔗" },
  scene: { color: "#9E9E9E", icon: "🏷️" },
};

const CONTRAST_PRESETS = {
  "l14_teiru_action+l16_teiru_result": {
    title: "〜ている：動作の進行 vs 結果の状態",
    left: {
      label: "動作の進行（第14課）",
      pattern: "動詞て形 ＋ います",
      timeline: "●———→ 今（まだしている）",
      example: "今、手紙を書いています。",
      exampleZh: "现在正在写信。",
      mistake: "× 窓が割れています（状態は結果の「ている」）",
    },
    right: {
      label: "結果の状態（第16課）★",
      pattern: "自動詞て形 ＋ います",
      timeline: "●起きた ———→ 今もその状態",
      example: "窓が割れています。",
      exampleZh: "窗户破了（状态还在）。",
      mistake: "× 今、手紙を書いています（今しているは進行）",
    },
  },
  "l17_hoshii+l17_tai": {
    title: "〜がほしい vs 〜たい",
    left: {
      label: "がほしい（名詞）",
      pattern: "名詞 ＋ がほしい",
      timeline: "欲しいもの",
      example: "新しい洋服がほしいです。",
      exampleZh: "想要新衣服。",
      mistake: "× 日本へ行きがほしい",
    },
    right: {
      label: "たい（動作）",
      pattern: "ます形−ます ＋ たい",
      timeline: "したいこと",
      example: "日本へ行きたいです。",
      exampleZh: "想去日本。",
      mistake: "× 靴を行きたい",
    },
  },
  "l18_naru+l18_suru": {
    title: "〜なる vs 〜する",
    left: {
      label: "〜なる（自然の変化）",
      pattern: "イ形「く」＋なる／ナ形「に」＋なる",
      timeline: "自分で変わる",
      example: "携帯電話は小さくなりました。",
      exampleZh: "手机变小了。",
      mistake: "× 部屋をきれいになります（人が変えるは「する」）",
    },
    right: {
      label: "〜する（人が変える）",
      pattern: "イ形「く」＋する／ナ形「に」＋する",
      timeline: "人が変える",
      example: "部屋をきれいにします。",
      exampleZh: "把房间弄干净。",
      mistake: "× 寒くします（天気は自然に「なる」）",
    },
  },
};

function getLessonMvp(id) {
  return LESSONS_MVP.find((l) => l.lessonId === Number(id));
}

function findNodeAcrossLessons(nodeId) {
  for (const lesson of LESSONS_MVP) {
    const node = lesson.grammarNodes.find((n) => n.id === nodeId);
    if (node) return { lesson, node };
  }
  return null;
}
