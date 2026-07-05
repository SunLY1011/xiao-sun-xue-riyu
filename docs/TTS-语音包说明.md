# 日语嵌入语音包（tts-cache）说明

本项目的 🔊 **只朗读日语**，禁止用中文 Windows 自带的 `speechSynthesis` 朗读带汉字的日文（会读成中文）。

## 播放顺序（固定）

1. **`tts-cache/{hash}.mp3`** — 本仓库嵌入包（edge-tts · `ja-JP-NanamiNeural`）
2. **在线日语 TTS** — Google `tl=ja`（走用户手机流量，国内需联网）
3. **本机 ja 语音** — 仅当系统已安装可靠日语语音包时才用

## 生成 / 更新语音包

```bat
生成语音包.bat
```

或：

```bash
pip install edge-tts
python scripts/build-tts-cache.py
```

- 输出：`tts-cache/*.mp3`（与 `发布包/tts-cache/` 同步）
- 哈希算法与 `js/speech-engine.js` 的 `ttsCacheKey()` **必须一致**
- 扫描：`lessons-mvp.js`、`lessons-mvp-depth.js`、**`lesson-vocab-biaori.js`**、`mini-cards.js` 等中的日文 `question` / `japanese` / `kana` / `example` 等字段

## 编号对账（发布前必须跑）

```bat
批量检查语音包.bat
```

或：

```bash
python scripts/audit-tts-registry.py --write
```

- 喇叭侧：扫描所有 `speakJa` 会用到的日文 → 编号 `key`
- 语音包：`tts-cache/{key}.mp3` 是否齐全（**缺失必须为 0**）
- 清单：`docs/tts-registry.json`（seq 1…N 与 key 对照）

`发布前自检.bat` 已内置本检查。详见 [TTS-语音包编号规范.md](./TTS-语音包编号规范.md)。

## 开发约定

| 场景 | 做法 |
|------|------|
| 单词 / 会話行 | `data-speak` JSON 里必须有 **`kana`**（或 ruby 转假名） |
| 测试题题干 | 填空题用 **`questionTts`** 写完整可读日文句，不要用带大量 `＿` 的题干直接 TTS |
| 界面中文 | 绝不传入 `speakJa`；`prepareJaTtsLine` 会过滤纯中文 |
| 本地预览 | 必须用 `http://localhost:8765/`（`打开本地预览.bat`），不要用 `file://` |
| 微信分享 | 页面可用 `github.io`；**MP3 默认走 jsDelivr**（`HYOUGA_TTS_ORIGIN`），见 [TTS-P0-P1-国内加速与SW.md](./TTS-P0-P1-国内加速与SW.md) |

## 跟读（录音 / 回放）

- 单词行、会話选项：**🔊 示范 · 🎤 录音 · ▶ 回放**（`js/shadow-speak.js`）
- 评分：`SpeechEngine.evaluatePronunciation`（微信内无语音识别时仍可按音量给提示）

## 版本缓存

改 JS/CSS 后请递增 `index.html` 中 `?v=` 与 `js/share-wechat.js` 的 `CACHE_VER`，运行 `python scripts/sync-tts-sw-manifest.py`，并递增 `HYOUGA_TTS_CACHE_VER`。
