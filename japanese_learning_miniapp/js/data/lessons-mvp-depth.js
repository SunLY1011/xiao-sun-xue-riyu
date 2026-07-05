/** 每课扩展：文法補足 · 会話 · 测验 · 単語（仅当课，不混课） */
const LESSON_DEPTH_PATCH = {
  14: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        {
          ja: "「買い物をしました」＝ て形で動作をつなぐ。買う→買って、から次の文へ。",
          zh: "购物这句用て形把动作接上，是第14课的核心。",
        },
        {
          ja: "デパート・駅・バスは会話でそのまま使う。名詞は「を」で動作と結びつける。",
          zh: "百货、车站、公交在会話里会反复出现，先听熟再跟读。",
        },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "て形・てから・ています（進行）・てください／ましょうか・を＋散歩",
      lineZh: "易混：て形接续、先后顺序、进行态、礼貌请求、助词を表经过",
    },
    vocab: [
      { id: "l14_v_dep", jp: "デパート", kana: "デパート", meaningJa: "デパートで買い物をする", meaningZh: "百货商场", example: "昨日デパートへ行きました。", from: "dialogue" },
      { id: "l14_v_kaimono", jp: "買い物", kana: "かいもの", meaningJa: "ものを買うこと", meaningZh: "购物", example: "買い物をしました。", ruby: [{ kanji: "買", reading: "か" }, { kanji: "物", reading: "もの" }], from: "dialogue" },
      { id: "l14_v_kinou", jp: "昨日", kana: "きのう", meaningJa: "きのうのこと", meaningZh: "昨天", example: "昨日デパートへ行きました。", from: "text" },
      { id: "l14_v_te", jp: "て形", kana: "てけい", meaningJa: "文をつなぐ動詞の形", meaningZh: "て形", example: "書いて、読んで、食べて。", from: "grammar" },
      { id: "l14_v_kudasai", jp: "ください", kana: "ください", meaningJa: "お願いする", meaningZh: "请（礼貌）", example: "ちょっと待ってください。", from: "grammar" },
      { id: "l14_v_kara", jp: "てから", kana: "てから", meaningJa: "AのあとでBする", meaningZh: "做完A再B", example: "家へ帰ってから、勉強します。", from: "grammar" },
      { id: "l14_v_teiru", jp: "ています", kana: "ています", meaningJa: "今している", meaningZh: "正在", example: "今、手紙を書いています。", from: "grammar" },
      { id: "l14_v_mashouka", jp: "ましょうか", kana: "ましょうか", meaningJa: "私がしましょうか", meaningZh: "我来…好吗", example: "傘を貸しましょうか。", from: "grammar" },
      { id: "l14_v_sanpo", jp: "散歩", kana: "さんぽ", meaningJa: "歩いて楽しむ", meaningZh: "散步", example: "公園を散歩します。", ruby: [{ kanji: "散歩", reading: "さんぽ" }], from: "grammar" },
      { id: "l14_v_eki", jp: "駅", kana: "えき", meaningJa: "電車・バスの駅", meaningZh: "车站", example: "このバスは駅に行きますか。", from: "dialogue" },
      { id: "l14_v_bus", jp: "バス", kana: "バス", meaningJa: "バスに乗る", meaningZh: "公交车", example: "バス停で待ちます。", from: "dialogue" },
    ],
    nodePatches: {
      l14_teform: {
        tags: ["#動詞活用", "#接続の基本"],
        depthSections: [
          {
            heading: "① て形の本当の役割",
            blocks: [
              {
                type: "text",
                text: "て形はただの「接続」ではありません。",
                zh: "て形不只是「连接」——还能表顺序、原因、方式等。",
              },
              {
                type: "denseList",
                items: [
                  {
                    label: "順番",
                    jp: "AしてからBする",
                    kana: "AしてからBする",
                    zh: "先做 A，再做 B（例：帰って、勉強する）",
                  },
                  {
                    label: "原因",
                    jp: "AなのでB",
                    kana: "AなのでB",
                    zh: "因为 A 所以 B（例：高くて買えない）",
                  },
                  {
                    label: "方法",
                    jp: "Aのやり方でBする",
                    kana: "AのやりかたでBする",
                    zh: "用 A 的方式做 B",
                  },
                  {
                    label: "伴随",
                    jp: "AをしながらBする",
                    kana: "AをしながらBする",
                    zh: "一边 A 一边 B",
                  },
                ],
              },
            ],
          },
          {
            heading: "② ます形接続とて形接続",
            blocks: [
              {
                type: "pair",
                bad: "家へ帰ります、勉強します。（ロボットみたい）",
                good: "家へ帰って、勉強します。（自然）",
                badZh: "两个ます连用，像机器人一样生硬",
                goodZh: "用て形连接，更自然",
              },
              {
                type: "text",
                text: "文をつなぐときは「て形」が基本です。",
                zh: "连接两个动作时，用て形比连用两个ます形更自然。",
              },
            ],
          },
          {
            heading: "③ よくある間違い",
            blocks: [
              {
                type: "pair",
                bad: "書いて→書くて",
                good: "書いて",
                badZh: "错：一类动词应变成「書いて」",
                goodZh: "对：書く → 書いて",
              },
              {
                type: "pair",
                bad: "待って→待ちて",
                good: "待って",
                badZh: "错：待つ → 待って（促音变）",
                goodZh: "对：待って",
              },
            ],
          },
          {
            heading: "④ グループ別て形",
            blocks: [
              {
                type: "list",
                items: [
                  {
                    jp: "1グループ：う・つ・る→って、む・ぶ・ぬ→んで、く→いて、ぐ→いで、す→して",
                    zh: "一类：う/つ/る→って；む/ぶ/ぬ→んで；く→いて；ぐ→いで；す→して",
                  },
                  { jp: "2グループ：る→て", zh: "二类：去掉る加て" },
                  { jp: "3グループ：する→して、来る→来て", zh: "三类：する→して；来る→来て" },
                ],
              },
            ],
          },
        ],
      },
      l14_tekudasai: {
        depthSections: [
          {
            heading: "① 丁寧さのレベル",
            blocks: [
              {
                type: "list",
                items: [
                  { jp: "友だち：ちょっと待って。", zh: "对朋友：只说「て」即可" },
                  { jp: "普通：ちょっと待ってください。", zh: "一般礼貌：てください" },
                  { jp: "もっと丁寧：ちょっと待ってくださいませんか。", zh: "更客气：再加ませんか" },
                ],
              },
            ],
          },
          {
            heading: "② 「すみませんが」",
            blocks: [
              {
                type: "pair",
                bad: "ちょっと待ってください。（命令っぽい）",
                good: "すみませんが、ちょっと待ってください。",
                badZh: "直接请求，略像命令",
                goodZh: "加「不好意思」作缓冲，更礼貌",
              },
            ],
          },
        ],
      },
      l14_tekara: {
        depthSections: [
          {
            heading: "① てから vs たあとで",
            blocks: [
              {
                type: "text",
                text: "てから＝順番に焦点。たあとで＝時間の前後を客観的に言う。",
                zh: "てから强调「先A后B」；たあとで更客观叙述时间先后。",
              },
              {
                type: "pair",
                bad: "昨日、映画を見てから、家へ帰りました。（単発の過去には不自然）",
                good: "毎日、宿題をしてから、ゲームをします。（習慣にピッタリ）",
                badZh: "单次过去事件用てから略别扭",
                goodZh: "表习惯、固定顺序时てから很自然",
              },
            ],
          },
        ],
      },
      l14_teiru_action: {
        depthSections: [
          {
            heading: "① 進行 vs 結果の状態",
            blocks: [
              {
                type: "text",
                text: "動作動詞＋ている＝今している。変化動詞＋ている＝結果の状態（第16課）。",
                zh: "动作动词+ている＝正在做；变化动词+ている＝结果还在（第16课）。",
              },
              {
                type: "pair",
                bad: "私は毎日、日本語を勉強しています。",
                good: "私は毎日、日本語を勉強します。",
                badZh: "表习惯时，用ます更自然",
                goodZh: "每天学习（习惯）",
              },
            ],
          },
        ],
      },
      l14_mashouka: {
        depthSections: [
          {
            heading: "① ましょう vs ましょうか",
            blocks: [
              {
                type: "pair",
                bad: "一緒に映画を見ましょう。→ 一緒にする",
                good: "傘を貸しましょうか。→ 自分がする申し出",
                badZh: "ましょう＝一起做",
                goodZh: "ましょうか＝我来帮你做",
              },
            ],
          },
        ],
      },
    },
    grammarNodesAdd: [
      {
        id: "l14_wo_motion",
        title: "助詞「を」の移動用法",
        titleZh: "を表经过",
        supplement: true,
        explanation: "移動動詞と一緒に「を」は通る場所を表します。",
        example: "公園を散歩します。橋を渡ります。",
        exampleRuby: [{ kanji: "公園", reading: "こうえん" }, { kanji: "散歩", reading: "さんぽ" }],
        links: [{ type: "prerequisite", label: "📖 前：助詞「を」の基本（第6課）", miniCardKey: "masu_kei" }],
        tags: ["#助詞", "#移動表現"],
        depthSections: [
          {
            heading: "テストのポイント",
            blocks: [
              {
                type: "pair",
                bad: "公園で散歩します。（移動のニュアンスが弱い）",
                good: "公園を散歩します。（中を通る）",
                badZh: "で只表场所，移动感弱",
                goodZh: "を表穿过、在里面走",
              },
            ],
          },
        ],
      },
      {
        id: "l14_adverbs",
        title: "副詞の使い分け",
        titleZh: "副词",
        supplement: true,
        explanation: "なかなか・もう・まだ・まず/それから/最後に",
        example: "なかなか美味しい。もう食べました。まだ食べていません。",
        tags: ["#副詞", "#日常表現"],
        depthSections: [
          {
            heading: "① なかなか・もう・まだ",
            blocks: [
              {
                type: "text",
                text: "なかなか＋肯定＝思ったより。なかなか＋否定＝簡単には〜ない。",
                zh: "なかなか+肯定＝比想象中更…；+否定＝不容易…",
              },
              {
                type: "text",
                text: "もう＋肯定＝もうした。まだ＋否定＝まだしていない。まだ＋肯定＝最中。",
                zh: "もう+肯定＝已经…了；まだ+否定＝还没…；まだ+肯定＝还在…当中",
              },
            ],
          },
        ],
      },
    ],
    conversationScenesAdd: [
      {
        id: "l14_scene_eki",
        sceneEmoji: "🚉",
        scenePlace: "駅",
        title: "駅のホーム",
        opener: {
          speaker: "A",
          japanese: "すみません、次の電車は何時ですか。",
          japaneseRuby: [{ kanji: "次", reading: "つぎ" }, { kanji: "電車", reading: "でんしゃ" }],
          chinese: "不好意思，下一班电车几点？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "10時10分です。あと5分ほどお待ちください。",
              chinese: "10点10分，请再等大约5分钟。",
              noteJa: "時刻＋待ってください。",
              npcReaction: { japanese: "ありがとうございます。", chinese: "谢谢。" },
            },
            {
              japanese: "ええと…ちょっと待ってくださいね。…はい、10時です。",
              chinese: "呃…请稍等。…是的，10点。",
              noteJa: "すぐ答えられないときの言い方。",
              npcReaction: { japanese: "大丈夫です、急いでいません。", chinese: "没关系，我不急。" },
            },
          ],
        },
      },
      {
        id: "l14_scene_cafe",
        sceneEmoji: "☕",
        scenePlace: "カフェ",
        title: "友達と休憩",
        opener: {
          speaker: "A",
          japanese: "少し休みませんか。コーヒーを飲みましょう。",
          chinese: "休息一下吗？喝杯咖啡吧。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "いいですね。砂糖を入れますか。",
              chinese: "好啊。要加糖吗？",
              noteJa: "提案に同意して質問を続ける。",
              npcReaction: { japanese: "いいえ、ブラックで大丈夫です。", chinese: "不用，黑咖就好。" },
            },
            {
              japanese: "すみません、今日はちょっと急いでいます。",
              chinese: "抱歉，今天有点赶时间。",
              noteJa: "丁寧に断る。",
              npcReaction: { japanese: "わかりました。また今度。", chinese: "明白了，下次吧。" },
            },
          ],
        },
      },
    ],
    branchPilot: {
      id: "l14_branch_bag",
      sceneEmoji: "🚉",
      scenePlace: "駅",
      title: "分岐 · 荷物をどうする？",
      isBranch: true,
      opener: {
        speaker: "A",
        japanese: "荷物がたくさんですね。大丈夫ですか。",
        japaneseRuby: [{ kanji: "荷物", reading: "にもつ" }],
        chinese: "行李不少啊，还好吗？",
      },
      choice: {
        japanese: "どうしますか。",
        chinese: "怎么办？",
        options: [
          {
            id: "help",
            japanese: "持ちましょうか。",
            chinese: "我来帮您拿好吗？",
            npcReaction: {
              japanese: "すみません、お願いします。エレベーターはあちらです。",
              chinese: "麻烦您了，电梯在那边。",
            },
          },
          {
            id: "self",
            japanese: "自分で持てます。大丈夫です。",
            chinese: "我自己能拿，没问题。",
            npcReaction: {
              japanese: "そうですか。気をつけてくださいね。",
              chinese: "是吗，请小心。",
            },
          },
          {
            id: "later",
            japanese: "あとで運びます。",
            chinese: "待会再搬。",
            npcReaction: {
              japanese: "わかりました。荷物置き場はここです。",
              chinese: "好的，行李寄存处在这里。",
            },
          },
        ],
      },
    },
    dialoguesAdd: [
      {
        id: "l14_dialogue_bus",
        title: "バス停で",
        sceneEmoji: "🚌",
        scenePlace: "バス停",
        opener: {
          speaker: "A",
          japanese: "すみません、このバスは駅に行きますか。",
          japaneseRuby: [{ kanji: "駅", reading: "えき" }],
          chinese: "不好意思，这趟公交车去车站吗？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "はい、行きますよ。次の停留所です。",
              chinese: "是的，去。下一站就是。",
              noteJa: "「よ」で親切。「次の」で具体情報。",
              noteZh: "语气词显得亲切，并补充具体信息。",
            },
            {
              japanese: "ええと…ちょっと待ってくださいね。…はい、行きます。あと5分で来ます。",
              chinese: "呃…请稍等。（看时刻表）…是的，5分钟后到。",
              noteJa: "すぐ答えられないときは「ええと」「待ってください」で間をもたせる。",
              noteZh: "不能立刻回答时先缓冲，再查信息后答复。",
            },
            {
              japanese: "すみません、私はわかりません。あちらの係員に聞いてください。",
              chinese: "抱歉我不知道，请问那边的工作人员。",
              noteJa: "わからないときは無理に答えず、係員を紹介する。",
              noteZh: "不知道就别硬答，指引对方找工作人员。",
            },
          ],
        },
      },
    ],
    quizReplace: [
      {
        id: "l14_q1",
        type: "choice",
        question: "今、手紙を＿＿＿。",
        questionTts: "今、手紙を書いています。",
        questionZh: "现在，正在写信。",
        options: ["書く", "書いている", "書いています", "書きました"],
        optionsZh: ["写（原形）", "写着（简体·非礼貌）", "写着（礼貌·正确）", "写了（过去）"],
        answer: 2,
        explanation: "「今」があるから「書いています」。ていねいな文。",
        explanationZh: "有「现在」→ 用「正在……」的ています礼貌形。",
        grammarNodeId: "l14_teiru_action",
      },
      {
        id: "l14_q2",
        type: "choice",
        question: "ちょっと待って＿＿＿。",
        questionTts: "ちょっと待ってください。",
        questionZh: "请稍等一下。",
        options: ["ます", "いる", "ください", "から"],
        optionsZh: ["ます（结尾）", "在（ている）", "请（请求）", "因为（から）"],
        answer: 2,
        explanation: "「〜てください」で依頼。",
        explanationZh: "请求别人用「〜てください」。",
        grammarNodeId: "l14_tekudasai",
      },
      {
        id: "l14_q3",
        type: "fill",
        question: "家へ＿＿＿から、勉強します。（帰る）",
        questionTts: "家へ帰ってから、勉強します。",
        questionZh: "回家之后，再学习。（动词：回去）",
        answer: "帰って",
        explanation: "「帰る」→「帰って」。促音便。",
        explanationZh: "「帰る」的て形是「帰って」（促音变）。",
        grammarNodeId: "l14_tekara",
      },
      {
        id: "l14_q4",
        type: "choice",
        question: "毎朝、公園を＿＿＿。",
        questionTts: "毎朝、公園を散歩します。",
        questionZh: "每天早上，在公园散步。",
        options: ["散歩する", "散歩します", "散歩している", "BもCも正しい"],
        optionsZh: ["散步（原形）", "散步（礼貌）", "正在散步", "B和C都对"],
        answer: 3,
        explanation: "習慣は「ます」でも「ています」でも可。「を」は通る場所。",
        explanationZh: "表习惯时「ます」和「ています」都可以。",
        grammarNodeId: "l14_wo_motion",
      },
      {
        id: "l14_q5",
        type: "choice",
        question: "荷物を＿＿＿か。",
        questionTts: "荷物を持ちましょうか。",
        questionZh: "我来帮你拿行李好吗？",
        options: ["持ちます", "持ちましょう", "持ちましょうか", "持ってください"],
        optionsZh: ["拿（陈述）", "一起拿吧", "我来拿好吗？（提议帮忙）", "请拿一下（请求对方）"],
        answer: 2,
        explanation: "申し出は「〜ましょうか」。",
        explanationZh: "主动提出帮忙用「〜ましょうか」。",
        grammarNodeId: "l14_mashouka",
      },
    ],
  },
  16: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        {
          ja: "い形容詞は「くて」でつなぐ。広い→広くて、明るい→明るくて。",
          zh: "い形并列用「くて」，和动词て形一样能接后半句。",
        },
        {
          ja: "「開いています」は結果の状態。今している「書いています」と区別する。",
          zh: "门开着＝状态；正在写＝进行，别混。",
        },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "広くて（い形て）・割れている（結果）・風邪で（原因）・が（逆接）・という",
      lineZh: "易混：い形て形、结果ている、で表原因、转折が、名称という",
    },
    vocab: [
      { id: "l16_v_hiroi", jp: "広い", kana: "ひろい", meaningJa: "スペースが大きい", meaningZh: "宽敞", example: "部屋は広くて明るいです。", ruby: [{ kanji: "広", reading: "ひろ" }], from: "grammar" },
      { id: "l16_v_akarui", jp: "明るい", kana: "あかるい", meaningJa: "光が多い", meaningZh: "明亮", example: "窓が明るいです。", ruby: [{ kanji: "明", reading: "あか" }], from: "grammar" },
      { id: "l16_v_hotel", jp: "ホテル", kana: "ホテル", meaningJa: "泊まるところ", meaningZh: "酒店", example: "ホテルの部屋はどうでしたか。", from: "dialogue" },
      { id: "l16_v_kirei", jp: "きれい", kana: "きれい", meaningJa: "見た目がよい", meaningZh: "漂亮", example: "とてもきれいでした。", from: "dialogue" },
      { id: "l16_v_demo", jp: "でも", kana: "でも", meaningJa: "前と反対のことを言う", meaningZh: "但是", example: "きれいでした。でも、高かったです。", from: "grammar" },
      { id: "l16_v_wareru", jp: "割れる", kana: "われる", meaningJa: "ガラスなどが壊れる（自動詞）", meaningZh: "破裂", example: "窓が割れています。", ruby: [{ kanji: "割", reading: "わ" }], from: "grammar" },
      { id: "l16_v_kaze", jp: "風邪", kana: "かぜ", meaningJa: "病気の一種", meaningZh: "感冒", example: "風邪で学校を休みました。", ruby: [{ kanji: "風邪", reading: "かぜ" }], from: "grammar" },
      { id: "l16_v_toiu", jp: "という", kana: "という", meaningJa: "名前を説明する", meaningZh: "叫做", example: "「さくら」という花です。", from: "grammar" },
      { id: "l16_v_omotta", jp: "思ったより", kana: "おもったより", meaningJa: "予想より", meaningZh: "比想象中", example: "思ったより広かったです。", ruby: [{ kanji: "思", reading: "おも" }], from: "dialogue" },
      { id: "l16_v_kaiteki", jp: "快適", kana: "かいてき", meaningJa: "心地よい", meaningZh: "舒适", example: "快適でした。", ruby: [{ kanji: "快適", reading: "かいてき" }], from: "dialogue" },
    ],
    nodePatches: {
      l16_adj_teform: {
        depthSections: [
          {
            heading: "イ形 vs ナ形",
            blocks: [
              {
                type: "list",
                items: [
                  { jp: "イ形容詞：広い→広くて", zh: "い形容词：去い加「くて」" },
                  { jp: "ナ形容詞：静かだ→静かで", zh: "な形容词：だ→で" },
                  { jp: "並べる：広くて明るいです。", zh: "并列：又宽敞又明亮" },
                ],
              },
            ],
          },
        ],
      },
      l16_teiru_result: {
        depthSections: [
          {
            heading: "結果の状態",
            blocks: [
              {
                type: "pair",
                bad: "窓を割れています。",
                good: "窓が割れています。（自動詞）",
                badZh: "他动词を误用",
                goodZh: "破裂用自动词が",
              },
              {
                type: "text",
                text: "第14課の「今している」とは違い、今見える結果に焦点。",
                zh: "与第14课「正在做」不同，这里强调「现在还能看到的结果」。",
              },
            ],
          },
        ],
      },
      l16_de_cause: {
        depthSections: [
          {
            heading: "〜で vs 〜から",
            blocks: [
              {
                type: "pair",
                bad: "風邪から休みました。（感情っぽい）",
                good: "風邪で休みました。（客観的原因）",
                badZh: "から偏主观、情绪感",
                goodZh: "で表客观原因（生病等）",
              },
            ],
          },
        ],
      },
    },
    conversationScenesAdd: [
      {
        id: "l16_scene_lobby",
        sceneEmoji: "🏨",
        scenePlace: "ロビー",
        title: "チェックイン",
        opener: {
          speaker: "A",
          japanese: "お部屋は8階です。エレベーターはあちらです。",
          japaneseRuby: [{ kanji: "部屋", reading: "へや" }],
          chinese: "房间在8楼，电梯在那边。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "ありがとうございます。朝食は何時からですか。",
              chinese: "谢谢。早餐几点开始？",
              npcReaction: { japanese: "7時から9時までです。", chinese: "7点到9点。" },
            },
            {
              japanese: "すみません、もう一度お願いします。",
              chinese: "不好意思，请再说一遍。",
              npcReaction: { japanese: "8階です。わかりましたか。", chinese: "8楼，明白了吗？" },
            },
          ],
        },
      },
      {
        id: "l16_scene_street",
        sceneEmoji: "🌆",
        scenePlace: "道",
        title: "道を聞く",
        opener: {
          speaker: "A",
          japanese: "すみません、駅はどちらですか。",
          japaneseRuby: [{ kanji: "駅", reading: "えき" }],
          chinese: "不好意思，车站在哪边？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "まっすぐ行って、二つ目の信号を右です。",
              chinese: "直走，第二个红绿灯右转。",
              npcReaction: { japanese: "ありがとうございます。", chinese: "谢谢。" },
            },
            {
              japanese: "この地図を見てください。ここです。",
              chinese: "请看这张地图，在这里。",
              npcReaction: { japanese: "なるほど、助かりました。", chinese: "原来如此，帮大忙了。" },
            },
          ],
        },
      },
    ],
    dialoguesAdd: [
      {
        id: "l16_dialogue_rest",
        title: "体調とおすすめ",
        sceneEmoji: "🏥",
        scenePlace: "休み",
        opener: {
          speaker: "A",
          japanese: "風邪で休んでいるんですね。大丈夫ですか。",
          japaneseRuby: [{ kanji: "風邪", reading: "かぜ" }, { kanji: "休", reading: "やす" }],
          chinese: "你感冒请假了啊，还好吗？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "はい、もう少しでよくなります。温かいスープを飲んだほうがいいと言われました。",
              japaneseRuby: [{ kanji: "温", reading: "あたた" }, { kanji: "飲", reading: "の" }],
              chinese: "嗯快好了，别人建议我喝热汤。",
              noteJa: "回復の見込み＋アドバイスを伝える。「〜ほうがいい」は第18課だが会話で先取り可。",
              noteZh: "说明好转+转述建议。",
            },
            {
              japanese: "まだ少し熱がありますが、明日から出かけられるかもしれません。",
              japaneseRuby: [{ kanji: "熱", reading: "ねつ" }, { kanji: "明日", reading: "あした" }],
              chinese: "还有点发烧，但明天也许能出门。",
              noteJa: "「が」で逆接、「かもしれません」で不確かさ。",
              noteZh: "转折+不确定推测。",
            },
            {
              japanese: "ありがとうございます。近くに静かなカフェがあると聞きました。よかったら一緒に行きませんか。",
              japaneseRuby: [{ kanji: "静", reading: "しず" }, { kanji: "聞", reading: "き" }],
              chinese: "谢谢，听说附近有安静咖啡馆，一起去吗？",
              noteJa: "お礼＋情報共有＋誘い。様子を説明する会話の延長。",
              noteZh: "感谢+分享信息+邀请。",
            },
          ],
        },
      },
    ],
    quizReplace: [
      {
        id: "l16_q1",
        type: "choice",
        question: "この部屋は＿＿＿明るいです。",
        questionTts: "この部屋は広くて明るいです。",
        questionZh: "这个房间又宽敞又明亮。",
        options: ["広い", "広くて", "広く", "広いで"],
        optionsZh: ["宽敞（形容词原形）", "宽敞并且（て形连接）", "宽敞地（副词）", "错误形式"],
        answer: 1,
        explanation: "イ形容詞＋て形は「い」→「くて」。",
        explanationZh: "い形容词并列：把「い」变成「くて」。",
        grammarNodeId: "l16_adj_teform",
      },
      {
        id: "l16_q2",
        type: "choice",
        question: "窓が＿＿＿。",
        questionTts: "窓が割れています。",
        questionZh: "窗户（破了）的状态。",
        options: ["割る", "割っている", "割れている", "割った"],
        optionsZh: ["弄破（他动）", "正在破（进行）", "破着的状态（结果）", "弄破了（过去）"],
        answer: 2,
        explanation: "結果の状態は自動詞＋ている。",
        explanationZh: "表示结果状态用自动词＋ている。",
        grammarNodeId: "l16_teiru_result",
      },
      {
        id: "l16_q3",
        type: "fill",
        question: "風邪＿＿＿学校を休みました。",
        questionTts: "風邪で学校を休みました。",
        questionZh: "因为感冒，没去学校。",
        answer: "で",
        explanation: "名詞のあとに「で」を付けて、客観的な原因を表します。",
        explanationZh: "名词后接「で」表示原因。",
        grammarNodeId: "l16_de_cause",
      },
      {
        id: "l16_q4",
        type: "choice",
        question: "日本語は難しいです＿＿＿、面白いです。",
        questionTts: "日本語は難しいですが、面白いです。",
        questionZh: "日语很难，但是很有趣。",
        options: ["が", "けど", "から", "ので"],
        optionsZh: ["但是（礼貌转折）", "但是（口语）", "因为", "因为（ので）"],
        answer: 0,
        explanation: "ていねいな逆接は「が」。",
        explanationZh: "礼貌的转折用「が」。",
        grammarNodeId: "l16_ga",
      },
      {
        id: "l16_q5",
        type: "choice",
        question: "それは「さくら」＿＿＿花です。",
        questionTts: "それはさくらという花です。",
        questionZh: "那是叫「樱花」的花。",
        options: ["と言う", "という", "といった", "と言った"],
        optionsZh: ["说（动词）", "叫做……的（定语）", "说过……的", "说了……的"],
        answer: 1,
        explanation: "名前の説明は「という」。",
        explanationZh: "说明名称用「という」。",
        grammarNodeId: "l16_toiu",
      },
    ],
  },
  18: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        {
          ja: "なる＝自然に変わる。する／にする＝人が変える。寒くなる vs 部屋をきれいにする。",
          zh: "なる 自己变；する/にする 让人变，对照记就不混。",
        },
        {
          ja: "でしょう＝だいたいそうだ。かもしれません＝もっと不確か。",
          zh: "でしょう 把握大些；かも 更不确定。",
        },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "なる／にする・開く／開ける・ほうがいい・でしょう・かもしれません",
      lineZh: "易混：自然变化vs人为、自他动词对、建议、推测语气强弱",
    },
    vocab: [
      { id: "l18_v_naru", jp: "なる", kana: "なる", meaningJa: "自然に変わる", meaningZh: "变得", example: "小さくなりました。", from: "grammar" },
      { id: "l18_v_suru", jp: "する", kana: "する", meaningJa: "人が変える", meaningZh: "弄成", example: "部屋をきれいにします。", from: "grammar" },
      { id: "l18_v_keitai", jp: "携帯電話", kana: "けいたいでんわ", meaningJa: "スマホ・携帯", meaningZh: "手机", example: "携帯電話は小さくなりました。", ruby: [{ kanji: "携帯", reading: "けいたい" }, { kanji: "電話", reading: "でんわ" }], from: "dialogue" },
      { id: "l18_v_kinou", jp: "機能", kana: "きのう", meaningJa: "できること・性能", meaningZh: "功能", example: "機能も多くなりました。", ruby: [{ kanji: "機能", reading: "きのう" }], from: "dialogue" },
      { id: "l18_v_hougaii", jp: "ほうがいい", kana: "ほうがいい", meaningJa: "アドバイス", meaningZh: "最好", example: "早く寝たほうがいいです。", from: "grammar" },
      { id: "l18_v_deshou", jp: "でしょう", kana: "でしょう", meaningJa: "たぶんそう", meaningZh: "大概", example: "明日は雨でしょう。", from: "grammar" },
      { id: "l18_v_kamo", jp: "かもしれません", kana: "かもしれません", meaningJa: "わからない・もしかしたら", meaningZh: "也许", example: "遅れるかもしれません。", from: "grammar" },
      { id: "l18_v_akeru", jp: "開ける", kana: "あける", meaningJa: "人がドアなどを開く（他動詞）", meaningZh: "打开", example: "ドアを開けてください。", ruby: [{ kanji: "開", reading: "あ" }], from: "grammar" },
      { id: "l18_v_aku", jp: "開く", kana: "あく", meaningJa: "ドアなどが自分で開く（自動詞）", meaningZh: "开着/打开", example: "ドアが開いています。", ruby: [{ kanji: "開", reading: "あ" }], from: "grammar" },
      { id: "l18_v_gamen", jp: "画面", kana: "がめん", meaningJa: "スクリーン", meaningZh: "屏幕", example: "大きい画面のほうがいいです。", ruby: [{ kanji: "画面", reading: "がめん" }], from: "dialogue" },
    ],
    nodePatches: {
      l18_naru: {
        depthSections: [
          {
            heading: "イ形・ナ形＋なる",
            blocks: [
              {
                type: "denseList",
                items: [
                  {
                    num: "①",
                    label: "い形",
                    jp: "寒い→寒くなる",
                    kana: "さむい→さむくなる",
                    zh: "冷 → 变冷",
                    ruby: [{ kanji: "寒", reading: "さむ" }],
                  },
                  {
                    num: "②",
                    label: "な形",
                    jp: "元気だ→元気になる",
                    kana: "げんきだ→げんきになる",
                    zh: "有精神 → 变得有精神",
                    ruby: [{ kanji: "元気", reading: "げんき" }],
                  },
                  {
                    num: "③",
                    label: "要点",
                    jp: "自然の変化",
                    kana: "しぜんのへんか",
                    zh: "自然变化（不是人主动弄成）",
                    ruby: [
                      { kanji: "自然", reading: "しぜん" },
                      { kanji: "変化", reading: "へんか" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      l18_transitivity: {
        depthSections: [
          {
            heading: "ペアで覚える",
            blocks: [
              {
                type: "denseList",
                items: [
                  {
                    num: "①",
                    jp: "開く／開ける",
                    kana: "あく・あける",
                    zh: "自动：开着 · 他动：打开",
                    ruby: [{ kanji: "開", reading: "あ" }],
                  },
                  { num: "②", jp: "閉まる／閉める", kana: "しまる・しめる", zh: "自动关／让人关" },
                  { num: "③", jp: "つく／つける", kana: "つく・つける", zh: "自己亮／打开（电器）" },
                ],
              },
            ],
          },
        ],
      },
    },
    conversationScenesAdd: [
      {
        id: "l18_scene_library",
        sceneEmoji: "📚",
        scenePlace: "図書館",
        title: "静かに勉強",
        opener: {
          speaker: "A",
          japanese: "ここは静かですね。勉強しやすいです。",
          japaneseRuby: [{ kanji: "静", reading: "しず" }, { kanji: "勉強", reading: "べんきょう" }],
          chinese: "这里很安静，适合学习。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "ええ、毎日来たいです。",
              chinese: "嗯，想每天来。",
              npcReaction: { japanese: "いいですね。一緒に来ましょう。", chinese: "好啊，一起来吧。" },
            },
            {
              japanese: "でも、今日は少しうるさいですね。",
              chinese: "不过今天有点吵呢。",
              npcReaction: { japanese: "そうですね。別の場所に行きましょうか。", chinese: "是啊，换个别的地方吧？" },
            },
          ],
        },
      },
      {
        id: "l18_scene_shop",
        sceneEmoji: "📱",
        scenePlace: "店",
        title: "新しい携帯",
        opener: {
          speaker: "A",
          japanese: "新しい携帯は小さくて、機能も多いですね。",
          japaneseRuby: [{ kanji: "携帯", reading: "けいたい" }, { kanji: "機能", reading: "きのう" }],
          chinese: "新手机又小功能又多呢。",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "画面が大きいほうがいいと思います。",
              chinese: "我觉得屏幕大一点更好。",
              npcReaction: { japanese: "わかります。私もそう思います。", chinese: "我懂，我也这么想。" },
            },
            {
              japanese: "もう少し安いのはありますか。",
              chinese: "有更便宜一点的吗？",
              npcReaction: { japanese: "こちらをご覧ください。", chinese: "请看这边。" },
            },
          ],
        },
      },
    ],
    dialoguesAdd: [
      {
        id: "l18_dialogue_plan",
        title: "これからの決め方",
        sceneEmoji: "📅",
        scenePlace: "学校",
        opener: {
          speaker: "A",
          japanese: "来週、日本語の試験がありますね。どうしますか。",
          japaneseRuby: [{ kanji: "来週", reading: "らいしゅう" }, { kanji: "日本語", reading: "にほんご" }, { kanji: "試験", reading: "しけん" }],
          chinese: "下周有日语考试吧，你打算怎么办？",
        },
        userTurn: {
          speaker: "B",
          replies: [
            {
              japanese: "毎日一時間勉強することにしました。遅く寝るより早く寝たほうがいいですよね。",
              japaneseRuby: [{ kanji: "毎日", reading: "まいにち" }, { kanji: "勉強", reading: "べんきょう" }, { kanji: "寝", reading: "ね" }],
              chinese: "我决定每天学一小时，早睡比熬夜好吧。",
              noteJa: "決断＋アドバイス。「ことにする」は先取り表現。",
              noteZh: "表态+建议早睡。",
            },
            {
              japanese: "まだ決めていません。たぶん図書館で勉強するでしょう。友だちと一緒に行くかもしれません。",
              japaneseRuby: [{ kanji: "図書館", reading: "としょかん" }, { kanji: "勉強", reading: "べんきょう" }],
              chinese: "还没定，大概去图书馆，也许和朋友一起。",
              noteJa: "不確かさ：「でしょう」「かもしれません」。",
              noteZh: "未决定+两种推测。",
            },
            {
              japanese: "部屋を静かにして、スマホを見ないようにします。集中できると思います。",
              japaneseRuby: [{ kanji: "部屋", reading: "へや" }, { kanji: "静", reading: "しず" }],
              chinese: "我会把房间弄安静、尽量不看手机，觉得能集中。",
              noteJa: "人が変える：「静かにする」「〜ないようにする」。",
              noteZh: "人为改变环境+目标。",
            },
          ],
        },
      },
    ],
    quizReplace: [
      {
        id: "l18_q1",
        type: "choice",
        question: "携帯電話はとても小さく＿＿＿。",
        questionTts: "携帯電話はとても小さくなりました。",
        questionZh: "手机变得很小了。",
        options: ["します", "なりました", "しました", "なっています"],
        optionsZh: ["弄成（する）", "变小了（自然变化）", "弄小了（人为）", "正在变小"],
        answer: 1,
        explanation: "自然の変化は「〜くなる」。",
        explanationZh: "自然变化用「〜くなる」。",
        grammarNodeId: "l18_naru",
      },
      {
        id: "l18_q2",
        type: "choice",
        question: "部屋をきれいに＿＿＿。",
        questionTts: "部屋をきれいにします。",
        questionZh: "把房间弄干净。",
        options: ["なります", "します", "なりました", "しています"],
        optionsZh: ["变干净", "弄干净（人为）", "变干净了", "正在弄干净"],
        answer: 1,
        explanation: "人が変えるときは「〜にする」。",
        explanationZh: "人主动使变化用「〜にする」。",
        grammarNodeId: "l18_suru",
      },
      {
        id: "l18_q3",
        type: "choice",
        question: "ドアが＿＿＿。",
        questionTts: "ドアが開いています。",
        questionZh: "门开着（状态）。",
        options: ["開けています", "開いています", "開けます", "開きます"],
        optionsZh: ["开着（人打开·他动）", "开着（自己开着·自动）", "打开（他动）", "开（自动）"],
        answer: 1,
        explanation: "自動詞：ドアが開いています。",
        explanationZh: "门自己开着→自动词「開いています」。",
        grammarNodeId: "l18_transitivity",
      },
      {
        id: "l18_q4",
        type: "choice",
        question: "早く寝た＿＿＿いいです。",
        questionTts: "早く寝たほうがいいです。",
        questionZh: "早点睡比较好。",
        options: ["ほうが", "ように", "ために", "なら"],
        optionsZh: ["……比较好（建议）", "为了……ように", "为了……ために", "如果……なら"],
        answer: 0,
        explanation: "助言は「〜たほうがいい」。",
        explanationZh: "建议用「〜たほうがいい」。",
        grammarNodeId: "l18_hougaii",
      },
      {
        id: "l18_q5",
        type: "choice",
        question: "明日は雨＿＿＿。遅れる＿＿＿。",
        questionTts: "明日は雨でしょう。遅れるかもしれません。",
        questionZh: "明天大概会下雨。可能会迟到。",
        options: ["でしょう / かもしれません", "かもしれません / でしょう", "でしょう / でしょう", "かもしれません / かもしれません"],
        optionsZh: ["大概 / 也许", "也许 / 大概", "大概 / 大概", "也许 / 也许"],
        answer: 0,
        explanation: "天気は「でしょう」、自分の遅れは「かもしれません」。",
        explanationZh: "天气推测用でしょう；自己不确定用かもしれません。",
        grammarNodeId: "l18_deshou",
      },
    ],
  },
  13: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        { ja: "「〜に〜があります」＝ 場所＋ある・いる＋数量。", zh: "在某处有某物：地点+あります/います+量词。" },
        { ja: "本は冊、人は人、卵は個——助数詞はセットで覚える。", zh: "书用册、人用「一人」、蛋用个，量词要成套记。" },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "助数詞 · あります/います · 数量＋ください",
      lineZh: "易混：量词搭配、有生命用います、购物数量句",
    },
    grammarNodesAdd: [
      {
        id: "l13_quantity_position",
        title: "数量詞＋位置",
        titleZh: "数量与位置",
        supplement: true,
        explanation: "「机の上に本が三冊」＝ 場所＋物＋数量。",
        example: "机の上に本が三冊あります。",
        tags: ["#補足"],
      },
      {
        id: "l13_counters_table",
        title: "よく使う助数詞",
        titleZh: "常用量词表",
        supplement: true,
        explanation: "冊（本）、人、枚（薄いもの）、台（機械）、個（小さいもの）など。",
        example: "ノート三冊、卵三個、写真一枚",
        tags: ["#補足"],
      },
    ],
    nodePatches: {
      l13_counters: {
        depthSections: [
          {
            heading: "① 助数詞の基本",
            blocks: [
              {
                type: "denseList",
                items: [
                  { label: "冊", jp: "本・ノート", zh: "书本、笔记本" },
                  { label: "人", jp: "人", zh: "人（一人・二人は特別）" },
                  { label: "個", jp: "卵・りんご", zh: "小物件、鸡蛋等" },
                  { label: "枚", jp: "紙・シャツ", zh: "薄片、衬衫" },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  15: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        { ja: "「今〜ています」＝ 今している動作。", zh: "「今」+ている=正在做。" },
        { ja: "「〜てもいいですか」で許可を求める。断るときは「だめです」。", zh: "用てもいいですか请求许可。" },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "進行のています · てもいい · 習慣のています",
      lineZh: "易混：进行时、许可、习惯也用ている",
    },
    grammarNodesAdd: [
      {
        id: "l15_teiru_habit",
        title: "〜ています（習慣）",
        titleZh: "习惯（也读ています）",
        supplement: true,
        explanation: "「毎日勉強しています」＝ 習慣・継続。",
        example: "毎日、日本語を勉強しています。",
        tags: ["#補足"],
      },
    ],
    nodePatches: {
      l15_teiru_progressive: {
        depthSections: [
          {
            heading: "① 進行 vs 結果（第16課）",
            blocks: [
              {
                type: "pair",
                bad: "窓が割れています（今している）",
                good: "今、手紙を書いています（進行）",
                badZh: "× 把结果态当成「正在做」",
                goodZh: "✓ 有「今」→ 动作进行中",
              },
            ],
          },
        ],
      },
    },
  },
  17: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        { ja: "ほしい＝ 名詞が欲しい。たい＝ 動きたい。", zh: "想要东西用がほしい；想要做用たい。" },
        { ja: "他人は「ほしがっています」「〜たがっています」。", zh: "说别人愿望要加がる。" },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "がほしい · たい · ほしがる",
      lineZh: "易混：助词が、ます形去ます+たい、第三人称",
    },
    nodePatches: {
      l17_hoshii: {
        depthSections: [
          {
            heading: "① ほしい vs たい",
            blocks: [
              {
                type: "pair",
                bad: "日本へ行きがほしい",
                good: "日本へ行きたい／新しい靴がほしい",
                badZh: "× 混用：动作不用ほしい",
                goodZh: "✓ 去日本→たい；新鞋→がほしい",
              },
            ],
          },
        ],
      },
    },
  },
  19: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        { ja: "「〜ないでください」＝ やめてほしいお願い。", zh: "请不要……=礼貌禁止请求。" },
        { ja: "「〜なければなりません」＝ しなければいけない義務。", zh: "必须……=不得不做。" },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "ないでください · なければなりません · なくてもいい",
      lineZh: "易混：请不要、必须、也可以不",
    },
    grammarNodesAdd: [
      {
        id: "l19_tehaikenai",
        title: "〜てはいけません",
        titleZh: "不许（更强）",
        supplement: true,
        explanation: "ルール・掲示で使う、強い禁止。",
        example: "ここで写真を撮ってはいけません。",
        tags: ["#補足"],
      },
    ],
  },
  20: {
    lessonCoachSummary: {
      subtitle: "本課の単語 · 先生まとめ",
      lines: [
        { ja: "辞書形＋ことができる＝ できる・話せる。", zh: "辞书形+ことができる=会/能。" },
        { ja: "「寝る前に」＝ Aの前にB。辞書形＋前に。", zh: "在A之前做B：动词辞书形+前に。" },
      ],
    },
    difficultVocabHints: {
      subtitle: "難しめ · ここを意識",
      lineJa: "ことができる · 前に · てからとの違い",
      lineZh: "易混：可能表达、前に vs てから",
    },
    nodePatches: {
      l20_maeni: {
        depthSections: [
          {
            heading: "① 前に vs てから",
            blocks: [
              {
                type: "pair",
                bad: "寝て前に歯を磨く",
                good: "寝る前に歯を磨きます",
                badZh: "× 前に前面要用辞书形",
                goodZh: "✓ 睡觉之前刷牙",
              },
            ],
          },
        ],
      },
    },
  },
  1:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "「AはBです」で「A＝B」を表します。日本語の文の基本です。「は」は話題、「です」は「だ」の丁寧形。",
            "zh": "自我介绍"
          }
        ]
      },
      "vocab": [
        {
          "id": "l1_v_opener",
          "jp": "はじめまして。わたしは山田です。",
          "kana": "はじめまして。わたしは山田です。",
          "meaningZh": "自我介绍",
          "example": "はじめまして。わたしは山田です。",
          "from": "dialogue"
        },
        {
          "id": "l1_v_0",
          "jp": "李さんは中国人です",
          "kana": "李さんは中国人です",
          "meaningZh": "文法",
          "example": "李さんは中国人です。",
          "from": "grammar"
        },
        {
          "id": "l1_v_1",
          "jp": "李さんは日本人ですか",
          "kana": "李さんは日本人ですか",
          "meaningZh": "文法",
          "example": "李さんは日本人ですか。→ いいえ、日本人ではありません。中国人です。",
          "from": "grammar"
        },
        {
          "id": "l1_v_2",
          "jp": "いいえ",
          "kana": "いいえ",
          "meaningZh": "文法",
          "example": "李さんは日本人ですか。→ いいえ、日本人ではありません。中国人です。",
          "from": "grammar"
        },
        {
          "id": "l1_v_3",
          "jp": "日本人ではありません",
          "kana": "日本人ではありません",
          "meaningZh": "文法",
          "example": "李さんは日本人ですか。→ いいえ、日本人ではありません。中国人です。",
          "from": "grammar"
        },
        {
          "id": "l1_v_4",
          "jp": "中国人です",
          "kana": "中国人です",
          "meaningZh": "文法",
          "example": "李さんは日本人ですか。→ いいえ、日本人ではありません。中国人です。",
          "from": "grammar"
        }
      ]
    },
  2:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "話し手からの距離で使い分けます。 これ：話し手に近いもの それ：聞き手に近いもの あれ：どちらからも遠いもの どれ：わからないときに質問",
            "zh": "指示事物"
          }
        ]
      },
      "vocab": [
        {
          "id": "l2_v_opener",
          "jp": "これは何ですか。",
          "kana": "これは何ですか。",
          "meaningZh": "指示事物",
          "example": "これは何ですか。",
          "from": "dialogue"
        },
        {
          "id": "l2_v_0",
          "jp": "これは本です",
          "kana": "これは本です",
          "meaningZh": "文法",
          "example": "これは本です。それはペンです。あれは何ですか。",
          "from": "grammar"
        },
        {
          "id": "l2_v_1",
          "jp": "それはペンです",
          "kana": "それはペンです",
          "meaningZh": "文法",
          "example": "これは本です。それはペンです。あれは何ですか。",
          "from": "grammar"
        },
        {
          "id": "l2_v_2",
          "jp": "あれは何ですか",
          "kana": "あれは何ですか",
          "meaningZh": "文法",
          "example": "これは本です。それはペンです。あれは何ですか。",
          "from": "grammar"
        },
        {
          "id": "l2_v_3",
          "jp": "今日はいい天気ですね",
          "kana": "今日はいい天気ですね",
          "meaningZh": "文法",
          "example": "今日はいい天気ですね。",
          "from": "grammar"
        },
        {
          "id": "l2_v_4",
          "jp": "これはわたしの本です",
          "kana": "これはわたしの本です",
          "meaningZh": "「この・その・あの・どの」と「これ・それ・あれ・どれ」の違い",
          "example": "これはわたしの本です。",
          "from": "grammar"
        }
      ]
    },
  3:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "場所を指す指示語です。距離感は「これ・それ・あれ」と同じ。 ここ：話し手の近く そこ：聞き手の近く あそこ：両方から遠い どこ：わからないとき",
            "zh": "场所位置"
          }
        ]
      },
      "vocab": [
        {
          "id": "l3_v_opener",
          "jp": "すみません、トイレはどこですか。",
          "kana": "すみません、トイレはどこですか。",
          "meaningZh": "场所位置",
          "example": "すみません、トイレはどこですか。",
          "from": "dialogue"
        },
        {
          "id": "l3_v_0",
          "jp": "ここはデパートです",
          "kana": "ここはデパートです",
          "meaningZh": "文法",
          "example": "ここはデパートです。トイレはどこですか。",
          "from": "grammar"
        },
        {
          "id": "l3_v_1",
          "jp": "トイレはどこですか",
          "kana": "トイレはどこですか",
          "meaningZh": "文法",
          "example": "ここはデパートです。トイレはどこですか。",
          "from": "grammar"
        },
        {
          "id": "l3_v_2",
          "jp": "デパートは五階建てです",
          "kana": "デパートは五階建てです",
          "meaningZh": "文法",
          "example": "デパートは五階建てです。本屋は三階です。",
          "from": "grammar"
        },
        {
          "id": "l3_v_3",
          "jp": "本屋は三階です",
          "kana": "本屋は三階です",
          "meaningZh": "文法",
          "example": "デパートは五階建てです。本屋は三階です。",
          "from": "grammar"
        }
      ]
    },
  4:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "ものの存在を表します。 ある：無生物（机、本、木など） いる：生物（人、犬、猫など）",
            "zh": "存在与数量"
          }
        ]
      },
      "vocab": [
        {
          "id": "l4_v_opener",
          "jp": "部屋に何がありますか。",
          "kana": "部屋に何がありますか。",
          "meaningZh": "存在与数量",
          "example": "部屋に何がありますか。",
          "from": "dialogue"
        },
        {
          "id": "l4_v_0",
          "jp": "部屋に机があります",
          "kana": "部屋に机があります",
          "meaningZh": "文法",
          "example": "部屋に机があります。庭に犬がいます。",
          "from": "grammar"
        },
        {
          "id": "l4_v_1",
          "jp": "庭に犬がいます",
          "kana": "庭に犬がいます",
          "meaningZh": "文法",
          "example": "部屋に机があります。庭に犬がいます。",
          "from": "grammar"
        },
        {
          "id": "l4_v_2",
          "jp": "机の上に本があります",
          "kana": "机の上に本があります",
          "meaningZh": "文法",
          "example": "机の上に本があります。猫は椅子の下にいます。",
          "from": "grammar"
        },
        {
          "id": "l4_v_3",
          "jp": "猫は椅子の下にいます",
          "kana": "猫は椅子の下にいます",
          "meaningZh": "文法",
          "example": "机の上に本があります。猫は椅子の下にいます。",
          "from": "grammar"
        }
      ]
    },
  5:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "動詞の丁寧な言い方。今すること・これからすることを表します。",
            "zh": "时间与ます形"
          }
        ]
      },
      "vocab": [
        {
          "id": "l5_v_opener",
          "jp": "毎朝何時に起きますか。",
          "kana": "毎朝何時に起きますか。",
          "meaningZh": "时间与ます形",
          "example": "毎朝何時に起きますか。",
          "from": "dialogue"
        },
        {
          "id": "l5_v_0",
          "jp": "森さんは七時に起きます",
          "kana": "森さんは七時に起きます",
          "meaningZh": "文法",
          "example": "森さんは七時に起きます。",
          "from": "grammar"
        },
        {
          "id": "l5_v_1",
          "jp": "毎朝六時半に起きます",
          "kana": "毎朝六時半に起きます",
          "meaningZh": "文法",
          "example": "毎朝六時半に起きます。",
          "from": "grammar"
        }
      ]
    },
  6:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "移動の方向・目的地を表す助詞。「に」と似ているが、「へ」は方向性が強い。",
            "zh": "移动与方向"
          }
        ]
      },
      "vocab": [
        {
          "id": "l6_v_opener",
          "jp": "今度の休みにどこかへ行きますか。",
          "kana": "今度の休みにどこかへ行きますか。",
          "meaningZh": "移动与方向",
          "example": "今度の休みにどこかへ行きますか。",
          "from": "dialogue"
        }
      ]
    },
  7:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "動作の対象を示す助詞。他動詞と一緒に使う。",
            "zh": "对象与频率"
          }
        ]
      },
      "vocab": [
        {
          "id": "l7_v_opener",
          "jp": "ご注文はお決まりですか。",
          "kana": "ご注文はお決まりですか。",
          "meaningZh": "对象与频率",
          "example": "ご注文はお決まりですか。",
          "from": "dialogue"
        }
      ]
    },
  8:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "動作の手段や方法を表す「で」。",
            "zh": "手段与授受"
          }
        ]
      },
      "vocab": [
        {
          "id": "l8_v_opener",
          "jp": "これ、誕生日のプレゼントです。",
          "kana": "これ、誕生日のプレゼントです。",
          "meaningZh": "手段与授受",
          "example": "これ、誕生日のプレゼントです。",
          "from": "dialogue"
        }
      ]
    },
  9:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "ものごとの性質や状態を表します。言い切りの形は「〜い」で終わります。",
            "zh": "い形容词"
          }
        ]
      },
      "vocab": [
        {
          "id": "l9_v_opener",
          "jp": "このカレー、どうですか。",
          "kana": "このカレー、どうですか。",
          "meaningZh": "い形容词",
          "example": "このカレー、どうですか。",
          "from": "dialogue"
        },
        {
          "id": "l9_v_0",
          "jp": "四川料理は辛いです",
          "kana": "四川料理は辛いです",
          "meaningZh": "文法",
          "example": "四川料理は辛いです。",
          "from": "grammar"
        }
      ]
    },
  10:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "ものごとの性質や状態を表します。名詞を修飾するときは「〜な」、言い切りの丁寧形は「〜です」。",
            "zh": "な形容词"
          }
        ]
      },
      "vocab": [
        {
          "id": "l10_v_opener",
          "jp": "京都はどうでしたか。",
          "kana": "京都はどうでしたか。",
          "meaningZh": "な形容词",
          "example": "京都はどうでしたか。",
          "from": "dialogue"
        },
        {
          "id": "l10_v_0",
          "jp": "京都の紅葉は有名です",
          "kana": "京都の紅葉は有名です",
          "meaningZh": "文法",
          "example": "京都の紅葉は有名です。",
          "from": "grammar"
        },
        {
          "id": "l10_v_1",
          "jp": "昨日はいい天気でした",
          "kana": "昨日はいい天気でした",
          "meaningZh": "文法",
          "example": "昨日はいい天気でした。",
          "from": "grammar"
        }
      ]
    },
  11:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "好きなもの・嫌いなものを表します。好き・嫌いの対象には「が」を使います。",
            "zh": "喜好与擅长"
          }
        ]
      },
      "vocab": [
        {
          "id": "l11_v_opener",
          "jp": "趣味は何ですか。",
          "kana": "趣味は何ですか。",
          "meaningZh": "喜好与擅长",
          "example": "趣味は何ですか。",
          "from": "dialogue"
        },
        {
          "id": "l11_v_0",
          "jp": "小野さんは歌が好きです",
          "kana": "小野さんは歌が好きです",
          "meaningZh": "文法",
          "example": "小野さんは歌が好きです。わたしはタバコが嫌いです。",
          "from": "grammar"
        },
        {
          "id": "l11_v_1",
          "jp": "わたしはタバコが嫌いです",
          "kana": "わたしはタバコが嫌いです",
          "meaningZh": "文法",
          "example": "小野さんは歌が好きです。わたしはタバコが嫌いです。",
          "from": "grammar"
        },
        {
          "id": "l11_v_2",
          "jp": "森さんはテニスが上手です",
          "kana": "森さんはテニスが上手です",
          "meaningZh": "文法",
          "example": "森さんはテニスが上手です。わたしは料理が下手です。",
          "from": "grammar"
        },
        {
          "id": "l11_v_3",
          "jp": "わたしは料理が下手です",
          "kana": "わたしは料理が下手です",
          "meaningZh": "文法",
          "example": "森さんはテニスが上手です。わたしは料理が下手です。",
          "from": "grammar"
        }
      ]
    },
  12:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "二つのものを比べて「AはBより〜」で「Aの方がBよりも〜だ」を表します。",
            "zh": "比较"
          }
        ]
      },
      "vocab": [
        {
          "id": "l12_v_opener",
          "jp": "AとB、どっちがいいですか。",
          "kana": "AとB、どっちがいいですか。",
          "meaningZh": "比较",
          "example": "AとB、どっちがいいですか。",
          "from": "dialogue"
        }
      ]
    },
  21:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "動詞のた形は、過去や完了を表す形です。作り方は「て形」とまったく同じルールです。 作り方： 1グループ：書く→書いた、待つ→待った、読む→読んだ 2グループ：食べる→食べた、起きる→起きた 3グループ：する→した、来る→来た",
            "zh": "た形与经历"
          }
        ]
      },
      "vocab": [
        {
          "id": "l21_v_opener",
          "jp": "日本料理を食べたことがありますか。",
          "kana": "日本料理を食べたことがありますか。",
          "meaningZh": "た形与经历",
          "example": "日本料理を食べたことがありますか。",
          "from": "dialogue"
        },
        {
          "id": "l21_v_0",
          "jp": "昨日",
          "kana": "昨日",
          "meaningZh": "文法",
          "example": "昨日、映画を見た。（昨天看了电影。）",
          "from": "grammar"
        },
        {
          "id": "l21_v_1",
          "jp": "映画を見た",
          "kana": "映画を見た",
          "meaningZh": "文法",
          "example": "昨日、映画を見た。（昨天看了电影。）",
          "from": "grammar"
        },
        {
          "id": "l21_v_2",
          "jp": "昨天看了电影",
          "kana": "昨天看了电影",
          "meaningZh": "文法",
          "example": "昨日、映画を見た。（昨天看了电影。）",
          "from": "grammar"
        },
        {
          "id": "l21_v_3",
          "jp": "食事をしたあとで",
          "kana": "食事をしたあとで",
          "meaningZh": "文法",
          "example": "食事をしたあとで、散歩します。",
          "from": "grammar"
        },
        {
          "id": "l21_v_4",
          "jp": "散歩します",
          "kana": "散歩します",
          "meaningZh": "文法",
          "example": "食事をしたあとで、散歩します。",
          "from": "grammar"
        }
      ]
    },
  22:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "友だちや家族との会話で使う普通の言い方。これまで習った「です・ます」は丁寧体です。 動詞の簡体と丁寧体の対応表： 簡体 丁寧体 現在肯定 見る 見ます 現在否定 見ない 見ません 過去肯定 見た 見ました 過去否定 見なかった 見ませんでし",
            "zh": "简体"
          }
        ]
      },
      "vocab": [
        {
          "id": "l22_v_opener",
          "jp": "今晩、何する？",
          "kana": "今晩、何する？",
          "meaningZh": "简体",
          "example": "今晩、何する？",
          "from": "dialogue"
        }
      ]
    },
  23:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "いくつかの動作の中から代表的なものを挙げて「AしたりBしたりする」とつなぎます。「色々なことをする」というニュアンス。",
            "zh": "たり·场合"
          }
        ]
      },
      "vocab": [
        {
          "id": "l23_v_opener",
          "jp": "週末はいつも何してる？",
          "kana": "週末はいつも何してる？",
          "meaningZh": "たり·场合",
          "example": "週末はいつも何してる？",
          "from": "dialogue"
        },
        {
          "id": "l23_v_0",
          "jp": "休みの日",
          "kana": "休みの日",
          "meaningZh": "文法",
          "example": "休みの日、散歩したり買い物に行ったりします。",
          "from": "grammar"
        },
        {
          "id": "l23_v_1",
          "jp": "雨の場合は",
          "kana": "雨の場合は",
          "meaningZh": "文法",
          "example": "雨の場合は、試合が中止になります。",
          "from": "grammar"
        },
        {
          "id": "l23_v_2",
          "jp": "試合が中止になります",
          "kana": "試合が中止になります",
          "meaningZh": "文法",
          "example": "雨の場合は、試合が中止になります。",
          "from": "grammar"
        }
      ]
    },
  24:     {
      "lessonCoachSummary": {
        "subtitle": "本課の要点",
        "lines": [
          {
            "ja": "自分の考えや感じたことを述べます。前に来る文は必ず簡体。",
            "zh": "引用与思う"
          }
        ]
      },
      "vocab": [
        {
          "id": "l24_v_opener",
          "jp": "あの新しいレストラン、どう思う？",
          "kana": "あの新しいレストラン、どう思う？",
          "meaningZh": "引用与思う",
          "example": "あの新しいレストラン、どう思う？",
          "from": "dialogue"
        },
        {
          "id": "l24_v_0",
          "jp": "彼は",
          "kana": "彼は",
          "meaningZh": "文法",
          "example": "彼は「行く」と言いました。",
          "from": "grammar"
        },
        {
          "id": "l24_v_1",
          "jp": "行く",
          "kana": "行く",
          "meaningZh": "文法",
          "example": "彼は「行く」と言いました。",
          "from": "grammar"
        },
        {
          "id": "l24_v_2",
          "jp": "と言いました",
          "kana": "と言いました",
          "meaningZh": "文法",
          "example": "彼は「行く」と言いました。",
          "from": "grammar"
        }
      ]
    }
};

