/**
 * 彩蛋全屏 · 多机型视口与横竖屏（visualViewport + safe-area）
 * L2/L3 保持地理序 4×6，横屏时整体缩放居中，不重排格子顺序。
 */
const StoryEggViewport = (function () {
  const MODAL_ID = "story-reward-modal";

  function getModal() {
    return document.getElementById(MODAL_ID);
  }

  function orientation() {
    if (window.matchMedia("(orientation: landscape)").matches) return "landscape";
    return "portrait";
  }

  function applyVars(modal) {
    if (!modal || modal.hidden) return;
    const o = orientation();
    modal.dataset.eggOrientation = o;
    const vv = window.visualViewport;
    const w = vv ? vv.width : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    modal.style.setProperty("--egg-vv-w", `${Math.round(w)}px`);
    modal.style.setProperty("--egg-vv-h", `${Math.round(h)}px`);
    const insetTop = vv ? Math.max(0, vv.offsetTop) : 0;
    modal.style.setProperty("--egg-vv-offset-top", `${Math.round(insetTop)}px`);
  }

  function bind() {
    const onChange = () => applyVars(getModal());
    window.addEventListener("orientationchange", onChange);
    window.addEventListener("resize", onChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onChange);
      window.visualViewport.addEventListener("scroll", onChange);
    }
  }

  function hookOpen() {
    applyVars(getModal());
  }

  function hookClose() {
    const modal = getModal();
    if (!modal) return;
    delete modal.dataset.eggOrientation;
    modal.style.removeProperty("--egg-vv-w");
    modal.style.removeProperty("--egg-vv-h");
    modal.style.removeProperty("--egg-vv-offset-top");
  }

  return { bind, hookOpen, hookClose, applyVars, orientation };
})();

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => StoryEggViewport.bind());
}
