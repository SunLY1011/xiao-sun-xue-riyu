const { getLessonMvp } = require("../../../utils/lessons-mvp.js");
const storage = require("../../../utils/mvp-storage.js");

Page({
  data: { lines: [], title: "" },

  onLoad(options) {
    const lessonId = Number(options.lessonId) || 14;
    const L = getLessonMvp(lessonId);
    const d = L?.dialogues?.[0];
    this.setData({
      title: d?.title || "",
      lines: d?.lines || [],
    });
    wx.setNavigationBarTitle({ title: `对话 · 第${lessonId}课` });
  },

  finish() {
    const lessonId = Number(this.options?.lessonId) || 14;
    const state = storage.load();
    if (!state.lessons[lessonId]) state.lessons[lessonId] = { gate1: false, gate2: false, gate3: false };
    state.lessons[lessonId].gate2 = true;
    storage.save(state);
    wx.showToast({ title: "第二关完成", icon: "success" });
    setTimeout(() => wx.navigateBack(), 600);
  },
});