function getLessonExtra(lessonId) {
  return LESSON_DEPTH_PATCH[Number(lessonId)] || null;
}

function getLessonCoachSummary(lessonId) {
  return getLessonExtra(lessonId)?.lessonCoachSummary || null;
}

function getLessonDifficultVocabHints(lessonId) {
  return getLessonExtra(lessonId)?.difficultVocabHints || null;
}

function getLessonVocab(lessonId) {
  const id = Number(lessonId);
  if (typeof LESSON_VOCAB_BIAORI !== "undefined" && LESSON_VOCAB_BIAORI[id]?.length) {
    return LESSON_VOCAB_BIAORI[id];
  }
  return getLessonExtra(lessonId)?.vocab || [];
}

/** 会話一覧：課本文 + 多场景 + 分岐（あれば） */
function getLessonDialogues(lessonId) {
  const lesson = getLessonMvp(lessonId);
  if (!lesson) return [];
  const extra = getLessonExtra(lessonId);
  const list = [...(lesson.dialogues || [])];
  if (extra?.conversationScenesAdd?.length) list.push(...extra.conversationScenesAdd);
  if (extra?.branchPilot) list.push({ ...extra.branchPilot, isBranch: true });
  return list;
}

/** 测验选项朗读用假名（避免汉字本机读中文） */
const QUIZ_OPTION_KANA = {
  します: "します",
  なりました: "なりました",
  しました: "しました",
  なっています: "なっています",
  書く: "かく",
  書いている: "かいている",
  書いています: "かいています",
  書きました: "かきました",
  ます: "ます",
  いる: "いる",
  ください: "ください",
  から: "から",
  ませんか: "ませんか",
  帰る: "かえる",
  帰って: "かえって",
  帰った: "かえった",
  帰ります: "かえります",
  広い: "ひろい",
  広くて: "ひろくて",
  広く: "ひろく",
  広いで: "ひろいで",
  割る: "わる",
  割っている: "わっている",
  割れている: "われている",
  割った: "わった",
  で: "で",
  が: "が",
  けど: "けど",
  ので: "ので",
  "と言う": "という",
  という: "という",
  といった: "といった",
  "と言った": "といった",
  散歩する: "さんぽする",
  散歩します: "さんぽします",
  散歩している: "さんぽしている",
  "BもCも正しい": "BもCもただしい",
  持ちます: "もちます",
  持ちましょう: "もちましょう",
  持ちましょうか: "もちましょうか",
  持ってください: "もってください",
  開けています: "あけています",
  開いています: "あいています",
  開けます: "あけます",
  開きます: "あきます",
  ほうが: "ほうが",
  ように: "ように",
  ために: "ために",
  なら: "なら",
  "でしょう / かもしれません": "でしょう、かもしれません",
  "かもしれません / でしょう": "かもしれません、でしょう",
  "でしょう / でしょう": "でしょう、でしょう",
  "かもしれません / かもしれません": "かもしれません、かもしれません",
};

