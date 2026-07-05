/** 情景场景：教材课文转化为可互动对话 */
const SCENARIOS = [
  {
    id: "l14-dept",
    lessonId: 14,
    title: "百货商店买东西",
    emoji: "🛍️",
    place: "デパート",
    desc: "用て形连接「去」和「买」两个动作。",
    words: [
      { jp: "デパート", kana: "でぱーと", zh: "百货商店", tip: "外来语，音调平板" },
      { jp: "買い物", kana: "かいもの", zh: "购物", tip: "かい＋もの" },
      { jp: "行って", kana: "いって", zh: "去（て形）", tip: "行く的例外て形" },
    ],
    steps: [
      {
        type: "scene",
        text: "昨天下午，你和同学讨论周末安排。",
        bg: "🏢",
      },
      {
        type: "npc",
        role: "同学",
        jp: "今日の午後は何をしますか。",
        zh: "今天下午做什么？",
        words: [{ jp: "何", kana: "なに", zh: "什么", tip: "なに／なん" }],
      },
      {
        type: "guide",
        text: "你要回答：去百货商店，然后购物。试着说出完整一句。",
        hint: "デパートへ行って、買い物をします",
      },
      {
        type: "speak",
        jp: "デパートへ行って、買い物をします。",
        kana: "でぱーとへ いって、かいものを します",
        zh: "去百货商店买东西。",
        keywords: ["デパート", "行って", "買い物"],
        guide: "先「行って」连接，再「買い物をします」。行く→行って是例外。",
      },
      {
        type: "npc",
        role: "同学",
        jp: "いいですね。何を買いますか。",
        zh: "好啊，买什么？",
      },
      {
        type: "speak",
        jp: "服を買いたいです。",
        kana: "ふくを かいたいです",
        zh: "想买衣服。",
        keywords: ["服", "買い"],
        guide: "买＝買います，たい表示想做。",
      },
    ],
  },
  {
    id: "l14-post",
    lessonId: 14,
    title: "邮局寄包裹到中国",
    emoji: "📦",
    place: "郵便局",
    desc: "练习「てください」请求表达。",
    words: [
      { jp: "荷物", kana: "にもつ", zh: "包裹", tip: "にもつ" },
      { jp: "船便", kana: "ふなびん", zh: "海运", tip: "ふな＋びん" },
      { jp: "航空便", kana: "こうくうびん", zh: "空运", tip: "こうくう＋びん" },
    ],
    steps: [
      { type: "scene", text: "你在日本邮局，要把礼物寄回中国。", bg: "📮" },
      {
        type: "npc",
        role: "店员",
        jp: "いらっしゃいませ。",
        zh: "欢迎光临。",
      },
      {
        type: "guide",
        text: "请用日语请求店员：把这个包裹寄到中国。",
        hint: "この荷物を中国へ送ってください",
      },
      {
        type: "speak",
        jp: "すみません、この荷物を中国へ送ってください。",
        kana: "すみません、このにもつを ちゅうごくへ おくってください",
        zh: "不好意思，请把这个包裹寄到中国。",
        keywords: ["荷物", "中国", "送って"],
        guide: "送る→送って＋ください＝请帮我寄。",
      },
      {
        type: "npc",
        role: "店员",
        jp: "船便ですか、航空便ですか。",
        zh: "海运还是空运？",
        words: [
          { jp: "船便", kana: "ふなびん", zh: "海运" },
          { jp: "航空便", kana: "こうくうびん", zh: "空运" },
        ],
      },
      {
        type: "choice",
        prompt: "你想选哪种邮寄方式？",
        options: [
          { jp: "船便でお願いします。", zh: "请走海运。", correct: true },
          { jp: "航空便でお願いします。", zh: "请走空运。", correct: false },
        ],
      },
    ],
  },
  {
    id: "l14-bus",
    lessonId: 14,
    title: "问公交车是否经过车站",
    emoji: "🚌",
    place: "バス停",
    desc: "练习「通ります」与地点询问。",
    steps: [
      { type: "scene", text: "你拿着地图，在公交站等车。", bg: "🚏" },
      {
        type: "speak",
        jp: "このバスは駅前を通りますか。",
        kana: "このばすは えきまえを とおりますか",
        zh: "这辆公交车经过车站前吗？",
        keywords: ["バス", "駅前", "通り"],
        guide: "通ります＝经过。駅前＝えきまえ。",
      },
      {
        type: "npc",
        role: "乘客",
        jp: "はい、通りますよ。",
        zh: "是的，经过哦。",
      },
      { type: "celebrate", text: "太好了！你成功问路了。" },
    ],
  },
  {
    id: "l16-hotel",
    lessonId: 16,
    title: "介绍酒店房间",
    emoji: "🏨",
    place: "ホテル",
    desc: "一类形容词くて并列：又…又…",
    words: [
      { jp: "広い", kana: "ひろい", zh: "宽敞" },
      { jp: "明るい", kana: "あかるい", zh: "明亮" },
    ],
    steps: [
      { type: "scene", text: "旅行团的导游在介绍酒店。", bg: "🏨" },
      {
        type: "npc",
        role: "导游",
        jp: "ホテルの部屋はどうですか。",
        zh: "酒店房间怎么样？",
      },
      {
        type: "speak",
        jp: "ホテルの部屋は広くて明るいです。",
        kana: "ひろくて あかるいです",
        zh: "房间又宽敞又明亮。",
        keywords: ["広くて", "明るい"],
        guide: "広い→広くて；い形容词把い变くて。",
      },
    ],
  },
  {
    id: "l16-intro",
    lessonId: 16,
    title: "描述森先生是什么样的人",
    emoji: "👤",
    place: "会社",
    desc: "多个形容词连用描述人物。",
    steps: [
      {
        type: "npc",
        role: "同事",
        jp: "森さんはどんな人ですか。",
        zh: "森先生是什么样的人？",
      },
      {
        type: "speak",
        jp: "背が高くて脚が長くて、ハンサムな人です。",
        kana: "せが たかくて あしが ながくて",
        zh: "个子高、腿长，很帅。",
        keywords: ["高くて", "長くて", "ハンサム"],
        guide: "身体部位＋が＋形容词くて，并列描述。",
      },
    ],
  },
  {
    id: "l18-phone",
    lessonId: 18,
    title: "聊手机变小了",
    emoji: "📱",
    place: "電器店",
    desc: "一类形容词＋くなる 表示变化。",
    steps: [
      { type: "scene", text: "和朋友聊科技产品。", bg: "📱" },
      {
        type: "speak",
        jp: "携帯電話はとても小さくなりました。",
        kana: "けいたいでんわは とても ちいさくなりました",
        zh: "手机变得很小了。",
        keywords: ["携帯", "小さく", "なりました"],
        guide: "小さい→小さく＋なる；とても加强程度。",
      },
    ],
  },
  {
    id: "l18-cold",
    lessonId: 18,
    title: "感冒好了吗",
    emoji: "🤒",
    place: "学校",
    desc: "よくなる 表示状态变好。",
    steps: [
      { type: "npc", role: "朋友", jp: "風邪はどうですか。", zh: "感冒怎么样了？" },
      {
        type: "speak",
        jp: "ゆうべ薬を飲みましたが、まだよくなりません。",
        kana: "のんだが まだ よくなりません",
        zh: "昨晚吃药了，还没好。",
        keywords: ["薬", "よくなりません"],
        guide: "よい→よくなる（变好）；が表示转折。",
      },
    ],
  },
  {
    id: "l1-meet",
    lessonId: 1,
    title: "第一次见面自我介绍",
    emoji: "🤝",
    place: "教室",
    desc: "はじめまして 与 です 句型。",
    steps: [
      { type: "scene", text: "开学第一天，认识新同学。", bg: "🎓" },
      { type: "npc", role: "同学", jp: "はじめまして。", zh: "初次见面。" },
      {
        type: "speak",
        jp: "はじめまして。わたしは李です。中国人です。",
        kana: "はじめまして わたしは りです",
        zh: "初次见面，我是小李，中国人。",
        keywords: ["はじめまして", "李", "中国人"],
        guide: "自我介绍：わたしは…です。",
      },
      {
        type: "speak",
        jp: "よろしくお願いします。",
        kana: "よろしく おねがいします",
        zh: "请多关照。",
        keywords: ["よろしく"],
        guide: "固定寒暄，语调礼貌即可。",
      },
    ],
  },
];

