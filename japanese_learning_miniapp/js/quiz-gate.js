const QuizGate = (() => {
  let lesson = null;
  let qIndex = 0;
  let container = null;
  let state = null;
  let onComplete = null;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onComplete = options.onComplete;
    lesson = getLessonMvp(lessonId);
    qIndex = 0;
    render();
  }

  function render() {
    const questions = lesson.quizQuestions;
    if (qIndex >= questions.length) {
      setGateDone(state, lesson.lessonId, 3);
      container.innerHTML = `
        <div class="qz-wrap celebrate">
          <span class="big-emoji">✅</span>
          <h3>本课三关全部完成！</h3>
          <p class="hint">错题已记入「复习」，第1/3/7天会提醒。</p>
          <button type="button" class="btn primary" id="qz-back">返回首页</button>
        </div>
      `;
      container.querySelector("#qz-back").onclick = () => onComplete?.(true);
      return;
    }

    const q = questions[qIndex];
    let body = "";
    if (q.type === "choice") {
      body = `<div class="qz-options">${q.options
        .map((opt, i) => `<button type="button" class="qz-opt" data-i="${i}">${escapeHtml(opt)}</button>`)
        .join("")}</div>`;
    } else {
      body = `<input type="text" class="qz-input" id="qz-fill" placeholder="请输入答案" autocomplete="off" />
        <button type="button" class="btn primary" id="qz-submit">提交</button>`;
    }

    container.innerHTML = `
      <div class="qz-wrap">
        <p class="qz-progress">第 ${qIndex + 1} / ${questions.length} 题</p>
        <p class="qz-question jp">${escapeHtml(q.question)}</p>
        ${body}
        <div id="qz-feedback"></div>
      </div>
    `;

    if (q.type === "choice") {
      container.querySelectorAll(".qz-opt").forEach((btn) => {
        btn.onclick = () => grade(String(btn.dataset.i), q);
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
    const correctText =
      q.type === "choice" ? q.options[q.answer] : q.answer;

    if (ok) {
      feedback.innerHTML = `<p class="feedback ok">✓ 正确！${escapeHtml(q.explanation)}</p>
        <button type="button" class="btn primary" id="qz-next">下一题</button>`;
    } else {
      feedback.innerHTML = `<p class="feedback err">再想想～ 正确答案：${escapeHtml(correctText)}</p>
        <p class="hint">${escapeHtml(q.explanation)}</p>
        <button type="button" class="btn primary" id="qz-next">下一题</button>`;
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
    feedback.querySelector("#qz-next").onclick = () => {
      qIndex++;
      render();
    };
  }

  return { mount };
})();
