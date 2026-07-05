/**
 * 阶段 A · 知识点关联：提示卡「关联」chip + 跨课跳转（第 2 课起）
 */
const KnowledgeLink = (function () {
  const MIN_LESSON_FOR_CROSS = 2;
  let pendingAnchor = null;

  function graph() {
    return typeof KNOWLEDGE_GRAPH !== "undefined" ? KNOWLEDGE_GRAPH : null;
  }

  function gateForAnchor(anchorId) {
    if (/^l\d+_g\d+/.test(anchorId)) return 1;
    if (/^l\d+_v_/.test(anchorId)) return 0;
    if (/^l\d+_dlg_/.test(anchorId)) return 2;
    return 1;
  }

  function relatedChips(anchorId, currentLessonId) {
    const g = graph();
    if (!g?.anchors || !anchorId) return [];
    const conceptIds = g.anchors[anchorId];
    if (!conceptIds?.length) return [];
    const out = [];
    const seen = new Set();
    const cur = Number(currentLessonId);

    conceptIds.forEach((cid) => {
      const concept = g.concepts[cid];
      if (!concept?.refs) return;
      concept.refs.forEach((ref) => {
        const aid = ref.anchorId || "";
        const key = `${ref.lessonId}:${aid}`;
        if (seen.has(key)) return;
        if (ref.lessonId === cur && aid === anchorId) return;
        if (ref.lessonId !== cur && cur < MIN_LESSON_FOR_CROSS) return;
        seen.add(key);
        out.push({
          lessonId: ref.lessonId,
          gate: ref.gate != null ? ref.gate : gateForAnchor(aid),
          label: ref.label || `第${ref.lessonId}课`,
          anchorId: aid,
          role: ref.role || "review",
        });
      });
    });

    out.sort((a, b) => {
      if (a.lessonId !== b.lessonId) return a.lessonId - b.lessonId;
      if (a.lessonId === cur && b.lessonId !== cur) return -1;
      if (b.lessonId === cur && a.lessonId !== cur) return 1;
      return a.gate - b.gate;
    });
    return out.slice(0, 5);
  }

  function enrichTip(tip, anchorId, lessonId) {
    if (!tip) return tip;
    const related = relatedChips(anchorId, lessonId);
    if (!related.length) return tip;
    return Object.assign({}, tip, { related });
  }

  function tipFromGrammarNode(node, lessonId) {
    const zh = (node.explanationZh || node.explainZh || node.titleZh || "").trim();
    const lines = zh
      .split(/\n+/)
      .map((t) => ({ zh: t.trim() }))
      .filter((l) => l.zh)
      .slice(0, 4);
    const tip = {
      lines: lines.length ? lines : [{ zh: "对照例句朗读；可点下方关联回顾先修课。" }],
    };
    return enrichTip(tip, node.id, lessonId);
  }

  function selectorForAnchor(anchorId) {
    if (/^l\d+_dlg_/.test(anchorId)) return `[data-node-id="${anchorId}"]`;
    if (/^l\d+_g\d+/.test(anchorId)) return `[data-node-id="${anchorId}"]`;
    if (/^l\d+_v_/.test(anchorId)) return `[data-vocab-id="${anchorId}"]`;
    return null;
  }

  function navigateTo(lessonId, gate, anchorId) {
    pendingAnchor = anchorId || null;
    if (typeof window.AppNav === "function") {
      window.AppNav("lesson", lessonId, gate);
      return;
    }
    pendingAnchor = null;
  }

  function flushPendingAnchor() {
    const anchor = pendingAnchor;
    pendingAnchor = null;
    if (!anchor) return;
    const sel = selectorForAnchor(anchor);
    if (!sel) return;
    const body = document.getElementById("lesson-flow-body");
    if (!body) return;
    window.setTimeout(() => {
      const el = body.querySelector(sel);
      if (!el) return;
      const det = el.matches("details") ? el : el.closest("details");
      if (det) {
        body.querySelectorAll("details").forEach((d) => {
          if (d !== det) d.open = false;
        });
        det.open = true;
      }
      (det || el).scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  }

  function bindRelated(root) {
    if (!root) return;
    root.querySelectorAll(".hyouga-related-chip").forEach((btn) => {
      if (btn.dataset.klBound === "1") return;
      btn.dataset.klBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        navigateTo(
          Number(btn.dataset.klLesson),
          Number(btn.dataset.klGate),
          btn.dataset.klAnchor || ""
        );
      });
    });
  }

  return {
    enrichTip,
    relatedChips,
    tipFromGrammarNode,
    navigateTo,
    flushPendingAnchor,
    bindRelated,
    MIN_LESSON_FOR_CROSS,
  };
})();
