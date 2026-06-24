/** 点词导读：读音、意思、怎么读 */
const WordGuide = (() => {
  let dict = {};

  function buildDict() {
    dict = {};
    (typeof LESSONS !== "undefined" ? LESSONS : []).forEach((lesson) => {
      (lesson.vocab || []).forEach((v) => addEntry(v.jp, v.kana, v.zh));
    });
    if (typeof SCENARIOS !== "undefined") {
      SCENARIOS.forEach((sc) => {
        (sc.words || []).forEach((w) => addEntry(w.jp, w.kana, w.zh, w.tip));
        (sc.steps || []).forEach((st) => {
          (st.words || []).forEach((w) => addEntry(w.jp, w.kana, w.zh, w.tip));
        });
      });
    }
    addEntry("です", "です", "是（礼貌体）", "句尾轻读 desu");
    addEntry("ます", "ます", "礼貌体标志", "masu 读清楚");
    addEntry("て", "て", "连接形", "短促的 te");
    addEntry("から", "から", "从…之后/因为", "kara");
  }

  function addEntry(jp, kana, zh, tip) {
    if (!jp) return;
    dict[jp] = { jp, kana: kana || "", zh: zh || "", tip: tip || "" };
  }

  function tokenize(text) {
    if (!text) return [];
    const chars = text.split("");
    const tokens = [];
    let i = 0;
    while (i < chars.length) {
      if (/[\s、。，．！？\n「」『』（）]/.test(chars[i])) {
        tokens.push({ type: "sep", text: chars[i] });
        i++;
        continue;
      }
      let matched = null;
      for (let len = Math.min(8, chars.length - i); len >= 1; len--) {
        const slice = chars.slice(i, i + len).join("");
        if (dict[slice]) {
          matched = { type: "word", text: slice, data: dict[slice] };
          i += len;
          break;
        }
      }
      if (matched) tokens.push(matched);
      else {
        let j = i;
        while (j < chars.length && !/[\s、。，．！？\n「」『』（）]/.test(chars[j])) {
          const sub = chars.slice(i, j + 1).join("");
          if (dict[sub]) {
            tokens.push({ type: "word", text: sub, data: dict[sub] });
            i = j + 1;
            matched = true;
            break;
          }
          j++;
        }
        if (!matched) {
          tokens.push({ type: "char", text: chars[i], data: lookupChar(chars[i]) });
          i++;
        }
      }
    }
    return tokens;
  }

  function lookupChar(ch) {
    const table = {
      行: { kana: "いく", zh: "去", tip: "て形例外：行って" },
      買: { kana: "かう", zh: "买", tip: "买い物＝かいもの" },
      広: { kana: "ひろい", zh: "宽敞", tip: "连接：広くて" },
      小: { kana: "ちいさい", zh: "小", tip: "变化：小さくなる" },
    };
    return table[ch] || { kana: "", zh: "（点长按看整词）", tip: "先点 🔊 听整句，再跟读" };
  }

  function renderInteractive(container, text, extraWords) {
    (extraWords || []).forEach((w) => addEntry(w.jp, w.kana, w.zh, w.tip));
    const tokens = tokenize(text);
    container.innerHTML = "";
    const wrap = document.createElement("p");
    wrap.className = "tap-text";
    tokens.forEach((tok) => {
      if (tok.type === "sep") {
        wrap.appendChild(document.createTextNode(tok.text));
        return;
      }
      const span = document.createElement("span");
      span.className = "tap-word";
      span.textContent = tok.text;
      span.addEventListener("click", () => showSheet(tok.data || { jp: tok.text, kana: "", zh: "未收录", tip: "" }));
      wrap.appendChild(span);
    });
    container.appendChild(wrap);
  }

  function showSheet(data) {
    let sheet = document.getElementById("word-sheet");
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "word-sheet";
      sheet.className = "word-sheet";
      sheet.innerHTML = `<div class="sheet-panel">
        <button type="button" class="sheet-close">×</button>
        <p class="sheet-jp"></p>
        <p class="sheet-kana"></p>
        <p class="sheet-zh"></p>
        <p class="sheet-tip"></p>
        <button type="button" class="btn primary sheet-play">🔊 听发音</button>
      </div>`;
      document.body.appendChild(sheet);
      sheet.querySelector(".sheet-close").onclick = () => sheet.classList.remove("open");
      sheet.addEventListener("click", (e) => {
        if (e.target === sheet) sheet.classList.remove("open");
      });
    }
    sheet.querySelector(".sheet-jp").textContent = data.jp;
    sheet.querySelector(".sheet-kana").textContent = data.kana ? `读法：${data.kana}` : "";
    sheet.querySelector(".sheet-zh").textContent = data.zh || "";
    sheet.querySelector(".sheet-tip").textContent = data.tip ? `💡 ${data.tip}` : "多练几遍，口型放慢。";
    sheet.querySelector(".sheet-play").onclick = () => SpeechEngine.speakJa(data.jp || data);
    sheet.classList.add("open");
  }

  buildDict();
  return { buildDict, renderInteractive, showSheet, tokenize };
})();
