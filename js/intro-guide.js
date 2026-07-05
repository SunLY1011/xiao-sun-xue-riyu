/**
 * 00 入門 · 注音能力全景 v58 — 少文字 · 图文音 · 分色块
 */
(function () {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function speakPayload(text) {
    if (typeof KanaSpeak !== "undefined") return KanaSpeak.payload(text);
    return { jp: text, kana: text, ttsLine: text };
  }

  function speakBtn(text, extraClass) {
    if (typeof KanaSpeak !== "undefined") return KanaSpeak.btnHtml(text, extraClass);
    if (typeof SpeakUI === "undefined") return "";
    const cls = extraClass ? `btn-speak-icon ${extraClass}` : "btn-speak-icon";
    return SpeakUI.btnHtml(speakPayload(text), `class="${cls}" title="听"`);
  }

  function skillPill(id) {
    return `<span class="intro-skill-pill">${escapeHtml(id)}</span>`;
  }

  /** 寒暄/教室：日文 + 小号中文释义 */
  function renderPhraseRow(item, index, prefix) {
    const zh = item.zh ? `<p class="zh-annotation intro-phrase-zh">${escapeHtml(item.zh)}</p>` : "";
    const scene =
      item.scene && item.zh
        ? `<p class="hint-ja intro-phrase-scene">${escapeHtml(item.scene)}</p>`
        : "";
    const payload = speakPayload(item.jp);
    const rowId = `intro-${prefix || "ph"}-${index}`;
    const actions =
      typeof ShadowSpeak !== "undefined"
        ? `<div class="intro-greet-actions">${ShadowSpeak.rowHtml(
            payload,
            rowId,
            'data-ss-score-below class="intro-ss-row"'
          )}</div>`
        : speakBtn(item.jp);
    return `
      <div class="intro-greet-row">
        <div class="intro-phrase-text">
          <p class="jp intro-greet-jp">${escapeHtml(item.jp)}</p>
          ${zh}
          ${scene}
        </div>
        ${actions}
      </div>`;
  }

  function renderKanaChip(kana) {
    return `<span class="intro-kana-chip" data-kana-tip="${escapeHtml(kana)}" tabindex="0" role="button">
      <span class="intro-kana-chip-text">${escapeHtml(kana)}</span>
      ${speakBtn(kana)}
    </span>`;
  }

  function rowDanLabel(rowKey) {
    if (!rowKey || rowKey === "ん") return rowKey || "";
    return String(rowKey).replace(/行$/u, "");
  }

  function renderPanoramaTable() {
    const danHead = INTRO_GOJUON_DAN.map((d) => `<th class="panorama-dan">${escapeHtml(d)}</th>`).join("");

    function cellButton(c) {
      const special = c.special ? " is-special" : "";
      const roma = c.romaji ? `<span class="gojuon-roma">${escapeHtml(c.romaji)}</span>` : "";
      const ariaRoma = c.romaji ? ` · ${c.romaji}` : "";
      return `<div class="panorama-cell has-sensei-tip${special}" data-kana-tip="${escapeHtml(c.kana)}" tabindex="0" role="button" aria-label="${escapeHtml(c.kana)}${ariaRoma}${c.special ? " · 易错" : ""}">
        <span class="gojuon-kana">${escapeHtml(c.kana)}</span>
        ${roma}
        ${speakBtn(c.kana, "intro-speak-cell")}
      </div>`;
    }

    const body = INTRO_GOJUON_SEION.map((row) => {
      if (row.row === "ん") {
        const c = row.cells[0];
        return `<tr>
          <td class="panorama-row-label">${escapeHtml(rowDanLabel(row.row))}</td>
          <td colspan="5" class="panorama-n-cell">${cellButton(c)}</td>
        </tr>`;
      }
      const cells = row.cells
        .map((c, i) => {
          if (!c) return `<td class="panorama-empty" aria-hidden="true"></td>`;
          return `<td>${cellButton(c)}</td>`;
        })
        .join("");
      return `<tr><td class="panorama-row-label">${escapeHtml(rowDanLabel(row.row))}</td>${cells}</tr>`;
    }).join("");

    return `
      <section class="intro-block intro-block--map intro-block--sk01-edge">
        <header class="intro-block-head">${skillPill("SK-01")}<span class="intro-block-title">注音全景</span></header>
        <div class="intro-panorama-scroll">
          <table class="intro-panorama-table" aria-label="注音全景表">
            <thead><tr><th class="panorama-corner">行＼段</th>${danHead}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        <p class="intro-panorama-legend zh-annotation">清音 46 字 · 空格无现代假名 · 淡黄格＝易错音 · 点格看「先生のひとこと」</p>
      </section>`;
  }

  function renderTrapRow(s) {
    return `
      <div class="intro-trap-row">
        <div class="intro-trap-main has-sensei-tip" data-kana-tip="${escapeHtml(s.kana)}" tabindex="0" role="button">
          <span class="intro-trap-kana">${escapeHtml(s.kana)}</span>
          ${speakBtn(s.kana)}
        </div>
        <div class="intro-trap-homophone" aria-label="谐音助记">
          <span class="intro-homophone-han">${escapeHtml(s.homophone)}</span>
          <span class="zh-annotation intro-homophone-note">${escapeHtml(s.homophoneNote)}</span>
        </div>
        <div class="intro-trap-demo">
          <span class="intro-demo-kana jp">${escapeHtml(s.demo)}</span>
          ${speakBtn(s.demo)}
        </div>
      </div>`;
  }

  function renderRuleRow(rule) {
    if (rule.pairs) {
      return rule.pairs
        .map((p) => {
          return `<li class="intro-rule-row">
            <span class="intro-rule-text">${escapeHtml(rule.text)}</span>
            <div class="intro-pair-inline">
              <span class="jp">${escapeHtml(p.a)}</span>${speakBtn(p.a)}
              <span class="pair-vs">≠</span>
              <span class="jp">${escapeHtml(p.b)}</span>${speakBtn(p.b)}
            </div>
          </li>`;
        })
        .join("");
    }
    const chips = (rule.samples || []).map((k) => renderKanaChip(k)).join("");
    return `<li class="intro-rule-row">
      <span class="intro-rule-text">${escapeHtml(rule.text)}</span>
      <div class="intro-rule-chips">${chips}</div>
    </li>`;
  }

  function renderBeatRow(beats, label) {
    const cells = beats.map((on) => `<span class="intro-beat ${on ? "on" : ""}"></span>`).join("");
    return `<div class="intro-beat-row"><span class="intro-beat-label">${escapeHtml(label)}</span><div class="intro-beats">${cells}</div></div>`;
  }

  function renderPairBeats(p) {
    const aN = p.aBeats || 3;
    const bN = p.bBeats || 4;
    const aArr = Array.from({ length: aN }, () => 1);
    const bArr = Array.from({ length: bN }, () => 1);
    return `<div class="intro-beat-compare">${renderBeatRow(aArr, p.a)}${renderBeatRow(bArr, p.b)}</div>`;
  }

  function renderSynergyCategoryBody(cat) {
    if (cat.theme === "trap") {
      return `<div class="intro-trap-list">${INTRO_SPECIAL_ROMAJI.map(renderTrapRow).join("")}</div>`;
    }
    const rules = (cat.rules || [])
      .map((rule) => {
        if (rule.pairs) {
          return rule.pairs
            .map((p) => {
              return `<li class="intro-rule-row">
            <span class="intro-rule-text">${escapeHtml(rule.text)}</span>
            ${renderPairBeats(p)}
            <div class="intro-pair-inline">
              <span class="jp">${escapeHtml(p.a)}</span>${speakBtn(p.a)}
              <span class="pair-vs">≠</span>
              <span class="jp">${escapeHtml(p.b)}</span>${speakBtn(p.b)}
            </div>
          </li>`;
            })
            .join("");
        }
        const chips = (rule.samples || []).map((k) => renderKanaChip(k)).join("");
        return `<li class="intro-rule-row">
      <span class="intro-rule-text">${escapeHtml(rule.text)}</span>
      <div class="intro-rule-chips">${chips}</div>
    </li>`;
      })
      .join("");
    return `<ul class="intro-rule-list">${rules}</ul>`;
  }

  function renderSynergyAccordion(activePhase) {
    return INTRO_SYNERGY_CATEGORIES.map((cat, i) => {
      const open = i === 0 ? " open" : "";
      return `<details class="intro-cat-accordion intro-cat--${cat.theme}"${open}>
        <summary class="intro-cat-summary">
          ${skillPill(cat.skillLabel)}
          <span class="intro-cat-label">${escapeHtml(cat.label)}</span>
        </summary>
        <div class="intro-cat-accordion-body">${renderSynergyCategoryBody(cat)}</div>
      </details>`;
    }).join("");
  }

  /** 一层一名 · 中日双语（上日文下中文，避免两行都像层名） */
  function renderLayerNav(progress, activePhase) {
    return INTRO_LAYERS.map((L, i) => {
      const done = progress.phaseDone[i];
      const active = L.phase === activePhase;
      const title = `${L.labelJa} · ${L.label} — ${L.goal}`;
      return `<button type="button" class="intro-layer-tab intro-layer--${L.id} ${active ? "active" : ""} ${done ? "done" : ""}"
        data-phase="${L.phase}" title="${escapeHtml(title)}">
        <span class="intro-layer-ja jp">${escapeHtml(L.labelJa)}</span>
        <span class="intro-layer-zh">${escapeHtml(L.label)}</span>
      </button>`;
    }).join("");
  }

  function renderLayerProgress() {
    return "";
  }

  function renderFoundationPanel() {
    const L = INTRO_LAYERS[0];
    return `
      <section class="intro-phase-panel intro-phase-panel--flat intro-panel--foundation" data-phase-panel="1">
        ${renderPanoramaTable()}
        <p class="intro-check-line" data-check>${escapeHtml(L.check)}</p>
      </section>`;
  }

  function renderSynergyPanel() {
    const L = INTRO_LAYERS[1];
    return `
      <section class="intro-phase-panel intro-phase-panel--flat intro-panel--synergy" data-phase-panel="2" hidden>
        <div class="intro-synergy-accordion intro-synergy-accordion--edge">${renderSynergyAccordion()}</div>
        <p class="intro-check-line" data-check>${escapeHtml(L.check)}</p>
      </section>`;
  }

  function renderCorePanel() {
    const L = INTRO_LAYERS[2];
    const scripts = INTRO_SCRIPT_TYPES.map(
      (s) => `
      <div class="intro-script-mini">
        <span class="intro-script-icon">${s.icon}</span>
        <span class="jp">${escapeHtml(s.name)}</span>
        ${s.zh ? `<span class="intro-script-zh zh-annotation">${escapeHtml(s.zh)}</span>` : ""}
      </div>`
    ).join("");

    const greets = INTRO_GREETINGS.map((item, i) => renderPhraseRow(item, i, "greet")).join("");
    const classroom = INTRO_CLASSROOM.map((item, i) => renderPhraseRow(item, i, "class")).join("");

    return `
      <section class="intro-phase-panel intro-phase-panel--flat intro-panel--core" data-phase-panel="3" hidden>
        <section class="intro-block intro-block--script">
          <header class="intro-block-head">${skillPill("SK-08")}<span class="intro-block-title">三种字</span></header>
          <div class="intro-script-row">${scripts}</div>
          <div class="intro-mixed-row">
            <p class="jp intro-mixed-line">わたしはコーヒーを飲みます。</p>
            ${
              typeof ShadowSpeak !== "undefined"
                ? `<div class="intro-greet-actions">${ShadowSpeak.rowHtml(
                    speakPayload("わたしはコーヒーを飲みます。"),
                    "intro-mixed-demo",
                    'data-ss-score-below class="intro-ss-row"'
                  )}</div>`
                : speakBtn("わたしはコーヒーを飲みます。")
            }
          </div>
        </section>
        <section class="intro-block intro-block--greet">
          <header class="intro-block-head">${skillPill("SK-09")}<span class="intro-block-title">寒暄</span></header>
          <div class="intro-greet-stack">${greets}</div>
        </section>
        <section class="intro-block intro-block--class">
          <header class="intro-block-head">${skillPill("SK-10")}<span class="intro-block-title">教室</span></header>
          <div class="intro-greet-stack">${classroom}</div>
        </section>
        <p class="intro-check-line" data-check>${escapeHtml(L.check)}</p>
      </section>`;
  }

  function goToCourseHome() {
    const ver =
      typeof CACHE_VER !== "undefined"
        ? CACHE_VER
        : typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER
          ? ShareWechat.CACHE_VER
          : "";
    const params = new URLSearchParams();
    if (ver) params.set("v", String(ver));
    params.set("nosplash", "1");
    if (new URLSearchParams(location.search).get("embed") === "1") params.set("embed", "1");
    const qs = params.toString();
    const url = `index.html${qs ? `?${qs}` : ""}`;
    if (window.self !== window.top) {
      window.top.location.href = url;
    } else {
      location.href = url;
    }
  }

  function bindLayerTabs(root, progress) {
    root.querySelectorAll(".intro-layer-tab").forEach((tab) => {
      tab.onclick = () => showPhase(Number(tab.dataset.phase), progress);
    });
  }

  function bindPhase(progress, activePhase) {
    const root = document.getElementById("intro-root");
    if (!root) return;

    bindLayerTabs(root, progress);

    if (!root.dataset.introPhaseBound) {
      root.dataset.introPhaseBound = "1";
      document.getElementById("btn-phase-done")?.addEventListener("click", () => {
        const phase = Number(root.getAttribute("data-active-phase") || "1");
        const idx = phase - 1;
        const allDone = progress.phaseDone.every(Boolean);

        if (allDone) {
          saveIntroProgress(progress);
          goToCourseHome();
          return;
        }

        if (!progress.phaseDone[idx]) {
          progress.phaseDone[idx] = true;
          saveIntroProgress(progress);
          const nextIncomplete = progress.phaseDone.findIndex((d) => !d) + 1;
          const goPhase = nextIncomplete > 0 ? nextIncomplete : 3;
          updateProgressUI(progress, goPhase);
          showPhase(goPhase, progress);
          if (progress.phaseDone.every(Boolean)) {
            requestAnimationFrame(() => {
              document.getElementById("btn-phase-done")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }
          return;
        }

        const nextIncomplete = progress.phaseDone.findIndex((d) => !d) + 1;
        if (nextIncomplete > 0) {
          showPhase(nextIncomplete, progress);
          updateProgressUI(progress, nextIncomplete);
        }
      });
    }

    if (typeof SpeakUI !== "undefined") SpeakUI.bind(root, { skipPrefetch: true });
    if (typeof ShadowSpeak !== "undefined") ShadowSpeak.bind(root);
    if (typeof IntroKanaTip !== "undefined") IntroKanaTip.bind(root);
  }

  function showPhase(id, progress) {
    document.querySelectorAll(".intro-phase-panel").forEach((p) => {
      p.hidden = Number(p.dataset.phasePanel) !== id;
    });
    document.querySelectorAll(".intro-layer-tab").forEach((t) => {
      t.classList.toggle("active", Number(t.dataset.phase) === id);
    });
    const L = INTRO_LAYERS[id - 1];
    const doneBtn = document.getElementById("btn-phase-done");
    if (doneBtn && L) {
      const done = progress.phaseDone[id - 1];
      const allDone = progress.phaseDone.every(Boolean);
      if (allDone) {
        doneBtn.textContent = "回到课文首页 →";
        doneBtn.setAttribute("aria-label", "入門已完成，返回课程首页");
      } else if (done) {
        const next = progress.phaseDone.findIndex((d) => !d) + 1;
        doneBtn.textContent =
          next > 0 ? `继续 · ${INTRO_LAYERS[next - 1].label}` : `完成${L.label}`;
      } else {
        doneBtn.textContent = `完成${L.label}`;
      }
    }
    document.getElementById("intro-root")?.setAttribute("data-active-phase", String(id));
  }

  function updateProgressUI(progress, activePhase) {
    const nav = document.getElementById("intro-layer-nav");
    if (nav) nav.innerHTML = renderLayerNav(progress, activePhase);
    bindPhase(progress, activePhase);
  }

  function init() {
    const progress = loadIntroProgress();
    let activePhase = 1;
    if (progress.phaseDone[0] && !progress.phaseDone[1]) activePhase = 2;
    if (progress.phaseDone[0] && progress.phaseDone[1] && !progress.phaseDone[2]) activePhase = 3;
    if (progress.phaseDone.every(Boolean)) activePhase = 3;

    const root = document.getElementById("intro-root");
    if (!root) return;

    root.innerHTML = `
      <section class="intro-archive-card" aria-label="注音能力档案">
        <nav class="intro-layer-nav intro-layer-nav--in-card" id="intro-layer-nav" aria-label="基础·协同·核心">${renderLayerNav(progress, activePhase)}</nav>
        <div class="intro-archive-body">
          ${renderFoundationPanel()}${renderSynergyPanel()}${renderCorePanel()}
        </div>
      </section>
      <div class="intro-phase-actions">
        <button type="button" class="btn primary" id="btn-phase-done">完成基础</button>
      </div>`;

    showPhase(activePhase, progress);
    updateProgressUI(progress, activePhase);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
