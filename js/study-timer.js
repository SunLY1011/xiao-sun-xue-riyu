/** 学习计时器 · 页面可见时计时，切后台暂停 */
const StudyTimer = (() => {
  const STORAGE_KEY = "hyouga_study_time";
  let activeSince = null;
  let todayMinutes = 0;
  let totalMinutes = 0;
  let lastDate = "";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        todayMinutes = data.todayMinutes || 0;
        totalMinutes = data.totalMinutes || 0;
        lastDate = data.lastDate || "";
      }
    } catch (_) {}
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate !== today) {
      todayMinutes = 0;
      lastDate = today;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        todayMinutes, totalMinutes, lastDate
      }));
    } catch (_) {}
  }

  function start() {
    activeSince = Date.now();
  }

  function stop() {
    if (!activeSince) return;
    const elapsed = Math.round((Date.now() - activeSince) / 60000);
    if (elapsed > 0 && elapsed < 120) {
      todayMinutes += elapsed;
      totalMinutes += elapsed;
    }
    activeSince = null;
    save();
  }

  function init() {
    load();
    start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
    window.addEventListener("beforeunload", () => stop());
    setInterval(() => {
      if (activeSince) save();
    }, 30000);
  }

  function getStats() {
    if (activeSince) {
      const current = Math.round((Date.now() - activeSince) / 60000);
      return {
        todayMinutes: todayMinutes + current,
        totalMinutes: totalMinutes + current,
      };
    }
    return { todayMinutes, totalMinutes };
  }

  return { init, getStats };
})();

StudyTimer.init();
