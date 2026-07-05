const { getLessonMvp } = require("../../../utils/lessons-mvp.js");
const storage = require("../../../utils/mvp-storage.js");

Page({
  data: { questions: [], qi: 0, feedback: "" },

  onLoad(options) {
    this.options = options;
    const lessonId = Number(options.lessonId) || 14;
    const L = getLessonMvp(lessonId);
    this.lessonId = lessonId;
    this.setData({ questions: L?.quizQuestions || [], qi: 0, feedback: "" });
    wx.setNavigationBarTitle({ title: `测试 · 第${lessonId}课` });
  },

  pick(e) {
    const q = this.data.questions[this.data.qi];
    const i = Number(e.currentTarget.dataset.i);
    const ok = q.type === "choice" ? i === q.answer : false;
    let state = storage.load();
    if (!ok) {
      const ans = q.type === "choice" ? q.options[q.answer] : q.answer;
      state.mistakes = state.mistakes.filter((m) => m.questionId !== q.id);
      state.mistakes.unshift({
        id: Date.now(),
        lessonId: this.lessonId,
        questionId: q.id,
        question: q.question,
        userAnswer: q.options[i],
        correctAnswer: ans,
        wrongAt: new Date().toISOString(),
        grammarNodeId: q.grammarNodeId,
      });
      storage.save(state);
    }
    const next = this.data.qi + 1;
    if (next >= this.data.questions.length) {
      if (!state.lessons[this.lessonId]) state.lessons[this.lessonId] = {};
      state.lessons[this.lessonId].gate3 = true;
      storage.save(state);
      wx.showToast({ title: "第三关完成", icon: "success" });
      setTimeout(() => wx.navigateBack(), 600);
    } else {
      this.setData({ qi: next, feedback: ok ? "✓" : `✗ ${q.explanation}` });
    }
  },
});