/** 先生の補足：行内读音 + 中文（grammar-network 高密度渲染） */
const DEPTH_PARSE_HINTS = {
  "寒い→寒くなる": {
    zh: "冷 → 变冷（事物自然变化）",
    kana: "さむい → さむくなる",
    ruby: [{ kanji: "寒", reading: "さむ" }],
  },
  "元気だ→元気になる": {
    zh: "有精神 → 变得有精神",
    kana: "げんきだ → げんきになる",
    ruby: [{ kanji: "元気", reading: "げんき" }],
  },
  "自然の変化・自分で変わる": {
    zh: "自然变化 · 自己改变（にする/する 是人为）",
    kana: "しぜんのへんか · じぶんでかわる",
    ruby: [
      { kanji: "自然", reading: "しぜん" },
      { kanji: "変化", reading: "へんか" },
    ],
  },
  "順番：AしてからBする（家へ帰って、勉強する）": {
    zh: "顺序：做完 A 再做 B",
    kana: "じゅんばん：AしてからBする",
  },
  "理由・原因：AなのでB（高くて買えない）": {
    zh: "原因：因为 A 所以 B",
    kana: "りゆう・げんいん：AなのでB",
  },
  "手段・方法：Aのやり方でBする（歩いて学校へ行く）": {
    zh: "方式：用 A 的方式做 B",
    kana: "しゅだん・ほうほう",
  },
  "付帯状況：AをしながらBする（めがねをかけて本を読む）": {
    zh: "伴随：一边 A 一边 B",
    kana: "ふたいじょうきょう",
  },
  "1グループ：う・つ・る→って、む・ぶ・ぬ→んで、く→いて、ぐ→いで、す→して": {
    zh: "一类动词て形变化规则",
    kana: "いちぐるーぷ",
  },
  "2グループ：る→て": { zh: "二类：去掉る加て", kana: "にぐるーぷ：る→て" },
  "3グループ：する→して、来る→来て": {
    zh: "三类：する→して、来る→来て",
    kana: "さんぐるーぷ",
  },
  "開く／開ける": {
    zh: "自动词／他动词：开",
    kana: "あく・あける",
    ruby: [{ kanji: "開", reading: "あ" }],
  },
  "閉まる／閉める": { zh: "自动关／让人关", kana: "しまる・しめる" },
  "つく／つける": { zh: "自己亮／让人开（电器）", kana: "つく・つける" },
  "イ形容詞：広い→広くて": {
    zh: "い形：い→くて",
    kana: "ひろい→ひろくて",
    ruby: [{ kanji: "広", reading: "ひろ" }],
  },
  "ナ形容詞：静かだ→静かで": { zh: "な形：だ→で", kana: "しずかだ→しずかで" },
  "並べる：広くて明るいです。": {
    zh: "并列：又宽又亮",
    kana: "ひろくてあかるいです",
  },
};

