/**
 * L0 五十音书写 · 清音 46+ん · 田字格 Canvas
 * 独立进度 state.write.kanaDone，不影响课内海星。
 * v2 · 瓦片棋盘 + Zone A/B（见 书写板块/03-版面重设计-v2-讨论稿.md）
 */
const WriteKanaL0 = (function () {
  const STROKE_COLOR = "#37474F";
  const STROKE_WIDTH = 2.8;

  const SCRIPT_LABELS = {
    hiragana: { jp: "ひらがな", zh: "平假名" },
    katakana: { jp: "カタカナ", zh: "片假名" },
  };

  const BIAORI_READING_NOTE = {
    を: "读 o · 写作を",
    し: "读 shi",
    ち: "读 chi",
    つ: "读 tsu",
    ふ: "读 fu",
  };

  let hostEl = null;
  let stateRef = null;
  let persistFn = null;
  let screen = "grid";
  let currentEntry = null;
  let drawing = false;
  let canvasCtx = null;
  let canvasEl = null;
  let lastPoint = null;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function rowDanLabel(rowKey) {
    if (!rowKey || rowKey === "ん") return rowKey || "";
    return String(rowKey).replace(/行$/u, "");
  }

  function ensureWriteState(state) {
    if (!state.write || typeof state.write !== "object") {
      state.write = { kanaDone: {}, script: "hiragana" };
    }
    if (!state.write.kanaDone || typeof state.write.kanaDone !== "object") {
      state.write.kanaDone = {};
    }
    if (!state.write.script) state.write.script = "hiragana";
    return state.write;
  }

  function toKatakana(hiragana) {
    return [...hiragana].map((ch) => {
      const c = ch.codePointAt(0);
      if (c >= 0x3041 && c <= 0x3096) return String.fromCodePoint(c + 0x60);
      return ch;
    }).join("");
  }

  function doneKey(entry) {
    return entry.kana;
  }

  function isDone(entry) {
    return !!ensureWriteState(stateRef).kanaDone[doneKey(entry)];
  }

  function setDone(entry, val) {
    const w = ensureWriteState(stateRef);
    if (val) w.kanaDone[doneKey(entry)] = true;
    else delete w.kanaDone[doneKey(entry)];
    if (persistFn) persistFn(stateRef);
  }

  function flatKanaList() {
    if (typeof INTRO_GOJUON_SEION !== "undefined" && Array.isArray(INTRO_GOJUON_SEION)) {
      const list = [];
      INTRO_GOJUON_SEION.forEach((row) => {
        (row.cells || []).forEach((c) => {
          if (c && c.kana) list.push({ kana: c.kana, row: row.row, romaji: c.romaji || "" });
        });
      });
      return list;
    }
    return [];
  }

  function progressCount() {
    const all = flatKanaList();
    const done = all.filter((e) => isDone(e)).length;
    return { done, total: all.length };
  }

  function introHref() {
    return typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER
      ? `intro.html?v=${ShareWechat.CACHE_VER}`
      : "intro.html";
  }

  function speakBtnHtml(kana) {
    if (typeof KanaSpeak !== "undefined") {
      return KanaSpeak.btnHtml(kana, "write-l0-speak");
    }
    if (typeof SpeakUI === "undefined") return "";
    const payload = { jp: kana, kana, ttsLine: kana };
    return SpeakUI.btnHtml(payload, 'class="btn-speak-icon write-l0-speak" title="听"');
  }

  function tileButtonHtml(c, w) {
    const entry = { kana: c.kana, row: "", romaji: c.romaji || "" };
    const doneCls = isDone(entry) ? " is-done" : "";
    const show = w.script === "katakana" ? toKatakana(c.kana) : c.kana;
    const pairBlock =
      w.script === "katakana"
        ? `<span class="write-l0-tile-hira">${escapeHtml(c.kana)}</span>`
        : "";
    return (
      `<button type="button" class="write-l0-tile${doneCls}" data-kana="${escapeHtml(c.kana)}" ` +
      `aria-label="书写 ${escapeHtml(show)}${w.script === "katakana" ? " 平假名 " + c.kana : ""}">` +
      `<span class="write-l0-tile-kana">${escapeHtml(show)}</span>` +
      `<span class="write-l0-tile-roma">${escapeHtml(c.romaji || "")}</span>` +
      `${pairBlock}</button>`
    );
  }

  function buildTileBoard(w) {
    const danList =
      typeof INTRO_GOJUON_DAN !== "undefined" ? INTRO_GOJUON_DAN : ["あ", "い", "う", "え", "お"];
    const danHead = danList
      .map((d) => `<span class="write-l0-tile-dan">${escapeHtml(d)}</span>`)
      .join("");

    let rows = "";
    if (typeof INTRO_GOJUON_SEION !== "undefined") {
      rows = INTRO_GOJUON_SEION.map((row) => {
        const label = escapeHtml(rowDanLabel(row.row));
        const cells = (row.cells || [])
          .map((c) => {
            if (!c) return '<span class="write-l0-tile-slot is-empty" aria-hidden="true"></span>';
            return tileButtonHtml(c, w);
          })
          .join("");
        const sparse = (row.cells || []).filter(Boolean).length < 5;
        const rowCls = sparse ? " write-l0-tile-row--sparse" : "";
        return (
          `<div class="write-l0-tile-row${rowCls}">` +
          `<span class="write-l0-tile-row-label" aria-hidden="true">${label}</span>` +
          `<div class="write-l0-tile-row-cells">${cells}</div></div>`
        );
      }).join("");
    }

    return (
      `<div class="write-l0-tile-board" aria-label="清音书写表">` +
      `<div class="write-l0-tile-dan-row" aria-hidden="true">` +
      `<span class="write-l0-tile-corner"></span>${danHead}</div>${rows}</div>`
    );
  }

  function helpDrawerHtml() {
    const href = escapeHtml(introHref());
    return (
      `<div class="write-l0-drawer" id="write-l0-drawer" hidden>` +
      `<div class="write-l0-drawer-backdrop" id="write-l0-drawer-backdrop" aria-hidden="true"></div>` +
      `<div class="write-l0-drawer-panel" role="dialog" aria-labelledby="write-l0-drawer-title">` +
      `<div class="write-l0-drawer-head">` +
      `<h3 id="write-l0-drawer-title">怎么练 · 4 步</h3>` +
      `<button type="button" class="write-l0-drawer-close" id="write-l0-drawer-close" aria-label="关闭">✕</button>` +
      `</div>` +
      `<ol class="write-l0-drawer-steps zh-annotation">` +
      `<li><strong>认</strong>：底栏「注音」听清读音与行段</li>` +
      `<li><strong>看</strong>：点假名 → 一览笔顺（分色·数字·箭头）</li>` +
      `<li><strong>写</strong>：田字格内跟分色笔顺摹写</li>` +
      `<li><strong>完成</strong>：点完成打勾，随时可重练</li>` +
      `</ol>` +
      `<div class="write-l0-drawer-actions">` +
      `<a class="btn ghost" href="${href}">去注音</a>` +
      `<button type="button" class="btn primary" id="write-l0-drawer-ok">知道了</button>` +
      `</div></div></div>`
    );
  }

  function bindHelpDrawer() {
    const drawer = hostEl.querySelector("#write-l0-drawer");
    const openBtn = hostEl.querySelector("#write-l0-help-btn");
    if (!drawer || !openBtn) return;

    function close() {
      drawer.hidden = true;
      document.body.classList.remove("write-l0-drawer-open");
    }
    function open() {
      drawer.hidden = false;
      document.body.classList.add("write-l0-drawer-open");
    }

    openBtn.addEventListener("click", open);
    drawer.querySelector("#write-l0-drawer-close")?.addEventListener("click", close);
    drawer.querySelector("#write-l0-drawer-ok")?.addEventListener("click", close);
    drawer.querySelector("#write-l0-drawer-backdrop")?.addEventListener("click", close);
  }

  function renderGrid() {
    if (typeof WriteKanaStrokeUI !== "undefined") WriteKanaStrokeUI.destroy();
    screen = "grid";
    const { done, total } = progressCount();
    const w = ensureWriteState(stateRef);
    const pct = total ? Math.round((done / total) * 100) : 0;

    hostEl.classList.add("is-v2-grid");
    hostEl.innerHTML =
      `<div class="write-l0-v2">` +
      `<header class="write-l0-zone-a">` +
      `<div class="write-l0-zone-a-head">` +
      `<h2 class="write-l0-zone-a-title">書く · 五十音</h2>` +
      `<button type="button" class="write-l0-help-btn" id="write-l0-help-btn" aria-label="怎么练">?</button>` +
      `<span class="write-l0-zone-a-count" aria-live="polite">已练 ${done}/${total}</span>` +
      `</div>` +
      `<div class="write-l0-progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}" aria-label="书写进度">` +
      `<div class="write-l0-progress-fill" style="width:${pct}%"></div></div>` +
      `</header>` +
      `<div class="write-l0-zone-b">` +
      `<div class="write-l0-segment write-l0-script-toggle" role="group" aria-label="假名种类">` +
      `<button type="button" data-script="hiragana" class="${w.script === "hiragana" ? "is-on" : ""}">` +
      `<span class="write-l0-segment-jp">${SCRIPT_LABELS.hiragana.jp}</span>` +
      `<span class="write-l0-segment-zh zh-annotation">${SCRIPT_LABELS.hiragana.zh}</span>` +
      `</button>` +
      `<button type="button" data-script="katakana" class="${w.script === "katakana" ? "is-on" : ""}">` +
      `<span class="write-l0-segment-jp">${SCRIPT_LABELS.katakana.jp}</span>` +
      `<span class="write-l0-segment-zh zh-annotation">${SCRIPT_LABELS.katakana.zh}</span>` +
      `</button></div></div>` +
      `<div class="write-l0-zone-c">${buildTileBoard(w)}</div>` +
      `</div>` +
      helpDrawerHtml();

    hostEl.querySelectorAll(".write-l0-tile[data-kana]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kana = btn.getAttribute("data-kana");
        const entry = flatKanaList().find((e) => e.kana === kana);
        if (entry) openSheet(entry);
      });
    });
    hostEl.querySelectorAll(".write-l0-script-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => {
        w.script = btn.getAttribute("data-script") || "hiragana";
        if (persistFn) persistFn(stateRef);
        renderGrid();
      });
    });
    bindHelpDrawer();
  }

  function resizeCanvas() {
    if (!canvasEl || !canvasCtx) return;
    const box = canvasEl.parentElement;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    canvasEl.width = w;
    canvasEl.height = h;
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasCtx.lineCap = "round";
    canvasCtx.lineJoin = "round";
    canvasCtx.strokeStyle = STROKE_COLOR;
    canvasCtx.lineWidth = STROKE_WIDTH;
  }

  function clearCanvas() {
    if (!canvasEl || !canvasCtx) return;
    const rect = canvasEl.getBoundingClientRect();
    canvasCtx.clearRect(0, 0, rect.width, rect.height);
  }

  function pointFromEvent(ev) {
    const rect = canvasEl.getBoundingClientRect();
    const clientX = ev.clientX != null ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
    const clientY = ev.clientY != null ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function bindCanvas() {
    if (!canvasEl) return;
    const start = (ev) => {
      ev.preventDefault();
      drawing = true;
      lastPoint = pointFromEvent(ev);
    };
    const move = (ev) => {
      if (!drawing) return;
      ev.preventDefault();
      const p = pointFromEvent(ev);
      canvasCtx.beginPath();
      canvasCtx.moveTo(lastPoint.x, lastPoint.y);
      canvasCtx.lineTo(p.x, p.y);
      canvasCtx.stroke();
      lastPoint = p;
    };
    const end = () => {
      drawing = false;
      lastPoint = null;
    };
    canvasEl.addEventListener("pointerdown", start);
    canvasEl.addEventListener("pointermove", move);
    canvasEl.addEventListener("pointerup", end);
    canvasEl.addEventListener("pointercancel", end);
    canvasEl.addEventListener("pointerleave", end);
  }

  function strokeGuideChar(entry) {
    const w = ensureWriteState(stateRef);
    const hira = entry.kana;
    if (typeof WriteKanaStrokeUI !== "undefined" && WriteKanaStrokeUI.hasGuide(hira, hira, w.script)) {
      return w.script === "katakana" ? toKatakana(hira) : hira;
    }
    return hira;
  }

  function sheetHeadingHtml(entry) {
    const w = ensureWriteState(stateRef);
    const hira = entry.kana;
    const rowMeta = rowDanLabel(entry.row === "ん" ? "ん" : entry.row) || "清音";
    const roma = entry.romaji ? `<span class="write-l0-sheet-roma">${escapeHtml(entry.romaji)}</span>` : "";
    if (w.script === "katakana") {
      const kata = toKatakana(hira);
      return (
        `<span class="write-l0-sheet-kana-main jp">${escapeHtml(kata)}</span>` +
        roma +
        `<span class="write-l0-sheet-pair-inline jp" title="平假名对照">${escapeHtml(hira)}</span>` +
        `<span class="write-l0-sheet-meta">${escapeHtml(rowMeta)}</span>`
      );
    }
    return (
      `<span class="write-l0-sheet-kana-main jp">${escapeHtml(hira)}</span>` +
      roma +
      `<span class="write-l0-sheet-meta">${escapeHtml(rowMeta)}</span>`
    );
  }

  function nazorigakiKnowledgeHtml(kana, script) {
    const m =
      script === "katakana" && typeof KANA_NAZORIGAKI_KATA_META !== "undefined"
        ? KANA_NAZORIGAKI_KATA_META[kana]
        : typeof KANA_NAZORIGAKI_META !== "undefined"
          ? KANA_NAZORIGAKI_META[kana]
          : null;
    if (!m) return "";
    const parts = [];
    if (m.examples && m.examples.length) {
      const words = m.examples
        .map((w) => `<span class="write-l0-nazo-word jp">${escapeHtml(w)}</span>`)
        .join("");
      parts.push(`<p class="write-l0-nazo-examples"><span class="zh-annotation">例词</span> ${words}</p>`);
    }
    if (m.techniques && m.techniques.length) {
      const tech = m.techniques.map((t) => `<span class="write-l0-nazo-tech jp">${escapeHtml(t)}</span>`).join(" · ");
      parts.push(`<p class="write-l0-nazo-techniques zh-annotation">笔锋：${tech}</p>`);
    }
    if (m.rowPeers && m.rowPeers.length > 1) {
      const current = script === "katakana" && m.kana ? m.kana : kana;
      const peers = m.rowPeers
        .map((p) => `<span class="write-l0-nazo-peer jp${p === current ? " is-current" : ""}">${escapeHtml(p)}</span>`)
        .join("");
      parts.push(
        `<p class="write-l0-nazo-row"><span class="zh-annotation">${escapeHtml(m.rowLabel || "")}</span> ${peers}</p>`
      );
    }
    if (!parts.length) return "";
    return `<div class="write-l0-nazo-knowledge" id="write-l0-nazo-knowledge">${parts.join("")}</div>`;
  }

  function openSheet(entry) {
    if (typeof WriteKanaStrokeUI !== "undefined") WriteKanaStrokeUI.destroy();
    screen = "sheet";
    currentEntry = entry;
    hostEl.classList.remove("is-v2-grid");
    hostEl.classList.add("is-v2-sheet");
    const readNote = BIAORI_READING_NOTE[entry.kana] || "";
    const wSheet = ensureWriteState(stateRef);
    const hasNazoKata =
      wSheet.script === "katakana" &&
      typeof KANA_NAZORIGAKI_KATA !== "undefined" &&
      !!KANA_NAZORIGAKI_KATA[entry.kana];
    const kataBadge =
      wSheet.script === "katakana" && !hasNazoKata
        ? `<span class="write-l0-kata-badge jp" title="笔顺按平假名">ひらがな ${escapeHtml(entry.kana)}</span>`
        : "";

    hostEl.innerHTML =
      `<div class="write-l0-sheet write-l0-sheet--v2">` +
      `<header class="write-l0-sheet-head">` +
      `<button type="button" class="write-l0-back" id="write-l0-back" aria-label="返回清音表">←</button>` +
      `<h2 class="write-l0-sheet-heading">${sheetHeadingHtml(entry)}</h2>` +
      `${speakBtnHtml(entry.kana)}` +
      `</header>` +
      `${readNote ? `<p class="write-l0-biaori-note zh-annotation">${escapeHtml(readNote)}</p>` : ""}` +
      `${nazorigakiKnowledgeHtml(entry.kana, wSheet.script)}` +
      `<div class="write-l0-sheet-stage">` +
      `<div class="write-l0-stage-card">${kataBadge}` +
      `<div class="write-l0-mizige-wrap">` +
      `<div class="write-l0-mizige" id="write-l0-mizige">` +
      `<div class="write-l0-mizige-gridlines" aria-hidden="true"></div>` +
      `<div class="write-l0-trace-char" aria-hidden="true"></div>` +
      `<canvas class="write-l0-canvas" id="write-l0-canvas" aria-label="书写区域"></canvas>` +
      `</div></div></div></div>` +
      `<div class="write-l0-control-deck" id="write-l0-control-deck">` +
      `<p class="write-l0-sheet-fallback-hint zh-annotation" id="write-l0-sheet-fallback" hidden>在田字格内书写 · 该字笔顺数据准备中</p>` +
      `</div>` +
      `<div class="write-l0-sheet-actions">` +
      `<button type="button" class="btn ghost" id="write-l0-clear">清除笔迹</button>` +
      `<button type="button" class="btn primary" id="write-l0-done">完成 · 返回清音表</button>` +
      `</div></div>`;

    canvasEl = document.getElementById("write-l0-canvas");
    canvasCtx = canvasEl.getContext("2d");
    bindCanvas();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("write-nazo-layout", resizeCanvas);

    const mizige = document.getElementById("write-l0-mizige");
    if (typeof WriteKanaStrokeUI !== "undefined" && mizige) {
      const guideChar = strokeGuideChar(entry);
      const displayChar = wSheet.script === "katakana" ? toKatakana(entry.kana) : entry.kana;
      const fallback = document.getElementById("write-l0-sheet-fallback");
      if (!WriteKanaStrokeUI.hasGuide(guideChar, entry.kana, wSheet.script)) {
        if (fallback) fallback.hidden = false;
      } else {
        if (fallback) fallback.hidden = true;
        WriteKanaStrokeUI.mount(mizige, guideChar, {
          script: wSheet.script,
          displayChar,
          guideHira: entry.kana,
        });
      }
    }

    function leaveSheet() {
      if (typeof WriteKanaStrokeUI !== "undefined") WriteKanaStrokeUI.destroy();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("write-nazo-layout", resizeCanvas);
      hostEl.classList.remove("is-v2-sheet");
    }

    document.getElementById("write-l0-clear").addEventListener("click", () => {
      clearCanvas();
    });
    document.getElementById("write-l0-done").addEventListener("click", () => {
      setDone(entry, true);
      if (typeof touchStudyDay === "function") touchStudyDay(stateRef);
      leaveSheet();
      renderGrid();
    });
    document.getElementById("write-l0-back").addEventListener("click", () => {
      leaveSheet();
      renderGrid();
    });

    if (typeof KanaSpeak !== "undefined") KanaSpeak.bindButtons(hostEl);
    else if (typeof SpeakUI !== "undefined") SpeakUI.bind(hostEl);
  }

  function render(root, state, onPersist) {
    if (!root) return;
    hostEl = root;
    stateRef = state;
    persistFn = onPersist;
    ensureWriteState(stateRef);
    if (flatKanaList().length === 0) {
      hostEl.innerHTML =
        '<p class="write-l0-hint">清音数据未加载，请刷新页面。</p>';
      return;
    }
    if (screen === "sheet" && currentEntry) openSheet(currentEntry);
    else renderGrid();
  }

  return { render, flatKanaList, progressCount };
})();
