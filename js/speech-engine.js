/**
 * 日语朗读：本地 MP3（预加载）→ 手机本机日语 TTS → 在线 TTS（短超时，走用户流量）
 * 发音评分：语音识别 + 音量分析（微信内无识别时仍可评分）
 */
const SpeechEngine = (() => {
  let recognition = null;
  let listening = false;
  let cachedJaVoices = null;
  let currentAudio = null;
  /** 取消并发朗读（双重点击 / 重复绑定） */
  let speakToken = 0;
  /** 已预热的 MP3：hash → { audio, ready, failed } */
  const mp3Warm = new Map();

  const TTS_CACHE_DIR = "tts-cache/";

  /** P0：可与页面不同源（见 js/public-url.config.js HYOUGA_TTS_ORIGIN） */
  function ttsCacheBaseUrl() {
    const custom = (typeof window !== "undefined" && window.HYOUGA_TTS_ORIGIN || "")
      .trim()
      .replace(/\/$/, "");
    if (custom && /^https:\/\//i.test(custom)) {
      return custom + "/tts-cache/";
    }
    if (typeof location !== "undefined" && /^https?:/i.test(location.protocol)) {
      const path = location.pathname.replace(/[^/]*$/, "");
      return location.origin + path + TTS_CACHE_DIR;
    }
    return "./" + TTS_CACHE_DIR;
  }

  function ttsPublicOrigin() {
    const o = (typeof window !== "undefined" && window.HYOUGA_PUBLIC_ORIGIN || "")
      .trim()
      .replace(/\/$/, "");
    if (o && /^https:\/\//i.test(o)) return o;
    return "https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2";
  }

  /** 页面同源 → 自定义 TTS 源 → Gitee 等镜像 → 公网 GitHub 根 */
  function ttsMp3UrlCandidates(line) {
    const file = `${ttsCacheKey(line)}.mp3`;
    const urls = [];
    const onGithubPages =
      typeof location !== "undefined" &&
      /github\.io$/i.test(location.hostname || "");
    if (typeof location !== "undefined" && /^https?:/i.test(location.protocol || "")) {
      const path = location.pathname.replace(/[^/]*$/, "");
      urls.push(`${location.origin}${path}tts-cache/${file}`);
    }
    const custom = (typeof window !== "undefined" && window.HYOUGA_TTS_ORIGIN || "")
      .trim()
      .replace(/\/$/, "");
    if (custom && /^https:\/\//i.test(custom)) {
      if (!onGithubPages || custom.replace(/\/$/, "") !== (location.origin + location.pathname.replace(/[^/]*$/, "")).replace(/\/$/, "")) {
        urls.push(`${custom}/tts-cache/${file}`);
      }
    }
    const mirrors = (typeof window !== "undefined" && window.HYOUGA_TTS_MIRROR_ORIGINS) || [];
    mirrors.forEach((origin) => {
      const o = String(origin || "").trim().replace(/\/$/, "");
      if (o && /^https:\/\//i.test(o)) urls.push(`${o}/tts-cache/${file}`);
    });
    urls.push(`${ttsPublicOrigin()}/tts-cache/${file}`);
    return [...new Set(urls)];
  }
  /** 直链 Audio 兜底等待（微信已优先 fetch，不再傻等 4.5s） */
  const MP3_WAIT_MS = 2200;
  const MP3_WAIT_WECHAT_MS = 3200;
  const MP3_READY_MS = 2800;
  const MP3_READY_WECHAT_MS = 3500;
  /** 预热已判定无包时，不再傻等满额 MP3_READY_MS */
  const MP3_READY_FAILED_MS = 120;
  const MP3_DIRECT_FAILED_MS = 700;
const FETCH_MP3_MS = 8000;
const FETCH_MP3_MS_DESKTOP = 5000;
  let audioUnlocked = false;
  const ONLINE_TTS_MS = 3200;
  let loadingListener = null;
  const ONLINE_TTS_URLS = [
    "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ja&q=",
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=",
  ];

  const CHINESE_LESSON_RE =
    /动词|形容词|名词|语法|购物|百货|连接|变化|请求|进行|建议|做完|为了|现实|教材|课后|巩固|三个|关系|会话|测试|网络|上一|下一|关闭/;

  function ttsCacheKey(jp) {
    const s = (jp || "").trim();
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16);
  }

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent || "");
  }

  function preferFetchMp3() {
    const ua = navigator.userAgent || "";
    return isWeChatBrowser() || /iPhone|iPad|iPod|Android/i.test(ua);
  }

  /** 微信内 Google 在线 TTS 几乎不可用，跳过以免拖到 1 分钟+ */
  function shouldUseOnlineTts() {
    return !isWeChatBrowser();
  }

  function notifyLoading(on) {
    try {
      loadingListener?.(!!on);
    } catch (_) {}
  }

  function setLoadingListener(fn) {
    loadingListener = typeof fn === "function" ? fn : null;
  }

  async function fetchMp3Blob(line, token) {
    if (token != null && token !== speakToken) return null;
    if (typeof location !== "undefined" && location.protocol === "file:") return null;
    const ms = preferFetchMp3() ? FETCH_MP3_MS : FETCH_MP3_MS_DESKTOP;
    for (const url of ttsMp3UrlCandidates(line)) {
      const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
      try {
        const res = await fetch(url, {
          cache: "force-cache",
          credentials: "omit",
          signal: ctrl?.signal,
        });
        if (token != null && token !== speakToken) return null;
        if (!res.ok) continue;
        const blob = await res.blob();
        if (blob.size < 200) continue;
        return blob;
      } catch (_) {
        /* try next origin */
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    return null;
  }

  /** 微信 / 手机：首次点击解锁音频（否则 play() 无声） */
  function unlockAudioOnce() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      const silent = new Audio(
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      );
      silent.volume = 0.01;
      const p = silent.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {}
  }

  // Global: unlock audio on first user touch/click anywhere
  if (typeof document !== "undefined") {
    var _unlocked = false;
    function _globalUnlock() {
      if (_unlocked) return;
      _unlocked = true;
      unlockAudioOnce();
      document.removeEventListener("touchstart", _globalUnlock);
      document.removeEventListener("click", _globalUnlock);
    }
    document.addEventListener("touchstart", _globalUnlock, { once: false });
    document.addEventListener("click", _globalUnlock, { once: false });
  }

  function stopAllPlayback() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (_) {}
      currentAudio = null;
    }
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (_) {}
  }

  function refreshJapaneseVoices() {
    if (!window.speechSynthesis) return [];
    try {
      cachedJaVoices = window.speechSynthesis.getVoices().filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        if (lang.startsWith("zh") || lang.startsWith("cmn")) return false;
        if (/chinese|中文|mandarin|cantonese|xiaoxiao|yunxi|huihui|kangkang|ting-ting|meijia/.test(name)) {
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
      if (/haruka|ichiro|ayumi|kyoko|nanami|keita|otoya|google.*japan|japanese|日本/.test(n)) s += 25;
      if (/microsoft/.test(n) && lang.startsWith("ja")) s += 15;
      if (/edge/.test(n) && lang.startsWith("ja")) s += 10;
      if (v.localService) s += 2;
      if (/chinese|中文|mandarin/.test(n)) s -= 100;
      return s;
    };
    return list.slice().sort((a, b) => score(b) - score(a))[0];
  }

  function hasReliableLocalJaVoice() {
    const v = pickJapaneseVoice();
    if (!v) return false;
    const lang = (v.lang || "").toLowerCase();
    const name = (v.name || "").toLowerCase();
    if (lang.startsWith("zh") || /chinese|中文|mandarin/.test(name)) return false;
    return lang.startsWith("ja");
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

  function resolveJaText(input) {
    if (input == null) return "";
    if (typeof input === "object") {
      const o = input;
      return (
        o.japanese ||
        o.jp ||
        o.titleJa ||
        (o.title && !CHINESE_LESSON_RE.test(o.title) ? o.title : "") ||
        o.example ||
        o.explain ||
        o.explanation ||
        ""
      ).trim();
    }
    return String(input).trim();
  }

  function isChineseLearningText(s) {
    const t = (s || "").trim();
    if (!t) return true;
    if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(t) === false) return true;
    if (CHINESE_LESSON_RE.test(t) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return true;
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) {
      if (/^(动词|形容词|名词|语法|购物|百货)$/.test(t)) return true;
      return false;
    }
    const han = (t.match(/[\u4e00-\u9fff]/g) || []).length;
    const kana = (t.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    if (han > 0 && kana === 0 && han / t.length > 0.85) return true;
    return false;
  }

  /** 只去掉纯中文括号注，保留含假名的日文括号（如「自然の変化」） */
  function stripChineseParens(line) {
    const stripIfChinese = (inner) => {
      const t = (inner || "").trim();
      if (!t) return true;
      if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;
      if (/[\u4e00-\u9fff]/.test(t) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return true;
      return false;
    };
    return line
      .replace(/（([^）]*)）/g, (m, inner) => (stripIfChinese(inner) ? "" : m))
      .replace(/\(([^)]*)\)/g, (m, inner) => (stripIfChinese(inner) ? "" : m));
  }

  function splitExampleParts(text) {
    return (text || "")
      .split(/[/／]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** 填空题题干：去掉 ＿ 等，避免朗读「带空格的句子」 */
  function stripFillBlanks(line) {
    return (line || "")
      .replace(/[＿_…]+/g, "")
      .replace(/[「」『』]/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  function prepareJaTtsLine(raw) {
    let line = resolveJaText(raw);
    line = stripFillBlanks(line);
    line = stripChineseParens(line);
    /* 与 grammar denseSpeakLine / tts_lib 一致：箭头句读「正确侧」例句 */
    if (/[→⇔]/.test(line)) {
      const parts = line.split(/[→⇔]/).map((s) => s.trim()).filter(Boolean);
      line = (parts.length ? parts[parts.length - 1] : line).replace(/。$/, "");
    }
    if (!line || isChineseLearningText(line)) return "";
    return line;
  }

  function warmPhrase(line) {
    const key = ttsCacheKey(line);
    const prev = mp3Warm.get(key);
    if (prev && !prev.failed) return prev;
    const urls = ttsMp3UrlCandidates(line);
    const audio = new Audio();
    audio.setAttribute("playsinline", "true");
    audio.playsInline = true;
    audio.preload = "auto";
    const entry = { audio, ready: false, failed: false, key, urls, urlIdx: 0 };
    const markReady = () => {
      entry.ready = true;
    };
    const loadAt = (idx) => {
      if (idx >= urls.length) {
        entry.failed = true;
        return;
      }
      entry.urlIdx = idx;
      entry.ready = false;
      audio.src = urls[idx];
      try {
        audio.load();
      } catch (_) {}
    };
    audio.addEventListener("canplaythrough", markReady);
    audio.addEventListener("loadeddata", markReady);
    audio.addEventListener("error", () => {
      entry.failCount = (entry.failCount || 0) + 1;
      if (entry.urlIdx + 1 < urls.length) loadAt(entry.urlIdx + 1);
      else entry.failed = true;
    });
    loadAt(0);
    mp3Warm.set(key, entry);
    return entry;
  }

  function warmPhrases(lines) {
    const seen = new Set();
    (lines || []).forEach((raw) => {
      const candidates =
        raw && typeof raw === "object" ? fallbackLines(raw) : [prepareJaTtsLine(raw)];
      candidates.forEach((line) => {
        if (!line || seen.has(line)) return;
        seen.add(line);
        warmPhrase(line);
      });
    });
  }

  /** 喇叭按钮 data-tts-key：与 tts-cache/{key}.mp3 同一编号 */
  function primaryTtsKey(textOrObj) {
    const candidates = fallbackLines(textOrObj);
    const line = candidates[0];
    return line ? ttsCacheKey(line) : "";
  }

  function ttsMp3Url(line) {
    const c = ttsMp3UrlCandidates(line);
    return c[0] || `${ttsCacheBaseUrl()}${ttsCacheKey(line)}.mp3`;
  }

  /** fetch→blob（带超时） */
  async function playBundledMp3Fetch(line, token) {
    const blob = await fetchMp3Blob(line, token);
    if (!blob) return false;
    const blobUrl = URL.createObjectURL(blob);
    const ok = await playAudioUrl(blobUrl, token);
    URL.revokeObjectURL(blobUrl);
    return ok;
  }

  function waitForMp3Ready(entry, maxMs) {
    return new Promise((resolve) => {
      if (!entry?.audio) {
        resolve(false);
        return;
      }
      if (entry.failed) {
        resolve(false);
        return;
      }
      const a = entry.audio;
      if (entry.ready || a.readyState >= 3) {
        resolve(true);
        return;
      }
      const done = (ok) => {
        a.removeEventListener("canplaythrough", onOk);
        a.removeEventListener("loadeddata", onOk);
        a.removeEventListener("error", onErr);
        resolve(!!ok);
      };
      const onOk = () => {
        entry.ready = true;
        done(true);
      };
      const onErr = () => {
        entry.failCount = (entry.failCount || 0) + 1;
        if (entry.failCount >= 2) entry.failed = true;
        done(false);
      };
      a.addEventListener("canplaythrough", onOk, { once: true });
      a.addEventListener("loadeddata", onOk, { once: true });
      a.addEventListener("error", onErr, { once: true });
      try {
        a.load();
      } catch (_) {}
      const poll = setInterval(() => {
        if (entry.failed) {
          clearInterval(poll);
          done(false);
        } else if (entry.ready || a.readyState >= 3) {
          clearInterval(poll);
          done(true);
        }
      }, 90);
      setTimeout(() => {
        clearInterval(poll);
        done(entry.ready || a.readyState >= 2);
      }, maxMs);
    });
  }

  /** 播放已预热的同一条 MP3（避免另起 Audio 导致超时后切本机 TTS 断续） */
  function playWarmMp3Entry(entry, token) {
    return new Promise((resolve) => {
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      const audio = entry?.audio;
      if (!audio) {
        resolve(false);
        return;
      }
      stopAllPlayback();
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        if (currentAudio === audio) currentAudio = null;
        resolve(!!ok);
      };
      audio.currentTime = 0;
      currentAudio = audio;
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      try {
        const p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(() => {}).catch(() => finish(false));
        }
      } catch (_) {
        finish(false);
      }
    });
  }

  /** 直链 MP3（预热失败时兜底 · 多源依次试） */
  function playBundledMp3Direct(line, token, waitMs) {
    const urls = ttsMp3UrlCandidates(line);
    const perUrl = Math.max(900, Math.floor(waitMs / Math.max(1, urls.length)));
    const tryOne = (url) =>
      new Promise((resolve) => {
        if (token != null && token !== speakToken) {
          resolve(false);
          return;
        }
        let settled = false;
        const finish = (ok) => {
          if (settled) return;
          settled = true;
          resolve(!!ok);
        };
        stopAllPlayback();
        const audio = new Audio(url);
        audio.setAttribute("playsinline", "true");
        audio.playsInline = true;
        audio.preload = "auto";
        currentAudio = audio;
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
          finish(true);
        };
        audio.onerror = () => finish(false);
        try {
          const p = audio.play();
          if (p && typeof p.catch === "function") p.catch(() => finish(false));
        } catch (_) {
          finish(false);
        }
        setTimeout(() => finish(false), perUrl);
      });
    return (async () => {
      for (const url of urls) {
        if (token != null && token !== speakToken) return false;
        if (await tryOne(url)) return true;
      }
      return false;
    })();
  }

  /** ① 嵌入语音包：预热 → 同元素播放 → fetch → 直链（无包时快速让给在线/本机） */
  async function playBundledMp3(line, token) {
    const entry = warmPhrase(line);
    if (entry.failed) {
      return false;
    }
    const readyMs = entry.failed
      ? MP3_READY_FAILED_MS
      : preferFetchMp3()
        ? MP3_READY_WECHAT_MS
        : MP3_READY_MS;
    if (await waitForMp3Ready(entry, readyMs)) {
      const ok = await playWarmMp3Entry(entry, token);
      if (ok) return true;
    }
    if (entry.failed) {
      return false;
    }
    const directWait = entry.failed
      ? MP3_DIRECT_FAILED_MS
      : preferFetchMp3()
        ? isWeChatBrowser()
          ? MP3_WAIT_WECHAT_MS
          : MP3_WAIT_MS
        : MP3_WAIT_MS;
    if (preferFetchMp3()) {
      const ok = await playBundledMp3Fetch(line, token);
      if (ok) return true;
      if (entry.failed) return false;
      return playBundledMp3Direct(line, token, directWait);
    }
    const okDirect = await playBundledMp3Direct(line, token, directWait);
    if (okDirect) return true;
    if (entry.failed) return false;
    return playBundledMp3Fetch(line, token);
  }

  function isMostlyKana(line) {
    const t = (line || "").trim();
    if (!t) return false;
    const kana = (t.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    return kana >= Math.max(1, t.length * 0.45);
  }

  function playAudioUrl(url, token) {
    return new Promise((resolve) => {
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      stopAllPlayback();
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      const audio = new Audio(url);
      audio.setAttribute("playsinline", "true");
      audio.playsInline = true;
      currentAudio = audio;
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        if (currentAudio === audio) currentAudio = null;
        resolve(!!ok);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(() => finish(false));
    });
  }

  async function playOnlineJapaneseWithTimeout(line, token) {
    if (!shouldUseOnlineTts()) return false;
    return Promise.race([
      playOnlineJapanese(line, 0, token),
      new Promise((r) => setTimeout(() => r(false), ONLINE_TTS_MS)),
    ]);
  }

  /** ③ 在线日语 TTS（仅桌面备用；微信内跳过） */
  async function playOnlineJapanese(line, urlIndex = 0, token) {
    if (!shouldUseOnlineTts()) return false;
    if (token != null && token !== speakToken) return false;
    if (typeof location !== "undefined" && location.protocol === "file:") return false;
    if (urlIndex >= ONLINE_TTS_URLS.length) return false;
    const src = ONLINE_TTS_URLS[urlIndex] + encodeURIComponent(line);
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ONLINE_TTS_MS) : null;
    try {
      const res = await fetch(src, { mode: "cors", credentials: "omit", signal: ctrl?.signal });
      if (token != null && token !== speakToken) return false;
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 256) {
          const blobUrl = URL.createObjectURL(blob);
          const ok = await playAudioUrl(blobUrl, token);
          URL.revokeObjectURL(blobUrl);
          if (ok) return true;
        }
      }
    } catch (_) {
    } finally {
      if (timer) clearTimeout(timer);
    }
    return playOnlineJapaneseDirect(line, urlIndex, token);
  }

  function playOnlineJapaneseDirect(line, urlIndex = 0, token) {
    return new Promise((resolve) => {
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      if (urlIndex >= ONLINE_TTS_URLS.length) {
        resolve(false);
        return;
      }
      stopAllPlayback();
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      const audio = new Audio(ONLINE_TTS_URLS[urlIndex] + encodeURIComponent(line));
      audio.setAttribute("playsinline", "true");
      audio.playsInline = true;
      currentAudio = audio;
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        if (currentAudio === audio) currentAudio = null;
        resolve(!!ok);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => playOnlineJapaneseDirect(line, urlIndex + 1, token).then(resolve);
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => playOnlineJapaneseDirect(line, urlIndex + 1, token).then(resolve));
      }
    });
  }

  /** ③ 本机日语（宽松：有 ja 就用） */
  function playLocalSynthesis(line, rate = 0.85, strict = true, token) {
    return new Promise((resolve) => {
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      if (!window.speechSynthesis) {
        resolve(false);
        return;
      }
      if (strict && !hasReliableLocalJaVoice()) {
        resolve(false);
        return;
      }
      stopAllPlayback();
      if (token != null && token !== speakToken) {
        resolve(false);
        return;
      }
      refreshJapaneseVoices();
      const voice = pickJapaneseVoice();
      let started = false;
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        if (token != null && token !== speakToken) {
          resolve(false);
          return;
        }
        resolve(!!ok);
      };
      const u = new SpeechSynthesisUtterance(line);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang || "ja-JP";
      } else {
        u.lang = "ja-JP";
      }
      u.rate = rate;
      u.onstart = () => {
        started = true;
      };
      u.onend = () => finish(true);
      u.onerror = () => finish(false);
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
      try {
        window.speechSynthesis.speak(u);
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } catch (_) {
        finish(false);
        return;
      }
      setTimeout(() => {
        if (token != null && token !== speakToken) {
          finish(false);
          return;
        }
        if (!started && !done && !window.speechSynthesis.speaking) finish(false);
      }, 900);
    });
  }

  function rubyKanaLine(text, segments) {
    if (!text || !segments?.length) return "";
    if (typeof RubyRender !== "undefined" && RubyRender.toKanaReading) {
      return RubyRender.toKanaReading(text, segments);
    }
    let s = text;
    segments.forEach(({ kanji, reading }) => {
      if (kanji && reading) s = s.split(kanji).join(reading);
    });
    return s;
  }

  function pushLine(lines, raw) {
    const line = prepareJaTtsLine(raw);
    if (line && !lines.includes(line)) lines.push(line);
  }

  async function trySpeakLine(line, rate = 0.85, token) {
    if (!line) return false;
    if (token != null && token !== speakToken) return false;
    unlockAudioOnce();
    if (await playBundledMp3(line, token)) {
      if (token != null && token !== speakToken) return false;
      return true;
    }
    if (token != null && token !== speakToken) return false;
    if (await playOnlineJapaneseWithTimeout(line, token)) {
      if (token != null && token !== speakToken) return false;
      return true;
    }
    if (token != null && token !== speakToken) return false;
    /* 中文 Windows 上无日语包时会把汉字读成中文，禁止宽松本机 TTS */
    if (hasReliableLocalJaVoice() && (await playLocalSynthesis(line, rate, true, token))) {
      if (token != null && token !== speakToken) return false;
      return true;
    }
    return false;
  }

  /** 不得调用 primaryTtsKey（其内部会再调 fallbackLines → 栈溢出） */
  function preferredTtsKeyFromObj(textOrObj) {
    if (!textOrObj || typeof textOrObj !== "object") return "";
    const prefer = [];
    if (textOrObj.ttsLine) pushLine(prefer, textOrObj.ttsLine);
    if (textOrObj.questionTts) pushLine(prefer, textOrObj.questionTts);
    if (textOrObj.kana) pushLine(prefer, textOrObj.kana);
    return prefer[0] ? ttsCacheKey(prefer[0]) : "";
  }

  function sortCandidatesByPrimary(lines, textOrObj) {
    const key = preferredTtsKeyFromObj(textOrObj);
    if (!key || !lines.length) return lines;
    const idx = lines.findIndex((l) => ttsCacheKey(l) === key);
    if (idx <= 0) return lines;
    const out = lines.slice();
    const [hit] = out.splice(idx, 1);
    out.unshift(hit);
    return out;
  }

  function fallbackLines(textOrObj) {
    const lines = [];
    if (textOrObj && typeof textOrObj === "object" && textOrObj.onlyTtsLine && textOrObj.ttsLine) {
      pushLine(lines, textOrObj.ttsLine);
      return lines;
    }
    if (textOrObj && typeof textOrObj === "object") {
      const jp = textOrObj.jp || textOrObj.japanese || textOrObj.title || "";
      const ruby =
        textOrObj.ruby || textOrObj.japaneseRuby || textOrObj.titleRuby || textOrObj.lessonTitleRuby;
      if (textOrObj.ttsLine) pushLine(lines, textOrObj.ttsLine);
      if (textOrObj.questionTts) pushLine(lines, textOrObj.questionTts);
      if (textOrObj.kana) pushLine(lines, textOrObj.kana);
      const fromRuby = rubyKanaLine(jp, ruby);
      if (fromRuby) pushLine(lines, fromRuby);
      if (!/[＿_]{2,}/.test(jp)) pushLine(lines, jp);
      if (textOrObj.example) {
        const parts = splitExampleParts(textOrObj.example);
        if (parts.length > 1) {
          parts.forEach((part) => pushLine(lines, { jp: part, ruby: textOrObj.exampleRuby }));
        } else {
          pushLine(lines, textOrObj.example);
        }
      }
    } else {
      const s = String(textOrObj || "");
      if (!/[＿_]{2,}/.test(s)) pushLine(lines, s);
    }
    return sortCandidatesByPrimary(lines, textOrObj);
  }

  /**
   * 唯一朗读入口：MP3 → 在线 → 本机；优先 data-tts-key 对应的一句，避免多候选切换音色断续
   */
  async function speakJa(textOrObj, rate = 0.85, options) {
    const token = ++speakToken;
    const preferKey = options?.preferTtsKey || "";
    stopAllPlayback();
    notifyLoading(true);
    try {
      let candidates = fallbackLines(textOrObj);
      if (!candidates.length) return false;
      if (preferKey) {
        const keyed = candidates.filter((l) => ttsCacheKey(l) === preferKey);
        if (keyed.length) candidates = keyed;
      }
      warmPhrases(candidates);
      for (let i = 0; i < candidates.length; i++) {
        if (token !== speakToken) return false;
        const line = candidates[i];
        if (await trySpeakLine(line, rate, token)) {
          if (token !== speakToken) return false;
          return true;
        }
        if (preferKey) break;
        if (i >= 1) break;
      }
      return false;
    } finally {
      if (token === speakToken) notifyLoading(false);
    }
  }

  function speak(text, rate) {
    return speakJa(text, rate);
  }

  function normalizeJa(s) {
    return (s || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[ァ-ン]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .toLowerCase();
  }

  const KEYWORD_STOP = new Set([
    "です",
    "ます",
    "ました",
    "でした",
    "ですか",
    "ません",
    "から",
    "けど",
    "でも",
    "とても",
    "ちょっと",
    "そう",
    "はい",
    "あの",
    "この",
    "その",
    "また",
    "もう",
    "まだ",
    "ので",
    "には",
    "では",
    "へ",
    "を",
    "に",
    "が",
    "は",
    "の",
    "と",
    "も",
    "て",
    "で",
    "い",
    "な",
    "だ",
    "する",
    "なる",
    "ある",
    "いる",
    "れる",
    "られる",
    "ください",
    "ましょう",
  ]);

  function textOverlapRatio(spoken, target) {
    const A = normalizeJa(spoken);
    const B = normalizeJa(target);
    if (!A || !B) return 0;
    let hit = 0;
    for (const ch of B) if (A.includes(ch)) hit++;
    return hit / B.length;
  }

  /** 从会话句自动提取关键词（② 会話评分用） */
  function extractKeywordsFromJapanese(jp, max = 6) {
    if (!jp) return [];
    const chunks = jp.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fafー]{2,10}/g) || [];
    const out = [];
    for (const w of chunks) {
      const n = normalizeJa(w);
      if (n.length < 2 || KEYWORD_STOP.has(n)) continue;
      if (!out.includes(n)) out.push(n);
      if (out.length >= max) break;
    }
    return out;
  }

  const SCORE_DIM_META = [
    { key: "keyword", label: "关键词", icon: "🏷", tone: "kw" },
    { key: "clarity", label: "清晰度", icon: "🔉", tone: "cl" },
    { key: "match", label: "吻合度", icon: "📐", tone: "ma" },
    { key: "prosody", label: "语调", icon: "🎵", tone: "pr" },
  ];

  function scoreDimBarHtml(meta, score10) {
    const s = Math.max(0, Math.min(10, Math.round(score10)));
    const pct = s * 10;
    return `<div class="score-dim-row score-dim--${meta.tone}">
      <span class="score-dim-label">${meta.icon} ${meta.label}</span>
      <div class="score-bar-track"><div class="score-bar-fill score-bar-fill--${meta.tone}" style="width:${pct}%"></div></div>
      <span class="score-dim-val">${s}/10</span>
    </div>`;
  }

  function renderDialogueScoreHtml(result) {
    const stars =
      result.score >= 90 ? "⭐⭐⭐" : result.score >= 75 ? "⭐⭐" : result.score >= 50 ? "⭐" : "";
    const bars = result.dims
      ? `<div class="score-bars score-bars--ten">
            ${SCORE_DIM_META.map((m) => scoreDimBarHtml(m, result.dims[m.key] ?? 0)).join("")}
          </div>`
      : "";
    const heard = result.heard
      ? `<p class="dg-score-heard">识别：${result.heard}</p>`
      : result.hasAudio
        ? `<p class="dg-score-heard dg-score-heard--warn">未识别到日文，仅分析音量，总分从严压低。</p>`
        : "";
    return `<div class="dg-score-panel dg-score-panel--inline ${result.passed ? "pass" : "retry"}">
      <div class="dg-score-head">本句发音 ${result.score} 分 ${stars}<span class="dg-score-sub">（仅针对上一段录音 · 四维各0–10）</span></div>
      <p class="dg-score-tip">${result.feedback}</p>
      ${bars}
      ${heard}
    </div>`;
  }

  function dimScoreFromRatio(ratio) {
    if (ratio >= 0.95) return 10;
    if (ratio >= 0.8) return 8;
    if (ratio >= 0.6) return 6;
    if (ratio >= 0.4) return 4;
    if (ratio >= 0.2) return 2;
    return ratio > 0 ? 1 : 0;
  }

  function dimKeywordScore(keys, heardNorm, expected, heard) {
    if (!heardNorm) return 0;
    if (!keys.length) return Math.min(8, dimMatchScore(heard, expected, heardNorm));
    const matched = keys.filter((k) => heardNorm.includes(k) || k.includes(heardNorm));
    return dimScoreFromRatio(matched.length / keys.length);
  }

  function dimClarityScore(audio, hasAudio) {
    if (!hasAudio) return 0;
    if (!audio.ok) return 2;
    if (audio.tooQuiet) return 1;
    if (audio.tooShort) return 2;
    let s = 4;
    if (audio.avgRms >= 0.018 && audio.avgRms <= 0.38) s += 2;
    if (audio.speechRatio >= 0.22) s += 1;
    if (audio.speechRatio >= 0.35) s += 1;
    if (audio.duration >= 0.75 && audio.duration <= 14) s += 2;
    return Math.min(10, s);
  }

  function dimMatchScore(heard, expected, heardNorm) {
    if (!heardNorm) return 0;
    const exp = normalizeJa(expected);
    const sim = similarity(heardNorm, exp);
    const overlap = textOverlapRatio(heard, expected);
    const blend = sim * 0.55 + overlap * 0.45;
    if (blend >= 0.93) return 10;
    if (blend >= 0.82) return 8;
    if (blend >= 0.68) return 6;
    if (blend >= 0.5) return 4;
    if (blend >= 0.32) return 2;
    return 1;
  }

  function dimProsodyScore(audio, heardNorm, expected) {
    if (!heardNorm) return 0;
    const expLen = normalizeJa(expected).length || 1;
    const lenRatio = heardNorm.length / expLen;
    let s = dimMatchScore(heardNorm, expected, heardNorm) * 0.45;
    if (lenRatio >= 0.75 && lenRatio <= 1.25) s += 3;
    else if (lenRatio >= 0.55 && lenRatio <= 1.45) s += 1;
    if (audio.ok && !audio.tooQuiet && audio.speechRatio >= 0.28 && audio.speechRatio <= 0.82) s += 2;
    return Math.min(10, Math.round(s));
  }

  /**
   * ② 会話：四维各 0–10，从严；须先录音再点评估
   */
  async function evaluateDialogueDetailed({
    expected,
    heard = "",
    audioBlob = null,
    keywords = [],
  }) {
    const keys = (keywords.length ? keywords : extractKeywordsFromJapanese(expected)).map(normalizeJa);
    const heardNorm = normalizeJa(heard);
    const hasAudio = !!(audioBlob && audioBlob.size > 200);
    const matched = keys.filter((k) => heardNorm.includes(k) || k.includes(heardNorm));

    if (!hasAudio && !heardNorm) {
      return {
        score: 0,
        passed: false,
        feedback: isWeChatBrowser()
          ? "未录到声音。请先 🎤 录音，再点 ✓ 评估。"
          : "未录到声音。请先录音，再点评估。",
        heard: "",
        matched: [],
        dims: { keyword: 0, clarity: 0, match: 0, prosody: 0 },
        hasAudio: false,
      };
    }

    let audio = { ok: false };
    if (hasAudio) {
      try {
        audio = await analyzeAudioBlob(audioBlob);
      } catch (_) {}
    }

    const dims = {
      keyword: dimKeywordScore(keys, heardNorm, expected, heard),
      clarity: dimClarityScore(audio, hasAudio),
      match: dimMatchScore(heard, expected, heardNorm),
      prosody: dimProsodyScore(audio, heardNorm, expected),
    };

    let raw40 = dims.keyword + dims.clarity + dims.match + dims.prosody;
    if (!heardNorm && hasAudio) raw40 = Math.min(raw40, dims.clarity + 4);
    let score = Math.round((raw40 / 40) * 100);
    if (!heardNorm) score = Math.min(score, 28);
    if (audio.ok && audio.tooQuiet) score = Math.min(score, 35);
    const passed = score >= 70;

    let feedback;
    if (!heardNorm && hasAudio) {
      feedback = "只听到声音、未识别日文。请对照上方句子完整朗读后再点 ✓ 评估。";
    } else if (audio.ok && audio.tooQuiet) {
      feedback = "音量偏小。靠近麦克风，安静环境，整句读完再评估。";
    } else if (score >= 90) {
      feedback = "与示范句高度一致，关键词与语调都很好！";
    } else if (score >= 75) {
      feedback = `较好。已命中：${matched.join("、") || "—"}；可再听 🔊 微调语调。`;
    } else if (score >= 70) {
      feedback = `刚及格。薄弱：${SCORE_DIM_META.filter((m) => dims[m.key] < 6).map((m) => m.label).join("、") || "—"}。`;
    } else if (score >= 45) {
      feedback = `差距较大。先 🔊 听示范再跟读。注意：${keys.slice(0, 4).join("、") || expected.slice(0, 14)}`;
    } else {
      feedback = "与目标句不一致。不要只读一两个音；请整句模仿示范的语气与语调。";
    }

    return {
      score,
      passed,
      feedback,
      heard: heard || "",
      matched,
      dims,
      hasAudio,
    };
  }

  async function analyzeAudioBlob(blob) {
    if (!blob || !blob.size) return { ok: false, reason: "empty" };
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return { ok: false, reason: "no-ctx" };
      const ctx = new Ctx();
      const buf = await blob.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(buf.slice(0));
      const ch = audioBuf.getChannelData(0);
      const sr = audioBuf.sampleRate;
      const duration = audioBuf.duration;
      let i = 0;
      const frame = Math.floor(sr * 0.04);
      let rmsSum = 0;
      let voiced = 0;
      let frames = 0;
      while (i < ch.length) {
        const end = Math.min(i + frame, ch.length);
        let e = 0;
        for (let j = i; j < end; j++) e += ch[j] * ch[j];
        const rms = Math.sqrt(e / (end - i));
        frames++;
        rmsSum += rms;
        if (rms > 0.018) voiced++;
        i = end;
      }
      const avgRms = frames ? rmsSum / frames : 0;
      const speechRatio = frames ? voiced / frames : 0;
      try {
        ctx.close();
      } catch (_) {}
      return {
        ok: true,
        duration,
        avgRms,
        speechRatio,
        tooQuiet: avgRms < 0.012 || speechRatio < 0.12,
        tooShort: duration < 0.45,
      };
    } catch (_) {
      return { ok: false, reason: "decode" };
    }
  }

  /**
   * 综合评分：语音识别文本 + 录音音量（微信内无识别时仍可凭音量及格）
   */
  async function evaluatePronunciation({ expected, heard = "", audioBlob = null, keywords = [] }) {
    const textResult = scorePronunciation(expected, heard, keywords);
    let audio = { ok: false };
    if (audioBlob) {
      try {
        audio = await analyzeAudioBlob(audioBlob);
      } catch (_) {}
    }

    let score = textResult.score;
    let ok = textResult.ok;
    let tip = textResult.tip;

    if (audio.ok) {
      if (audio.tooQuiet) {
        score = Math.min(score, 48);
        ok = false;
        tip = tip || "声音偏小，请靠近麦克风再录一次。";
      } else if (audio.tooShort) {
        score = Math.min(score, 52);
        ok = false;
        tip = tip || "录音太短，请把整句说完。";
      } else if (!heard && audio.duration >= 0.65 && !audio.tooQuiet) {
        score = Math.max(score, 62);
        ok = true;
        tip = "音量清晰。若需更准，可再听示范跟读一遍。";
      } else if (heard && score < 55 && audio.duration >= 0.5) {
        score = Math.max(score, 58);
      }
    }

    if (!heard && !audio.ok && !audioBlob) {
      return {
        score: 0,
        ok: false,
        tip: "未录到声音。请允许麦克风后，按住「说话」或点「录音」。",
        heard: "",
        expected: textResult.expected,
        mode: "none",
      };
    }

    return {
      score: Math.min(100, score),
      ok,
      tip: ok ? (tip || "很棒！") : tip || textResult.tip,
      heard: textResult.heard,
      expected: textResult.expected,
      mode: heard ? (ok ? "speech" : "speech+audio") : audio.ok ? "audio" : "weak",
    };
  }

  function scorePronunciation(expected, heard, keywords = []) {
    const exp = normalizeJa(expected);
    const got = normalizeJa(heard);
    if (!got) return { score: 0, ok: false, tip: "聞き取れませんでした。もう一度、マイクに近づいてください。" };

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
      if (got.length < exp.length * 0.4) tip = "短すぎます。文全体を言ってみましょう。";
      else if (sim < 0.35) tip = "🔊 お手本を聞いてから、もう一度。";
      else tip = "もう少し！イントネーションに気をつけて。";
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
          holdText += e.results[i][0].transcript;
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
    speakJa,
    speak,
    prepareJaTtsLine,
    ttsCacheKey,
    primaryTtsKey,
    warmPhrase,
    warmPhrases,
    listenOnce,
    startHoldListen,
    stopHoldListen,
    scorePronunciation,
    evaluatePronunciation,
    evaluateDialogueDetailed,
    extractKeywordsFromJapanese,
    renderDialogueScoreHtml,
    analyzeAudioBlob,
    normalizeJa,
    bindHoldButton,
    getRecognition,
    pickJapaneseVoice,
    unlockAudioOnce,
    isWeChatBrowser,
    stopAllPlayback,
    setLoadingListener,
  };
})();
