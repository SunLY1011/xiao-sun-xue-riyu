/**
 * 第1課 · 五关统一图标（遥控器式线性 SVG · 见 docs/DESIGN-L0-图标与人设全景.md L3）
 * 单词 / 会話 / 文法 / 作業 / 拡張 + 听 · 录 · 回放
 * 见 docs/产品设计规范-平面轻量UI.md
 */
const L1UiIcons = (function () {
  const STROKE = 'stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"';

  function svg(inner, viewBox = "0 0 24 24") {
    return `<svg class="l1-ui-icon" viewBox="${viewBox}" aria-hidden="true">${inner}</svg>`;
  }

  const paths = {
    vocab: `<rect x="5" y="4" width="14" height="16" rx="2" ${STROKE}/><path d="M8 9h8M8 12h6M8 15h8" ${STROKE}/>`,
    dialogue: `<path d="M7 9h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H11l-3 3v-3H7a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" ${STROKE}/>`,
    grammar: `<circle cx="6" cy="12" r="2.5" ${STROKE}/><circle cx="18" cy="7" r="2.5" ${STROKE}/><circle cx="18" cy="17" r="2.5" ${STROKE}/><path d="M8.5 11l7-3M8.5 13l7 3" ${STROKE}/>`,
    homework: `<path d="M8 6h8v14H8z" ${STROKE}/><path d="M10 4h4v4h-4z" ${STROKE}/><path d="M10 11h4M10 15h4" ${STROKE}/>`,
    extension: `<path d="M5 8h14M5 12h14M5 16h10" ${STROKE}/><path d="M17 15l3 1-3 1" ${STROKE}/>`,
    listen: `<path d="M5 10v4a7 7 0 0 0 14 0v-4" ${STROKE}/><path d="M12 6v12M8 20h8" ${STROKE}/>`,
    record: `<rect x="9" y="4" width="6" height="11" rx="3" ${STROKE}/><path d="M6 12a6 6 0 0 0 12 0" ${STROKE}/><path d="M12 18v2" ${STROKE}/>`,
    replay: `<polygon points="9,7 9,17 17,12" fill="currentColor" stroke="none"/>`,
    quiz: `<circle cx="12" cy="12" r="8" ${STROKE}/><circle cx="12" cy="12" r="3" ${STROKE}/><path d="M12 4v2M12 18v2" ${STROKE}/>`,
    translate: `<path d="M5 8h6M8 5v6" ${STROKE}/><path d="M13 16h6M16 13v6" ${STROKE}/>`,
    mistake: `<circle cx="12" cy="12" r="9" ${STROKE}/><path d="M12 8v5M12 16h.01" ${STROKE}/>`,
    essay: `<path d="M6 4h9l3 3v13H6z" ${STROKE}/><path d="M15 4v4h4" ${STROKE}/><path d="M9 13h6M9 17h4" ${STROKE}/>`,
    listen_hw: `<path d="M6 14h2l1 4h6l1-4h2" ${STROKE}/><path d="M10 6a2 2 0 1 1 4 0v6" ${STROKE}/>`,
    summary: `<path d="M4 6h16M4 12h10M4 18h7" ${STROKE}/>`,
    roleplay: `<circle cx="9" cy="10" r="2.5" ${STROKE}/><circle cx="15" cy="10" r="2.5" ${STROKE}/><path d="M5 18c1.5-2 3-3 4-3s2.5 1 4 3M11 18c1.5-2 3-3 4-3s2.5 1 4 3" ${STROKE}/>`,
    doc: `<path d="M7 4h7l5 5v11H7z" ${STROKE}/><path d="M14 4v5h5" ${STROKE}/>`,
  };

  const GATE_KEYS = { 0: "vocab", 2: "dialogue", 1: "grammar", 3: "homework", 4: "extension" };

  const GATE_LABEL = {
    0: { ja: "単語", zh: "单词" },
    2: { ja: "会話", zh: "会话" },
    1: { ja: "文法", zh: "文法" },
    3: { ja: "作業", zh: "作业" },
    4: { ja: "拡張", zh: "扩展" },
  };

  const HW_MAP = {
    穴埋め: "quiz",
    翻訳: "translate",
    間違い: "mistake",
    作文: "essay",
    聴解: "listen_hw",
    小テスト: "quiz",
    発音: "listen",
    活用: "grammar",
    選択: "quiz",
  };

  const EXT_MAP = {
    pronunciation: "listen",
    grammar: "grammar",
    preview: "extension",
    honorific: "doc",
    etymology: "doc",
    keyPoints: "dialogue",
    rolePlay: "roleplay",
    basicText: "doc",
    review: "summary",
  };

  function icon(name) {
    return paths[name] ? svg(paths[name]) : "";
  }

  function gateIcon(gate) {
    const key = GATE_KEYS[Number(gate)];
    return key ? icon(key) : "";
  }

  function hwIconForTitle(title) {
    const t = title || "";
    const key = Object.keys(HW_MAP).find((k) => t.includes(k));
    return icon(key ? HW_MAP[key] : "homework");
  }

  function extIcon(extKey, title) {
    const k = extKey && EXT_MAP[extKey];
    return icon(k || "summary") || hwIconForTitle(title);
  }

  function actionIcon(kind) {
    return icon(kind) || "";
  }

  /** 关顶：模块图标 + 名称（五关同构） */
  function moduleHeader(gate) {
    const g = Number(gate);
    const meta = GATE_LABEL[g] || GATE_LABEL[0];
    const gi = gateIcon(g);
    return `<header class="l1-mod-header" data-l1-mod-gate="${g}">
      <span class="l1-mod-header-icon">${gi}</span>
      <span class="l1-mod-header-text">
        <span class="l1-mod-header-ja jp">${meta.ja}</span>
        <span class="l1-mod-header-zh zh-annotation">${meta.zh}</span>
      </span>
    </header>`;
  }

  /** 听 · 录 · 回放（单词/会話行右侧图例） */
  function actionLegend() {
    return `<p class="l1-action-legend" role="note">
      <span class="l1-legend-item">${actionIcon("listen")}<span>听</span></span>
      <span class="l1-legend-item">${actionIcon("record")}<span>录</span></span>
      <span class="l1-legend-item">${actionIcon("replay")}<span>回放</span></span>
      <span class="l1-legend-hint zh-annotation">淡黄边＝注意 · 「延伸」点开</span>
    </p>`;
  }

  function recordButtonInner() {
    return actionIcon("record");
  }

  function replayButtonInner() {
    return actionIcon("replay");
  }

  return {
    icon,
    gateIcon,
    hwIconForTitle,
    extIcon,
    actionIcon,
    moduleHeader,
    actionLegend,
    recordButtonInner,
    replayButtonInner,
    GATE_LABEL,
  };
})();
