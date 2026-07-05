/**
 * 三级彩蛋 · H5 真源 docs/story-egg-three-tier-系统定稿.md
 * L1 单课 · L2 单元拼图 · L3 终极 4×6
 */
const StoryEgg = (function () {
  let modalEl = null;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function ensureEggs(state) {
    if (typeof StoryReward !== "undefined") StoryReward.ensureStory(state);
    else if (!state.story) state.story = { units: {}, pendingAuto: null, eggGrandSeen: false, eggs: {} };
    if (!state.story.eggs) state.story.eggs = { lesson: {}, unit: {}, ultimate: {} };
    return state.story;
  }

  function getModal() {
    if (!modalEl) modalEl = document.getElementById("story-reward-modal");
    return modalEl;
  }

  function getUnitStoryboard(unitId) {
    if (typeof UNIT_STRIP_STORYBOARD === "undefined") return null;
    return UNIT_STRIP_STORYBOARD.find((u) => u.unitId === Number(unitId)) || null;
  }

  function getHomeUnit(unitId) {
    if (typeof getCurriculumUnitsForHome !== "function") return null;
    return getCurriculumUnitsForHome().find((u) => u.id === Number(unitId)) || null;
  }

  function isLessonFourGold(state, lessonId) {
    return (
      typeof curriculumLessonCleared === "function" && curriculumLessonCleared(state, Number(lessonId))
    );
  }

  function isUnitFourGold(state, unitId) {
    return (
      typeof curriculumUnitFourGold === "function" && curriculumUnitFourGold(state, Number(unitId))
    );
  }

  function isGrandUnlocked(state) {
    return (
      typeof curriculumGrandFinaleUnlocked === "function" && curriculumGrandFinaleUnlocked(state)
    );
  }

  function panelIndexForLesson(unitId, lessonId) {
    const sb = getUnitStoryboard(unitId);
    if (!sb?.panels) return 0;
    const i = sb.panels.findIndex((p) => p.lessonId === Number(lessonId));
    return i >= 0 ? i : 0;
  }

  function lessonEggImageUrl(unitId, lessonId) {
    const lid = Number(lessonId);
    const uid = Number(unitId);
    const slot = panelIndexForLesson(uid, lid) + 1;
    const panel = storyAssetUrl(`assets/story/unit-${uid}-panel-${slot}-clean.png`);
    const egg = storyAssetUrl(`assets/story/lesson-${lid}-egg.webp`);
    const eggPng = storyAssetUrl(`assets/story/lesson-${lid}-egg.png`);
    return { primary: panel, fallbacks: [egg, eggPng] };
  }

  function lessonCornerLabel(lessonId) {
    const d =
      typeof getCurriculumLessonDisplay === "function"
        ? getCurriculumLessonDisplay(lessonId)
        : null;
    const theme = d?.themeZh || "";
    return theme ? `第${lessonId}課 · ${theme}` : `第${lessonId}課`;
  }

  function panelForLesson(unitId, lessonId) {
    const sb = getUnitStoryboard(unitId);
    if (!sb?.panels) return { panel: null, index: -1 };
    const index = sb.panels.findIndex((p) => p.lessonId === Number(lessonId));
    return { panel: index >= 0 ? sb.panels[index] : null, index };
  }

  /** 与分镜 cornerZh + headline 对齐，不用错格文案 */
  function lessonPointZh(unitId, lessonId) {
    const { panel } = panelForLesson(unitId, lessonId);
    const d =
      typeof getCurriculumLessonDisplay === "function"
        ? getCurriculumLessonDisplay(lessonId)
        : null;
    if (d?.themeZh) return d.themeZh;
    if (typeof getLessonCoachSummary === "function") {
      const coach = getLessonCoachSummary(lessonId);
      const line = coach?.lines?.find((ln) => ln.zh && ln.zh.length > 2);
      if (line?.zh) return line.zh;
    }
    const beat = panel?.visualBeat?.split("；")[0]?.trim();
    return beat && beat.length <= 40 ? beat : "";
  }

  function unitStripUrl(unitId) {
    return `assets/story/unit-${Number(unitId)}-strip.webp`;
  }

  function renderStripPanelLabels(unitId) {
    if (typeof StoryCaptionJp !== "undefined") {
      return StoryCaptionJp.renderL2PanelLabelsHtml(unitId, "story-egg-l2");
    }
    return "";
  }

  function renderUnitInfoList(unit, currentLessonId) {
    const sb = getUnitStoryboard(unit.id);
    if (!sb?.panels?.length) return "";
    return sb.panels
      .map((p, i) => {
        const corner = p.cornerZh || p.sceneCloud?.split("·")[0]?.trim() || `第${p.lessonId}課`;
        const zh = lessonPointZh(unit.id, p.lessonId);
        const isCurrent = p.lessonId === Number(currentLessonId);
        return `<li class="story-egg-unit-item${isCurrent ? " is-current" : ""}">
          <span class="story-egg-unit-idx">${i + 1}</span>
          <span class="story-egg-unit-label">${escapeHtml(corner)}</span>
          ${zh ? `<span class="story-egg-unit-zh zh-annotation">${escapeHtml(zh)}</span>` : ""}
        </li>`;
      })
      .join("");
  }

  function renderLessonEggContent(state, lessonId) {
    const lid = Number(lessonId);
    const unitId =
      typeof getUnitIdForLesson === "function" ? getUnitIdForLesson(lid) : Math.ceil(lid / 4);
    const unit = getHomeUnit(unitId);
    const theme = CURRICULUM_STAGE_THEMES?.[unitId] || CURRICULUM_STAGE_THEMES?.[1] || {};
    const body =
      typeof LessonRecap !== "undefined" && unit
        ? LessonRecap.renderEggContent(lid, unit)
        : `<p class="zh-annotation">本课汇总加载中</p>`;

    return `
      <div class="story-egg-inner story-egg-inner--l1" style="--stage-accent:${theme.accent};--unit-border:${theme.border}">
        <header class="story-egg-head">
          <div>
            <p class="story-egg-eyebrow">单课彩蛋</p>
            <p class="story-egg-title-meta jp">第${lid}課</p>
          </div>
          <button type="button" class="story-egg-close btn secondary" aria-label="閉じる">✕</button>
        </header>
        ${body}
        <footer class="story-egg-actions">
          <button type="button" class="btn secondary story-egg-share" disabled title="分享（準備中）">分享成绩</button>
          <button type="button" class="btn primary story-egg-continue">继续下一课</button>
        </footer>
      </div>`;
  }

  function bindLessonEggImage(root) {
    if (typeof LessonRecap !== "undefined" && LessonRecap.bindEggImages) {
      LessonRecap.bindEggImages(root);
      return;
    }
    const img = root?.querySelector(".story-egg-art, .story-egg-know-card-img");
    if (!img) return;
    const fallbacks = (img.dataset.fallbacks || "").split(",").filter(Boolean);
    let fi = 0;
    img.onerror = () => {
      if (fi < fallbacks.length) img.src = fallbacks[fi++];
    };
  }

  function storyAssetUrl(path) {
    if (!path) return path;
    const v = typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER ? ShareWechat.CACHE_VER : "";
    if (!v || path.includes("?")) return path;
    return `${path}?v=${v}`;
  }

  function bindImgFallbacks(root, selector) {
    root?.querySelectorAll(selector).forEach((img) => {
      const fallbacks = (img.dataset.fallbacks || "").split(",").filter(Boolean);
      let fi = 0;
      img.onerror = () => {
        if (fi < fallbacks.length) {
          img.src = storyAssetUrl(fallbacks[fi++]);
          return;
        }
        img.classList.add("story-egg-img-missing");
        img.removeAttribute("src");
        img.setAttribute("role", "presentation");
      };
    });
  }

  function closeModal() {
    const el = getModal();
    if (!el) return;
    if (typeof StoryEggViewport !== "undefined") StoryEggViewport.hookClose();
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    el.classList.remove("story-egg-modal--fullscreen");
    el.innerHTML = "";
  }

  function openSheet(html, sheetClass, options = {}) {
    const el = getModal();
    if (!el) return null;
    el.classList.toggle("story-egg-modal--fullscreen", !!options.fullscreen);
    el.innerHTML = `<div class="mvp-backdrop-inner story-reward-sheet story-egg-sheet ${sheetClass}">${html}</div>`;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
    if (typeof StoryEggViewport !== "undefined") StoryEggViewport.hookOpen();
    return el.querySelector(`.${sheetClass.split(" ")[0]}`) || el;
  }

  function wireClose(sheet, onClose) {
    const el = getModal();
    const close = () => {
      closeModal();
      onClose?.();
    };
    sheet?.querySelector(".story-egg-close")?.addEventListener("click", close);
    sheet?.querySelector(".story-egg-continue")?.addEventListener("click", close);
    el.onclick = (ev) => {
      if (ev.target === el) close();
    };
    sheet?.addEventListener("click", (ev) => ev.stopPropagation());
    return close;
  }

  function markLessonEggSeen(state, lessonId) {
    ensureEggs(state);
    const key = String(Number(lessonId));
    if (!state.story.eggs.lesson[key]) {
      state.story.eggs.lesson[key] = { seen: false, unlockedAt: Date.now() };
    }
    state.story.eggs.lesson[key].seen = true;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function markUnitEggSeen(state, unitId) {
    ensureEggs(state);
    const key = String(Number(unitId));
    state.story.eggs.unit[key] = { seen: true, unlockedAt: Date.now() };
    if (typeof StoryReward !== "undefined") {
      StoryReward.ensureStory(state);
      if (!state.story.units[key]) {
        state.story.units[key] = { rewardSeen: true, stripUnlocked: [true, true, true, true] };
      } else {
        state.story.units[key].rewardSeen = true;
      }
    }
    if (state.story.pendingAuto === Number(unitId)) state.story.pendingAuto = null;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function markUltimateSeen(state) {
    ensureEggs(state);
    state.story.eggs.ultimate = { seen: true, unlockedAt: Date.now() };
    state.story.eggGrandSeen = true;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function shouldAutoShowLessonEgg(state, lessonId) {
    if (!isLessonFourGold(state, lessonId)) return false;
    const key = String(Number(lessonId));
    return !state.story?.eggs?.lesson?.[key]?.seen;
  }

  function shouldAutoShowUnitEgg(state, unitId) {
    if (!isUnitFourGold(state, unitId)) return false;
    const key = String(Number(unitId));
    return !state.story?.eggs?.unit?.[key]?.seen;
  }

  function shouldAutoShowUltimate(state) {
    if (!isGrandUnlocked(state)) return false;
    return !state.story?.eggGrandSeen && !state.story?.eggs?.ultimate?.seen;
  }

  function openLessonEgg(state, lessonId, options = {}) {
    const lid = Number(lessonId);
    const sheet = openSheet(renderLessonEggContent(state, lid), "story-egg-sheet--l1");
    bindLessonEggImage(sheet);
    wireClose(sheet, options.onClose);
    if (options.markSeen !== false) markLessonEggSeen(state, lid);
  }

  /** L2 · 全屏 · 单元条带一整张（可裁切，不拉伸）+ 每格双行日文 */
  function renderUnitEggContent(state, unitId) {
    const strip = unitStripUrl(unitId);
    const labels = renderStripPanelLabels(unitId);
    return `
      <div class="story-egg-inner story-egg-inner--l2">
        <button type="button" class="story-egg-close story-egg-close--float btn secondary" aria-label="閉じる">✕</button>
        <div class="story-egg-l2-strip-stage" role="img" aria-label="单元四格条带">
          <img class="story-egg-l2-strip-img" src="${escapeHtml(strip)}" alt="" decoding="async" />
          ${labels ? `<div class="story-egg-l2-panel-labels" aria-hidden="true">${labels}</div>` : ""}
        </div>
        <button type="button" class="story-egg-continue story-egg-continue--float btn primary">继续</button>
      </div>`;
  }

  function openUnitEgg(state, unitId, options = {}) {
    const uid = Number(unitId);
    const sheet = openSheet(renderUnitEggContent(state, uid), "story-egg-sheet--l2", { fullscreen: true });
    const stripImg = sheet?.querySelector(".story-egg-l2-strip-img");
    if (stripImg) {
      stripImg.onerror = () => {
        const unit = getHomeUnit(uid);
        if (!unit || !sheet) return;
        sheet.querySelector(".story-egg-l2-strip-stage").innerHTML = unit.lessons
          .map((L, i) => {
            const imgs = lessonEggImageUrl(uid, L.lessonId);
            const cap = lessonCornerLabel(L.lessonId);
            return `<div class="story-egg-l2-cell">
              <img src="${escapeHtml(imgs.primary)}" alt="" decoding="async" loading="lazy"
                data-fallbacks="${escapeHtml(imgs.fallbacks.join(","))}" />
              <span class="story-egg-l2-cap jp">${escapeHtml(cap)}</span>
            </div>`;
          })
          .join("");
        sheet.querySelector(".story-egg-l2-strip-stage").classList.add("story-egg-l2-strip-stage--grid");
        bindImgFallbacks(sheet, ".story-egg-l2-cell img");
      };
    }
    const close = wireClose(sheet, () => {
      if (options.markSeen !== false) markUnitEggSeen(state, uid);
      options.onClose?.();
    });
    return close;
  }

  /** L3 · 4×6 · 每格中央双行：活动（粗）+ 地点（细） */
  function renderUltimateEggContent() {
    const slate = typeof GRAND_SLATE !== "undefined" ? GRAND_SLATE : [];
    const caps = typeof GRAND_SPOT_CAPTIONS !== "undefined" ? GRAND_SPOT_CAPTIONS : {};
    const cells = [];
    for (let row = 0; row < slate.length; row++) {
      for (let col = 0; col < slate[row].length; col++) {
        const cardId = slate[row][col];
        const n = String(cardId).padStart(2, "0");
        const c = caps[cardId] || {
          activityJp: GRAND_SPOT_NAMES?.[cardId] || "",
          placeJp: "",
        };
        const cardBase = `assets/story/grand/card-${n}`;
        const card = storyAssetUrl(`${cardBase}-clean.png`);
        const cardFallbacks = [
          `${cardBase}-harmonized.png`,
          `${cardBase}-draft.png`,
          "assets/story/egg-grand.webp",
        ].join(",");
        const capHtml =
          typeof StoryCaptionJp !== "undefined"
            ? StoryCaptionJp.renderL3CapBlockHtml(
                cardId,
                row,
                col,
                c.activityJp,
                c.placeJp,
                "story-egg-l3"
              )
            : `<div class="story-egg-l3-cap-block story-egg-l3-cap-block--bl">
            <span class="story-egg-l3-act jp">${escapeHtml(c.activityJp)}</span>
            ${c.placeJp ? `<span class="story-egg-l3-place jp">${escapeHtml(c.placeJp)}</span>` : ""}
          </div>`;
        cells.push(`<div class="story-egg-l3-cell" data-card-id="${cardId}" data-grid-row="${row + 1}" data-grid-col="${col + 1}">
          <img src="${escapeHtml(card)}" alt="" decoding="async" loading="lazy"
            data-fallbacks="${escapeHtml(cardFallbacks)}" />
          ${capHtml}
        </div>`);
      }
    }
    return `
      <div class="story-egg-inner story-egg-inner--l3">
        <button type="button" class="story-egg-close story-egg-close--float btn secondary" aria-label="閉じる">✕</button>
        <div class="story-egg-l3-grid" aria-label="日本文化二十四景">${cells.join("")}</div>
        <button type="button" class="story-egg-continue story-egg-continue--float btn primary">继续</button>
      </div>`;
  }

  function openUltimateEgg(state, options = {}) {
    const sheet = openSheet(renderUltimateEggContent(), "story-egg-sheet--l3", { fullscreen: true });
    bindImgFallbacks(sheet, ".story-egg-l3-cell img");
    wireClose(sheet, () => {
      if (options.markSeen !== false) markUltimateSeen(state);
      options.onClose?.();
    });
  }

  function chainAfterUnitEgg(state, unitId, onDone) {
    const uid = Number(unitId);
    const unit = getHomeUnit(uid);
    const isLastUnit = unit && CURRICULUM_UNITS?.[CURRICULUM_UNITS.length - 1]?.id === uid;
    if (isLastUnit && isGrandUnlocked(state) && shouldAutoShowUltimate(state)) {
      openUltimateEgg(state, { markSeen: true, onClose: onDone });
      return;
    }
    onDone?.();
  }

  function chainAfterLessonEgg(state, lessonId, onDone) {
    const lid = Number(lessonId);
    const unitId =
      typeof getUnitIdForLesson === "function" ? getUnitIdForLesson(lid) : null;
    const unit = unitId ? getHomeUnit(unitId) : null;
    const isLast = unit?.lessons?.[unit.lessons.length - 1]?.lessonId === lid;
    if (isLast && unitId && isUnitFourGold(state, unitId) && shouldAutoShowUnitEgg(state, unitId)) {
      openUnitEgg(state, unitId, {
        markSeen: true,
        onClose: () => chainAfterUnitEgg(state, unitId, onDone),
      });
      return;
    }
    if (isGrandUnlocked(state) && shouldAutoShowUltimate(state)) {
      openUltimateEgg(state, { markSeen: true, onClose: onDone });
      return;
    }
    onDone?.();
  }

  function afterQuizComplete(state, lessonId, onDone) {
    const lid = Number(lessonId);
    ensureEggs(state);
    if (typeof StoryReward !== "undefined") StoryReward.onStateChanged(state, { lessonId: lid });

    if (!isLessonFourGold(state, lid)) {
      onDone?.();
      return;
    }

    const key = String(lid);
    if (!state.story.eggs.lesson[key]) {
      state.story.eggs.lesson[key] = { seen: false, unlockedAt: Date.now() };
      if (typeof saveMvpState === "function") saveMvpState(state);
    }

    if (shouldAutoShowLessonEgg(state, lid)) {
      openLessonEgg(state, lid, {
        markSeen: true,
        onClose: () => {
          if (typeof LessonRecap !== "undefined") LessonRecap.queueHighlight(state, lid);
          chainAfterLessonEgg(state, lid, onDone);
        },
      });
      return;
    }

    if (typeof LessonRecap !== "undefined") LessonRecap.queueHighlight(state, lid);
    chainAfterLessonEgg(state, lid, onDone);
  }

  function afterHomeRender(state) {
    if (typeof HyougaTestCard !== "undefined" && HyougaTestCard.skipsHomeAutoEggPopup()) {
      return;
    }
    if (shouldAutoShowUltimate(state)) {
      window.setTimeout(() => {
        const home = document.getElementById("view-home");
        if (!home?.classList.contains("active")) return;
        openUltimateEgg(state, { markSeen: true });
      }, 500);
      return;
    }
    const pending = state.story?.pendingAuto;
    if (pending != null && shouldAutoShowUnitEgg(state, pending)) {
      window.setTimeout(() => {
        const home = document.getElementById("view-home");
        if (!home?.classList.contains("active")) return;
        openUnitEgg(state, pending, { markSeen: true });
      }, 400);
    }
  }

  /** ?storyEggLesson=1 · ?egg=lesson&lessonId=1 · ?egg=unit&unitId=1 · ?egg=ultimate */
  function bootFromUrl(state) {
    const q = location.search || "";
    const ultimate = /[?&]egg=ultimate/.test(q);
    const unitM = /[?&](?:unitId|storyEggUnit)=(\d+)/.exec(q);
    const lessonM =
      /[?&](?:lessonId|storyEggLesson)=(\d+)/.exec(q) || /[?&]egg=lesson[^&]*&lessonId=(\d+)/.exec(q);
    if (ultimate) {
      openUltimateEgg(state, { markSeen: false });
      return;
    }
    if (/[?&]egg=unit/.test(q) && unitM) {
      openUnitEgg(state, Number(unitM[1]), { markSeen: false });
      return;
    }
    if (unitM && !lessonM) {
      openUnitEgg(state, Number(unitM[1]), { markSeen: false });
      return;
    }
    if (lessonM) {
      openLessonEgg(state, Number(lessonM[1]), { markSeen: false });
    }
  }

  return {
    openLessonEgg,
    openUnitEgg,
    openUltimateEgg,
    afterQuizComplete,
    afterHomeRender,
    isLessonFourGold,
    isUnitFourGold,
    unitStripUrl,
    bootFromUrl,
  };
})();
