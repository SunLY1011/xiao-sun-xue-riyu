const { LESSONS_MVP } = require("../../utils/lessons-mvp.js");
const storage = require("../../utils/mvp-storage.js");

Page({
  data: {
    lessons: [],
    weekDays: 0,
  },

  onShow() {
    const state = storage.load();
    const weekAgo = Date.now() - 6 * 86400000;
    const weekDays = (state.studyDays || []).filter((d) => new Date(d).getTime() >= weekAgo).length;
    const lessons = LESSONS_MVP.map((L) => {
      const g = state.lessons[L.lessonId] || {};
      const done = [g.gate1, g.gate2, g.gate3].filter(Boolean).length;
      return {
        id: L.lessonId,
        title: `第${L.lessonId}课`,
        subtitle: L.theme,
        headline: L.lessonTitle,
        gates: storage.gateLabel(g),
        progress: Math.round((done / 3) * 100),
        core: L.lessonId === 16,
      };
    });
    this.setData({ lessons, weekDays });
  },

  goToLesson(e) {
    const lessonId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/lessonHub/lessonHub?lessonId=${lessonId}`,
    });
  },

  openH5() {
    wx.showModal({
      title: "完整三关 H5",
      content: "开发者工具可打开 japanese_learning_miniapp/h5/index.html；正式版请配置 web-view 业务域名指向部署地址。",
      showCancel: false,
    });
  },
});
