#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""会話 ABC · B/C 变体生成（可见差异 · 对齐纪要 A/B/C 分层）"""
from __future__ import annotations

import re

NARRATIVE_RE = re.compile(r"^[（(].*[）)]$")


def norm_jp(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def vis_norm(s: str) -> str:
    return re.sub(r"[\s、，,.!?？!！:：;；「」『』""\"'（）()]", "", (s or ""))


def is_narrative(jp: str) -> bool:
    s = norm_jp(jp)
    return bool(NARRATIVE_RE.match(s)) or "ナレーション" in s


def split_clauses(jp: str) -> list[str]:
    s = norm_jp(jp)
    if not s:
        return []
    parts: list[str] = []
    buf = ""
    for ch in s:
        buf += ch
        if ch in "。!?？":
            p = buf.strip()
            if p:
                parts.append(p)
            buf = ""
    if buf.strip():
        parts.append(buf.strip())
    if len(parts) <= 1 and "、" in s and s.endswith("？"):
        a, b = s.split("、", 1)
        if a and b:
            parts = [a + ("。" if not a.endswith("。") else ""), b]
    return parts


def variant_b(jp: str) -> str:
    """B：同场景 · 口语/缩短 · 与 A 可见不同"""
    a = norm_jp(jp)
    if not a or is_narrative(a):
        return a
    s = a
    for prefix in (
        "はい、",
        "いいえ、",
        "えっ、",
        "あっ、",
        "そうですね。",
        "じゃあ、",
        "それから、",
        "そして、",
    ):
        if s.startswith(prefix):
            s = norm_jp(s[len(prefix) :])
            break
    if not s:
        s = a.replace("。", "、そう思います。") if a.endswith("。") else "ええ、" + a
    s = re.sub(r"^私は\s+", "", s)
    s = re.sub(r"^わたしは\s+", "", s)
    s = re.sub(r"どうも\s+", "", s)
    s = re.sub(r"本当に\s+", "", s)
    s = re.sub(r"とても\s+", "", s)
    qm = re.match(r"^(.+?『)(.+)(』)$", s)
    if qm:
        prefix, inner, suffix = qm.group(1), qm.group(2), qm.group(3)
        if "。" in inner:
            inner_parts = [p.strip() for p in inner.split("。") if p.strip()]
            if len(inner_parts) >= 2:
                shorter = inner_parts[0] + "。"
                cand = norm_jp(prefix + shorter + suffix)
                if cand and vis_norm(cand) != vis_norm(a):
                    return cand
    clauses = split_clauses(s)
    if len(clauses) >= 2 and vis_norm(clauses[-1]) != vis_norm(a):
        last = clauses[-1]
        if not last.endswith(("。", "？", "!", "！")):
            last += "。"
        return norm_jp(last)
    if "。" in s and s.count("。") >= 2 and "『" not in s:
        parts = [p.strip() for p in s.split("。") if p.strip()]
        if len(parts) >= 2:
            s = parts[-1] + "。"
    if s == a and "いつも" in s:
        s = s.replace("いつも", "だいたい")
    if vis_norm(s) == vis_norm(a) and s.endswith("です。"):
        s = s[:-3] + "だよ。"
    if vis_norm(s) == vis_norm(a) and s.endswith("ます。"):
        s = s[:-3] + "るよ。"
    if vis_norm(s) == vis_norm(a) and s.endswith("でした。"):
        s = s[:-4] + "だった。"
    if vis_norm(s) == vis_norm(a) and s.endswith("ですか。"):
        s = re.sub(r"^(.+?)は\s+", "", s)
    if vis_norm(s) == vis_norm(a) and s.endswith("ますか。"):
        s = s.replace("ますか。", "る？")
    if vis_norm(s) == vis_norm(a) and "ください" in s:
        s = s.replace("ください", "ちょうだい")
    if vis_norm(s) == vis_norm(a):
        for drop in ("ううん、", "ええ、", "うん、", "はい、"):
            if a.startswith(drop):
                s = a[len(drop) :]
                break
    if vis_norm(s) == vis_norm(a) and "、特に" in a:
        s = re.sub(r"^[^、]+、", "", a)
    if vis_norm(s) == vis_norm(a) and a.endswith("の？"):
        s = a.replace("、特にないよ。", "特にない。").replace("ううん、", "")
    if vis_norm(s) == vis_norm(a) and len(clauses) >= 2:
        s = clauses[-1]
    if vis_norm(s) == vis_norm(a) and s.endswith("？"):
        s = s.replace("のでしょうか", "の").replace("でしょうか", "")
    if vis_norm(s) == vis_norm(a) and s in ("そうですね。", "はい。", "ええ。"):
        s = s.replace("。", "、そう思います。")
    if vis_norm(s) == vis_norm(a) and len(s) > 8:
        s = re.sub(r"、", "", s)
    if vis_norm(s) == vis_norm(a):
        s = "ええ、" + a if not a.startswith("ええ") else a[:-1] + "、短く言うと同じ意味です。"
    return norm_jp(s) or a


def variant_c(jp: str) -> str:
    """C：更礼貌/郑重 · 与 A 不同"""
    a = norm_jp(jp)
    if not a or is_narrative(a):
        return a
    s = a
    if s.endswith("ください。"):
        return s.replace("ください。", "いただけますでしょうか。")
    if s.endswith("ですか。"):
        return s[:-4] + "でしょうか。"
    if s.endswith("ますか。"):
        return s[:-4] + "ますでしょうか。"
    if s.endswith("？"):
        body = s[:-1]
        if body.endswith("の"):
            return body + "でしょうか。"
        return body + "でしょうか。"
    if "ありがとう" in s and s.endswith("。"):
        if "ございます" not in s:
            return s.replace("ありがとう", "ありがとうございます")
        return s[:-1] + "。心より感謝いたします。"
    if s.endswith("です。"):
        body = s[:-3]
        if "ございます" in body:
            return s[:-1] + "。恐れ入ります。"
        if "さん" in body:
            return body.replace("さん", "様") + "でございます。"
        return body + "でございます。"
    if s.endswith("ます。"):
        return s[:-3] + "ますね。"
    if s.endswith("でした。"):
        return s[:-4] + "でしたね。"
    if s.endswith("よ。"):
        return s[:-2] + "ます。"
    if vis_norm(s) == vis_norm(a):
        return s[:-1] + "ね。" if s.endswith("。") else s + "ね"
    return s


def b_chinese(a_zh: str, a_jp: str, b_jp: str) -> str:
    a_zh = (a_zh or "").strip()
    if not a_zh or b_jp == a_jp:
        return a_zh
    clauses_a = split_clauses(a_jp)
    if len(clauses_a) >= 2 and norm_jp(b_jp) == norm_jp(clauses_a[-1]):
        parts = re.split(r"[。?？!！]", a_zh)
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) >= 2:
            tail = parts[-1]
            return tail + ("？" if b_jp.endswith("？") else "。")
    if b_jp.startswith("特に") or (b_jp.endswith("？") and "ううん" not in b_jp and "、特に" in a_jp):
        parts = re.split(r"[。?？]", a_zh)
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) >= 2:
            return parts[-1] + ("？" if b_jp.endswith("？") else "。")
        return a_zh.replace("嗯，", "").replace("嗯,", "")
    return a_zh


