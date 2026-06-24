/** 统一小喇叭：绑定、预加载、播放态 */
const SpeakUI = (() => {
  const SPEAKER_SVG = `<svg class="speak-icon-svg hyo-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

  function listenInner() {
    return typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.listenInner() : SPEAKER_SVG;
  }

  let toastEl = null;
  let toastTimer = null;

  function escAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function ensureToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement("div");
    toastEl.id = "speak-toast";
    toastEl.className = "speak-toast";
    toastEl.setAttribute("role", "status");
    toastEl.hidden = true;
    document.getElementById("app")?.appendChild(toastEl);
    return toastEl;
  }

  function showToast(msg, ms = 2200) {
    const el = ensureToast();
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    if (ms > 0) {
      toastTimer = setTimeout(() => {
        el.hidden = true;
      }, ms);
    }
  }

  function hideToast() {
    const el = ensureToast();
    if (!el) return;
    el.hidden = true;
    clearTimeout(toastTimer);
  }

  if (typeof SpeechEngine !== "undefined" && SpeechEngine.setLoadingListener) {
    SpeechEngine.setLoadingListener((on) => {
      if (on) showToast("加载中…", 0);
      else hideToast();
    });
  }

  function parsePayload(btn) {
    if (!btn) return "";
    if (btn.dataset.speak) {
      try {
        return JSON.parse(btn.dataset.speak);
      } catch {
        return btn.dataset.speak;
      }
    }
    if (btn.dataset.jp) return btn.dataset.jp;
    return "";
  }

  function collectLines(root) {
    const lines = [];
    if (!root) return lines;
    root.querySelectorAll("[data-jp],[data-speak]").forEach((el) => {
      const p = parsePayload(el);
      if (typeof SpeechEngine !== "undefined" && SpeechEngine.prepareJaTtsLine) {
        const line = SpeechEngine.prepareJaTtsLine(p);
        if (line) lines.push(line);
      } else if (typeof p === "string" && p) lines.push(p);
    });
    return lines;
  }

  function prefetchRoot(root) {
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.warmPhrases) return;
    SpeechEngine.warmPhrases(collectLines(root));
  }

  /**
   * @param {string|object} payload
   * @param {string} extraAttrs 例如 id="gn-speak-title"
   */
  function btnHtml(payload, extraAttrs = "") {
    let dataAttr = "";
    if (typeof payload === "object" && payload !== null) {
      dataAttr = `data-speak="${escAttr(JSON.stringify(payload))}"`;
    } else {
      dataAttr = `data-jp="${escAttr(payload)}"`;
    }
    const ttsKey =
      typeof SpeechEngine !== "undefined" && SpeechEngine.primaryTtsKey
        ? SpeechEngine.primaryTtsKey(payload)
        : "";
    const keyAttr = ttsKey ? ` data-tts-key="${escAttr(ttsKey)}"` : "";
    const titleAttr = ttsKey ? ` title="朗读 #${escAttr(ttsKey)}"` : ' title="朗读"';
    return `<button type="button" class="btn-speak-icon hyo-l3-audio" aria-label="朗读"${titleAttr} ${extraAttrs} ${dataAttr}${keyAttr}>${listenInner()}</button>`;
  }

  /** 行内：日文 + 小喇叭 */
  function lineHtml(jpText, payload, extraClass = "") {
    const p = payload != null ? payload : jpText;
    return `<span class="speak-line ${extraClass}"><span class="speak-line-text">${jpText}</span>${btnHtml(p)}</span>`;
  }

  function clearSpeakingState(exceptBtn) {
    document.querySelectorAll(".btn-speak-icon.is-speaking, .is-speaking.btn-speak-icon").forEach((el) => {
      if (el !== exceptBtn) el.classList.remove("is-speaking");
    });
  }

  async function speakFromButton(btn) {
    if (!btn || btn.disabled) return false;
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.speakJa) {
      showToast("音声模块未加载");
      return false;
    }
    if (typeof SpeechEngine.unlockAudioOnce === "function") SpeechEngine.unlockAudioOnce();
    if (typeof SpeechEngine.stopAllPlayback === "function") SpeechEngine.stopAllPlayback();
    if (typeof ShadowSpeak !== "undefined" && ShadowSpeak.stopReplay) ShadowSpeak.stopReplay();
    clearSpeakingState(btn);
    const payload = parsePayload(btn);
    btn.classList.add("is-speaking");
    const preferKey = btn.dataset.ttsKey || "";
    let ok = await SpeechEngine.speakJa(
      payload,
      0.85,
      preferKey ? { preferTtsKey: preferKey } : undefined
    );
    if (!ok) {
      await new Promise((r) => setTimeout(r, 220));
      if (typeof SpeechEngine.unlockAudioOnce === "function") SpeechEngine.unlockAudioOnce();
      ok = await SpeechEngine.speakJa(
        payload,
        0.85,
        preferKey ? { preferTtsKey: preferKey } : undefined
      );
    }
    if (!ok) {
      await new Promise((r) => setTimeout(r, 420));
      if (typeof SpeechEngine.unlockAudioOnce === "function") SpeechEngine.unlockAudioOnce();
      ok = await SpeechEngine.speakJa(
        payload,
        0.85,
        preferKey ? { preferTtsKey: preferKey } : undefined
      );
    }
    hideToast();
    btn.classList.remove("is-speaking");
    if (!ok) {
      const ua = navigator.userAgent || "";
      const wechat = /MicroMessenger/i.test(ua);
      const mobile = wechat || /iPhone|iPad|iPod|Android/i.test(ua);
      const ver =
        typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER ? ShareWechat.CACHE_VER : "";
      const gitee =
        Array.isArray(window.HYOUGA_TTS_MIRROR_ORIGINS) && window.HYOUGA_TTS_MIRROR_ORIGINS[0]
          ? window.HYOUGA_TTS_MIRROR_ORIGINS[0].replace(/\/$/, "")
          : "";
      if (wechat) {
        showToast(
          `语音加载失败：① 再点喇叭 ② 确认 ?v=${ver || "最新"} ③ 允许 WiFi/流量` +
            (gitee ? ` ④ 国内慢可换 ${gitee}/index.html?v=${ver || "最新"}` : ""),
          5200
        );
      } else if (mobile) {
        showToast(
          `朗读失败：① 再点喇叭 ② 等 1～2 秒 ③ 刷新 ?v=${ver || "最新"}` +
            (gitee ? " ④ GitHub 慢时试 Gitee 镜像链接" : ""),
          4200
        );
      } else {
        showToast("朗读失败：再点喇叭；首次加载约 1～2 秒，请保持网络畅通", 3200);
      }
    }
    return ok;
  }

  function bind(root, opts) {
    if (!root) return;
    const sel =
      "[data-speak], [data-jp], .btn-speak-icon, .btn-speak-round, .btn-speak, .dg-play-a, .dg-model, #dg-model, .gn-contrast-speak, .gn-hero-speak, .gn-ex-speak-inline, .gn-dense-speak, .qz-opt-speak, .qz-q-speak, .vf-speak, #vf-lesson-speak, #vf-speak-jp, #vf-speak-ex, #vf-speak-repeat, #lesson-speak-title, #gn-speak-explain, #gn-speak-example, #mini-speak-title, #mini-speak-ex";
    root.querySelectorAll(sel).forEach((btn) => {
      if (btn.dataset.speakBound === "1") return;
      /* 跟读行 🔊 由 ShadowSpeak 绑定，避免双重点击叠音 */
      if (btn.dataset.ssPlay === "1") return;
      if (btn.tagName !== "BUTTON" && !btn.dataset.speak && !btn.dataset.jp) return;
      btn.dataset.speakBound = "1";
      if (btn.classList.contains("btn-speak-round") && !btn.querySelector(".speak-icon-svg")) {
        btn.classList.remove("btn-speak-round");
        btn.classList.add("btn-speak-icon");
        btn.innerHTML = SPEAKER_SVG;
      }
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        speakFromButton(btn);
      });
    });
    if (!(opts && opts.skipPrefetch)) prefetchRoot(root);
  }

  function observe(container) {
    bind(container);
  }

  return {
    bind,
    observe,
    speakFromButton,
    showToast,
    btnHtml,
    lineHtml,
    prefetchRoot,
    SPEAKER_SVG,
  };
})();
