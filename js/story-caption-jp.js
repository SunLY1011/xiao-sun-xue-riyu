/**
 * 彩蛋叠字 · 仅日文 · L2 分层（課次/動作/場景/位置）· L3 分格锚点
 */
const StoryCaptionJp = (function () {
  const KANA = /[\u3040-\u309f\u30a0-\u30ff]/;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function acceptJpLine(s) {
    if (!s || !String(s).trim()) return "";
    const t = String(s).trim();
    if (KANA.test(t)) return t;
    if (/[的是了在与这你为俩]/.test(t)) return "";
    if (/です|ます|だ|である|がある|いる|ここ|それ|これ|ません|へ行|に起き/.test(t)) return t;
    if (/^[ぁ-んァ-ヶー・\s]+$/.test(t)) return t;
    if (/^[\u4e00-\u9fff]{1,12}$/.test(t) && !/[的是了]/.test(t)) return t;
    return "";
  }

  /** @returns {{ tier: string, text: string }[]} */
  function panelJpLayers(panel) {
    if (!panel) return [];
    const lid = panel.lessonId;
    const d =
      typeof getCurriculumLessonDisplay === "function" ? getCurriculumLessonDisplay(lid) : null;
    const parts = (panel.sceneCloud || "").split("·").map((x) => x.trim()).filter(Boolean);
    const place = acceptJpLine(parts[0] || "");
    const sceneLine = acceptJpLine(parts[1] || "");
    const action = acceptJpLine(
      panel.headline || d?.headline || sceneLine || panel.bubbles?.[0]?.jp || ""
    );
    const title = acceptJpLine(`第${lid}課`);
    const lines = [];

    const long = (action && action.length > 14) || (sceneLine && sceneLine !== action);
    if (long && title) lines.push({ tier: "title", text: title });
    if (action) lines.push({ tier: "action", text: action });
    if (sceneLine && sceneLine !== action) lines.push({ tier: "scene", text: sceneLine });
    if (place && place !== action && place !== sceneLine) {
      lines.push({ tier: "place", text: place });
    }

    if (!lines.length && place) lines.push({ tier: "place", text: place });
    return lines;
  }

  function panelJpCaption(panel) {
    const layers = panelJpLayers(panel);
    const action = layers.find((l) => l.tier === "action")?.text || "";
    const place = layers.find((l) => l.tier === "place")?.text || "";
    return { act: action, place };
  }

  function lineClass(pfx, tier) {
    if (String(pfx).includes("l1")) {
      const m = { title: "title", action: "act", scene: "scene", place: "place" };
      return `${pfx}-${m[tier] || "act"}`;
    }
    return `${pfx}-panel-${tier}`;
  }

  function renderLayerLinesHtml(layers, pfx) {
    return layers
      .map((l) => `<span class="${lineClass(pfx, l.tier)} jp">${escapeHtml(l.text)}</span>`)
      .join("");
  }

  function renderL2PanelLabelsHtml(unitId, prefix) {
    const pfx = prefix || "story-egg-l2";
    if (typeof UNIT_STRIP_STORYBOARD === "undefined") return "";
    const sb = UNIT_STRIP_STORYBOARD.find((u) => u.unitId === Number(unitId));
    if (!sb?.panels?.length) return "";
    return sb.panels
      .map((p, i) => {
        const layers = panelJpLayers(p);
        if (!layers.length) return "";
        const side = i % 2 === 1 ? `${pfx}-panel-label--right` : `${pfx}-panel-label--left`;
        return `<div class="${pfx}-panel-label ${side}">
          <div class="${pfx}-panel-caption">${renderLayerLinesHtml(layers, pfx)}</div>
        </div>`;
      })
      .join("");
  }

  function renderL1CaptionHtml(panel, prefix) {
    const pfx = prefix || "story-egg-l1";
    const layers = panelJpLayers(panel);
    if (!layers.length) return "";
    return `<div class="${pfx}-caption">${renderLayerLinesHtml(layers, pfx)}</div>`;
  }

  /** L3 每格字位：避免挡脸，按行列交错 */
  function grandCaptionAnchor(cardId, row, col) {
    if (typeof GRAND_CAPTION_ANCHOR !== "undefined" && GRAND_CAPTION_ANCHOR[cardId]) {
      return GRAND_CAPTION_ANCHOR[cardId];
    }
    const corners = ["bl", "br", "tr", "tl"];
    return corners[(Number(cardId) + Number(col)) % 4];
  }

  /** L3 统一相册底栏标签（位置/字号一致，避免每格乱飘） */
  function renderL3CapBlockHtml(cardId, row, col, activityJp, placeJp, pfx) {
    const prefix = pfx || "story-egg-l3";
    const act = acceptJpLine(activityJp);
    const place = acceptJpLine(placeJp);
    if (!act && !place) return "";
    return `<div class="${prefix}-cap-block ${prefix}-cap-block--album">
      ${act ? `<span class="${prefix}-act jp">${escapeHtml(act)}</span>` : ""}
      ${place ? `<span class="${prefix}-place jp">${escapeHtml(place)}</span>` : ""}
    </div>`;
  }

  function unitLessonIds(u) {
    const unit =
      typeof CURRICULUM_UNITS !== "undefined" ? CURRICULUM_UNITS.find((x) => x.id === u) : null;
    if (unit?.lessonIds) return unit.lessonIds;
    const base = (u - 1) * 4 + 1;
    return [base, base + 1, base + 2, base + 3];
  }

  /** L1 预览 · 上文案下插画（仅日文） */
  function renderL1PreviewMetaHtml(unitId, lessonId) {
    const uid = Number(unitId);
    const lid = Number(lessonId);
    const d =
      typeof getCurriculumLessonDisplay === "function" ? getCurriculumLessonDisplay(lid) : null;
    const sb =
      typeof UNIT_STRIP_STORYBOARD !== "undefined"
        ? UNIT_STRIP_STORYBOARD.find((u) => u.unitId === uid)
        : null;
    const panel = sb?.panels?.find((p) => p.lessonId === lid);
    const layers = panel ? panelJpLayers(panel) : [];
    const unitJa =
      typeof CURRICULUM_UNITS !== "undefined"
        ? CURRICULUM_UNITS.find((u) => u.id === uid)?.titleJa || `第${uid}单元`
        : `第${uid}单元`;

    const lessonLine =
      layers.find((l) => l.tier === "action")?.text ||
      acceptJpLine(d?.headline) ||
      acceptJpLine(`第${lid}課`);

    const chips = unitLessonIds(uid)
      .map((id) => {
        const ld =
          typeof getCurriculumLessonDisplay === "function" ? getCurriculumLessonDisplay(id) : null;
        const h = acceptJpLine(ld?.headline || `第${id}課`);
        const on = id === lid ? " is-on" : "";
        return `<li class="phone-sim-l1-chip${on}"><span class="jp">${escapeHtml(h)}</span></li>`;
      })
      .join("");

    const placeLine = layers.find((l) => l.tier === "place")?.text || "";
    const sceneLine = layers.find((l) => l.tier === "scene")?.text || "";

    return `
      <header class="phone-sim-l1-head">
        <p class="phone-sim-l1-eyebrow jp">第${lid}課</p>
        <h2 class="phone-sim-l1-title jp">${escapeHtml(lessonLine)}</h2>
        ${placeLine ? `<p class="phone-sim-l1-sub jp">${escapeHtml(placeLine)}</p>` : ""}
      </header>
      <section class="phone-sim-l1-recap" aria-label="单元要点">
        <p class="phone-sim-l1-recap-label jp">${escapeHtml(unitJa)}</p>
        <ul class="phone-sim-l1-chips">${chips}</ul>
        ${sceneLine && sceneLine !== lessonLine ? `<p class="phone-sim-l1-note jp">${escapeHtml(sceneLine)}</p>` : ""}
      </section>`;
  }

  return {
    acceptJpLine,
    panelJpCaption,
    panelJpLayers,
    renderL2PanelLabelsHtml,
    renderL1CaptionHtml,
    renderL3CapBlockHtml,
    renderL1PreviewMetaHtml,
    grandCaptionAnchor,
    escapeHtml,
  };
})();
