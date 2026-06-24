# -*- coding: utf-8 -*-
"""从 animCJK svgsJaKana 提取清音笔顺中线，生成 js/data/kana-stroke-guide.js"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SVG_DIR = ROOT / "_tmp_animCJK" / "svgsJaKana"
OUT = ROOT / "js" / "data" / "kana-stroke-guide.js"
VB = 1024

# 与 intro-content.js INTRO_GOJUON_SEION 一致（平假名键）
SEION_KANA = [
    "あ", "い", "う", "え", "お",
    "か", "き", "く", "け", "こ",
    "さ", "し", "す", "せ", "そ",
    "た", "ち", "つ", "て", "と",
    "な", "に", "ぬ", "ね", "の",
    "は", "ひ", "ふ", "へ", "ほ",
    "ま", "み", "む", "め", "も",
    "や", "ゆ", "よ",
    "ら", "り", "る", "れ", "ろ",
    "わ", "を",
    "ん",
]

# 教材笔顺表 · 清音标准笔画数（ちびむす / 五十音笔顺表）
STD_STROKES = {
    "あ": 3, "い": 2, "う": 2, "え": 2, "お": 3, "か": 3, "き": 4, "く": 1, "け": 3, "こ": 2,
    "さ": 3, "し": 1, "す": 2, "せ": 3, "そ": 1, "た": 4, "ち": 2, "つ": 1, "て": 1, "と": 2,
    "な": 4, "に": 3, "ぬ": 2, "ね": 2, "の": 1, "は": 3, "ひ": 1, "ふ": 4, "へ": 1, "ほ": 4,
    "ま": 3, "み": 2, "む": 3, "め": 2, "も": 3, "や": 3, "ゆ": 2, "よ": 2,
    "ら": 2, "り": 2, "る": 1, "れ": 2, "ろ": 1, "わ": 2, "を": 3, "ん": 1,
}

# ── 平假名专用手工表（勿用于片假名）────────────────────────────
# 环路/撇笔：不截发夹尾（标日环底须闭合）
HIRA_NO_TRIM: set[str] = {
    "な", "よ", "い", "お", "か", "き", "け", "さ", "ね", "ぬ", "む", "め", "る", "を", "あ",
}

# 整字替换（教科书体弧线 · 灰底与笔顺同源）
HIRA_MANUAL_FULL: dict[str, list[list[list[float]]]] = {
    "い": [
        [[95, 249], [130, 268], [175, 360], [235, 520], [300, 680], [355, 760], [320, 820], [250, 835], [195, 800], [210, 720], [272, 704]],
        [[678, 273], [745, 315], [815, 405], [850, 510], [867, 639]],
    ],
    "お": [
        [[112, 323], [200, 360], [350, 358], [535, 309]],
        [
            [300, 120], [340, 200], [320, 380], [270, 520], [220, 660], [200, 760], [230, 840],
            [320, 880], [450, 870], [580, 780], [660, 640], [680, 480], [620, 380], [480, 420],
            [360, 520], [300, 640], [320, 760], [420, 850], [560, 880], [700, 820],
        ],
        [[710, 189], [794, 229], [868, 350]],
    ],
    "か": [
        [[280, 400], [450, 385], [610, 420], [590, 500], [450, 540], [350, 520]],
        [[400, 150], [395, 400], [390, 620], [400, 760]],
        [[560, 500], [640, 560], [700, 610]],
    ],
    "き": [
        [[294, 332], [400, 340], [550, 310], [677, 253]],
        [[376, 512], [500, 518], [650, 460], [777, 426]],
        [[367, 135], [420, 145], [520, 300], [620, 450], [688, 580], [688, 620]],
        [[300, 734], [285, 790], [310, 860], [450, 900], [630, 905], [720, 860]],
    ],
    "け": [
        [[217, 156], [245, 200], [200, 500], [185, 650], [180, 714], [210, 800], [219, 842]],
        [[417, 399], [550, 378], [720, 365], [865, 357]],
        [[636, 119], [680, 160], [700, 350], [690, 550], [659, 720], [600, 850], [565, 915]],
    ],
    "さ": [
        [[274, 415], [450, 380], [600, 340], [751, 300]],
        [[377, 124], [430, 130], [500, 250], [580, 380], [660, 500], [738, 574]],
        [[320, 714], [305, 760], [330, 820], [420, 880], [550, 905], [680, 900], [690, 913]],
    ],
    "な": [
        [[140, 306], [210, 315], [350, 295], [500, 280], [574, 270]],
        [[382, 111], [400, 180], [350, 400], [280, 550], [234, 622]],
        [[762, 322], [820, 380], [882, 443]],
        [
            [632, 464], [590, 520], [575, 650], [560, 780], [500, 880], [420, 910],
            [360, 870], [340, 780], [380, 650], [480, 550], [580, 480], [632, 464],
        ],
    ],
    "よ": [
        [[548, 352], [660, 338], [778, 328]],
        [
            [484, 114], [522, 158], [510, 350], [500, 550], [480, 720], [420, 820],
            [320, 860], [250, 800], [255, 720], [310, 670], [420, 690], [560, 760],
            [700, 850], [785, 913],
        ],
    ],
}

HIRA_MANUAL_REPLACE: dict[str, dict[int, list[list[float]]]] = {
    "ふ": {
        0: [[440, 147], [558, 213], [573, 259], [451, 306]],
        2: [[106, 684], [158, 768], [195, 825]],
    },
}

HIRA_MANUAL_ORDER: dict[str, list[int]] = {
    "や": [2, 1, 0],
}

HIRA_MANUAL_KEEP: dict[str, list[int]] = {
    "の": [0],
}

# ── 片假名专用（与平假名分开对账；默认仅 canonicalize animCJK 片假名 SVG）──
# 标日修正：在 canonicalize 之后写入，避免 RDP 截断（マ 第1笔等）
KATA_POST_REPLACE: dict[str, dict[int, list[list[float]]]] = {
    "オ": {
        1: [[538, 116], [552, 380], [546, 650], [542, 880]],
    },
    "ホ": {
        1: [[465, 114], [528, 176], [522, 680], [512, 835]],
    },
    "マ": {
        0: [[126, 320], [208, 341], [773, 226], [849, 286], [515, 587]],
        1: [[331, 476], [438, 582], [578, 816]],
    },
    # 片假名 1 笔对角；勿用平假名ふ路径（animCJK 末段带才字钩须截）
    "フ": {
        0: [[170, 290], [320, 260], [560, 340], [720, 520], [800, 720]],
    },
}

# 整字替换（animCJK 镜像合并会误伤 ヨ 等）
KATA_MANUAL_FULL: dict[str, list[list[list[float]]]] = {
    "ヨ": [
        [[270, 350], [780, 320]],
        [[506, 101], [560, 180], [566, 520], [560, 900]],
        [[150, 580], [880, 545]],
        [[190, 790], [830, 770]],
    ],
}

KATA_MANUAL_REPLACE: dict[str, dict[int, list[list[float]]]] = {}

KATA_MANUAL_ORDER: dict[str, list[int]] = {}

KATA_MANUAL_KEEP: dict[str, list[int]] = {}

KATA_SKIP_MIRROR: set[str] = {"ヨ"}

CENTER = VB / 2
# 平假名：多保留弧点；片假名：略利但仍保留转角
RDP_EPS = {"hira": 14, "kata": 34}
MAX_STROKE_PTS = {"hira": 32, "kata": 16}
CORNER_DEG = {"hira": 142, "kata": 136}
MERGE_TOL = 10
# 标日：撇/捺末端不回踩（animCJK 发夹尾须截）
HAIRPIN_TAIL_DEG = 108
STUB_LEN = 88
STUB_BEND_DEG = 158


def parse_path_d(d: str) -> list[list[float]]:
    """解析 animCJK 中线 path（M + 空格分隔坐标）。"""
    d = d.strip()
    if not d.startswith("M"):
        return []
    body = d[1:].strip()
    nums = [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?", body)]
    pts: list[list[float]] = []
    for i in range(0, len(nums) - 1, 2):
        pts.append([nums[i], nums[i + 1]])
    return pts


def extract_medians(svg_text: str) -> list[list[list[float]]]:
    strokes: list[list[list[float]]] = []
    for m in re.finditer(r'clip-path="[^"]*"\s+d="([^"]+)"', svg_text):
        pts = parse_path_d(m.group(1))
        if len(pts) >= 2:
            strokes.append(pts)
    return strokes


def extract_outlines(svg_text: str) -> list[str]:
    """animCJK 字形轮廓 path（与笔顺中线同 viewBox，作田字格淡灰底图）。"""
    out: list[str] = []
    for m in re.finditer(r'<path id="z\d+d[^"]+" d="([^"]+)"', svg_text):
        d = m.group(1).strip()
        if d:
            out.append(d)
    return out


def outlines_for_char(char: str, svg_text: str) -> list[str]:
    """片假名 ヨ 等：去掉 animCJK 顶角装饰，只留主轮廓。"""
    paths = extract_outlines(svg_text)
    if char == "ヨ" and len(paths) >= 4:
        return paths[:4]
    return paths


def point_in_viewbox(p: list[float]) -> bool:
    return 0 <= p[0] <= VB and 0 <= p[1] <= VB


def stroke_in_viewbox(stroke: list[list[float]]) -> bool:
    return len(stroke) >= 2 and all(point_in_viewbox(p) for p in stroke)


def dedup_strokes(strokes: list[list[list[float]]], tol: float = 40) -> list[list[list[float]]]:
    out: list[list[list[float]]] = []
    for s in strokes:
        dup = False
        for t in out:
            if (
                len(s) == len(t)
                and abs(s[0][0] - t[0][0]) < tol
                and abs(s[0][1] - t[0][1]) < tol
                and abs(s[-1][0] - t[-1][0]) < tol
                and abs(s[-1][1] - t[-1][1]) < tol
            ):
                dup = True
                break
        if not dup:
            out.append(s)
    return out


def _y_sig(stroke: list[list[float]], step: float = 50) -> tuple[float, ...]:
    return tuple(round(p[1] / step) * step for p in stroke)


def _x_mean(stroke: list[list[float]]) -> float:
    return sum(p[0] for p in stroke) / len(stroke)


def _mirror_pair(a: list[list[float]], b: list[list[float]], y_step: float = 50, cx_tol: float = 90) -> bool:
    """animCJK 2a/2b：同笔左右镜像副线，Y 序相同且 X 关于中心对称。"""
    if len(a) != len(b) or len(a) < 2:
        return False
    if _y_sig(a, y_step) != _y_sig(b, y_step):
        return False
    for pa, pb in zip(a, b):
        if abs(pa[0] + pb[0] - 2 * CENTER) > cx_tol * 2:
            return False
    return True


def _variant_pair(a: list[list[float]], b: list[list[float]], y_step: float = 50, end_tol: float = 45) -> bool:
    """animCJK 2a/2b 另一形态：Y 路径相同、终点相同、起点不同（左右两式只留 2a）。"""
    if len(a) != len(b) or len(a) < 2:
        return False
    if _y_sig(a, y_step) != _y_sig(b, y_step):
        return False
    if abs(a[-1][0] - b[-1][0]) > end_tol or abs(a[-1][1] - b[-1][1]) > end_tol:
        return False
    if abs(a[0][0] - b[0][0]) < 40 and abs(a[0][1] - b[0][1]) < 40:
        return False
    return True


def _pair_variant(a: list[list[float]], b: list[list[float]]) -> bool:
    return _mirror_pair(a, b) or _variant_pair(a, b)


def drop_mirror_variant_strokes(strokes: list[list[list[float]]]) -> list[list[list[float]]]:
    out: list[list[list[float]]] = []
    i = 0
    while i < len(strokes):
        if i + 1 < len(strokes) and _pair_variant(strokes[i], strokes[i + 1]):
            a, b = strokes[i], strokes[i + 1]
            # 镜像副线：标日笔顺多从左起笔，保留 x 较小的一侧（如本应居左的横笔）
            out.append(a if _x_mean(a) <= _x_mean(b) else b)
            i += 2
        else:
            out.append(strokes[i])
            i += 1
    return out


def _perp_dist(p: list[float], a: list[float], b: list[float]) -> float:
    ax, ay = a
    bx, by = b
    px, py = p
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    qx, qy = ax + t * dx, ay + t * dy
    return ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5


def _rdp(pts: list[list[float]], eps: float) -> list[list[float]]:
    if len(pts) <= 2:
        return [list(p) for p in pts]
    a, b = pts[0], pts[-1]
    idx, dist = 0, -1.0
    for i in range(1, len(pts) - 1):
        d = _perp_dist(pts[i], a, b)
        if d > dist:
            dist, idx = d, i
    if dist <= eps:
        return [list(a), list(b)]
    left = _rdp(pts[: idx + 1], eps)
    right = _rdp(pts[idx:], eps)
    return left[:-1] + right


def _dist(a: list[float], b: list[float]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def _turn_angle_deg(p0: list[float], p1: list[float], p2: list[float]) -> float:
    import math

    v1x, v1y = p0[0] - p1[0], p0[1] - p1[1]
    v2x, v2y = p2[0] - p1[0], p2[1] - p1[1]
    m1 = math.hypot(v1x, v1y) or 1.0
    m2 = math.hypot(v2x, v2y) or 1.0
    cos = max(-1.0, min(1.0, (v1x * v2x + v1y * v2y) / (m1 * m2)))
    return math.degrees(math.acos(cos))


def _mandatory_keep_indices(pts: list[list[float]], *, script: str) -> set[int]:
    """锐角 / 环路转折点强制保留，避免 RDP 抹平を・み・ま 等弯折。"""
    keep = {0, len(pts) - 1}
    thresh = CORNER_DEG.get(script, CORNER_DEG["hira"])
    for i in range(1, len(pts) - 1):
        if _turn_angle_deg(pts[i - 1], pts[i], pts[i + 1]) < thresh:
            keep.add(i)
    return keep


def _merge_mandatory(simp: list[list[float]], orig: list[list[float]], mandatory: set[int]) -> list[list[float]]:
    out = [list(p) for p in simp]
    for idx in sorted(mandatory):
        p = orig[idx]
        if any(_dist(p, q) < MERGE_TOL for q in out):
            continue
        best_j, best_d = 0, 1e9
        for j in range(len(out) - 1):
            d = _perp_dist(p, out[j], out[j + 1])
            if d < best_d:
                best_d, best_j = d, j
        out.insert(best_j + 1, list(p))
    return out


def _thin_to_cap(pts: list[list[float]], cap: int, mandatory: set[int]) -> list[list[float]]:
    if len(pts) <= cap:
        return pts
    orig = [list(p) for p in pts]
    protected: set[int] = {0, len(orig) - 1}
    for i, p in enumerate(orig):
        for idx in mandatory:
            if _dist(p, orig[idx]) < MERGE_TOL:
                protected.add(i)
                break
    removable = [i for i in range(1, len(orig) - 1) if i not in protected]
    while len(orig) > cap and removable:
        mid = removable[len(removable) // 2]
        orig.pop(mid)
        removable = [i for i in range(1, len(orig) - 1) if i not in protected]
        protected = set()
        for i, p in enumerate(orig):
            for idx in mandatory:
                if _dist(p, orig[min(idx, len(orig) - 1)]) < MERGE_TOL:
                    protected.add(i)
        protected.add(0)
        protected.add(len(orig) - 1)
    return orig


def trim_stroke_tails(pts: list[list[float]], *, kana: str = "") -> list[list[float]]:
    """标日书写：撇笔不回踩、钩笔不连通下一笔（截 animCJK 发夹尾）。环路字不截。"""
    if kana in HIRA_NO_TRIM:
        return [list(p) for p in pts]
    if len(pts) < 3:
        return [list(p) for p in pts]
    out = [list(p) for p in pts]
    while len(out) >= 3:
        ang = _turn_angle_deg(out[-3], out[-2], out[-1])
        if ang < HAIRPIN_TAIL_DEG:
            out.pop()
        else:
            break
    while len(out) >= 3 and _dist(out[-2], out[-1]) < STUB_LEN:
        ang = _turn_angle_deg(out[-3], out[-2], out[-1])
        if ang < STUB_BEND_DEG:
            out.pop()
        else:
            break
    return out


def canonicalize_stroke(pts: list[list[float]], *, script: str) -> list[list[float]]:
    """标日笔顺中线：去噪但保留弧线/转角点，供 SVG 分段平滑（非折线）。"""
    if len(pts) < 2:
        return [list(p) for p in pts]
    eps = RDP_EPS.get(script, RDP_EPS["hira"])
    cap = MAX_STROKE_PTS.get(script, MAX_STROKE_PTS["hira"])
    orig = [list(p) for p in pts]
    mandatory = _mandatory_keep_indices(orig, script=script)
    simp = _rdp(orig, eps)
    simp = _merge_mandatory(simp, orig, mandatory)
    simp = _thin_to_cap(simp, cap, mandatory)
    return simp


def _stroke_ok(stroke: list[list[float]]) -> bool:
    return stroke_in_viewbox(stroke)


def apply_manual_fixes(
    kana: str,
    strokes: list[list[list[float]]],
    *,
    replace: dict,
    order: dict,
    keep: dict,
) -> list[list[list[float]]]:
    if kana in order:
        ord_list = order[kana]
        if all(0 <= i < len(strokes) for i in ord_list):
            strokes = [strokes[i] for i in ord_list]
    if kana in replace:
        for idx, pts in replace[kana].items():
            if 0 <= idx < len(strokes):
                strokes[idx] = [list(p) for p in pts]
    if kana in keep:
        strokes = [strokes[i] for i in keep[kana] if i < len(strokes)]
    return strokes


def clean_strokes(
    kana: str,
    raw: list[list[list[float]]],
    *,
    script: str,
) -> list[list[list[float]]]:
    strokes = [s for s in raw if s and _stroke_ok(s)]
    strokes = dedup_strokes(strokes)
    if not (script == "kata" and kana in KATA_MANUAL_FULL) and not (
        script == "hira" and kana in HIRA_MANUAL_FULL
    ):
        strokes = drop_mirror_variant_strokes(strokes)
    if script == "hira":
        strokes = apply_manual_fixes(
            kana, strokes, replace=HIRA_MANUAL_REPLACE, order=HIRA_MANUAL_ORDER, keep=HIRA_MANUAL_KEEP
        )
    else:
        strokes = apply_manual_fixes(
            kana, strokes, replace=KATA_MANUAL_REPLACE, order=KATA_MANUAL_ORDER, keep=KATA_MANUAL_KEEP
        )
    strokes = [trim_stroke_tails(s, kana=kana if script == "hira" else "") for s in strokes]
    strokes = [canonicalize_stroke(s, script=script) for s in strokes]
    if script == "hira":
        if kana in HIRA_MANUAL_FULL:
            strokes = [[list(p) for p in s] for s in HIRA_MANUAL_FULL[kana]]
    elif script == "kata":
        if kana in KATA_MANUAL_FULL:
            strokes = [[list(p) for p in s] for s in KATA_MANUAL_FULL[kana]]
        elif kana in KATA_POST_REPLACE:
            for idx, pts in KATA_POST_REPLACE[kana].items():
                if 0 <= idx < len(strokes):
                    strokes[idx] = [list(p) for p in pts]
    return strokes


def to_katakana(hiragana: str) -> str:
    return "".join(
        chr(ord(ch) + 0x60) if 0x3041 <= ord(ch) <= 0x3096 else ch for ch in hiragana
    )


def strokes_from_svg(char: str, *, script: str) -> tuple[list[list[list[float]]], list[str]] | None:
    svg_path = SVG_DIR / f"{ord(char)}.svg"
    if not svg_path.is_file():
        return None
    text = svg_path.read_text(encoding="utf-8")
    raw = extract_medians(text)
    strokes = clean_strokes(char, raw, script=script)
    if not strokes:
        return None
    outlines = outlines_for_char(char, text)
    return strokes, outlines


def main() -> None:
    if not SVG_DIR.is_dir():
        raise SystemExit(f"缺少 {SVG_DIR}，请先 sparse-checkout animCJK svgsJaKana")

    # 书写板块 JSON 真源（增补内容 · 相对坐标）覆盖同字手工表
    json_path = ROOT / "书写板块" / "data" / "kana-hiragana.json"
    if json_path.is_file():
        data = json.loads(json_path.read_text(encoding="utf-8"))
        for ch in data.get("characters") or []:
            kana = ch.get("kana")
            if not kana:
                continue
            strokes = ch.get("strokes") or []
            ordered = sorted(strokes, key=lambda s: s.get("order", 0))
            HIRA_MANUAL_FULL[kana] = [
                [[round(p["x"] * VB), round(p["y"] * VB)] for p in (st.get("path") or [])]
                for st in ordered
            ]

    guide: dict[str, dict] = {}
    missing: list[str] = []
    kata_missing: list[str] = []
    mismatches: list[str] = []

    for kana in SEION_KANA:
        parsed = strokes_from_svg(kana, script="hira")
        if not parsed:
            missing.append(kana)
            continue
        strokes, outlines = parsed
        exp = STD_STROKES.get(kana)
        if exp is not None and len(strokes) != exp:
            mismatches.append(f"hira {kana}: got {len(strokes)} expect {exp}")
        entry: dict = {"vb": [0, 0, VB, VB], "strokes": strokes}
        if outlines:
            entry["outline"] = outlines
        guide[kana] = entry

        kata = to_katakana(kana)
        if kata in guide:
            continue
        kata_parsed = strokes_from_svg(kata, script="kata")
        if not kata_parsed:
            kata_missing.append(kata)
            continue
        kata_strokes, kata_outlines = kata_parsed
        if exp is not None and len(kata_strokes) != exp:
            print(f"[WARN] {kata}: got {len(kata_strokes)} expect {exp} (片假名，不阻断)")
        kata_entry: dict = {"vb": [0, 0, VB, VB], "strokes": kata_strokes}
        if kata_outlines:
            kata_entry["outline"] = kata_outlines
        guide[kata] = kata_entry

    header = """/**
 * 清音笔顺中线 · 源自 animCJK svgsJaKana（LGPL-3+）
 * https://github.com/parsimonhi/animCJK
 * 生成：python scripts/build-kana-stroke-guide.py
 * 清洗：平假名/片假名分轨 · 去重 · 教材笔顺表校对（各 46）
 * 对账：python scripts/audit-kana-strokes-batch.py
 */
const KANA_STROKE_GUIDE = """
    footer = ";\n"
    body = json.dumps(guide, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text(header + body + footer, encoding="utf-8", newline="\n")
    print(f"[OK] {len(guide)} entries (平+片) -> {OUT}")
    if missing:
        print(f"[WARN] missing hiragana: {', '.join(missing)}")
    if kata_missing:
        print(f"[WARN] missing katakana: {', '.join(kata_missing)}")
    if mismatches:
        print("[WARN] stroke count mismatch:")
        for line in mismatches:
            print(f"  {line}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
