/** 第二関：会話 · 一场景一屏 · 逐句/多选 · 🔊/🎤/▶ 跟读 */
const DialogueGate = (() => {
  let lesson = null;
  let dialogues = [];
  let dialogue = null;
  let dialogueIndex = 0;
  let container = null;
  let state = null;
  let onComplete = null;
  let dialoguePassed = {};
  let branchChoiceId = null;
  let l1Flow = false;
  let l1FooterLabel = "会話完了 ✓ → 文法";
  let switchGate = null;

  function isL1Dialogue() {
    return lesson?.lessonId === 1;
  }

  /** 第1单元第1–4课 · ABC 三答 UI（A=课文 · B/C=场景变体） */
  function isUnit1AbcDialogue() {
    const lid = lesson?.lessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit1Mvp(lid);
  }

  /** 第2单元第5–8课 · ABC（同 U1 约定） */
  function isUnit2AbcDialogue() {
    const lid = lesson?.lessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit2Mvp(lid);
  }

  /** 第3–6单元第9–24课 · ABC */
  function isUnits3AbcDialogue() {
    const lid = lesson?.lessonId;
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnits3to6Mvp(lid);
  }

  function isMvpAbcDialogue() {
    return isUnit1AbcDialogue() || isUnit2AbcDialogue() || isUnits3AbcDialogue();
  }

  /** 第1单元第1–4课 · 与第1课相同的 l1-gate-panel + 传送链 */
  function isUnit1MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit1Mvp(lesson?.lessonId);
  }

  /** 第2单元第5–8课 · 同 l1-gate-panel 壳 */
  function isUnit2MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnit2Mvp(lesson?.lessonId);
  }

  /** 第3–6单元第9–24课 · 同 l1-gate-panel 壳 */
  function isUnits3MvpPanel() {
    return typeof Lesson1Flow !== "undefined" && Lesson1Flow.isUnits3to6Mvp(lesson?.lessonId);
  }

  function isMvpFiveGatePanel() {
    if (isUnit1MvpPanel() || isUnit2MvpPanel() || isUnits3MvpPanel()) return true;
    const id = Number(lesson?.lessonId);
    return id >= 1 && id <= 24;
  }

  function showPedagogyZh() {
    return isMvpFiveGatePanel() || showZh();
  }

  function isSequentialMode() {
    if (isMvpAbcDialogue()) return false;
    if (!dialogues.length) return true;
    return dialogues.every((d) => !d.userTurn?.replies || d.userTurn.replies.length <= 1);
  }
  function dialogueModeLabel() {
    if (lesson?.lessonId === 1 && typeof ShadowSpeak !== "undefined") {
      return "会話 · 录制播放";
    }
    return isSequentialMode() ? "会話 · 逐句聽讀" : "会話 · 三种说法";
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function speakBtn(payload, attrs = "", rowId = "") {
    const id = rowId || `dg-${Math.random().toString(36).slice(2, 9)}`;
    if (typeof ShadowSpeak !== "undefined") {
      return ShadowSpeak.rowHtml(payload, id, attrs);
    }
    if (typeof SpeakUI !== "undefined" && SpeakUI.btnHtml) {
      return SpeakUI.btnHtml(payload, attrs);
    }
    const jp = typeof payload === "string" ? payload : payload?.japanese || payload?.jp || "";
    return `<button type="button" class="btn-speak-icon" data-jp="${escapeHtml(jp)}">🔊</button>`;
  }

  function linePayload(line) {
    if (!line) return "";
    return {
      jp: line.japanese || line.jp,
      kana: line.kana,
      ruby: line.japaneseRuby || line.ruby,
    };
  }

  function replyKeywords(reply) {
    if (reply?.keywords?.length) return reply.keywords;
    const jp = reply?.japanese || reply?.jp || "";
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.extractKeywordsFromJapanese) {
      return SpeechEngine.extractKeywordsFromJapanese(jp);
    }
    return [];
  }

  function dialogueSpeakAttrs(reply) {
    const keys = replyKeywords(reply);
    const kw = keys.length ? ` data-ss-keywords="${escapeHtml(JSON.stringify(keys))}"` : "";
    return `class="dg-reply-speak" data-ss-dialogue="1" data-ss-score-below="1"${kw}`;
  }

  function showZh() {
    if (document.documentElement.dataset.showZh === "0") return false;
    return state?.showChineseZh !== false;
  }

  function zhLine(text) {
    if (!text || !showPedagogyZh()) return "";
    return `<p class="zh-annotation dg-zh-below-jp">${escapeHtml(text)}</p>`;
  }

  function wrapL1TipSlot(html) {
    if (!html) return "";
    if (!isL1Dialogue()) return html;
    return `<div class="l1-tip-slot l1-tip-slot--line">${html}</div>`;
  }

  function senseiNotes(line, opts = {}) {
    if (!line?.noteJa && !(line?.noteZh && showZh())) return "";
    if (typeof SenseiTipCard !== "undefined") {
      return wrapL1TipSlot(
        SenseiTipCard.fromNotes(line.noteJa, line.noteZh, {
          expanded: false,
          l1Scope: isL1Dialogue(),
          ...opts,
        })
      );
    }
    let h = "";
    if (line.noteJa) h += `<p class="note-ja">${escapeHtml(line.noteJa)}</p>`;
    if (line.noteZh && showPedagogyZh()) h += `<p class="zh-annotation dg-zh-below-jp">${escapeHtml(line.noteZh)}</p>`;
    return h;
  }

  function lineJapaneseHtml(line) {
    if (!line) return "";
    if (typeof RubyRender !== "undefined" && RubyRender.lineJapanese) {
      return RubyRender.lineJapanese(line);
    }
    return escapeHtml(line.japanese || line.jp || "");
  }

  /** 会話行：正文 + 右侧固定宽操作列（🔊🎤▶ 纵向对齐） */
  function renderDialogueLine({ speaker, line, speakAttrs = "", rowId = "", listenOnly = false, extraClass = "" }) {
    const actionsCol = listenOnly ? "dg-actions-col dg-actions-col--listen" : "dg-actions-col";
    return `
      <div class="dg-line-row ${extraClass}">
        <span class="dg-sp">${escapeHtml(speaker || "A")}</span>
        <div class="dg-line-content">
          <p class="jp">${lineJapaneseHtml(line)}</p>
          ${zhLine(line.chinese)}
          ${senseiNotes(line)}
        </div>
        <div class="${actionsCol}">
          ${speakBtn(linePayload(line), speakAttrs, rowId)}
        </div>
      </div>`;
  }

  function sceneBadge(d, opts = {}) {
    if (!d.title && !d.sceneEmoji && !d.scenePlace) return "";
    const inSummary = opts.inSummary ? " dg-scene-badge--in-summary" : "";
    const title = d.title ? escapeHtml(d.title) : "";
    const emoji = d.sceneEmoji ? escapeHtml(d.sceneEmoji) : "";
    if (title) {
      return `<span class="dg-scene-badge${inSummary}">${emoji ? `${emoji} ` : ""}${title}</span>`;
    }
    return `<span class="dg-scene-badge${inSummary}">${emoji} ${escapeHtml(d.scenePlace || "")}</span>`;
  }

  function renderActionLegend() {
    return `<div class="dg-action-legend" aria-label="操作说明">
      <span class="dg-leg dg-leg-listen"><i class="dg-leg-ico">🔊</i>导读</span>
      <span class="dg-leg dg-leg-record"><i class="dg-leg-ico">🎤</i>录音</span>
      <span class="dg-leg dg-leg-replay"><i class="dg-leg-ico">▶</i>回放</span>
      <span class="dg-leg dg-leg-eval"><i class="dg-leg-ico">✓</i>评估</span>
    </div>`;
  }

  function renderSceneHeader(d) {
    if (isL1Dialogue()) return "";
    const badge = sceneBadge(d);
    const title = escapeHtml(d.title || "");
    return `<div class="dg-scene-head">${badge ? `${badge} ` : ""}<h3 class="dg-scene-title">${title}</h3></div>`;
  }

  function collectWarmLines() {
    const lines = [];
    const push = (t) => {
      if (t && typeof SpeechEngine !== "undefined") {
        const l = SpeechEngine.prepareJaTtsLine(t);
        if (l) lines.push(l);
      }
    };
    dialogues.forEach((d) => {
      if (d.opener) push(d.opener.japanese || d.opener);
      d.userTurn?.replies?.forEach((r) => {
        push(r.japanese || r.jp);
        if (r.npcReaction) push(r.npcReaction.japanese);
      });
      if (d.isBranch && d.choice) {
        push(d.choice.japanese);
        d.choice.options?.forEach((o) => {
          push(o.japanese);
          if (o.npcReaction) push(o.npcReaction.japanese);
        });
      }
    });
    return lines;
  }

  function allDialoguesPassed() {
    return dialogues.every((d, i) => dialoguePassed[i]);
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onComplete = options.onComplete;
    switchGate = options.switchGate || null;
    l1Flow = !!options.l1Flow;
    l1FooterLabel = options.l1FooterLabel || l1FooterLabel;
    if (options.l1Lesson && Number(lessonId) === 1) l1Flow = false;
    lesson = getLessonMvp(lessonId);
    dialogues =
      typeof getLessonDialogues === "function"
        ? getLessonDialogues(lessonId)
        : lesson.dialogues || [];
    if (Number(lessonId) === 1 && typeof applyL1DialogueAbc === "function") {
      dialogues = applyL1DialogueAbc(dialogues);
    } else if (
      Number(lessonId) >= 2 &&
      Number(lessonId) <= 4 &&
      typeof applyUnit1DialogueAbc === "function"
    ) {
      dialogues = applyUnit1DialogueAbc(lessonId, dialogues);
    } else if (
      Number(lessonId) >= 5 &&
      Number(lessonId) <= 8 &&
      typeof applyUnit2DialogueAbc === "function"
    ) {
      dialogues = applyUnit2DialogueAbc(lessonId, dialogues);
    } else if (
      Number(lessonId) >= 9 &&
      Number(lessonId) <= 24 &&
      typeof applyLessons9_24DialogueAbc === "function"
    ) {
      dialogues = applyLessons9_24DialogueAbc(lessonId, dialogues);
    }
    if (!dialogues.length) {
      container.innerHTML = `<p class="hint-ja">会話データがありません。</p>`;
      return;
    }
    dialogueIndex = 0;
    dialogue = dialogues[0];
    branchChoiceId = null;
    dialoguePassed = {};
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.warmPhrases) {
      SpeechEngine.warmPhrases(collectWarmLines());
    }
    render();
  }

  function switchDialogue(idx) {
    if (idx < 0 || idx >= dialogues.length) return;
    dialogueIndex = idx;
    dialogue = dialogues[idx];
    branchChoiceId = null;
    const det = container?.querySelector(`${sceneFoldSelector()}[data-didx="${idx}"]`);
    if (det) {
      container.querySelectorAll(sceneFoldSelector()).forEach((f) => {
        f.open = f === det;
      });
      fillSceneFoldBody(det);
    } else {
      render();
    }
  }

  function renderLegacyLink() {
    const lid = lesson.lessonId;
    return `
      <div class="dg-legacy-box dg-legacy-compact">
        <a class="btn secondary" href="legacy.html#l${lid}">选修：24课情景库</a>
      </div>`;
  }

  /** 按 level/rank 升序；无字段时保持数据顺序（①②③） */
  function sortRepliesByKnowledgeLevel(replies) {
    return replies
      .map((reply, index) => ({ reply, index }))
      .sort((a, b) => {
        const la = Number(a.reply.level ?? a.reply.rank ?? a.index + 1);
        const lb = Number(b.reply.level ?? b.reply.rank ?? b.index + 1);
        return la - lb || a.index - b.index;
      })
      .map((x) => x.reply);
  }

  function renderReplyList(replies, sceneIdx) {
    const idx = sceneIdx != null ? sceneIdx : dialogueIndex;
    if (isMvpAbcDialogue()) return renderL1AbcReplyList(replies, idx);
    const ordered = sortRepliesByKnowledgeLevel(replies);
    const marks = ["①", "②", "③"];
    return `<div class="dg-reply-list" role="list" aria-label="三种说法">
      ${ordered
        .map((reply, i) => {
          const jp =
            typeof RubyRender !== "undefined" && RubyRender.lineJapanese
              ? RubyRender.lineJapanese(reply)
              : escapeHtml(reply.japanese || "");
          const reaction = reply.npcReaction;
          return `
          <div class="dg-reply-block">
            <div class="dg-reply-head dg-line-row dg-line-row--reply">
              <span class="dg-reply-num" aria-hidden="true">${marks[i] || i + 1}</span>
              <div class="dg-line-content">
                <p class="jp dg-reply-jp">${jp}</p>
                ${zhLine(reply.chinese)}
                ${senseiNotes(reply)}
                <div class="dg-score-slot dg-score-slot--inline" data-dg-score-for="dg-r-${idx}-${i}" aria-live="polite" hidden></div>
              </div>
              <div class="dg-actions-col">
                ${speakBtn(linePayload(reply), dialogueSpeakAttrs(reply), `dg-r-${idx}-${i}`)}
              </div>
            </div>
            ${
              reaction
                ? renderDialogueLine({
                    speaker: "A",
                    line: reaction,
                    speakAttrs: 'class="dg-react-speak"',
                    rowId: `dg-rr-${idx}-${i}`,
                    listenOnly: true,
                    extraClass: "dg-line-row--npc dg-line-row--reaction",
                  })
                : ""
            }
          </div>`;
        })
        .join("")}
    </div>`;
  }

  /** B/C 第3行：场景说明（常显灰字 · 见 docs/会話-ABC三答-产品真源.md） */
  function renderL1AbcSceneNote(reply, label) {
    const note = (reply?.noteZh || "").trim();
    if (!note || !showPedagogyZh()) return "";
    if (label === "B" || label === "C") {
      return `<p class="zh-annotation dg-reply-scene-note">${escapeHtml(note)}</p>`;
    }
    return `<p class="zh-annotation dg-reply-scene-note dg-reply-scene-note--a">${escapeHtml(note)}</p>`;
  }

  function sceneTitleZh(d) {
    if (d.sceneTitleZh) return d.sceneTitleZh;
    const m = (d.title || "").match(/（([^）]+)）/);
    return m ? m[1].trim() : "";
  }

  function renderL1OpenerBlock(d, idx) {
    const opener = d.opener;
    if (!opener) return "";
    const sp = opener.speaker || "A";
    const zh = (opener.chinese || d.openerZh || "").trim();
    const openerLine = { ...opener, chinese: "" };
    return `
      <div class="dg-l1-opener-block">
        ${renderDialogueLine({
          speaker: sp,
          line: openerLine,
          speakAttrs: 'class="dg-play-a"',
          rowId: `dg-op-${idx}`,
          listenOnly: true,
          extraClass: "dg-line-row--npc dg-line-row--l1-opener",
        })}
        ${zh && showPedagogyZh() ? `<p class="dg-l1-opener-zh zh-annotation dg-zh-below-jp">${escapeHtml(zh)}</p>` : ""}
      </div>`;
  }

  function renderL1AbcReplyList(replies, sceneIdx) {
    const ordered = sortRepliesByKnowledgeLevel(replies);
    const defaultLabels = ["A", "B", "C"];
    return `<div class="dg-reply-list dg-reply-list--abc" role="list" aria-label="ABC三种回答">
      ${ordered
        .map((reply, i) => {
          const label = reply.label || defaultLabels[i] || String(i + 1);
          const tier =
            label === "A" ? "课文" : label === "B" ? "变体B" : label === "C" ? "变体C" : "";
          const jp = lineJapaneseHtml(reply);
          const reaction = reply.npcReaction;
          const jpPlain = (reply.japanese || reply.jp || "").replace(/\s+/g, " ").trim();
          const zhText = (reply.chinese || reply.zh || "").trim();
          return `
          <div class="dg-reply-block dg-reply-block--abc" data-abc="${escapeHtml(label)}">
            <div class="dg-reply-head dg-reply-head--abc" title="${escapeHtml(jpPlain)}">
              <span class="dg-abc-label" aria-label="${escapeHtml(label)}答">${escapeHtml(label)}</span>
              ${tier ? `<span class="dg-abc-tier">${escapeHtml(tier)}</span>` : ""}
              <div class="dg-actions-col">
                ${speakBtn(linePayload(reply), dialogueSpeakAttrs(reply), `dg-r-${sceneIdx}-${i}`)}
              </div>
            </div>
            <div class="dg-reply-body--abc">
              <p class="jp dg-reply-jp">${jp}</p>
              ${zhText && showPedagogyZh() ? `<p class="zh-annotation dg-reply-zh dg-zh-below-jp">${escapeHtml(zhText)}</p>` : ""}
              ${renderL1AbcSceneNote(reply, label)}
              <div class="dg-score-slot dg-score-slot--inline" data-dg-score-for="dg-r-${sceneIdx}-${i}" aria-live="polite" hidden></div>
            </div>
            ${
              reaction
                ? renderDialogueLine({
                    speaker: "A",
                    line: reaction,
                    speakAttrs: 'class="dg-react-speak"',
                    rowId: `dg-rr-${sceneIdx}-${i}`,
                    listenOnly: true,
                    extraClass: "dg-line-row--npc dg-line-row--reaction",
                  })
                : ""
            }
          </div>`;
        })
        .join("")}
    </div>`;
  }

  function renderSceneKcard(sceneIdx) {
    if (typeof L1KnowledgeCard === "undefined") return "";
    const lid = Number(lesson?.lessonId) || 1;
    let tip = null;
    let anchorId = `l${lid}_dlg_${sceneIdx}`;
    if (lid === 1 && typeof L1KnowledgeTips !== "undefined") {
      tip = L1KnowledgeTips.dialogue(sceneIdx);
      anchorId = `l1_dlg_${sceneIdx}`;
    } else if (
      lid >= 2 &&
      lid <= 4 &&
      typeof Unit1KnowledgeTips !== "undefined" &&
      typeof Unit1KnowledgeTips.dialogue === "function"
    ) {
      tip = Unit1KnowledgeTips.dialogue(sceneIdx, lid);
    } else if (
      lid >= 5 &&
      lid <= 8 &&
      typeof Unit2KnowledgeTips !== "undefined" &&
      typeof Unit2KnowledgeTips.dialogue === "function"
    ) {
      tip = Unit2KnowledgeTips.dialogue(sceneIdx, lid);
    } else if (
      lid >= 9 &&
      lid <= 24 &&
      typeof Lessons924KnowledgeTips !== "undefined" &&
      typeof Lessons924KnowledgeTips.dialogue === "function"
    ) {
      tip = Lessons924KnowledgeTips.dialogue(sceneIdx, lid);
    }
    if (!tip) return "";
    const html = L1KnowledgeCard.html(tip, anchorId, lid);
    return html ? `<div class="l1-tip-slot l1-tip-slot--scene">${html}</div>` : "";
  }

  function renderL1SceneKcard(sceneIdx) {
    return renderSceneKcard(sceneIdx);
  }

  function renderBranchSceneBody(d, idx) {
    const opener = d.opener;
    let body = `
        ${renderSceneHeader(d)}
        ${renderDialogueLine({
          speaker: opener.speaker,
          line: opener,
          speakAttrs: 'class="dg-play-a"',
          rowId: `dg-op-${idx}`,
          listenOnly: true,
          extraClass: "dg-line-row--npc",
        })}
        <p class="dg-your-turn dg-your-turn-compact">B · 选一种回答</p>
        <p class="jp dg-choice-prompt">${escapeHtml(d.choice.japanese)}</p>
        ${zhLine(d.choice.chinese)}
        <div class="dg-choice-list">
          ${d.choice.options
            .map(
              (opt) => `
            <div class="dg-choice-row ${branchChoiceId === opt.id ? "selected" : ""}" data-choice="${escapeHtml(opt.id)}" data-branch-idx="${idx}">
              <div class="dg-choice-body">
                <p class="jp">${escapeHtml(opt.japanese)}</p>
                ${zhLine(opt.chinese)}
              </div>
              <div class="dg-actions-col dg-actions-col--listen">
                ${speakBtn(linePayload(opt), "", `dg-opt-${idx}-${opt.id}`)}
              </div>
            </div>`
            )
            .join("")}
        </div>`;
    if (branchChoiceId && idx === dialogueIndex) {
      const opt = d.choice.options.find((o) => o.id === branchChoiceId);
      if (opt?.npcReaction) {
        body += renderDialogueLine({
          speaker: "A",
          line: opt.npcReaction,
          speakAttrs: 'class="dg-react-speak"',
          rowId: `dg-br-${idx}`,
          listenOnly: true,
          extraClass: "dg-line-row--npc",
        });
      }
    }
    body += renderFooter(null, idx);
    return body;
  }

  function renderSequentialSceneBody(d, idx) {
    const opener = d.opener;
    const replies = d.userTurn?.replies || [];
    const speakerB = d.userTurn?.speaker || "B";
    if (isMvpAbcDialogue()) {
      let html = renderL1OpenerBlock(d, idx);
      if (d.abcGuideZh && showZh()) {
        html += `<p class="dg-abc-guide zh-annotation">${escapeHtml(d.abcGuideZh)}</p>`;
      }
      html += `<p class="dg-your-turn dg-your-turn-compact">${escapeHtml(speakerB)} · 選ぶ回答 <span class="dg-abc-hint">A＝课文 · B/C＝场景变体（均可沟通）</span></p>`;
      if (replies.length) html += renderReplyList(replies, idx);
      html += renderSceneKcard(idx);
      html += renderFooter(null, idx);
      return html;
    }
    if (isMvpFiveGatePanel()) {
      let html = renderL1OpenerBlock(d, idx);
      if (replies.length) html += renderReplyList(replies, idx);
      html += renderSceneKcard(idx);
      html += renderFooter(null, idx);
      return html;
    }
    const seq = isSequentialMode();
    let html = `
        ${renderSceneHeader(d)}
        ${renderDialogueLine({
          speaker: opener.speaker || "A",
          line: opener,
          speakAttrs: 'class="dg-play-a"',
          rowId: `dg-op-${idx}`,
          listenOnly: true,
          extraClass: "dg-line-row--npc dg-line-row--opener",
        })}
        <p class="dg-your-turn dg-your-turn-compact">B · あなたの番</p>`;
    if (seq && replies.length === 1) {
      const reply = replies[0];
      html += `
        <div class="dg-scene-reply-block">
          ${renderDialogueLine({
            speaker: speakerB,
            line: reply,
            speakAttrs: dialogueSpeakAttrs(reply),
            rowId: `dg-r-${idx}-0`,
            extraClass: "dg-line-row--reply",
          })}
          ${
            reply.npcReaction
              ? renderDialogueLine({
                  speaker: "A",
                  line: reply.npcReaction,
                  speakAttrs: 'class="dg-react-speak"',
                  rowId: `dg-rr-${idx}-0`,
                  listenOnly: true,
                  extraClass: "dg-line-row--npc dg-line-row--reaction",
                })
              : ""
          }
        </div>`;
    } else if (replies.length) {
      html += renderReplyList(replies, idx);
    }
    html += renderFooter(null, idx);
    return html;
  }

  function sceneFoldSummary(d, i) {
    const tag = d.isBranch ? "分岐" : d.scenePlace ? `第${d.scenePlace}句` : `第${i + 1}句`;
    const done = dialoguePassed[i];
    if (isMvpFiveGatePanel()) {
      const ov =
        typeof HyougaFoldOverview !== "undefined"
          ? HyougaFoldOverview.dialogueSceneOverview(d, sceneTitleZh)
          : { jp: (d.opener?.japanese || d.title || "").trim(), zh: sceneTitleZh(d) };
      const overview =
        typeof HyougaFoldOverview !== "undefined"
          ? HyougaFoldOverview.summaryBlock(ov.jp, ov.zh, { showZh: showPedagogyZh() })
          : "";
      const badge = sceneBadge(d, { inSummary: true });
      return `
      <span class="l1-seq-num">${i + 1}</span>
      <span class="dg-scene-fold-meta dg-scene-fold-meta--stack">
        ${badge ? `<span class="dg-scene-fold-badge-row">${badge}</span>` : ""}
        ${overview}
      </span>
      <span class="dg-scene-fold-chevron hyo-fold-slot" aria-hidden="true">${
        typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.foldDownInner(2) : "▼"
      }</span>`;
    }
    const preview = (d.opener?.japanese || d.title || "").trim().slice(0, 36);
    if (l1Flow) {
      const mark = done ? " ✓" : "";
      return `${escapeHtml(tag)}${mark} · <span class="jp">${escapeHtml(preview)}${preview.length >= 28 ? "…" : ""}</span>`;
    }
    return `
      <span class="dg-scene-num">${i + 1}</span>
      <span class="dg-scene-fold-meta">
        <span class="dg-scene-fold-tag">${escapeHtml(tag)}</span>
        <span class="dg-scene-fold-preview jp">${escapeHtml(preview)}${preview.length >= 28 ? "…" : ""}</span>
      </span>
      ${done ? '<span class="dg-scene-done-mark" aria-label="已听完">✓</span>' : ""}
      <span class="dg-scene-fold-chevron" aria-hidden="true"></span>`;
  }

  function l1AccordionMode() {
    return isMvpFiveGatePanel() || l1Flow;
  }

  function useUnit1SceneFooter() {
    return isMvpFiveGatePanel();
  }

  function sceneFoldClass() {
    return l1AccordionMode() ? "gw-group l1-scene-fold" : "dg-scene-fold";
  }

  function sceneSummaryClass() {
    return l1AccordionMode() ? "gw-group-summary" : "dg-scene-fold-summary";
  }

  function sceneBodyClass() {
    return l1AccordionMode() ? "gw-group-body" : "dg-scene-fold-body";
  }

  function sceneFoldSelector() {
    return l1AccordionMode() ? ".l1-scene-fold" : ".dg-scene-fold";
  }

  function sceneFoldListClass() {
    return l1AccordionMode() ? "l1-fold-list" : "dg-scene-fold-list";
  }

  function renderSceneAccordion() {
    const foldCls = sceneFoldClass();
    const sumCls = sceneSummaryClass();
    const bodyCls = sceneBodyClass();
    return `<div class="${sceneFoldListClass()}" role="list">
      ${dialogues
        .map(
          (d, i) => `
        <details class="${foldCls}" data-didx="${i}" data-node-id="l${lesson.lessonId}_dlg_${i}">
          <summary class="${sumCls}">${l1Flow && !isMvpFiveGatePanel() ? `💬 ` : ""}${sceneFoldSummary(d, i)}</summary>
          <div class="${bodyCls}"></div>
        </details>`
        )
        .join("")}
    </div>`;
  }

  function updateL1Footer() {
    const btn = container?.querySelector("#dg-l1-done");
    if (!btn || typeof Lesson1Flow === "undefined") return;
    const doneN = dialogues.filter((_, i) => dialoguePassed[i]).length;
    const ok = allDialoguesPassed();
    Lesson1Flow.updateChainFooterButton(btn, 2, {
      done: doneN,
      total: dialogues.length,
      ready: ok,
      lessonId: lesson?.lessonId,
    });
  }

  function fillSceneFoldBody(det) {
    const idx = Number(det.dataset.didx);
    const d = dialogues[idx];
    const body = det.querySelector(l1AccordionMode() ? ".gw-group-body" : ".dg-scene-fold-body");
    if (!body) return;
    dialogueIndex = idx;
    dialogue = d;
    body.innerHTML = d.isBranch ? renderBranchSceneBody(d, idx) : renderSequentialSceneBody(d, idx);
    if (isMvpFiveGatePanel() && typeof L1KnowledgeCard !== "undefined") {
      L1KnowledgeCard.bind(body, { switchGate, lessonId: lesson.lessonId });
    }
    bindSpeak(body);
    bindFooter(body, idx);
    if (d.isBranch) {
      body.querySelectorAll(".dg-choice-row").forEach((row) => {
        row.addEventListener("click", (e) => {
          if (e.target.closest(".btn-speak-icon")) return;
          branchChoiceId = row.dataset.choice;
          dialogueIndex = Number(row.dataset.branchIdx);
          fillSceneFoldBody(det);
        });
      });
    }
  }

  function bindSceneAccordion() {
    if (typeof Lesson1Flow !== "undefined" && Lesson1Flow.bindSingleOpenAccordion) {
      Lesson1Flow.bindSingleOpenAccordion(container, fillSceneFoldBody);
      return;
    }
    const folds = container.querySelectorAll(sceneFoldSelector());
    const syncFoldChevron = (det) => {
      const slot = det.querySelector(".hyo-fold-slot");
      if (slot && typeof HyougaGlyphs !== "undefined") {
        slot.innerHTML = det.open ? HyougaGlyphs.foldUpInner(2) : HyougaGlyphs.foldDownInner(2);
      }
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
          fillSceneFoldBody(det);
        }
        syncFoldChevron(det);
      });
      syncFoldChevron(det);
    });
  }

  function renderFooter(scopeEl, idx) {
    const i = idx != null ? idx : dialogueIndex;
    if (l1Flow || useUnit1SceneFooter()) {
      return `
      <div class="dg-l1-scene-actions" data-scene-footer="${i}">
        <button type="button" class="btn secondary dg-scene-done" data-scene-done="${i}">本句听完 ✓</button>
      </div>`;
    }
    const hasNext = i < dialogues.length - 1;
    const hint = isL1Dialogue()
      ? "先读 A（课文），再对比 B/C · 跟读练完点「本句听完」"
      : "展开每一行 · 听完点「本句听完」";
    return `
      <div class="dg-footer-actions" data-scene-footer="${i}">
        <button type="button" class="btn primary dg-scene-done" data-scene-done="${i}">本句听完 ✓</button>
        ${hasNext ? `<button type="button" class="btn secondary dg-next-scene" data-next-scene="${i}">下一句 →</button>` : ""}
      </div>
      <p class="hint-ja dg-hint-compact">${escapeHtml(hint)}</p>`;
  }

  function bindFooter(scopeEl, idx) {
    const root = scopeEl || container;
    const i = idx != null ? idx : dialogueIndex;
    root.querySelector(`[data-scene-done="${i}"]`)?.addEventListener("click", () => {
      dialogueIndex = i;
      dialogue = dialogues[i];
      markSceneDone();
    });
    root.querySelector(`[data-next-scene="${i}"]`)?.addEventListener("click", () => {
      dialoguePassed[i] = true;
      const next = i + 1;
      if (next < dialogues.length) {
        const folds = container.querySelectorAll(sceneFoldSelector());
        folds.forEach((f, j) => {
          f.open = j === next;
        });
        switchDialogue(next);
        const openFold = container.querySelector(`${sceneFoldSelector()}[data-didx="${next}"]`);
        if (openFold) fillSceneFoldBody(openFold);
      }
    });
  }

  function markSceneDone() {
    dialoguePassed[dialogueIndex] = true;
    const det = container?.querySelector(`${sceneFoldSelector()}[data-didx="${dialogueIndex}"]`);
    if (det) {
      const sum = det.querySelector(l1AccordionMode() ? ".gw-group-summary" : ".dg-scene-fold-summary");
      if (sum) {
        const prefix = l1Flow && !isMvpFiveGatePanel() ? "💬 " : "";
        sum.innerHTML = prefix + sceneFoldSummary(dialogues[dialogueIndex], dialogueIndex);
      }
    }
    if (isMvpFiveGatePanel() || l1Flow) {
      updateL1Footer();
      if (isMvpFiveGatePanel() && allDialoguesPassed()) {
        setGateDone(state, lesson.lessonId, 2);
        saveMvpState(state);
      }
      return;
    }
    if (allDialoguesPassed()) {
      setGateDone(state, lesson.lessonId, 2);
      onComplete?.();
      return;
    }
    const next = dialogues.findIndex((_, i) => !dialoguePassed[i]);
    if (next >= 0) switchDialogue(next);
  }

  function renderIntroBlock() {
    const keyPoints = lesson.dialogueKeyPoints || [];
    const rolePlay = lesson.rolePlayTasks || [];
    if (!keyPoints.length && !rolePlay.length) return "";
    return `
        <details class="dg-intro-details">
          <summary class="dg-intro-summary">📖 会話のポイント</summary>
          <div class="dg-intro-body">
            ${keyPoints.length ? keyPoints.map((k) => `<p class="zh-annotation dg-kp-line">${escapeHtml(k)}</p>`).join("") : ""}
            ${rolePlay.length ? `<p class="dg-rp-title">🎭 ロールプレイ課題</p>${rolePlay.map((r) => `<p class="zh-annotation dg-rp-line">${escapeHtml(r)}</p>`).join("")}` : ""}
          </div>
        </details>`;
  }

  function render() {
    if (l1Flow && !isMvpFiveGatePanel()) {
      const chainFooter =
        typeof Lesson1Flow !== "undefined"
          ? Lesson1Flow.chainFooterHtml(2, {
              btnId: "dg-l1-done",
              disabled: true,
              buttonLabel: `会話完了（0/${dialogues.length}）`,
            })
          : `<div class="gn-footer"><button type="button" class="btn primary" id="dg-l1-done" disabled>会話完了（0/${dialogues.length}）</button></div>`;
      container.innerHTML = `
        <div class="gn-card-wrap l1-flow-wrap dg-l1-wrap l1-lesson-scope" data-l1-active-gate="2">
          <h2>第${lesson.lessonId}課 · 会話</h2>
          <p class="hint-ja">点开一句展开，其他句自动收起。A 🔊 → B 🎤；全部听完再点底部。</p>
          ${renderActionLegend()}
          ${renderSceneAccordion()}
          ${chainFooter}
          <p class="hint-ja">中文仅辅助理解；朗读只读日语。</p>
        </div>`;
      bindSceneAccordion();
      bindSpeak();
      container.querySelector("#dg-l1-done")?.addEventListener("click", () => {
        if (!allDialoguesPassed()) return;
        setGateDone(state, lesson.lessonId, 2);
        saveMvpState(state);
        onComplete?.();
      });
      updateL1Footer();
      return;
    }
    const l1Dlg = isMvpFiveGatePanel();
    if (l1Dlg && typeof Lesson1Flow !== "undefined") {
      container.innerHTML = Lesson1Flow.l1GatePanelHtml(renderSceneAccordion(), 2, {
        btnId: "dg-l1-done",
        done: 0,
        total: dialogues.length,
        ready: false,
        disabled: true,
        lessonId: lesson.lessonId,
      });
      bindSceneAccordion();
      bindSpeak();
      const panel = container.querySelector(".l1-gate-panel") || container;
      Lesson1Flow.finishGatePanelMount(panel, { switchGate, lessonId: lesson.lessonId });
      panel.querySelector("#dg-l1-done")?.addEventListener("click", () => {
        if (!allDialoguesPassed()) return;
        setGateDone(state, lesson.lessonId, 2);
        saveMvpState(state);
        if (switchGate) switchGate(1);
        else onComplete?.();
      });
      updateL1Footer();
      return;
    }
    container.innerHTML = `
      <div class="dg-wrap dg-simple dg-strips dg-scene-accordion">
        <p class="dg-label dg-label-compact">② ${dialogueModeLabel()}</p>
        ${renderIntroBlock()}
        ${renderSceneAccordion()}
        ${renderLegacyLink()}
      </div>`;
    bindSceneAccordion();
    bindSpeak();
  }

  function bindSpeak() {
    if (typeof SenseiTipCard !== "undefined") SenseiTipCard.bind(container);
    if (typeof ShadowSpeak !== "undefined") ShadowSpeak.bind(container);
    else if (typeof SpeakUI !== "undefined") SpeakUI.bind(container);
  }

  return { mount };
})();
