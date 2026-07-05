const Practice = (() => {
  let state = null;
  let lessonId = 1;
  let mode = "listen";
  let index = 0;

  function setState(s) {
    state = s;
  }

  function setLesson(id) {
    lessonId = Number(id) || 1;
    index = 0;
  }

  function setMode(m) {
    mode = m;
    index = 0;
  }

  function speakJp(text) {
    if (typeof SpeechEngine !== "undefined") {
      SpeechEngine.speakJa(text);
    }
  }

  function normalize(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .toLowerCase();
  }

  function checkWrite(user, ex) {
    const n = normalize(user);
    if (normalize(ex.answer) === n) return true;
    return (ex.alt || []).some((a) => normalize(a) === n);
  }

  function render(card) {
    const lesson = getLesson(lessonId);
    const list = lesson.exercises[mode] || [];
    if (!list.length) {
      card.innerHTML = "<p class='hint'>本课暂无此类型练习。</p>";
      return;
    }
  const ex = list[index % list.length];
    const modeLabel = { listen: "听力", speak: "口语", read: "阅读", write: "书写" }[mode];

    if (mode === "listen") {
      card.innerHTML = `
        <h3>第${lesson.id}课 · ${modeLabel} · ${index + 1}/${list.length}</h3>
        <p class="hint">点击播放日语，再选择正确答案</p>
        <p class="jp">${ex.jp}</p>
        <p class="question">${ex.question}</p>
        <div class="options" id="opts"></div>
        <div class="practice-actions">
          <button type="button" class="btn secondary" id="btn-play">🔊 播放</button>
          <button type="button" class="btn secondary" id="btn-next" style="display:none">下一题</button>
        </div>
        <div id="feedback"></div>
      `;
      const opts = card.querySelector("#opts");
      ex.options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt-btn";
        b.textContent = opt;
        b.addEventListener("click", () => onChoice(card, ex, i, list));
        opts.appendChild(b);
      });
      card.querySelector("#btn-play").addEventListener("click", () => speakJp(ex.jp));
      speakJp(ex.jp);
      return;
    }

    if (mode === "read") {
      card.innerHTML = `
        <h3>第${lesson.id}课 · ${modeLabel}</h3>
        <pre class="passage" style="white-space:pre-wrap;font-size:15px;line-height:1.6;background:#f7f5f0;padding:12px;border-radius:8px">${ex.passage}</pre>
        <p>${ex.question}</p>
        <div class="options" id="opts"></div>
        <div id="feedback"></div>
      `;
      const opts = card.querySelector("#opts");
      ex.options.forEach((opt, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt-btn";
        b.textContent = opt;
        b.addEventListener("click", () => onChoice(card, ex, i, list));
        opts.appendChild(b);
      });
      return;
    }

    if (mode === "write") {
      card.innerHTML = `
        <h3>第${lesson.id}课 · ${modeLabel}</h3>
        <p class="jp" style="font-size:18px">${ex.prompt}</p>
        <input type="text" id="write-input" placeholder="输入日语…" autocomplete="off" />
        <div class="practice-actions">
          <button type="button" class="btn primary" id="btn-check">检查</button>
          <button type="button" class="btn secondary" id="btn-next" style="display:none">下一题</button>
        </div>
        <div id="feedback"></div>
      `;
      card.querySelector("#btn-check").addEventListener("click", () => {
        const val = card.querySelector("#write-input").value;
        const ok = checkWrite(val, ex);
        showFeedback(card, ok, ex.answer);
        recordExercise(state, lessonId, mode, ok);
        if (!ok) {
          addMistake(state, {
            lessonId,
            mode,
            question: ex.prompt,
            yourAnswer: val || "（未填）",
            correctAnswer: ex.answer,
          });
        }
        const nextBtn = card.querySelector("#btn-next");
        nextBtn.style.display = "inline-block";
        nextBtn.onclick = () => {
          index++;
          render(card);
        };
      });
      return;
    }

    if (mode === "speak") {
      card.innerHTML = `
        <h3>第${lesson.id}课 · ${modeLabel}</h3>
        <p class="jp">${ex.phrase}</p>
        <p class="hint">${ex.hint}</p>
        <div class="practice-actions">
          <button type="button" class="btn secondary" id="btn-play">🔊 示范</button>
          <button type="button" class="btn primary" id="btn-mic">🎤 开始跟读</button>
          <button type="button" class="btn secondary" id="btn-done">完成跟读</button>
        </div>
        <p class="hint" id="speak-status">iPhone 需在 Safari 中允许麦克风；识别可能不准确，以跟读为主。</p>
        <div id="feedback"></div>
      `;
      card.querySelector("#btn-play").addEventListener("click", () => speakJp(ex.phrase));
      card.querySelector("#btn-done").addEventListener("click", () => {
        recordExercise(state, lessonId, mode, true);
        showFeedback(card, true, "已记录一次口语练习");
        index++;
        setTimeout(() => render(card), 800);
      });
      const mic = card.querySelector("#btn-mic");
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        mic.addEventListener("click", () => {
          const rec = new SR();
          rec.lang = "ja-JP";
          rec.onresult = (e) => {
            const t = e.results[0][0].transcript;
            card.querySelector("#speak-status").textContent = `识别到：${t}`;
          };
          rec.onerror = () => {
            card.querySelector("#speak-status").textContent = "识别失败，可点「完成跟读」继续";
          };
          rec.start();
          card.querySelector("#speak-status").textContent = "正在听…";
        });
      } else {
        mic.style.display = "none";
      }
    }
  }

  function onChoice(card, ex, chosen, list) {
    const ok = chosen === ex.answer;
    const buttons = card.querySelectorAll(".opt-btn");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === ex.answer) b.classList.add("correct");
      if (i === chosen && !ok) b.classList.add("wrong");
    });
    const q = ex.question || ex.jp || "";
    const correctText = ex.options ? ex.options[ex.answer] : ex.answer;
    const yourText = ex.options ? ex.options[chosen] : "";
    showFeedback(card, ok, ok ? "正确！" : `正确答案：${correctText}`);
    recordExercise(state, lessonId, mode, ok);
    if (!ok) {
      addMistake(state, {
        lessonId,
        mode,
        question: q,
        yourAnswer: yourText,
        correctAnswer: correctText,
      });
    }
    let next = card.querySelector("#btn-next");
    if (!next) {
      const actions = card.querySelector(".practice-actions") || card;
      next = document.createElement("button");
      next.type = "button";
      next.className = "btn secondary";
      next.id = "btn-next";
      next.textContent = "下一题";
      actions.appendChild(next);
    }
    next.style.display = "inline-block";
    next.onclick = () => {
      index++;
      render(card);
    };
  }

  function showFeedback(card, ok, msg) {
    const el = card.querySelector("#feedback");
    if (!el) return;
    el.className = `feedback ${ok ? "ok" : "err"}`;
    el.textContent = msg;
  }

  return { setState, setLesson, setMode, render };
})();
