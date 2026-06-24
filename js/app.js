(function () {
  let state = loadMvpState();
  let activeLessonId = null;
  /** 0=単語 1=文法 2=会話 3=作業 4=まとめ */
  let activeGate = -1;
  /** 从笔记「去学本课」进入时，退出课内回到此视图 */
  let lessonReturnView = null;

  const titles = {
    home: "日语初级课后练习",
    lesson: "学習中",
    review: "復習",
    write: "书写",
    me: "笔记",
  };

  /** 从左到右 = 推荐学习顺序；序号与位置一致 */
  const cockpitTabs = [
    { k: 0, label: "単語", icon: "🃏", sub: "フラッシュ" },
    { k: 2, label: "会話", icon: "💬", sub: "多场景", recommended: true },
    { k: 1, label: "文法", icon: "📖", sub: "ネット" },
    { k: 3, label: "作業", icon: "📝", sub: "練習" },
    { k: 4, label: "拡張", icon: "📋", sub: "まとめ" },
  ];

  /** 第1单元 MVP 五关（第1～4课，与第1课同一套 Lesson1Flow） */
  function isUnit1MvpFiveGate(lessonId) {
    const lid = lessonId != null ? Number(lessonId) : activeLessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit1Mvp(lid);
  }

  /** 第2单元 MVP 五关（第5～8课，同 Lesson1Flow 壳） */
  function isUnit2MvpFiveGate(lessonId) {
    const lid = lessonId != null ? Number(lessonId) : activeLessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit2Mvp(lid);
  }

  /** 第3–6单元 MVP 五关（第9～24课） */
  function isUnits3MvpFiveGate(lessonId) {
    const lid = lessonId != null ? Number(lessonId) : activeLessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnits3to6Mvp(lid);
  }

  /** 五关课（1–4 · 5–8 · 9–24） */
  function isMvpFiveGate(lessonId) {
    return isUnit1MvpFiveGate(lessonId) || isUnit2MvpFiveGate(lessonId) || isUnits3MvpFiveGate(lessonId);
  }

  function isL1FiveGate(lessonId) {
    return isMvpFiveGate(lessonId);
  }

  function isUnit1Lesson(lessonId) {
    const lid = lessonId != null ? Number(lessonId) : activeLessonId;
    return lid >= 2 && lid <= 4;
  }

  /** 第1課 · 序号/折叠条颜色随当前关（単語0/会話2/文法1/作業3/拡張4） */
  function syncL1GateTheme(lessonId, gate) {
    const body = document.getElementById("lesson-flow-body");
    if (!body) return;
    const l1 = isMvpFiveGate(lessonId);
    const g = String(gate);
    if (l1) {
      body.classList.add("l1-lesson-scope");
      body.setAttribute("data-l1-active-gate", g);
      body.querySelectorAll(".gate-scroll-region").forEach((el) => {
        el.classList.add("l1-lesson-scope");
        el.setAttribute("data-l1-active-gate", g);
      });
    } else {
      body.removeAttribute("data-l1-active-gate");
      body.classList.remove("l1-lesson-scope");
      body.querySelectorAll(".gate-scroll-region").forEach((el) => {
        el.removeAttribute("data-l1-active-gate");
        el.classList.remove("l1-lesson-scope");
      });
    }
  }

  function maxGateIndex(lessonId) {
    return isMvpFiveGate(lessonId) ? 4 : 3;
  }

  function cockpitTabsForLesson(lessonId) {
    if (isMvpFiveGate(lessonId)) return Lesson1Flow.COCKPIT_TABS;
    return cockpitTabs;
  }

  function resolveGate(g, lessonId) {
    if (g === "vocab" || g === 0 || g === "0") return 0;
    if (g === "grammar" || g === 1 || g === "1") return 1;
    if (g === "conversation" || g === "convo" || g === 2 || g === "2") return 2;
    if (g === "quiz" || g === "homework" || g === 3 || g === "3") return 3;
    if (g === "extension" || g === "summary" || g === 4 || g === "4") {
      return isMvpFiveGate(lessonId) ? 4 : null;
    }
    const n = Number(g);
    const max = maxGateIndex(lessonId);
    return n >= 0 && n <= max ? n : null;
  }

  /** 单词→会話→文法→(作業/テスト)→拡張；会話未过则优先会話 */
  function defaultGateForLesson(g, lessonId) {
    if (isMvpFiveGate(lessonId)) {
      if (!g.gate0) return 0;
      if (!g.gate2) return 2;
      if (!g.gate1) return 1;
      if (!g.gate3) return 3;
      if (!g.gate4) return 4;
      return 4;
    }
    if (!g.gate0) return 0;
    if (!g.gate2) return 2;
    if (!g.gate1) return 1;
    if (!g.gate3) return 3;
    return 2;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function lessonTitleHtml(L) {
    if (L.lessonTitleRuby && typeof RubyRender !== "undefined") {
      return RubyRender.fromSegments(L.lessonTitle, L.lessonTitleRuby);
    }
    return escapeHtml(L.lessonTitle);
  }

  function applyZhSetting() {
    document.documentElement.dataset.showZh = state.showChineseZh !== false ? "1" : "0";
  }

  function lessonProgress(lessonId) {
    const base = {
      gate0: false,
      gate1: false,
      gate2: false,
      gate3: false,
      gate4: false,
      touched: {},
    };
    return { ...base, ...(state.lessons[Number(lessonId)] || {}) };
  }

  function setModalOpen(m, open) {
    if (!m) return;
    m.hidden = !open;
    m.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      m.style.display = "";
      m.style.pointerEvents = "";
    } else {
      m.style.display = "none";
      m.style.pointerEvents = "none";
    }
  }

  function closeAllModals() {
    document.querySelectorAll(".mvp-backdrop, .gn-modal").forEach((m) => setModalOpen(m, false));
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.stopAllPlayback) {
      SpeechEngine.stopAllPlayback();
    }
  }

  function renderLessonFlowHead(L) {
    const head = document.getElementById("lesson-flow-head");
    if (!head || !L) return;
    if (isMvpFiveGate(L.lessonId)) {
      head.innerHTML = Lesson1Flow.flowHeadHtml(L, activeGate, state);
      if (typeof SpeakUI !== "undefined") SpeakUI.bind(head);
      return;
    }
    const themeZh =
      state.showChineseZh !== false && L.themeZh
        ? `<span class="zh-annotation">（${escapeHtml(L.themeZh)}）</span>`
        : "";
    const titleSpeakPayload = {
      jp: L.lessonTitle,
      kana:
        L.lessonTitleRuby && typeof RubyRender !== "undefined"
          ? RubyRender.toKanaReading(L.lessonTitle, L.lessonTitleRuby)
          : L.lessonTitle,
      ruby: L.lessonTitleRuby,
    };
    if (activeGate === 0) {
      head.innerHTML = `<p class="hint-ja lc-head-slim">① 上の数字で「あと何語」がわかります。② 各行の右 🔊 で聞く。③ 下まで見たら「看完了 → 会話」。</p>`;
    } else if (activeGate === 2) {
      head.innerHTML = `
        <div class="headline-row">
          <p class="headline-jp jp">${lessonTitleHtml(L)}</p>
          ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(titleSpeakPayload, 'id="lesson-speak-title" title="听本课课文"') : ""}
        </div>
        ${themeZh ? `<p class="lc-theme-slim">${escapeHtml(L.theme)}${themeZh}</p>` : ""}
        <p class="hint-ja lc-head-slim">① 上のタブでシーン切替。② A の 🔊 → B の 🎤 → ✓。③ 上の数字と右のバーで残りがわかります。</p>`;
    } else if (activeGate === 1) {
      head.innerHTML = `
        <p class="headline-jp jp">${lessonTitleHtml(L)}</p>
        ${themeZh ? `<p class="lc-theme-slim">${escapeHtml(L.theme)}${themeZh}</p>` : ""}
        <p class="hint-ja lc-head-slim">卡片をめくる · 下にスクロールで残り枚数を確認 · 🔊 で例文。</p>`;
    } else {
      head.innerHTML = `
        <p class="headline-jp jp">${lessonTitleHtml(L)}</p>
        ${themeZh ? `<p class="lc-theme-slim">${escapeHtml(L.theme)}${themeZh}</p>` : ""}`;
    }
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(head);
  }

  function switchGate(k) {
    const next = Number(k);
    const max = maxGateIndex(activeLessonId);
    if (Number.isNaN(next) || next < 0 || next > max || next === activeGate) return;
    if (activeLessonId != null && typeof touchLessonGate === "function") {
      touchLessonGate(state, activeLessonId, next);
    }
    activeGate = next;
    syncL1GateTheme(activeLessonId, activeGate);
    closeAllModals();
    const L = getLessonMvp(activeLessonId);
    renderLessonCockpit(lessonProgress(activeLessonId));
    renderLessonFlowHead(L);
    mountGate();
    if (typeof ScrollHint !== "undefined") {
      ScrollHint.scrollRegionTop(document.getElementById("lesson-flow-body"));
    }
  }

  function exitLessonView() {
    const v = lessonReturnView || "home";
    lessonReturnView = null;
    if (typeof HyougaGlyphs !== "undefined" && typeof HyougaGlyphs.clearUnitGateFoldColors === "function") {
      HyougaGlyphs.clearUnitGateFoldColors();
    }
    showView(v);
  }

  function enterLesson(lessonId, gate, opts) {
    activeLessonId = Number(lessonId);
    state.lastLessonId = activeLessonId;
    lessonReturnView = opts && opts.returnView ? opts.returnView : null;
    if (typeof touchCurriculumUnit === "function" && typeof getUnitIdForLesson === "function") {
      touchCurriculumUnit(state, getUnitIdForLesson(activeLessonId));
      saveMvpState(state);
    }
    const resolved = resolveGate(gate, activeLessonId);
    activeGate =
      resolved != null
        ? resolved
        : defaultGateForLesson(lessonProgress(activeLessonId), activeLessonId);
    if (typeof touchLessonGate === "function") touchLessonGate(state, activeLessonId, activeGate);
    syncL1GateTheme(activeLessonId, activeGate);
    if (typeof applyUnitThemeToView === "function") {
      applyUnitThemeToView(activeLessonId);
    }
    saveMvpState(state);
    showView("lesson");
  }

  window.AppNav = function (view, lessonId, gate) {
    if (view === "flash" && lessonId) {
      enterLesson(lessonId, 0);
      return;
    }
    if (lessonId && view === "lesson") {
      enterLesson(lessonId, gate);
      return;
    }
    if (lessonId) {
      activeLessonId = Number(lessonId);
      state.lastLessonId = activeLessonId;
      saveMvpState(state);
    }
    showView(view);
  };

  function splashOverlayEl() {
    return document.getElementById("home-splash-overlay");
  }

  function isSplashOpen() {
    const el = splashOverlayEl();
    return !!(el && !el.classList.contains("is-hidden"));
  }

  function hideSplash() {
    const el = splashOverlayEl();
    if (!el) return;
    el.classList.add("is-hidden");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-splash-open");
    const top = document.querySelector(".top-bar");
    const nav = document.querySelector(".bottom-nav");
    if (top) top.style.display = "";
    if (nav) nav.style.removeProperty("display");
  }

  function showSplash() {
    const el = splashOverlayEl();
    if (!el) return;
    el.classList.remove("is-hidden");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-splash-open");
    const nav = document.querySelector(".bottom-nav");
    const top = document.querySelector(".top-bar");
    if (nav) nav.style.display = "none";
    if (top) top.style.display = "none";
    if (typeof HomeSplash !== "undefined") {
      HomeSplash.render({ state });
      HomeSplash.bind(enterFromSplash);
    }
  }

  function shouldShowSplashOnBoot() {
    try {
      if (/[?&]nosplash=1(?:&|$)/.test(location.search || "")) return false;
    } catch (_) {
      /* ignore */
    }
    return true;
  }

  function enterFromSplash() {
    hideSplash();
    showView("home");
  }

  function showView(name) {
    if (isSplashOpen()) hideSplash();
    const ae = document.activeElement;
    if (ae && typeof ae.blur === "function") ae.blur();
    const targetId = `view-${name}`;
    document.querySelectorAll(".view").forEach((v) => {
      const on = v.id === targetId;
      v.classList.toggle("active", on);
      v.setAttribute("aria-hidden", on ? "false" : "true");
    });
    const navHighlight = name === "lesson" ? "home" : name;
    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("active", n.dataset.view === navHighlight);
    });
    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "flex";
    if (typeof HyoTopBar !== "undefined") {
      HyoTopBar.update(name);
    } else {
      document.getElementById("page-title").textContent = titles[name] || titles.home;
    }

    if (name !== "lesson") closeAllModals();

    if (name === "home") renderHome();
    else if (name === "lesson") renderLessonFlow();
    else if (name === "flash") {
      if (activeLessonId) enterLesson(activeLessonId, 0);
      else showView("home");
    }     else if (name === "review") renderReview();
    else if (name === "write") renderWrite();
    else if (name === "me") renderMe();
    updateReviewBadge();
  }

  function renderWrite() {
    const root = document.getElementById("write-l0-root");
    if (!root || typeof WriteKanaL0 === "undefined") return;
    WriteKanaL0.render(root, state, (next) => {
      state = next;
      saveMvpState(state);
    });
  }

  function updateReviewBadge() {
    const n = dueMistakes(state).length;
    const label = n > 9 ? "9+" : String(n);
    ["review-badge", "review-badge-me"].forEach((id) => {
      const badge = document.getElementById(id);
      if (badge) {
        badge.hidden = n === 0;
        badge.textContent = label;
      }
    });
  }

  function gateLabels() {
    return [
      { k: 1, label: "文法ネット" },
      { k: 2, label: "会話" },
      { k: 3, label: "テスト" },
    ];
  }

  function renderHome() {
    const weekEl = document.getElementById("home-week-count");
    const studied = state.studyDays.filter((d) => {
      const wkAgo = new Date();
      wkAgo.setDate(wkAgo.getDate() - 6);
      return new Date(d) >= wkAgo;
    }).length;
    if (weekEl) weekEl.textContent = `学習日数（今週）：${studied} 日`;

    if (typeof JourneyHome !== "undefined" && typeof getCurriculumUnitsForHome === "function") {
      JourneyHome.render({
        state,
        onEnterLesson: (id, gate) => enterLesson(id, gate),
        lessonProgress,
      });
      return;
    }

    const grid = document.getElementById("lesson-cards");
    if (!grid) return;
    grid.innerHTML = "";
    LESSONS_MVP.forEach((L) => {
      const g = lessonProgress(L.lessonId);
      const themeZh =
        state.showChineseZh !== false && L.themeZh
          ? `<span class="zh-annotation">（${escapeHtml(L.themeZh)}）</span>`
          : "";
      const card = document.createElement("article");
      card.className = "lesson-card-mvp";
      card.innerHTML = `
        <div class="lc-head"><span class="lc-num">第${L.lessonId}課</span></div>
        <h3 class="jp">${lessonTitleHtml(L)}</h3>
        <p class="lc-theme">${escapeHtml(L.theme)}${themeZh}</p>
        <div class="lc-path-rail">${pathRailHtml(g)}</div>
        <div class="lc-actions">
          <button type="button" class="btn primary">会話</button>
          <button type="button" class="btn secondary btn-flash-link">単語</button>
        </div>`;
      card.querySelector(".btn.primary").onclick = () =>
        enterLesson(L.lessonId, defaultGateForLesson(g, L.lessonId));
      card.querySelector(".btn-flash-link").onclick = (e) => {
        e.stopPropagation();
        enterLesson(L.lessonId, 0);
      };
      grid.appendChild(card);
    });
  }

  function pathRailHtml(g) {
    if (isMvpFiveGate(activeLessonId)) {
      return "";
    }
    if (typeof formatLessonFourSeaStars === "function" && activeLessonId != null) {
      return formatLessonFourSeaStars(state, activeLessonId);
    }
    const steps = [
      { label: "単語", done: g.gate0 },
      { label: "会話", done: g.gate2 },
      { label: "文法", done: g.gate1 },
      { label: "テスト", done: g.gate3 },
    ];
    return steps
      .map(
        (s, i) =>
          `<span class="lc-path-step ${s.done ? "done" : ""}">${s.done ? "★" : "○"} ${s.label}</span>${i < steps.length - 1 ? '<span class="lc-path-arrow">→</span>' : ""}`
      )
      .join("");
  }

  function renderLessonCockpit(g) {
    const el = document.getElementById("lesson-cockpit");
    const L = getLessonMvp(activeLessonId);
    if (!el || !L) return;
    const pathRail = pathRailHtml(g);
    el.innerHTML = `
      <div class="cockpit-top">
        <button type="button" class="cockpit-home-btn" id="cockpit-exit" aria-label="返回首页">
          ${typeof NavIcons !== "undefined" ? NavIcons.html("home") : ""}<span class="cockpit-home-label">首页</span>
        </button>
        <span class="cockpit-lesson">第${L.lessonId}課 · ${escapeHtml(L.theme)}</span>
      </div>
      ${pathRail ? `<div class="cockpit-path">${pathRail}</div>` : ""}
      <div class="cockpit-tabs" id="cockpit-tabs" role="tablist"></div>
    `;
    el.querySelector("#cockpit-exit").onclick = () => exitLessonView();
    const tabs = el.querySelector("#cockpit-tabs");
    cockpitTabsForLesson(L.lessonId).forEach((t) => {
      const done = !!g[`gate${t.k}`];
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "cockpit-tab" +
        (activeGate === t.k ? " active" : "") +
        (done ? " done" : "") +
        (t.recommended && t.k === 2 && !g.gate2 ? " recommended" : "");
      b.dataset.gate = String(t.k);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", activeGate === t.k ? "true" : "false");
      const tabDoneIcon = isMvpFiveGate(L.lessonId) ? false : done && t.k !== 0;
      b.innerHTML = `<span class="cockpit-tab-main">${tabDoneIcon ? "✅ " : ""}${escapeHtml(t.label)}</span>
        <span class="cockpit-tab-sub">${escapeHtml(t.sub)}</span>`;
      b.onclick = (e) => {
        e.preventDefault();
        switchGate(t.k);
      };
      tabs.appendChild(b);
    });
  }

  function renderLessonStub(lessonId) {
    const id = Number(lessonId);
    const meta =
      typeof getCurriculumLessonDisplay === "function"
        ? getCurriculumLessonDisplay(id)
        : { headline: `第${id}課`, themeZh: "" };
    const cockpit = document.getElementById("lesson-cockpit");
    const head = document.getElementById("lesson-flow-head");
    const body = document.getElementById("lesson-flow-body");
    if (cockpit) {
      cockpit.innerHTML = `
        <div class="cockpit-top">
          <button type="button" class="cockpit-home-btn" id="cockpit-exit" aria-label="返回首页">
            ${typeof NavIcons !== "undefined" ? NavIcons.html("home") : ""}<span class="cockpit-home-label">首页</span>
          </button>
          <span class="cockpit-lesson">第${id}課 · 準備中</span>
        </div>`;
      cockpit.querySelector("#cockpit-exit")?.addEventListener("click", () => exitLessonView());
    }
    if (head) {
      head.innerHTML = `<p class="headline-jp jp">${escapeHtml(meta.headline)}</p>
        ${meta.themeZh ? `<p class="zh-annotation">（${escapeHtml(meta.themeZh)}）</p>` : ""}`;
    }
    if (body) {
      body.innerHTML = `
        <div class="lesson-stub-card">
          <p class="jp">この課のコンテンツはまだ準備中です。</p>
          <p class="zh-annotation">开发目录可进入占位页；种子课 13–20 已有四关正文。</p>
          <button type="button" class="btn primary" id="stub-back-home">← 学習の道</button>
        </div>`;
      body.querySelector("#stub-back-home")?.addEventListener("click", () => showView("home"));
    }
  }

  function renderLessonFlow() {
    const L = getLessonMvp(activeLessonId);
    if (!L) {
      if (typeof curriculumDevCatalogMode === "function" && curriculumDevCatalogMode()) {
        renderLessonStub(activeLessonId);
        return;
      }
      showView("home");
      return;
    }
    const g = lessonProgress(L.lessonId);
    const max = maxGateIndex(L.lessonId);
    if (activeGate < 0 || activeGate > max) {
      activeGate = defaultGateForLesson(g, L.lessonId);
    }
    renderLessonFlowHead(L);
    renderLessonCockpit(g);
    if (typeof applyUnitThemeToView === "function") {
      applyUnitThemeToView(L.lessonId);
    }
    syncL1GateTheme(L.lessonId, activeGate);
    mountGate();
    if (typeof SpeakUI !== "undefined") {
      SpeakUI.bind(document.getElementById("lesson-cockpit"));
    }
  }

  function mountGate() {

function nextGateName(current) {
  if (current === 0) return ["会話", 2];
  if (current === 2) return ["文法", 1];
  if (current === 1) return ["作業", 3];
  if (current === 3) return ["拡張", 4];
  return ["完了", -1];
}

function appendGateNextStrip(container, currentGate) {
  const [name, nextK] = nextGateName(currentGate);
  const div = document.createElement("div");
  div.className = "gate-next-strip";
  div.innerHTML = nextK >= 0
    ? `<span class="next-icon">✅</span><span class="next-text">本模块完成！接下来学习 <b>「${name}」</b></span><button type="button" class="btn primary next-btn" data-next="${nextK}">进入 ${name} →</button>`
    : `<span class="next-icon">🎉</span><span class="next-text">全部模块完成！</span><button type="button" class="btn primary next-btn" data-next="-1">返回首页</button>`;
  container.appendChild(div);
  div.querySelector(".next-btn").onclick = () => {
    if (nextK >= 0) switchGate(nextK);
    else showView("home");
  };
}
    const body = document.getElementById("lesson-flow-body");
    if (!body) return;
    body.innerHTML = "";

    /* 课文简介 gate */
    if (activeGate === -1 && typeof LessonOverview !== "undefined") {
      LessonOverview.render(body, activeLessonId, {
        enterGate: function (k) { switchGate(k); }
      });
      return;
    }

    const mvpFive = isMvpFiveGate(activeLessonId);
    const l1Callbacks = {
      state,
      lessonId: activeLessonId,
      switchGate: (k) => switchGate(k),
      onRefreshCockpit: () => renderLessonCockpit(lessonProgress(activeLessonId)),
      onCompleteHome: () => exitLessonView(),
    };

    const opts = {
      state,
      onComplete: () => {
        const g = lessonProgress(activeLessonId);
        if (u1mvp) {
          if (activeGate === 1 && !g.gate2) {
            switchGate(2);
            return;
          }
          if (activeGate === 2 && !g.gate1) {
            switchGate(1);
            return;
          }
          if (activeGate === 1 && !g.gate3) {
            switchGate(3);
            return;
          }
          renderLessonCockpit(g);
          mountGate();
          return;
        }
        if (activeGate === 1 && !g.gate2) {
          switchGate(2);
          return;
        }
        if (activeGate === 2 && !lessonProgress(activeLessonId).gate3) {
          switchGate(3);
          return;
        }
        if (activeGate === 3) {
          showView("home");
          return;
        }
        renderLessonCockpit(lessonProgress(activeLessonId));
        mountGate();
      },
    };

    try {
      /* 五关课 l1GatePanelHtml 自带 .l1-gate-scroll，勿再包 ScrollHint 外层（双滚动条） */
      const skipScrollHint = mvpFive;
      const useScroll =
        !skipScrollHint && typeof ScrollHint !== "undefined" && ScrollHint.setupForGate;
      const host = useScroll ? ScrollHint.setupForGate(body, activeGate) : null;
      const mountEl = host?.region || body;
      if (mvpFive) {
        mountEl.classList.add("l1-lesson-scope");
        mountEl.setAttribute("data-l1-active-gate", String(activeGate));
        syncL1GateTheme(activeLessonId, activeGate);
      }

      if (activeGate === 0 && mvpFive) {
        Lesson1Flow.mountVocab(mountEl, state, l1Callbacks);
      } else if (activeGate === 0) {
        if (typeof VocabFlash === "undefined") {
          body.innerHTML = `<p class="hint-ja">単語モジュールを読み込めません。ページを更新してください。</p>`;
        } else {
          VocabFlash.mount(mountEl, activeLessonId, { state, fromLesson: true });
        }
      } else if (activeGate === 1) {
        GrammarNetwork.mount(mountEl, activeLessonId, {
          ...opts,
          l1Flow: false,
          switchGate: mvpFive ? (k) => switchGate(k) : undefined,
        });
        if (typeof SpeakUI !== "undefined") SpeakUI.bind(mountEl);
      } else if (activeGate === 2) {
        DialogueGate.mount(mountEl, activeLessonId, {
          ...opts,
          l1Flow: false,
          switchGate: mvpFive ? (k) => switchGate(k) : undefined,
        });
      } else if (mvpFive && activeGate === 3) {
        Lesson1Flow.mountHomework(mountEl, state, l1Callbacks);
      } else if (mvpFive && activeGate === 4) {
        Lesson1Flow.mountExtension(mountEl, state, l1Callbacks);
      } else {
        QuizGate.mount(mountEl, activeLessonId, {
          ...opts,
          onComplete: (finished) => {
            if (finished) showView("home");
            else {
              renderLessonCockpit(lessonProgress(activeLessonId));
              mountGate();
            }
          },
        });
      }
    } catch (err) {
      console.error("mountGate", activeGate, err);
      body.innerHTML = `<p class="hint-ja">読み込みエラー。ページを再読み込みしてください。</p>`;
    }
    if (typeof KnowledgeLink !== "undefined") {
      requestAnimationFrame(() => KnowledgeLink.flushPendingAnchor());
    }
  }

  function renderReview() {
    const list = document.getElementById("review-list");
    const empty = document.getElementById("review-empty");
    const due = dueMistakes(state);
    if (!due.length) {
      empty.hidden = false;
      list.innerHTML = "";
      return;
    }
    empty.hidden = true;
    list.innerHTML = "";
    due.forEach((m) => {
      const li = document.createElement("li");
      li.className = "review-item";
      const day = daysSinceWrong(m.wrongAt);
      li.innerHTML = `
        <div class="review-q-row">
          <p class="review-q jp">${escapeHtml(m.question)}</p>
          ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(m.question) : ""}
        </div>
        <p class="hint-ja">第${m.lessonId}課 · 第${day}天复习 · 你的答案：${escapeHtml(m.userAnswer)}</p>
        <button type="button" class="btn primary btn-review-go">再做一次</button>
      `;
      li.querySelector(".btn-review-go").onclick = () => openReviewModal(m);
      list.appendChild(li);
    });
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(list);
  }

  function openReviewModal(m) {
    const lesson = getLessonMvp(m.lessonId);
    const q = lesson?.quizQuestions.find((x) => x.id === m.questionId);
    if (!q) return;
    const modal = document.getElementById("review-modal");
    setModalOpen(modal, true);
    let body = "";
    if (q.type === "choice") {
      body = q.options
        .map((opt, i) => `<button type="button" class="qz-opt" data-i="${i}">${escapeHtml(opt)}</button>`)
        .join("");
    } else {
      body = `<input type="text" class="qz-input" id="rev-fill" />
        <button type="button" class="btn primary" id="rev-submit">送信</button>`;
    }
    modal.innerHTML = `
      <div class="gn-modal-inner">
        <h3>復習</h3>
        <div class="qz-question-row">
          <p class="jp">${escapeHtml(m.question)}</p>
          ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(m.question) : ""}
        </div>
        <div class="qz-options">${body}</div>
        <div id="rev-feedback"></div>
        <button type="button" class="btn ghost" id="rev-close">閉じる</button>
      </div>
    `;
    const grade = (userRaw) => {
      let ok = false;
      if (q.type === "choice") ok = Number(userRaw) === q.answer;
      else ok = (userRaw || "").trim().replace(/\s+/g, "") === q.answer.replace(/\s+/g, "");
      const fb = modal.querySelector("#rev-feedback");
      const correctText = q.type === "choice" ? q.options[q.answer] : q.answer;
      if (ok) {
        removeMvpMistake(state, m.id);
        fb.innerHTML = `<p class="feedback ok">✅ せいかい！ できた！</p>`;
        updateReviewBadge();
        setTimeout(() => {
          setModalOpen(modal, false);
          renderReview();
        }, 800);
      } else {
        fb.innerHTML = `<p class="feedback err">❌ ざんねん。正解は「${escapeHtml(correctText)}」</p>
          <p class="hint-ja">${escapeHtml(q.explanation)}</p>`;
        m.reviewCount = (m.reviewCount || 0) + 1;
        saveMvpState(state);
      }
    };
    if (q.type === "choice") {
      modal.querySelectorAll(".qz-opt").forEach((btn) => {
        btn.onclick = () => grade(btn.dataset.i);
      });
    } else {
      modal.querySelector("#rev-submit").onclick = () =>
        grade(modal.querySelector("#rev-fill").value);
    }
    modal.querySelector("#rev-close").onclick = () => setModalOpen(modal, false);
    modal.onclick = (e) => {
      if (e.target === modal) setModalOpen(modal, false);
    };
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(modal);
  }

  function renderMe() {
    const root = document.getElementById("notes-panel-root");
    if (root && typeof NotesPanel !== "undefined") {
      root.innerHTML = NotesPanel.render(state);
      NotesPanel.bind(root, state, {
        enterLesson: (id, gate, opts) => enterLesson(id, gate, opts),
      });
    } else if (root) {
      root.innerHTML = `<p class="hint-ja">笔记模块加载失败，请刷新页面（?v=${typeof ShareWechat !== "undefined" ? ShareWechat.CACHE_VER : ""}）。</p>`;
    }

    const toggle = document.getElementById("toggle-zh");
    if (toggle) {
      toggle.checked = state.showChineseZh !== false;
      toggle.onchange = () => {
        state.showChineseZh = toggle.checked;
        saveMvpState(state);
        applyZhSetting();
        if (document.getElementById("view-home").classList.contains("active")) renderHome();
        if (document.getElementById("view-lesson").classList.contains("active")) renderLessonFlow();
        if (document.getElementById("view-me").classList.contains("active")) renderMe();
      };
    }

    document.getElementById("btn-clear-mvp").onclick = () => {
      if (confirm("学習データをすべて消しますか？")) {
        clearMvpData();
        state = loadMvpState();
        applyZhSetting();
        showView("me");
      }
    };
  }

  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  document.getElementById("btn-me-review")?.addEventListener("click", () => showView("review"));

  /** 本地/控制台调试：与 loadMvpState 同步 */
  window.MvpDev = {
    getState: () => state,
    setState: (next) => {
      state = next;
      saveMvpState(state);
      return state;
    },
    reloadState: () => {
      state = loadMvpState();
      return state;
    },
    renderHome: () => renderHome(),
    showView,
    showSplash,
    hideSplash,
    enterFromSplash,
  };

  applyZhSetting();
  if (shouldShowSplashOnBoot() && splashOverlayEl()) {
    showSplash();
  } else {
    showView("home");
  }

  if (typeof StoryRewardDev !== "undefined") {
    StoryRewardDev.bootFromUrl(window.MvpDev);
  }
})();
