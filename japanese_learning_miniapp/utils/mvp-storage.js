const MVP_KEY = "hyouga_mvp_v1";

function load() {
  try {
    const raw = wx.getStorageSync(MVP_KEY);
    const base = {
      studyDays: [],
      lessons: { 14: { gate1: false, gate2: false, gate3: false }, 16: { gate1: false, gate2: false, gate3: false }, 18: { gate1: false, gate2: false, gate3: false } },
      mistakes: [],
    };
    return raw ? { ...base, ...raw, lessons: { ...base.lessons, ...(raw.lessons || {}) } } : base;
  } catch {
    return { studyDays: [], lessons: { 14: {}, 16: {}, 18: {} }, mistakes: [] };
  }
}

function save(state) {
  wx.setStorageSync(MVP_KEY, state);
}

function gateLabel(g) {
  return `${g.gate1 ? "✅" : "⬜"} ${g.gate2 ? "✅" : "⬜"} ${g.gate3 ? "✅" : "⬜"}`;
}

module.exports = { MVP_KEY, load, save, gateLabel };