/** 文法卡片背面：中文用法说明（初学者） */
/** 文法卡片例句下方中文（灰字） */
const GRAMMAR_EXAMPLE_ZH = {
  l14_teform: "书写→書いて；等待→待って；阅读→読んで；吃→食べて；做→して；来→来て",
  l14_tekudasai: "请稍等一下。",
  l14_tekara: "回家之后再学习。",
  l14_teiru_action: "现在正在写信。",
  l14_mashouka: "要借伞吗？（我来帮你）",
  l16_adj_teform: "这个房间又宽敞又明亮。",
  l16_ga: "日语难，但是很有趣。",
  l16_teiru_result: "窗户破了（碎着的状态还在）。",
  l16_de_cause: "因为感冒没去学校。",
  l16_toiu: "那是一种叫樱花的植物。",
  l18_naru: "渐渐变暖了。／变得有精神了。",
  l18_suru: "把电视声音调大。",
  l18_transitivity: "门开着。",
  l18_hougaii: "最好早点睡。",
  l18_deshou: "明天会下雨吧。",
  l18_kamo: "可能会迟到。",
  l13_counters: "书→一冊；人→一人；枚→一枚；台→一台。",
  l13_existence: "桌子上有三本书。",
  l15_teiru_progressive: "小野现在正在看报纸。",
  l15_temoiidesu: "可以拍照吗？",
  l17_hoshii: "我想要新衣服。",
  l17_tai: "想去日本。",
  l19_naidekudasai: "请不要忘记房间钥匙。",
  l19_nakereba: "明天必须交报告。",
  l20_dekiru: "史密斯会弹钢琴。",
  l20_maeni: "睡觉之前刷牙。",
};

