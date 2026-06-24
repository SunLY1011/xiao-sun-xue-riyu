/**
 * 全册 6×4 分镜 · 纵向滚动审阅页
 */
(function () {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function gurumiSvg() {
    return `<svg viewBox="0 0 32 40" aria-hidden="true">
      <ellipse cx="16" cy="14" rx="11" ry="12" fill="currentColor" opacity="0.35"/>
      <rect x="13" y="24" width="6" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="12" r="1.5" fill="#fff"/>
      <circle cx="20" cy="12" r="1.5" fill="#fff"/>
    </svg>`;
  }

  function headlineForLesson(lessonId) {
    const meta =
      typeof STORYBOARD_PREVIEW_LESSON_META !== "undefined"
        ? STORYBOARD_PREVIEW_LESSON_META
        : typeof CURRICULUM_LESSON_META !== "undefined"
          ? CURRICULUM_LESSON_META
          : null;
    const m = meta ? meta[lessonId] : null;
    return m ? m.headline : "";
  }

  function stageThemes() {
    if (typeof STORYBOARD_PREVIEW_STAGE_THEMES !== "undefined") {
      return STORYBOARD_PREVIEW_STAGE_THEMES;
    }
    if (typeof CURRICULUM_STAGE_THEMES !== "undefined") {
      return CURRICULUM_STAGE_THEMES;
    }
    return {};
  }

  function showBootError(msg) {
    const root = document.getElementById("storyboard-scroll-root");
    if (!root) return;
    root.innerHTML = `<div class="storyboard-boot-error" role="alert">
      <p><strong>分镜页未能加载</strong></p>
      <p>${escapeHtml(msg)}</p>
      <p>请在项目根目录运行：<code>python scripts/serve-storyboard.py</code></p>
      <p>然后打开 <a href="http://127.0.0.1:8777/storyboard-preview.html">http://127.0.0.1:8777/storyboard-preview.html</a></p>
    </div>`;
  }

  function renderBubble(b) {
    const side = b.side === "right" ? "is-right" : "is-left";
    const g = b.isGurumi ? " is-gurumi" : "";
    return `<div class="storyboard-bubble ${side}${g}">
      <span class="bubble-role">${escapeHtml(b.role)}</span>
      <span class="bubble-jp">${escapeHtml(b.jp)}</span>
      <span class="bubble-zh zh-annotation">${escapeHtml(b.zh)}</span>
    </div>`;
  }

  function renderPanel(panel, unitTheme, slot) {
    const hl = headlineForLesson(panel.lessonId);
    const bubbles = (panel.bubbles || []).map(renderBubble).join("");
    const note = panel.note
      ? `<p class="storyboard-panel-note">⚠ ${escapeHtml(panel.note)}</p>`
      : "";
    const cap = panel.captionSmall
      ? `<p class="storyboard-caption-small">${escapeHtml(panel.captionSmall)}</p>`
      : "";
    const beat = panel.visualBeat
      ? `<p class="storyboard-visual-beat">画面：${escapeHtml(panel.visualBeat)}</p>`
      : "";

    return `<article class="storyboard-panel" style="--unit-accent:${unitTheme.accent};--unit-bg:${unitTheme.pageBg}">
      <span class="storyboard-panel-slot">格${slot}</span>
      <div class="storyboard-scene-cloud">【云】${escapeHtml(panel.sceneCloud)}</div>
      ${beat}
      ${cap}
      <div class="storyboard-bubbles">${bubbles}</div>
      <div class="storyboard-gurumi-slot">${gurumiSvg()}</div>
      <p class="storyboard-panel-headline jp">第${panel.lessonId}課 · ${escapeHtml(hl)}</p>
      ${note}
    </article>`;
  }

  function renderUnit(unit) {
    const themes = stageThemes();
    const theme = themes[unit.unitId] || { accent: "#888", pageBg: "#fff", label: "" };
    const panels = unit.panels
      .map((p, i) => renderPanel(p, theme, i + 1))
      .join("");
    const src = unit.source ? `<p class="storyboard-unit-source">${escapeHtml(unit.source)}</p>` : "";
    const arc = unit.unitArcZh
      ? `<p class="storyboard-unit-arc zh-annotation">情绪弧：${escapeHtml(unit.unitArcZh)}</p>`
      : "";

    return `<section class="storyboard-unit" id="unit-${unit.unitId}" style="--unit-accent:${theme.accent};--unit-bg:${theme.bg || theme.pageBg}">
      <header class="storyboard-unit-head">
        <h2>P${unit.unitId} · ${escapeHtml(unit.stripTitle)}</h2>
        <span class="unit-tag zh-annotation">${escapeHtml(unit.unitZh)} · ${escapeHtml(theme.label || "")}</span>
      </header>
      ${arc}
      ${src}
      <p class="storyboard-scroll-hint">← 横滑看四格（左→右 = 第1–4課）→</p>
      <div class="storyboard-strip-scroll" role="group" aria-label="单元四格条带">
        ${panels}
      </div>
    </section>`;
  }

  function renderNav(units) {
    return units
      .map(
        (u) =>
          `<a href="#unit-${u.unitId}">P${u.unitId} ${escapeHtml(u.unitZh)}</a>`
      )
      .join("");
  }

  function boot() {
    const root = document.getElementById("storyboard-scroll-root");
    const nav = document.getElementById("storyboard-jump-nav");
    if (!root) return;

    const data = globalThis.UNIT_STRIP_STORYBOARD;
    if (!data || !data.length) {
      const proto = location.protocol || "";
      if (proto === "file:") {
        showBootError("当前为 file:// 打开，浏览器会拦截脚本。请改用本地 HTTP 服务。");
      } else {
        showBootError("未找到 UNIT_STRIP_STORYBOARD（js/data/unit-strip-storyboard.js 可能 404 或未执行）。");
      }
      return;
    }

    root.innerHTML = data.map(renderUnit).join("");
    if (nav) nav.innerHTML = renderNav(data);

    const hash = location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
