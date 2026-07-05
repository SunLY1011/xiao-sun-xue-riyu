# TTS 语音包编号规范（喇叭 ⇄ MP3 对账）

## 原则

| 侧 | 含义 | 编号 |
|----|------|------|
| **喇叭 🔊** | 每条需要朗读的日文（与 `speakJa` 实际尝试的句子一致） | HTML `data-tts-key="{key}"` |
| **语音包** | 预生成 MP3 | 文件 `tts-cache/{key}.mp3` |

`{key}` = `speech-engine.js` 的 `ttsCacheKey(朗读句)`，与 `scripts/tts_lib.py` 的 `tts_key()` **算法相同**。

发布前必须满足：

```text
需朗读条数（registry.requiredCount，当前 MVP 约 **862** 条）中，每一条都有对应 MP3（missingCount = 0）
```

MP3 文件总数可以 **多于** 需求（历史遗留 `orphan`），但不能 **少**。

## 批量检查（不要手查）

```bat
批量检查语音包.bat
```

或：

```bash
python scripts/audit-tts-registry.py --write
```

输出示例：

```text
需朗读（喇叭）  612 条
tts-cache MP3  1025 个文件
缺失 MP3      0
```

- 有 `[MISS]` → 运行 `生成语音包.bat`，再重跑对账
- `--write` 会更新 `docs/tts-registry.json`（含 `seq` 序号 1…N、`key`、`line`、`sources`）

## 发布前自检（强制）

`发布前自检.bat` → `pre-ship-check.py` → 自动执行 `audit-tts-registry.py --write`。

未通过 **不得 push**。

## 扫描范围（易漏来源）

`tts_lib.collect_requirements()` 覆盖：

- `lessons-mvp.js` 文型 title / example（含 `/` 分句、`→` 后 dense 句）
- `lessons-mvp-depth.js` 课外 **denseList / pair / list** 的 `jp` `kana` `bad` `good`
- `lesson-vocab-biaori.js` 单词 `kana` / `jp` / `example`
- 测验 `questionTts`（填空朗读句）
- 会話课文 `lessons-data.js` 的 `japanese`
- **会話 ABC 三答**：`l1-dialogue-abc.js` · `unit1-dialogue-abc-l234.js` · `unit2-dialogue-abc-l5-8.js` · `lessons-9-24-dialogue-abc.js`（B/C 变体句必扫）
- **知识卡会話行**：`unit1/2-knowledge-tips.js` · `lessons-9-24-knowledge-tips.js` 内 `lines[].ja`
- **单元条带气泡**：`unit-strip-storyboard.js` 内 `bubbles[].jp`

与页面 `grammar-network.js` 的 `denseSpeakLine`（`→` 取后半）对齐。

## 新增日文喇叭时

1. 在数据里写好日文（单词带 `kana`；填空用 `questionTts`）
2. `python scripts/build-tts-cache.py` 或 `生成语音包.bat`
3. `python scripts/audit-tts-registry.py` 确认 `缺失 0`
4. 提交 `tts-cache/*.mp3` 与 `docs/tts-registry.json`

## 相关文件

| 文件 | 作用 |
|------|------|
| `scripts/tts_lib.py` | 收集朗读需求、生成 registry |
| `scripts/audit-tts-registry.py` | 对账报告 |
| `docs/tts-registry.json` | 编号清单（seq ↔ key ↔ 日文） |
| `tts-cache/registry.json` | 精简 key 列表 |
| `js/speak-ui.js` | 喇叭 `data-tts-key` |
| `docs/TTS-语音包说明.md` | 播放顺序与生成说明 |
