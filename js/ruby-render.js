/** PRD：汉字 ruby 注音 + 【拓】拓展词渲染 */
const RubyRender = (() => {
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  /** segments: [{ kanji, reading }] 按出现顺序替换首处 kanji */
  function fromSegments(text, segments) {
    if (!segments?.length) return escapeHtml(text);
    let html = escapeHtml(text);
    segments.forEach(({ kanji, reading }) => {
      if (!kanji) return;
      const safe = kanji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const ruby =
        reading && reading.trim()
          ? `<ruby>${escapeHtml(kanji)}<rt>${escapeHtml(reading)}</rt></ruby>`
          : escapeHtml(kanji);
      html = html.replace(new RegExp(safe), ruby);
    });
    return html;
  }

  function nodeExample(node) {
    if (node.exampleHtml) return node.exampleHtml;
    if (node.exampleRuby) return fromSegments(node.example, node.exampleRuby);
    return escapeHtml(node.example || "");
  }

  function lineJapanese(line) {
    if (line.japaneseHtml) return line.japaneseHtml;
    if (line.japaneseRuby) return fromSegments(line.japanese, line.japaneseRuby);
    return escapeHtml(line.japanese || "");
  }

  /** 把汉字按 ruby 换成假名，供 TTS 朗读（避免读成中文） */
  function toKanaReading(text, segments) {
    if (!text) return "";
    if (!segments?.length) return text;
    let s = text;
    segments.forEach(({ kanji, reading }) => {
      if (!kanji || !reading) return;
      s = s.split(kanji).join(reading);
    });
    return s;
  }

  function extensionsHtml(extensions) {
    if (!extensions?.length) return "";
    return extensions
      .map(
        (e) =>
          `<span class="ext-word"><span class="ext-badge">拓</span><span class="ext-jp">${escapeHtml(e.jp)}</span><span class="ext-zh zh-annotation">（${escapeHtml(e.zh)}）</span></span>`
      )
      .join("");
  }

  return { escapeHtml, fromSegments, nodeExample, lineJapanese, toKanaReading, extensionsHtml };
})();
