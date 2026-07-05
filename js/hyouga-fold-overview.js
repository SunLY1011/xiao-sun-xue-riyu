/**
 * 五关折叠条 · 收起态概述 + 展开态日文下中文（MVP-L1 §4.2–4.4）
 */
const HyougaFoldOverview = (function () {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function hasKana(s) {
    return /[\u3040-\u309f\u30a0-\u30ff]/.test(s || "");
  }

  function hasHan(s) {
    return /[\u4e00-\u9fff]/.test(s || "");
  }

  function firstLine(text) {
    return String(text || "")
      .split(/\n+/)
      .map((t) => t.trim())
      .find(Boolean) || "";
  }

  /** 收起态：完整日文句 + 中文概述（不截断、不省略号） */
  function summaryBlock(jp, zh, opts = {}) {
    const showZh = opts.showZh !== false;
    const jpT = (jp || "").trim();
    const zhT = (zh || "").trim();
    if (!jpT && !zhT) return "";
    const jpHtml = jpT
      ? `<span class="hyo-fold-overview-jp jp">${escapeHtml(jpT)}</span>`
      : "";
    const zhHtml =
      zhT && showZh
        ? `<span class="hyo-fold-overview-zh zh-annotation">${escapeHtml(zhT)}</span>`
        : "";
    return `<span class="hyo-fold-overview" role="note">${jpHtml}${zhHtml}</span>`;
  }

  function grammarNodeOverview(node) {
    const jp = (node.explanation || node.title || "").trim();
    const zh = firstLine(node.explanationZh || node.explainZh || node.titleZh || "");
    return { jp, zh };
  }

  function dialogueSceneOverview(d, sceneTitleZhFn) {
    const jp = (d.opener?.japanese || d.title || "").trim();
    let zh = (d.opener?.chinese || d.openerZh || "").trim();
    if (!zh && typeof sceneTitleZhFn === "function") zh = sceneTitleZhFn(d) || "";
    if (!zh && d.sceneTitleZh) zh = String(d.sceneTitleZh).trim();
    return { jp, zh };
  }

  function proseSectionOverview(lines) {
    const arr = (lines || []).map((l) => String(l || "").trim()).filter(Boolean);
    const jp = arr.find((s) => hasKana(s)) || "";
    const zh =
      arr.find((s) => hasHan(s) && !hasKana(s)) ||
      arr.find((s) => hasHan(s) && s.length < 48 && !/^Q\d|^【/.test(s)) ||
      "";
    return { jp, zh };
  }

  return {
    escapeHtml,
    hasKana,
    hasHan,
    firstLine,
    summaryBlock,
    grammarNodeOverview,
    dialogueSceneOverview,
    proseSectionOverview,
  };
})();