def note_b(a_jp: str, b_jp: str, speaker: str) -> str:
    if b_jp == a_jp or vis_norm(b_jp) == vis_norm(a_jp):
        return "B 与课文同句：叙述/旁白块，三种选项均为跟读（非选答）."
    if len(vis_norm(b_jp)) < len(vis_norm(a_jp)) - 2:
        return f"B 更短：省略前半或应答词，同事间接上文时用（{speaker}，可沟通）."
    if "だよ" in b_jp or "るよ" in b_jp or "だった" in b_jp:
        return f"B 口语体：です→だよ/るよ，轻松场合用（{speaker}，非错答）."
    return f"B 同场景变体：节奏快、信息略减（{speaker}，可沟通）."


def note_c(a_jp: str, c_jp: str, speaker: str) -> str:
    if c_jp == a_jp:
        return "C 与课文同句：叙述块跟读用."
    if "でしょうか" in c_jp or "ございます" in c_jp or "いただけ" in c_jp:
        return f"C 更礼貌：对上级/客户或正式场合可选（{speaker}，非错答）."
    if "様" in c_jp:
        return f"C 敬称升级：さん→様，商务/郑重场合用（{speaker}）."
    return f"C 语气更软：句末「ね」等，缓和确认时用（{speaker}，非错答）."


def audit_visible(all_maps: dict[int, dict]) -> tuple[int, int, int]:
    same_b = same_c = same_vis_b = 0
    for mp in all_maps.values():
        for v in mp.values():
            rs = v["replies"]
            a, b, c = rs[0]["japanese"], rs[1]["japanese"], rs[2]["japanese"]
            if not is_narrative(a):
                if b == a:
                    same_b += 1
                if c == a:
                    same_c += 1
                if vis_norm(b) == vis_norm(a):
                    same_vis_b += 1
    return same_b, same_c, same_vis_b
