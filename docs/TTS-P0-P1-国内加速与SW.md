# TTS P0+P1 · 国内加速与 Service Worker 预缓存

## 目标

微信转发 H5 链接后，🔊 嵌入 MP3 **首访更快、二次秒播**，减少从 GitHub Pages（海外）直拉 `tts-cache/` 的延迟。

## P0 · 语音独立 CDN 源（已落地）

| 配置 | 文件 |
|------|------|
| 页面正式域 | `js/public-url.config.js` → `HYOUGA_PUBLIC_ORIGIN` |
| 语音 MP3 根 | 同文件 → `HYOUGA_TTS_ORIGIN`（默认 jsDelivr 镜像 `@main`） |
| 缓存代际 | `HYOUGA_TTS_CACHE_VER` = `share-wechat.js` 的 `CACHE_VER` |

播放：`js/speech-engine.js` 的 `ttsMp3Url()` 优先走 `HYOUGA_TTS_ORIGIN`。

**换国内备案 OSS/COS 时**：只改 `HYOUGA_TTS_ORIGIN` 为 `https://你的域名`（不含 `/tts-cache/`），然后：

完整步骤（个人备案 + 腾讯云 COS + 与页面同域）：[国内部署-个人无公司-链接与语音.md](./国内部署-个人无公司-链接与语音.md)。

```bat
python scripts/sync-tts-sw-manifest.py
```

并 bump `CACHE_VER` / `HYOUGA_TTS_CACHE_VER`。

## P1 · Service Worker 全量预缓存（已落地）

| 文件 | 作用 |
|------|------|
| `sw.js` | 读 `tts-cache/sw-manifest.json` + `index.json`，分批 `cache.put` |
| `js/tts-sw-register.js` | 注册 SW；仅在代际变更时 `unregister` + 清 `hyouga-tts-*` |
| `tts-cache/sw-manifest.json` | `cacheVer` + `ttsBase`（由同步脚本生成） |

**注意**：首次打开仍会下载约 28MB 语音（进度事件 `hyouga-tts-precache`）；之后同机同版本走 Cache，接近秒播。

**曾有问题**：`index.html` 每次进入都 `unregister` SW，导致 P1 无效；已改为代际清理。

## 发布检查

1. `python scripts/sync-tts-sw-manifest.py`
2. `批量检查语音包.bat`（缺失 0）
3. `发布前自检.bat`
4. `git push` 后 jsDelivr `@main` 约数分钟同步；微信真机测 🔊

## 验收（微信 4G）

- 新用户：首课 10 句 🔊，P95 &lt; 3s（P0 CDN）
- 同用户第二次打开同 `?v=`：20 句无明显等待（P1 缓存命中）
