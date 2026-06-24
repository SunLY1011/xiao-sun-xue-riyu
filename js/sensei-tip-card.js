/** 课内统一「提示」— 一条直接展示；多条可折叠，展开逐行 */
const SenseiTipCard = (() => {
  const TITLE = "先生のひとこと";
  const ARIA_LABEL = "提示";
  const LABEL = "提示：";
  const SINGLE_LINE_MAX = 72;

  /** 仅保留「提示：」文字，不再显示左侧三角叹号 */
  function markHtml() {
    return "";
  }

  function labelHtml() {
    return `<span class="hyouga-tip-label">${LABEL}</span>`;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function showZh() {
    return document.documentElement.dataset.showZh !== "0";
  }

  function flattenTipLines(items, opts = {}) {
    const zhFirst = !!opts.zhFirst;
    const rows = [];
    (items || []).forEach((l) => {
      if (!l) return;
      const ja = l.ja ? String(l.ja).trim() : "";
      const zh =
        l.zh && (showZh() || opts.forceZh) ? String(l.zh).trim() : "";
      if (zhFirst) {
        if (zh) rows.push({ kind: "zh", text: zh });
        if (ja) rows.push({ kind: "ja", text: ja });
      } else {
        if (ja) rows.push({ kind: "ja", text: ja });
        if (zh) rows.push({ kind: "zh", text: zh });
      }
    });
    return rows.filter((r) => r.text);
  }

  function expandedRows(rows) {
    const out = [];
    rows.forEach((r) => {
      const parts = r.text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) parts.forEach((p) => out.push({ kind: r.kind, text: p }));
      else out.push(r);
    });
    return out;
  }

  function isSingleLineTip(items, opts = {}) {
    const rows = flattenTipLines(items, opts);
    if (rows.length !== 1) return false;
    const text = rows[0].text;
    if (/[\n\r]/.test(text)) return false;
    if (text.length > SINGLE_LINE_MAX) return false;
    return true;
  }

  function renderLineParagraphs(rows) {
    return expandedRows(rows)
      .map((r) => {
        const cls = r.kind === "ja" ? "hyouga-tip-line jp" : "hyouga-tip-line zh-annotation";
        return `<p class="${cls}">${escapeHtml(r.text)}</p>`;
      })
      .join("");
  }

  function renderLinks(links) {
    return (links || [])
      .filter((l) => l && l.label)
      .map(
        (l) =>
          `<button type="button" class="l1-kcard-link" data-l1-gate="${l.gate != null ? l.gate : ""}" data-l1-ref="${escapeHtml(l.ref || "")}">${escapeHtml(l.label)}</button>`
      )
      .join("");
  }

  function renderRelated(related) {
    if (!related?.length) return "";
    const chips = related
      .map(
        (r) =>
          `<button type="button" class="hyouga-related-chip" data-kl-lesson="${r.lessonId}" data-kl-gate="${r.gate != null ? r.gate : ""}" data-kl-anchor="${escapeHtml(r.anchorId || "")}">${escapeHtml(r.label)}</button>`
      )
      .join("");
    return `<div class="hyouga-tip-related" role="navigation" aria-label="知识点关联"><span class="hyouga-related-label">关联：</span>${chips}</div>`;
  }

  function linksBlock(links, related) {
    const a = renderLinks(links);
    const b = renderRelated(related);
    if (!a && !b) return "";
    return `${a}${b}`;
  }

  function renderStatic(rows, linksHtml) {
    const text = rows[0]?.text || "";
    const kind = rows[0]?.kind === "ja" ? "jp" : "zh-annotation";
    return `<div class="hyouga-tip-static hyouga-tip-shell" role="note">
      ${markHtml()}${labelHtml()}<span class="hyouga-tip-text ${kind}">${escapeHtml(text)}</span>
      ${linksHtml ? `<div class="hyouga-tip-links">${linksHtml}</div>` : ""}
    </div>`;
  }

  function renderFold(rows, linksHtml, expanded) {
    const open = !!expanded;
    const body = renderLineParagraphs(rows);
    return `<article class="hyouga-tip-fold hyouga-tip-shell sensei-tip${open ? " is-open" : ""}">
      <button type="button" class="hyouga-tip-fold-head sensei-tip-head" aria-expanded="${open}" aria-label="${ARIA_LABEL}">
        ${markHtml()}${labelHtml()}
        <span class="hyouga-tip-fold-chevron" aria-hidden="true"></span>
      </button>
      <div class="hyouga-tip-fold-body hyouga-tip-body sensei-tip-body"${open ? "" : " hidden"}>
        ${body}
        ${linksHtml ? `<div class="hyouga-tip-links">${linksHtml}</div>` : ""}
      </div>
    </article>`;
  }

  /**
   * @param {{ lines?: {zh?: string, ja?: string}[], links?: object[] }} tip
   * @param {{ l1Scope?: boolean, alwaysFold?: boolean, expanded?: boolean }} [opts]
   */
  function renderFlat(rows, linksHtml) {
    return `<div class="hyouga-tip-flat hyouga-tip-shell" role="note">
      ${markHtml()}${labelHtml()}
      <div class="hyouga-tip-flat-body">${renderLineParagraphs(rows)}</div>
      ${linksHtml ? `<div class="hyouga-tip-links">${linksHtml}</div>` : ""}
    </div>`;
  }

  function fromTipPayload(tip, opts = {}) {
    if (!tip) return "";
    const items = (tip.lines || []).filter((l) => l && (l.zh || l.ja));
    if (!items.length) return "";
    const rows = flattenTipLines(items, opts);
    const linksHtml = linksBlock(tip.links, tip.related);
    if (opts.flat) return renderFlat(rows, linksHtml);
    if (isSingleLineTip(items, opts)) return renderStatic(rows, linksHtml);
    return renderFold(rows, linksHtml, !!opts.expanded);
  }

  function wrap(opts) {
    const bodyHtml = opts.bodyHtml || "";
    if (!bodyHtml.trim()) return "";
    const expanded = !!opts.expanded;
    if (opts.singleLine) {
      const plain = (opts.plainText || "").trim();
      if (plain) {
        return renderStatic([{ kind: "zh", text: plain }], "");
      }
    }
    const pCount = (bodyHtml.match(/<p\b/gi) || []).length;
    if (pCount <= 1 && !opts.forceFold) {
      const plain = opts.plainText || bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plain && plain.length <= SINGLE_LINE_MAX) {
        return `<div class="hyouga-tip-static hyouga-tip-shell" role="note">
          ${markHtml()}${labelHtml()}<span class="hyouga-tip-text zh-annotation">${escapeHtml(plain)}</span>
        </div>`;
      }
    }
    const open = expanded;
    return `<article class="hyouga-tip-fold hyouga-tip-shell sensei-tip${open ? " is-open" : ""}">
      <button type="button" class="hyouga-tip-fold-head sensei-tip-head" aria-expanded="${open}" aria-label="${ARIA_LABEL}">
        ${markHtml()}${labelHtml()}
        <span class="hyouga-tip-fold-chevron" aria-hidden="true"></span>
      </button>
      <div class="hyouga-tip-fold-body hyouga-tip-body sensei-tip-body"${open ? "" : " hidden"}>${bodyHtml}</div>
    </article>`;
  }

  function fromNotes(noteJa, noteZh, opts = {}) {
    const items = [];
    if (noteJa) items.push({ ja: noteJa });
    if (noteZh && showZh()) items.push({ zh: noteZh });
    if (!items.length) return "";
    return fromTipPayload({ lines: items }, opts);
  }

  function fromLines(lines, opts = {}) {
    const items = (lines || []).filter((l) => l && (l.ja || l.zh));
    if (!items.length) return "";
    return fromTipPayload({ lines: items }, opts);
  }

  function bind(root) {
    if (!root) return;
    root.querySelectorAll(".hyouga-tip-fold-head, .sensei-tip-head, .l1-kcard-head").forEach((btn) => {
      if (btn.dataset.hyougaTipBound === "1") return;
      const card = btn.closest(".hyouga-tip-fold, .sensei-tip, .l1-kcard");
      if (!card || card.classList.contains("hyouga-tip-static")) return;
      btn.dataset.hyougaTipBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const body = card.querySelector(".hyouga-tip-fold-body, .sensei-tip-body, .l1-kcard-body");
        if (!body) return;
        const open = !card.classList.contains("is-open");
        card.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        body.hidden = !open;
      });
    });
    if (typeof KnowledgeLink !== "undefined") KnowledgeLink.bindRelated(root);
  }

  return {
    wrap,
    fromNotes,
    fromLines,
    fromTipPayload,
    bind,
    markHtml,
    labelHtml,
    isSingleLineTip,
    TITLE,
    ARIA_LABEL,
    LABEL,
  };
})();