const GRAMMAR_EXPLAIN_ZH = {
  l14_teform: "动词て形用来连接前后两个动作或状态，不同动词组变形方式不同（书上表格要记）。",
  l14_tekudasai: "请求别人做某事；比单用「て」更礼貌，相当于「请……」。",
  l14_tekara: "先做 A，再做 B，强调先后顺序，相当于「……完之后……」。",
  l14_teiru_action: "表示动作正在进行，相当于「正在……」。",
  l14_mashouka: "主动提出帮对方做，相当于「我来……好吗？」。",
  l16_adj_teform: "形容词并列：い形变「くて」，な形变「で」，可连用多个形容词。",
  l16_ga: "转折，比「でも」稍软，相当于「虽然……但是……」。",
  l16_teiru_result: "表示变化后的结果状态还在持续，常接自动词+ている。",
  l16_de_cause: "名词后接「で」表客观原因，如生病、天气等，相当于「因为……」。",
  l16_toiu: "介绍名称，相当于「叫……的……」「所谓……」。",
  l18_naru: "事物自然变化；い形去い加「くなる」，な形加「になる」。",
  l18_suru: "人为主动使变化；い形用「くする」，な形用「にする」。",
  l18_transitivity: "自动词：自己发生；他动词：人使它发生，要成对记忆。",
  l18_hougaii: "提出建议，相当于「最好……」「……比较好」。",
  l18_deshou: "推测，相当于「大概……吧」。",
  l18_kamo: "不确定推测，相当于「也许……」「可能……」。",
  l13_counters: "日语量词随计数对象变化，要和名词一起记。",
  l13_existence: "在某处有某物：地点+に+事物+が+数量+あります/います。",
  l15_teiru_progressive: "表示动作正在进行；句中有「今」时多用本义。",
  l15_temoiidesu: "请求许可；答应用「いいです」，拒绝用「だめです」等。",
  l17_hoshii: "想要名词时用がほしい；说别人用ほしがっています。",
  l17_tai: "想要做某事：ます形去ます+たい；别人用たがっています。",
  l19_naidekudasai: "礼貌地请对方不要做某事。",
  l19_nakereba: "表示义务、必须做；口语常说ないといけません。",
  l20_dekiru: "表示能力；辞书形+ことができる。",
  l20_maeni: "在……之前；前接动词辞书形。",
};

