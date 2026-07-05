/**
 * 竖屏真机比例 · 三级彩蛋排版验收（经典横向工具栏版）
 */
const StoryPhonePreview = (function () {
  const DEVICES = {
    iphone14: { label: "iPhone 14", sw: 390, sh: 844, note: "6.1″ · Safari 默认视口" },
    iphone14pro: { label: "iPhone 14 Pro Max", sw: 430, sh: 932, note: "6.7″" },
    iphonese: { label: "iPhone SE (3rd)", sw: 375, sh: 667, note: "4.7″" },
  };

  const TIERS = { l1: "每课", l2: "单元", l3: "终结" };

  let tier = "l2";
  let unitId = 1;
  let lessonId = 1;
  let deviceKey = "iphone14";

  const els = {};

  function esc(s) {
    return typeof StoryCaptionJp !== "undefined"
      ? StoryCaptionJp.escapeHtml(s)
      : String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;");
  }

  function unitLessons(uid) {
    if (typeof CURRICULUM_UNITS !== "undefined") {
      const u = CURRICULUM_UNITS.find((x) => x.id === uid);
      if (u?.lessonIds) return u.lessonIds;
    }
    const base = (uid - 1) * 4 + 1;
    return [base, base + 1, base + 2, base + 3];
  }

  function syncLessonPick() {
    const sel = els.lessonPick;
    if (!sel) return;
    const ids = unitLessons(unitId);
    sel.innerHTML = ids
      .map((id) => {
        const d =
          typeof getCurriculumLessonDisplay === "function"
            ? getCurriculumLessonDisplay(id)
            : null;
        const head = d?.headline || `第${id}課`;
        return `<option value="${id}">第${id}課 · ${esc(head)}</option>`;
      })
      .join("");
    if (!ids.includes(lessonId)) lessonId = ids[0];
    sel.value = String(lessonId);
  }

  function syncToolbarVisibility() {
    if (els.unitPickWrap) els.unitPickWrap.hidden = tier === "l3";
    if (els.lessonPickWrap) els.lessonPickWrap.hidden = tier !== "l1";
    if (els.unitPick) els.unitPick.disabled = tier === "l3";
  }

  function stripCandidates(uid) {
    return [
      `assets/story/unit-${uid}-strip.webp`,
      `assets/story/unit-${uid}-strip.png`,
      `assets/story/locked/unit-${uid}/unit-${uid}-strip.webp`,
    ];
  }

  function lessonImageCandidates(uid, lid) {
    const slot = (() => {
      if (typeof UNIT_STRIP_STORYBOARD === "undefined") return 1;
      const sb = UNIT_STRIP_STORYBOARD.find((u) => u.unitId === uid);
      const i = sb?.panels?.findIndex((p) => p.lessonId === lid) ?? -1;
      return i >= 0 ? i + 1 : 1;
    })();
    return [
      `assets/story/lesson-${lid}-egg.webp`,
      `assets/story/lesson-${lid}-egg.png`,
      `assets/story/unit-${uid}-panel-${slot}-clean.png`,
    ];
  }

  function loadImage(img, sources, onOk, onFail) {
    let i = 0;
    function tryNext() {
      if (i >= sources.length) {
        onFail?.();
        return;
      }
      const url = sources[i++] + "?v=91";
      img.onload = () => onOk?.(url);
      img.onerror = tryNext;
      img.src = url;
      if (img.complete && img.naturalWidth > 0) onOk?.(url);
    }
    tryNext();
  }

  function homeUnit(uid) {
    if (typeof getCurriculumUnitsForHome === "function") {
      return getCurriculumUnitsForHome().find((u) => u.id === uid);
    }
    const cu =
      typeof CURRICULUM_UNITS !== "undefined" ? CURRICULUM_UNITS.find((u) => u.id === uid) : null;
    return cu ? { id: cu.id, titleZh: cu.titleZh, titleJa: cu.titleJa, lessons: [] } : { id: uid };
  }

  function renderL1() {
    const uid = unitId;
    const lid = lessonId;
    const unit = homeUnit(uid);
    const body =
      typeof LessonRecap !== "undefined"
        ? LessonRecap.renderEggContent(lid, unit)
        : "<p>加载中</p>";
    const theme =
      typeof CURRICULUM_STAGE_THEMES !== "undefined"
        ? CURRICULUM_STAGE_THEMES[uid] || CURRICULUM_STAGE_THEMES[1]
        : {};

    els.phoneSim.className = "phone-sim phone-sim--l1";
    els.phoneSim.innerHTML = `
      <button type="button" class="phone-sim-close" aria-label="閉じる">✕</button>
      <div class="phone-sim-l1-sheet story-egg-inner story-egg-inner--l1" id="sim-stage"
        style="--stage-accent:${theme.accent || "#e57373"};--unit-border:${theme.border || "#ffcdd2"}">
        <header class="story-egg-head">
          <div>
            <p class="story-egg-eyebrow">单课彩蛋</p>
            <p class="story-egg-title-meta jp">第${lid}課</p>
          </div>
        </header>
        ${body}
      </div>
      <div class="phone-sim-status" id="phone-status" hidden>加载中…</div>`;

    const stage = document.getElementById("sim-stage");
    if (typeof LessonRecap !== "undefined") LessonRecap.bindEggImages(stage);
    measure();
  }

  function renderL2() {
    const uid = unitId;
    const labels =
      typeof StoryCaptionJp !== "undefined"
        ? StoryCaptionJp.renderL2PanelLabelsHtml(uid, "story-egg-l2")
        : "";

    els.phoneSim.className = "phone-sim phone-sim--l2";
    els.phoneSim.innerHTML = `
      <button type="button" class="phone-sim-close" aria-label="閉じる">✕</button>
      <div class="phone-sim-stage" id="sim-stage">
        <img class="phone-sim-img is-hidden" id="sim-img" alt="" decoding="async" />
        ${labels ? `<div class="story-egg-l2-panel-labels" aria-hidden="true">${labels}</div>` : ""}
      </div>
      <div class="phone-sim-status" id="phone-status">条带加载中…</div>`;

    const img = document.getElementById("sim-img");
    const status = document.getElementById("phone-status");
    loadImage(
      img,
      stripCandidates(uid),
      () => {
        img.classList.remove("is-hidden");
        status.hidden = true;
        measure();
      },
      () => {
        status.hidden = false;
        status.textContent = `unit-${uid}-strip.webp 未找到`;
        status.style.color = "#ffcdd2";
      }
    );
  }

  function renderL3() {
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
            : "";
        cells.push(`<div class="phone-sim-l3-cell">
          <img src="assets/story/grand/card-${n}-clean.png?v=91" alt="" loading="lazy" decoding="async" />
          ${capHtml}
        </div>`);
      }
    }

    els.phoneSim.className = "phone-sim phone-sim--l3";
    els.phoneSim.innerHTML = `
      <button type="button" class="phone-sim-close" aria-label="閉じる">✕</button>
      <div class="phone-sim-l3-scroll" id="sim-stage">
        <div class="phone-sim-l3-grid">${cells.join("")}</div>
      </div>`;
    measure();
  }

  function render() {
    syncToolbarVisibility();
    if (tier === "l1") {
      syncLessonPick();
      renderL1();
    } else if (tier === "l2") {
      renderL2();
    } else {
      renderL3();
    }
    syncUrl();
  }

  function applyDevice(key) {
    deviceKey = DEVICES[key] ? key : "iphone14";
    const d = DEVICES[deviceKey];
    els.phoneScreen.style.setProperty("--sw", String(d.sw));
    els.phoneScreen.style.setProperty("--sh", String(d.sh));
    els.phoneLabel.textContent = `${d.label} · ${d.sw} × ${d.sh} CSS px（${d.note}）`;
    els.deviceBtns.forEach((b) => b.classList.toggle("is-on", b.dataset.device === deviceKey));
    fitScale();
  }

  function fitScale() {
    const d = DEVICES[deviceKey];
    const totalH = d.sh + 24;
    const maxH = window.innerHeight - 200;
    const scale = maxH > 0 ? Math.min(1, maxH / totalH) : 1;
    els.phoneOuter.style.transform = scale < 1 ? `scale(${scale.toFixed(3)})` : "";
    els.phoneOuter.style.marginBottom =
      scale < 1 ? `${Math.round((1 - scale) * -totalH)}px` : "";
  }

  function rect(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const p = els.phoneScreen.getBoundingClientRect();
    return {
      top: r.top - p.top,
      left: r.left - p.left,
      width: r.width,
      height: r.height,
      bottom: r.bottom - p.top,
    };
  }

  function measure() {
    const screen = els.phoneScreen.getBoundingClientRect();
    const sh = screen.height;
    const sw = screen.width;
    const tierLabel = TIERS[tier] || tier;
    let extra = "";
    let barHtml = "";
    let hint = "";

    if (tier === "l2") {
      const img = document.getElementById("sim-img");
      const stage = document.getElementById("sim-stage");
      if (img && !img.classList.contains("is-hidden") && img.naturalWidth) {
        const rImg = rect(img);
        const rStage = rect(stage);
        const padT = rStage && rImg ? Math.max(0, rImg.top - rStage.top) : 0;
        const padB = rStage && rImg ? Math.max(0, rStage.bottom - rImg.bottom) : 0;
        const stripPct = sh ? ((rImg.height / sh) * 100).toFixed(1) : "0";
        extra = `<dt>条带占屏高</dt><dd class="ok"><strong>${Math.round(rImg.height)} px</strong>（${stripPct}%）</dd>
          <dt>上下留白</dt><dd>上 ${Math.round(padT)} / 下 ${Math.round(padB)} px</dd>
          <dt>原图</dt><dd>${img.naturalWidth} × ${img.naturalHeight}</dd>`;
        barHtml = `<div class="bar-wrap">
          <span class="bar-pad" style="width:${sh ? ((padT / sh) * 100).toFixed(1) : 0}%">上</span>
          <span class="bar-strip" style="width:${stripPct}%">条带</span>
          <span class="bar-pad" style="width:${sh ? ((padB / sh) * 100).toFixed(1) : 0}%">下</span>
        </div>`;
        hint = `<div class="usable-hint">条带竖图在屏内按比例缩小；黄条示意上下未铺满区域。</div>`;
      } else {
        extra = `<dt>状态</dt><dd>条带加载中…</dd>`;
      }
    } else if (tier === "l1") {
      extra = `<dt>当前</dt><dd>第${lessonId}課 · U${unitId}</dd>`;
    } else {
      extra = `<dt>布局</dt><dd>4×6 日本文化二十四景（屏内可滚动）</dd>`;
    }

    els.metrics.innerHTML = `
      <dl>
        <dt>层级</dt><dd>L${tier === "l1" ? "1" : tier === "l2" ? "2" : "3"} · ${tierLabel}</dd>
        <dt>视口</dt><dd>${Math.round(sw)} × ${Math.round(sh)} px</dd>
        ${extra}
      </dl>
      ${barHtml}
      ${hint}
      <p class="metrics-hint">叠字仅日文 · 左右交错 · iPhone 14 = 390:844</p>`;
  }

  function syncUrl() {
    const q = new URLSearchParams();
    q.set("tier", tier);
    if (tier !== "l3") q.set("unit", String(unitId));
    if (tier === "l1") q.set("lesson", String(lessonId));
    q.set("device", deviceKey);
    history.replaceState(null, "", `${location.pathname}?${q}`);
    const a = document.getElementById("open-link");
    if (a) a.href = `${location.origin}${location.pathname}?${q}`;
  }

  function bind() {
    els.tierBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tier = btn.dataset.tier;
        els.tierBtns.forEach((b) => b.classList.toggle("is-on", b.dataset.tier === tier));
        render();
        measure();
      });
    });
    els.unitPick.addEventListener("change", () => {
      unitId = Number(els.unitPick.value);
      lessonId = unitLessons(unitId)[0];
      render();
    });
    els.lessonPick.addEventListener("change", () => {
      lessonId = Number(els.lessonPick.value);
      render();
    });
    els.deviceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyDevice(btn.dataset.device);
        measure();
      });
    });
    document.getElementById("btn-reload")?.addEventListener("click", () => {
      render();
      measure();
    });
    window.addEventListener("resize", () => {
      fitScale();
      measure();
    });
  }

  function init() {
    els.phoneOuter = document.getElementById("phone-outer");
    els.phoneScreen = document.getElementById("phone-screen");
    els.phoneLabel = document.getElementById("phone-label");
    els.phoneSim = document.getElementById("phone-sim");
    els.metrics = document.getElementById("metrics");
    els.unitPick = document.getElementById("unit-pick");
    els.lessonPick = document.getElementById("lesson-pick");
    els.unitPickWrap = document.getElementById("unit-pick-wrap");
    els.lessonPickWrap = document.getElementById("lesson-pick-wrap");
    els.tierBtns = document.querySelectorAll(".tier-btn");
    els.deviceBtns = document.querySelectorAll(".device-btn");

    const q = new URLSearchParams(location.search);
    tier = q.get("tier") || "l2";
    if (!TIERS[tier]) tier = "l2";
    unitId = Number(q.get("unit")) || 1;
    lessonId = Number(q.get("lesson")) || unitLessons(unitId)[0];
    if (unitId < 1 || unitId > 6) unitId = 1;

    els.tierBtns.forEach((b) => b.classList.toggle("is-on", b.dataset.tier === tier));
    if (els.unitPick) els.unitPick.value = String(unitId);

    applyDevice(q.get("device") || "iphone14");
    bind();

    if (location.protocol === "file:") {
      document.getElementById("server-warn")?.classList.add("is-show");
    } else {
      fetch("assets/story/unit-1-strip.webp", { method: "HEAD" })
        .then((r) => {
          if (!r.ok) document.getElementById("server-warn")?.classList.add("is-show");
        })
        .catch(() => document.getElementById("server-warn")?.classList.add("is-show"));
    }

    render();
  }

  return { init };
})();
