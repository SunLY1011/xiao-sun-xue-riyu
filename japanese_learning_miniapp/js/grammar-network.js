const GrammarNetwork = (() => {
  let lesson = null;
  let cardIndex = 0;
  let flipped = false;
  let onGateComplete = null;
  let container = null;
  let state = null;
  let deepLinks = false;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function linkClass(type) {
    return `gn-link gn-link-${type}`;
  }

  function mount(el, lessonId, options) {
    container = el;
    state = options.state;
    onGateComplete = options.onComplete;
    lesson = getLessonMvp(lessonId);
    deepLinks = lessonId === 16;
    cardIndex = 0;
    flipped = false;
    render();
  }

  function currentNode() {
    return lesson.grammarNodes[cardIndex];
  }

  function render() {
    const node = currentNode();
    const total = lesson.grammarNodes.length;
    container.innerHTML = `
      <div class="gn-wrap">
        <p class="gn-progress">语法卡片 ${cardIndex + 1} / ${total}${node.core ? " · ★本课核心" : ""}</p>
        <div class="gn-card ${flipped ? "flipped" : ""}" id="gn-flip">
          <div class="gn-face gn-front">
            <h3>${escapeHtml(node.title)}</h3>
            <p class="gn-hint">点击卡片看详解</p>
          </div>
          <div class="gn-face gn-back">
            <p class="gn-explain">${escapeHtml(node.explanation)}</p>
            <p class="gn-example jp">${RubyRender.nodeExample(node)}</p>
            <p class="gn-example zh">${escapeHtml(node.exampleTranslation || "")}</p>
            <div class="gn-ext-wrap">${RubyRender.extensionsHtml(node.extensions)}</div>
          </div>
        </div>
        <div class="gn-links" id="gn-links"></div>
        <div class="gn-tags">${(node.tags || []).map((t) => `<span class="gn-tag">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="gn-nav">
          <button type="button" class="btn secondary" id="gn-prev" ${cardIndex === 0 ? "disabled" : ""}>上一张</button>
          <button type="button" class="btn primary" id="gn-next">${cardIndex >= total - 1 ? "完成第一关" : "下一张"}</button>
        </div>
      </div>
      <div id="gn-modal" class="gn-modal" hidden></div>
    `;

    const flip = container.querySelector("#gn-flip");
    flip.onclick = () => {
      flipped = !flipped;
      flip.classList.toggle("flipped", flipped);
    };

    const linksEl = container.querySelector("#gn-links");
    (node.links || []).forEach((link) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = linkClass(link.type);
      btn.textContent = link.label;
      btn.onclick = () => handleLink(link, node);
      linksEl.appendChild(btn);
    });

    container.querySelector("#gn-prev").onclick = () => {
      if (cardIndex > 0) {
        cardIndex--;
        flipped = false;
        render();
      }
    };
    container.querySelector("#gn-next").onclick = () => {
      if (cardIndex < total - 1) {
        cardIndex++;
        flipped = false;
        render();
      } else {
        setGateDone(state, lesson.lessonId, 1);
        onGateComplete?.();
      }
    };
  }

  function showModal(html) {
    const modal = container.querySelector("#gn-modal");
    modal.hidden = false;
    modal.innerHTML = `<div class="gn-modal-inner">${html}<button type="button" class="btn ghost gn-close">关闭</button></div>`;
    modal.querySelector(".gn-close").onclick = () => {
      modal.hidden = true;
    };
    modal.onclick = (e) => {
      if (e.target === modal) modal.hidden = true;
    };
  }

  function handleLink(link, node) {
    if (link.type === "contrast") {
      openContrast(link, node);
      return;
    }
    if (!link.targetNodeId) {
      showModal(`<p>${escapeHtml(link.external || link.label)}</p><p class="hint">跨课链接将在 V1.1 开放跳转。</p>`);
      return;
    }
    const target = findNodeAcrossLessons(link.targetNodeId);
    if (!target) return;
    if (!deepLinks && target.lesson.lessonId !== lesson.lessonId) {
      showModal(`<p>目标：${escapeHtml(target.node.title)}（第${target.lesson.lessonId}课）</p><p class="hint">第14、18课跨课跳转将在 V1.1 激活；第16课已可点击。</p>`);
      return;
    }
    const idx = target.lesson.grammarNodes.findIndex((n) => n.id === link.targetNodeId);
    if (idx >= 0) {
      lesson = target.lesson;
      cardIndex = idx;
      flipped = true;
      render();
    }
  }

  function openContrast(link, node) {
    let preset = null;
    if (link.contrastWith && node.id) {
      const key = [link.contrastWith, node.id].sort().join("+");
      preset = CONTRAST_PRESETS[key];
    }
    if (!preset && link.targetNodeId) {
      const key = [node.id, link.targetNodeId].sort().join("+");
      preset = CONTRAST_PRESETS[key];
    }
    if (preset) {
      showModal(`
        <h3>${escapeHtml(preset.title)}</h3>
        <div class="gn-contrast-grid">
          <div class="gn-contrast-col">
            <h4>${escapeHtml(preset.left.label)}</h4>
            <p><strong>句型</strong> ${escapeHtml(preset.left.pattern)}</p>
            <p class="gn-timeline">${escapeHtml(preset.left.timeline)}</p>
            <p class="jp">${escapeHtml(preset.left.example)}</p>
            <p class="zh">${escapeHtml(preset.left.exampleZh)}</p>
            <p class="gn-mistake">${escapeHtml(preset.left.mistake)}</p>
          </div>
          <div class="gn-contrast-col">
            <h4>${escapeHtml(preset.right.label)}</h4>
            <p><strong>句型</strong> ${escapeHtml(preset.right.pattern)}</p>
            <p class="gn-timeline">${escapeHtml(preset.right.timeline)}</p>
            <p class="jp">${escapeHtml(preset.right.example)}</p>
            <p class="zh">${escapeHtml(preset.right.exampleZh)}</p>
            <p class="gn-mistake">${escapeHtml(preset.right.mistake)}</p>
          </div>
        </div>
      `);
      return;
    }
    if (link.contrastPair) {
      showModal(`
        <h3>重点辨析</h3>
        <ul class="gn-pair-list">
          ${link.contrastPair.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
        </ul>
      `);
    }
  }

  return { mount };
})();
