# -*- coding: utf-8 -*-
"""
TTS 语音包公共库：与 js/speech-engine.js 的 ttsCacheKey / prepareJaTtsLine / fallbackLines 对齐。
喇叭按钮 data-tts-key 与 tts-cache/{key}.mp3 使用同一编号（十六进制哈希）。
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / "tts-cache"
MANIFEST_PATH = ROOT / "docs" / "tts-registry.json"

# 与 index.html 实际加载一致（MVP 主站）
MVP_SCAN_FILES = [
    ROOT / "js" / "data" / "lessons-data.js",
    ROOT / "js" / "data" / "lessons-mvp.js",
    ROOT / "js" / "data" / "lessons-mvp-depth.js",
    ROOT / "js" / "data" / "lesson-vocab-biaori.js",
    ROOT / "js" / "data" / "mini-cards.js",
    ROOT / "js" / "data" / "intro-kana-tips.js",
    ROOT / "js" / "data" / "intro-content.js",
    ROOT / "js" / "data" / "l1-knowledge-tips.js",
    # 会話 ABC（A/B/C 三答 · 喇叭朗读）
    ROOT / "js" / "data" / "l1-dialogue-abc.js",
    ROOT / "js" / "data" / "unit1-dialogue-abc-l234.js",
    ROOT / "js" / "data" / "unit2-dialogue-abc-l5-8.js",
    ROOT / "js" / "data" / "lessons-9-24-dialogue-abc.js",
    # 知识卡会話行（lines[].ja）
    ROOT / "js" / "data" / "unit1-knowledge-tips.js",
    ROOT / "js" / "data" / "unit2-knowledge-tips.js",
    ROOT / "js" / "data" / "lessons-9-24-knowledge-tips.js",
    # 单元条带气泡（与课文对齐 · 部分 B/C 变体）
    ROOT / "js" / "data" / "unit-strip-storyboard.js",
]

# 选修 / 旧包（不纳入发布前必检，可 --full 扫描）
OPTIONAL_SCAN_FILES = [
    ROOT / "js" / "data" / "scenarios.js",
    ROOT / "发布包" / "app.js",
    ROOT / "发布包" / "lesson-dialogues.js",
]

SCAN_FILES = MVP_SCAN_FILES

# 与 build-tts-cache.py 一致，并扩展 questionTts / meaningJa / line / bad / good
_JP_FIELD = (
    r"lessonTitle|title|example|explain|explanation|japanese|question|questionTts|"
    r"pattern|timeline|mistake|jp|ja|kana|meaningJa|line|bad|good|text|answer"
)
STRING_KEYS = re.compile(
    rf'(?:"(?:{_JP_FIELD})"|(?:{_JP_FIELD}))\s*:\s*"((?:\\.|[^"\\])*)"',
    re.MULTILINE,
)

CHINESE_MARKERS = re.compile(
    r"动词|形容词|名词|语法|购物|百货|连接|变化|请求|进行|建议|三个|关系|会话|测试|网络|"
    r"比：|前：|后：|必修|选修|ロボット|也|更|请|对：|错：|积极|人がドア|图书馆|电脑|职业|"
    r"丁寧：|専用|禁止|区分|一方|另一方|要对比|不要|必须|可以|应该|已经|因为|所以|如果|"
    r"这个|那个|什么|怎么|为什么|注意|提示|说明|意思|用法|区别|场景|搭配"
)

SKIP_FIELDS = frozenset({
    "explanation", "explain", "explanationZh", "meaningZh", "chinese", "noteZh", "zh", "noteJa",
})

SKIP_PREFIX = re.compile(r"^[\s📖🔗⚠️]+")

EXTRA_PHRASES = [
    "こんにちは。音声のテストです。",
    "動詞のて形",
    "昨日デパートへ行って、買い物しました",
]

# 运行时硬编码 / 补丁（与 build-tts-cache 一致）
HARDCODED_PATCHES = EXTRA_PHRASES


@dataclass
class TtsRequirement:
    """一条需要 MP3 的朗读线（与 speakJa 实际尝试的候选句一致）"""
    line: str
    key: str
    sources: list[str] = field(default_factory=list)

    def add_source(self, src: str) -> None:
        if src not in self.sources:
            self.sources.append(src)


def tts_key(jp: str) -> str:
    s = (jp or "").strip()
    h = 0
    for ch in s:
        h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
    return format(h, "x")


def is_chinese_learning_text(s: str) -> bool:
    """对齐 speech-engine.js isChineseLearningText"""
    t = (s or "").strip()
    if not t:
        return True
    if not re.search(r"[\u3040-\u30ff\u4e00-\u9fff]", t):
        return True
    if re.search(r"第\d+课", t) and not re.search(r"[\u3040-\u309f\u30a0-\u30ff]", t):
        return True
    kana = len(re.findall(r"[\u3040-\u309f\u30a0-\u30ff]", t))
    han = len(re.findall(r"[\u4e00-\u9fff]", t))
    if han > 0 and kana == 0 and han / max(len(t), 1) > 0.85:
        return True
    if CHINESE_MARKERS.search(t) and kana < 4:
        return True
    return False


def looks_japanese(s: str) -> bool:
    if not s or not s.strip():
        return False
    if is_chinese_learning_text(s):
        return False
    return bool(re.search(r"[\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fff\u3400-\u4dbf]", s))


def strip_chinese_parens(line: str) -> str:
    def strip_if_chinese(inner: str) -> bool:
        t = (inner or "").strip()
        if not t:
            return True
        if re.search(r"[\u3040-\u309f\u30a0-\u30ff]", t):
            return False
        return bool(re.search(r"[\u4e00-\u9fff]", t)) and not re.search(
            r"[\u3040-\u309f\u30a0-\u30ff]", t
        )

    line = re.sub(
        r"（([^）]*)）",
        lambda m: "" if strip_if_chinese(m.group(1)) else m.group(0),
        line,
    )
    line = re.sub(
        r"\(([^)]*)\)",
        lambda m: "" if strip_if_chinese(m.group(1)) else m.group(0),
        line,
    )
    return line


def strip_fill_blanks(line: str) -> str:
    return re.sub(r"[＿_…]+", "", line or "").replace("「", "").replace("」", "").strip()


def prepare_ja_tts_line(raw: str) -> str:
    line = (raw or "").replace('\\"', '"').strip()
    line = strip_fill_blanks(line)
    line = strip_chinese_parens(line)
    if re.search(r"[→⇔]", line):
        parts = [p.strip() for p in re.split(r"[→⇔]", line) if p.strip()]
        line = (parts[-1] if parts else line).rstrip("。")
    if not line or CHINESE_MARKERS.search(line):
        return ""
    if re.search(r"第\d+课", line) and "课" in line:
        return ""
    return line


def dense_speak_line(jp: str, kana: str = "") -> str:
    """grammar-network.js denseSpeakLine"""
    s = (kana or jp or "").strip()
    if not s:
        return ""
    if "→" in s:
        s = s.split("→")[-1].strip()
    return s.rstrip("。")


def split_example_parts(text: str) -> list[str]:
    return [p.strip() for p in re.split(r"[/／]", text or "") if p.strip()]


def fallback_lines_from_raw(raw: str, *, is_kana_field: bool = False) -> list[str]:
    """模拟 speech-engine fallbackLines（字符串）"""
    lines: list[str] = []
    s = (raw or "").replace('\\"', '"').strip()
    if re.search(r"[＿_]{2,}", s):
        return lines
    dense = dense_speak_line(s, s if is_kana_field else "")
    if dense:
        push = prepare_ja_tts_line(dense)
        if push:
            lines.append(push)
    main = prepare_ja_tts_line(s)
    if main and main not in lines:
        lines.append(main)
    return lines


def fallback_lines_question_tts(qtts: str, question: str) -> list[str]:
    out: list[str] = []
    if qtts:
        p = prepare_ja_tts_line(qtts)
        if p:
            out.append(p)
    if question and not re.search(r"[＿_]{2,}", question):
        p = prepare_ja_tts_line(question)
        if p and p not in out:
            out.append(p)
    return out


def fallback_lines_example(example: str) -> list[str]:
    out: list[str] = []
    for part in split_example_parts(example):
        for line in fallback_lines_from_raw(part):
            if line not in out:
                out.append(line)
        dense = dense_speak_line(part, "")
        if dense:
            p = prepare_ja_tts_line(dense)
            if p and p not in out:
                out.append(p)
    return out


def field_name_before(text: str, pos: int) -> str:
    chunk = text[max(0, pos - 64) : pos]
    m = re.search(r'"?(\w+)"?\s*:\s*$', chunk)
    return m.group(1) if m else ""


def register(req_map: dict[str, TtsRequirement], line: str, source: str) -> None:
    if not line or is_chinese_learning_text(line) or not looks_japanese(line):
        return
    k = tts_key(line)
    if k not in req_map:
        req_map[k] = TtsRequirement(line=line, key=k)
    req_map[k].add_source(source)


def collect_requirements(*, full_repo: bool = False) -> dict[str, TtsRequirement]:
    """收集所有 speakJa 可能用到的朗读线（编号 = tts_key）"""
    req_map: dict[str, TtsRequirement] = {}
    scan = list(MVP_SCAN_FILES)
    if full_repo:
        scan.extend(OPTIONAL_SCAN_FILES)

    for phrase in HARDCODED_PATCHES:
        for line in fallback_lines_from_raw(phrase):
            register(req_map, line, "hardcoded")

    for path in scan:
        if not path.exists():
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")

        for m in STRING_KEYS.finditer(text):
            raw = m.group(1).replace('\\"', '"').strip()
            if SKIP_PREFIX.match(raw):
                continue
            fname = field_name_before(text, m.start())
            if fname in SKIP_FIELDS:
                continue
            field_hint = "kana" if fname == "kana" else "jp"

            if fname == "questionTts":
                qtts = raw
                register(req_map, prepare_ja_tts_line(qtts), f"{rel}:questionTts")
                continue

            if fname == "example":
                for line in fallback_lines_example(raw):
                    register(req_map, line, f"{rel}:example")
                continue

            if field_hint == "kana":
                for line in fallback_lines_from_raw(raw, is_kana_field=True):
                    register(req_map, line, f"{rel}:kana")
                continue

            for line in fallback_lines_from_raw(raw):
                register(req_map, line, f"{rel}:string")

        # 测验：question + questionTts 成对
        for m in re.finditer(
            r'question:\s*"((?:\\.|[^"\\])*)"\s*,\s*questionTts:\s*"((?:\\.|[^"\\])*)"',
            text,
        ):
            q = m.group(1).replace('\\"', '"')
            qt = m.group(2).replace('\\"', '"')
            for line in fallback_lines_question_tts(qt, q):
                register(req_map, line, f"{rel}:quiz")

        # depth：denseList / pair 专用字段（可能未被 STRING_KEYS 完整覆盖）
        for m in re.finditer(r'\b(jp|kana|line|bad|good)\s*:\s*"((?:\\.|[^"\\])*)"', text):
            fname, raw = m.group(1), m.group(2).replace('\\"', '"')
            if fname in ("bad", "good", "jp", "line"):
                dense = dense_speak_line(raw, "")
                if dense:
                    register(req_map, prepare_ja_tts_line(dense), f"{rel}:{fname}→dense")
            if fname == "kana":
                dense = dense_speak_line("", raw)
                if dense:
                    register(req_map, prepare_ja_tts_line(dense), f"{rel}:kana→dense")
            for line in fallback_lines_from_raw(raw, is_kana_field=(fname == "kana")):
                register(req_map, line, f"{rel}:{fname}")

    return req_map


def list_mp3_keys() -> set[str]:
    if not CACHE_DIR.is_dir():
        return set()
    return {p.stem for p in CACHE_DIR.glob("*.mp3")}


def build_registry(req_map: dict[str, TtsRequirement] | None = None, *, full_repo: bool = False) -> dict:
    req_map = req_map or collect_requirements(full_repo=full_repo)
    mp3_keys = list_mp3_keys()
    required_keys = set(req_map.keys())

    missing = sorted(required_keys - mp3_keys)
    orphan = sorted(mp3_keys - required_keys)

    entries = []
    for seq, key in enumerate(sorted(req_map.keys(), key=lambda k: (req_map[k].line, k)), start=1):
        r = req_map[key]
        mp3 = CACHE_DIR / f"{key}.mp3"
        entries.append(
            {
                "seq": seq,
                "key": key,
                "line": r.line,
                "mp3": f"tts-cache/{key}.mp3",
                "hasMp3": mp3.exists(),
                "size": mp3.stat().st_size if mp3.exists() else 0,
                "sources": r.sources[:8],
            }
        )

    collisions: dict[str, list[str]] = {}
    for r in req_map.values():
        collisions.setdefault(r.key, []).append(r.line)
    collision_groups = {k: v for k, v in collisions.items() if len(set(v)) > 1}

    return {
        "schema": "tts-registry-v1",
        "algorithm": "ttsCacheKey (same as speech-engine.js)",
        "requiredCount": len(required_keys),
        "mp3FileCount": len(mp3_keys),
        "missingCount": len(missing),
        "orphanCount": len(orphan),
        "missingKeys": missing[:200],
        "orphanKeys": orphan[:200],
        "collisionGroups": {
            k: list(set(v))[:5] for k, v in list(collision_groups.items())[:20]
        },
        "entries": entries,
    }


def write_registry(path: Path | None = None, *, full_repo: bool = False) -> dict:
    data = build_registry(full_repo=full_repo)
    out = path or MANIFEST_PATH
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    cache_manifest = CACHE_DIR / "registry.json"
    if CACHE_DIR.is_dir():
        slim = {
            "schema": data["schema"],
            "requiredCount": data["requiredCount"],
            "mp3FileCount": data["mp3FileCount"],
            "missingCount": data["missingCount"],
            "keys": [e["key"] for e in data["entries"]],
        }
        cache_manifest.write_text(
            json.dumps(slim, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    return data