/** 为每课自动生成基础情景（若尚无专属场景） */
function getScenariosForLesson(lessonId) {
  const lid = Number(lessonId);
  const dialogues =
    typeof getLessonDialogues === "function" ? getLessonDialogues(lid) : [];
  const list = SCENARIOS.filter((s) => s.lessonId === lid);
  const merged = [...dialogues, ...list];
  if (merged.length) return merged;
  const L = getLesson(lessonId);
  return [
    {
      id: `l${lessonId}-basic`,
      lessonId: Number(lessonId),
      title: `${L.theme} · 跟读`,
      emoji: "📖",
      place: "教室",
      desc: L.headline,
      steps: (() => {
        const steps = [{ type: "scene", text: `第${lessonId}课：${L.theme}`, bg: "📖" }];
        (L.dialogues || []).forEach((d) => {
          (d.lines || []).forEach((line) => {
            if (line.sp === "甲" || line.sp === "店员" || line.sp === "同事" || line.sp === "导游") {
              steps.push({ type: "npc", role: line.sp, jp: line.jp, zh: line.zh });
            } else {
              steps.push({
                type: "speak",
                jp: line.jp,
                zh: line.zh || "",
                keywords: [line.jp.replace(/[、。！？]/g, "").slice(0, 6)],
                guide: `跟读：${L.theme}`,
              });
            }
          });
        });
        if (steps.length < 2) {
          steps.push({
            type: "speak",
            jp: L.headline,
            zh: L.theme,
            keywords: [L.headline.slice(0, 4)],
            guide: "跟读本课核心句",
          });
        }
        steps.push({ type: "celebrate", text: "本课情景练习完成！" });
        return steps;
      })(),
    },
  ];
}

function getScenario(id) {
  const fromDialogue =
    typeof getLessonDialogue === "function" ? getLessonDialogue(id) : null;
  if (fromDialogue) return fromDialogue;
  return SCENARIOS.find((s) => s.id === id) || null;
}
