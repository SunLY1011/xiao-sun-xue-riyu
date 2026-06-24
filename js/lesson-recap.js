/**
 * 课文通关 · 学习地图知识汇总卡（格大图 + 要点/会話）
 * 数据：unit-strip-storyboard · lessons-mvp-depth · curriculum-catalog
 */
const LessonRecap = (function () {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function getUnitStoryboard(unitId) {
    if (typeof UNIT_STRIP_STORYBOARD === "undefined") return null;
    return UNIT_STRIP_STORYBOARD.find((u) => u.unitId === Number(unitId)) || null;
  }

  function panelForLesson(unitId, lessonId) {
    const sb = getUnitStoryboard(unitId);
    if (!sb?.panels?.length) return { panel: null, index: -1 };
    const index = sb.panels.findIndex((p) => p.lessonId === Number(lessonId));
    return { panel: index >= 0 ? sb.panels[index] : null, index };
  }

  function storyAssetUrl(path) {
    if (!path) return path;
    const v = typeof ShareWechat !== "undefined" && ShareWechat.CACHE_VER ? ShareWechat.CACHE_VER : "";
    if (!v || path.includes("?")) return path;
    return `${path}?v=${v}`;
  }

  function panelImageUrl(unitId, panelIndex) {
    if (panelIndex < 0) return "";
    return storyAssetUrl(`assets/story/unit-${Number(unitId)}-panel-${panelIndex + 1}-clean.png`);
  }

  function lessonCleared(state, lessonId) {
    return (
      typeof curriculumLessonCleared === "function" && curriculumLessonCleared(state, Number(lessonId))
    );
  }

  function buildBreadcrumb(unit, panel, lessonDisplay) {
    const theme = CURRICULUM_STAGE_THEMES?.[unit.id] || {};
    const parts = [];
    if (theme.spectrum) parts.push(theme.spectrum);
    else if (theme.label) parts.push(theme.label);
    if (unit.titleZh) parts.push(unit.titleZh);
    if (panel?.cornerZh) parts.push(panel.cornerZh);
    else if (lessonDisplay?.themeZh) parts.push(lessonDisplay.themeZh);
    return parts.filter(Boolean).join(" · ");
  }

  function pickKnowledgeLines(lessonId, panel) {
    const lines = [];
    const display =
      typeof getCurriculumLessonDisplay === "function" ? getCurriculumLessonDisplay(lessonId) : null;
    if (display?.themeZh) {
      lines.push({ jp: display.headline || "", zh: display.themeZh });
    }
    const coach =
      typeof getLessonCoachSummary === "function" ? getLessonCoachSummary(lessonId) : null;
    if (coach?.lines?.length) {
      coach.lines.forEach((ln) => {
        if (ln.zh && ln.zh.length > 2 && ln.zh !== coach.subtitle) lines.push({ jp: ln.ja || "", zh: ln.zh });
        else if (ln.ja) lines.push({ jp: ln.ja, zh: ln.zh || "" });
      });
    }
    const hints =
      typeof getLessonDifficultVocabHints === "function"
        ? getLessonDifficultVocabHints(lessonId)
        : null;
    if (hints?.lineZh) lines.push({ jp: hints.lineJa || "", zh: hints.lineZh });
    if (panel?.visualBeat) {
      const beat = panel.visualBeat.split("；")[0].trim();
      if (beat.length <= 48) lines.push({ jp: "", zh: beat });
    }
    const seen = new Set();
    return lines.filter((l) => {
      const k = (l.jp + l.zh).slice(0, 40);
      if (seen.has(k)) return false;
      seen.add(k);
      return l.jp || l.zh;
    }).slice(0, 3);
  }

  function pickDialogueLines(lessonId, panel) {
    if (panel?.bubbles?.length) {
      return panel.bubbles.slice(0, 4).map((b) => ({
        jp: b.jp,
        zh: b.zh || "",
        role: b.role || "",
      }));
    }
    if (typeof getLessonDialogues === "function") {
      const dlg = getLessonDialogues(lessonId)[0];
      if (dlg?.lines?.length) {
        return dlg.lines.slice(0, 4).map((ln) => ({
          jp: ln.jp || ln.ja || "",
          zh: ln.zh || "",
          role: ln.role || "",
        }));
      }
    }
    return [];
  }

  function buildRecapData(lessonId, unit) {
    const lid = Number(lessonId);
    const display =
      typeof getCurriculumLessonDisplay === "function" ? getCurriculumLessonDisplay(lid) : {};
    const { panel, index } = panelForLesson(unit.id, lid);
    return {
      lessonId: lid,
      unitId: unit.id,
      panelIndex: index,
      headline: display.headline || `第${lid}課`,
      themeZh: display.themeZh || "",
      breadcrumb: buildBreadcrumb(unit, panel, display),
      stripTitle: getUnitStoryboard(unit.id)?.stripTitle || "",
      imageUrl: panelImageUrl(unit.id, index),
      cornerZh: panel?.cornerZh || "",
      knowledge: pickKnowledgeLines(lid, panel),
      dialogue: pickDialogueLines(lid, panel),
    };
  }

  function lessonEggImageCandidates(unitId, lessonId, panelIndex) {
    const lid = Number(lessonId);
    const uid = Number(unitId);
    const slot = panelIndex >= 0 ? panelIndex + 1 : 1;
    const panel = `assets/story/unit-${uid}-panel-${slot}-clean.png`;
    return [
      panel,
      `assets/story/lesson-${lid}-egg.webp`,
      `assets/story/lesson-${lid}-egg.png`,
    ];
  }

  /** L1 单课彩蛋弹层 · 课文 + 本课要点 + 知识小卡片 */
  function renderEggContent(lessonId, unit) {
    const data = buildRecapData(lessonId, unit);
    const { panel } = panelForLesson(data.unitId, data.lessonId);
    const imgs = lessonEggImageCandidates(data.unitId, data.lessonId, data.panelIndex);
    const primary = imgs[0];

    const pointsHtml = data.knowledge.length
      ? `<ul class="story-egg-points-list">${data.knowledge
          .map(
            (l) =>
              `<li>${l.jp ? `<span class="jp story-egg-point-jp">${escapeHtml(l.jp)}</span>` : ""}${
                l.zh ? `<span class="zh-annotation story-egg-point-zh">${escapeHtml(l.zh)}</span>` : ""
              }</li>`
          )
          .join("")}</ul>`
      : `<p class="story-egg-points-empty zh-annotation">要点整理中</p>`;

    const cardLine =
      data.knowledge[0]?.jp || data.headline || (data.panelIndex >= 0 ? data.cornerZh : "");

    const speakBtn = (jp) =>
      typeof SpeakUI !== "undefined" && jp
        ? SpeakUI.btnHtml(jp, 'class="btn-speak-icon story-egg-dialogue-speak" title="听"')
        : "";

    let dialogueHtml = "";
    if (typeof StoryComicUi !== "undefined" && panel?.bubbles?.length) {
      dialogueHtml = `<section class="story-egg-dialogue story-egg-dialogue--comic" aria-label="会話四格">
          <p class="story-egg-block-label">会話 · 四格</p>
          <div class="story-egg-comic-inner">${StoryComicUi.renderPanelInterior(panel, {
            maxBubbles: StoryComicUi.MAX_BUBBLES_ZOOM || 8,
            includeHighlights: true,
          })}</div>
        </section>`;
    } else if (data.dialogue.length) {
      dialogueHtml = `<section class="story-egg-dialogue" aria-label="会話">
          <p class="story-egg-block-label">会話 · 再听一遍</p>
          <ul class="story-egg-dialogue-list">${data.dialogue
            .map(
              (l) =>
                `<li class="story-egg-dialogue-line">
                  <div class="story-egg-dialogue-row">
                    <div class="story-egg-dialogue-main">
                      ${l.role ? `<span class="story-egg-dialogue-role">${escapeHtml(l.role)}</span>` : ""}
                      ${l.jp ? `<span class="jp story-egg-dialogue-jp">${escapeHtml(l.jp)}</span>` : ""}
                    </div>
                    ${speakBtn(l.jp)}
                  </div>
                  ${
                    l.zh
                      ? `<span class="zh-annotation story-egg-dialogue-zh">${escapeHtml(l.zh)}</span>`
                      : ""
                  }
                </li>`
            )
            .join("")}</ul>
        </section>`;
    }

    return `
      <section class="story-egg-lesson-block" aria-label="課文">
        <p class="story-egg-block-label">课文</p>
        <h2 class="story-egg-lesson-headline jp">${escapeHtml(data.headline)}</h2>
        ${
          data.themeZh
            ? `<p class="story-egg-lesson-theme zh-annotation">${escapeHtml(data.themeZh)}</p>`
            : ""
        }
        ${
          data.breadcrumb
            ? `<p class="story-egg-lesson-crumb zh-annotation">${escapeHtml(data.breadcrumb)}</p>`
            : ""
        }
      </section>
      <section class="story-egg-points" aria-label="本课要点">
        <p class="story-egg-block-label">本课要点</p>
        ${pointsHtml}
      </section>
      <section class="story-egg-know-card" aria-label="知识小卡片">
        <p class="story-egg-block-label">知识小卡片</p>
        <figure class="story-egg-know-card-inner">
          <img class="story-egg-know-card-img" src="${escapeHtml(primary)}" alt="" decoding="async"
            data-fallbacks="${escapeHtml(imgs.slice(1).join(","))}" />
          <figcaption class="story-egg-know-card-cap">
            ${cardLine ? `<span class="jp story-egg-know-card-jp">${escapeHtml(cardLine)}</span>` : ""}
            ${
              data.cornerZh
                ? `<span class="zh-annotation story-egg-know-card-zh">${escapeHtml(data.cornerZh)}</span>`
                : ""
            }
          </figcaption>
        </figure>
      </section>
      ${dialogueHtml}`;
  }

  function bindEggImages(root) {
    root?.querySelectorAll(".story-egg-know-card-img, .story-egg-art").forEach((img) => {
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

  function renderSlot(state, unit, lessonId) {
    if (!lessonCleared(state, lessonId)) return "";
    const data = buildRecapData(lessonId, unit);
    const knowHtml = data.knowledge.length
      ? `<ul class="journey-recap-know">${data.knowledge
          .map(
            (l) =>
              `<li>${l.jp ? `<span class="jp">${escapeHtml(l.jp)}</span>` : ""}${
                l.zh ? `<span class="zh-annotation">${escapeHtml(l.zh)}</span>` : ""
              }</li>`
          )
          .join("")}</ul>`
      : "";
    const dlgHtml = data.dialogue.length
      ? `<div class="journey-recap-dialogue">
          <p class="journey-recap-dialogue-label zh-annotation">会話 · 再听一遍</p>
          <ul>${data.dialogue
            .map(
              (l) =>
                `<li><span class="journey-recap-role">${escapeHtml(l.role)}</span>
                  <span class="jp">${escapeHtml(l.jp)}</span>
                  ${
                    l.zh
                      ? `<span class="zh-annotation journey-recap-dlg-zh">${escapeHtml(l.zh)}</span>`
                      : ""
                  }</li>`
            )
            .join("")}</ul>
        </div>`
      : "";
    const imgBlock = data.imageUrl
      ? `<button type="button" class="journey-recap-art-btn" data-recap-zoom="${data.unitId}" data-recap-panel="${data.panelIndex}" aria-label="放大本格插画">
          <img class="journey-recap-art" src="${escapeHtml(data.imageUrl)}" alt="" loading="lazy" decoding="async" />
          ${data.cornerZh ? `<span class="journey-recap-art-tag zh-annotation">${escapeHtml(data.cornerZh)}</span>` : ""}
        </button>`
      : "";

    return `
      <article class="journey-lesson-recap" data-recap-lesson="${data.lessonId}" aria-label="第${data.lessonId}課 知识汇总">
        <header class="journey-recap-head">
          <p class="journey-recap-eyebrow zh-annotation">本課まとめ</p>
          <p class="journey-recap-crumb zh-annotation">${escapeHtml(data.breadcrumb)}</p>
          <h3 class="journey-recap-title jp">${escapeHtml(data.headline)}</h3>
        </header>
        <div class="journey-recap-body">
          ${imgBlock}
          <div class="journey-recap-text">
            ${knowHtml}
            ${dlgHtml}
          </div>
        </div>
      </article>`;
  }

  function queueHighlight(state, lessonId) {
    if (typeof StoryReward !== "undefined" && StoryReward.ensureStory) {
      StoryReward.ensureStory(state);
    } else if (!state.story) {
      state.story = { units: {} };
    }
    state.story.highlightRecapLessonId = Number(lessonId);
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function clearHighlight(state) {
    if (state.story) state.story.highlightRecapLessonId = null;
    if (typeof saveMvpState === "function") saveMvpState(state);
  }

  function bind(board, state) {
    if (!board) return;
    board.querySelectorAll("[data-recap-zoom]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const uid = Number(btn.dataset.recapZoom);
        const idx = Number(btn.dataset.recapPanel);
        if (typeof StoryReward !== "undefined" && StoryReward.openPanelZoom) {
          StoryReward.openPanelZoom(uid, idx);
        }
      });
    });
  }

  function afterHomeRender(state, board) {
    if (!board || !state?.story?.highlightRecapLessonId) return;
    const lid = state.story.highlightRecapLessonId;
    const el = board.querySelector(`[data-recap-lesson="${lid}"]`);
    if (!el) return;
    window.setTimeout(() => {
      el.classList.add("is-recap-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      window.setTimeout(() => el.classList.remove("is-recap-highlight"), 2400);
      clearHighlight(state);
    }, 120);
  }

  return {
    buildRecapData,
    renderEggContent,
    bindEggImages,
    renderSlot,
    queueHighlight,
    bind,
    afterHomeRender,
  };
})();
