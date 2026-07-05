/**
 * P0 开机页 · 定稿底图 + 品牌/按钮叠层（SPLASH Cover 2.0）
 * 🔒 设计锁：docs/locks/P0-SPLASH-COVER-DESIGN-LOCK-20260525.md · SPLASH_ASSET_VER 与锁一致
 * 底图：cover-base.png（地图+蓝虚线+六圆）· 缺图回退 kO3
 */
const HomeSplash = (function () {
  const SPLASH_ASSET_VER = "24";
  const SPLASH_COVER_BASE = "assets/splash/cover-base.png";
  const SPLASH_MAP_BODY = "assets/splash/japan-map-ko3.png";

  const SPLASH_DEV_STOPS = [
    { code: "02", x: 95, y: 248 },
    { code: "04", x: 128, y: 168 },
    { code: "03", x: 138, y: 148 },
    { code: "01", x: 148, y: 128 },
    { code: "05", x: 152, y: 88 },
    { code: "06", x: 142, y: 38 },
  ];

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  /** 合规声明 · 两行（CTA 按钮下方） */
  function disclaimerHtmlTwoLines(text) {
    const t = (text || "").trim();
    const idx = t.indexOf("，");
    if (idx > 0 && idx < t.length - 1) {
      return `<span class="splash-disclaimer-line">${escapeHtml(t.slice(0, idx + 1))}</span><span class="splash-disclaimer-line">${escapeHtml(t.slice(idx + 1).trim())}</span>`;
    }
    return `<span class="splash-disclaimer-line">${escapeHtml(t)}</span>`;
  }

  function coverQuery() {
    return SPLASH_ASSET_VER ? `?s=${encodeURIComponent(SPLASH_ASSET_VER)}` : "";
  }

  function cacheVer() {
    return typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER
      ? ShareWechat.CACHE_VER
      : "";
  }

  function devPathD() {
    return SPLASH_DEV_STOPS.map((p, i) => `${i === 0 ? "M" : " L"} ${p.x} ${p.y}`).join("");
  }

  function devOverlayHtml() {
    const circles = SPLASH_DEV_STOPS.map(
      (p) => `<g>
        <circle cx="${p.x}" cy="${p.y}" r="14" fill="#ffffff" stroke="#90a4ae" stroke-width="3"/>
        <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#546e7a" font-family="system-ui,sans-serif">${p.code}</text>
      </g>`
    ).join("");
    return `<div class="splash-dev-overlay-wrap" aria-hidden="true">
      <svg class="splash-dev-overlay" viewBox="0 0 240 360" preserveAspectRatio="xMidYMid meet">
        <path class="splash-dev-track" d="${devPathD()}" fill="none" stroke="#c9a227" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>
        ${circles}
      </svg>
    </div>`;
  }

  /** 开机叠层：橘框 + 海军蓝底 + 居中白 emblem（源 logo/logo.png） */
  const LOGO_EMBLEM = "assets/brand/intepoint-logo-emblem.png";

  function product() {
    return window.HYOUGA_PRODUCT || {};
  }

  function uiChromeHtml() {
    const v = cacheVer();
    const p = product();
    const emblemSrc = v ? `${LOGO_EMBLEM}?v=${v}` : LOGO_EMBLEM;
    const title = p.name || "日语初级课后练习";
    const disclaimer = p.disclaimer || "";
    return `
      <div class="splash-ui">
        <header class="splash-brand">
          <div class="splash-logo" aria-hidden="true">
            <div class="splash-logo-frame">
              <div class="splash-logo-inner">
                <img class="splash-logo-emblem" src="${escapeHtml(emblemSrc)}" alt="" width="33" height="33" decoding="async" />
              </div>
            </div>
          </div>
          <h1 class="splash-title">${escapeHtml(title)}</h1>
          <p class="splash-path jp">学習の道</p>
          <p class="splash-sub jp">新幹線 24 駅</p>
        </header>
        <div class="splash-map-stage" aria-hidden="true"></div>
        <footer class="splash-cta">
          <button type="button" class="btn primary splash-btn-start" id="btn-splash-start">开始学习</button>
          ${
            disclaimer
              ? `<p class="splash-disclaimer zh-annotation" aria-label="${escapeHtml(disclaimer)}">${disclaimerHtmlTwoLines(disclaimer)}</p>`
              : ""
          }
        </footer>
      </div>`;
  }

  function clearBootFailTimer() {
    if (window.__hyougaBootFailTimer) {
      clearTimeout(window.__hyougaBootFailTimer);
      window.__hyougaBootFailTimer = null;
    }
  }

  function render() {
    const root = document.getElementById("splash-root");
    if (!root) return;
    clearBootFailTimer();
    const q = coverQuery();
    root.innerHTML = `
      <div class="splash-screen splash-screen--complete">
        <div class="splash-bg" id="splash-bg">
          <img
            class="splash-cover-full"
            id="splash-cover-img"
            src="${escapeHtml(SPLASH_COVER_BASE + q)}"
            alt=""
            width="390"
            height="844"
            decoding="async"
          />
        </div>
        ${uiChromeHtml()}
      </div>`;

    const img = root.querySelector("#splash-cover-img");
    const bg = root.querySelector("#splash-bg");
    if (!img || !bg) return;

    function useKo3Fallback() {
      const screen = root.querySelector(".splash-screen--complete");
      screen?.classList.add("is-splash-ko3-fallback");
      img.className = "splash-map-locked";
      img.src = SPLASH_MAP_BODY + q;
      img.alt = "日本列岛学习路径";
      bg.insertAdjacentHTML("beforeend", devOverlayHtml());
    }

    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      useKo3Fallback();
    });
  }

  function bind(onStart) {
    const btn = document.getElementById("btn-splash-start");
    if (!btn || typeof onStart !== "function") return;
    btn.onclick = () => onStart();
  }

  return {
    render,
    bind,
    clearBootFailTimer,
    ASSET_VER: SPLASH_ASSET_VER,
    COVER_BASE: SPLASH_COVER_BASE,
    MAP_BODY: SPLASH_MAP_BODY,
  };
})();

/** 不等待 app.js：脚本一到即绘开机页，避免微信内 5s 误报「未正常加载」 */
(function hyougaSplashEarlyBoot() {
  function tryRender() {
    if (typeof HomeSplash === "undefined") return;
    const root = document.getElementById("splash-root");
    if (!root || root.querySelector(".splash-btn-start")) return;
    HomeSplash.render();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryRender);
  } else {
    tryRender();
  }
})();
