const { getLessonMvp } = require("../../../utils/lessons-mvp.js");
const storage = require("../../../utils/mvp-storage.js");

Page({
  data: {
    lessonId: 14,
    nodes: [],
    index: 0,
    flipped: false,
  },

  onLoad(options) {
    const lessonId = Number(options.lessonId) || 14;
    const L = getLessonMvp(lessonId);
    const nodes = (L?.grammarNodes || []).map((n) => ({
      title: n.title,
      explanation: n.explanation,
      example: n.example,
      exampleTranslation: n.exampleTranslation || "",
      tags: (n.tags || []).join(" "),
      ext: (n.extensions || []).map((e) => `${e.jp}（${e.zh}）`).join(" · "),
    }));
    this.setData({ lessonId, nodes, index: 0, flipped: false });
    wx.setNavigationBarTitle({ title: `语法 · 第${lessonId}课` });
  },

  flipCard() {
    this.setData({ flipped: !this.data.flipped });
  },

  prevCard() {
    if (this.data.index > 0) this.setData({ index: this.data.index - 1, flipped: false });
  },

  nextCard() {
    if (this.data.index < this.data.nodes.length - 1) {
      this.setData({ index: this.data.index + 1, flipped: false });
    } else {
      const state = storage.load();
      if (!state.lessons[this.data.lessonId]) {
        state.lessons[this.data.lessonId] = { gate1: false, gate2: false, gate3: false };
      }
      state.lessons[this.data.lessonId].gate1 = true;
      const key = new Date().toISOString().slice(0, 10);
      if (!state.studyDays.includes(key)) state.studyDays.push(key);
      storage.save(state);
      wx.showToast({ title: "第一关完成", icon: "success" });
      setTimeout(() => wx.navigateBack(), 600);
    }
  },
});
