/** 课文简介 - 独立模块 · 每课进入时展示 overview + 5模块折叠 */
const LessonOverview = (() => {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  const MODULES = [
    { k: 0, icon: "🃏", label: "単語", sub: "フラッシュカード", desc: "本课全部单词，按声调标注，逐词朗读跟读" },
    { k: 2, icon: "💬", label: "会話", sub: "多场景对话", desc: "应用课文逐句对话，角色扮演练习" },
    { k: 1, icon: "📖", label: "文法", sub: "语法网络", desc: "语法节点卡片，日文例句+中文说明" },
    { k: 3, icon: "📝", label: "作業", sub: "练习测验", desc: "课后作业+小测验，巩固知识" },
    { k: 4, icon: "📋", label: "拡張", sub: "分类回顾", desc: "发音/语法/敬语/会话要点分类总结" },
  ];

  function render(el, lessonId, callbacks) {
    const L = (typeof getLessonMvp === "function") ? getLessonMvp(lessonId) : null;
    if (!L) { el.innerHTML = '<p class="hint-ja">課堂データなし</p>'; return; }

    const vocab = L.vocab || [];
    const grammar = L.grammarNodes || [];
    const quizes = L.quizQuestions || [];
    const dlg = L.dialogues || [];
    const themeLine = L.themeZh ? `${L.themeZh}（${L.theme || ""}）` : "";
    const firstReview = (L.reviewExtension || [])[0];
    const introLines = firstReview?.lines?.slice(0, 4) || [];
    const kp = L.dialogueKeyPoints || [];

    // Vocab pills (all words, scrollable)
    const vocabAll = vocab.map(v =>
      `<span class="ov-pill">${escapeHtml(v.jp)}<small class="zh-annotation">${escapeHtml(v.meaningZh||"")}</small></span>`
    ).join("");

    // Grammar preview
    const grammarPrev = grammar.slice(0,3).map(n =>
      `<div class="ov-gn-line"><b>${escapeHtml(n.title)}</b> <span class="zh-annotation">${escapeHtml(n.titleZh||"")}</span></div>`
    ).join("");

    // Dialogue preview
    const dlgPrev = dlg.slice(0,3).map(d =>
      `<div class="ov-dlg-line">${escapeHtml((d.opener?.japanese||"").substring(0,30))}…</div>`
    ).join("");

    // Quiz preview
    const quizPrev = quizes.slice(0,3).map(q =>
      `<div class="ov-qz-line">${q.type==="choice"?"🔘":"✏️"} ${escapeHtml((q.question||"").substring(0,25))}</div>`
    ).join("");

    function goGate(k) {
      if (callbacks && callbacks.enterGate) callbacks.enterGate(k);
    }

    const modulesHtml = MODULES.map((m, i) => {
      let preview = "";
      let count = 0, unit = "";
      if (m.k === 0) { count = vocab.length; unit = "词";
        preview = count ? `
          <div class="ov-mod-preview">
            <p class="ov-mod-summary">本课共 ${count} 个单词，点击单词 🔊 听读音。</p>
            <div class="ov-mod-pills-wrap">${vocabAll}</div>
            <div class="ov-mod-scroll-hint"><span>↓ 滑到底部查看全部 ${count} 个单词</span></div>
          </div>
          <button type="button" class="btn primary ov-mod-btn" data-gate="0">进入单词关 →</button>
          <div class="ov-mod-next-hint"><span>💬 看完单词后，进入「会話」模块</span></div>
        ` : '<p class="hint-ja">暂无单词数据</p>';
      } else if (m.k === 2) { count = dlg.length; unit = "句";
        preview = count ? `
          <div class="ov-mod-preview">
            <p class="ov-mod-summary">应用课文 ${count} 句对话，逐句朗读跟读。</p>
            ${dlgPrev}
            ${kp.length ? `<div class="ov-kp">${kp.slice(0,3).map(k => `<p class="zh-annotation">💡 ${escapeHtml(k)}</p>`).join("")}</div>` : ""}
          </div>
          <button type="button" class="btn primary ov-mod-btn" data-gate="2">进入会话关 →</button>
          <div class="ov-mod-next-hint"><span>📖 看完会话后，进入「文法」模块</span></div>
        ` : '<p class="hint-ja">暂无对话数据</p>';
      } else if (m.k === 1) { count = grammar.length; unit = "节点";
        preview = count ? `
          <div class="ov-mod-preview">
            <p class="ov-mod-summary">本课 ${count} 个语法节点，逐卡讲解。</p>
            ${grammarPrev}
          </div>
          <button type="button" class="btn primary ov-mod-btn" data-gate="1">进入文法关 →</button>
          <div class="ov-mod-next-hint"><span>📝 看完文法后，进入「作業」模块</span></div>
        ` : '<p class="hint-ja">暂无语法数据</p>';
      } else if (m.k === 3) { count = quizes.length; unit = "题";
        preview = count ? `
          <div class="ov-mod-preview">
            <p class="ov-mod-summary">共 ${count} 道测验题，含选择和填空。</p>
            ${quizPrev}
          </div>
          <button type="button" class="btn primary ov-mod-btn" data-gate="3">进入作業关 →</button>
          <div class="ov-mod-next-hint"><span>📋 做完作业后，进入「拡張」模块</span></div>
        ` : '<p class="hint-ja">暂无测验数据</p>';
      } else if (m.k === 4) { count = (L.summaryBlocks||[]).length + (L.reviewExtension||[]).length; unit = "类";
        preview = `
          <div class="ov-mod-preview">
            <p class="ov-mod-summary">发音要点·语法回顾·敬语表达·活用预告等分类总结。</p>
          </div>
          <button type="button" class="btn primary ov-mod-btn" data-gate="4">进入拡張关 →</button>
        `;
      }
      return `
        <details class="ov-mod-details" data-gate="${m.k}" ${i === 0 ? "open" : ""}>
          <summary class="ov-mod-summary">
            <span class="ov-mod-label">${m.icon ? `${escapeHtml(m.icon)} ` : ""}${escapeHtml(m.label)}</span>
            <span class="ov-mod-count">${count}${unit}</span>
            <span class="ov-mod-chevron"></span>
          </summary>
          <div class="ov-mod-body">
            <p class="ov-mod-sub">${escapeHtml(m.sub)}</p>
            ${preview}
          </div>
        </details>`;
    }).join("");

    el.innerHTML = `
      <div class="ov-wrap">
        <div class="ov-hero">
          <h2 class="ov-title jp">第${lessonId}課</h2>
          <h3 class="ov-subtitle jp">${escapeHtml(L.lessonTitle || "")}</h3>
          ${themeLine ? `<p class="ov-theme zh-annotation">${escapeHtml(themeLine)}</p>` : ""}
        </div>
        <div class="ov-stats">
          <span>📝 ${vocab.length}词</span><span>💬 ${dlg.length}句</span><span>📖 ${grammar.length}法</span><span>✏️ ${quizes.length}题</span>
        </div>
        ${introLines.length ? `
        <details class="ov-intro" open>
          <summary class="ov-intro-summary">📖 课文简介</summary>
          <div class="ov-intro-body">${introLines.map(l => `<p class="zh-annotation">${escapeHtml(l)}</p>`).join("")}</div>
        </details>` : ""}
        ${modulesHtml}
      </div>
    `;

    el.querySelectorAll(".ov-mod-btn").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); goGate(parseInt(btn.dataset.gate)); });
    });
  }

  return { render, MODULES };
})();
