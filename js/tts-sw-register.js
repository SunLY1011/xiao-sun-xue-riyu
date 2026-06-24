/**
 * P1 · Service Worker 注册（仅在 CACHE 代际变更时清理旧缓存）
 * 依赖：js/public-url.config.js 的 HYOUGA_TTS_CACHE_VER
 */
(function registerHyougaTtsSw() {
  if (!("serviceWorker" in navigator)) return;

  const ver = String(window.HYOUGA_TTS_CACHE_VER || "0").trim() || "0";
  const purgeKey = "hyouga-sw-generation";
  const prev = localStorage.getItem(purgeKey);

  function registerSw() {
    navigator.serviceWorker.register("sw.js?v=" + encodeURIComponent(ver)).catch(function () {});
  }

  function purgeThenRegister() {
    const tasks = [navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(regs.map(function (r) { return r.unregister(); }));
    })];
    if ("caches" in window) {
      tasks.push(
        caches.keys().then(function (names) {
          return Promise.all(
            names.filter(function (n) { return n.startsWith("hyouga-tts-"); }).map(function (n) { return caches.delete(n); })
          );
        })
      );
    }
    Promise.all(tasks).finally(function () {
      localStorage.setItem(purgeKey, ver);
      registerSw();
    });
  }

  if (prev && prev !== ver) {
    purgeThenRegister();
  } else {
    if (!prev) localStorage.setItem(purgeKey, ver);
    registerSw();
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", function (ev) {
      const d = ev.data;
      if (!d || d.type !== "hyouga-tts-precache") return;
      try {
        window.dispatchEvent(new CustomEvent("hyouga-tts-precache", { detail: d }));
      } catch (_) {}
    });
  }
})();
