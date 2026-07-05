/** て形变换工具（第14课） */
const TeFormTool = (() => {
  const RULES = [
    { test: (s) => s.endsWith("行きます"), te: "行って", note: "例外" },
    { test: (s) => /[いき]ます$/.test(s) && s.includes("行"), te: "行って", note: "例外" },
    { test: (s) => s.endsWith("きます"), te: s.replace(/きます$/, "いて"), note: "く→いて" },
    { test: (s) => s.endsWith("ぎます"), te: s.replace(/ぎます$/, "いで"), note: "ぐ→いで" },
    { test: (s) => /[びみに]ます$/.test(s), te: (s) => s.replace(/ます$/, "んで").replace(/[びみに]$/, "ん") + "で" },
    { test: (s) => /[ちり]ます$/.test(s), te: (s) => s.replace(/ます$/, "って").replace(/[ちり]$/, "っ") + "て" },
    { test: (s) => s.endsWith("います"), te: s.replace(/います$/, "って"), note: "う→って" },
    { test: (s) => s.endsWith("します"), te: s.replace(/します$/, "して"), note: "する" },
    { test: (s) => s.endsWith("来ます") || s.endsWith("きます") && s.startsWith("来"), te: "来て", note: "来る" },
    { test: (s) => s.endsWith("ます"), te: s.replace(/ます$/, "て"), note: "二类" },
  ];

  function toTeForm(masu) {
    const s = masu.trim();
    if (s.endsWith("行きます")) return { te: "行って", note: "行くは例外" };
    if (s === "来ます" || s === "きます") return { te: "来て", note: "三类" };
    if (s.endsWith("します")) return { te: "して", note: "三类" };
    if (s.endsWith("きます")) return { te: s.slice(0, -3) + "いて", note: "く→いて" };
    if (s.endsWith("ぎます")) return { te: s.slice(0, -3) + "いで", note: "ぐ→いで" };
    if (/[びみに]ます$/.test(s)) {
      const stem = s.slice(0, -3);
      return { te: stem.slice(0, -1) + "んで", note: "ぶ・む・ぬ" };
    }
    if (/[ちり]ます$/.test(s)) {
      const stem = s.slice(0, -3);
      return { te: stem.slice(0, -1) + "って", note: "つ・る" };
    }
    if (s.endsWith("います")) {
      return { te: s.slice(0, -3) + "って", note: "う" };
    }
    if (s.endsWith("します")) return { te: s.slice(0, -2) + "して", note: "す" };
    if (s.endsWith("ます")) return { te: s.slice(0, -2) + "て", note: "二类动词" };
    return { te: "？", note: "请输入ます形" };
  }

  function mount(el) {
    el.innerHTML = `
      <h3>て形变换器</h3>
      <p class="hint">输入ます形，如：読みます、食べます、行きます</p>
      <input type="text" id="te-input" placeholder="読みます" />
      <button type="button" class="btn primary" id="te-btn">变换</button>
      <p id="te-result" class="te-result"></p>
    `;
    const run = () => {
      const v = el.querySelector("#te-input").value;
      const r = toTeForm(v);
      el.querySelector("#te-result").innerHTML =
        `<strong>${escapeHtml(v)}</strong> → <strong class="accent">${escapeHtml(r.te)}</strong> <span class="hint">（${escapeHtml(r.note)}）</span>`;
    };
    el.querySelector("#te-btn").addEventListener("click", run);
    el.querySelector("#te-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") run();
    });
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  return { mount, toTeForm };
})();
