/** 多模态：粘贴图片 · OCR识别 · 插入对话 */
const ImageTools = (() => {
  let modalEl = null;
  let tesseractWorker = null;
  let recognizing = false;

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.id = "im-modal";
    modalEl.className = "mvp-backdrop";
    modalEl.hidden = true;
    modalEl.innerHTML = `
      <div class="im-card">
        <div class="im-head">
          <h3>📷 图片识别</h3>
          <button type="button" class="btn ghost" id="im-close">✕</button>
        </div>
        <div class="im-body">
          <img id="im-preview" style="max-width:100%;max-height:240px;border-radius:8px;display:none" alt="">
          <div id="im-status" class="hint-ja" style="margin:8px 0"></div>
          <div id="im-result" style="display:none">
            <textarea id="im-text" rows="8" style="width:100%;font-size:14px;padding:8px;border:1px solid #ddd;border-radius:6px;resize:vertical" placeholder="OCR结果..."></textarea>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button type="button" class="btn primary" id="im-copy">📋 复制文本</button>
              <button type="button" class="btn secondary" id="im-insert">💬 插入对话</button>
            </div>
          </div>
          <div id="im-actions" style="display:none;margin-top:8px">
            <button type="button" class="btn primary" id="im-ocr">🔍 识别文字 (OCR)</button>
            <p class="hint-ja" style="margin-top:4px;font-size:11px">首次加载 OCR 引擎约需 5-10 秒</p>
          </div>
        </div>
      </div>
    `;
    document.getElementById("app")?.appendChild(modalEl);
    bindModal();
    return modalEl;
  }

  function bindModal() {
    modalEl.querySelector("#im-close").onclick = hide;
    modalEl.querySelector("#im-copy").onclick = () => {
      const ta = modalEl.querySelector("#im-text");
      ta.select();
      document.execCommand("copy");
      showStatus("✅ 已复制到剪贴板");
    };
    modalEl.querySelector("#im-insert").onclick = () => {
      const text = modalEl.querySelector("#im-text").value.trim();
      if (!text) return;
      insertAsDialogue(text);
    };
    modalEl.querySelector("#im-ocr").onclick = () => startOCR();
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) hide();
    });
  }

  function show(imageDataUrl) {
    const m = ensureModal();
    m.hidden = false;
    m.querySelector("#im-preview").src = imageDataUrl;
    m.querySelector("#im-preview").style.display = "block";
    m.querySelector("#im-status").textContent = "";
    m.querySelector("#im-result").style.display = "none";
    m.querySelector("#im-actions").style.display = "flex";
    m.querySelector("#im-actions").style.flexDirection = "column";
    m.querySelector("#im-actions").style.alignItems = "flex-start";
    // Store image for OCR
    m._imageData = imageDataUrl;
  }

  function hide() {
    if (modalEl) {
      modalEl.hidden = true;
      modalEl._imageData = null;
    }
  }

  function showStatus(msg) {
    const el = document.getElementById("im-status");
    if (el) el.textContent = msg;
  }

  function loadTesseract() {
    return new Promise((resolve, reject) => {
      if (tesseractWorker) return resolve(tesseractWorker);
      showStatus("⏳ 加载 OCR 引擎中...");
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.onload = () => {
        try {
          tesseractWorker = Tesseract.createWorker("jpn", 1, {
            logger: (m) => {
              if (m.status === "recognizing text") {
                showStatus(`🔍 识别中... ${Math.round(m.progress * 100)}%`);
              }
            },
          });
          resolve(tesseractWorker);
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = () => reject(new Error("Tesseract.js 加载失败"));
      document.head.appendChild(script);
    });
  }

  async function startOCR() {
    if (recognizing) return;
    recognizing = true;
    const m = ensureModal();
    m.querySelector("#im-actions").style.display = "none";
    try {
      const worker = await loadTesseract();
      showStatus("🔍 正在识别日语文字...");
      const img = m.querySelector("#im-preview");
      const { data } = await worker.recognize(img);
      const text = data.text.trim();
      m.querySelector("#im-result").style.display = "block";
      m.querySelector("#im-text").value = text;
      if (!text) {
        showStatus("⚠️ 未识别到文字，请确认图片中包含清晰的日语文本");
      } else {
        showStatus(`✅ 识别完成，共 ${text.length} 字符`);
      }
    } catch (e) {
      showStatus("❌ OCR 失败: " + (e.message || "未知错误"));
      console.error("OCR error:", e);
    } finally {
      recognizing = false;
    }
  }

  function insertAsDialogue(text) {
    const lines = text.split(/\n+/).filter(l => l.trim());
    if (!lines.length) return;
    const newDialogues = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^([^：:]{1,8})[：:]\s*(.+)/);
      if (match) {
        newDialogues.push({
          speaker: match[1],
          japanese: match[2],
          chinese: "",
        });
      } else {
        if (newDialogues.length === 0) {
          newDialogues.push({ speaker: "A", japanese: line, chinese: "" });
        } else {
          const last = newDialogues[newDialogues.length - 1];
          if (last.speaker === "A") {
            newDialogues.push({ speaker: "B", japanese: line, chinese: "" });
          } else {
            newDialogues.push({ speaker: "A", japanese: line, chinese: "" });
          }
        }
      }
    }
    saveCustomDialogues(newDialogues);
    hide();
    if (typeof DialogueGate !== "undefined" && DialogueGate.refresh) {
      DialogueGate.refresh();
    }
  }

  function saveCustomDialogues(list) {
    try {
      const key = "hyouga_custom_dialogues";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const newEntries = list.map((item, i) => ({
        id: `custom_${Date.now()}_${i}`,
        title: "自定义对话",
        sceneEmoji: "✏️",
        scenePlace: "自定义",
        opener: { speaker: "A", japanese: "", chinese: "" },
        userTurn: { speaker: "B", replies: [{
          japanese: item.japanese, chinese: item.chinese || "",
          noteJa: "", noteZh: "",
        }]},
      }));
      // Build sequential dialogue pairs
      const dlgEntries = [];
      for (let i = 0; i < list.length - 1; i++) {
        dlgEntries.push({
          id: `custom_${Date.now()}_${i}`,
          title: "自定义对话",
          sceneEmoji: "✏️",
          scenePlace: `${i + 1}`,
          opener: { speaker: list[i].speaker || "A", japanese: list[i].japanese, chinese: list[i].chinese || "" },
          userTurn: { speaker: list[i+1].speaker || "B", replies: [{
            japanese: list[i+1].japanese, chinese: list[i+1].chinese || "",
            noteJa: "", noteZh: "",
          }]},
        });
      }
      if (dlgEntries.length === 0 && list.length === 1) {
        dlgEntries.push({
          id: `custom_${Date.now()}_0`,
          title: "自定义对话",
          sceneEmoji: "✏️",
          scenePlace: "1",
          opener: { speaker: list[0].speaker || "A", japanese: list[0].japanese, chinese: list[0].chinese || "" },
          userTurn: { speaker: "B", replies: [{
            japanese: "", chinese: "", noteJa: "", noteZh: "",
          }]},
        });
      }
      existing.push(...dlgEntries);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error("saveCustomDialogues error:", e);
    }
  }

  function pasteHandler(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => show(reader.result);
        reader.readAsDataURL(blob);
        return;
      }
    }
  }

  function init() {
    document.addEventListener("paste", pasteHandler);
  }

  return { init, show, hide };
})();

document.addEventListener("DOMContentLoaded", () => ImageTools.init());
