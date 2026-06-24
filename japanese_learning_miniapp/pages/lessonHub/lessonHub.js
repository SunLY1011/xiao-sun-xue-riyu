const { getLessonMvp } = require("../../utils/lessons-mvp.js");
const storage = require("../../utils/mvp-storage.js");

Page({
  data: {
    lessonId: 0,
    title: "",
    gates: [],
  },

  onLoad(options) {
    const lessonId = Number(options.lessonId) || 14;
    const L = getLessonMvp(lessonId);
    const state = storage.load();
    const g = state.lessons[lessonId] || {};
    this.setData({
      lessonId,
      title: L ? `第${lessonId}课 · ${L.theme}` : "",
      gates: [
        { k: 1, name: "① 语法网络", done: !!g.gate1, path: "knowledgeCards" },
        { k: 2, name: "② 练对话", done: !!g.gate2, path: "dialoguePractice" },
        { k: 3, name: "③ 测考点", done: !!g.gate3, path: "test" },
      ],
    });
  },

  openGate(e) {
    const path = e.currentTarget.dataset.path;
    const lessonId = this.data.lessonId;
    wx.navigateTo({
      url: `/pages/courseDetail/${path}/${path}?lessonId=${lessonId}`,
    });
  },
});
