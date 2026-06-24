/**
 * 五十音书写笔顺 · 平/片分轨 · 弧线描边 + 淡色字形底稿
 * 数据 KANA_STROKE_GUIDE（animCJK · LGPL）
 */
const WriteKanaStrokeUI = (function () {
  const STROKE_COLORS = ["#E53935", "#43A047", "#1E88E5", "#8E24AA", "#7B1FA2"];
  const ARROW_STROKE = "#212121";
  const ARROW_LEN = { normal: 18, focus: 22 };

  /** 平假名：柔弧；片假名：略利；仅真锐角拆段（环路保持弧线） */
  const STYLE = {
    hiragana: {
      tension: 0.4,
      cornerDeg: 132,
      pathW: { overview: 10, focus: 13, dim: 7.5 },
      lineJoin: "round",
      ghostW: 22,
    },
    katakana: {
      tension: 0.24,
      cornerDeg: 112,
      pathW: { overview: 9.5, focus: 12, dim: 7 },
      lineJoin: "round",
      ghostW: 92,
    },
  };

  let wrapEl = null;
  let svgEl = null;
  let nazoImgEl = null;
  let nazoSrc = "";
  let ghostEl = null;
  let guide = null;
  let stepIndex = 0;
  let guideOn = true;
  let scriptMode = "hiragana";
  /** @type {"overview"|"focus"} */
  let viewMode = "overview";

  function stylePack() {
    return STYLE[scriptMode] || STYLE.hiragana;
  }

  function nazorigakiSrc(hiraKey, script) {
    const mode = script || scriptMode;
    if (!hiraKey) return "";
    if (mode === "katakana" && typeof KANA_NAZORIGAKI_KATA !== "undefined") {
      return KANA_NAZORIGAKI_KATA[hiraKey] || "";
    }
    if (typeof KANA_NAZORIGAKI_HIRA !== "undefined") {
      return KANA_NAZORIGAKI_HIRA[hiraKey] || "";
    }
    return "";
  }

  /** 微信/GitHub Pages 子路径：相对 assets 转绝对 URL + 缓存号 */
  function resolveAssetSrc(rel) {
    if (!rel) return "";
    if (/^https?:\/\//i.test(rel)) return rel;
    const ver =
      (typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER) ||
      (typeof window !== "undefined" && window.HYOUGA_CACHE_BOOT) ||
      "";
    const path = typeof location !== "undefined" ? location.pathname.replace(/[^/]*$/, "") : "/";
    const url = path + String(rel).replace(/^\//, "");
    return ver ? `${url}?v=${encodeURIComponent(ver)}` : url;
  }

  function notifyMizigeLayout() {
    try {
      window.dispatchEvent(new CustomEvent("write-nazo-layout"));
    } catch (_) {}
  }

  function fallbackSvgFromGuide(kana) {
    if (typeof KANA_STROKE_GUIDE === "undefined" || !KANA_STROKE_GUIDE[kana]) return false;
    guide = KANA_STROKE_GUIDE[kana];
    if (nazoImgEl) nazoImgEl.classList.add("is-hidden");
    if (svgEl) svgEl.classList.remove("is-hidden");
    renderSvg();
    updateLabels();
    return true;
  }

  function useNazorigaki() {
    return !!nazoSrc;
  }

  function hasGuide(kana, hiraKey, script) {
    const stroke = typeof KANA_STROKE_GUIDE !== "undefined" && !!KANA_STROKE_GUIDE[kana];
    const key = hiraKey || kana;
    const nazo = !!nazorigakiSrc(key, script);
    return stroke || nazo;
  }

  function strokeColor(i) {
    return STROKE_COLORS[i % STROKE_COLORS.length];
  }

  function interiorAngleDeg(p0, p1, p2) {
    const v1x = p0[0] - p1[0];
    const v1y = p0[1] - p1[1];
    const v2x = p2[0] - p1[0];
    const v2y = p2[1] - p1[1];
    const m1 = Math.hypot(v1x, v1y) || 1;
    const m2 = Math.hypot(v2x, v2y) || 1;
    const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  }

  /** 锐角处拆段：折角走直线，缓弯走贝塞尔 */
  function splitRunsAtCorners(pts) {
    const pack = stylePack();
    if (!pts || pts.length < 3) return [pts || []];
    const runs = [];
    let run = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      run.push(pts[i]);
      const ang = interiorAngleDeg(pts[i - 1], pts[i], pts[i + 1]);
      if (ang < pack.cornerDeg) {
        runs.push(run);
        run = [pts[i]];
      }
    }
    run.push(pts[pts.length - 1]);
    runs.push(run);
    return runs.filter((r) => r.length >= 2);
  }

  function smoothRun(pts, tension) {
    if (!pts || pts.length < 2) return "";
    if (pts.length === 2) {
      return `L ${pts[1][0]} ${pts[1][1]}`;
    }
    let seg = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) * tension;
      const c1y = p1[1] + (p2[1] - p0[1]) * tension;
      const c2x = p2[0] - (p3[0] - p1[0]) * tension;
      const c2y = p2[1] - (p3[1] - p1[1]) * tension;
      seg += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return seg;
  }

  /** 分段 Catmull-Rom → 三次贝塞尔，锐角不跨段平滑 */
  function pointsToSmoothD(pts, tension) {
    if (!pts || pts.length < 2) return "";
    if (pts.length === 2) {
      return `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]}`;
    }
    const runs = splitRunsAtCorners(pts);
    let d = `M ${runs[0][0][0]} ${runs[0][0][1]}`;
    for (const run of runs) {
      d += smoothRun(run, tension);
    }
    return d;
  }

  function svgDefs() {
    const colorMarkers = STROKE_COLORS.map(
      (c, i) =>
        `<marker id="write-arr-${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">` +
        `<path d="M0,0 L10,5 L0,10 Z" fill="${ARROW_STROKE}"/></marker>`
    ).join("");
    return `<defs>${colorMarkers}
      <marker id="write-arr-dot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="${ARROW_STROKE}"/>
      </marker></defs>`;
  }

  function strokePath(pts, color, width, opacity) {
    const pack = stylePack();
    const d = pointsToSmoothD(pts, pack.tension);
    return (
      `<path class="write-stroke-path" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ` +
      `stroke-linecap="round" stroke-linejoin="${pack.lineJoin}" opacity="${opacity}"/>`
    );
  }

  function startMarker(pts, num, color, emphasis) {
    if (!pts.length) return "";
    const [sx, sy] = pts[0];
    const fs = emphasis ? 22 : 18;
    const nx = sx + 4;
    const ny = sy - 5;
    const fw = num === 1 ? 800 : 700;
    let arrowPart = "";
    if (pts.length >= 2) {
      const dx = pts[1][0] - sx;
      const dy = pts[1][1] - sy;
      const len = Math.hypot(dx, dy) || 1;
      const al = emphasis ? ARROW_LEN.focus : ARROW_LEN.normal;
      const ex = sx + (dx / len) * al;
      const ey = sy + (dy / len) * al;
      arrowPart = `<line class="write-stroke-arrow" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${ARROW_STROKE}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#write-arr-dot)"/>`;
    }
    return (
      `<text class="write-stroke-num" x="${nx}" y="${ny + fs * 0.32}" font-size="${fs}" font-weight="${fw}" fill="${color}" text-anchor="middle" stroke="#fff" stroke-width="2" paint-order="stroke fill">${num}</text>` +
      arrowPart
    );
  }

  function deriveStrokeTip(pts) {
    if (!pts || pts.length < 2) return "";
    const a = pts[0];
    const b = pts[pts.length - 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (ady <= adx * 0.45) return dx >= 0 ? "从左向右" : "从右向左";
    if (adx <= ady * 0.45) return dy >= 0 ? "从上向下" : "从下向上";
    if (dx > 0 && dy > 0) return "从左上向右下";
    if (dx < 0 && dy > 0) return "从右上向左下";
    return "沿弧线方向";
  }

  function strokeVisible(i) {
    if (!guideOn) return false;
    if (viewMode === "overview") return true;
    return i <= stepIndex;
  }

  /** 笔间虚线：上一笔收笔 → 下一笔起笔（抬笔移笔） */
  function jumpVisible(i) {
    if (!guideOn || !guide) return false;
    if (i >= guide.strokes.length - 1) return false;
    if (viewMode === "overview") return true;
    return i < stepIndex;
  }

  function interStrokeJump(i) {
    const cur = guide.strokes[i];
    const next = guide.strokes[i + 1];
    if (!cur || !next || !cur.length || !next.length) return "";
    const [x1, y1] = cur[cur.length - 1];
    const [x2, y2] = next[0];
    if (Math.hypot(x2 - x1, y2 - y1) < 10) return "";
    const opacity = viewMode === "focus" && i === stepIndex - 1 ? 0.65 : 0.5;
    return (
      `<line class="write-stroke-jump" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
      `stroke="#E91E63" stroke-width="2.2" stroke-dasharray="7 9" stroke-linecap="round" opacity="${opacity}"/>`
    );
  }

  function strokeEmphasis(i) {
    if (viewMode === "overview") return true;
    return i === stepIndex;
  }

  function strokeStyle(i) {
    const pw = stylePack().pathW;
    const emph = strokeEmphasis(i);
    if (viewMode === "overview") {
      return { width: pw.overview, opacity: 1 };
    }
    if (i < stepIndex) return { width: pw.dim, opacity: 0.28 };
    if (i === stepIndex) return { width: pw.focus, opacity: 1 };
    return { width: pw.dim, opacity: 0 };
  }

  function ghostFill() {
    return scriptMode === "katakana" ? "var(--write-ghost-fill-kata)" : "var(--write-ghost-fill-hira)";
  }

  function renderGhostFromStrokes() {
    const pack = stylePack();
    const strokeW = pack.ghostW || 22;
    const fill = ghostFill();
    const parts = guide.strokes.map((pts) => {
      const d = pointsToSmoothD(pts, pack.tension * 0.88);
      return (
        `<path class="write-stroke-ghost-path write-stroke-ghost-path--trace" d="${d}" ` +
        `fill="none" stroke="${fill}" stroke-width="${strokeW}" stroke-linecap="round" ` +
        `stroke-linejoin="round" opacity="0.28"/>`
      );
    });
    return `<g class="write-stroke-ghost write-stroke-ghost--strokes">${parts.join("")}</g>`;
  }

  /** Phase A 平假名：outline 整字底稿；片假名 Phase B 前仍用同逻辑 */
  function renderGhost() {
    if (!guide) return "";
    if (guide.outline && guide.outline.length) {
      return renderGhostLegacyOutline();
    }
    if (guide.strokes && guide.strokes.length) {
      return renderGhostFromStrokes();
    }
    return "";
  }

  function renderGhostLegacyOutline() {
    if (!guide || !guide.outline || !guide.outline.length) return "";
    const fill = ghostFill();
    const paths = guide.outline
      .map((d) => `<path class="write-stroke-ghost-path" d="${d}" fill="${fill}" stroke="none"/>`)
      .join("");
    return `<g class="write-stroke-ghost">${paths}</g>`;
  }

  function renderSvg() {
    if (useNazorigaki()) {
      if (svgEl) svgEl.innerHTML = "";
      if (nazoImgEl) nazoImgEl.classList.toggle("is-hidden", !guideOn);
      return;
    }
    if (!svgEl || !guide) return;
    const parts = [svgDefs(), renderGhost()];
    const n = guide.strokes.length;

    for (let i = 0; i < n; i++) {
      if (!strokeVisible(i)) continue;
      const pts = guide.strokes[i];
      const color = strokeColor(i);
      const emph = strokeEmphasis(i);
      const { width, opacity } = strokeStyle(i);
      parts.push(strokePath(pts, color, width, opacity));
      parts.push(startMarker(pts, i + 1, color, emph));
      if (jumpVisible(i)) parts.push(interStrokeJump(i));
    }

    svgEl.innerHTML = parts.join("");
  }

  function updateLabels() {
    if (!wrapEl) return;
    const stepEl = wrapEl.querySelector(".write-l0-stroke-step");
    if (useNazorigaki()) {
      if (stepEl) stepEl.textContent = guideOn ? "教材分色笔顺" : "";
      return;
    }
    if (!guide) return;
    const total = guide.strokes.length;
    if (stepEl) {
      if (viewMode === "overview") {
        stepEl.textContent = total ? `共 ${total} 笔` : "";
      } else {
        const pts = guide.strokes[stepIndex];
        const dir = pts ? deriveStrokeTip(pts) : "";
        stepEl.textContent = total
          ? `第 ${stepIndex + 1}/${total} 笔${dir ? " · " + dir : ""}`
          : "";
      }
    }
    wrapEl.querySelectorAll(".write-l0-view-toggle button").forEach((btn) => {
      const m = btn.getAttribute("data-mode");
      btn.classList.toggle("is-on", m === viewMode);
    });
    syncFocusNavVisibility();
  }

  function setStep(i) {
    if (!guide) return;
    stepIndex = Math.max(0, Math.min(guide.strokes.length - 1, i));
    renderSvg();
    updateLabels();
  }

  function setViewMode(mode) {
    viewMode = mode === "focus" ? "focus" : "overview";
    if (viewMode === "focus") stepIndex = 0;
    syncFocusNavVisibility();
    renderSvg();
    updateLabels();
  }

  function syncFocusNavVisibility() {
    if (!wrapEl) return;
    const nav = wrapEl.querySelector(".write-l0-stroke-nav");
    const stepEl = wrapEl.querySelector(".write-l0-stroke-step");
    if (nav) nav.classList.toggle("is-visible", viewMode === "focus");
    if (stepEl) stepEl.classList.toggle("is-focus", viewMode === "focus");
    wrapEl.classList.toggle("is-focus-mode", viewMode === "focus");
  }

  function setGuideEnabled(on) {
    guideOn = !!on;
    if (svgEl) svgEl.classList.toggle("is-hidden", !guideOn);
    if (nazoImgEl) nazoImgEl.classList.toggle("is-hidden", !guideOn);
    if (wrapEl) wrapEl.classList.toggle("is-off", !guideOn);
    renderSvg();
    updateLabels();
  }

  /**
   * @param {HTMLElement} mizigeEl
   * @param {string} kana 笔顺数据键
   * @param {{ script?: string, displayChar?: string }} [opts]
   */
  function mount(mizigeEl, kana, opts) {
    destroy();
    scriptMode = opts && opts.script === "katakana" ? "katakana" : "hiragana";
    const hiraKey = (opts && opts.guideHira) || kana;
    nazoSrc = nazorigakiSrc(hiraKey, scriptMode);
    guide =
      nazoSrc
        ? null
        : typeof KANA_STROKE_GUIDE !== "undefined" && KANA_STROKE_GUIDE[kana]
          ? KANA_STROKE_GUIDE[kana]
          : null;
    if (!mizigeEl || (!guide && !nazoSrc)) return false;

    stepIndex = 0;
    guideOn = true;
    viewMode = "overview";

    const legendHtml = useNazorigaki()
      ? `<p class="write-l0-stroke-legend zh-annotation">なぞりがき教材 · 分色笔顺 · とめる／はらう 见原图</p>`
      : `<p class="write-l0-stroke-legend zh-annotation">
        <span class="write-l0-swatch" style="background:#E53935"></span>1
        <span class="write-l0-swatch" style="background:#43A047"></span>2
        <span class="write-l0-swatch" style="background:#1E88E5"></span>3
        <span class="write-l0-swatch" style="background:#8E24AA"></span>4
        每笔一色 · 数字=笔序 · 粉虚线=抬笔移笔
      </p>`;

    wrapEl = document.createElement("div");
    wrapEl.className = "write-l0-stroke-bar" + (useNazorigaki() ? " is-nazorigaki" : "");
    wrapEl.innerHTML = `
      <div class="write-l0-stroke-toolbar">
        <label class="write-l0-stroke-toggle">
          <input type="checkbox" id="write-stroke-guide-cb" checked />
          <span>笔顺</span>
        </label>
        <div class="write-l0-view-toggle" role="group" aria-label="查看模式">
          <button type="button" class="btn ghost btn-sm is-on" data-mode="overview">一览</button>
          <button type="button" class="btn ghost btn-sm" data-mode="focus">专注</button>
        </div>
        <span class="write-l0-stroke-step" aria-live="polite"></span>
        <div class="write-l0-stroke-nav write-l0-stroke-nav--focus-only">
          <button type="button" class="btn ghost btn-sm" id="write-stroke-prev" title="上一笔">‹</button>
          <button type="button" class="btn ghost btn-sm" id="write-stroke-next" title="下一笔">›</button>
        </div>
      </div>
      ${legendHtml}`;

    mizigeEl.classList.remove("is-hiragana", "is-katakana", "has-nazorigaki");
    mizigeEl.classList.add(scriptMode === "katakana" ? "is-katakana" : "is-hiragana");
    if (useNazorigaki()) mizigeEl.classList.add("has-nazorigaki");

    ghostEl = mizigeEl.querySelector(".write-l0-trace-char");
    const display = (opts && opts.displayChar) || kana;
    if (ghostEl) {
      if (!useNazorigaki() && !guide.outline?.length && scriptMode === "hiragana") {
        ghostEl.textContent = display;
        ghostEl.classList.remove("is-hidden");
      } else {
        ghostEl.textContent = "";
        ghostEl.classList.add("is-hidden");
      }
    }

    const canvas = mizigeEl.querySelector(".write-l0-canvas");

    if (useNazorigaki()) {
      nazoImgEl = document.createElement("img");
      nazoImgEl.className = "write-l0-nazorigaki";
      nazoImgEl.src = resolveAssetSrc(nazoSrc);
      nazoImgEl.alt = "";
      nazoImgEl.decoding = "async";
      nazoImgEl.setAttribute("aria-hidden", "true");
      nazoImgEl.addEventListener("load", () => {
        notifyMizigeLayout();
      });
      nazoImgEl.addEventListener("error", () => {
        if (!nazoImgEl.dataset.retried && nazoSrc) {
          nazoImgEl.dataset.retried = "1";
          const path =
            typeof location !== "undefined" ? location.pathname.replace(/[^/]*$/, "") : "/";
          nazoImgEl.src = path + String(nazoSrc).replace(/^\//, "");
          return;
        }
        if (!fallbackSvgFromGuide(kana)) {
          mizigeEl.classList.add("is-nazo-load-fail");
        }
        notifyMizigeLayout();
      });
      mizigeEl.insertBefore(nazoImgEl, canvas);
    }

    svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.setAttribute("class", "write-l0-stroke-svg");
    svgEl.setAttribute("viewBox", "0 0 1024 1024");
    svgEl.setAttribute("aria-hidden", "true");
    if (useNazorigaki()) svgEl.classList.add("is-hidden");

    mizigeEl.insertBefore(svgEl, canvas);

    const sheet = mizigeEl.closest(".write-l0-sheet");
    const deck = sheet && sheet.querySelector("#write-l0-control-deck");
    if (deck) {
      deck.insertBefore(wrapEl, deck.firstChild);
    } else {
      const hint = sheet && sheet.querySelector(".write-l0-hint--sheet");
      if (hint && hint.parentNode) {
        hint.parentNode.insertBefore(wrapEl, hint.nextSibling);
      }
    }

    wrapEl.querySelector("#write-stroke-guide-cb").addEventListener("change", (e) => {
      setGuideEnabled(e.target.checked);
    });
    wrapEl.querySelectorAll(".write-l0-view-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => setViewMode(btn.getAttribute("data-mode")));
    });
    wrapEl.querySelector("#write-stroke-prev").addEventListener("click", () => {
      setViewMode("focus");
      setStep(stepIndex - 1);
    });
    wrapEl.querySelector("#write-stroke-next").addEventListener("click", () => {
      setViewMode("focus");
      setStep(stepIndex + 1);
    });

    renderSvg();
    updateLabels();
    syncFocusNavVisibility();
    return true;
  }

  function destroy() {
    if (svgEl && svgEl.parentNode) svgEl.parentNode.removeChild(svgEl);
    if (nazoImgEl && nazoImgEl.parentNode) nazoImgEl.parentNode.removeChild(nazoImgEl);
    if (wrapEl && wrapEl.parentNode) wrapEl.parentNode.removeChild(wrapEl);
    const host = document.getElementById("write-l0-mizige");
    if (host) host.classList.remove("has-nazorigaki");
    svgEl = null;
    nazoImgEl = null;
    nazoSrc = "";
    wrapEl = null;
    ghostEl = null;
    guide = null;
    stepIndex = 0;
    viewMode = "overview";
  }

  return { mount, destroy, hasGuide, setStep, setGuideEnabled, setViewMode, deriveStrokeTip };
})();
