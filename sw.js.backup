/** Service Worker · P2 静态资源缓存 + TTS 语音包（支持独立 TTS CDN） */
/* global self, caches, fetch */

const MANIFEST_URL = "tts-cache/sw-manifest.json";
const INDEX_URL = "tts-cache/index.json";
const DEFAULT_BATCH = 40;

// ============================================================
// 静态资源缓存配置
// ============================================================
const CACHE_VERSION = "v410";
const STATIC_CACHE_NAME = "hyouga-static-" + CACHE_VERSION;

// 需要预缓存的应用外壳资源
const SHELL_ASSETS = [
  "./",
  "index.html",
  "intro.html",
  "share.html",
  "legal.html",
  "privacy.html",
  "cursor-miniapp-phone.html",
  "manifest.json",
  // CSS
  "css/app.css",
  "css/mvp.css",
  "css/notes-ui-system.css",
  "css/hyo-top-bar.css",
  // JS 核心
  "js/app.js",
  "js/public-url.config.js",
  "js/vocab-flash.js",
  "js/lesson-view.js",
  "js/lesson-overview.js",
  "js/notes-panel.js",
  "js/intro-guide.js",
  "js/knowledge-link.js",
  "js/l1-knowledge-card.js",
  "js/vocab-flash.js",
  "js/nav-icons.js",
  "js/l1-ui-icons.js",
  "js/share-wechat.js",
  "js/storage.js",
  "js/mvp-storage.js",
  "js/tools.js",
];

// ============================================================
// 静态资源：预缓存
// ============================================================
async function precacheShell() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const urls = SHELL_ASSETS.map((url) => {
    // 相对路径转换为绝对路径
    if (url.startsWith("./")) {
      return url.slice(2);
    }
    return url;
  });
  console.log("[SW] Pre-caching shell assets:", urls.length);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { mode: "cors", credentials: "omit" });
        if (res.ok) {
          await cache.put(url, res);
          console.log("[SW] Cached:", url);
        }
      } catch (e) {
        console.warn("[SW] Failed to cache:", url, e);
      }
    })
  );
}

// ============================================================
// 静态资源：Cache-First 策略
// ============================================================
async function serveStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res.ok) {
      await cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    // 离线时返回缓存的响应（如果有）
    const fallback = await cache.match(request);
    if (fallback) return fallback;
    return Response.error();
  }
}

// ============================================================
// TTS 相关（原有逻辑）
// ============================================================
function parseManifest(data) {
  if (!data || typeof data !== "object") return { cacheName: "hyouga-tts-v0", ttsBase: "", batchSize: DEFAULT_BATCH };
  const ver = String(data.cacheVer || "0").trim();
  const ttsBase = String(data.ttsBase || "").trim();
  const batchSize = Math.max(10, Math.min(80, Number(data.batchSize) || DEFAULT_BATCH));
  return {
    cacheName: "hyouga-tts-v" + ver,
    ttsBase: ttsBase.endsWith("/") ? ttsBase : ttsBase ? ttsBase + "/" : "",
    batchSize,
  };
}

function normalizeFileList(json) {
  if (Array.isArray(json)) return json.filter((f) => typeof f === "string" && f.endsWith(".mp3"));
  if (json && Array.isArray(json.keys)) {
    return json.keys.map((k) => String(k).replace(/\.mp3$/i, "") + ".mp3");
  }
  if (json && Array.isArray(json.files)) return json.files;
  return [];
}

async function loadPrecachePlan() {
  const cfgRes = await fetch(MANIFEST_URL, { cache: "no-store" });
  const cfg = parseManifest(cfgRes.ok ? await cfgRes.json() : {});
  const idxRes = await fetch(INDEX_URL, { cache: "no-store" });
  if (!idxRes.ok) return { ...cfg, urls: [] };
  const list = normalizeFileList(await idxRes.json());
  const urls = list.map((f) => cfg.ttsBase + f.replace(/^\//, ""));
  return { ...cfg, urls };
}

async function precacheUrls(cache, urls, batchSize) {
  let done = 0;
  const total = urls.length;
  for (let i = 0; i < urls.length; i += batchSize) {
    const chunk = urls.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await fetch(url, { mode: "cors", credentials: "omit" });
          if (res.ok) await cache.put(url, res);
        } catch (_) {}
      })
    );
    done += chunk.length;
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((c) => {
      try {
        c.postMessage({ type: "hyouga-tts-precache", done, total });
      } catch (_) {}
    });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // 预缓存应用外壳
      await precacheShell();
      // TTS 语音包预缓存
      const plan = await loadPrecachePlan();
      const cache = await caches.open(plan.cacheName);
      if (plan.urls.length) {
        console.log("[SW] precache", plan.urls.length, "MP3 →", plan.cacheName);
        await precacheUrls(cache, plan.urls, plan.batchSize);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const plan = await loadPrecachePlan().catch(() => ({ cacheName: "hyouga-tts-v0" }));
      // 清理旧缓存
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => (n.startsWith("hyouga-tts-") && n !== plan.cacheName) || n.startsWith("hyouga-static-"))
          .map((n) => {
            console.log("[SW] Deleting old cache:", n);
            return caches.delete(n);
          })
      );
      await self.clients.claim();
    })()
  );
});

function isTtsMp3Request(url) {
  return url.pathname.includes("/tts-cache/") && url.pathname.endsWith(".mp3");
}

function isStaticAsset(url) {
  const staticExtensions = [".html", ".css", ".js", ".json", ".svg", ".png", ".jpg", ".webp", ".woff", ".woff2"];
  const pathname = url.pathname.toLowerCase();
  return staticExtensions.some((ext) => pathname.endsWith(ext)) ||
         pathname === "/" ||
         pathname.endsWith("/");
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 跳过非同源请求
  if (url.origin !== self.location.origin) return;

  // TTS 语音包：Cache-First + 后台更新
  if (isTtsMp3Request(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request, { mode: "cors", credentials: "omit" });
          if (res.ok) {
            const plan = await loadPrecachePlan().catch(() => ({ cacheName: "hyouga-tts-v0" }));
            const cache = await caches.open(plan.cacheName);
            await cache.put(event.request, res.clone());
          }
          return res;
        } catch (e) {
          const fallback = await caches.match(event.request);
          if (fallback) return fallback;
          return Response.error();
        }
      })()
    );
    return;
  }

  // 静态资源：Cache-First 策略
  if (isStaticAsset(url)) {
    event.respondWith(serveStaticAsset(event.request));
    return;
  }
});
