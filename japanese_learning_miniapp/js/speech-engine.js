/** 语音：朗读、按住识别、发音评分 */
const SpeechEngine = (() => {
  let recognition = null;
  let listening = false;
  let cachedJaVoices = null;

  function refreshJapaneseVoices() {
    if (!window.speechSynthesis) return [];
    try {
      cachedJaVoices = window.speechSynthesis.getVoices().filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        if (lang.startsWith("zh") || /chinese|中文|mandarin|cmn|xiaoxiao|yunxi|huihui|kangkang/.test(name)) {
          return false;
        }
        return lang.startsWith("ja");
      });
    } catch (_) {
      cachedJaVoices = [];
    }
    return cachedJaVoices;
  }

  function pickJapaneseVoice() {
    const list = cachedJaVoices?.length ? cachedJaVoices : refreshJapaneseVoices();
    if (!list.length) return null;
    const score = (v) => {
      const n = (v.name || "").toLowerCase();
      const lang = (v.lang || "").toLowerCase();
      let s = 0;
      if (lang.startsWith("ja-jp")) s += 12;
      else if (lang.startsWith("ja")) s += 8;
      if (/haruka|ichiro|ayumi|kyoko|nanami|keita|google.*japan|japanese|日本/.test(n)) s += 25;
      if (/microsoft/.test(n) && lang.startsWith("ja")) s += 15;
      if (v.localService) s += 2;
      return s;
    };
    return list.slice().sort((a, b) => score(b) - score(a))[0];
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    refreshJapaneseVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshJapaneseVoices);
  }

  function getRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    if (!recognition) {
      recognition = new SR();
      recognition.lang = "ja-JP";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
    }
    return recognition;
  }

  const ZH_GLOSS_RE = /[的了在为了把对给请这那是会能没吗呢吧啊哎连接做完购物语法变化人为自然跟读对话]/;

  function looksJapaneseForTts(s) {
    const t = (s || "").trim();
    if (!t) return false;
    if (ZH_GLOSS_RE.test(t) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return true;
    if (/[をがはでにのともへってからまでませんですます]/.test(t)) return true;
    if (/^[\u4e00-\u9fff]{2,8}$/.test(t) && !/[をがはでにの]/.test(t)) return false;
    return false;
  }

  let currentOnlineAudio = null;

  function playOnlineJapanese(line, resolve) {
    if (typeof location !== "undefined" && location.protocol === "file:") {
      resolve();
      return;
    }
    const url =
      "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ja&q=" +
      encodeURIComponent(line);
    if (currentOnlineAudio) {
      try {
        currentOnlineAudio.pause();
      } catch (_) {}
    }
    const audio = new Audio(url);
    currentOnlineAudio = audio;
    const done = () => {
      if (currentOnlineAudio === audio) currentOnlineAudio = null;
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  }

  function speak(text, rate = 0.82) {
    const line = (text || "").trim();
    if (!line || !looksJapaneseForTts(line)) return Promise.resolve();
    if (!window.speechSynthesis) {
      return new Promise((resolve) => playOnlineJapanese(line, resolve));
    }
    return new Promise((resolve) => {
      const tryOnline = () => playOnlineJapanese(line, resolve);
      let started = false;
      let watchdog = null;
      const u = new SpeechSynthesisUtterance(line);
      const voice = pickJapaneseVoice();
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang || "ja-JP";
      } else {
        u.lang = "ja-JP";
      }
      u.rate = rate;
      const finish = () => {
        if (watchdog) clearTimeout(watchdog);
        resolve();
      };
      u.onstart = () => {
        started = true;
        if (watchdog) clearTimeout(watchdog);
      };
      u.onend = finish;
      u.onerror = () => {
        if (!started) tryOnline();
        else finish();
      };
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(u);
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } catch (_) {
          tryOnline();
          return;
        }
        watchdog = setTimeout(() => {
          if (!started && !window.speechSynthesis.speaking) tryOnline();
        }, 500);
      }, 60);
    });
  }

  function normalizeJa(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[ァ-ン]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .toLowerCase();
  }

  /** 简易相似度 0–100 */
  function scorePronunciation(expected, heard, keywords = []) {
    const exp = normalizeJa(expected);
    const got = normalizeJa(heard);
    if (!got) return { score: 0, ok: false, tip: "没有听清，请靠近麦克风再试一次。" };

    const keys = keywords.length ? keywords.map(normalizeJa) : [exp];
    let hit = 0;
    keys.forEach((k) => {
      if (got.includes(k) || k.includes(got) || similarity(got, k) > 0.55) hit++;
    });
    const keyScore = Math.round((hit / keys.length) * 100);

    const sim = similarity(got, exp);
    const total = Math.round(sim * 60 + keyScore * 0.4);
    const ok = total >= 55 || hit === keys.length;

    let tip = "";
    if (!ok) {
      if (got.length < exp.length * 0.4) tip = "句子太短了，试着把整句说完。";
      else if (sim < 0.35) tip = "发音和原句差别较大，先点 🔊 听一遍，再跟读。";
      else tip = "接近了！注意语调平稳，每个音节读清楚。";
    }

    return { score: Math.min(100, total), ok, tip, heard: got, expected: exp };
  }

  function similarity(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (!longer.length) return 1;
    const dist = levenshtein(longer, shorter);
    return (longer.length - dist) / longer.length;
  }

  function levenshtein(a, b) {
    const m = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        m[i][j] =
          b.charAt(i - 1) === a.charAt(j - 1)
            ? m[i - 1][j - 1]
            : Math.min(m[i - 1][j - 1], m[i][j - 1], m[i - 1][j]) + 1;
      }
    }
    return m[b.length][a.length];
  }

  let holdResolve = null;
  let holdText = "";

  function startHoldListen() {
    const rec = getRecognition();
    if (!rec) return Promise.reject(new Error("NO_SR"));
    if (listening) {
      try {
        rec.stop();
      } catch (_) {}
    }
    holdText = "";
    return new Promise((resolve, reject) => {
      holdResolve = { resolve, reject };
      listening = true;
      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) holdText += e.results[i][0].transcript;
          else holdText += e.results[i][0].transcript;
        }
      };
      rec.onerror = (e) => {
        listening = false;
        holdResolve = null;
        reject(e.error || "error");
      };
      rec.onend = () => {
        listening = false;
        if (holdResolve) {
          const r = holdResolve;
          holdResolve = null;
          r.resolve(holdText.trim());
        }
      };
      try {
        rec.start();
        rec.continuous = true;
        rec.interimResults = true;
      } catch (e) {
        listening = false;
        holdResolve = null;
        reject(e);
      }
    });
  }

  function stopHoldListen() {
    const rec = getRecognition();
    if (rec && listening) {
      try {
        rec.stop();
      } catch (_) {}
    }
  }

  function listenOnce() {
    return new Promise((resolve, reject) => {
      const rec = getRecognition();
      if (!rec) {
        reject(new Error("NO_SR"));
        return;
      }
      listening = true;
      let done = false;
      const finish = (result, err) => {
        if (done) return;
        done = true;
        listening = false;
        if (err) reject(err);
        else resolve(result);
      };
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e) => finish(e.results[0][0].transcript);
      rec.onerror = (e) => finish(null, e.error || "error");
      rec.onend = () => {
        if (!done) finish("");
      };
      try {
        rec.start();
      } catch (e) {
        finish(null, e);
      }
    });
  }

  function bindHoldButton(btn, { onStart, onEnd, onResult, onError }) {
    const start = async (e) => {
      e.preventDefault();
      btn.classList.add("recording");
      onStart?.();
      try {
        const text = await listenOnce();
        onResult?.(text);
      } catch (err) {
        if (err?.message === "NO_SR") onError?.("not-supported");
        else onError?.(err);
      } finally {
        btn.classList.remove("recording");
        onEnd?.();
      }
    };
    btn.addEventListener("touchstart", start, { passive: false });
    btn.addEventListener("mousedown", (e) => {
      if (e.button === 0) start(e);
    });
  }

  return {
    speak,
    listenOnce,
    startHoldListen,
    stopHoldListen,
    scorePronunciation,
    normalizeJa,
    bindHoldButton,
    getRecognition,
  };
})();
