/**
 * 入門 · 点假名弹出「先生のひとこと」（与 14/16/18 课同款气质）
 */
const IntroKanaTip = (() => {
  const TITLE = "先生のひとこと";

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function speakBtn(kana) {
    if (typeof KanaSpeak !== "undefined") return KanaSpeak.btnHtml(kana);
    if (typeof SpeakUI === "undefined") return "";
    const payload = { jp: kana, kana, ttsLine: kana };
    return SpeakUI.btnHtml(payload, 'class="btn-speak-icon" title="听"');
  }

  function ensureSheet() {
    let backdrop = document.getElementById("intro-tip-backdrop");
    let sheet = document.getElementById("intro-tip-sheet");
    if (backdrop && sheet) return { backdrop, sheet };

    backdrop = document.createElement("div");
    backdrop.id = "intro-tip-backdrop";
    backdrop.className = "intro-tip-backdrop";
    backdrop.hidden = true;

    sheet = document.createElement("div");
    sheet.id = "intro-tip-sheet";
    sheet.className = "intro-tip-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.hidden = true;
    sheet.innerHTML = `<div class="intro-tip-sheet-inner" id="intro-tip-inner"></div>`;

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    backdrop.addEventListener("click", close);
    sheet.querySelector(".intro-tip-sheet-drag")?.addEventListener("click", close);

    return { backdrop, sheet };
  }

  function renderSheetHtml(tip) {
    const kana = tip.kana;
    const tag = tip.tag
      ? `<span class="intro-tip-tag intro-tip-tag--${escapeHtml(tip.tag === "易错" ? "trap" : tip.tag)}">${escapeHtml(tip.tag)}</span>`
      : "";
    const sound = tip.soundLikeZh
      ? `<div class="intro-tip-block intro-tip-block--sound">
          <span class="intro-tip-label">象音</span>
          ${tip.soundIcon ? `<span class="intro-tip-sound-icon" aria-hidden="true">${tip.soundIcon}</span>` : ""}
          <p>${escapeHtml(tip.soundLikeZh)}</p>
        </div>`
      : "";
    const memory = tip.memoryZh
      ? `<div class="intro-tip-block"><span class="intro-tip-label">記憶</span><p>${escapeHtml(tip.memoryZh)}</p></div>`
      : "";
    const caution = tip.cautionZh
      ? `<div class="intro-tip-block intro-tip-block--warn"><span class="intro-tip-label">注意</span><p>${escapeHtml(tip.cautionZh)}</p></div>`
      : "";
    const note = tip.noteJa ? `<p class="intro-tip-note jp">${escapeHtml(tip.noteJa)}</p>` : "";
    const demo = tip.demo
      ? `<div class="intro-tip-demo"><span class="jp">${escapeHtml(tip.demo)}</span>${speakBtn(tip.demo)}</div>`
      : "";
    const roma = tip.romaji ? `<span class="intro-tip-roma">${escapeHtml(tip.romaji)}</span>` : "";

    return `
      <button type="button" class="intro-tip-sheet-drag" aria-label="关闭"> </button>
      <header class="intro-tip-head">
        <span class="intro-tip-title">${TITLE}</span>
        ${tag}
      </header>
      <div class="intro-tip-hero">
        <span class="intro-tip-kana">${escapeHtml(kana)}</span>
        ${roma}
        ${speakBtn(kana)}
      </div>
      ${sound}
      ${memory}
      ${caution}
      ${note}
      ${demo}
      <button type="button" class="btn secondary intro-tip-close">知道了</button>`;
  }

  function open(kana) {
    const tip = typeof getIntroKanaTip === "function" ? getIntroKanaTip(kana) : null;
    if (!tip) return;
    const { backdrop, sheet } = ensureSheet();
    const inner = document.getElementById("intro-tip-inner");
    if (!inner) return;

    inner.innerHTML = renderSheetHtml(tip);
    backdrop.hidden = false;
    sheet.hidden = false;
    document.body.classList.add("intro-tip-open");

    inner.querySelector(".intro-tip-close")?.addEventListener("click", close);
    inner.querySelector(".intro-tip-sheet-drag")?.addEventListener("click", close);

    if (typeof SpeakUI !== "undefined") SpeakUI.bind(inner, { skipPrefetch: true });
  }

  function close() {
    const backdrop = document.getElementById("intro-tip-backdrop");
    const sheet = document.getElementById("intro-tip-sheet");
    if (backdrop) backdrop.hidden = true;
    if (sheet) sheet.hidden = true;
    document.body.classList.remove("intro-tip-open");
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.stopAllPlayback) SpeechEngine.stopAllPlayback();
  }

  let openLock = false;
  let scrollBlockUntil = 0;

  function bindScrollGuard(root) {
    if (!root || root.dataset.kanaScrollGuard === "1") return;
    root.dataset.kanaScrollGuard = "1";
    let lastY = 0;
    let lastX = 0;
    root.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        if (!t) return;
        lastY = t.clientY;
        lastX = t.clientX;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (!t) return;
        const dy = Math.abs(t.clientY - lastY);
        const dx = Math.abs(t.clientX - lastX);
        if (dy + dx > 10) scrollBlockUntil = Date.now() + 600;
        lastY = t.clientY;
        lastX = t.clientX;
      },
      { passive: true }
    );
    root.addEventListener(
      "scroll",
      () => {
        scrollBlockUntil = Date.now() + 600;
      },
      { passive: true, capture: true }
    );
  }

  function bind(root) {
    if (!root) return;
    bindScrollGuard(root);
    root.querySelectorAll("[data-kana-tip]").forEach((el) => {
      if (el.dataset.tipBound === "1") return;
      el.dataset.tipBound = "1";
      let downX = 0;
      let downY = 0;
      el.addEventListener(
        "pointerdown",
        (e) => {
          downX = e.clientX;
          downY = e.clientY;
        },
        { passive: true }
      );
      el.addEventListener("click", (e) => {
        if (e.target.closest(".btn-speak-icon")) return;
        const kana = el.dataset.kanaTip;
        if (!kana) return;
        if (Date.now() < scrollBlockUntil) return;
        const moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
        if (moved > 18) return;
        if (openLock) return;
        e.preventDefault();
        e.stopPropagation();
        openLock = true;
        open(kana);
        window.setTimeout(() => {
          openLock = false;
        }, 400);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!openLock) open(el.dataset.kanaTip);
        }
      });
    });
  }

  return { open, close, bind };
})();
