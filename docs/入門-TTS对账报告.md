# 00 入門 · TTS 对账报告

> **角色**：工程数据检查（`tts_lib` + `audit-tts-registry`），不是让用户手点每个喇叭。  
> **规范**：[TTS-语音包编号规范.md](./TTS-语音包编号规范.md) · **发布门禁**：[发布前自检.md](./发布前自检.md)

## 结论（2026-05-21）

| 项目 | 结果 |
|------|------|
| 全站需朗读 | **1101** 条（含 14/16/18 课 + 00 入門） |
| 入門相关来源（registry 带来源标记） | **125** 条（`intro-content.js` / `intro-kana-tips.js` / `intro-guide` 硬编码） |
| 本次补生成 MP3 | **114** 个（五十音单假名、协同 samples、寒暄/教室、易错 pair、demo 等） |
| **缺失 MP3** | **0** ✅ |
| 对账命令 | `python scripts/audit-tts-registry.py --write` |

入門页每个 🔊 经 `SpeakUI.btnHtml({ jp, kana, ttsLine })` → `speech-engine` 用 `tts-cache/{key}.mp3` 播放；编号与全站一致。

## 此前漏检原因

`tts_lib.MVP_SCAN_FILES` **未包含**入門数据文件，`collect_intro_requirements()` 也未跑 → 对账显示「全站 0 缺失」，但入門喇叭实际 **无 MP3**（仅靠在线 TTS 或失败）。

## 已修复

1. `scripts/tts_lib.py`  
   - 扫描 `intro-content.js`、`intro-kana-tips.js`  
   - `collect_intro_requirements()`：`samples[]`、`pair a/b`、`INTRO_GUIDE_LINES`  
2. `python scripts/build-tts-cache.py` → 新增 114 个 MP3（`ja-JP-NanamiNeural`）  
3. `docs/tts-registry.json` 已 `--write` 更新  

## 入門覆盖范围（喇叭 ↔ 数据）

| 区域 | 数据 / 代码 | 喇叭绑定 |
|------|-------------|----------|
| 五十音全景表 | `INTRO_KANA_GRID` 各 `kana` | 格内 🔊 |
| 协同手风琴 | `INTRO_SYNERGY_CATEGORIES` `samples[]` | chip 🔊 |
| 象音 / 长音 / 促音 | `kana` + `demo` | 主行 + 示例 🔊 |
| 易错对比 | `INTRO_MINIMAL_PAIRS` `a` / `b` | 每侧 🔊 |
| 寒暄 / 教室 | `INTRO_GREETINGS` / `INTRO_CLASSROOM` `jp` | 主行 🔊 |
| 先生のひとこと | `intro-kana-tips.js` `demo` | 底栏 demo 🔊 |
| 硬编码例句 | `intro-guide.js` `わたしはコーヒーを飲みます。` | 协同区 🔊 |

## 复验（任何人可跑）

```bat
批量检查语音包.bat
```

或：

```powershell
Set-Location "d:\【私人】\【小王】\日语学习"
python scripts/audit-tts-registry.py --write
```

期望：`缺失 MP3  0`。

本地试听：`intro.html`（缓存版本见 `js/share-wechat.js` 的 `CACHE_VER`，当前 **62**）。

## 备注

- **多余 MP3 ~565**：历史课次/旧文案，不影响播放。  
- **课 14/16/18 课内**仍按 MVP 冻结；本次只扩扫描与补包，不改课内 UI。  
- 若再增入門日文喇叭：改数据 → `生成语音包.bat` → 再跑对账 → 提交 `tts-cache` + `docs/tts-registry.json`。
