/**
 * 课次查询与文法 UI 辅助（LINK_STYLES / CONTRAST_PRESETS / getLessonMvp）
 * 课程数据唯一起源：js/data/lessons-data.js 的 LESSONS_MVP（24 课，含第1課五关）
 * index.html 须先加载 lessons-data.js，再加载本文件；本文件不得再声明 LESSONS_MVP 数组。
 */
(function () {
  if (typeof LESSONS_MVP === "undefined") {
    console.error(
      "[日语初级课后练习] lessons-data.js 未加载或顺序错误：须在 lessons-mvp.js 之前引入。"
    );
  }
})();

function mergeStageLessonsIntoMvp(stageList) {
  if (!Array.isArray(stageList) || typeof LESSONS_MVP === "undefined") return;
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
  if (typeof LESSONS_MVP === "undefined") return null;
  return LESSONS_MVP.find((l) => l.lessonId === Number(id));
}

function findNodeAcrossLessons(nodeId) {
  if (typeof LESSONS_MVP === "undefined") return null;
  for (const lesson of LESSONS_MVP) {
    const nodes = lesson.grammarNodes || [];
    const node = nodes.find((n) => n.id === nodeId);
    if (node) return { lesson, node };
  }
  return null;
}
