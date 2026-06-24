const ScenarioPlayer = (() => {
  let state = null;
  let scenario = null;
  let stepIndex = 0;
  let container = null;
  let onComplete = null;

  function setState(s) {
    state = s;
  }

  function saveProgress() {
    if (!scenario) return;
    if (!state.scenarioProgress) state.scenarioProgress = {};
    state.scenarioProgress[scenario.id] = {
      stepIndex,
      completed: stepIndex >= scenario.steps.length,
      at: Date.now(),
    };
    saveState(state);
  }

  function mount(el, scenarioId, callbacks) {
    container = el;
    onComplete = callbacks?.onComplete;
    scenario = getScenario(scenarioId) || getScenariosForLesson(Number(scenarioId))[0];
    if (!scenario && scenarioId.startsWith("l")) {
      const lid = Number(scenarioId.replace(/\D/g, ""));
      scenario = getScenariosForLesson(lid)[0];
    }
    if (!scenario) {
      container.innerHTML = "<p class='hint'>情景未找到</p>";
      return;
    }
    const prog = state.scenarioProgress?.[scenario.id];
    stepIndex = prog?.completed ? 0 : prog?.stepIndex || 0;
    WordGuide.buildDict();
    renderShell();
    renderStep();
  }

  function renderShell() {
    container.innerHTML = `
      <div class="scenario-player">
        <div class="scenario-top">
          <button type="button" class="btn-back" id="sc-back">← 返回</button>
          <span class="scenario-progress" id="sc-prog"></span>
        </div>
        <div class="scenario-stage" id="sc-stage"></div>
        <div class="scenario-footer" id="sc-footer"></div>
      </div>
    `;
    container.querySelector("#sc-back").onclick = () => {
      if (window.AppNav) window.AppNav("scenarios");
    };
  }

  function renderStep() {
    const stage = container.querySelector("#sc-stage");
    const footer = container.querySelector("#sc-footer");
    const prog = container.querySelector("#sc-prog");
    const steps = scenario.steps;
    prog.textContent = `${stepIndex + 1} / ${steps.length} · ${scenario.title}`;

    if (stepIndex >= steps.length) {
      stage.innerHTML = `<div class="celebrate-box"><span class="big-emoji">🎉</span><h2>情景完成！</h2><p>口语互动 +1</p></div>`;
      footer.innerHTML = `<button type="button" class="btn primary" id="sc-done">继续探索其他情景</button>`;
      state.stats.speak = (state.stats.speak || 0) + 1;
      saveState(state);
      saveProgress();
      footer.querySelector("#sc-done").onclick = () => onComplete?.();
      return;
    }

    const step = steps[stepIndex];
    footer.innerHTML = "";

    if (step.type === "scene") {
      stage.innerHTML = `
        <div class="scene-card">
          <span class="scene-emoji">${step.bg || "🗾"}</span>
          <p>${escape(step.text)}</p>
          <p class="place-tag">${escape(scenario.place)}</p>
        </div>`;
      footer.innerHTML = `<button type="button" class="btn primary sc-next">进入情景</button>`;
      footer.querySelector(".sc-next").onclick = () => next();
      return;
    }

    if (step.type === "tier") {
      stage.innerHTML = `
        <div class="tier-card">
          <span class="tier-badge">第 ${step.level} 层</span>
          <strong>${escape(step.label)}</strong>
          ${step.mood ? `<p class="tier-mood">${escape(step.mood)}</p>` : ""}
          ${step.zh ? `<p class="zh-sub">${escape(step.zh)}</p>` : ""}
        </div>`;
      footer.innerHTML = `<button type="button" class="btn primary sc-next">进入这一层</button>`;
      footer.querySelector(".sc-next").onclick = () => next();
      return;
    }

    if (step.type === "transition") {
      stage.innerHTML = `
        <div class="transition-card">
          <span class="scene-emoji">${step.bg || "➡️"}</span>
          <p class="transition-place">${escape(step.place)}</p>
          <p>${escape(step.text)}</p>
        </div>`;
      footer.innerHTML = `<button type="button" class="btn primary sc-next">继续</button>`;
      footer.querySelector(".sc-next").onclick = () => next();
      return;
    }

    if (step.type === "npc") {
      stage.innerHTML = `
        <div class="role-badge">${escape(step.role)}</div>
        <div class="bubble npc" id="sc-bubble"></div>
        <p class="zh-sub">${escape(step.zh || "")}</p>
      `;
      const bubble = stage.querySelector("#sc-bubble");
      WordGuide.renderInteractive(bubble, step.jp, step.words);
      footer.innerHTML = `
        <button type="button" class="btn secondary" id="sc-play">🔊 再听一遍</button>
        <button type="button" class="btn primary sc-next">继续</button>`;
      footer.querySelector("#sc-play").onclick = () => SpeechEngine.speakJa(step.jp);
      footer.querySelector(".sc-next").onclick = () => next();
      SpeechEngine.speakJa(step.jp);
      return;
    }

    if (step.type === "guide") {
      stage.innerHTML = `
        <div class="guide-card">
          <p class="guide-icon">💡</p>
          <p>${escape(step.text)}</p>
          ${step.hint ? `<p class="hint-jp">${escape(step.hint)}</p>` : ""}
        </div>`;
      footer.innerHTML = `<button type="button" class="btn primary sc-next">准备好了</button>`;
      footer.querySelector(".sc-next").onclick = () => next();
      return;
    }

    if (step.type === "celebrate") {
      stage.innerHTML = `<div class="celebrate-box"><span class="big-emoji">✨</span><p>${escape(step.text)}</p></div>`;
      footer.innerHTML = `<button type="button" class="btn primary sc-next">继续</button>`;
      footer.querySelector(".sc-next").onclick = () => next();
      return;
    }

    if (step.type === "choice") {
      stage.innerHTML = `<p class="choice-prompt">${escape(step.prompt)}</p><div class="choice-list" id="sc-choices"></div>`;
      const list = stage.querySelector("#sc-choices");
      step.options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn";
        b.innerHTML = `<span class="jp">${escape(opt.jp)}</span><span class="zh">${escape(opt.zh)}</span>`;
        b.onclick = () => {
          if (opt.correct !== false) {
            b.classList.add("correct");
            if (opt.route && scenario.kind === "branch" && scenario.segments?.[opt.route]) {
              const base = scenario._branchBase || scenario;
              scenario = resolveBranchChoice(base, opt.route);
              scenario._branchBase = base;
              stepIndex = base.branchAt;
              saveProgress();
              setTimeout(() => renderStep(), 400);
              return;
            }
            setTimeout(() => next(), 600);
          } else {
            b.classList.add("wrong");
            showFeedback(stage, false, opt.tip || "再想想，选另一个试试。");
          }
        };
        list.appendChild(b);
      });
      return;
    }

    if (step.type === "speak") {
      renderSpeakStep(stage, footer, step);
    }
  }

  function renderSpeakStep(stage, footer, step) {
    stage.innerHTML = `
      <p class="speak-label">🎤 你的回合 · 按住下方按钮说话</p>
      <div class="bubble user-target" id="sc-target"></div>
      <p class="kana-line">${escape(step.kana || "")}</p>
      <p class="zh-sub">${escape(step.zh || "")}</p>
      <div id="sc-feedback"></div>
    `;
    WordGuide.renderInteractive(stage.querySelector("#sc-target"), step.jp, step.words);

    footer.innerHTML = `
      <button type="button" class="btn secondary" id="sc-play">🔊 听示范</button>
      <button type="button" class="hold-mic" id="sc-hold">按住 说话</button>
      <p class="hold-hint">松开结束录音 · 点单词可查读音</p>
    `;

    const feedback = stage.querySelector("#sc-feedback");
    footer.querySelector("#sc-play").onclick = () => SpeechEngine.speakJa(step.jp);

    const holdBtn = footer.querySelector("#sc-hold");
    let holdPromise = null;

    const onHoldStart = async (e) => {
      e.preventDefault();
      if (holdPromise) return;
      holdBtn.classList.add("recording");
      holdBtn.textContent = "松开 结束";
      feedback.innerHTML = `<p class="feedback listening">正在听你说…说完松开按钮</p>`;
      try {
        holdPromise = SpeechEngine.startHoldListen();
      } catch (err) {
        holdPromise = null;
        holdBtn.classList.remove("recording");
        holdBtn.textContent = "按住 说话";
        if (err?.message === "NO_SR") {
          feedback.innerHTML = `<p class="feedback err">请用 iPhone Safari 打开。也可点下方跳过。</p>`;
          if (!footer.querySelector("#sc-skip")) {
            const sk = document.createElement("button");
            sk.type = "button";
            sk.className = "btn ghost";
            sk.id = "sc-skip";
            sk.textContent = "我听懂了，继续";
            sk.onclick = () => next();
            footer.appendChild(sk);
          }
        }
      }
    };

    const onHoldEnd = async (e) => {
      e.preventDefault();
      if (!holdPromise) return;
      SpeechEngine.stopHoldListen();
      holdBtn.classList.remove("recording");
      holdBtn.textContent = "按住 说话";
      try {
        const heard = await holdPromise;
        holdPromise = null;
        const result = SpeechEngine.scorePronunciation(step.jp, heard, step.keywords || []);
        if (result.ok) {
          feedback.innerHTML = `<p class="feedback ok">✓ 很棒！得分 ${result.score}${heard ? " · " + escape(heard) : ""}</p>`;
          state.stats.speak = (state.stats.speak || 0) + 1;
          state.stats.correct = (state.stats.correct || 0) + 1;
          state.stats.total = (state.stats.total || 0) + 1;
          saveState(state);
          const nxt = document.createElement("button");
          nxt.type = "button";
          nxt.className = "btn primary sc-next";
          nxt.style.cssText = "margin-top:10px;width:100%";
          nxt.textContent = "下一环节 →";
          nxt.onclick = () => next();
          footer.appendChild(nxt);
        } else {
          showSpeakGuide(feedback, stage, step, heard, result);
          recordMistake(step, heard);
        }
      } catch (err) {
        holdPromise = null;
        feedback.innerHTML = `<p class="feedback err">没听清，按住按钮再试一次。</p>`;
      }
    };

    holdBtn.addEventListener("touchstart", onHoldStart, { passive: false });
    holdBtn.addEventListener("touchend", onHoldEnd);
    holdBtn.addEventListener("touchcancel", onHoldEnd);
    holdBtn.addEventListener("mousedown", onHoldStart);
    holdBtn.addEventListener("mouseup", onHoldEnd);
    holdBtn.addEventListener("mouseleave", onHoldEnd);

    SpeechEngine.speakJa(step.jp);
  }

  function showSpeakGuide(feedback, stage, step, heard, result) {
    feedback.innerHTML = `
      <p class="feedback err">得分 ${result.score} · ${result.tip}</p>
      <div class="guide-box">
        <p><strong>你说了：</strong>${escape(heard || "（未识别）")}</p>
        <p><strong>目标句：</strong></p>
        <div id="guide-target"></div>
        <p class="guide-text">📖 ${escape(step.guide || "")}</p>
        <p class="hint">点击上面日语单词，查看读法和意思</p>
      </div>
    `;
    WordGuide.renderInteractive(feedback.querySelector("#guide-target"), step.jp, step.words);
  }

  function recordMistake(step, heard) {
    addMistake(state, {
      lessonId: scenario.lessonId,
      mode: "speak",
      question: step.jp,
      yourAnswer: heard || "（未识别）",
      correctAnswer: step.jp,
    });
  }

  function showFeedback(stage, ok, msg) {
    let el = stage.querySelector("#sc-feedback");
    if (!el) {
      el = document.createElement("div");
      el.id = "sc-feedback";
      stage.appendChild(el);
    }
    el.innerHTML = `<p class="feedback ${ok ? "ok" : "err"}">${escape(msg)}</p>`;
  }

  function next() {
    stepIndex++;
    saveProgress();
    renderStep();
  }

  function escape(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  return { setState, mount };
})();
