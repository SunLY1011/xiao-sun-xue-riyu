const storage = require("../../utils/mvp-storage.js");

function daysSince(wrongAt) {
  const a = new Date(wrongAt);
  const b = new Date();
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.floor((b - a) / 86400000);
}

function isDue(m) {
  const d = daysSince(m.wrongAt);
  return d === 1 || d === 3 || d === 7 || d > 7;
}

Page({
  data: { list: [], empty: true },

  onShow() {
    const state = storage.load();
    const list = (state.mistakes || []).filter(isDue).map((m) => ({
      ...m,
      day: daysSince(m.wrongAt),
    }));
    this.setData({ list, empty: !list.length });
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    const state = storage.load();
    state.mistakes = state.mistakes.filter((m) => m.id !== id);
    storage.save(state);
    this.onShow();
  },
});
