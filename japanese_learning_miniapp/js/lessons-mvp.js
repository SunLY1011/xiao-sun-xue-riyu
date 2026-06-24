/** PRD V1.0：第14/16/18课 · 一课三关 */
const LESSONS_MVP = [
  {
    lessonId: 14,
    lessonTitle: "昨日デパートへ行って、買い物しました",
    theme: "购物与日常活动",
    grammarNodes: [
      {
        id: "l14_teform",
        title: "动词て形",
        explanation: "动词て形是连接形式。一类动词变化最复杂，需特别记忆。",
        example: "書く→書いて、待つ→待って、読む→読んで",
        exampleTranslation: "写→写着、等→等着、读→读着",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词ます形（第5课）", targetNodeId: null, external: "第5课" },
          { type: "extension", label: "🔗 延伸：形容词て形（第16课）", targetNodeId: "l16_adj_teform" },
          { type: "extension", label: "🔗 延伸：た形（规则相同）", targetNodeId: null, external: "た形" },
        ],
        tags: ["#动词变形", "#基础语法"],
      },
      {
        id: "l14_tekudasai",
        title: "～てください",
        explanation: "请别人做某事。对长辈用，好朋友可省略ください。",
        example: "ちょっと待ってください。",
        exampleTranslation: "请稍等一下。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词て形", targetNodeId: "l14_teform" },
          { type: "extension", label: "🔗 延伸：～てくださいませんか（第20课）", targetNodeId: null, external: "第20课" },
        ],
        tags: ["#请求", "#礼貌表达"],
      },
      {
        id: "l14_tekara",
        title: "～てから",
        explanation: "做完一件事后再做另一件事，强调顺序。",
        example: "家へ帰ってから、勉強します。",
        exampleTranslation: "回家之后再学习。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词て形", targetNodeId: "l14_teform" },
          { type: "contrast", label: "⚠️ 辨析：～たあとで（第22课）", targetNodeId: null, external: "第22课" },
        ],
        tags: ["#时间顺序", "#动作先后"],
      },
      {
        id: "l14_teiru_action",
        title: "～ています（动作进行）",
        explanation: "正在做某事。动词て形+います。",
        example: "今、手紙を書いています。",
        exampleTranslation: "现在正在写信。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词て形", targetNodeId: "l14_teform" },
          { type: "contrast", label: "⚠️ 辨析：动作进行 vs 结果状态", targetNodeId: "l16_teiru_result", contrastWith: "l14_teiru_action" },
        ],
        tags: ["#动作进行", "#正在进行"],
      },
      {
        id: "l14_mashouka",
        title: "～ましょうか",
        explanation: "主动提出为对方做某事，用「か」给对方拒绝余地。",
        example: "傘を貸しましょうか。",
        exampleTranslation: "要不要借你伞？",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词ます形（第5课）", targetNodeId: null, external: "第5课" },
          { type: "contrast", label: "⚠️ 辨析：～ましょう vs ～ましょうか", targetNodeId: "l14_mashouka", contrastPair: ["～ましょう（一起做）", "～ましょうか（我帮你做）"] },
        ],
        tags: ["#提议", "#帮助"],
      },
    ],
    dialogues: [
      {
        id: "l14_dialogue",
        title: "购物归来",
        lines: [
          { speaker: "A", japanese: "昨日デパートへ行って、買い物しました。", chinese: "昨天去百货商场买东西了。" },
          { speaker: "B", japanese: "何を買いましたか。", chinese: "买了什么？" },
          { speaker: "A", japanese: "靴と鞄を買いました。とても安かったです。", chinese: "买了鞋和包。很便宜。" },
          { speaker: "B", japanese: "いいですね。", chinese: "真好啊。" },
        ],
      },
    ],
    quizQuestions: [
      {
        id: "l14_q1",
        type: "fill",
        question: "今、手紙を＿＿＿。（書く）",
        answer: "書いています",
        explanation: "「書く」的て形是「書いて」，加上「います」表示正在写。",
        grammarNodeId: "l14_teiru_action",
      },
      {
        id: "l14_q2",
        type: "choice",
        question: "一緒に映画を見＿＿＿。",
        options: ["ませんか", "ましょうか", "てください", "ています"],
        answer: 0,
        explanation: "「ませんか」用于邀请对方一起做某事。",
        grammarNodeId: "l14_mashouka",
      },
      {
        id: "l14_q3",
        type: "fill",
        question: "ちょっと待って＿＿＿。",
        answer: "ください",
        explanation: "「～てください」表示请求对方做某事。",
        grammarNodeId: "l14_tekudasai",
      },
      {
        id: "l14_q4",
        type: "choice",
        question: "家へ＿＿＿から、勉強します。",
        options: ["帰る", "帰って", "帰った", "帰ります"],
        answer: 1,
        explanation: "「～てから」前面用て形，表示做完A再做B。",
        grammarNodeId: "l14_tekara",
      },
    ],
  },
  {
    lessonId: 16,
    lessonTitle: "ホテルの部屋は広くて明るいです",
    theme: "描述物体与人物特征",
    grammarNodes: [
      {
        id: "l16_adj_teform",
        title: "形容词て形",
        explanation: "イ形容词い→くて，ナ形容词だ→で，可串多个形容词。",
        example: "この部屋は広くて明るいです。",
        exampleTranslation: "这个房间又宽敞又明亮。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词て形（第14课）", targetNodeId: "l14_teform" },
          { type: "extension", label: "🔗 延伸：名词て形（第17课）", targetNodeId: null, external: "第17课" },
        ],
        tags: ["#形容词", "#并列", "#描述"],
      },
      {
        id: "l16_ga",
        title: "～が、～",
        explanation: "轻微转折或铺垫，不一定强烈。",
        example: "日本語は難しいですが、面白いです。",
        exampleTranslation: "日语难，但是有趣。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：～けど（更口语）", targetNodeId: "l16_ga", contrastPair: ["～が（书面/礼貌）", "～けど（口语）"] },
        ],
        tags: ["#转折", "#铺垫"],
      },
      {
        id: "l16_teiru_result",
        title: "～ています（结果状态）",
        explanation: "动作发生后结果状态持续至今。常和自动词一起用。",
        example: "窓が割れています。",
        exampleTranslation: "窗户破了（破的状态还在）。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词て形（第14课）", targetNodeId: "l14_teform" },
          { type: "contrast", label: "⚠️ 辨析：动作进行 vs 结果状态", targetNodeId: "l14_teiru_action", contrastWith: "l16_teiru_result" },
          { type: "extension", label: "🔗 延伸：自動詞・他動詞（第18课）", targetNodeId: "l18_transitivity" },
        ],
        tags: ["#结果状态", "#自动词"],
        core: true,
      },
      {
        id: "l16_de_cause",
        title: "～で（原因）",
        explanation: "名词后，表客观原因（生病、灾害等）。",
        example: "風邪で学校を休みました。",
        exampleTranslation: "因为感冒没去学校。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：～から vs ～で", targetNodeId: "l16_de_cause", contrastPair: ["～から（主观理由）", "～で（客观原因）"] },
        ],
        tags: ["#原因", "#客观原因"],
      },
      {
        id: "l16_toiu",
        title: "～という～",
        explanation: "介绍对方可能不知道的名称。",
        example: "それは「さくら」という花です。",
        exampleTranslation: "那是叫「樱花」的花。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：～と言う vs ～という", targetNodeId: "l16_toiu", contrastPair: ["～と言う（引用说话）", "～という（介绍名称）"] },
        ],
        tags: ["#介绍", "#名称"],
      },
    ],
    dialogues: [
      {
        id: "l16_dialogue",
        title: "酒店评价",
        lines: [
          { speaker: "A", japanese: "ホテルの部屋はどうでしたか。", chinese: "酒店的房间怎么样？" },
          { speaker: "B", japanese: "広くて、とてもきれいでした。でも、ちょっと高かったです。", chinese: "又大又漂亮。但是有点贵。" },
          { speaker: "A", japanese: "駅から近いですか。", chinese: "离车站近吗？" },
          { speaker: "B", japanese: "いいえ、ちょっと遠いですが、静かでよかったです。", chinese: "不，有点远，但很安静，挺好的。" },
        ],
      },
    ],
    quizQuestions: [
      {
        id: "l16_q1",
        type: "choice",
        question: "この部屋は＿＿＿明るいです。",
        options: ["広い", "広くて", "広く", "広いで"],
        answer: 1,
        explanation: "イ形容词「広い」连接时用「広くて」。",
        grammarNodeId: "l16_adj_teform",
      },
      {
        id: "l16_q2",
        type: "choice",
        question: "窓が＿＿＿。",
        options: ["割る", "割っている", "割れている", "割った"],
        answer: 2,
        explanation: "窗户破了用自动词「割れる」+「ている」，表示结果状态。",
        grammarNodeId: "l16_teiru_result",
      },
      {
        id: "l16_q3",
        type: "fill",
        question: "風邪＿＿＿学校を休みました。",
        answer: "で",
        explanation: "名词原因用「で」，表示客观原因。",
        grammarNodeId: "l16_de_cause",
      },
    ],
  },
  {
    lessonId: 18,
    lessonTitle: "携帯電話はとても小さくなりました",
    theme: "变化与自我决定",
    grammarNodes: [
      {
        id: "l18_naru",
        title: "～なる",
        explanation: "自然变化。イ形い→く＋なる，ナ形＋になる。",
        example: "寒くなりました。／元気になりました。",
        exampleTranslation: "变冷了。／变精神了。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：～なる vs ～する", targetNodeId: "l18_suru", contrastWith: "l18_naru" },
        ],
        tags: ["#变化", "#自然变化"],
      },
      {
        id: "l18_suru",
        title: "～する",
        explanation: "人主动改变某物。ナ形＋にする，イ形く＋する。",
        example: "部屋をきれいにします。",
        exampleTranslation: "把房间弄干净。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：～なる vs ～する", targetNodeId: "l18_naru", contrastWith: "l18_suru" },
        ],
        tags: ["#变化", "#人为改变"],
      },
      {
        id: "l18_transitivity",
        title: "自動詞・他動詞",
        explanation: "自动词无宾语自己发生，他动词有宾语人为作用。多成对出现。",
        example: "ドアが開く／ドアを開ける",
        exampleTranslation: "门（自己）开了／把门打开",
        links: [
          { type: "contrast", label: "⚠️ 辨析：自动词+ている vs 他动词+ている", targetNodeId: "l18_transitivity", contrastPair: ["自动词+ている（结果状态）", "他动词+ている（动作进行）"] },
          { type: "extension", label: "🔗 延伸：第16课 ～ています（结果状态）", targetNodeId: "l16_teiru_result" },
        ],
        tags: ["#自动词", "#他动词"],
      },
      {
        id: "l18_hougaii",
        title: "～ほうがいい",
        explanation: "建议「这样做比较好」。前接动词た形（非过去意）。",
        example: "早く寝たほうがいいです。",
        exampleTranslation: "早点睡比较好。",
        links: [
          { type: "prerequisite", label: "📖 前置基础：动词た形", targetNodeId: null, external: "动词た形" },
        ],
        tags: ["#建议", "#忠告"],
      },
      {
        id: "l18_deshou",
        title: "～でしょう / ～かもしれません",
        explanation: "推测。でしょう把握较大，かもしれません把握较小。",
        example: "明日は雨でしょう。／遅れるかもしれません。",
        exampleTranslation: "明天大概会下雨。／可能会迟到。",
        links: [
          { type: "contrast", label: "⚠️ 辨析：でしょう vs かもしれません", targetNodeId: "l18_deshou", contrastPair: ["でしょう（较有把握）", "かもしれません（不太确定）"] },
        ],
        tags: ["#推测", "#不确定"],
      },
    ],
    dialogues: [
      {
        id: "l18_dialogue",
        title: "变化与决定",
        lines: [
          { speaker: "A", japanese: "最近、携帯電話はとても小さくなりましたね。", chinese: "最近手机变得很小了呢。" },
          { speaker: "B", japanese: "ええ、そして機能も多くなりました。", chinese: "是啊，而且功能也变多了。" },
          { speaker: "A", japanese: "でも、私は大きい画面のほうがいいです。", chinese: "但是，我还是觉得大屏幕比较好。" },
          { speaker: "B", japanese: "分かります。小さいと、見にくいかもしれませんね。", chinese: "我理解。太小的话可能看不清呢。" },
        ],
      },
    ],
    quizQuestions: [
      {
        id: "l18_q1",
        type: "choice",
        question: "部屋を＿＿＿します。",
        options: ["きれい", "きれいに", "きれく", "きれいになる"],
        answer: 1,
        explanation: "人为改变用「きれいにする」。",
        grammarNodeId: "l18_suru",
      },
      {
        id: "l18_q2",
        type: "choice",
        question: "寒く＿＿＿ね。",
        options: ["します", "なりました", "しました", "なる"],
        answer: 1,
        explanation: "自然变冷用「寒くなる」的过去式。",
        grammarNodeId: "l18_naru",
      },
      {
        id: "l18_q3",
        type: "choice",
        question: "明日は雨＿＿＿。",
        options: ["かもしれません", "でしょう", "ほうがいい", "なります"],
        answer: 1,
        explanation: "「でしょう」表示把握较大的推测。",
        grammarNodeId: "l18_deshou",
      },
    ],
  },
];

