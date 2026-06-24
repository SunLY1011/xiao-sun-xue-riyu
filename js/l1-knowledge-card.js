/** 第1課 · 知识卡 — 委托 SenseiTipCard 统一「提示」展示 */
const L1KnowledgeCard = (function () {
  const ARIA_LABEL = "提示";

  function html(tip, anchorId, lessonId) {
    if (!tip) return "";
    let payload = tip;
    if (typeof KnowledgeLink !== "undefined" && anchorId) {
      payload = KnowledgeLink.enrichTip(tip, anchorId, lessonId != null ? lessonId : 1);
    }
    if (typeof SenseiTipCard !== "undefined" && SenseiTipCard.fromTipPayload) {
      const lid = lessonId != null ? Number(lessonId) : 1;
      const l1Scope = lid === 1;
      let mvpScope = lid >= 1 && lid <= 24;
      if (typeof Lesson1Flow !== "undefined") {
        mvpScope =
          Lesson1Flow.isUnit1Mvp(lid) ||
          Lesson1Flow.isUnit2Mvp(lid) ||
          Lesson1Flow.isUnits3to6Mvp(lid);
      }
      return SenseiTipCard.fromTipPayload(payload, {
        l1Scope: l1Scope || mvpScope,
        expanded: mvpScope,
        zhFirst: mvpScope,
        flat: mvpScope,
        forceZh: mvpScope,
      });
    }
    return "";
  }

  function bind(root, opts) {
    if (!root) return;
    if (typeof SenseiTipCard !== "undefined") SenseiTipCard.bind(root);
    root.querySelectorAll(".l1-kcard-link, .hyouga-tip-links .l1-kcard-link").forEach((btn) => {
      if (btn.dataset.l1LinkBound === "1") return;
      btn.dataset.l1LinkBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const gate = btn.dataset.l1Gate;
        const ref = btn.dataset.l1Ref || "";
        const lid = opts?.lessonId != null ? Number(opts.lessonId) : null;
        if (gate === "" || !opts?.switchGate) return;
        opts.switchGate(Number(gate));
        if (ref && typeof KnowledgeLink !== "undefined" && lid) {
          KnowledgeLink.navigateTo(lid, Number(gate), ref);
        }
      });
    });
  }

  return { html, bind, ARIA_LABEL };
})();