function applyLessonDepthPatches() {
  if (typeof LESSON_DEPTH_PATCH === "undefined" || !Array.isArray(LESSONS_MVP)) return;
  LESSONS_MVP.forEach((lesson) => {
    const p = LESSON_DEPTH_PATCH[lesson.lessonId];
    if (!p) return;
    lesson.grammarNodes.forEach((n) => {
      if (GRAMMAR_EXPLAIN_ZH[n.id] && !n.explanationZh) {
        n.explanationZh = GRAMMAR_EXPLAIN_ZH[n.id];
      }
      if (GRAMMAR_EXAMPLE_ZH[n.id] && !n.exampleZh) {
        n.exampleZh = GRAMMAR_EXAMPLE_ZH[n.id];
      }
    });
    if (p.nodePatches) {
      Object.entries(p.nodePatches).forEach(([id, patch]) => {
        const n = lesson.grammarNodes.find((x) => x.id === id);
        if (n) Object.assign(n, patch);
      });
    }
    if (p.grammarNodesAdd?.length) lesson.grammarNodes.push(...p.grammarNodesAdd);
    if (p.dialoguesAdd?.length) {
      if (!lesson.dialogues) lesson.dialogues = [];
      lesson.dialogues.push(...p.dialoguesAdd);
    }
    if (p.quizReplace?.length) lesson.quizQuestions = p.quizReplace;
    const biaori =
      typeof LESSON_VOCAB_BIAORI !== "undefined" ? LESSON_VOCAB_BIAORI[lesson.lessonId] : null;
    if (biaori?.length) lesson.vocab = biaori;
    else if (p.vocab?.length) lesson.vocab = p.vocab;
  });
}

applyLessonDepthPatches();