const LINK_STYLES = {
  prerequisite: { color: "#4A90D9", icon: "📖" },
  contrast: { color: "#E53935", icon: "⚠️" },
  extension: { color: "#43A047", icon: "🔗" },
  scene: { color: "#9E9E9E", icon: "🏷️" },
};

const CONTRAST_PRESETS = {
  "l14_teiru_action+l16_teiru_result": {
    title: "～ている：动作进行 vs 结果状态",
    left: {
      label: "动作进行（第14课）",
      pattern: "动词て形 + います",
      timeline: "●———→ 现在（还在做）",
      example: "今、手紙を書いています。",
      exampleZh: "现在正在写信。",
      mistake: "❌ 窓が割れています（表「破了」的状态时用结果态）",
    },
    right: {
      label: "结果状态（第16课）★",
      pattern: "自动词て形 + います",
      timeline: "●发生 ———→ 现在（状态还在）",
      example: "窓が割れています。",
      exampleZh: "窗户破了（破的状态持续）。",
      mistake: "❌ 今、手紙を書いています（表「正在写」时用进行态）",
    },
  },
  "l18_naru+l18_suru": {
    title: "～なる vs ～する",
    left: {
      label: "～なる（自然变化）",
      pattern: "イ形い→くなる / ナ形→になる",
      timeline: "自己变 · 没人特意去改",
      example: "携帯電話は小さくなりました。",
      exampleZh: "手机（自然）变小了。",
      mistake: "❌ 部屋をきれいになります（打扫房间是人为的）",
    },
    right: {
      label: "～する（人为改变）",
      pattern: "イ形くする / ナ形にする",
      timeline: "人主动去改",
      example: "部屋をきれいにします。",
      exampleZh: "把房间弄干净。",
      mistake: "❌ 寒くします（天气变冷不是人造成的）",
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
