/**
 * 单元完成 · 四格定格漫画（内测占位 + 首次自动弹出）
 * 真源：docs/story-art-brief-绘本参照.md
 */
const StoryReward = (function () {
  let modalEl = null;

  /** 仅开发者显式开启（学员端默认不显示四格验收条） */
  function storyDevMode() {
    try {
      if (/[?&]storyDev=1/.test(location.search || "")) return true;
      if (localStorage.getItem("hyouga_story_dev") === "1") return true;
      if (localStorage.getItem("hyouga_story_dev") === "0") return false;
    } catch (_) {
      /* ignore */
    }
    return false;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function ensureStory(state) {
    if (!state.story || typeof state.story !== "object") {
      state.story = { units: {}, pendingAuto: null, eggGrandSeen: false };
    }
    if (!state.story.units || typeof state.story.units !== "object") {
      state.story.units = {};
    }
    if (state.story.eggGrandSeen == null) state.story.eggGrandSeen = false;
    return state.story;
  }

  function getUnitRecord(state, unitId) {
    ensureStory(state);
    const key = String(Number(unitId));
    if (!state.story.units[key]) {
      state.story.units[key] = {
        rewardSeen: false,
        stripUnlocked: [false, false, false, false],
      };
    }
    return state.story.units[key];
  }

  function lessonAllGatesDone(state, lessonId) {
    if (typeof curriculumLessonCleared === "function") {
      return curriculumLessonCleared(state, lessonId);
    }
    const g = state?.lessons?.[Number(lessonId)];
    return !!(g && g.gate0 && g.gate1 && g.gate2 && g.gate3);
  }

  function getHomeUnit(unitId) {
    if (typeof getCurriculumUnitsForHome !== "function") return null;
    return getCurriculumUnitsForHome().find((u) => u.id === Number(unitId)) || null;
  }

  function syncUnitStrip(state, unit) {
    if (!unit) return;
    const rec = getUnitRecord(state, unit.id);
    unit.lessons.forEach((L, i) => {
      if (lessonAllGatesDone(state, L.lessonId)) rec.stripUnlocked[i] = true;
    });
  }

  function syncAllStrips(state) {
    if (typeof getCurriculumUnitsForHome !== "function") return;
    getCurriculumUnitsForHome().forEach((u) => syncUnitStrip(state, u));
  }

  function isUnitComplete(state, unitId) {
    if (typeof curriculumUnitFourGold === "function") {
      return curriculumUnitFourGold(state, unitId);
    }
    return (
      typeof curriculumUnitVisualState === "function" &&
      curriculumUnitVisualState(state, unitId) === "cleared"
    );
  }

  function shouldAutoShow(state, unitId) {
    return isUnitComplete(state, unitId) && !getUnitRecord(state, unitId).rewardSeen;
  }

  function findAutoUnitId(state) {
    ensureStory(state);
    const pending = state.story.pendingAuto;
    if (pending != null && shouldAutoShow(state, pending)) return Number(pending);
    if (pending != null) state.story.pendingAuto = null;
    if (typeof CURRICULUM_UNITS !== "undefined") {
      for (const u of CURRICULUM_UNITS) {
        if (shouldAutoShow(state, u.id)) return u.id;
      }
    }
    return null;
  }

  function markRewardSeen(state, unitId) {
    getUnitRecord(state, unitId).rewardSeen = true;
    if (state.story.pendingAuto === Number(unitId)) state.story.pendingAuto = null;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function stripAssetUrl(unitId) {
    return `assets/story/unit-${Number(unitId)}-strip.webp`;
  }

  function grandFinaleAssetUrl() {
    return "assets/story/egg-grand.webp";
  }

  function isGrandFinaleUnlocked(state) {
    return (
      typeof curriculumGrandFinaleUnlocked === "function" &&
      curriculumGrandFinaleUnlocked(state)
    );
  }

  function shouldAutoShowGrandFinale(state) {
    return isGrandFinaleUnlocked(state) && !ensureStory(state).eggGrandSeen;
  }

  function markGrandFinaleSeen(state) {
    ensureStory(state).eggGrandSeen = true;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function openGrandFinaleModal(state, options = {}) {
    if (!isGrandFinaleUnlocked(state) && !storyDevMode()) return;
    if (!modalEl) modalEl = document.getElementById("story-reward-modal");
    const el = modalEl;
    if (!el) return;
    const src = grandFinaleAssetUrl();
    const prog =
      typeof curriculumGrandFinaleProgress === "function"
        ? curriculumGrandFinaleProgress(state)
        : { goldLessons: 0, total: 24 };
    el.innerHTML = `<div class="mvp-backdrop-inner story-reward-sheet story-reward-sheet--grand">
      <header class="story-reward-head">
        <div>
          <p class="story-reward-eyebrow zh-annotation">隐藏彩蛋 · 仅全通可见</p>
          <h2 class="story-reward-title jp">日本文化 · 二十四景</h2>
          <p class="story-reward-strip-title zh-annotation">六单元 · 二十四课 · 每课四颗金星</p>
        </div>
        <button type="button" class="story-reward-close btn secondary" aria-label="閉じる">✕</button>
      </header>
      <div class="story-reward-comic story-reward-comic--grand">
        <img class="story-reward-comic-img" src="${escapeHtml(src)}" alt="" decoding="async" />
      </div>
      <p class="story-reward-foot zh-annotation">金星 ${prog.goldLessons}/${prog.total} · <code>${escapeHtml(src)}</code></p>
    </div>`;
    el.classList.add("active");
    el.setAttribute("aria-hidden", "false");
    const close = () => {
      el.classList.remove("active");
      el.setAttribute("aria-hidden", "true");
      if (options.markSeen !== false) markGrandFinaleSeen(state);
    };
    el.querySelector(".story-reward-close")?.addEventListener("click", close);
    el.addEventListener(
      "click",
      (ev) => {
        if (ev.target === el) close();
      },
      { once: true }
    );
  }

  function panelAssetUrl(unitId, panelIndex, variant) {
    const v = variant === "dialogue" ? "dialogue" : "clean";
    const n = Number(panelIndex) + 1;
    if (v === "dialogue") {
      return `assets/story/unit-${Number(unitId)}-panel-${n}-dialogue.png`;
    }
    return `assets/story/unit-${Number(unitId)}-panel-${n}-clean.png`;
  }

  function getUnitStoryboard(unitId) {
    if (typeof UNIT_STRIP_STORYBOARD === "undefined") return null;
    return UNIT_STRIP_STORYBOARD.find((u) => u.unitId === Number(unitId)) || null;
  }

  function panelStoryData(unitId, index) {
    const sb =
      typeof StoryComicUi !== "undefined" ? StoryComicUi.getUnitStoryboard(unitId) : null;
    return sb?.panels?.[index] || null;
  }

  /** 格角小字 · 画册感（非课文摘要） */
  function panelCornerCaptionZh(panel) {
    if (!panel) return "";
    if (panel.cornerZh) return panel.cornerZh;
    const cloud = (panel.sceneCloud || "").split("·")[0].trim();
    const short = {
      成田空港: "成田抵日",
      成田到達: "成田抵日",
      空港売店: "机场卖店",
      浅草駅前: "浅草站前",
      ホテル: "酒店房间",
    };
    for (const [key, zh] of Object.entries(short)) {
      if (cloud.includes(key)) return zh;
    }
    if (cloud && cloud.length <= 14) return cloud;
    if (typeof getCurriculumLessonDisplay === "function") {
      const d = getCurriculumLessonDisplay(panel.lessonId);
      if (d.themeZh) return d.themeZh;
    }
    return "";
  }

  function isAlbumStripUnit(unitId) {
    const id = Number(unitId);
    return id >= 1 && id <= 6;
  }

  /** 2×2 · 格内仅日文漫画泡（最多2句）· 已解锁格可点开放大 */
  function renderStripPanelsGrid(state, unit) {
    const theme = CURRICULUM_STAGE_THEMES[unit.id] || CURRICULUM_STAGE_THEMES[1];
    const rec = getUnitRecord(state, unit.id);
    const accent = theme.accent || "#e57373";
    const bg = theme.bg || theme.pageBg || "#fff5f5";
    const renderInterior =
      typeof StoryComicUi !== "undefined"
        ? StoryComicUi.renderPanelInterior.bind(StoryComicUi)
        : () => "";

    return unit.lessons
      .map((L, i) => {
        const unlocked = rec.stripUnlocked[i] || lessonAllGatesDone(state, L.lessonId);
        const cls = unlocked ? "is-unlocked" : "is-locked";
        const panelData = panelStoryData(unit.id, i);
        const tag = unlocked ? "button" : "div";
        const attrs = unlocked
          ? ` type="button" data-panel-zoom="${i}" aria-label="第${L.lessonId}課を拡大"`
          : ` aria-hidden="true"`;
        return `<${tag} class="story-reward-panel ${cls}" style="--panel-accent:${accent};--panel-bg:${bg}"${attrs}>
          <span class="story-reward-panel-slot">${i + 1}</span>
          <div class="story-reward-panel-manga">${renderInterior(panelData)}</div>
        </${tag}>`;
      })
      .join("");
  }

  function renderComicStrip(state, unit) {
    const allUnlocked = isUnitComplete(state, unit.id);
    const src = stripAssetUrl(unit.id);
    const gridCls = allUnlocked ? " is-unit-complete" : "";
    const album = isAlbumStripUnit(unit.id);

    const quadCells = [0, 1, 2, 3]
      .map((i) => {
        const cap = panelCornerCaptionZh(panelStoryData(unit.id, i));
        const lid = unit.lessons[i]?.lessonId || i + 1;
        const capHtml = cap
          ? `<span class="story-reward-panel-caption zh-annotation">${escapeHtml(cap)}</span>`
          : "";
        return `<button type="button" class="story-reward-quad-hit" data-panel-zoom="${i}" aria-label="${escapeHtml(cap || `第${lid}課`)}">${capHtml}</button>`;
      })
      .join("");

    return `
      <div class="story-reward-comic" role="group">
        <div class="story-reward-comic-frame story-reward-comic-frame--gallery${album ? " story-reward-comic-frame--album" : ""}" data-strip-fullscreen="1" role="button" tabindex="0" aria-label="四格を満画面で見る">
          <img class="story-reward-comic-img" src="${escapeHtml(src)}" alt="" decoding="async" />
          <div class="story-reward-strip story-reward-strip--grid${gridCls}">
            ${renderStripPanelsGrid(state, unit)}
          </div>
          <div class="story-reward-quad-hits" hidden aria-hidden="true">
            ${quadCells}
          </div>
        </div>
        <div class="story-reward-comic-actions">
          <button type="button" class="btn secondary story-comic-fullscreen-btn" data-strip-fullscreen="1" hidden>満画面</button>
        </div>
        ${
          album
            ? `<p class="story-reward-rotate-hint zh-annotation">竖排四格 · 点格放大 · 横竖屏均可读</p>`
            : `<p class="story-reward-rotate-hint zh-annotation">四格纪念页＝无字纯画 · 満画面收藏 · 点格看画外课文</p>`
        }
      </div>`;
  }

  let zoomEl = null;

  function getZoomModal() {
    if (!zoomEl) zoomEl = document.getElementById("story-comic-zoom");
    return zoomEl;
  }

  function closeZoom() {
    const el = getZoomModal();
    if (!el) return;
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    const body = el.querySelector(".story-comic-zoom-body");
    if (body) body.innerHTML = "";
  }

  function openPanelZoom(unitId, panelIndex) {
    const el = getZoomModal();
    if (!el) return;
    const panel = panelStoryData(unitId, panelIndex);
    const lessonId = panel?.lessonId || panelIndex + 1;
    const artSrc = panelAssetUrl(unitId, panelIndex, "clean");
    const headline = panel?.headline || "";
    const arcUnit = getUnitStoryboard(unitId);
    const prose = isAlbumStripUnit(unitId) ? "" : arcUnit?.unitArcZh || "";
    const bubbleHtml =
      typeof StoryComicUi !== "undefined" && panel
        ? `<div class="story-comic-zoom-dialogue">${StoryComicUi.renderPanelInterior(panel, {
            maxBubbles: StoryComicUi.MAX_BUBBLES_ZOOM || 8,
            includeHighlights: true,
          })}</div>`
        : "";
    el.innerHTML = `
      <div class="story-comic-zoom-sheet story-comic-zoom-sheet--panel">
        <button type="button" class="story-comic-zoom-close btn secondary" aria-label="閉じる">✕</button>
        <p class="story-comic-zoom-label jp">第${lessonId}課</p>
        ${headline ? `<p class="story-comic-zoom-headline jp">${escapeHtml(headline)}</p>` : ""}
        <div class="story-comic-zoom-body story-comic-zoom-body--panel">
          <div class="story-comic-zoom-art-mat">
            <img class="story-comic-zoom-panel-img" src="${escapeHtml(artSrc)}" alt="" decoding="async" />
          </div>
          ${bubbleHtml}
        </div>
        ${prose ? `<p class="story-comic-zoom-unit-arc zh-annotation">${escapeHtml(prose)}</p>` : ""}
      </div>`;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
    el.querySelector(".story-comic-zoom-close")?.addEventListener("click", closeZoom);
    el.onclick = (ev) => {
      if (ev.target === el) closeZoom();
    };
    el.querySelector(".story-comic-zoom-sheet")?.addEventListener("click", (ev) => ev.stopPropagation());
  }

  function openStripFullscreen(unitId) {
    const el = getZoomModal();
    if (!el) return;
    const src = stripAssetUrl(unitId);
    el.innerHTML = `
      <div class="story-comic-zoom-sheet story-comic-zoom-sheet--strip">
        <button type="button" class="story-comic-zoom-close btn secondary" aria-label="閉じる">✕</button>
        <div class="story-comic-zoom-body story-comic-zoom-body--strip">
          <img class="story-comic-zoom-strip-img" src="${escapeHtml(src)}" alt="" />
        </div>
      </div>`;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
    const img = el.querySelector(".story-comic-zoom-strip-img");
    if (img) {
      img.onerror = () => {
        closeZoom();
      };
    }
    el.querySelector(".story-comic-zoom-close")?.addEventListener("click", closeZoom);
    el.onclick = (ev) => {
      if (ev.target === el) closeZoom();
    };
    el.querySelector(".story-comic-zoom-sheet")?.addEventListener("click", (ev) => ev.stopPropagation());
  }

  function bindComicInteractions(root, unit) {
    if (!root || !unit) return;
    const uid = unit.id;

    root.querySelectorAll("[data-panel-zoom]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const idx = Number(btn.dataset.panelZoom);
        if (Number.isNaN(idx)) return;
        openPanelZoom(uid, idx);
      });
    });

    root.querySelectorAll("[data-strip-fullscreen]").forEach((node) => {
      node.addEventListener("click", (ev) => {
        const img = root.querySelector(".story-reward-comic-img");
        if (!img?.classList.contains("is-loaded")) return;
        ev.stopPropagation();
        openStripFullscreen(uid);
      });
      if (node.classList.contains("story-reward-comic-frame")) {
        node.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            node.click();
          }
        });
      }
    });
  }

  function bindComicStripImage(root) {
    const img = root?.querySelector(".story-reward-comic-img");
    const grid = root?.querySelector(".story-reward-strip--grid");
    if (!img || !grid) return;

    const frame = root?.querySelector(".story-reward-comic-frame");

    const fsBtn = root?.querySelector(".story-comic-fullscreen-btn");

    const quadHits = root?.querySelector(".story-reward-quad-hits");

    function applyStripLayout() {
      if (!frame || img.naturalWidth < 1) return;
      const vertical = img.naturalHeight > img.naturalWidth * 1.02;
      frame.classList.toggle("story-reward-comic-frame--vertical", vertical);
      frame.classList.toggle("story-reward-comic-frame--landscape-grid", !vertical);
      if (quadHits) {
        quadHits.classList.toggle("story-reward-quad-hits--vertical", vertical);
        quadHits.classList.toggle("story-reward-quad-hits--grid", !vertical);
      }
    }

    function showArt() {
      img.classList.add("is-loaded");
      img.style.display = "";
      grid.classList.add("is-hidden");
      grid.setAttribute("aria-hidden", "true");
      if (frame) frame.classList.add("has-art");
      applyStripLayout();
      if (fsBtn) fsBtn.hidden = false;
      if (quadHits) {
        quadHits.hidden = false;
        quadHits.setAttribute("aria-hidden", "false");
      }
    }

    function showPlaceholder() {
      img.classList.remove("is-loaded");
      img.style.display = "none";
      grid.classList.remove("is-hidden");
      grid.setAttribute("aria-hidden", "false");
      if (frame) frame.classList.remove("has-art");
      if (fsBtn) fsBtn.hidden = true;
      if (quadHits) {
        quadHits.hidden = true;
        quadHits.setAttribute("aria-hidden", "true");
      }
    }

    img.addEventListener("load", () => {
      if (img.naturalWidth > 0) showArt();
      else showPlaceholder();
    });
    img.addEventListener("error", showPlaceholder);

    if (img.complete) {
      if (img.naturalWidth > 0) showArt();
      else showPlaceholder();
    }
  }

  function renderModalContent(state, unitId) {
    const unit = getHomeUnit(unitId);
    if (!unit) return "";
    const theme = CURRICULUM_STAGE_THEMES[unit.id] || CURRICULUM_STAGE_THEMES[1];

    const sb = getUnitStoryboard(unit.id);
    const stripTitle = sb?.stripTitle || "";
    const unitArc = sb?.unitArcZh || "";
    const album = isAlbumStripUnit(unit.id);

    const headBlock = album
      ? `
            <p class="story-reward-eyebrow">单元四格</p>
            ${stripTitle ? `<h2 class="story-reward-title story-reward-title--album jp">${escapeHtml(stripTitle)}</h2>` : `<h2 class="story-reward-title story-reward-title--album jp">${escapeHtml(unit.titleJa)}</h2>`}`
      : `
            <p class="story-reward-eyebrow">ぐるみの日本旅 · 纪念四联画</p>
            <h2 class="story-reward-title">${escapeHtml(unit.titleJa)} <span class="zh-annotation">${escapeHtml(unit.titleZh)}</span></h2>
            ${stripTitle ? `<p class="story-reward-strip-title jp">${escapeHtml(stripTitle)}</p>` : ""}`;

    const footBlock =
      storyDevMode() && !album
        ? `<p class="story-reward-foot zh-annotation">美工稿：<code>${escapeHtml(stripAssetUrl(unit.id))}</code> · 未出图时显示 2×2 占位格</p>`
        : "";

    return `
      <div class="story-reward-inner story-reward-inner--${album ? "album" : "classic"}" style="--stage-accent:${theme.accent};--unit-border:${theme.border}">
        <header class="story-reward-head">
          <div>${headBlock}</div>
          <button type="button" class="story-reward-close btn secondary" aria-label="閉じる">✕</button>
        </header>
        ${
          unitArc && !album
            ? `<div class="story-reward-passage zh-annotation"><p>${escapeHtml(unitArc)}</p></div>`
            : ""
        }
        ${album ? renderUnitRecapSummary(unit) : ""}
        ${renderComicStrip(state, unit)}
        ${footBlock}
      </div>`;
  }

  /** 单元达成 · 四格一览（重要信息汇总，非长文课文） */
  function renderUnitRecapSummary(unit) {
    const sb = getUnitStoryboard(unit.id);
    if (!sb?.panels?.length) return "";
    const items = sb.panels
      .map((p, i) => {
        const corner = p.cornerZh || p.sceneCloud?.split("·")[0]?.trim() || `第${p.lessonId}課`;
        const coach =
          typeof getLessonCoachSummary === "function"
            ? getLessonCoachSummary(p.lessonId)?.lines?.[0]?.zh
            : "";
        const sub = coach ? `<span class="story-unit-recap-zh zh-annotation">${escapeHtml(coach)}</span>` : "";
        return `<li><span class="story-unit-recap-idx">${i + 1}</span><span class="story-unit-recap-label">${escapeHtml(corner)}</span>${sub}</li>`;
      })
      .join("");
    const crumb = unit.titleZh ? `${escapeHtml(unit.titleZh)}` : "";
    return `
      <section class="story-reward-unit-recap zh-annotation" aria-label="单元要点一览">
        <p class="story-reward-unit-recap-title">本单元 · 重要信息</p>
        ${crumb ? `<p class="story-reward-unit-recap-crumb">${crumb}</p>` : ""}
        <ol class="story-reward-unit-recap-list">${items}</ol>
      </section>`;
  }

  function getModal() {
    if (!modalEl) modalEl = document.getElementById("story-reward-modal");
    return modalEl;
  }

  function closeModal() {
    const el = getModal();
    if (!el) return;
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = "";
  }

  function openModal(state, unitId, options) {
    const el = getModal();
    if (!el) return;
    const uid = Number(unitId);
    syncUnitStrip(state, getHomeUnit(uid));
    el.innerHTML = `<div class="mvp-backdrop-inner story-reward-sheet">${renderModalContent(state, uid)}</div>`;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");

    if (options?.markSeen) markRewardSeen(state, uid);

    const closeBtn = el.querySelector(".story-reward-close");
    if (closeBtn) {
      closeBtn.onclick = () => closeModal();
    }
    el.onclick = (ev) => {
      if (ev.target === el) closeModal();
    };
    const sheet = el.querySelector(".story-reward-sheet");
    const unit = getHomeUnit(uid);
    if (sheet) {
      sheet.onclick = (ev) => ev.stopPropagation();
      bindComicStripImage(sheet);
      bindComicInteractions(sheet, unit);
    }
  }

  function giftButtonHtml(state, unitId, uv) {
    if (storyDevMode()) {
      const title = isUnitComplete(state, unitId)
        ? "开发：预览四格（已齐）"
        : "开发：预览四格（未齐，可看灰格）";
      return `<button type="button" class="journey-unit-gift journey-unit-gift--dev" data-unit-story="${unitId}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">👁</button>`;
    }
    if (!isUnitComplete(state, unitId)) return "";
    const seen = getUnitRecord(state, unitId).rewardSeen;
    const title = seen ? "再看本单元四格插图" : "本单元四格插图";
    return `<button type="button" class="journey-unit-gift journey-unit-gift--strip" data-unit-story="${unitId}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">▦</button>`;
  }

  /** 进度变化后：同步格解锁；单元刚完成则排队首次自动弹 */
  function onStateChanged(state, options) {
    syncAllStrips(state);
    return state;
  }

  function afterHomeRender(state) {
    syncAllStrips(state);
    if (typeof StoryEgg !== "undefined") {
      StoryEgg.afterHomeRender(state);
      return;
    }
    if (shouldAutoShowGrandFinale(state)) {
      window.setTimeout(() => {
        const home = document.getElementById("view-home");
        if (!home || !home.classList.contains("active")) return;
        openGrandFinaleModal(state, { markSeen: true });
      }, 500);
      return;
    }
    const uid = findAutoUnitId(state);
    if (uid == null) return;
    window.setTimeout(() => {
      const home = document.getElementById("view-home");
      if (!home || !home.classList.contains("active")) return;
      openModal(state, uid, { markSeen: true });
    }, 400);
  }

  function bindGiftButtons(board, state) {
    board.querySelectorAll("[data-unit-story]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const uid = Number(btn.dataset.unitStory);
        if (typeof StoryEgg !== "undefined" && StoryEgg.isUnitFourGold(state, uid)) {
          StoryEgg.openUnitEgg(state, uid, { markSeen: false });
        } else {
          openModal(state, uid, { markSeen: false });
        }
      });
    });
  }

  return {
    ensureStory,
    syncAllStrips,
    isUnitComplete,
    isGrandFinaleUnlocked,
    shouldAutoShowGrandFinale,
    openGrandFinaleModal,
    markGrandFinaleSeen,
    grandFinaleAssetUrl,
    storyDevMode,
    giftButtonHtml,
    onStateChanged,
    afterHomeRender,
    openModal,
    closeModal,
    bindGiftButtons,
    openPanelZoom,
    openStripFullscreen,
    closeZoom,
  };
})();

