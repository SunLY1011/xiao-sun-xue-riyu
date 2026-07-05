/**
 * 日语初级 H5 · 全局字形（L3 听录播 / L4 折叠 / 警示）
 * 真源：docs/产品设计规范-L3图标全景清单.md
 */
const HyougaGlyphs = (function () {
  const AUDIO_COLOR = "#616161";
  const AUDIO_ACTIVE = "#525252";
  const AUDIO_SIZE = 20;

  /** 与 css/design-tokens.css --gate-*-accent 一致（降饱和） */
  /** 与 css/design-tokens.css --gate-*-accent 一致（降饱和） */
  const GATE_FOLD = {
    0: "#4a6fa5",
    1: "#b86b3a",
    2: "#5a8f62",
    3: "#7d5f8f",
    4: "#4a8f87",
  };

  let unitGateFoldOverride = null;

  const TIP_FOLD = "#b86b3a";

  function setUnitGateFoldColors(map) {
    unitGateFoldOverride = map && typeof map === "object" ? map : null;
  }

  function clearUnitGateFoldColors() {
    unitGateFoldOverride = null;
  }

  function svg(inner, viewBox = "0 0 24 24", cls = "hyo-glyph") {
    return `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true">${inner}</svg>`;
  }

  function listenInner() {
    return svg(
      `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`
    );
  }

  function recordInner() {
    return svg(
      `<path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v5c0 1.66 1.34 3 3 3zm-1 1.93c-2.45-.48-4-2.58-4-4.93H5c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 2.35-1.55 4.45-4 4.93V18h4v2H8v2h8v-2h-4v-2.07z"/>`
    );
  }

  function replayInner() {
    return svg(`<path fill="currentColor" d="M8 6v12l10-6z"/>`, "0 0 24 24", "hyo-glyph hyo-glyph-play");
  }

  function evaluateInner() {
    return svg(
      `<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>`
    );
  }

  /** 向下：等腰三角，无底框 */
  function foldDownInner(color) {
    const c = color || GATE_FOLD[0];
    return svg(`<path fill="${c}" d="M6 9l6 7 6-7z"/>`, "0 0 24 24", "hyo-glyph hyo-fold-down");
  }

  /** 向上三角 + 底横线 = 收纳 */
  function foldUpInner(color) {
    const c = color || GATE_FOLD[0];
    return svg(
      `<path fill="${c}" d="M6 15l6-7 6 7z"/><path fill="${c}" d="M5 18h14"/>`
    );
  }

  function foldToggleInner(isOpen, gate) {
    const c = foldColor(gate);
    return isOpen ? foldUpInner(c) : foldDownInner(c);
  }

  function foldDownHtml(gate) {
    return foldDownInner(foldColor(gate));
  }

  function warnIconHtml() {
    return svg(
      `<path fill="#ffca28" stroke="#f57c00" stroke-width="1" d="M12 2.5L2 20h20L12 2.5z"/><path fill="#5d4037" d="M11.25 9h1.5v5h-1.5zm.75 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>`,
      "0 0 24 24",
      "hyo-glyph hyo-warn"
    );
  }

  function foldColor(gate) {
    const g = Number(gate);
    if (unitGateFoldOverride && unitGateFoldOverride[g]) return unitGateFoldOverride[g];
    return GATE_FOLD[g] ?? GATE_FOLD[0];
  }

  return {
    AUDIO_COLOR,
    AUDIO_SIZE,
    GATE_FOLD,
    TIP_FOLD,
    listenInner,
    recordInner,
    replayInner,
    evaluateInner,
    foldDownInner,
    foldUpInner,
    foldToggleInner,
    foldDownHtml,
    warnIconHtml,
    foldColor,
    setUnitGateFoldColors,
    clearUnitGateFoldColors,
  };
})();
