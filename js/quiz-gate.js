const QuizGate = (() => {
  let lesson = null;
  let qIndex = 0;
  let container = null;
  let state = null;
  let onComplete = null;
  let l1Scope = false;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function showZh() {
    return state?.showChineseZh !== false;
  }

  function resolveQuestionTts(q) {
    const tts = (q.questionTts || "").trim();
    if (tts) return tts;
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.prepareJaTtsLine) {
      return SpeechEngine.prepareJaTtsLine(q.question || "");
    }
    return (q.question || "").replace(/[＿_…]+/g, "").trim();
  }

  /** 题干 🔊 只读完整句 questionTts，不读带 ＿ 的显示题干 */
  function questionSpeakPayload(q) {
    const tts = resolveQuestionTts(q);
    return { ttsLine: tts, onlyTtsLine: true, questionTts: tts };
  }

  function optionSpeakPayload(text) {
    const kana =
      typeof QUIZ_OPTION_KANA !== "undefined" && QUIZ_OPTION_KANA[text]
        ? QUIZ_OPTION_KANA[text]
        : text;
    return { ttsLine: kana, onlyTtsLine: true, jp: text, kana };
  }

  function warmQuizQuestion(q) {
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.warmPhrases) return;
    const lines = [resolveQuestionTts(q)];
    q.options?.forEach((opt) => {
      const kana =
        typeof QUIZ_OPTION_KANA !== "undefined" && QUIZ_OPTION_KANA[opt] ? QUIZ_OPTION_KANA[opt] : opt;
      lines.push(kana);
    });
    SpeechEngine.warmPhrases(lines);
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onComplete = options.onComplete;
    lesson = getLessonMvp(lessonId);
    qIndex = 0;
    render();
  }

  function renderChoiceOptions(q) {
    const zhList = q.optionsZh || [];
    return q.options
      .map((opt, i) => {
        const speak =
          typeof SpeakUI !== "undefined"
            ? SpeakUI.btnHtml(optionSpeakPayload(opt), `class="qz-opt-speak" data-opt-i="${i}"`)
            : "";
        const optZh =
          showZh() && zhList[i]
            ? `<p class="qz-opt-zh zh-annotation">${escapeHtml(zhList[i])}</p>`
            : "";
        return `<div class="qz-opt-item">
          <div class="qz-opt-top">
            <button type="button" class="qz-opt" data-i="${i}">${escapeHtml(opt)}</button>
            ${speak}
          </div>
          ${optZh}
        </div>`;
      })
      .join("");
  }

  function render() {
    const questions = lesson.quizQuestions;
    if (qIndex >= questions.length) {
      setGateDone(state, lesson.lessonId, 3);
      const doneCls = l1Scope
        ? ' class="qz-wrap qz-wrap--l1-scope l1-lesson-scope celebrate" data-l1-active-gate="3"'
        : ' class="qz-wrap celebrate"';
      container.innerHTML = `
        <div${doneCls}>
          <span class="big-emoji">✅</span>
          <h3>3つの関クリア！</h3>
          <p class="hint-ja">まちがえた問題は「復習」に入ります（1・3・7日目）。</p>
          <button type="button" class="btn primary" id="qz-back">ホームへ</button>
        </div>
      `;
      container.querySelector("#qz-back").onclick = () => onComplete?.(true);
      return;
    }

    const q = questions[qIndex];
    const questionZh =
      showZh() && q.questionZh
        ? `<p class="qz-question-zh zh-annotation">${escapeHtml(q.questionZh)}</p>`
        : "";

    let body = "";
    if (q.type === "choice") {
      body = `<div class="qz-options">${renderChoiceOptions(q)}</div>`;
    } else {
      body = `<input type="text" class="qz-input" id="qz-fill" placeholder="答えを入力" autocomplete="off" />
        <button type="button" class="btn primary" id="qz-submit">送信</button>`;
    }

    const speakQ =
      typeof SpeakUI !== "undefined" ? SpeakUI.btnHtml(questionSpeakPayload(q), 'class="qz-q-speak"') : "";

    const scopeAttr = l1Scope ? ' class="qz-wrap qz-wrap--l1-scope l1-lesson-scope" data-l1-active-gate="3"' : ' class="qz-wrap"';
    container.innerHTML = `
      <div${scopeAttr}>
        <div class="qz-nav">
          <button type="button" class="btn secondary" id="qz-prev" ${qIndex === 0 ? "disabled" : ""}>← 上一题</button>
          <span class="qz-progress">問題 ${qIndex + 1} / ${questions.length}</span>
          <button type="button" class="btn secondary" id="qz-next" ${qIndex >= questions.length - 1 ? "disabled" : ""}>下一题 →</button>
        </div>
        <div class="qz-question-block">
          <div class="qz-question-row">
            <p class="qz-question jp">${escapeHtml(q.question)}</p>
            ${speakQ}
          </div>
          ${questionZh}
        </div>
        <p class="hint-ja qz-speak-hint">题干 🔊 读完整日文句；各选项旁 🔊 可重复听</p>
        ${body}
        <div id="qz-feedback"></div>
      </div>
    `;

    warmQuizQuestion(q);
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(container);

    container.querySelector("#qz-prev")?.addEventListener("click", () => {
      if (qIndex > 0) {
        qIndex--;
        render();
      }
    });
    container.querySelector("#qz-next")?.addEventListener("click", () => {
      if (qIndex < questions.length - 1) {
        qIndex++;
        render();
      }
    });

    if (q.type === "choice") {
      container.querySelectorAll(".qz-opt").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          grade(String(btn.dataset.i), q);
        };
      });
    } else {
      container.querySelector("#qz-submit").onclick = () => {
        const val = container.querySelector("#qz-fill").value.trim();
        grade(val, q);
      };
    }
  }

  function normalize(s) {
    return (s || "").trim().replace(/\s+/g, "");
  }

  function grade(userRaw, q) {
    const feedback = container.querySelector("#qz-feedback");
    let ok = false;
    if (q.type === "choice") {
      ok = Number(userRaw) === q.answer;
    } else {
      ok = normalize(userRaw) === normalize(q.answer);
    }
    const correctText = q.type === "choice" ? q.options[q.answer] : q.answer;

    const senseiTip =
      typeof SenseiTipCard !== "undefined"
        ? SenseiTipCard.fromNotes(q.explanation, q.explanationZh, { expanded: true })
        : `<p class="hint-ja">${escapeHtml(q.explanation)}</p>
        ${showZh() && q.explanationZh ? `<p class="zh-annotation">${escapeHtml(q.explanationZh)}</p>` : ""}`;

    if (ok) {
      feedback.innerHTML = `<p class="feedback ok">✅ せいかい！</p>
        ${senseiTip}
        <button type="button" class="btn primary" id="qz-next-answer">次へ</button>`;
    } else {
      feedback.innerHTML = `<p class="feedback err">❌ ざんねん。正解は「${escapeHtml(correctText)}」です。</p>
        ${senseiTip}
        <button type="button" class="btn primary" id="qz-next-answer">次へ</button>`;
      addMvpMistake(state, {
        lessonId: lesson.lessonId,
        questionId: q.id,
        question: q.question,
        userAnswer: q.type === "choice" ? q.options[Number(userRaw)] || userRaw : userRaw,
        correctAnswer: correctText,
        explanation: q.explanation,
        grammarNodeId: q.grammarNodeId,
      });
    }
    if (typeof SenseiTipCard !== "undefined") SenseiTipCard.bind(feedback);
    feedback.querySelector("#qz-next-answer").onclick = () => {
      qIndex++;
      render();
    };
  }

  return { mount };
})();
