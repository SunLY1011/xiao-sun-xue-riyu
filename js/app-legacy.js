(function () {
  let state = loadState();
  let activeScenarioId = null;

  const titles = {
    scenarios: "情景日语",
    "scenario-play": "情景练习",
    home: "课文",
    lesson: "课文",
    practice: "练习",
    chat: "AI 对话",
    me: "我的",
    mistakes: "错题本",
    progress: "学习进度",
    settings: "设置",
  };

  const ringMe = document.getElementById("ring-fill-me");
  const circumference = 2 * Math.PI * 52;

  window.AppNav = function (view, lessonId) {
    if (lessonId) {
      state.currentLesson = Number(lessonId);
      saveState(state);
    }
    if (view === "scenarios" && lessonId) {
      const scenes = getScenariosForLesson(Number(lessonId));
      if (scenes[0]) {
        openScenario(scenes[0].id);
        return;
      }
    }
    showView(view);
  };

  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(`view-${name}`)?.classList.add("active");
    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("active", n.dataset.view === name);
    });
    const mainNav = ["scenarios", "home", "practice", "me"];
    document.querySelector(".bottom-nav").style.display = mainNav.includes(name) ? "flex" : "none";
    document.getElementById("page-title").textContent = titles[name] || "情景日语";

    if (name === "scenarios") renderScenarios();
    if (name === "scenario-play" && activeScenarioId) startScenario(activeScenarioId);
    if (name === "home") renderLessonGrid();
    if (name === "lesson") renderLesson();
    if (name === "me") renderMe();
    if (name === "mistakes") renderMistakes();
    if (name === "progress") renderProgress();
    if (name === "practice") renderPractice();
    if (name === "chat") renderChat();
  }

  function setRing(el, pctEl, percent) {
    if (!el) return;
    const offset = circumference - (percent / 100) * circumference;
    el.style.strokeDasharray = String(circumference);
    el.style.strokeDashoffset = String(offset);
    if (pctEl) pctEl.textContent = percent;
  }

  function getScenarioPreview(sc) {
    const step = (sc.steps || []).find((s) => (s.jp || "").trim());
    return step?.jp?.trim() || "";
  }

  function renderScenarios() {
    const list = document.getElementById("scenario-list");
    list.innerHTML = "";

    if (typeof SCENARIOS === "undefined" || !SCENARIOS.length) {
      list.innerHTML = `<div class="load-error">
        <strong>场景列表未加载</strong>
        请勿直接双击打开 index.html。请双击运行：
        <code>打开本地预览.bat</code>
        然后在浏览器访问 localhost:8765
      </div>`;
      return;
    }

    try {
      WordGuide.buildDict();
    } catch (e) {
      console.warn("WordGuide", e);
    }

    const mins = Math.min(99, (state.stats?.speak || 0) + (state.stats?.listen || 0));
    const streakEl = document.getElementById("duo-streak");
    if (streakEl) streakEl.textContent = `🔥 已练 ${mins} 句 · 继续加油`;

    SCENARIOS.forEach((sc) => {
      const done = state.scenarioProgress?.[sc.id]?.completed;
      const preview = getScenarioPreview(sc);
      const card = document.createElement("article");
      card.className = "scenario-card" + (done ? " done" : "");
      card.innerHTML = `
        <div class="sc-card-top">
          <span class="sc-emoji">${sc.emoji || "🗾"}</span>
          <span class="sc-info">
            <strong>${escapeHtml(sc.title)}</strong>
            <small>第${sc.lessonId}课 · ${escapeHtml(sc.place || "")} · ${escapeHtml(sc.desc || "")}</small>
          </span>
        </div>
        ${preview ? `<p class="sc-preview">${escapeHtml(preview)}</p>` : ""}
        <div class="sc-card-actions">
          <button type="button" class="btn-listen">🔊 听一句</button>
          <button type="button" class="btn-start">${done ? "再练一次" : "开始"}</button>
        </div>
      `;
      card.querySelector(".btn-listen").addEventListener("click", (e) => {
        e.stopPropagation();
        if (preview) SpeechEngine.speakJa(preview);
      });
      card.querySelector(".btn-start").addEventListener("click", () => openScenario(sc.id));
      list.appendChild(card);
    });

    const chips = document.getElementById("lesson-chips");
    chips.innerHTML = "";
    LESSONS.forEach((l) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = `${l.id}. ${l.theme}`;
      b.onclick = () => {
        const scenes = getScenariosForLesson(l.id);
        if (scenes[0]) openScenario(scenes[0].id);
      };
      chips.appendChild(b);
    });
  }

  function openScenario(id) {
    activeScenarioId = id;
    showView("scenario-play");
  }

  function startScenario(id) {
    ScenarioPlayer.setState(state);
    ScenarioPlayer.mount(document.getElementById("scenario-player-root"), id, {
      onComplete: () => {
        activeScenarioId = null;
        showView("scenarios");
        renderScenarios();
      },
    });
  }

  function renderLessonGrid() {
    const grid = document.getElementById("lesson-grid");
    grid.innerHTML = "";
    LESSONS.forEach((l) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-btn";
      btn.innerHTML = `<strong>${l.id}</strong><small>${l.theme}</small>`;
      btn.onclick = () => {
        state.currentLesson = l.id;
        saveState(state);
        showView("lesson");
      };
      grid.appendChild(btn);
    });
  }

  function renderMe() {
    const pct = overallPercent(state);
    setRing(ringMe, document.getElementById("overall-percent-me"), pct);
    const s = state.stats || {};
    document.getElementById("stat-grid-me").innerHTML = `
      <div class="stat-item"><strong>${s.listen || 0}</strong><span>听</span></div>
      <div class="stat-item"><strong>${s.speak || 0}</strong><span>说</span></div>
      <div class="stat-item"><strong>${s.read || 0}</strong><span>读</span></div>
      <div class="stat-item"><strong>${s.write || 0}</strong><span>写</span></div>`;
    document.querySelectorAll(".me-link").forEach((btn) => {
      btn.onclick = () => showView(btn.dataset.go);
    });
  }

  function renderLesson() {
    LessonView.render(document.getElementById("lesson-detail"), state.currentLesson);
  }

  function renderPractice() {
    const sel = document.getElementById("practice-lesson");
    sel.innerHTML = LESSONS.map(
      (l) => `<option value="${l.id}" ${l.id === state.currentLesson ? "selected" : ""}>${l.title} ${l.theme}</option>`
    ).join("");
    Practice.setState(state);
    Practice.setLesson(state.currentLesson);
    Practice.render(document.getElementById("practice-card"));
  }

  function renderChat() {
    Chat.setState(state);
    const sel = document.getElementById("chat-lesson");
    sel.innerHTML = LESSONS.map(
      (l) => `<option value="${l.id}" ${l.id === state.currentLesson ? "selected" : ""}>${l.title}</option>`
    ).join("");
    Chat.renderMessages(document.getElementById("chat-messages"), state.currentLesson);
  }

  function renderMistakes() {
    const list = document.getElementById("mistake-list");
    const empty = document.getElementById("mistakes-empty");
    list.innerHTML = "";
    if (!state.mistakes.length) {
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    const modeNames = { listen: "听", speak: "说", read: "读", write: "写" };
    state.mistakes.forEach((m) => {
      const li = document.createElement("li");
      li.className = "mistake-item";
      li.innerHTML = `
        <div class="meta">第${m.lessonId}课 · ${modeNames[m.mode] || m.mode}</div>
        <div class="q">${escapeHtml(m.question)}</div>
        <div class="a">你的：${escapeHtml(m.yourAnswer)} → 正确：${escapeHtml(m.correctAnswer)}</div>
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "删除";
      del.onclick = () => {
        removeMistake(state, m.id);
        renderMistakes();
      };
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function renderProgress() {
    const el = document.getElementById("progress-detail");
    const total = state.stats?.total || 0;
    const correct = state.stats?.correct || 0;
    const acc = total ? Math.round((correct / total) * 100) : 0;
    const scDone = Object.values(state.scenarioProgress || {}).filter((p) => p.completed).length;
    let html = `<div class="hero-card" style="margin-bottom:16px">
      <p>情景完成 ${scDone} 个 · 练习 ${total} 次 · 正确率 ${acc}%</p></div>`;
    LESSONS.forEach((l) => {
      const p = getLessonProgress(state, l.id);
      html += `<div class="lesson-bar"><div class="bar-header"><span>${l.title}</span><span>${p.percent}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${p.percent}%"></div></div></div>`;
    });
    el.innerHTML = html;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  document.getElementById("btn-share").onclick = () => {
    location.href = "share.html";
  };

  document.getElementById("btn-deploy-help")?.addEventListener("click", () => {
    const msg =
      "【Netlify 部署】\n" +
      "1. 双击「打开Netlify拖拽部署.bat」\n" +
      "2. 把整个「日语学习」文件夹拖进网页\n" +
      "3. 得到 https://xxx.netlify.app 后发微信\n\n" +
      "详细步骤见：Netlify部署指南.txt";
    if (confirm(msg + "\n\n是否现在打开分享页？")) location.href = "share.html";
  });

  document.getElementById("btn-settings").onclick = () => {
    document.getElementById("api-base").value = state.settings?.apiBase || "";
    document.getElementById("api-key").value = state.settings?.apiKey || "";
    document.getElementById("api-model").value = state.settings?.apiModel || "";
    showView("settings");
  };

  document.getElementById("btn-save-settings").onclick = () => {
    state.settings = {
      apiBase: document.getElementById("api-base").value.trim() || "https://api.openai.com/v1",
      apiKey: document.getElementById("api-key").value.trim(),
      apiModel: document.getElementById("api-model").value.trim() || "gpt-4o-mini",
    };
    saveState(state);
    alert("已保存");
    showView("me");
  };

  document.getElementById("btn-clear-data").onclick = () => {
    if (confirm("清空所有进度？")) {
      clearAllData();
      state = loadState();
      showView("me");
    }
  };

  document.getElementById("practice-lesson")?.addEventListener("change", (e) => {
    state.currentLesson = Number(e.target.value);
    saveState(state);
    renderPractice();
  });

  document.querySelectorAll(".practice-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".practice-tabs .tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Practice.setState(state);
      Practice.setMode(tab.dataset.mode);
      Practice.render(document.getElementById("practice-card"));
    });
  });

  document.getElementById("chat-lesson")?.addEventListener("change", (e) => {
    state.currentLesson = Number(e.target.value);
    saveState(state);
    Chat.setState(state);
    Chat.renderMessages(document.getElementById("chat-messages"), state.currentLesson);
  });

  document.getElementById("chat-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    Chat.setState(state);
    await Chat.send(document.getElementById("chat-messages"), state.currentLesson, text);
  });

  Practice.setState(state);
  Chat.setState(state);

  try {
    if (typeof LESSONS === "undefined") throw new Error("LESSONS missing");
    if (typeof SCENARIOS === "undefined") throw new Error("SCENARIOS missing");
    WordGuide.buildDict();
    showView("scenarios");
  } catch (err) {
    console.error(err);
    const list = document.getElementById("scenario-list");
    if (list) {
      list.innerHTML = `<div class="load-error"><strong>启动失败</strong>${escapeHtml(err.message)}<code>请运行「打开本地预览.bat」</code></div>`;
    }
  }
})();
