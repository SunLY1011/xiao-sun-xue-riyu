const { LESSONS_MVP } = require("../../utils/lessons-mvp.js");
const storage = require("../../utils/mvp-storage.js");

Page({
  data: { heat: [], progress: [], weak: [] },

  onShow() {
    const state = storage.load();
    const heat = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      heat.push({ label: key.slice(5), on: (state.studyDays || []).includes(key) });
    }
    const progress = LESSONS_MVP.map((L) => {
      const g = state.lessons[L.lessonId] || {};
      return { id: L.lessonId, gates: storage.gateLabel(g) };
    });
    const counts = {};
    (state.mistakes || []).forEach((m) => {
      if (m.grammarNodeId) counts[m.grammarNodeId] = (counts[m.grammarNodeId] || 0) + 1;
    });
    const weak = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ id, count }));
    this.setData({ heat, progress, weak });
  },

  clearData() {
    wx.removeStorageSync(storage.MVP_KEY);
    this.onShow();
    wx.showToast({ title: "已清空", icon: "success" });
  },
});
