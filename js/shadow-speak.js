/**
 * 跟读行：🔊 示范 · 🎤 录音 · ▶ 回放（单词 / 会話 / 可扩展）
 */
const ShadowSpeak = (() => {
  const clips = new Map();
  const clipsHeard = new Map();
  let mediaRecorder = null;
  let recordAsr = null;
  let recordAsrParts = [];
  let recordStream = null;
  let recordChunks = [];
  let recordRowId = null;
  let recordMime = "";
  let activeRecordBtn = null;
  let playbackAudio = null;
  let playbackObjectUrl = null;
  let silenceCheckTimer = null;
  let recordMaxTimer = null;
  let lastSoundAt = 0;

  const SILENCE_MS = 3000;
  const MAX_RECORD_MS = 15000;

  function escAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function isWeChat() {
    return /MicroMessenger/i.test(navigator.userAgent || "");
  }

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  }

  /** 微信 / iPhone 优先 mp4，避免录 webm 却无法回放 */
  function pickRecordMime() {
    const iosFirst = isIOS() || isWeChat();
    const candidates = iosFirst
      ? ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm", ""]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", ""];
    for (const t of candidates) {
      if (!t) return "";
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  function blobMime() {
    if (recordMime) return recordMime;
    if (mediaRecorder?.mimeType) return mediaRecorder.mimeType;
    return isIOS() ? "audio/mp4" : "audio/webm";
  }

  function expectedLine(payload) {
    if (!payload) return "";
    if (typeof payload === "string") return payload;
    if (payload.kana) return payload.kana;
    if (typeof RubyRender !== "undefined" && payload.ruby && payload.jp) {
      return RubyRender.toKanaReading(payload.jp, payload.ruby);
    }
    return payload.jp || payload.japanese || "";
  }

  function parseKeywordsAttr(attrs) {
    const m = /data-ss-keywords=['"]([^'"]*)['"]/.exec(attrs || "");
    if (!m) return [];
    try {
      const arr = JSON.parse(m[1].replace(/&quot;/g, '"'));
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function isDialogueRow(rowId, extraAttrs) {
    if (/data-ss-dialogue/.test(extraAttrs || "")) return true;
    return /^dg-r-/.test(rowId || "");
  }

  function scoreBelowRow(extraAttrs) {
    return /data-ss-score-below/.test(extraAttrs || "");
  }

  function rowHtml(payload, rowId, extraAttrs = "") {
    const exp = expectedLine(payload);
    const listenInner =
      typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.listenInner() : "🔊";
    const speakBtn =
      typeof SpeakUI !== "undefined"
        ? SpeakUI.btnHtml(payload, `data-ss-play="1" ${extraAttrs}`)
        : `<button type="button" class="btn-speak-icon hyo-l3-audio" data-ss-play="1" data-jp="${escAttr(exp)}" aria-label="听" title="听">${listenInner}</button>`;
    const recordInner =
      typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.recordInner() : "🎤";
    const replayInner =
      typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.replayInner() : "▶";
    const mode = isDialogueRow(rowId, extraAttrs) ? "dialogue" : /^vf-/.test(rowId || "") ? "vocab" : "light";
    const kw = parseKeywordsAttr(extraAttrs);
    const kwAttr = kw.length ? ` data-ss-keywords="${escAttr(JSON.stringify(kw))}"` : "";
    const evalBtn =
      mode === "dialogue"
        ? `<button type="button" class="btn-ss-evaluate hyo-l3-audio" data-ss-evaluate data-ss-row="${escAttr(rowId)}" data-ss-mode="${mode}" data-speak-expected="${escAttr(exp)}"${kwAttr} aria-label="评估" title="对照本句客观评分">${typeof HyougaGlyphs !== "undefined" ? HyougaGlyphs.evaluateInner() : "✓"}</button>`
        : "";
    return `<div class="ss-action-row" data-ss-row="${escAttr(rowId)}" data-ss-mode="${mode}">
      ${speakBtn}
      <button type="button" class="btn-ss-record hyo-l3-audio" data-ss-record data-ss-row="${escAttr(rowId)}" data-ss-mode="${mode}" data-speak-expected="${escAttr(exp)}"${kwAttr} aria-label="录音" title="录音">${recordInner}</button>
      <button type="button" class="btn-ss-replay hyo-l3-audio" data-ss-replay data-ss-row="${escAttr(rowId)}" disabled aria-label="回放" title="回放">${replayInner}</button>
      ${evalBtn}
    </div>`;
  }

  function dialogueScoreRoot() {
    return document.querySelector(".dg-wrap.dg-simple, .dg-wrap, #app");
  }

  /** 清掉会話区所有评语（含旧版误挂在按钮旁的 panel） */
  function clearDialogueScores() {
    const root = dialogueScoreRoot();
    if (!root) return;
    root.querySelectorAll("[data-dg-score-for]").forEach((slot) => {
      slot.innerHTML = "";
      slot.hidden = true;
    });
    root.querySelectorAll(".dg-score-panel, .dg-score-loading").forEach((el) => {
      const slot = el.closest("[data-dg-score-for]");
      if (!slot || !slot.innerHTML.trim()) el.remove();
    });
    root.querySelectorAll(".dg-actions-col .dg-score-panel, .dg-actions-col .dg-score-loading").forEach(
      (el) => el.remove()
    );
  }

  function showDialogueScoreSlot(rowId, html) {
    const sel = `[data-dg-score-for="${CSS.escape(rowId)}"]`;
    const slots = document.querySelectorAll(sel);
    slots.forEach((slot) => {
      slot.hidden = false;
      slot.innerHTML = html;
    });
  }

  function toast(msg) {
    if (typeof SpeakUI !== "undefined" && SpeakUI.showToast) SpeakUI.showToast(msg);
  }

  function clearRecordTimers() {
    if (silenceCheckTimer) {
      clearInterval(silenceCheckTimer);
      silenceCheckTimer = null;
    }
    if (recordMaxTimer) {
      clearTimeout(recordMaxTimer);
      recordMaxTimer = null;
    }
  }

  function revokePlaybackUrl() {
    if (playbackObjectUrl) {
      try {
        URL.revokeObjectURL(playbackObjectUrl);
      } catch (_) {}
      playbackObjectUrl = null;
    }
  }

  function stopPlayback() {
    if (playbackAudio) {
      try {
        playbackAudio.pause();
        playbackAudio.removeAttribute("src");
        playbackAudio.load();
      } catch (_) {}
      playbackAudio = null;
    }
    revokePlaybackUrl();
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.stopAllPlayback) {
      SpeechEngine.stopAllPlayback();
    }
  }

  function releaseStream() {
    if (recordStream) {
      recordStream.getTracks().forEach((t) => t.stop());
      recordStream = null;
    }
  }

  function setupPlaybackAudio(audio, url) {
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.playsInline = true;
    audio.preload = "auto";
    audio.volume = 1;
    audio.src = url;
  }

  async function playClip(rowId) {
    const blob = clips.get(rowId);
    if (!blob || blob.size < 80) {
      toast("还没有录音，请先点 🎤");
      return;
    }
    if (/^dg-r-/.test(rowId || "")) clearDialogueScores();
    stopPlayback();
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.unlockAudioOnce) {
      SpeechEngine.unlockAudioOnce();
    }
    playbackObjectUrl = URL.createObjectURL(blob);
    playbackAudio = new Audio();
    setupPlaybackAudio(playbackAudio, playbackObjectUrl);
    playbackAudio.onended = () => {
      stopPlayback();
    };
    try {
      await playbackAudio.play();
    } catch (err) {
      stopPlayback();
      const wx = isWeChat();
      toast(
        wx
          ? "回放失败：① 再点 ▶ ② 允许媒体播放 ③ 右上角 ⋯→在浏览器打开 ④ 换 WiFi/流量"
          : "回放失败：① 再点 ▶ ② 检查音量与静音 ③ 刷新页面后重试"
      );
    }
  }

  function stopRecordAsr() {
    return new Promise((resolve) => {
      if (!recordAsr) {
        resolve(recordAsrParts.join("").trim());
        recordAsrParts = [];
        return;
      }
      const rec = recordAsr;
      recordAsr = null;
      const done = () => resolve(recordAsrParts.join("").trim());
      rec.onend = done;
      try {
        rec.stop();
      } catch (_) {
        done();
      }
      setTimeout(done, 800);
    });
  }

  function startRecordAsr() {
    recordAsrParts = [];
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.getRecognition) return;
    const rec = SpeechEngine.getRecognition();
    if (!rec) return;
    recordAsr = rec;
    try {
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) recordAsrParts.push(e.results[i][0].transcript);
        }
      };
      rec.start();
    } catch (_) {
      recordAsr = null;
    }
  }

  function cleanupRecordUi() {
    clearRecordTimers();
    if (activeRecordBtn) {
      activeRecordBtn.classList.remove("is-recording");
      activeRecordBtn = null;
    }
    mediaRecorder = null;
    recordRowId = null;
    recordMime = "";
    recordChunks = [];
    recordAsr = null;
    recordAsrParts = [];
    releaseStream();
  }

  function enableReplay(btn) {
    const replay = btn.closest(".ss-action-row")?.querySelector("[data-ss-replay]");
    if (replay) {
      replay.disabled = false;
      replay.removeAttribute("aria-disabled");
    }
  }

  function isDialogueRowEl(el) {
    const row = el?.closest?.(".ss-action-row");
    return row?.dataset?.ssMode === "dialogue" || /^dg-r-/.test(el?.dataset?.ssRow || "");
  }

  function showDialogueScore(rowId, html) {
    clearDialogueScores();
    showDialogueScoreSlot(rowId, html);
  }

  async function finishRecord(btn, rowId, evaluate) {
    const mime = blobMime();
    const heardDuring = await stopRecordAsr();
    const blob = new Blob(recordChunks, { type: mime });
    const mode = btn?.dataset?.ssMode || btn?.closest(".ss-action-row")?.dataset?.ssMode || "light";
    cleanupRecordUi();
    if (blob.size < 200) {
      if (evaluate) toast("录音太短，请再说一次");
      return;
    }
    clips.set(rowId, blob);
    if (heardDuring) clipsHeard.set(rowId, heardDuring);
    enableReplay(btn);
    if (mode === "dialogue") {
      clearDialogueScores();
      toast("已录音。点右侧紫色 ✓ 对照本句评估");
      return;
    }
    if (!evaluate) {
      toast("已录音，可点 ▶ 回放");
      return;
    }

    const exp = btn?.dataset?.speakExpected || "";
    let keywords = [];
    try {
      if (btn?.dataset?.ssKeywords) keywords = JSON.parse(btn.dataset.ssKeywords);
    } catch (_) {}

    if (typeof SpeechEngine === "undefined") {
      toast("已录音，可点 ▶ 回放");
      return;
    }

    if (SpeechEngine.evaluatePronunciation) {
      const r = await SpeechEngine.evaluatePronunciation({
        expected: exp,
        heard: clipsHeard.get(rowId) || "",
        audioBlob: blob,
        keywords,
      });
      if (mode === "vocab") {
        toast(r.ok ? `发音 OK（${r.score}分）` : r.tip || "再听一遍跟读");
      } else {
        toast(r.ok ? `跟读不错（${r.score}分）` : r.tip || "再听示范读一遍");
      }
    } else {
      toast("已录音，可点 ▶ 回放");
    }
  }

  async function runDialogueEvaluate(btn, rowId) {
    const blob = clips.get(rowId);
    if (!blob || blob.size < 200) {
      toast("请先点 🎤 录完整句，再点 ✓ 评估");
      return;
    }
    const exp = btn?.dataset?.speakExpected || "";
    let keywords = [];
    try {
      if (btn?.dataset?.ssKeywords) keywords = JSON.parse(btn.dataset.ssKeywords);
    } catch (_) {}
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.evaluateDialogueDetailed) {
      toast("评分模块未加载");
      return;
    }
    clearDialogueScores();
    showDialogueScoreSlot(
      rowId,
      '<p class="dg-score-loading">正在对照<strong>本句</strong>发音…</p>'
    );
    btn.classList.add("is-evaluating");
    try {
      const r = await SpeechEngine.evaluateDialogueDetailed({
        expected: exp,
        heard: clipsHeard.get(rowId) || "",
        audioBlob: blob,
        keywords,
      });
      if (SpeechEngine.renderDialogueScoreHtml) {
        showDialogueScore(rowId, SpeechEngine.renderDialogueScoreHtml(r));
      } else {
        toast(r.passed ? `综合 ${r.score} 分` : r.feedback);
      }
    } finally {
      btn.classList.remove("is-evaluating");
    }
  }

  function flushRecorder() {
    if (!mediaRecorder || mediaRecorder.state !== "recording") return;
    try {
      mediaRecorder.requestData();
    } catch (_) {}
  }

  function forceStopRecord(evaluate) {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        cleanupRecordUi();
        resolve();
        return;
      }
      const btn = activeRecordBtn;
      const rowId = recordRowId;
      flushRecorder();
      mediaRecorder.onstop = async () => {
        releaseStream();
        if (btn && rowId != null) await finishRecord(btn, rowId, evaluate);
        else cleanupRecordUi();
        resolve();
      };
      try {
        mediaRecorder.stop();
      } catch (_) {
        cleanupRecordUi();
        resolve();
      }
    });
  }

  function shouldAutoEvaluate(btn) {
    const mode = btn?.dataset?.ssMode || btn?.closest(".ss-action-row")?.dataset?.ssMode || "light";
    return mode !== "dialogue";
  }

  async function stopRecord(btn) {
    if (!mediaRecorder || recordRowId == null) return;
    await forceStopRecord(shouldAutoEvaluate(btn));
  }

  function startSilenceWatch(btn) {
    lastSoundAt = Date.now();
    clearRecordTimers();
    const autoEval = shouldAutoEvaluate(btn);
    silenceCheckTimer = setInterval(() => {
      if (!mediaRecorder || mediaRecorder.state !== "recording") return;
      if (Date.now() - lastSoundAt >= SILENCE_MS) {
        toast("3 秒无声音，录音已自动结束");
        forceStopRecord(autoEval);
      }
    }, 400);
    recordMaxTimer = setTimeout(() => {
      if (mediaRecorder?.state === "recording") {
        toast("已达最长录音时间");
        forceStopRecord(autoEval);
      }
    }, MAX_RECORD_MS);
  }

  async function startRecord(btn, rowId, payload) {
    const mode = btn?.dataset?.ssMode || btn?.closest(".ss-action-row")?.dataset?.ssMode || "light";
    if (mode === "dialogue") clearDialogueScores();

    if (mediaRecorder && recordRowId === rowId) {
      await stopRecord(btn);
      return;
    }
    if (mediaRecorder && recordRowId !== rowId) {
      await forceStopRecord(false);
    }
    if (location.protocol === "file:") {
      toast("录音需本地服务：请双击「打开本地预览.bat」");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast(
        isWeChat()
          ? "微信内常无法录音：点右上角 ··· → 在浏览器中打开"
          : "当前环境不支持录音，请用 Safari/Chrome 打开 https 或 localhost"
      );
      return;
    }
    if (typeof SpeechEngine !== "undefined" && SpeechEngine.unlockAudioOnce) {
      SpeechEngine.unlockAudioOnce();
    }
    stopPlayback();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStream = stream;
      recordChunks = [];
      recordRowId = rowId;
      activeRecordBtn = btn;
      recordMime = pickRecordMime();
      btn.dataset.speakExpected =
        typeof payload === "object" ? JSON.stringify(payload) : String(payload || "");
      const opts = recordMime ? { mimeType: recordMime } : undefined;
      mediaRecorder = opts ? new MediaRecorder(stream, opts) : new MediaRecorder(stream);
      if (!recordMime && mediaRecorder.mimeType) recordMime = mediaRecorder.mimeType;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          if (e.data.size > 80) lastSoundAt = Date.now();
          recordChunks.push(e.data);
        }
      };
      mediaRecorder.start(200);
      btn.classList.add("is-recording");
      startRecordAsr();
      startSilenceWatch(btn);
      toast(
        mode === "dialogue"
          ? "按住 🎤 录音，松手结束；再点 ✓ 评估"
          : "按住 🎤 录音，松手结束（静音 3 秒也会自动停）"
      );
    } catch (_) {
      cleanupRecordUi();
      toast("请允许麦克风权限");
    }
  }

  function recordPayloadFromRow(btn) {
    const row = btn.closest(".ss-action-row");
    const playBtn = row?.querySelector("[data-speak],[data-jp]");
    let payload = playBtn?.dataset.speak || playBtn?.dataset.jp || "";
    try {
      if (playBtn?.dataset.speak) payload = JSON.parse(playBtn.dataset.speak);
    } catch (_) {}
    return payload;
  }

  function bindRecordButton(btn) {
    if (btn.dataset.ssRecBound === "1") return;
    btn.dataset.ssRecBound = "1";
    const rowId = btn.dataset.ssRow;
    const row = btn.closest(".ss-action-row");
    let holdActive = false;
    let suppressClick = false;

    async function beginHold() {
      if (holdActive) return;
      if (mediaRecorder && recordRowId === rowId && mediaRecorder.state === "recording") return;
      holdActive = true;
      suppressClick = true;
      const mode = btn.dataset.ssMode || row?.dataset?.ssMode || "";
      if (mode === "dialogue") clearDialogueScores();
      await startRecord(btn, rowId, recordPayloadFromRow(btn));
    }

    async function endHold() {
      if (!holdActive) return;
      holdActive = false;
      if (mediaRecorder && recordRowId === rowId && mediaRecorder.state === "recording") {
        await stopRecord(btn);
      }
    }

    btn.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        try {
          btn.setPointerCapture(e.pointerId);
        } catch (_) {}
        beginHold();
      },
      { passive: false }
    );
    btn.addEventListener("pointerup", (e) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        btn.releasePointerCapture(e.pointerId);
      } catch (_) {}
      endHold();
    });
    btn.addEventListener("pointercancel", () => {
      endHold();
    });
    btn.addEventListener("lostpointercapture", () => {
      endHold();
    });
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const mode = btn.dataset.ssMode || row?.dataset?.ssMode || "";
      if (mode === "dialogue") clearDialogueScores();
      await startRecord(btn, rowId, recordPayloadFromRow(btn));
    });
  }

  function bind(root) {
    if (!root) return;
    root.querySelectorAll("[data-ss-play]").forEach((btn) => {
      if (btn.dataset.ssPlayBound === "1") return;
      btn.dataset.ssPlayBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isDialogueRowEl(btn)) clearDialogueScores();
        if (typeof SpeakUI !== "undefined" && SpeakUI.speakFromButton) {
          SpeakUI.speakFromButton(btn);
        }
      });
    });
    root.querySelectorAll("[data-ss-record]").forEach((btn) => bindRecordButton(btn));
    root.querySelectorAll("[data-ss-replay]").forEach((btn) => {
      if (btn.dataset.ssReplayBound === "1") return;
      btn.dataset.ssReplayBound = "1";
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await playClip(btn.dataset.ssRow);
      });
    });
    root.querySelectorAll("[data-ss-evaluate]").forEach((btn) => {
      if (btn.dataset.ssEvalBound === "1") return;
      btn.dataset.ssEvalBound = "1";
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await runDialogueEvaluate(btn, btn.dataset.ssRow);
      });
    });
    if (typeof SpeakUI !== "undefined") SpeakUI.bind(root);
  }

  return { rowHtml, bind, clips, stopReplay: stopPlayback };
})();
