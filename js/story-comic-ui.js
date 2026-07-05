/**
 * 四格漫画 UI 共用 · 格内仅日文泡（无中文）
 * 数据：UNIT_STRIP_STORYBOARD
 */
const StoryComicUi = (function () {
  const MAX_BUBBLES_STRIP = 4;
  const MAX_BUBBLES_ZOOM = 8;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function getUnitStoryboard(unitId) {
    if (typeof UNIT_STRIP_STORYBOARD === "undefined") return null;
    return UNIT_STRIP_STORYBOARD.find((u) => u.unitId === Number(unitId)) || null;
  }

  function sceneParts(sceneCloud) {
    const raw = (sceneCloud || "").trim();
    if (!raw) return { place: "", tag: "" };
    const bits = raw.split("·").map((s) => s.trim());
    if (bits.length >= 2) return { place: bits[0], tag: bits.slice(1).join(" · ") };
    return { place: raw, tag: "" };
  }

  function pickBubbles(panel, maxCount) {
    const cap = maxCount == null ? MAX_BUBBLES_STRIP : maxCount;
    const list = panel?.bubbles || [];
    return list.slice(0, cap);
  }

  function bubbleKind(b) {
    if (b.kind) return b.kind;
    if (b.isGurumi) return "dialogue";
    return "dialogue";
  }

  function renderMangaBubble(b) {
    const kind = bubbleKind(b);
    const side = b.side === "right" ? "is-right" : "is-left";
    const g = b.isGurumi ? " is-gurumi" : "";
    return `<div class="manga-bubble manga-bubble--${kind} ${side}${g}">
      <span class="manga-bubble-jp jp">${escapeHtml(b.jp)}</span>
    </div>`;
  }

  function renderNarration(jp) {
    if (!jp) return "";
    return `<div class="manga-narration jp">${escapeHtml(jp)}</div>`;
  }

  function renderPanelInterior(panel, options) {
    if (!panel) return "";
    const maxBubbles =
      options && options.maxBubbles != null ? options.maxBubbles : MAX_BUBBLES_STRIP;
    const { place, tag } = sceneParts(panel.sceneCloud);
    const picked = pickBubbles(panel, maxBubbles, options);
    const bubbles = picked.map(renderMangaBubble).join("");
    const narration =
      panel.captionSmall && picked.length < maxBubbles
        ? renderNarration(panel.captionSmall)
        : "";

    return `
      <div class="manga-panel-scene">
        ${place ? `<span class="manga-scene-place jp">${escapeHtml(place)}</span>` : ""}
        ${tag ? `<span class="manga-scene-tag jp">${escapeHtml(tag)}</span>` : ""}
      </div>
      <div class="manga-panel-stage">
        <div class="manga-panel-bubbles">${bubbles}</div>
      </div>
      ${narration}`;
  }

  return {
    MAX_BUBBLES_STRIP,
    MAX_BUBBLES_ZOOM,
    MAX_BUBBLES_PER_PANEL: MAX_BUBBLES_STRIP,
    getUnitStoryboard,
    sceneParts,
    pickBubbles,
    renderMangaBubble,
    renderNarration,
    renderPanelInterior,
  };
})();