/** 开发者分段验收 · 控制台 StoryRewardDev.help() */
const StoryRewardDev = (function () {
  function bridge() {
    return typeof window !== "undefined" && window.MvpDev ? window.MvpDev : null;
  }

  function withState(mutator) {
    const b = bridge();
    if (!b) {
      console.warn("[StoryRewardDev] 请在 index 页面使用；依赖 window.MvpDev");
      return null;
    }
    const state = b.getState();
    mutator(state);
    b.setState(state);
    return state;
  }

  function logStatus(unitId) {
    const b = bridge();
    if (!b) return;
    const state = b.getState();
    const uid = Number(unitId);
    const unit = typeof getCurriculumUnitsForHome === "function"
      ? getCurriculumUnitsForHome().find((u) => u.id === uid)
      : null;
    const rec = StoryReward.ensureStory(state).units[String(uid)] || {
      rewardSeen: false,
      stripUnlocked: [false, false, false, false],
    };
    const prog =
      unit && typeof curriculumUnitProgress === "function"
        ? curriculumUnitProgress(state, unit)
        : null;
    console.table({
      单元: uid,
      "课进度(四关)": prog ? `${prog.cleared}/${prog.total}` : "—",
      单元cleared: StoryReward.isUnitComplete(state, uid),
      rewardSeen: !!rec.rewardSeen,
      pendingAuto: state.story?.pendingAuto ?? null,
      格1: !!rec.stripUnlocked?.[0],
      格2: !!rec.stripUnlocked?.[1],
      格3: !!rec.stripUnlocked?.[2],
      格4: !!rec.stripUnlocked?.[3],
    });
  }

  function preview(unitId) {
    const b = bridge();
    if (!b) return;
    StoryReward.openModal(b.getState(), Number(unitId), { markSeen: false });
    console.log("[StoryRewardDev] preview 单元", unitId);
  }

  function unlockPanels(unitId, panels) {
    withState((state) => {
      const rec = StoryReward.ensureStory(state).units[String(Number(unitId))] || {
        rewardSeen: false,
        stripUnlocked: [false, false, false, false],
      };
      if (!state.story.units[String(Number(unitId))]) {
        state.story.units[String(Number(unitId))] = rec;
      }
      const arr = Array.isArray(panels) ? panels : [panels];
      arr.forEach((p) => {
        const i = Number(p) - 1;
        if (i >= 0 && i < 4) rec.stripUnlocked[i] = true;
      });
      StoryReward.syncAllStrips(state);
    });
    logStatus(unitId);
    bridge()?.renderHome();
    console.log("[StoryRewardDev] unlockPanels", unitId, panels);
  }

  function clearPanels(unitId) {
    withState((state) => {
      const key = String(Number(unitId));
      state.story.units[key] = { rewardSeen: false, stripUnlocked: [false, false, false, false] };
    });
    bridge()?.renderHome();
    logStatus(unitId);
  }

  function gateLesson(lessonId, on) {
    withState((state) => {
      const lid = Number(lessonId);
      if (on === false) {
        state.lessons[lid] =
          typeof mvpLessonGatesEmpty === "function"
            ? mvpLessonGatesEmpty()
            : { gate0: false, gate1: false, gate2: false, gate3: false, touched: {} };
      } else {
        const mvpFive =
          typeof curriculumIsMvpFiveGateLesson === "function" && curriculumIsMvpFiveGateLesson(lid);
        state.lessons[lid] = mvpFive
          ? typeof mvpLessonGatesUnit1Cleared === "function"
            ? mvpLessonGatesUnit1Cleared()
            : {
                gate0: true,
                gate1: true,
                gate2: true,
                gate3: true,
                gate4: true,
                touched: { 0: true, 1: true, 2: true, 3: true, 4: true },
              }
          : typeof mvpLessonGatesCleared === "function"
            ? mvpLessonGatesCleared()
            : { gate0: true, gate1: true, gate2: true, gate3: true, touched: { 0: true, 1: true, 2: true, 3: true } };
      }
      StoryReward.onStateChanged(state, { lessonId: lid });
    });
    bridge()?.renderHome();
    logStatus(typeof getUnitIdForLesson === "function" ? getUnitIdForLesson(lessonId) : "?");
  }

  function simulateUnitComplete(unitId) {
    const uid = Number(unitId);
    const unit =
      typeof getCurriculumUnitsForHome === "function"
        ? getCurriculumUnitsForHome().find((u) => u.id === uid)
        : null;
    if (!unit) return;
    withState((state) => {
      ensureEggsForDev(state);
      unit.lessons.forEach((L) => {
        const lid = L.lessonId;
        const mvpFive =
          typeof curriculumIsMvpFiveGateLesson === "function" && curriculumIsMvpFiveGateLesson(lid);
        state.lessons[lid] = mvpFive
          ? typeof mvpLessonGatesUnit1Cleared === "function"
            ? mvpLessonGatesUnit1Cleared()
            : {
                gate0: true,
                gate1: true,
                gate2: true,
                gate3: true,
                gate4: true,
                touched: { 0: true, 1: true, 2: true, 3: true, 4: true },
              }
          : typeof mvpLessonGatesCleared === "function"
            ? mvpLessonGatesCleared()
            : { gate0: true, gate1: true, gate2: true, gate3: true, touched: { 0: true, 1: true, 2: true, 3: true } };
      });
      StoryReward.syncAllStrips(state);
      getUnitRecordForDev(state, uid).rewardSeen = false;
      delete state.story.eggs.unit[String(uid)];
      state.story.pendingAuto = uid;
    });
    bridge()?.renderHome();
    console.log("[StoryRewardDev] simulateUnitComplete → 回首页应首次自动弹", uid);
    logStatus(uid);
  }

  function ensureEggsForDev(state) {
    StoryReward.ensureStory(state);
    if (!state.story.eggs) state.story.eggs = { lesson: {}, unit: {}, ultimate: {} };
  }

  function getUnitRecordForDev(state, unitId) {
    StoryReward.ensureStory(state);
    const key = String(Number(unitId));
    if (!state.story.units[key]) {
      state.story.units[key] = { rewardSeen: false, stripUnlocked: [false, false, false, false] };
    }
    return state.story.units[key];
  }

  function resetSeen(unitId) {
    withState((state) => {
      getUnitRecordForDev(state, unitId).rewardSeen = false;
      state.story.pendingAuto = Number(unitId);
    });
    bridge()?.renderHome();
    console.log("[StoryRewardDev] resetSeen → renderHome 后应自动弹", unitId);
  }

  function triggerAuto(unitId) {
    resetSeen(unitId);
  }

  function bootFromUrl(mvpDev) {
    const q = location.search || "";
    const m = q.match(/[?&]storyPreview=(\d+)/);
    if (m) {
      window.setTimeout(() => preview(Number(m[1])), 600);
    }
    const m2 = q.match(/[?&]storyAuto=(\d+)/);
    if (m2) {
      window.setTimeout(() => simulateUnitComplete(Number(m2[1])), 500);
    }
    const m3 = q.match(/[?&]storyPanel=(\d+)-(\d+)/);
    if (m3) {
      unlockPanels(Number(m3[1]), [Number(m3[2])]);
      preview(Number(m3[1]));
    }
  }

  function grandFinaleStatus() {
    const b = bridge();
    if (!b) return;
    const state = b.getState();
    const prog =
      typeof curriculumGrandFinaleProgress === "function"
        ? curriculumGrandFinaleProgress(state)
        : { goldLessons: 0, total: 24, unlocked: false };
    console.table({
      金星课数: `${prog.goldLessons}/${prog.total}`,
      全家福解锁: prog.unlocked,
      eggGrandSeen: !!state.story?.eggGrandSeen,
      资产: StoryReward.grandFinaleAssetUrl(),
    });
  }

  function simulateGrandFinale() {
    withState((state) => {
      ensureEggsForDev(state);
      if (typeof CURRICULUM_GRAND_FINALE_LESSON_IDS !== "undefined") {
        CURRICULUM_GRAND_FINALE_LESSON_IDS.forEach((id) => {
          state.lessons[id] =
            typeof mvpLessonGatesCleared === "function"
              ? mvpLessonGatesCleared()
              : { gate0: true, gate1: true, gate2: true, gate3: true, touched: { 0: true, 1: true, 2: true, 3: true } };
        });
      }
      state.story.eggGrandSeen = false;
      state.story.eggs.ultimate = { seen: false };
      StoryReward.syncAllStrips(state);
    });
    bridge()?.renderHome();
    console.log("[StoryRewardDev] simulateGrandFinale → 回首页应弹隐藏全家福");
    grandFinaleStatus();
  }

  function previewGrandFinale() {
    const b = bridge();
    if (!b) return;
    const state = b.getState();
    if (typeof StoryEgg !== "undefined") StoryEgg.openUltimateEgg(state, { markSeen: false });
    else StoryReward.openGrandFinaleModal(state, { markSeen: false });
    console.log("[StoryRewardDev] previewGrandFinale（未 markSeen）");
  }

  function resetGrandFinaleSeen() {
    withState((state) => {
      state.story.eggGrandSeen = false;
    });
    console.log("[StoryRewardDev] resetGrandFinaleSeen");
  }

  function help() {
    console.log(`
StoryRewardDev — 分段测四格（不必先打通单元）

① 只看 UI     StoryRewardDev.preview(1)
② 亮第 2 格   StoryRewardDev.unlockPanels(1, 2)
③ 模拟看完    StoryRewardDev.simulateUnitComplete(1)  → 四格齐+排队首次弹
④ 重测首次弹  StoryRewardDev.resetSeen(1)            → 单元已齐时再用
⑤ 单课四关    StoryRewardDev.gateLesson(1, true)
⑥ 状态表      StoryRewardDev.status(1)

隐藏全家福（24课×4金星）:
⑦ 进度        StoryRewardDev.grandFinaleStatus()
⑧ 模拟全通    StoryRewardDev.simulateGrandFinale()
⑨ 预览弹层    StoryRewardDev.previewGrandFinale()
⑩ 重测首次弹  StoryRewardDev.resetGrandFinaleSeen()

URL（刷新首页）:
  ?storyDev=1&storyAuto=1  U1 模拟看完并首次弹
  ?storyPreview=1        直接弹 U1 四格（旧条带画册）
  ?storyEggLesson=1      L1 单课彩蛋
  ?egg=unit&unitId=1     L2 单元拼图
  ?egg=ultimate          L3 二十四景
  ?storyPanel=1-2        U1 只亮格2并预览
  ?storyAuto=2           U2 模拟看完并首次弹

首页每个单元标题旁 👁 = 开发预览（localhost 默认开启）

全册叙事审阅（6页×4格纵滚）:
  python scripts/serve-storyboard.py
  → http://127.0.0.1:8777/storyboard-preview.html
`);
  }

  return {
    help,
    status: logStatus,
    preview,
    unlockPanels,
    clearPanels,
    gateLesson,
    simulateUnitComplete,
    resetSeen,
    triggerAuto,
    bootFromUrl,
    grandFinaleStatus,
    simulateGrandFinale,
    previewGrandFinale,
    resetGrandFinaleSeen,
  };
})();
