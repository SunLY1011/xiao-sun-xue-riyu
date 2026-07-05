const DictionaryView = (() => {
  let root = null;
  let state = null;
  let query = "";
  let filterLesson = "all";
  let allRows = [];

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function showZh() {
    return state?.showChineseZh !== false;
  }

  function buildAllRows() {
    const rows = [];
    for (let id = 1; id <= 24; id++) {
      const L = typeof getLessonMvp === "function" ? getLessonMvp(id) : null;
      const title = L?.lessonTitle || `第${id}課`;
      const vocab = typeof getLessonVocab === "function" ? getLessonVocab(id) : [];
      (vocab || []).forEach((v) => {
        if (!v || !v.jp) return;
        rows.push({
          lessonId: id,
          lessonTitle: title,
          id: v.id || `l${id}_v_${rows.length + 1}`,
          jp: v.jp,
          kana: v.kana || "",
          pitch: v.pitch || "",
          pos: v.pos || "",
          meaningZh: v.meaningZh || "",
        });
      });
    }
    return rows;
  }

  function warm(rows) {
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.warmPhrases) return;
    const lines = [];
    rows.slice(0, 80).forEach((r) => {
      lines.push({ jp: r.jp, kana: r.kana || r.jp });
    });
    SpeechEngine.warmPhrases(lines);
  }

  function lessonOptionsHtml() {
    const opts = ['<option value="all">全课</option>'];
    for (let id = 1; id <= 24; id++) {
      const L = typeof getLessonMvp === "function" ? getLessonMvp(id) : null;
      const title = L?.lessonTitle || `第${id}課`;
      opts.push(`<option value="${id}">第${id}課 · ${escapeHtml(title)}</option>`);
    }
    return opts.join("");
  }

  function speakBtnHtml(r) {
    const payload = { jp: r.jp, kana: r.kana || r.jp };
    if (typeof ShadowSpeak !== "undefined") {
      return ShadowSpeak.rowHtml(payload, `dict-${escapeHtml(r.id)}`, "");
    }
    if (typeof SpeakUI !== "undefined") {
      return SpeakUI.btnHtml(payload, "");
    }
    return "";
  }

  function rowHtml(r) {
    const jp = r.kana && r.kana !== r.jp ? `<ruby>${escapeHtml(r.jp)}<rt>${escapeHtml(r.kana)}</rt></ruby>` : escapeHtml(r.jp);
    const metaBits = [];
    if (r.pos) metaBits.push(r.pos);
    if (r.pitch) metaBits.push(r.pitch);
    const meta = metaBits.length ? `<p class="hint-ja dict-meta">${escapeHtml(metaBits.join(" · "))}</p>` : "";
    const zh = showZh() && r.meaningZh ? `<p class="zh-annotation dict-zh">${escapeHtml(r.meaningZh)}</p>` : "";
    return `<li class="dict-row">
      <div class="dict-main">
        <p class="dict-jp jp">${jp}</p>
        ${meta}
        ${zh}
        <p class="hint-ja dict-lesson">第${r.lessonId}課 · ${escapeHtml(r.lessonTitle)}</p>
      </div>
      ${speakBtnHtml(r)}
    </li>`;
  }

  function match(r, q) {
    if (!q) return true;
    const t = q.toLowerCase();
    const hay = [r.jp, r.kana, r.meaningZh, r.pos, r.pitch, r.lessonTitle].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(t);
  }

  function filteredRows() {
    const q = (query || "").trim();
    return allRows.filter((r) => {
      if (filterLesson !== "all" && String(r.lessonId) !== String(filterLesson)) return false;
      return match(r, q);
    });
  }

  function render() {
    if (!root) return;
    if (!allRows.length) allRows = buildAllRows();
    const rows = filteredRows();
    warm(rows);
    root.innerHTML = `
      <div class="dict-wrap">
        <div class="dict-head">
          <h2 class="dict-title">単語辞書</h2>
          <p class="hint-ja">全 24 課の単語を検索できます（中文释义为小字辅助）。</p>
        </div>
        <div class="dict-controls">
          <input id="dict-q" class="dict-q" type="search" value="${escapeHtml(query)}" placeholder="検索：単語 / よみ / 中文 / 品詞 / 声調" />
          <select id="dict-lesson" class="dict-lesson">
            ${lessonOptionsHtml()}
          </select>
        </div>
        <p class="hint-ja dict-count">表示：${rows.length} 件</p>
        <ul class="dict-list">${rows.slice(0, 800).map((r) => rowHtml(r)).join("")}</ul>
        ${rows.length > 800 ? `<p class="hint-ja">件数が多いので先頭 800 件のみ表示しています。検索条件を絞ってください。</p>` : ""}
      </div>
    `;
    const qEl = root.querySelector("#dict-q");
    const lEl = root.querySelector("#dict-lesson");
    if (lEl) lEl.value = String(filterLesson);
    if (qEl) {
      qEl.addEventListener("input", () => {
        query = qEl.value || "";
        render();
      });
    }
    if (lEl) {
      lEl.addEventListener("change", () => {
        filterLesson = lEl.value || "all";
        render();
      });
    }
    if (typeof ShadowSpeak !== "undefined") ShadowSpeak.bind(root);
    else if (typeof SpeakUI !== "undefined") SpeakUI.bind(root);
  }

  function mount(el, opts = {}) {
    root = el;
    state = opts.state || (typeof loadMvpState === "function" ? loadMvpState() : {});
    query = "";
    filterLesson = "all";
    allRows = [];
    render();
  }

  function updateState(next) {
    state = next || state;
    render();
  }

  return { mount, updateState };
})();

