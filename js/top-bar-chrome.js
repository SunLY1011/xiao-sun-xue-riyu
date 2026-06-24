/**
 * 四栏顶栏 · 左标题 + 右 [首页·房子] [转发] [二维码]（与 intro 同型）
 * 真源：css/hyo-top-bar.css · docs/DESIGN-L0-图标与人设全景.md
 */
const HyoTopBar = (function () {
  const VIEW_META = {
    home: { title: (window.HYOUGA_PRODUCT && window.HYOUGA_PRODUCT.name) || "日语初级课后练习" },
    lesson: { title: "学習中" },
    review: { title: "復習" },
    write: { title: "书写" },
    me: { title: "笔记" },
  };

  function homeIndexHref() {
    const v =
      typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER
        ? ShareWechat.CACHE_VER
        : "";
    return v
      ? `index.html?v=${encodeURIComponent(v)}&nosplash=1`
      : "index.html?nosplash=1";
  }

  function goHome() {
    if (window.MvpDev && typeof window.MvpDev.showView === "function") {
      window.MvpDev.showView("home");
      return;
    }
    location.href = homeIndexHref();
  }

  function update(view) {
    const meta = VIEW_META[view] || VIEW_META.home;
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = meta.title;

    const bar = document.querySelector("body.mvp-app .top-bar.hyo-top-bar");
    if (bar) bar.dataset.hyoView = view || "home";

    const homeBtn = document.getElementById("btn-top-home");
    if (homeBtn) {
      const onHome = view === "home";
      homeBtn.setAttribute("aria-label", onHome ? "课文首页" : "回到课文首页");
      homeBtn.classList.toggle("is-active", onHome);
    }
  }

  function mount() {
    const homeBtn = document.getElementById("btn-top-home");
    if (homeBtn && typeof NavIcons !== "undefined") {
      homeBtn.innerHTML = NavIcons.html("home");
      if (!homeBtn.dataset.bound) {
        homeBtn.dataset.bound = "1";
        homeBtn.addEventListener("click", goHome);
      }
    }
    update("home");
  }

  return { update, mount, goHome, homeIndexHref, VIEW_META };
})();
