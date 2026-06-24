/** 根据目录与详细数据生成完整 LESSONS 数组 */
function defaultExercises(id, theme, headline) {
  return {
    listen: [
      {
        jp: headline.replace(/、/g, "、"),
        question: `第${id}课主题「${theme}」相关句子，大意是？`,
        options: ["与课文主题一致", "完全无关", "是过去式专用", "是敬语"],
        answer: 0,
      },
    ],
    read: [
      {
        passage: `【第${id}课】${headline}\n（请结合教材课文理解本句。）`,
        question: "本句属于哪一课主题？",
        options: [theme, "无关", "复习", "未知"],
        answer: 0,
      },
    ],
    write: [
      {
        prompt: `用本课主题「${theme}」造一个です／ます句`,
        answer: headline.split("、")[0].slice(0, 20) || "わたしは学生です",
        alt: [],
      },
    ],
    speak: [{ phrase: headline.split("、")[0] || "はじめまして", hint: `第${id}课跟读` }],
  };
}

function buildLessons() {
  return LESSON_CATALOG.map((cat) => {
    const detail = LESSON_DETAILS[cat.id] || {};
    const title = `第${cat.id}课`;
    return {
      id: cat.id,
      title,
      theme: cat.theme,
      headline: cat.headline,
      unit: cat.unit,
      basicText: detail.basicText || [
        { jp: cat.headline, zh: `第${cat.id}课核心句型（请对照教材课文）。` },
      ],
      dialogues: detail.dialogues || [
        {
          title: "情景对话",
          lines: [
            { sp: "甲", jp: cat.headline, zh: "本课重点句。" },
            { sp: "乙", jp: "はい、わかりました。", zh: "好的，明白了。" },
          ],
        },
      ],
      grammar: detail.grammar || [
        {
          title: cat.theme,
          rule: `本课重点：${cat.theme}。请结合教材「语法解释」学习。`,
          examples: [{ jp: cat.headline, zh: "见基本课文。" }],
        },
      ],
      vocab: detail.vocab || [
        { jp: "勉強", kana: "べんきょう", zh: "学习" },
        { jp: "練習", kana: "れんしゅう", zh: "练习" },
      ],
      tools: detail.tools || [],
      exercises: detail.exercises || defaultExercises(cat.id, cat.theme, cat.headline),
    };
  });
}

const LESSONS = buildLessons();

function getLesson(id) {
  return LESSONS.find((l) => l.id === Number(id)) || LESSONS[0];
}
