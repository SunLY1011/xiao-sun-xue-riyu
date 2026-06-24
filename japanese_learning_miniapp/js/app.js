(function () {
  let state = loadMvpState();
  let activeLessonId = null;
  let activeGate = 1;

  const titles = {
    home: "日语初级课后练习",
    lesson: "一课三关",
    review: "复习",
    me: "我的",
  };

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  window.AppNav = function (view, lessonId) {
    if (lessonId) {
      activeLessonId = Number(lessonId);
      state.lastLessonId = activeLessonId;
      saveMvpState(state);
    }
    showView(view);
  };

  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(`view-${name}`)?.classList.add("active");
    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("active", n.dataset.view === name);
    });
    document.querySelector(".bottom-nav").style.display =
      ["home", "review", "me"].includes(name) ? "flex" : "none";
    document.getElementById("page-title").textContent = titles[name] || "日语初级课后练习";

    if (name === "home") renderHome();
    if (name === "lesson") renderLessonFlow();
    if (name === "review") renderReview();
    if (name === "me") renderMe();
    updateReviewBadge();
  }

  function updateReviewBadge() {
    const n = dueMistakes(state).length;
    const badge = document.getElementById("review-badge");
    if (badge) {
      badge.hidden = n === 0;
      badge.textContent = n > 9 ? "9+" : String(n);
    }
  }

  function renderHome() {
    const grid = document.getElementById("lesson-cards");
    const weekEl = document.getElementById("home-week-count");
    const studied = state.studyDays.filter((d) => {
      const now = new Date();
      const wkAgo = new Date(now);
      wkAgo.setDate(wkAgo.getDate() - 6);
      return new Date(d) >= wkAgo;
    }).length;
    if (weekEl) weekEl.textContent = `本周已学 ${studied} 天`;

    grid.innerHTML = "";
    LESSONS_MVP.forEach((L) => {
      const g = state.lessons[L.lessonId] || {};
      const gates = [
        { k: 1, done: g.gate1, label: "语法网络" },
        { k: 2, done: g.gate2, label: "情景对话" },
        { k: 3, done: g.gate3, label: "快速测试" },
      ];
      const card = document.createElement("article");
      card.className = "lesson-card-mvp";
      card.innerHTML = `
        <div class="lc-head">
          <span class="lc-num">第${L.lessonId}课</span>
          ${L.lessonId === 16 ? '<span class="lc-badge">深度语法网</span>' : ""}
        </div>
        <h3>${escapeHtml(L.lessonTitle)}</h3>
        <p class="lc-theme">${escapeHtml(L.theme)}</p>
        <ul class="lc-gates">
          ${gates.map((x) => `<li class="${x.done ? "done" : ""}">${x.done ? "✅" : "⬜"} ${x.label}</li>`).join("")}
        </ul>
        <button type="button" class="btn primary">开始 / 继续</button>
      `;
      card.querySelector("button").onclick = () => {
        activeLessonId = L.lessonId;
        activeGate = gates.find((x) => !x.done)?.k || 1;
        saveMvpState(state);
        showView("lesson");
      };
      grid.appendChild(card);
    });
  }

  function renderLessonFlow() {
    const L = getLessonMvp(activeLessonId);
    if (!L) {
      showView("home");
      return;
    }
    const g = state.lessons[L.lessonId] || {};
    const head = document.getElementById("lesson-flow-head");
    const body = document.getElementById("lesson-flow-body");
    const tabs = document.getElementById("gate-tabs");

    head.innerHTML = `
      <button type="button" class="btn-back" id="lesson-back">← 首页</button>
      <h2>第${L.lessonId}课 · ${escapeHtml(L.theme)}</h2>
      <p class="headline-jp">${escapeHtml(L.lessonTitle)}</p>
    `;
    head.querySelector("#lesson-back").onclick = () => showView("home");

    tabs.innerHTML = "";
    [
      { k: 1, label: "① 语法网络", done: g.gate1 },
      { k: 2, label: "② 练对话", done: g.gate2 },
      { k: 3, label: "③ 测考点", done: g.gate3 },
    ].forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gate-tab" + (activeGate === t.k ? " active" : "") + (t.done ? " done" : "");
      b.textContent = (t.done ? "✅ " : "") + t.label;
      b.onclick = () => {
        activeGate = t.k;
        mountGate();
        renderLessonFlow();
      };
      tabs.appendChild(b);
    });

    mountGate();
  }

  function mountGate() {
    const body = document.getElementById("lesson-flow-body");
    body.innerHTML = "";
    const opts = {
      state,
      onComplete: () => {
        const g = state.lessons[activeLessonId];
        if (activeGate === 1 && !g.gate2) activeGate = 2;
        else if (activeGate === 2 && !g.gate3) activeGate = 3;
        else if (activeGate === 3) {
          showView("home");
          return;
        }
        renderLessonFlow();
      },
    };
    if (activeGate === 1) GrammarNetwork.mount(body, activeLessonId, opts);
    else if (activeGate === 2) DialogueGate.mount(body, activeLessonId, opts);
    else QuizGate.mount(body, activeLessonId, {
      ...opts,
      onComplete: (finished) => {
        if (finished) showView("home");
        else renderLessonFlow();
      },
    });
  }

  function renderReview() {
    const list = document.getElementById("review-list");
    const empty = document.getElementById("review-empty");
    const due = dueMistakes(state);
    if (!due.length) {
      empty.hidden = false;
      list.innerHTML = "";
      return;
    }
    empty.hidden = true;
    list.innerHTML = "";
    due.forEach((m) => {
      const li = document.createElement("li");
      li.className = "review-item";
      const day = daysSinceWrong(m.wrongAt);
      li.innerHTML = `
        <p class="review-q">${escapeHtml(m.question)}</p>
        <p class="hint">第${m.lessonId}课 · 错后第${day}天提醒 · 你的答案：${escapeHtml(m.userAnswer)}</p>
        <button type="button" class="btn primary btn-review-go">重新作答</button>
      `;
      li.querySelector(".btn-review-go").onclick = () => openReviewModal(m);
      list.appendChild(li);
    });
  }

  function openReviewModal(m) {
    const lesson = getLessonMvp(m.lessonId);
    const q = lesson?.quizQuestions.find((x) => x.id === m.questionId);
    if (!q) return;
    const modal = document.getElementById("review-modal");
    modal.hidden = false;
    let body = "";
    if (q.type === "choice") {
      body = q.options
        .map((opt, i) => `<button type="button" class="qz-opt" data-i="${i}">${escapeHtml(opt)}</button>`)
        .join("");
    } else {
      body = `<input type="text" class="qz-input" id="rev-fill" />
        <button type="button" class="btn primary" id="rev-submit">提交</button>`;
    }
    modal.innerHTML = `
      <div class="gn-modal-inner">
        <h3>复习 · ${escapeHtml(m.question)}</h3>
        <div class="qz-options">${body}</div>
        <div id="rev-feedback"></div>
        <button type="button" class="btn ghost" id="rev-close">关闭</button>
      </div>
    `;
    const grade = (userRaw) => {
      let ok = false;
      if (q.type === "choice") ok = Number(userRaw) === q.answer;
      else ok = (userRaw || "").trim().replace(/\s+/g, "") === q.answer.replace(/\s+/g, "");
      const fb = modal.querySelector("#rev-feedback");
      if (ok) {
        removeMvpMistake(state, m.id);
        fb.innerHTML = `<p class="feedback ok">✓ 做对了，已从错题本移除。</p>`;
        updateReviewBadge();
        setTimeout(() => {
          modal.hidden = true;
          renderReview();
        }, 800);
      } else {
        fb.innerHTML = `<p class="feedback err">${escapeHtml(q.explanation)}</p>`;
        m.reviewCount = (m.reviewCount || 0) + 1;
        saveMvpState(state);
      }
    };
    if (q.type === "choice") {
      modal.querySelectorAll(".qz-opt").forEach((btn) => {
        btn.onclick = () => grade(btn.dataset.i);
      });
    } else {
      modal.querySelector("#rev-submit").onclick = () =>
        grade(modal.querySelector("#rev-fill").value);
    }
    modal.querySelector("#rev-close").onclick = () => {
      modal.hidden = true;
    };
  }

  function renderMe() {
    const heat = document.getElementById("heatmap");
    const progress = document.getElementById("parent-progress");
    const weak = document.getElementById("weak-top3");

    heat.innerHTML = weekStudyDays(state)
      .map((d) => {
        const label = d.date.slice(5);
        return `<div class="heat-cell ${d.studied ? "on" : ""}" title="${d.date}"><span>${label}</span></div>`;
      })
      .join("");

    progress.innerHTML = LESSONS_MVP.map((L) => {
      const g = state.lessons[L.lessonId] || {};
      const all = g.gate1 && g.gate2 && g.gate3;
      return `<div class="parent-row">
        <span>第${L.lessonId}课</span>
        <span>${g.gate1 ? "✅" : "⬜"} ${g.gate2 ? "✅" : "⬜"} ${g.gate3 ? "✅" : "⬜"}</span>
        <span class="${all ? "done-tag" : ""}">${all ? "已完成" : "进行中"}</span>
      </div>`;
    }).join("");

    const tops = weakGrammarTop3(state);
    weak.innerHTML = tops.length
      ? tops.map((t) => `<li><strong>${escapeHtml(t.title)}</strong> · 错 ${t.count} 次</li>`).join("")
      : "<li class='hint'>暂无错题统计，继续保持！</li>";

    document.getElementById("btn-clear-mvp").onclick = () => {
      if (confirm("确定清空本机学习记录？")) {
        clearMvpData();
        state = loadMvpState();
        showView("me");
      }
    };
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  showView("home");
})();
