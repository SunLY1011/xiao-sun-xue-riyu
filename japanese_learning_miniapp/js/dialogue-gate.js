const DialogueGate = (() => {
  let lesson = null;
  let dialogue = null;
  let lineIndex = 0;
  let phase = "preview";
  let userRole = "B";
  let container = null;
  let state = null;
  let onComplete = null;
  let recordUrl = null;
  let mediaRecorder = null;
  let recordChunks = [];
  let recordStream = null;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function pickMime() {
    if (typeof MediaRecorder === "undefined") return "";
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onComplete = options.onComplete;
    lesson = getLessonMvp(lessonId);
    dialogue = lesson.dialogues[0];
    lineIndex = 0;
    phase = "preview";
    recordUrl = null;
    render();
  }

  function userLines() {
    return dialogue.lines.filter((l) => l.speaker === userRole);
  }

  function render() {
    if (phase === "preview") renderPreview();
    else if (phase === "roleplay") renderRoleplay();
    else renderDone();
  }

  function renderPreview() {
    const rows = dialogue.lines
      .map(
        (l) => `
      <div class="dg-line ${l.speaker === userRole ? "dg-user" : ""}">
        <span class="dg-sp">${l.speaker}</span>
        <p class="jp">${RubyRender.lineJapanese(l)}</p>
        <p class="zh">${escapeHtml(l.chinese)}</p>
        <button type="button" class="btn-ghost-sm dg-play" data-jp="${escapeHtml(l.japanese)}">🔊</button>
      </div>`
      )
      .join("");

    container.innerHTML = `
      <div class="dg-wrap">
        <h3>${escapeHtml(dialogue.title)}</h3>
        <p class="hint">先通读对话，点 🔊 听标准音（浏览器朗读）</p>
        <div class="dg-script">${rows}</div>
        <button type="button" class="btn primary" id="dg-start">开始练习（扮演 B）</button>
      </div>
    `;
    container.querySelectorAll(".dg-play").forEach((btn) => {
      btn.onclick = () => SpeechEngine.speak(btn.dataset.jp);
    });
    container.querySelector("#dg-start").onclick = () => {
      phase = "roleplay";
      lineIndex = 0;
      render();
    };
  }

  function renderRoleplay() {
    const lines = dialogue.lines;
    if (lineIndex >= lines.length) {
      phase = "done";
      render();
      return;
    }
    const line = lines[lineIndex];
    const isUser = line.speaker === userRole;

    if (!isUser) {
      container.innerHTML = `
        <div class="dg-wrap">
          <p class="dg-step">第 ${lineIndex + 1} / ${lines.length} 句 · 听对方</p>
          <div class="dg-bubble npc">
            <span class="dg-sp">${line.speaker}</span>
            <p class="jp">${RubyRender.lineJapanese(line)}</p>
            <p class="zh">${escapeHtml(line.chinese)}</p>
          </div>
          <button type="button" class="btn secondary" id="dg-listen">🔊 再听一遍</button>
          <button type="button" class="btn primary" id="dg-continue">轮到你了 →</button>
        </div>
      `;
      container.querySelector("#dg-listen").onclick = () => SpeechEngine.speak(line.japanese);
      SpeechEngine.speak(line.japanese);
      container.querySelector("#dg-continue").onclick = () => {
        lineIndex++;
        render();
      };
      return;
    }

    container.innerHTML = `
      <div class="dg-wrap">
        <p class="dg-step">你的回合（角色 ${userRole}）</p>
        <div class="dg-bubble user">
          <p class="hint">请口述下面这句，然后录音回听自对比</p>
          <p class="jp dg-target">${RubyRender.lineJapanese(line)}</p>
          <p class="zh">${escapeHtml(line.chinese)}</p>
        </div>
        <div class="dg-record-bar">
          <button type="button" class="btn secondary" id="dg-rec">${recordUrl ? "重新录音" : "🎤 开始录音"}</button>
          <button type="button" class="btn secondary" id="dg-playback" ${recordUrl ? "" : "disabled"}>▶ 回听</button>
          <button type="button" class="btn secondary" id="dg-model">🔊 标准音</button>
        </div>
        <p id="dg-rec-status" class="hint"></p>
        <div class="dg-rate" id="dg-rate" hidden>
          <p>自我评价：</p>
          <button type="button" class="btn ghost" data-rate="again">还需练习</button>
          <button type="button" class="btn primary" data-rate="ok">已掌握</button>
        </div>
        <div class="dg-answer" id="dg-answer" hidden>
          <p class="hint">参考答案</p>
          <p class="jp">${RubyRender.lineJapanese(line)}</p>
        </div>
      </div>
    `;

    const status = container.querySelector("#dg-rec-status");
    const rateBox = container.querySelector("#dg-rate");
    const answerBox = container.querySelector("#dg-answer");

    container.querySelector("#dg-model").onclick = () => SpeechEngine.speak(line.japanese);

    container.querySelector("#dg-playback").onclick = () => {
      if (!recordUrl) return;
      const a = new Audio(recordUrl);
      a.play().catch(() => {});
    };

    container.querySelector("#dg-rec").onclick = async () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        return;
      }
      try {
        if (!recordStream) {
          recordStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        recordChunks = [];
        const mime = pickMime();
        mediaRecorder = mime
          ? new MediaRecorder(recordStream, { mimeType: mime })
          : new MediaRecorder(recordStream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size) recordChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordChunks, { type: mediaRecorder.mimeType || "audio/webm" });
          if (recordUrl) URL.revokeObjectURL(recordUrl);
          recordUrl = URL.createObjectURL(blob);
          container.querySelector("#dg-playback").disabled = false;
          status.textContent = "录好了，点「回听」对比，再选自我评价。";
          rateBox.hidden = false;
          answerBox.hidden = false;
          container.querySelector("#dg-rec").textContent = "重新录音";
        };
        mediaRecorder.start();
        status.textContent = "录音中… 再点一次结束";
        container.querySelector("#dg-rec").textContent = "⏹ 结束录音";
      } catch (e) {
        status.textContent = "无法使用麦克风，请用 Safari/Chrome 并允许录音。";
      }
    };

    rateBox.querySelectorAll("[data-rate]").forEach((btn) => {
      btn.onclick = () => {
        lineIndex++;
        recordUrl = null;
        rateBox.hidden = true;
        answerBox.hidden = true;
        render();
      };
    });
  }

  function renderDone() {
    container.innerHTML = `
      <div class="dg-wrap celebrate">
        <span class="big-emoji">🎉</span>
        <h3>对话练习完成！</h3>
        <button type="button" class="btn primary" id="dg-finish">进入第三关：快速测试</button>
      </div>
    `;
    container.querySelector("#dg-finish").onclick = () => {
      setGateDone(state, lesson.lessonId, 2);
      onComplete?.();
    };
  }

  return { mount };
})();
