const LessonView = (() => {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function render(container, lessonId) {
    const L = getLesson(lessonId);
    let html = `
      <div class="lesson-header">
        <span class="unit-tag">${escapeHtml(L.unit || "")}</span>
        <h2>${escapeHtml(L.title)} ${escapeHtml(L.theme)}</h2>
        <p class="headline-jp">${escapeHtml(L.headline)}</p>
      </div>
      <div class="lesson-actions">
        <button type="button" class="btn primary" data-go="practice">开始练习</button>
        <button type="button" class="btn secondary" data-go="scenarios">进入情景</button>
        <button type="button" class="btn secondary" data-go="chat">AI 对话</button>
      </div>
    `;

    html += `<section class="lesson-section"><h3>基本课文</h3><ul class="text-list">`;
    (L.basicText || []).forEach((t, i) => {
      html += `<li><div class="tap-slot" data-tap="${i}"></div><p class="zh-line">${escapeHtml(t.zh)}</p></li>`;
    });
    html += `</ul></section>`;

    (L.dialogues || []).forEach((d) => {
      html += `<section class="lesson-section"><h3>${escapeHtml(d.title)}</h3><div class="dialogue">`;
      (d.lines || []).forEach((line, li) => {
        html += `<div class="dlg-line"><span class="sp">${escapeHtml(line.sp)}</span>
          <div class="tap-slot dlg-tap" data-dlg="${d.title}-${li}"></div>
          <p class="zh-line">${escapeHtml(line.zh || "")}</p></div>`;
      });
      html += `</div></section>`;
    });

    (L.grammar || []).forEach((g) => {
      html += `<section class="lesson-section"><h3>${escapeHtml(g.title)}</h3>
        <p class="grammar-rule">${escapeHtml(g.rule)}</p>`;
      if (g.mnemonic) html += `<p class="grammar-memo">💡 ${escapeHtml(g.mnemonic)}</p>`;
      if (g.table) {
        html += `<table class="grammar-table"><thead><tr><th>类型</th><th>ます形</th><th>て形</th></tr></thead><tbody>`;
        g.table.forEach((row) => {
          html += `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`;
        });
        html += `</tbody></table>`;
      }
      (g.examples || []).forEach((ex) => {
        html += `<p class="jp-line">${escapeHtml(ex.jp)}</p><p class="zh-line">${escapeHtml(ex.zh)}</p>`;
      });
      html += `</section>`;
    });

    html += `<section class="lesson-section"><h3>生词</h3><ul class="vocab-list">`;
    (L.vocab || []).forEach((v) => {
      html += `<li><strong>${escapeHtml(v.jp)}</strong>
        ${v.kana ? `<span class="kana">${escapeHtml(v.kana)}</span>` : ""}
        <span class="zh">${escapeHtml(v.zh)}</span></li>`;
    });
    html += `</ul></section>`;

    if (L.tools && L.tools.some((t) => t.type === "te-form")) {
      html += `<section class="lesson-section" id="te-form-tool"></section>`;
    }

    container.innerHTML = html;

    (L.basicText || []).forEach((t, i) => {
      const slot = container.querySelector(`[data-tap="${i}"]`);
      if (slot) WordGuide.renderInteractive(slot, t.jp);
    });
    container.querySelectorAll(".jp-line").forEach((el) => {
      const jp = el.textContent;
      const wrap = document.createElement("div");
      el.replaceWith(wrap);
      WordGuide.renderInteractive(wrap, jp);
    });
    (L.dialogues || []).forEach((d) => {
      (d.lines || []).forEach((line, li) => {
        const slot = container.querySelector(`[data-dlg="${d.title}-${li}"]`);
        if (slot) WordGuide.renderInteractive(slot, line.jp);
      });
    });

    container.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const go = btn.dataset.go;
        if (window.AppNav) window.AppNav(go, lessonId);
      });
    });

    const toolEl = container.querySelector("#te-form-tool");
    if (toolEl && window.TeFormTool) TeFormTool.mount(toolEl);
  }

  return { render };
})();
