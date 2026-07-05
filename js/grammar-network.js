const GrammarNetwork = (() => {
  let lesson = null;
  let cardIndex = 0;
  let flipped = false;
  let onGateComplete = null;
  let container = null;
  let state = null;
  /** 展开过的文法行（必学全展开后可点「完了」） */
  let nodesOpened = {};
  let l1Flow = false;
  let l1FooterLabel = "文法完了 ✓ → 作業";
  let switchGate = null;

  function isUnit1MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit1Mvp(lesson?.lessonId);
  }

  function isUnit2MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit2Mvp(lesson?.lessonId);
  }

  function isUnits3MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnits3to6Mvp(lesson?.lessonId);
  }

  function isMvpFiveGatePanel() {
    if (isUnit1MvpPanel() || isUnit2MvpPanel() || isUnits3MvpPanel()) return true;
    const id = Number(lesson?.lessonId);
    if (!id || id > 24) return false;
    if (typeof Lesson1Flow === "undefined") return id >= 1 && id <= 24;
    return false;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function showZh() {
    if (document.documentElement.dataset.showZh === "0") return false;
    return state?.showChineseZh !== false;
  }

  /** 五关课内：中文说明/提示为教学主文案，不受「显示中文释义」开关隐藏 */
  function showPedagogyZh() {
    return isMvpFiveGatePanel() || showZh();
  }

  function speakJp(textOrNode) {
    if (typeof SpeechEngine === "undefined") return;
    const src =
      textOrNode && typeof textOrNode === "object"
        ? {
            title: textOrNode.title,
            japanese: textOrNode.japanese,
            jp: textOrNode.jp,
            example: textOrNode.example,
            explain: textOrNode.explain,
          }
        : textOrNode;
    SpeechEngine.speakJa(src);
  }

  function titleSpeakPayload(node) {
    const speakJp = node.titleSpeak || node.title;
    const kana =
      node.titleKana ||
      (node.titleRuby && typeof RubyRender !== "undefined"
        ? RubyRender.toKanaReading(speakJp, node.titleRuby)
        : speakJp.replace(/（[^）]+）/g, "").replace(/〜/g, "").trim() || "なる");
    return { jp: speakJp, kana, ruby: node.titleRuby };
  }

  function exampleSpeakPayload(node) {
    const parts = (node.example || "").split(/[/／]/).map((s) => s.trim()).filter(Boolean);
    const first = parts[0] || node.example;
    const kana =
      typeof RubyRender !== "undefined" && node.exampleRuby
        ? RubyRender.toKanaReading(first, node.exampleRuby)
        : first;
    return { jp: first, kana, ruby: node.exampleRuby, example: node.example, ttsLine: first };
  }

  function warmNodePhrases(node) {
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.warmPhrases) return;
    const lines = [titleSpeakPayload(node)];
    (node.example || "")
      .split(/[/／]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        lines.push({
          jp: part,
          kana:
            typeof RubyRender !== "undefined" && node.exampleRuby
              ? RubyRender.toKanaReading(part, node.exampleRuby)
              : part,
          ruby: node.exampleRuby,
        });
      });
    if (node.explanation) lines.push({ jp: node.explanation });
    SpeechEngine.warmPhrases(lines);
  }

  function heroRow(node) {
    const speak =
      typeof SpeakUI !== "undefined"
        ? SpeakUI.btnHtml(titleSpeakPayload(node), 'class="gn-hero-speak" title="听文型名"')
        : "";
    return `<div class="gn-hero-row">
      <div class="gn-hero-text">
        <h3 class="gn-hero-title jp">${titleHtml(node, true)}</h3>
      </div>
      ${speak}
    </div>`;
  }

  function explainBlock(node) {
    const zh = (node.explanationZh || node.explainZh || "").trim();
    const jp = (node.explanation || "").trim();
    if (showPedagogyZh() && zh) {
      return `
        <p class="gn-section-label gn-label-zh">中文说明</p>
        <p class="gn-explain-zh zh-annotation">${escapeHtml(zh)}</p>
        ${
          jp && jp !== zh
            ? `<p class="gn-section-label">日语句型</p><p class="gn-explain-ja jp">${escapeHtml(jp)}</p>`
            : ""
        }`;
    }
    return `<p class="gn-section-label">日文说明</p>
      <p class="gn-explain-ja jp">${escapeHtml(jp)}</p>`;
  }

  function titleHtml(node, hero = false) {
    const ruby =
      node.titleRuby && RubyRender.fromSegments
        ? RubyRender.fromSegments(node.title, node.titleRuby)
        : escapeHtml(node.title);
    if (hero && node.titleZh && showPedagogyZh()) {
      return `${ruby}<p class="gn-hero-zh zh-annotation">${escapeHtml(node.titleZh)}</p>`;
    }
    const zh =
      node.titleZh && showPedagogyZh()
        ? `<span class="zh-annotation title-zh">（${escapeHtml(node.titleZh)}）</span>`
        : "";
    return `${ruby}${zh}`;
  }

  function linkClass(type) {
    return `gn-link gn-link-${type}`;
  }

  /** 五关课内：文法关联链仅作知识卡式提示，不跳转（用户 2026-05-30 拍板） */
  function isHintOnlyLink(link) {
    if (!link || link.type === "contrast") return false;
    return isMvpFiveGatePanel();
  }

  function renderLinkEl(link, nodeIdx) {
    const cls = linkClass(link.type) + (isHintOnlyLink(link) ? " gn-link-hint-only" : "");
    const label = escapeHtml(link.label);
    if (isHintOnlyLink(link)) {
      return `<span class="${cls}" role="note">${label}</span>`;
    }
    return `<button type="button" class="${cls}" data-gn-link-idx="${nodeIdx}">${label}</button>`;
  }

  function lessonModalEl() {
    let el = document.getElementById("lesson-modal");
    if (!el) {
      el = document.createElement("div");
      el.id = "lesson-modal";
      el.className = "mvp-backdrop";
      el.hidden = true;
      document.getElementById("app")?.appendChild(el);
    }
    return el;
  }

  const NUM_MARKS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

  function depthHints() {
    return typeof DEPTH_PARSE_HINTS !== "undefined" ? DEPTH_PARSE_HINTS : {};
  }

  function splitParenZh(raw) {
    const s = (raw || "").trim();
    const m = s.match(/^(.+?)[（(]([^）)]+)[）)]\s*$/);
    if (m && /[\u4e00-\u9fff]/.test(m[2])) {
      return { jp: m[1].trim(), zh: m[2].trim() };
    }
    return { jp: s, zh: "" };
  }

  function jpHtml(text, ruby) {
    if (!text) return "";
    if (ruby?.length && typeof RubyRender !== "undefined") {
      return RubyRender.fromSegments(text, ruby);
    }
    return escapeHtml(text);
  }

  function denseSpeakLine(jp, kana) {
    const pick = (s) => {
      const t = (s || "").trim();
      if (!t) return "";
      if (/→/.test(t)) {
        const tail = t.split(/→/).pop().trim();
        return tail.replace(/。$/, "");
      }
      return t.replace(/。$/, "");
    };
    if (kana) return pick(kana);
    return pick(jp);
  }

  function denseSpeakPayload(jp, kana, ruby) {
    const line = denseSpeakLine(jp, kana);
    const kanaLine =
      kana ||
      (ruby?.length && typeof RubyRender !== "undefined"
        ? RubyRender.toKanaReading(line, ruby)
        : line);
    return { jp: line, kana: kanaLine, ruby, ttsLine: line };
  }

  function speakMini(jp, kana, ruby) {
    if (typeof SpeakUI === "undefined") return "";
    return SpeakUI.btnHtml(denseSpeakPayload(jp, kana, ruby), 'class="gn-dense-speak" title="听这句"');
  }

  function renderDenseItem(item, index) {
    const num = item.num || NUM_MARKS[index] || `${index + 1}.`;
    const hints = depthHints();
    const hintKey = typeof item === "string" ? item : item.jp || item.line || "";
    const hint = typeof item === "object" && item.ruby ? item : hints[hintKey] || (typeof item === "object" ? item : {});
    const parsed = typeof item === "string" ? splitParenZh(item) : {};
    const jp =
      typeof item === "object" ? item.jp || item.line || "" : parsed.jp || hintKey;
    const obj = typeof item === "object" && item ? item : null;
    const zh = (obj && obj.zh) || parsed.zh || hint.zh || "";
    const kana = (obj && obj.kana) || hint.kana || "";
    const ruby = (obj && obj.ruby) || hint.ruby;
    const label = (obj && obj.label) || "";
    const labelHtml = label
      ? `<span class="gn-dense-label">${escapeHtml(label)}</span>`
      : "";
    const kanaHtml = kana
      ? `<p class="gn-dense-kana">${escapeHtml(kana)}</p>`
      : "";
    const zhHtml =
      showZh() && zh ? `<p class="gn-dense-zh zh-annotation">${escapeHtml(zh)}</p>` : "";

    return `<li class="gn-dense-item">
      <span class="gn-dense-num">${escapeHtml(num)}</span>
      <div class="gn-dense-body">
        ${labelHtml}
        <p class="gn-dense-jp jp">${jpHtml(jp, ruby)}</p>
        ${kanaHtml}
        ${zhHtml}
      </div>
      ${speakMini(jp, kana, ruby)}
    </li>`;
  }

  function renderDensePair(bad, good, badZh, goodZh, badRuby, goodRuby) {
    const b = splitParenZh(bad);
    const g = splitParenZh(good);
    return `<div class="gn-dense-pair">
      <div class="gn-dense-pair-row bad">
        <span class="gn-dense-pair-mark">❌</span>
        <div class="gn-dense-body">
          <p class="gn-dense-jp jp">${jpHtml(bad, badRuby)}</p>
          ${showZh() && (badZh || b.zh) ? `<p class="gn-dense-zh zh-annotation">${escapeHtml(badZh || b.zh)}</p>` : ""}
        </div>
        ${speakMini(bad, b.jp, badRuby)}
      </div>
      <div class="gn-dense-pair-row good">
        <span class="gn-dense-pair-mark">✅</span>
        <div class="gn-dense-body">
          <p class="gn-dense-jp jp">${jpHtml(good, goodRuby)}</p>
          ${showZh() && (goodZh || g.zh) ? `<p class="gn-dense-zh zh-annotation">${escapeHtml(goodZh || g.zh)}</p>` : ""}
        </div>
        ${speakMini(good, g.jp, goodRuby)}
      </div>
    </div>`;
  }

  function renderDepthBlock(b) {
    if (!b) return "";
    if (b.type === "text") {
      const p = splitParenZh(b.text);
      return `<p class="gn-depth-text jp">${jpHtml(p.jp, b.ruby)}</p>
        ${showZh() && (b.zh || p.zh) ? `<p class="gn-dense-zh zh-annotation">${escapeHtml(b.zh || p.zh)}</p>` : ""}`;
    }
    if (b.type === "pair") {
      return renderDensePair(b.bad, b.good, b.badZh, b.goodZh, b.badRuby, b.goodRuby);
    }
    if (b.type === "denseList" || b.type === "list") {
      const items = b.items || [];
      return `<ol class="gn-dense-list">${items.map((it, i) => renderDenseItem(it, i)).join("")}</ol>`;
    }
    if (b.type === "table" && b.rows) {
      return `<div class="gn-table gn-table-dense">${b.rows
        .map((r, i) => {
          const zh0 = r[2] || "";
          return `<div class="gn-table-row">
            <span class="gn-dense-num">${NUM_MARKS[i] || i + 1}</span>
            <div class="gn-dense-body">
              <span class="jp">${escapeHtml(r[0])}</span>
              <span class="jp">${escapeHtml(r[1])}</span>
              ${showZh() && zh0 ? `<p class="gn-dense-zh zh-annotation">${escapeHtml(zh0)}</p>` : ""}
            </div>
          </div>`;
        })
        .join("")}</div>`;
    }
    return "";
  }

  function collectDepthWarmLines(sections) {
    const lines = [];
    const hints = depthHints();
    (sections || []).forEach((sec) => {
      (sec.blocks || []).forEach((b) => {
        if (b.type === "denseList" || b.type === "list") {
          (b.items || []).forEach((it) => {
            const jp = typeof it === "object" ? it.jp || it.line || "" : it;
            const kana = typeof it === "object" ? it.kana : hints[it]?.kana;
            const line = denseSpeakLine(jp, kana);
            if (line) lines.push({ jp: line, kana: line });
          });
        }
        if (b.type === "pair") {
          [b.bad, b.good].forEach((t) => {
            const line = denseSpeakLine(t, "");
            if (line) lines.push({ jp: line, kana: line });
          });
        }
      });
    });
    return lines;
  }

  function exampleBlockHtml(node) {
    const parts = (node.example || "").split(/[/／]/).map((s) => s.trim()).filter(Boolean);
    const exZhRaw = Array.isArray(node.exampleZh) ? node.exampleZh.join("／") : (node.exampleZh || "");
    const zhParts = exZhRaw.split(/[/／]/).map((s) => s.trim());
    if (parts.length <= 1) {
      const speak =
        typeof SpeakUI !== "undefined"
          ? SpeakUI.btnHtml(exampleSpeakPayload(node), 'class="gn-ex-speak-inline" title="听例句"')
          : "";
      const zhText = Array.isArray(node.exampleZh) ? node.exampleZh[0] || "" : (node.exampleZh || "");
      return `<div class="gn-example-line">
        <div class="gn-example-line-top">
          <p class="gn-example jp">${RubyRender.nodeExample(node)}</p>
          ${speak}
        </div>
        ${zhText && showPedagogyZh() ? `<p class="gn-example-zh zh-annotation dg-zh-below-jp">${escapeHtml(zhText)}</p>` : ""}
      </div>`;
    }
    const marks = ["①", "②", "③"];
    return parts
      .map((part, i) => {
        const zh = zhParts[i] || "";
        const jpHtml =
          node.exampleRuby && RubyRender.fromSegments
            ? RubyRender.fromSegments(part, node.exampleRuby)
            : escapeHtml(part);
        const speak =
          typeof SpeakUI !== "undefined"
            ? SpeakUI.btnHtml(
                {
                  jp: part,
                  kana:
                    typeof RubyRender !== "undefined" && node.exampleRuby
                      ? RubyRender.toKanaReading(part, node.exampleRuby)
                      : part,
                  ruby: node.exampleRuby,
                },
                `class="gn-ex-speak-inline" title="例句${marks[i] || i + 1}"`
              )
            : "";
        return `<div class="gn-example-line">
          <div class="gn-example-line-top">
            <span class="gn-ex-num">${marks[i] || i + 1}</span>
            <p class="gn-example jp">${jpHtml}</p>
            ${speak}
          </div>
          ${zh && showPedagogyZh() ? `<p class="gn-example-zh zh-annotation dg-zh-below-jp">${escapeHtml(zh)}</p>` : ""}
        </div>`;
      })
      .join("");
  }

  function renderDepthHtml(sections) {
    if (!sections?.length) return "";
    return sections
      .map((sec) => {
        const body = (sec.blocks || []).map((b) => renderDepthBlock(b)).join("");
        return `<section class="gn-depth-sec"><h4 class="gn-depth-h">${escapeHtml(sec.heading)}</h4>${body}</section>`;
      })
      .join("");
  }

  function renderSenseiDepthBlocks(node) {
    const secs = node.depthSections;
    if (!secs?.length) return "";
    if (typeof SenseiTipCard === "undefined") {
      return `<div class="gn-depth-fallback">${renderDepthHtml(secs)}</div>`;
    }
    const [first, ...rest] = secs;
    const depthExpanded = isMvpFiveGatePanel();
    let html = SenseiTipCard.wrap({
      bodyHtml: renderDepthHtml([first]),
      subtitle: first.heading || "",
      expanded: depthExpanded,
    });
    if (rest.length) {
      html += SenseiTipCard.wrap({
        bodyHtml: renderDepthHtml(rest),
        subtitle: "もっと秘技を見る",
        expanded: depthExpanded,
      });
    }
    return html;
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onGateComplete = options.onComplete;
    switchGate = options.switchGate || null;
    l1Flow = !!options.l1Flow;
    l1FooterLabel = options.l1FooterLabel || l1FooterLabel;
    if (options.l1Lesson && Number(lessonId) === 1) l1Flow = false;
    lesson = getLessonMvp(lessonId);
    cardIndex = 0;
    flipped = false;
    nodesOpened = {};
    render();
  }

  function currentNode() {
    return lesson.grammarNodes[cardIndex];
  }

  function requiredNodeIndices() {
    return lesson.grammarNodes
      .map((n, i) => (!n.supplement ? i : -1))
      .filter((i) => i >= 0);
  }

  function allRequiredOpened() {
    return requiredNodeIndices().every((i) => nodesOpened[i]);
  }

  function progressLabelText() {
    const total = lesson.grammarNodes.length;
    const req = requiredNodeIndices();
    const opened = req.filter((i) => nodesOpened[i]).length;
    return `必学 ${opened}/${req.length} · 全体 ${total} 文型 · 点行展开`;
  }

  function nodeFoldSummary(node, i) {
    const zh = node.titleZh && showPedagogyZh() ? node.titleZh : "";
    const tag = node.supplement ? "補充" : node.core ? "★必学" : "必学";
    if (isMvpFiveGatePanel()) {
      const ov =
        typeof HyougaFoldOverview !== "undefined"
          ? HyougaFoldOverview.grammarNodeOverview(node)
          : { jp: (node.explanation || "").trim(), zh: (node.explanationZh || node.titleZh || "").trim() };
      const overview =
        typeof HyougaFoldOverview !== "undefined"
          ? HyougaFoldOverview.summaryBlock(ov.jp, ov.zh, { showZh: showPedagogyZh() })
          : "";
      return `
        <span class="l1-seq-num">${i + 1}</span>
        <span class="dg-scene-fold-meta gn-node-fold-meta--stack">
          <span class="gn-node-fold-title jp">${titleHtml(node)}</span>
          ${zh ? `<span class="gn-node-fold-zh zh-annotation">${escapeHtml(zh)}</span>` : ""}
          ${overview}
        </span>
        <span class="gn-node-fold-chevron hyo-fold-slot" aria-hidden="true">${
          typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.foldDownInner(1) : "▼"
        }</span>`;
    }
    if (l1Flow) {
      return `${escapeHtml(tag)} · <span class="jp">${titleHtml(node)}</span>`;
    }
    return `
      <span class="gn-node-num">${i + 1}</span>
      <span class="gn-node-fold-meta">
        <span class="gn-node-fold-tag">${escapeHtml(tag)}</span>
        <span class="gn-node-fold-title jp">${titleHtml(node)}</span>
        ${zh ? `<span class="gn-node-fold-zh zh-annotation">${escapeHtml(zh)}</span>` : ""}
      </span>
      <span class="gn-node-fold-chevron hyo-fold-slot" aria-hidden="true">${
        typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.foldDownInner(1) : ""
      }</span>`;
  }

  function l1AccordionMode() {
    return isMvpFiveGatePanel() || l1Flow;
  }

  function nodeFoldClass() {
    return l1AccordionMode() ? "gw-group l1-grammar-fold" : "gn-node-fold";
  }

  function nodeSummaryClass() {
    return l1AccordionMode() ? "gw-group-summary" : "gn-node-fold-summary";
  }

  function nodeBodyClass() {
    return l1AccordionMode() ? "gw-group-body" : "gn-node-fold-body";
  }

  function nodeFoldSelector() {
    return l1AccordionMode() ? ".l1-grammar-fold" : ".gn-node-fold";
  }

  function nodeFoldListClass() {
    return l1AccordionMode() ? "l1-fold-list" : "gn-node-fold-list";
  }

  function nodeTipText(node) {
    const zh = node.explanationZh || node.explainZh || node.titleZh || "";
    if (zh) return zh.slice(0, 120);
    return "对照例句朗读；有疑问可点开下方链接或扩展栏。";
  }

  function renderNodeTip(node) {
    if (isMvpFiveGatePanel() && typeof L1KnowledgeCard !== "undefined") {
      let tip = null;
      if (lesson.lessonId === 1 && typeof L1KnowledgeTips !== "undefined") {
        tip = L1KnowledgeTips.grammar(node);
      } else if (
        lesson.lessonId >= 2 &&
        lesson.lessonId <= 4 &&
        typeof Unit1KnowledgeTips !== "undefined"
      ) {
        tip = Unit1KnowledgeTips.grammar(node);
      } else if (
        typeof Lesson1Flow !== "undefined" &&
        Lesson1Flow.isUnits3to6Mvp(lesson.lessonId) &&
        typeof Lessons924KnowledgeTips !== "undefined"
      ) {
        tip = Lessons924KnowledgeTips.grammar(node);
      } else if (
        typeof Lesson1Flow !== "undefined" &&
        Lesson1Flow.isUnit2Mvp(lesson.lessonId) &&
        typeof Unit2KnowledgeTips !== "undefined"
      ) {
        tip = Unit2KnowledgeTips.grammar(node);
      } else {
        const zh = (node.explanationZh || node.titleZh || "").trim();
        const lines = zh
          ? zh.split("\n").filter(Boolean).map((z) => ({ zh: z.trim() }))
          : [{ zh: nodeTipText(node) }];
        tip = { lines };
      }
      return L1KnowledgeCard.html(tip, node.id, lesson.lessonId);
    }
    if (
      !isMvpFiveGatePanel() &&
      lesson?.lessonId >= 2 &&
      typeof KnowledgeLink !== "undefined" &&
      typeof SenseiTipCard !== "undefined"
    ) {
      return SenseiTipCard.fromTipPayload(KnowledgeLink.tipFromGrammarNode(node, lesson.lessonId));
    }
    if (!l1Flow) return "";
    const tip = nodeTipText(node);
    return `
      <details class="gw-tip">
        <summary class="gw-tip-summary">先生のひとこと</summary>
        <p class="zh-annotation gw-tip-text">${escapeHtml(tip)}</p>
      </details>`;
  }

  function renderNodeBody(node) {
    warmNodePhrases(node);
    if (node.depthSections?.length && typeof SpeechEngine !== "undefined" && SpeechEngine.warmPhrases) {
      SpeechEngine.warmPhrases(collectDepthWarmLines(node.depthSections));
    }
    const linksHtml = (node.links || [])
      .map((link) => renderLinkEl(link, lesson.grammarNodes.indexOf(node)))
      .join("");
    return `
      <div class="gn-node-body-inner">
        ${heroRow(node)}
        ${explainBlock(node)}
        <div class="gn-example-block">
          <p class="gn-example-label">例句</p>
          ${exampleBlockHtml(node)}
        </div>
        <div class="gn-ext-wrap">${typeof RubyRender !== "undefined" ? RubyRender.extensionsHtml(node.extensions) : ""}</div>
        ${renderSenseiDepthBlocks(node)}
        ${linksHtml ? `<div class="gn-links gn-links-inline">${linksHtml}</div>` : ""}
        <div class="gn-tags">${(node.tags || []).map((t) => `<span class="gn-tag">${escapeHtml(t)}</span>`).join("")}</div>
        ${renderNodeTip(node)}
      </div>`;
  }

  function bindLinksInBody(bodyEl, node) {
    bodyEl.querySelectorAll("[data-gn-link-idx]").forEach((btn) => {
      const idx = Number(btn.dataset.gnLinkIdx);
      const n = lesson.grammarNodes[idx] || node;
      const label = btn.textContent;
      const link = (n.links || []).find((l) => l.label === label);
      if (!link) return;
      btn.onclick = () => handleLink(link, n);
    });
  }

  function fillNodeFoldBody(det) {
    const idx = Number(det.dataset.gidx);
    const node = lesson.grammarNodes[idx];
    const body = det.querySelector(l1AccordionMode() ? ".gw-group-body" : ".gn-node-fold-body");
    if (!body || !node) return;
    cardIndex = idx;
    body.innerHTML = renderNodeBody(node);
    if (typeof L1KnowledgeCard !== "undefined") {
      L1KnowledgeCard.bind(body, { switchGate, lessonId: lesson.lessonId });
    }
    if (typeof SenseiTipCard !== "undefined") SenseiTipCard.bind(body);
    bindLinksInBody(body, node);
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(body);
  }

  function onNodeFoldOpen(det) {
    const idx = Number(det.dataset.gidx);
    nodesOpened[idx] = true;
    fillNodeFoldBody(det);
    const sum = det.querySelector(l1AccordionMode() ? ".gw-group-summary" : ".gn-node-fold-summary");
    if (sum) {
      const prefix = l1Flow && !isMvpFiveGatePanel() ? "📖 " : "";
      sum.innerHTML = prefix + nodeFoldSummary(lesson.grammarNodes[idx], idx);
    }
    updateGateDoneButton();
  }

  function bindNodeAccordion() {
    if (typeof Lesson1Flow !== "undefined" && Lesson1Flow.bindSingleOpenAccordion) {
      Lesson1Flow.bindSingleOpenAccordion(container, onNodeFoldOpen);
      return;
    }
    const folds = container.querySelectorAll(nodeFoldSelector());
    const syncFoldChevron = (det) => {
      const slot = det.querySelector(".hyo-fold-slot");
      if (!slot || typeof HyougaGlyphs === "undefined") return;
      slot.innerHTML = det.open ? HyougaGlyphs.foldUpInner(1) : HyougaGlyphs.foldDownInner(1);
    };
    folds.forEach((det) => {
      det.addEventListener("toggle", () => {
        if (det.open) {
          folds.forEach((other) => {
            if (other !== det) {
              other.open = false;
              syncFoldChevron(other);
            }
          });
          onNodeFoldOpen(det);
        }
        syncFoldChevron(det);
      });
    });
  }

  function updateGateDoneButton() {
    const btn = container.querySelector("#gn-gate-done");
    if (!btn) return;
    const ok = allRequiredOpened();
    const req = requiredNodeIndices();
    const opened = req.filter((i) => nodesOpened[i]).length;
    if (isMvpFiveGatePanel() && typeof Lesson1Flow !== "undefined") {
      Lesson1Flow.updateChainFooterButton(btn, 1, {
        done: opened,
        total: req.length,
        ready: ok,
        lessonId: lesson?.lessonId,
      });
      if (Lesson1Flow.MVP_HIDE_CHAIN_FOOTER && ok) {
        setGateDone(state, lesson.lessonId, 1);
        saveMvpState(state);
      }
      return;
    }
    btn.disabled = !ok;
    if (l1Flow) {
      btn.textContent = ok ? l1FooterLabel : `文法完了（必学 ${opened}/${req.length}）`;
      return;
    }
    btn.textContent = ok
      ? "文法完了 → 会話"
      : `展开全部必学（${opened}/${req.length}）`;
  }

  function renderNodeAccordion() {
    const foldCls = nodeFoldClass();
    const sumCls = nodeSummaryClass();
    const bodyCls = nodeBodyClass();
    return `<div class="${nodeFoldListClass()}" role="list">
      ${lesson.grammarNodes
        .map(
          (node, i) => `
        <details class="${foldCls}" data-gidx="${i}" data-node-id="${escapeHtml(node.id || "")}">
          <summary class="${sumCls}">${l1Flow && !isMvpFiveGatePanel() ? "📖 " : ""}${nodeFoldSummary(node, i)}</summary>
          <div class="${bodyCls}"></div>
        </details>`
        )
        .join("")}
    </div>`;
  }

  function render() {
    if (l1Flow && !isMvpFiveGatePanel()) {
      container.innerHTML = `
        <div class="gn-card-wrap l1-flow-wrap gn-l1-wrap">
          <h2>第${lesson.lessonId}課 · 文法</h2>
          <p class="hint-ja">点开每一文型查看说明与例句；必学全部展开后可点底部「文法完了」。</p>
          <p class="gn-progress hint-ja">${progressLabelText()}</p>
          ${renderNodeAccordion()}
          <div class="gn-footer">
            <button type="button" class="btn primary" id="gn-gate-done" disabled>文法完了（必学 0/0）</button>
          </div>
          <p class="hint-ja">中文仅辅助理解；朗读只读日语。</p>
        </div>`;
      bindNodeAccordion();
      updateGateDoneButton();
      container.querySelector("#gn-gate-done")?.addEventListener("click", () => {
        if (!allRequiredOpened()) return;
        setGateDone(state, lesson.lessonId, 1);
        saveMvpState(state);
        onGateComplete?.();
      });
      return;
    }
    const l1Grammar = isMvpFiveGatePanel();
    const req = requiredNodeIndices();
    if (l1Grammar && typeof Lesson1Flow !== "undefined") {
      container.innerHTML = Lesson1Flow.l1GatePanelHtml(renderNodeAccordion(), 1, {
        btnId: "gn-gate-done",
        done: 0,
        total: req.length,
        ready: false,
        disabled: true,
        lessonId: lesson.lessonId,
      });
      bindNodeAccordion();
      updateGateDoneButton();
      const panel = container.querySelector(".l1-gate-panel") || container;
      Lesson1Flow.finishGatePanelMount(panel, { switchGate, lessonId: lesson.lessonId });
    } else {
      container.innerHTML = `
      <div class="gn-wrap gn-compact gn-accordion">
        <p class="gn-progress">${progressLabelText()}</p>
        ${renderNodeAccordion()}
        <div class="gn-nav gn-nav-single">
          <button type="button" class="btn primary" id="gn-gate-done" disabled>展开全部必学文型</button>
        </div>
      </div>
    `;
      bindNodeAccordion();
      updateGateDoneButton();
    }
    container.querySelector("#gn-gate-done")?.addEventListener("click", () => {
      if (!allRequiredOpened()) return;
      setGateDone(state, lesson.lessonId, 1);
      saveMvpState(state);
      if (l1Grammar && switchGate) switchGate(3);
      else onGateComplete?.();
    });
  }

  function showModal(html, onReady) {
    const modal = lessonModalEl();
    modal.innerHTML = `<div class="gn-modal-inner gn-depth-modal"><p class="gn-depth-modal-title">📖 先生の補足 · 高密度</p><div class="gn-depth-scroll">${html}</div><button type="button" class="btn ghost gn-close">閉じる</button></div>`;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.style.removeProperty("display");
    modal.style.removeProperty("pointer-events");
    const hideModal = () => {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "none";
      modal.style.pointerEvents = "none";
    };
    modal.querySelector(".gn-close").onclick = hideModal;
    modal.onclick = (e) => {
      if (e.target === modal) hideModal();
    };
    onReady?.(modal);
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(modal);
  }

  function showMiniCard(link) {
    const key =
      typeof miniCardKeyFromLink === "function" ? miniCardKeyFromLink(link) : link.miniCardKey;
    const card = typeof getMiniCard === "function" ? getMiniCard(key) : null;
    if (!card) {
      showModal(
        `<p class="jp">${escapeHtml(link.label)}</p><p class="hint-ja">ミニカード準備中です。</p>`
      );
      return;
    }
    const ex =
      card.exampleRuby && RubyRender.fromSegments
        ? RubyRender.fromSegments(card.example, card.exampleRuby)
        : escapeHtml(card.example);
    const titleRuby =
      card.titleRuby && RubyRender.fromSegments
        ? RubyRender.fromSegments(card.title, card.titleRuby)
        : escapeHtml(card.title);
    showModal(
      `
      <p class="mini-label">ミニカード · 約10秒</p>
      <div class="mini-head">
        <h3 class="jp">${titleRuby}</h3>
        ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(card.title, 'id="mini-speak-title"') : ""}
      </div>
      <p class="gn-explain">${escapeHtml(card.explain)}</p>
      <div class="mini-ex-row">
        <p class="jp">${ex}</p>
        ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(card.example, 'id="mini-speak-ex"') : ""}
      </div>
    `
    );
  }

  function handleLink(link, node) {
    if (link.type === "contrast") {
      openContrast(link, node);
      return;
    }
    if (link.targetNodeId) {
      const target = findNodeAcrossLessons(link.targetNodeId);
      if (target && target.lesson.lessonId === lesson.lessonId) {
        const idx = target.lesson.grammarNodes.findIndex((n) => n.id === link.targetNodeId);
        if (idx >= 0) {
          cardIndex = idx;
          flipped = true;
          nodesOpened[idx] = true;
          render();
          const det = container?.querySelector(`${nodeFoldSelector()}[data-gidx="${idx}"]`);
          if (det) {
            container.querySelectorAll(nodeFoldSelector()).forEach((f) => {
              f.open = f === det;
            });
            fillNodeFoldBody(det);
            updateGateDoneButton();
          }
          return;
        }
      }
    }
    showMiniCard(link);
  }

  function openContrast(link, node) {
    let preset = null;
    if (link.contrastWith && node.id) {
      const key = [link.contrastWith, node.id].sort().join("+");
      preset = CONTRAST_PRESETS[key];
    }
    if (!preset && link.targetNodeId) {
      const key = [node.id, link.targetNodeId].sort().join("+");
      preset = CONTRAST_PRESETS[key];
    }
    if (preset) {
      const zh = (col) =>
        col.exampleZh && showZh()
          ? `<p class="zh-annotation">${escapeHtml(col.exampleZh)}</p>`
          : "";
      showModal(
        `
        <h3>${escapeHtml(preset.title)}</h3>
        <div class="gn-contrast-grid">
          <div class="gn-contrast-col">
            <h4>${escapeHtml(preset.left.label)}</h4>
            <p><strong>文型</strong> ${escapeHtml(preset.left.pattern)}</p>
            <p class="gn-timeline">${escapeHtml(preset.left.timeline)}</p>
            <p class="jp">${escapeHtml(preset.left.example)}</p>
            ${zh(preset.left)}
            <p class="gn-mistake">${escapeHtml(preset.left.mistake)}</p>
            ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(preset.left.example, 'class="gn-contrast-speak"') : `<button type="button" class="btn-speak-icon gn-contrast-speak" data-jp="${escapeHtml(preset.left.example)}">🔊</button>`}
          </div>
          <div class="gn-contrast-col">
            <h4>${escapeHtml(preset.right.label)}</h4>
            <p><strong>文型</strong> ${escapeHtml(preset.right.pattern)}</p>
            <p class="gn-timeline">${escapeHtml(preset.right.timeline)}</p>
            <p class="jp">${escapeHtml(preset.right.example)}</p>
            ${zh(preset.right)}
            <p class="gn-mistake">${escapeHtml(preset.right.mistake)}</p>
            ${typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(preset.right.example, 'class="gn-contrast-speak"') : `<button type="button" class="btn-speak-icon gn-contrast-speak" data-jp="${escapeHtml(preset.right.example)}">🔊</button>`}
          </div>
        </div>
      `);
      return;
    }
    if (link.contrastPair) {
      showModal(`
        <h3>⚠️ 比べてみよう</h3>
        <ul class="gn-pair-list">
          ${link.contrastPair.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      `);
    }
  }

  return { mount };
})();
