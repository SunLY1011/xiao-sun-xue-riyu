/**
 * 第1单元 MVP 课内五关（単語/会話/文法/作業/拡張）— 截图定稿交互
 * lessonId 1–4 由 app.js 传入 callbacks.lessonId；第1課行为不变
 * lessonId 5–8：第2单元 · 同壳扩展（isUnit2Mvp）
 * lessonId 9–24：第3–6单元 · 同壳（isUnits3to6Mvp）；不改动 1–4 分支条件
 */
const Lesson1Flow = (function () {
  const LESSON_ID = 1;
  const UNIT1_MVP_MAX = 4;
  const UNIT2_MVP_MIN = 5;
  const UNIT2_MVP_MAX = 8;
  const UNITS3_MVP_MIN = 9;
  const UNITS3_MVP_MAX = 24;

  const COCKPIT_TABS = [
    { k: 0, label: "単語", sub: "フラッシュ" },
    { k: 2, label: "会話", sub: "多场景" },
    { k: 1, label: "文法", sub: "ネット" },
    { k: 3, label: "作業", sub: "練習" },
    { k: 4, label: "拡張", sub: "まとめ" },
  ];

  /** 五关课内：取消屏底传送链 dock，改顶栏 Tab + 滚动区末尾「学習の道」 */
  const MVP_HIDE_CHAIN_FOOTER = true;

  function isLesson(lessonId) {
    return Number(lessonId) === LESSON_ID;
  }

  function isUnit1Mvp(lessonId) {
    const n = Number(lessonId);
    return n >= 1 && n <= UNIT1_MVP_MAX;
  }

  function isUnit2Mvp(lessonId) {
    const n = Number(lessonId);
    return n >= UNIT2_MVP_MIN && n <= UNIT2_MVP_MAX;
  }

  function isUnits3to6Mvp(lessonId) {
    const n = Number(lessonId);
    return n >= UNITS3_MVP_MIN && n <= UNITS3_MVP_MAX;
  }

  /** 第2–6单元 · 五关 MVP 壳（5–24，不含 U1 的 1–4） */
  function isMvpExtendedFiveGate(lessonId) {
    return isUnit2Mvp(lessonId) || isUnits3to6Mvp(lessonId);
  }

  function resolveLessonId(callbacks) {
    const n = Number(callbacks?.lessonId);
    if (n >= 1 && n <= UNIT1_MVP_MAX) return n;
    if (n >= UNIT2_MVP_MIN && n <= UNITS3_MVP_MAX) return n;
    return LESSON_ID;
  }

  function chainMetaFor(lessonId, activeGate) {
    const meta = { ...(L1_CHAIN_META[activeGate] || L1_CHAIN_META[0]) };
    if (activeGate !== 4) return meta;
    const lid = Number(lessonId);
    if (lid >= 1 && lid < UNIT1_MVP_MAX) {
      return {
        ...meta,
        done: `第${lid}课完了`,
        next: `第${lid + 1}课`,
        hint: `第${lid}课五关已走完，返回首页继续第${lid + 1}课。`,
      };
    }
    if (lid === UNIT1_MVP_MAX) {
      return {
        ...meta,
        done: "第4课完了",
        next: "本单元",
        hint: "本单元第2～4课五关已走完，可复习或进入下一单元。",
      };
    }
    if (lid >= UNIT2_MVP_MIN && lid < UNIT2_MVP_MAX) {
      return {
        ...meta,
        done: `第${lid}课完了`,
        next: `第${lid + 1}课`,
        hint: `第${lid}课五关已走完，返回首页继续第${lid + 1}课。`,
      };
    }
    if (lid === UNIT2_MVP_MAX) {
      return {
        ...meta,
        done: "第8课完了",
        next: "下一单元",
        hint: "第2单元四课五关已走完，可复习或进入第3单元。",
      };
    }
    if (lid >= UNITS3_MVP_MIN && lid < UNITS3_MVP_MAX) {
      const unitEnd = lid === 12 || lid === 16 || lid === 20;
      return {
        ...meta,
        done: `第${lid}课完了`,
        next: unitEnd ? "本单元复习" : `第${lid + 1}课`,
        hint: unitEnd
          ? `第${lid}课本单元最后一课五关已走完，可复习或进入下一单元。`
          : `第${lid}课五关已走完，返回首页继续第${lid + 1}课。`,
      };
    }
    if (lid === UNITS3_MVP_MAX) {
      return {
        ...meta,
        done: "第24课完了",
        next: "初级上收官",
        hint: "第6单元四课五关已走完，可复习全册或查看通关条带。",
      };
    }
    return meta;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function showZh(state) {
    if (document.documentElement.dataset.showZh === "0") return false;
    return state?.showChineseZh !== false;
  }

  /** 五关课内：作业/扩展主文案中文必显（与文法 showPedagogyZh 一致） */
  function showPedagogyZh(state) {
    return true;
  }

  function renderLines(lines, showChinese) {
    const show = showChinese || showPedagogyZh();
    const arr = (lines || []).map((ln) => String(ln || "").trim()).filter(Boolean);
    const out = [];
    const hasKana = (s) =>
      typeof HyougaFoldOverview !== "undefined"
        ? HyougaFoldOverview.hasKana(s)
        : /[\u3040-\u309f\u30a0-\u30ff]/.test(s);
    const hasHan = (s) =>
      typeof HyougaFoldOverview !== "undefined"
        ? HyougaFoldOverview.hasHan(s)
        : /[\u4e00-\u9fff]/.test(s);

    for (let i = 0; i < arr.length; i++) {
      const s = arr[i];
      if (!s) continue;
      if (hasKana(s)) {
        let zhFollow = "";
        const next = arr[i + 1];
        if (next && show && hasHan(next) && !hasKana(next) && !/^Q\d|^【|^[×✕○◯→]/.test(next)) {
          zhFollow = next;
          i += 1;
        }
        out.push(
          `<li class="l1-prose-pair"><p class="l1-prose-line jp">${escapeHtml(s)}</p>${
            zhFollow
              ? `<p class="l1-prose-line zh-annotation dg-zh-below-jp">${escapeHtml(zhFollow)}</p>`
              : ""
          }</li>`
        );
        continue;
      }
      if (!show) continue;
      if (/\t/.test(s) && !hasKana(s)) {
        const cells = s.split(/\t+/).map((c) => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          out.push(
            `<li class="l1-prose-pair"><p class="l1-prose-line jp">${escapeHtml(cells[0])}</p><p class="l1-prose-line zh-annotation dg-zh-below-jp">${escapeHtml(cells.slice(1).join(" "))}</p></li>`
          );
          continue;
        }
      }
      const wrong = /^[×✕]/.test(s);
      const right = /^[○◯]/.test(s);
      const quiz = /^Q\d/.test(s);
      const ans = /^→/.test(s);
      const body = wrong || right ? s.replace(/^[×✕○◯]\s*/, "") : s;
      const extra = [
        "l1-prose-line",
        "zh-annotation",
        wrong ? "l1-prose-wrong" : "",
        right ? "l1-prose-right" : "",
        quiz ? "l1-prose-quiz" : "",
        ans ? "l1-prose-ans" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const mark = wrong
        ? '<span class="l1-prose-mark" aria-hidden="true">×</span>'
        : right
          ? '<span class="l1-prose-mark" aria-hidden="true">○</span>'
          : "";
      if (wrong || right) {
        out.push(`<li class="${extra}">${mark}<span class="l1-prose-text">${escapeHtml(body)}</span></li>`);
      } else {
        out.push(`<li class="${extra}">${escapeHtml(s)}</li>`);
      }
    }
    return out.join("");
  }

  function stripEmojiTitle(title) {
    return (title || "").replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u2600-\u27BF]+\s*/u, "").trim();
  }

  /** 五关递进：単語 → 会話 → 文法 → 作業 → 拡張 → 本单元 */
  const L1_CHAIN_STEPS = [
    { gate: 0, label: "単語", chainLabel: "单词" },
    { gate: 2, label: "会話", chainLabel: "会话" },
    { gate: 1, label: "文法", chainLabel: "文法" },
    { gate: 3, label: "作業", chainLabel: "作业" },
    { gate: 4, label: "拡張", chainLabel: "扩展" },
  ];

  const L1_CHAIN_META = {
    0: { done: "単語完了", next: "会話", hint: "读完单词表后，进入会話多场景。" },
    2: { done: "会話完了", next: "文法", hint: "每句展开听完后再进入文法网络。" },
    1: { done: "文法完了", next: "作業", hint: "四条文型都展开阅读后，做作业练习。" },
    3: { done: "作業完了", next: "拡張", hint: "题型练完点底部，进入まとめ与拡張。" },
    4: { done: "第1课完了", next: "本单元", hint: "本课五关已走完，返回单元继续下一课。" },
  };

  function chainButtonLabel(activeGate, opts = {}) {
    const meta = chainMetaFor(opts.lessonId ?? LESSON_ID, activeGate);
    const done = Number(opts.done) || 0;
    const total = Number(opts.total) || 0;
    const ready = opts.ready === true || (total > 0 && done >= total);
    if (ready) return `${meta.done} → ${meta.next}`;
    if (total > 0) return `${meta.done}（${done}/${total}）`;
    return `${meta.done} → ${meta.next}`;
  }

  function chainRailHtml(activeGate, opts = {}) {
    const navigable = opts.navigable !== false;
    return L1_CHAIN_STEPS.map((s, i) => {
      const cur = s.gate === activeGate;
      const curCls = cur ? " is-current" : "";
      const arrow = i ? `<span class="l1-chain-arrow" aria-hidden="true">→</span>` : "";
      const inner = escapeHtml(s.chainLabel || s.label);
      if (navigable) {
        const curAttr = cur ? ' aria-current="step"' : "";
        return `${arrow}<button type="button" class="l1-chain-node${curCls}" data-l1-gate="${s.gate}"${curAttr}>${inner}</button>`;
      }
      return `${arrow}<span class="l1-chain-node${curCls}">${inner}</span>`;
    }).join("");
  }

  function chainFooterHtml(activeGate, opts = {}) {
    const meta = chainMetaFor(opts.lessonId ?? LESSON_ID, activeGate);
    const btnId = opts.btnId || "l1-chain-done";
    const readyBtn = opts.ready === true;
    const dis = opts.disabled !== undefined ? !!opts.disabled : !readyBtn;
    const btnText =
      opts.buttonLabel ||
      chainButtonLabel(activeGate, {
        done: opts.done,
        total: opts.total,
        ready: opts.ready,
      });
    return `
      <footer class="l1-chain-footer gn-footer" data-l1-chain-gate="${activeGate}">
        <nav class="l1-chain-rail" aria-label="本课学习路径">${chainRailHtml(activeGate, opts)}</nav>
        <p class="l1-chain-hint hint-ja">${escapeHtml(opts.hint || meta.hint)}</p>
        <button type="button" class="btn primary l1-chain-btn" id="${escapeHtml(btnId)}"${dis ? " disabled" : ""}>${escapeHtml(btnText)}</button>
      </footer>`;
  }

  function updateChainFooterButton(btn, activeGate, opts = {}) {
    if (!btn) return;
    const ready = opts.ready === true;
    const done = Number(opts.done) || 0;
    const total = Number(opts.total) || 0;
    btn.textContent = chainButtonLabel(activeGate, { done, total, ready });
    btn.disabled = !ready && opts.forceEnabled !== true;
    if (opts.forceEnabled === true) btn.disabled = false;
  }

  function bindChainFooter(root, activeGate, callbacks = {}) {
    if (!root) return;
    const footer = root.querySelector(".l1-chain-footer") || root;
    footer.querySelectorAll("[data-l1-gate]").forEach((node) => {
      if (node.dataset.l1ChainBound === "1") return;
      node.dataset.l1ChainBound = "1";
      node.addEventListener("click", () => {
        const g = Number(node.dataset.l1Gate);
        if (Number.isNaN(g) || g === activeGate) return;
        callbacks.switchGate?.(g);
      });
    });
  }

  function vocabSeenCount(state, list, lessonId) {
    const lid = lessonId != null ? Number(lessonId) : LESSON_ID;
    const seen = state?.flashProgress?.[lid]?.seen || [];
    return list.filter((v) => seen.includes(v.id)).length;
  }

  function introDockHref() {
    const nav = typeof document !== "undefined" ? document.getElementById("nav-intro") : null;
    if (nav?.getAttribute("href")) return nav.getAttribute("href");
    const v =
      typeof window !== "undefined" && window.HyougaShare?.CACHE_VER
        ? window.HyougaShare.CACHE_VER
        : "322";
    return `intro.html?v=${v}`;
  }

  function gateScrollEndDockHtml() {
    return `
      <div class="l1-gate-scroll-dock" role="navigation" aria-label="学習の道">
        <p class="l1-gate-scroll-dock-label zh-annotation">学習の道</p>
        <div class="l1-gate-scroll-dock-tabs">
          <button type="button" class="l1-gate-scroll-dock-btn" data-app-view="home">课文</button>
          <button type="button" class="l1-gate-scroll-dock-btn" data-app-view="me">笔记</button>
          <a class="l1-gate-scroll-dock-btn l1-gate-scroll-dock-link" href="${escapeHtml(introDockHref())}">注音</a>
        </div>
      </div>`;
  }

  function bindGateScrollEndDock(root) {
    if (!root) return;
    root.querySelectorAll(".l1-gate-scroll-dock [data-app-view]").forEach((btn) => {
      if (btn.dataset.dockBound === "1") return;
      btn.dataset.dockBound = "1";
      btn.addEventListener("click", () => {
        const view = btn.dataset.appView;
        if (typeof window.MvpDev?.showView === "function") {
          window.MvpDev.showView(view);
          return;
        }
        document.querySelector(`.bottom-nav .nav-item[data-view="${view}"]`)?.click();
      });
    });
  }

  function finishGatePanelMount(panel, callbacks = {}) {
    if (!MVP_HIDE_CHAIN_FOOTER) {
      bindGateScrollEndDock(panel);
      const gate = Number(panel?.dataset?.l1ActiveGate);
      if (!Number.isNaN(gate)) bindChainFooter(panel, gate, callbacks);
    }
  }

  function l1GatePanelHtml(bodyHtml, activeGate, footerOpts = {}) {
    const hideFooter =
      footerOpts.hideChainFooter !== false && MVP_HIDE_CHAIN_FOOTER;
    const panelCls = hideFooter ? " l1-gate-panel--no-chain-footer" : "";
    const scrollInner = hideFooter ? bodyHtml : `${bodyHtml}${gateScrollEndDockHtml()}`;
    return `
      <div class="l1-gate-panel l1-lesson-scope${panelCls}" data-l1-active-gate="${activeGate}">
        <div class="gate-scroll-region l1-gate-scroll" role="region" aria-label="课内内容">
          ${scrollInner}
        </div>
        ${hideFooter ? "" : chainFooterHtml(activeGate, footerOpts)}
      </div>`;
  }

  function foldGateFromEl(det) {
    const scope =
      det.closest("[data-l1-active-gate]") || det.closest(".l1-lesson-scope");
    const g = scope?.getAttribute("data-l1-active-gate");
    return g != null && g !== "" ? Number(g) : 0;
  }

  function syncFoldSlot(det) {
    const slot = det.querySelector(".hyo-fold-slot, .hyo-fold-toggle-static");
    if (slot && typeof HyougaGlyphs !== "undefined") {
      const gate = foldGateFromEl(det);
      slot.innerHTML = HyougaGlyphs.foldToggleInner(!!det.open, gate);
    }
  }

  /** 手风琴：同时只展开一条（与作業/拡張 gw-group 一致） */
  function bindSingleOpenAccordion(root, onOpen) {
    if (!root) return;
    const folds = root.querySelectorAll(
      ".gw-group, .l1-scene-fold, .l1-grammar-fold, .dg-scene-fold, .gn-node-fold, .l1-vocab-supp"
    );
    folds.forEach((det) => {
      if (det.dataset.l1AccordionBound === "1") return;
      det.dataset.l1AccordionBound = "1";
      det.addEventListener("toggle", () => {
        if (det.open) {
          folds.forEach((other) => {
            if (other !== det) {
              other.open = false;
              syncFoldSlot(other);
            }
          });
          if (typeof onOpen === "function") onOpen(det);
        }
        syncFoldSlot(det);
      });
      syncFoldSlot(det);
    });
  }

  function bindGwGroups(root, callbacks) {
    bindSingleOpenAccordion(root);
    if (typeof L1KnowledgeCard !== "undefined") L1KnowledgeCard.bind(root, callbacks);
    if (typeof SenseiTipCard !== "undefined") SenseiTipCard.bind(root);
  }

  function kcardHtml(tip, anchorId, lessonId) {
    if (!tip || typeof L1KnowledgeCard === "undefined") return "";
    const lid = lessonId != null ? Number(lessonId) : LESSON_ID;
    return L1KnowledgeCard.html(tip, anchorId, lid);
  }

  function gwGroupHtml({ title, body, tip, attrs = "", seq, foldGate, lessonId, overviewLines }) {
    const card =
      typeof tip === "object" && tip?.lines
        ? kcardHtml(tip, tip._anchor, lessonId)
        : tip
          ? kcardHtml({ lines: [{ zh: String(tip) }] }, null, lessonId)
          : "";
    const g = foldGate != null ? Number(foldGate) : 3;
    const foldSlot =
      typeof HyougaGlyphs !== "undefined"
        ? `<span class="hyo-fold-slot gw-fold-slot" aria-hidden="true">${HyougaGlyphs.foldDownInner(g)}</span>`
        : "";
    const titleInner = `<span class="gw-group-title-label">${escapeHtml(title)}</span>`;
    let overviewHtml = "";
    if (overviewLines?.length && typeof HyougaFoldOverview !== "undefined") {
      const ov = HyougaFoldOverview.proseSectionOverview(overviewLines);
      overviewHtml = HyougaFoldOverview.summaryBlock(ov.jp, ov.zh, { showZh: true });
    }
    const titleStack = `<span class="gw-group-title-stack">${titleInner}${overviewHtml ? `<span class="gw-group-overview">${overviewHtml}</span>` : ""}</span>`;
    const head =
      typeof seq === "number"
        ? `<span class="l1-seq-num" aria-hidden="true">${seq}</span><span class="gw-group-title-text">${titleStack}</span>${foldSlot}`
        : `<span class="gw-group-title-text">${titleStack}</span>${foldSlot}`;
    const cardSlot = card ? `<div class="l1-tip-slot l1-tip-slot--gate">${card}</div>` : "";
    return `
      <details class="gw-group l1-gw-group" ${attrs}>
        <summary class="gw-group-summary">${head}</summary>
        <div class="gw-group-body">
          ${body}
          ${cardSlot}
        </div>
      </details>`;
  }

  /** @deprecated 第1課五关统一用 l1GatePanelHtml + chainFooter，不再用 h2 顶栏 */
  function l1Shell({ body, activeGate, footerId, footerDisabled, footerLabel, footerHint, done, total, ready }) {
    return l1GatePanelHtml(body, activeGate, {
      btnId: footerId,
      disabled: footerDisabled,
      buttonLabel: footerLabel,
      hint: footerHint,
      done,
      total,
      ready,
    });
  }

  /** 标黄范式 · 第1課「注意」词（见 docs/项目知识库-课内单词标黄范式.md） */
  const VOCAB_WARN_IDS = new Set([
    "l1_v_2",
    "l1_v_3",
    "l1_v_4",
    "l1_v_12",
    "l1_v_15",
    "l1_v_16",
    "l1_v_22",
    "l1_v_23",
    "l1_v_26",
    "l1_v_27",
    "l1_v_28",
  ]);

  const VOCAB_WARN_BY_LESSON = {
    2: new Set(["l2_v_1", "l2_v_2", "l2_v_3", "l2_v_4", "l2_v_28", "l2_v_31"]),
    3: new Set(["l3_v_2", "l3_v_3", "l3_v_4", "l3_v_5", "l3_v_6"]),
    4: new Set(["l4_v_2", "l4_v_3", "l4_v_4", "l4_v_5"]),
    5: new Set([
      "l5_v_1", "l5_v_2", "l5_v_3", "l5_v_11", "l5_v_12", "l5_v_13", "l5_v_14",
      "l5_v_21", "l5_v_29", "l5_v_30",
    ]),
    6: new Set([
      "l6_v_1", "l6_v_2", "l6_v_3", "l6_v_10", "l6_v_11", "l6_v_29", "l6_v_30",
      "l6_v_31", "l6_v_32",
    ]),
    7: new Set(["l7_v_1", "l7_v_9", "l7_v_11", "l7_v_29", "l7_v_31", "l7_v_32", "l7_v_33"]),
    8: new Set(["l8_v_5", "l8_v_6", "l8_v_7", "l8_v_1", "l8_v_3", "l8_v_4"]),
    /* 9–24：align-lessons-9-24-l1-mvp.py */
    9: new Set(["l9_v_1", "l9_v_2", "l9_v_3", "l9_v_4", "l9_v_5", "l9_v_6", "l9_v_7", "l9_v_8"]),
    10: new Set(["l10_v_1", "l10_v_2", "l10_v_3", "l10_v_4", "l10_v_5", "l10_v_6", "l10_v_7", "l10_v_8"]),
    11: new Set(["l11_v_1", "l11_v_2", "l11_v_3", "l11_v_4", "l11_v_5", "l11_v_6"]),
    12: new Set(["l12_v_1", "l12_v_2", "l12_v_3", "l12_v_5", "l12_v_6", "l12_v_7", "l12_v_8", "l12_v_9"]),
    13: new Set([
      "l13_v_1", "l13_v_3", "l13_v_18", "l13_v_29", "l13_v_40", "l13_v_43",
      "l13_v_49", "l13_v_52", "l13_v_58",
    ]),
    14: new Set([
      "l14_v_1", "l14_v_2", "l14_v_7", "l14_v_11", "l14_v_21", "l14_v_22",
      "l14_v_26", "l14_v_27",
    ]),
    15: new Set([
      "l15_v_1", "l15_v_4", "l15_v_21", "l15_v_30", "l15_v_40", "l15_v_43",
    ]),
    16: new Set([
      "l16_v_1", "l16_v_3", "l16_v_7", "l16_v_9", "l16_v_15", "l16_v_21",
      "l16_v_22", "l16_v_50",
    ]),
    17: new Set(["l17_v_1", "l17_v_2", "l17_v_3", "l17_v_4", "l17_v_5", "l17_v_6"]),
    18: new Set(["l18_v_1", "l18_v_2", "l18_v_37", "l18_v_38", "l18_v_39", "l18_v_40", "l18_v_41", "l18_v_42"]),
    19: new Set(["l19_v_1", "l19_v_2", "l19_v_3", "l19_v_4", "l19_v_5", "l19_v_6", "l19_v_7", "l19_v_8"]),
    20: new Set(["l20_v_1", "l20_v_2", "l20_v_3", "l20_v_4", "l20_v_5", "l20_v_6", "l20_v_7", "l20_v_8"]),
    21: new Set(["l21_v_1", "l21_v_2", "l21_v_3", "l21_v_4", "l21_v_5", "l21_v_6", "l21_v_7", "l21_v_8"]),
    22: new Set(["l22_v_1", "l22_v_2", "l22_v_3", "l22_v_4", "l22_v_5", "l22_v_6", "l22_v_7", "l22_v_8"]),
    23: new Set(["l23_v_1", "l23_v_2", "l23_v_3", "l23_v_4", "l23_v_5", "l23_v_6", "l23_v_7", "l23_v_8"]),
    24: new Set(["l24_v_1", "l24_v_2", "l24_v_3", "l24_v_4", "l24_v_5", "l24_v_6"]),
  };

  function mvpKnowledgeTips(lid) {
    const id = Number(lid);
    if (id === LESSON_ID && typeof L1KnowledgeTips !== "undefined") return L1KnowledgeTips;
    if (id >= 2 && id <= 4 && typeof Unit1KnowledgeTips !== "undefined") return Unit1KnowledgeTips;
    if (isUnits3to6Mvp(id) && typeof Lessons924KnowledgeTips !== "undefined") return Lessons924KnowledgeTips;
    if (isUnit2Mvp(id) && typeof Unit2KnowledgeTips !== "undefined") return Unit2KnowledgeTips;
    return null;
  }

  function vocabWarnIdsFor(lessonId) {
    const lid = Number(lessonId);
    if (lid === LESSON_ID) return VOCAB_WARN_IDS;
    return VOCAB_WARN_BY_LESSON[lid] || new Set();
  }

  function vocabBadges(v, tip, lessonId) {
    const warn = vocabWarnIdsFor(lessonId).has(v.id);
    const hasTip = !!(tip && tip.lines && tip.lines.length);
    /* 有「注意」时，知识卡文案归注意区，不再标「延伸」（避免点开只看见延伸、不知道注意什么） */
    const extend = hasTip && !warn;
    const conj = !!(v.conjugation && v.conjugation.forms && Object.keys(v.conjugation.forms).length);
    const warnExplain = warn;
    return { warn, extend, conj, warnExplain, special: warn || extend || conj };
  }

  function vocabWarnFallback(v, lid) {
    const tips = mvpKnowledgeTips(lid);
    if (tips) {
      const t = tips.vocab(v);
      if (t?.lines?.length) return t;
    }
    const zh = isMvpExtendedFiveGate(lid)
      ? "本词为当课重点；请结合淡黄行底、文法节点与会話 ABC 的 A 轨记忆。"
      : "本词在称谓、读法或礼貌用法上与一般名词句不同；请结合淡黄行底记忆，并对照课文朗读。";
    return { lines: [{ zh }] };
  }

  /** 喇叭左侧固定双行：上=注意，下=延伸（无则占位，全表对齐） */
  function vocabTagsColumnHtml(badges) {
    const warnOn = badges.warn
      ? `<span class="l1-vocab-slot l1-vocab-slot--on vocab-tag vocab-tag--warn">注意</span>`
      : `<span class="l1-vocab-slot l1-vocab-slot--off"></span>`;
    const bottomLabel = badges.extend ? "延伸" : badges.conj ? "活用" : "";
    const bottomOn = bottomLabel
      ? `<span class="l1-vocab-slot l1-vocab-slot--on vocab-tag vocab-tag--${
          badges.extend ? "extend" : "conj"
        }">${bottomLabel}</span>`
      : `<span class="l1-vocab-slot l1-vocab-slot--off"></span>`;
    return `<div class="l1-vocab-tags-col" aria-label="词项标注">${warnOn}${bottomOn}</div>`;
  }

  function vocabTipSlotHtml(tip, anchorId) {
    if (!tip) return "";
    let payload = tip;
    if (typeof KnowledgeLink !== "undefined" && anchorId) {
      payload = KnowledgeLink.enrichTip(tip, anchorId, resolveLessonId());
    }
    const card =
      typeof SenseiTipCard !== "undefined" && SenseiTipCard.fromTipPayload
        ? SenseiTipCard.fromTipPayload(payload, { flat: true, l1Scope: false })
        : kcardHtml(tip, anchorId);
    return card ? `<div class="l1-tip-slot l1-tip-slot--vocab">${card}</div>` : "";
  }

  function vocabWarnTipHtml(tip, v) {
    const payload = tip?.lines?.length ? tip : vocabWarnFallback(v);
    return vocabTipSlotHtml(payload, `${v.id}_warn`);
  }

  function vocabExtendTipHtml(tip, v) {
    if (!tip?.lines?.length) return "";
    return vocabTipSlotHtml(tip, `${v.id}_ext`);
  }

  function vocabConjBodyHtml(v) {
    const forms = v.conjugation?.forms;
    if (!forms || !Object.keys(forms).length) return "";
    const items = Object.entries(forms)
      .map(([k, val]) => `<span class="l1-vocab-conj-tag"><b>${escapeHtml(k)}</b> ${escapeHtml(val)}</span>`)
      .join("");
    const typeLabel = v.conjugation.type ? escapeHtml(v.conjugation.type) : "活用";
    return `<div class="l1-vocab-extra-block l1-vocab-extra-block--conj">
      <p class="l1-vocab-extra-label">活用 · ${typeLabel}</p>
      <div class="l1-vocab-fold-body l1-vocab-conj-grid">${items}</div>
    </div>`;
  }

  function mountVocab(mountEl, state, callbacks) {
    const lid = resolveLessonId(callbacks);
    const L = getLessonMvp(lid);
    const list = (L && L.vocab) ? L.vocab.filter(function(v) { return v.from === "text" || !v.from; }) : [];
    if (!list.length) {
      mountEl.innerHTML = `<p class="hint-ja">単語リストは準備中です。</p>`;
      return;
    }

    const speakPayload = (v) => ({
      jp: v.jp,
      kana:
        v.ruby?.length && typeof RubyRender !== "undefined"
          ? RubyRender.toKanaReading(v.jp, v.ruby)
          : v.kana || v.jp,
      ruby: v.ruby,
    });

    const normKana = (s) => (s || "").trim().replace(/〜/g, "～");

    const wordRows = list
      .map((v, i) => {
        const colWord = normKana(v.jp || "");
        const colKana = normKana(v.kana || "");
        const colPitch = (v.pitch || "").trim();
        const colPos = (v.pos || "").trim();
        const colZh = v.meaningZh ? v.meaningZh : "";
        const metaParts = [colKana, colPitch, colPos].filter(Boolean);
        const metaLine = metaParts.length ? metaParts.join(" · ") : "";
        const payload = speakPayload(v);
        const actions =
          typeof ShadowSpeak !== "undefined"
            ? ShadowSpeak.rowHtml(payload, `l1-vf-${v.id}`, `data-vocab-id="${escapeHtml(v.id)}"`)
            : typeof SpeakUI !== "undefined"
              ? SpeakUI.btnHtml(payload, `data-vocab-id="${escapeHtml(v.id)}"`)
              : "";
        const tips = mvpKnowledgeTips(lid);
        const tip = tips ? tips.vocab(v) : null;
        const badges = vocabBadges(v, tip, lid);
        const warnBlock = badges.warnExplain ? vocabWarnTipHtml(tip || vocabWarnFallback(v, lid), v) : "";
        const extendBlock = badges.extend ? vocabExtendTipHtml(tip, v) : "";
        const conjBlock = badges.conj ? vocabConjBodyHtml(v) : "";
        const extraInner = [warnBlock, extendBlock, conjBlock].filter(Boolean).join("");
        const hasExtra = !!extraInner;
        const rowCls = [
          badges.warn ? " is-vocab-warn" : "",
          hasExtra ? " has-vocab-expand" : "",
        ].join("");
        const jpHtml =
          v.ruby?.length && typeof RubyRender !== "undefined"
            ? RubyRender.fromSegments(v.jp, v.ruby)
            : escapeHtml(colWord);
        const expandLabel = badges.warnExplain
          ? "展开注意说明"
          : "展开延伸与活用";
        const fold0 =
          typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.foldToggleInner(false, 0) : "▼";
        const expandBtn = hasExtra
          ? `<button type="button" class="hyo-fold-toggle l1-vocab-expand-btn" aria-expanded="false" aria-label="${escapeHtml(expandLabel)}">${fold0}</button>`
          : `<span class="l1-vocab-expand-spacer" aria-hidden="true"></span>`;
        const metaHtml = metaLine
          ? `<span class="l1-vocab-meta-inline hint-ja" title="${escapeHtml(metaLine)}">${escapeHtml(metaLine)}</span>`
          : "";
        const zhHtml = colZh
          ? `<span class="l1-vocab-zh-inline zh-annotation dg-zh-below-jp">${escapeHtml(colZh)}</span>`
          : "";
        return `
        <li class="l1-vocab-item${rowCls}" data-idx="${i}" data-vocab-id="${escapeHtml(v.id || "")}">
          <div class="l1-vocab-item-main">
            <span class="l1-seq-num l1-vocab-seq" aria-label="第${i + 1}项">${i + 1}</span>
            ${expandBtn}
            <div class="l1-vocab-core l1-vocab-core--stack">
              <span class="l1-vocab-jp jp">${jpHtml}</span>
              ${zhHtml}
              ${metaHtml}
            </div>
            ${vocabTagsColumnHtml(badges)}
            <div class="l1-vocab-act">${actions}</div>
          </div>
          ${hasExtra ? `<div class="l1-vocab-extra" hidden>${extraInner}</div>` : ""}
        </li>`;
      })
      .join("");

    const total = list.length;
    const seen0 = vocabSeenCount(state, list, lid);
    const vocabReady = seen0 >= total && total > 0;

    // Supplementary blocks: pronunciation, etymology, preview
    const summaryBlocks = (L.summaryBlocks || []);
    const pron = summaryBlocks.find(b => b.key === "pronunciation");
    const etym = summaryBlocks.find(b => b.key === "etymology");
    const prev = summaryBlocks.find(b => b.key === "preview");

    const suppFold = (title) =>
      typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.foldDownHtml(0) : "";
    const suppHtml = `
      ${pron ? `
      <details class="l1-vocab-supp l1-fold-panel">
        <summary class="l1-vocab-supp-head"><span class="hyo-fold-toggle-static" aria-hidden="true">${suppFold("pron")}</span>発音ポイント<span class="zh-annotation">（发音要点）</span></summary>
        <ul class="l1-vocab-supp-list">${(pron.lines||[]).map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
      </details>` : ""}
      ${etym ? `
      <details class="l1-vocab-supp l1-fold-panel">
        <summary class="l1-vocab-supp-head"><span class="hyo-fold-toggle-static" aria-hidden="true">${suppFold("etym")}</span>語源メモ<span class="zh-annotation">（词源注释）</span></summary>
        <ul class="l1-vocab-supp-list">${(etym.lines||[]).map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
      </details>` : ""}
      ${prev ? `
      <details class="l1-vocab-supp l1-fold-panel">
        <summary class="l1-vocab-supp-head"><span class="hyo-fold-toggle-static" aria-hidden="true">${suppFold("prev")}</span>活用予告<span class="zh-annotation">（活用预告）</span></summary>
        <ul class="l1-vocab-supp-list">${(prev.lines||[]).map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
      </details>` : ""}
    `;

    mountEl.innerHTML = l1GatePanelHtml(
      `<div class="l1-vocab-flat-wrap l1-vocab-paradigm-wrap">
        <ul class="l1-vocab-list l1-mod-list" role="list">
          ${wordRows}
        </ul>
        ${suppHtml}
      </div>`,
      0,
      {
        btnId: "l1-vocab-done",
        done: seen0,
        total,
        ready: vocabReady,
        disabled: !vocabReady,
        lessonId: lid,
      }
    );

    const vocabPanel = mountEl.querySelector(".l1-gate-panel") || mountEl;
    finishGatePanelMount(vocabPanel, callbacks);
    const updateVocabFooter = () => {
      const seen = vocabSeenCount(state, list, lid);
      const ready = seen >= total && total > 0;
      const btn = vocabPanel.querySelector("#l1-vocab-done");
      if (btn) {
        updateChainFooterButton(btn, 0, {
          done: seen,
          total,
          ready,
          lessonId: lid,
        });
      }
      if (MVP_HIDE_CHAIN_FOOTER && ready) {
        setGateDone(state, lid, 0);
        saveMvpState(state);
        callbacks.onRefreshCockpit?.();
      }
    };

    mountEl.querySelector("#l1-vocab-done")?.addEventListener("click", () => {
      if (vocabSeenCount(state, list, lid) < total) return;
      setGateDone(state, lid, 0);
      saveMvpState(state);
      callbacks.switchGate?.(2);
    });

    mountEl.querySelectorAll(".l1-vocab-item").forEach((row) => {
      const markSeen = () => {
        const vid = row.getAttribute("data-vocab-id");
        if (vid && typeof markFlashSeen === "function") markFlashSeen(state, lid, vid);
        updateVocabFooter();
      };
      row.querySelectorAll(
        "[data-vocab-id], .l1-vocab-extra, .btn-ss-record, .btn-ss-replay, .btn-speak-icon, .l1-vocab-expand-btn"
      ).forEach((el) => el.addEventListener("click", markSeen, { passive: true }));
    });

    const vocabItems = [...mountEl.querySelectorAll(".l1-vocab-item.has-vocab-expand")];
    const setExpandBtnGlyph = (btn, isOpen) => {
      if (!btn || typeof HyougaGlyphs === "undefined") return;
      btn.innerHTML = HyougaGlyphs.foldToggleInner(isOpen, 0);
    };
    mountEl.querySelectorAll(".vocab-tag--warn").forEach((tag) => {
      const item = tag.closest(".l1-vocab-item");
      if (!item?.classList.contains("has-vocab-expand")) return;
      tag.setAttribute("role", "button");
      tag.setAttribute("tabindex", "0");
      tag.setAttribute("title", "点开查看注意要点");
      tag.addEventListener("click", (e) => {
        e.stopPropagation();
        item.querySelector(".l1-vocab-expand-btn")?.click();
      });
      tag.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        item.querySelector(".l1-vocab-expand-btn")?.click();
      });
    });

    mountEl.querySelectorAll(".l1-vocab-expand-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = btn.closest(".l1-vocab-item");
        const extra = item?.querySelector(".l1-vocab-extra");
        if (!extra) return;
        const opening = extra.hidden;
        if (opening) {
          vocabItems.forEach((other) => {
            if (other === item) return;
            const ex = other.querySelector(".l1-vocab-extra");
            const ob = other.querySelector(".l1-vocab-expand-btn");
            if (ex && !ex.hidden) {
              ex.hidden = true;
              ob?.setAttribute("aria-expanded", "false");
              ob?.classList.remove("is-open");
              setExpandBtnGlyph(ob, false);
            }
          });
        }
        extra.hidden = !opening;
        btn.setAttribute("aria-expanded", opening ? "true" : "false");
        btn.classList.toggle("is-open", opening);
        setExpandBtnGlyph(btn, opening);
        const vid = item.getAttribute("data-vocab-id");
        if (opening && vid && typeof markFlashSeen === "function") markFlashSeen(state, lid, vid);
        updateVocabFooter();
      });
    });

    if (typeof ShadowSpeak !== "undefined") ShadowSpeak.bind(mountEl);
    else if (typeof SpeakUI !== "undefined") SpeakUI.bind(mountEl);
    bindChainFooter(vocabPanel, 0, callbacks);
    bindGwGroups(mountEl, callbacks);
    mountEl.querySelectorAll(".l1-kcard-link").forEach((btn) => {
      if (btn.dataset.l1LinkBound === "1") return;
      btn.dataset.l1LinkBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const gate = btn.dataset.l1Gate;
        if (gate !== "" && callbacks?.switchGate) callbacks.switchGate(Number(gate));
      });
    });
    updateVocabFooter();
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.warmPhrases) {
      const lines = list.map((v) => speakPayload(v));
      SpeechEngine.warmPhrases(lines);
    }
  }

  /** 日→中 + 中→日 两栏合并为一栏「翻訳問題」 */
  function mergeTranslationHomeworkSections(sections) {
    const out = [];
    for (let i = 0; i < sections.length; i++) {
      const cur = sections[i];
      const title = cur.title || "";
      const next = sections[i + 1];
      const isJa2Zh = /翻訳.*日\s*[→↔]\s*中/.test(title);
      const nextTitle = next?.title || "";
      const isZh2Ja = next && /翻訳.*中\s*[→↔]\s*日/.test(nextTitle);
      if (isJa2Zh && isZh2Ja) {
        out.push({
          title: "翻訳問題（日→中・中→日）",
          lines: ["【日→中】", ...(cur.lines || []), "【中→日】", ...(next.lines || [])],
        });
        i += 1;
        continue;
      }
      out.push(cur);
    }
    return out;
  }

  function mountHomework(mountEl, state, callbacks) {
    const lid = resolveLessonId(callbacks);
    const L = getLessonMvp(lid);
    let sections = (L?.homeworkSections || []).filter((s) => {
      const t = (s.lines || []).join(" ");
      return t.trim() && !/^（本课无/.test(t.trim());
    });
    sections = mergeTranslationHomeworkSections(sections);
    const show = showPedagogyZh(state) || showZh(state);
    const quizCount = (L?.quizQuestions || []).length;

    const HW_TIPS = {
      発音: "朗读时注意助词「は」读「わ」、长音与促音。",
      活用: "本课无动词活用时可跳过；后续课会逐课出现。",
      選択: "选择题先读日文题干，再在脑中用「は」提示词。",
      穴埋め: "填空题注意「です／ではありません」的敬体形式。",
      翻訳: "日译中、中译日都要对照课本句型，不要按中文语序硬写。",
      間違い: "改错题常考「さん」自称、缺少「です」等细节。",
      作文: "自我介绍建议含：寒暄、姓名、国籍/身份、礼貌结束。",
      聴解: "听力题需配合音频；暂无音频时可先看参考答案。",
      小テスト: "交互测验计入进度；可反复练习直到全对。",
    };

    function tipForTitle(title) {
      const tips = mvpKnowledgeTips(lid);
      if (tips) {
        const t = tips.homeworkTitle(title, lid);
        if (t?.lines?.length) return t;
      }
      const key = Object.keys(HW_TIPS).find((k) => title.includes(k));
      return key ? { lines: [{ zh: HW_TIPS[key] }] } : { lines: [{ zh: "对照课本与文法栏，逐条完成本类练习。" }] };
    }

    let hwSeq = 0;
    const folds = sections
      .map((s) => {
        const inner = renderLines(s.lines, show);
        if (!inner) return "";
        const title = stripEmojiTitle(
          (s.title || "作業").replace(/（日→中・中→日）/g, "").replace(/（[^）]+）/g, "").trim()
        );
        hwSeq += 1;
        return gwGroupHtml({
          seq: hwSeq,
          foldGate: 3,
          title,
          body: `<ul class="l1-prose-list">${inner}</ul>`,
          tip: tipForTitle(title),
          lessonId: lid,
          overviewLines: s.lines,
        });
      })
      .filter(Boolean)
      .join("");

    const quizBlock = quizCount
      ? gwGroupHtml({
          seq: hwSeq + 1,
          foldGate: 3,
          title: "小テスト（交互）",
          body: `<div id="l1-hw-quiz"></div>`,
          tip: tipForTitle("小テスト"),
          lessonId: lid,
        })
      : "";

    const hwTotal = sections.length + (quizCount ? 1 : 0);
    const hwBody =
      folds || quizBlock
        ? `<div class="l1-hw-folds l1-mod-list">${folds}${quizBlock}</div>`
        : `<p class="hint-ja">作業データがありません。</p>`;

    mountEl.innerHTML = l1GatePanelHtml(hwBody, 3, {
      btnId: "l1-hw-done",
      done: 0,
      total: hwTotal || 1,
      ready: hwTotal === 0,
      disabled: hwTotal > 0,
      lessonId: lid,
    });

    const hwPanel = mountEl.querySelector(".l1-gate-panel") || mountEl;
    finishGatePanelMount(hwPanel, callbacks);
    const hwOpened = {};
    const updateHwFooter = () => {
      const done = Object.keys(hwOpened).length;
      const ready = hwTotal === 0 || done >= hwTotal;
      const btn = hwPanel.querySelector("#l1-hw-done");
      if (btn) {
        updateChainFooterButton(btn, 3, {
          done,
          total: hwTotal || 1,
          ready,
          lessonId: lid,
        });
      }
      if (MVP_HIDE_CHAIN_FOOTER && ready) {
        setGateDone(state, lid, 3);
        saveMvpState(state);
        callbacks.onRefreshCockpit?.();
      }
    };
    hwPanel.querySelectorAll(".gw-group").forEach((det, i) => {
      det.addEventListener("toggle", () => {
        if (det.open) hwOpened[i] = true;
        updateHwFooter();
      });
    });
    updateHwFooter();

    const quizDetails = mountEl.querySelector("#l1-hw-quiz")?.closest("details");
    const mountQuiz = () => {
      const slot = mountEl.querySelector("#l1-hw-quiz");
      if (!slot || slot.dataset.mounted === "1") return;
      slot.dataset.mounted = "1";
      if (typeof QuizGate !== "undefined") {
        QuizGate.mount(slot, lid, {
          state,
          l1Scope: true,
          onComplete: () => {
            setGateDone(state, lid, 3);
            saveMvpState(state);
            callbacks.onRefreshCockpit?.();
          },
        });
      }
    };
    if (quizDetails?.open) mountQuiz();
    quizDetails?.addEventListener("toggle", () => {
      if (quizDetails.open) mountQuiz();
    });

    mountEl.querySelector("#l1-hw-done")?.addEventListener("click", () => {
      if (hwTotal > 0 && Object.keys(hwOpened).length < hwTotal) return;
      setGateDone(state, lid, 3);
      saveMvpState(state);
      callbacks.switchGate?.(4);
    });
    bindGwGroups(mountEl, callbacks);
  }

  function mountExtension(mountEl, state, callbacks) {
    const lid = resolveLessonId(callbacks);
    const L = getLessonMvp(lid);
    const blocks = L?.summaryBlocks || [];
    const reviewExt = L?.reviewExtension || [];
    const keyPoints = L?.dialogueKeyPoints || [];
    const rolePlay = L?.rolePlayTasks || [];
    const show = showPedagogyZh(state) || showZh(state);

    const renderLn = (lines) => renderLines(lines, show);
    const extTip = (key, fallback, title) => {
      const tips = mvpKnowledgeTips(lid);
      if (tips) {
        const t = tips.extensionKey(key, title, lid);
        if (t?.lines?.length) return t;
      }
      return fallback;
    };

    const groups = [];
    const pron = blocks.find((b) => b.key === "pronunciation");
    if (pron) {
      groups.push({
        extKey: "pronunciation",
        title: "発音ポイント",
        body: `<ul class="l1-prose-list">${renderLn(pron.lines)}</ul>`,
        overviewLines: pron.lines,
        tip: extTip("pronunciation", {
          lines: [{ zh: "注意助词「は」读「わ」、长音拉长一拍、促音停顿等。" }],
        }),
      });
    }
    const grammarNodes = L?.grammarNodes || [];
    if (grammarNodes.length) {
      const glines = grammarNodes
        .map((n) => `${n.title}：${n.explanationZh || n.titleZh || ""}`)
        .filter((l) => l.length > 3);
      groups.push({
        extKey: "grammar",
        title: "文法まとめ",
        body: `<ul class="l1-prose-list">${renderLn(glines)}</ul>`,
        overviewLines: glines,
        tip: extTip("grammar", {
          lines: [{ zh: "以上为本课全部语法节点，建议逐条对照例句复习。" }],
        }),
      });
    }
    const preview = blocks.find((b) => b.key === "preview");
    if (preview && !/本课无/.test((preview.lines || []).join(""))) {
      groups.push({
        extKey: "preview",
        title: "活用予告",
        body: `<ul class="l1-prose-list">${renderLn(preview.lines)}</ul>`,
        overviewLines: preview.lines,
        tip: extTip("preview", {
          lines: [{ zh: "提前了解后续课程的活用变化，心中有数。" }],
        }),
      });
    }
    const honor = blocks.find((b) => b.key === "honorific");
    if (honor) {
      groups.push({
        extKey: "honorific",
        title: "敬語レベル表示",
        body: `<ul class="l1-prose-list">${renderLn(honor.lines)}</ul>`,
        overviewLines: honor.lines,
        tip: extTip("honorific", {
          lines: [{ zh: "掌握敬体与简体的使用场景，避免失礼。" }],
        }),
      });
    }
    const etym = blocks.find((b) => b.key === "etymology");
    if (etym) {
      groups.push({
        extKey: "etymology",
        title: "語源メモ",
        body: `<ul class="l1-prose-list">${renderLn(etym.lines)}</ul>`,
        overviewLines: etym.lines,
        tip: extTip("etymology", { lines: [{ zh: "了解词语来源有助于记忆。" }] }),
      });
    }
    if (keyPoints.length) {
      groups.push({
        extKey: "keyPoints",
        title: "会話のキーポイント",
        body: `<ul class="l1-prose-list">${renderLn(keyPoints)}</ul>`,
        overviewLines: keyPoints,
        tip: extTip("keyPoints", {
          lines: [{ zh: "朗读对话时留意这些要点，模仿语调。" }],
        }),
      });
    }
    if (rolePlay.length) {
      groups.push({
        extKey: "rolePlay",
        title: "ロールプレイ課題",
        body: `<ul class="l1-prose-list">${renderLn(rolePlay)}</ul>`,
        overviewLines: rolePlay,
        tip: extTip("rolePlay", {
          lines: [{ zh: "找伙伴练习，或自己扮演两个角色轮流说。" }],
        }),
      });
    }
    reviewExt.forEach((sec, si) => {
      groups.push({
        extKey: "review",
        title: stripEmojiTitle(sec.title || `まとめ ${si + 1}`),
        body: `<ul class="l1-prose-list">${renderLn(sec.lines)}</ul>`,
        overviewLines: sec.lines,
        tip: extTip(null, { lines: [{ zh: "回顾本课核心内容，建立与前后课程的联系。" }] }, sec.title),
      });
    });
    if (L?.basicText?.length) {
      groups.push({
        extKey: "basicText",
        title: "基本课文（4句型）",
        body: `<ul class="l1-prose-list">${renderLn(L.basicText)}</ul>`,
        overviewLines: L.basicText,
        tip: extTip("basicText", { lines: [{ zh: "课本4个核心句型，务必朗读并记忆。" }] }),
      });
    }

    const groupsHtml = groups
      .map((g, i) =>
        gwGroupHtml({
          seq: i + 1,
          foldGate: 4,
          title: g.title,
          body: g.body,
          tip: g.tip,
          lessonId: lid,
          overviewLines: g.overviewLines,
        })
      )
      .join("");

    const extTotal = groups.length;
    mountEl.innerHTML = l1GatePanelHtml(
      `<div class="l1-ext-folds l1-mod-list">${groupsHtml || `<p class="hint-ja">まとめデータがありません。</p>`}</div>`,
      4,
      {
        btnId: "l1-sum-done",
        done: 0,
        total: extTotal || 1,
        ready: extTotal === 0,
        disabled: false,
        lessonId: lid,
      }
    );

    const extPanel = mountEl.querySelector(".l1-gate-panel") || mountEl;
    finishGatePanelMount(extPanel, callbacks);
    const extOpened = {};
    const extReadyMin = () => (extTotal === 0 ? 0 : 1);
    const updateExtFooter = () => {
      const done = Object.keys(extOpened).length;
      const need = extReadyMin();
      const ready = extTotal === 0 || done >= need;
      const btn = extPanel.querySelector("#l1-sum-done");
      if (btn) {
        updateChainFooterButton(btn, 4, {
          done: extTotal === 0 ? 1 : done,
          total: extTotal || 1,
          ready,
          lessonId: lid,
        });
      }
      if (MVP_HIDE_CHAIN_FOOTER && ready) {
        setGateDone(state, lid, 4);
        saveMvpState(state);
        callbacks.onRefreshCockpit?.();
      }
    };
    const extDetails = extPanel.querySelectorAll(".gw-group");
    extDetails.forEach((det, i) => {
      det.addEventListener("toggle", () => {
        if (det.open) extOpened[i] = true;
        updateExtFooter();
      });
    });
    updateExtFooter();

    mountEl.querySelector("#l1-sum-done")?.addEventListener("click", () => {
      if (extTotal > 0 && Object.keys(extOpened).length < extReadyMin()) return;
      setGateDone(state, lid, 4);
      saveMvpState(state);
      callbacks.onCompleteHome?.();
    });
    bindGwGroups(mountEl, callbacks);
    if (typeof L1KnowledgeCard !== "undefined") L1KnowledgeCard.bind(mountEl, callbacks);
  }

  function flowHeadHtml(L, activeGate, state) {
    const themeZh =
      showZh(state) && L.themeZh
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
    const titleRow =
      typeof RubyRender !== "undefined" && L.lessonTitleRuby
        ? RubyRender.fromSegments(L.lessonTitle, L.lessonTitleRuby)
        : escapeHtml(L.lessonTitle);

    /* 第1課五关：顶栏说明取消，改由底部传送链提示 */
    if (activeGate === 0 || activeGate === 1 || activeGate === 2 || activeGate === 3 || activeGate === 4) {
      return "";
    }
    return "";
  }

  return {
    LESSON_ID,
    UNIT1_MVP_MAX,
    UNIT2_MVP_MIN,
    UNIT2_MVP_MAX,
    UNITS3_MVP_MIN,
    UNITS3_MVP_MAX,
    isLesson,
    isUnit1Mvp,
    isUnit2Mvp,
    isUnits3to6Mvp,
    isMvpExtendedFiveGate,
    resolveLessonId,
    COCKPIT_TABS,
    L1_CHAIN_STEPS,
    mountVocab,
    mountHomework,
    mountExtension,
    flowHeadHtml,
    l1Shell,
    gwGroupHtml,
    chainFooterHtml,
    chainButtonLabel,
    chainRailHtml,
    updateChainFooterButton,
    bindChainFooter,
    l1GatePanelHtml,
    finishGatePanelMount,
    bindGateScrollEndDock,
    MVP_HIDE_CHAIN_FOOTER,
    bindSingleOpenAccordion,
  };
})();
