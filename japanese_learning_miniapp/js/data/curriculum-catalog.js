/**
 * 教材初级上 · 课程目录真源（单元 / 课序 / 发布 / 地图段）
 * 首页路径图只读本文件；课内数据仍在 lessons-mvp*.js
 */
const CURRICULUM_RELEASED_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24,
];

/**
 * 开发期封面目录：24 课全显可点（灰/锁样式后置）。
 * 开：?dev=1 · localStorage hyouga_dev_catalog=1 · localhost/file 默认
 * 关：localStorage hyouga_dev_catalog=0
 */
function curriculumFreeJumpMode() {
  return true;
}

function curriculumDevCatalogMode() {
  try {
    if (/[?&]dev=1/.test(location.search || "")) return true;
    if (localStorage.getItem("hyouga_dev_catalog") === "1") return true;
    if (localStorage.getItem("hyouga_dev_catalog") === "0") return false;
  } catch (_) {
    /* ignore */
  }
  const h = (location.hostname || "").toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "" ||
    location.protocol === "file:"
  );
}

const CURRICULUM_PART0 = {
  id: 0,
  kind: "intro",
  titleJa: "入門 · 発音と文字",
  titleZh: "注音与寒暄（隐藏关）",
  subtitle: "赤い起点 · 不锁正课",
  island: "shikoku",
  mapLabel: "00",
  href: "intro.html",
};

/** 从南向北：四国 → 九州 → 本州 → 北海道 */
const CURRICULUM_UNITS = [
  {
    id: 1,
    titleJa: "第1単元",
    unitThemeJa: "李さんの来日",
    titleZh: "小李赴日",
    grammarLine: "名詞述語文（〜は〜です）",
    island: "shikoku",
    lessonIds: [1, 2, 3, 4],
  },
  {
    id: 2,
    titleJa: "第2単元",
    unitThemeJa: "会社生活①",
    titleZh: "公司生活①",
    grammarLine: "動詞述語文（ます形）",
    island: "kyushu",
    lessonIds: [5, 6, 7, 8],
  },
  {
    id: 3,
    titleJa: "第3単元",
    unitThemeJa: "箱根旅行",
    titleZh: "箱根旅行",
    grammarLine: "形容詞・形容動詞",
    island: "honshu",
    lessonIds: [9, 10, 11, 12],
  },
  {
    id: 4,
    titleJa: "第4単元",
    unitThemeJa: "会社生活②",
    titleZh: "公司生活②",
    grammarLine: "て形体系",
    island: "honshu",
    lessonIds: [13, 14, 15, 16],
  },
  {
    id: 5,
    titleJa: "第5単元",
    unitThemeJa: "新春を迎える",
    titleZh: "迎新春",
    grammarLine: "愿望·义务·可能",
    island: "honshu",
    lessonIds: [17, 18, 19, 20],
  },
  {
    id: 6,
    titleJa: "第6単元",
    unitThemeJa: "さようなら、日本",
    titleZh: "再见日本",
    grammarLine: "简体·引用（向中级）",
    island: "hokkaido",
    lessonIds: [21, 22, 23, 24],
  },
];

const CURRICULUM_LESSON_META = {
  1: { headline: "李さんは中国人です", themeZh: "自我介绍" },
  2: { headline: "これは本です", themeZh: "指示事物" },
  3: { headline: "ここはデパートです", themeZh: "场所位置" },
  4: { headline: "部屋に机といすがあります", themeZh: "存在与数量" },
  5: { headline: "森さんは七時に起きます", themeZh: "时间与ます形" },
  6: { headline: "吉田さんは来月中国へ行きます", themeZh: "移动与方向" },
  7: { headline: "李さんは毎日コーヒーを飲みます", themeZh: "对象与频率" },
  8: { headline: "李さんは日本語で手紙を書きます", themeZh: "手段与授受" },
  9: { headline: "四川料理は辛いです", themeZh: "い形容词" },
  10: { headline: "京都の紅葉は有名です", themeZh: "な形容词" },
  11: { headline: "小野さんは歌が好きです", themeZh: "喜好与擅长" },
  12: { headline: "李さんは森さんより若いです", themeZh: "比较" },
  13: { headline: "机の上に本が三冊あります", themeZh: "量词与存在" },
  14: { headline: "昨日デパートへ行って、買い物をしました", themeZh: "て形" },
  15: { headline: "小野さんは今新聞を読んでいます", themeZh: "进行时与许可" },
  16: { headline: "ホテルの部屋は広くて明るいです", themeZh: "形容词て形与状态" },
  17: { headline: "わたしは新しい洋服がほしいです", themeZh: "愿望" },
  18: { headline: "携帯電話はとても小さくなりました", themeZh: "变化与推测" },
  19: { headline: "部屋のかぎを忘れないでください", themeZh: "禁止与义务" },
  20: { headline: "スミスさんはピアノを弾くことができます", themeZh: "可能与时间" },
  21: { headline: "わたしはすき焼きを食べたことがあります", themeZh: "た形与经历" },
  22: { headline: "森さんは今晩テレビを見る", themeZh: "简体" },
  23: { headline: "休みの日、散歩したり買い物に行ったりします", themeZh: "たり・场合" },
  24: { headline: "李さんはもうすぐ来ると思います", themeZh: "引用与思う" },
};

function curriculumIsReleased(lessonId) {
  const id = Number(lessonId);
  if (id === 0) return true;
  return CURRICULUM_RELEASED_IDS.includes(id);
}

function curriculumLessonHasData(lessonId) {
  const id = Number(lessonId);
  if (typeof LESSONS_MVP === "undefined" || !Array.isArray(LESSONS_MVP)) return false;
  return LESSONS_MVP.some((l) => l.lessonId === id);
}

function getCurriculumLessonDisplay(lessonId) {
  const id = Number(lessonId);
  const meta = CURRICULUM_LESSON_META[id] || {};
  const mvp =
    typeof getLessonMvp === "function" ? getLessonMvp(id) : LESSONS_MVP?.find((l) => l.lessonId === id);
  return {
    lessonId: id,
    headline: mvp?.lessonTitle || meta.headline || `第${id}課`,
    themeZh: mvp?.themeZh || meta.themeZh || "",
    theme: mvp?.theme || "",
    released: curriculumIsReleased(id),
    hasData: curriculumLessonHasData(id),
    devStub: curriculumDevCatalogMode() && !curriculumLessonHasData(id),
    playable: curriculumDevCatalogMode()
      ? id >= 1 && id <= 24
      : curriculumIsReleased(id) && curriculumLessonHasData(id),
  };
}

function getCurriculumUnitsForHome() {
  return CURRICULUM_UNITS.map((u) => ({
    ...u,
    lessons: u.lessonIds.map((id) => getCurriculumLessonDisplay(id)),
    releasedCount: u.lessonIds.filter((id) => curriculumIsReleased(id) && curriculumLessonHasData(id)).length,
    totalReleased: u.lessonIds.filter((id) => curriculumIsReleased(id)).length,
  }));
}

/** 四岛板块 · 对应 UI 2×2 */
const CURRICULUM_ISLAND_BLOCKS = [
  { island: "shikoku", label: "四国", emoji: "🌊", unitIds: [1] },
  { island: "kyushu", label: "九州", emoji: "⛰️", unitIds: [2] },
  { island: "honshu", label: "本州", emoji: "🏙️", unitIds: [3, 4, 5] },
  { island: "hokkaido", label: "北海道", emoji: "❄️", unitIds: [6] },
];

/** 24 课在示意地图上的站点（viewBox 0 0 240 360 · 南→北） */
const LESSON_MAP_POINTS = {
  1: { x: 155, y: 305 },
  2: { x: 130, y: 295 },
  3: { x: 105, y: 288 },
  4: { x: 95, y: 275 },
  5: { x: 42, y: 285 },
  6: { x: 55, y: 268 },
  7: { x: 68, y: 252 },
  8: { x: 35, y: 262 },
  9: { x: 118, y: 235 },
  10: { x: 132, y: 218 },
  11: { x: 145, y: 202 },
  12: { x: 128, y: 188 },
  13: { x: 138, y: 175 },
  14: { x: 125, y: 158 },
  15: { x: 112, y: 142 },
  16: { x: 100, y: 128 },
  17: { x: 108, y: 112 },
  18: { x: 115, y: 95 },
  19: { x: 122, y: 78 },
  20: { x: 108, y: 62 },
  21: { x: 95, y: 48 },
  22: { x: 120, y: 42 },
  23: { x: 145, y: 38 },
  24: { x: 128, y: 28 },
};

const CURRICULUM_LESSON_ORDER = Array.from({ length: 24 }, (_, i) => i + 1);

function getIslandBlocksForHome() {
  const units = getCurriculumUnitsForHome();
  return CURRICULUM_ISLAND_BLOCKS.map((block) => ({
    ...block,
    units: block.unitIds
      .map((uid) => units.find((u) => u.id === uid))
      .filter(Boolean),
  }));
}

function curriculumPathProgress(state) {
  const released = CURRICULUM_RELEASED_IDS.filter((id) => curriculumLessonHasData(id));
  let cleared = 0;
  released.forEach((id) => {
    const g = state?.lessons?.[id];
    if (g && g.gate0 && g.gate1 && g.gate2 && g.gate3) cleared++;
  });
  return { cleared, total: released.length, label: `${cleared}/${released.length} 課` };
}

/**
 * 封面配色 · 赤橙黄绿青蓝紫（日本风：中饱和、高明度、低对比边框）
 * 00=紫 · 第1–6单元=赤→蓝 · 见 docs/封面配色说明.md
 */
const CURRICULUM_PART0_THEME = {
  spectrum: "紫",
  accent: "#8e6ec0",
  primaryDark: "#5e35b1",
  border: "#d1c4e9",
  pageBg: "#f6f0fc",
  bg: "linear-gradient(152deg,#ede7f6 0%,#f6f0fc 55%,#faf8ff 100%)",
  label: "入門",
};

const CURRICULUM_STAGE_THEMES = {
  1: {
    spectrum: "赤",
    accent: "#e57373",
    primaryDark: "#c62828",
    border: "#ffcdd2",
    pageBg: "#fff5f5",
    bg: "linear-gradient(152deg,#ffebee 0%,#fff5f5 55%,#fffaf9 100%)",
    label: "赤",
  },
  2: {
    spectrum: "橙",
    accent: "#ffb74d",
    primaryDark: "#ef6c00",
    border: "#ffe0b2",
    pageBg: "#fff8f0",
    bg: "linear-gradient(152deg,#fff3e0 0%,#fff8f0 55%,#fffbf5 100%)",
    label: "橙",
  },
  3: {
    spectrum: "黄",
    accent: "#ffd54f",
    primaryDark: "#f9a825",
    border: "#fff9c4",
    pageBg: "#fffef5",
    bg: "linear-gradient(152deg,#fffde7 0%,#fffef5 55%,#fffff8 100%)",
    label: "黄",
  },
  4: {
    spectrum: "绿",
    accent: "#81c784",
    primaryDark: "#388e3c",
    border: "#c8e6c9",
    pageBg: "#f4faf4",
    bg: "linear-gradient(152deg,#e8f5e9 0%,#f4faf4 55%,#f9fdf9 100%)",
    label: "绿",
  },
  5: {
    spectrum: "青",
    accent: "#4dd0e1",
    primaryDark: "#00838f",
    border: "#b2ebf2",
    pageBg: "#f0fcfd",
    bg: "linear-gradient(152deg,#e0f7fa 0%,#f0fcfd 55%,#f5feff 100%)",
    label: "青",
  },
  6: {
    spectrum: "绀紫",
    accent: "#7e57c2",
    primaryDark: "#512da8",
    border: "#d1c4e9",
    pageBg: "#f5f0fa",
    bg: "linear-gradient(152deg,#ede7f6 0%,#f3e8ff 45%,#f5f0fa 100%)",
    label: "绀",
  },
};

/** 六单元 + 00 入門 · 新干线站点（viewBox 0 0 240 360 · 南→北） */
const CURRICULUM_UNIT_MAP_POINTS = {
  0: { x: 200, y: 192 },
  1: { x: 188, y: 172 },
  2: { x: 118, y: 200 },
  3: { x: 152, y: 224 },
  4: { x: 138, y: 152 },
  5: { x: 162, y: 102 },
  6: { x: 150, y: 28 },
};

const CURRICULUM_UNIT_PATH_ORDER = [0, 1, 2, 3, 4, 5, 6];

function curriculumShinkansenUnitPathD() {
  const parts = [];
  CURRICULUM_UNIT_PATH_ORDER.forEach((uid, i) => {
    const pt = CURRICULUM_UNIT_MAP_POINTS[uid];
    if (!pt) return;
    parts.push(`${i === 0 ? "M" : " L"} ${pt.x} ${pt.y}`);
  });
  return parts.join("");
}

function curriculumIntroCompleted() {
  try {
    const raw = localStorage.getItem("hyouga_intro_progress_v1");
    if (!raw) return false;
    const p = JSON.parse(raw);
    return Array.isArray(p.phaseDone) && p.phaseDone.length >= 3 && p.phaseDone.every(Boolean);
  } catch {
    return false;
  }
}

function curriculumUnitLessonsTouched(state, unit) {
  if (!unit) return false;
  if (state?.unitsTouched?.[unit.id]) return true;
  return unit.lessonIds.some((id) => {
    const g = state?.lessons?.[id];
    return !!(g && (g.gate1 || g.gate2 || g.gate3));
  });
}

/**
 * 单元视觉态：dormant 灰 · start 启动 · active 弱彩 · cleared 高亮+星
 */
function curriculumUnitVisualState(state, unitId) {
  const id = Number(unitId);
  const unit = CURRICULUM_UNITS.find((u) => u.id === id);
  if (!unit) return "dormant";
  const prog = curriculumUnitProgress(state, unit);
  if (curriculumFreeJumpMode()) {
    const hasPlayable = unit.lessonIds.some((lid) => getCurriculumLessonDisplay(lid).playable);
    if (!hasPlayable) return "dormant";
    if (prog.cleared >= prog.total && prog.total > 0) return "cleared";
    if (id === 1 && !curriculumUnitLessonsTouched(state, unit) && curriculumIntroCompleted()) {
      return "start";
    }
    return "active";
  }
  if (!prog.total) return "dormant";
  if (prog.cleared >= prog.total) return "cleared";
  if (id === 1 && !curriculumUnitLessonsTouched(state, unit) && curriculumIntroCompleted()) {
    return "start";
  }
  return "active";
}

function curriculumPart0VisualState() {
  return curriculumIntroCompleted() ? "done" : "start";
}

function curriculumMapFullyRevealed(state) {
  return CURRICULUM_UNITS.every((u) => curriculumUnitVisualState(state, u.id) === "cleared");
}

function touchCurriculumUnit(state, unitId) {
  const id = Number(unitId);
  if (!state.unitsTouched || typeof state.unitsTouched !== "object") state.unitsTouched = {};
  state.unitsTouched[id] = true;
}

function getUnitIdForLesson(lessonId) {
  const id = Number(lessonId);
  const u = CURRICULUM_UNITS.find((unit) => unit.lessonIds.includes(id));
  return u ? u.id : 1;
}

function getStageThemeForLesson(lessonId) {
  return CURRICULUM_STAGE_THEMES[getUnitIdForLesson(lessonId)] || CURRICULUM_STAGE_THEMES[1];
}

/** 封面星级展示（四关海星 · 见 formatLessonFourSeaStars） */
function curriculumLessonStarDisplay(state, lessonId) {
  const p = curriculumLessonProgressDisplay(state, lessonId);
  return { filled: p.filled, text: p.stars, title: p.title };
}

/** 四关 · 单词 / 会話 / 文法 / テスト（与课内 Tab 一致） */
const LESSON_FOUR_DIMS = [
  { gate: 0, label: "単語", labelZh: "单词" },
  { gate: 2, label: "会話", labelZh: "会话" },
  { gate: 1, label: "文法", labelZh: "语法" },
  { gate: 3, label: "テスト", labelZh: "测试" },
];

function lessonDimStarState(state, lessonId, gateNum) {
  const id = Number(lessonId);
  const g = state?.lessons?.[id] || {};
  if (g[`gate${gateNum}`]) return "gold";
  if (gateNum === 0) {
    const seen = state?.flashProgress?.[id]?.seen;
    if (Array.isArray(seen) && seen.length > 0) return "tried";
  }
  if (gateNum === 3 && Array.isArray(state?.mistakes) && state.mistakes.some((m) => m.lessonId === id)) {
    return "tried";
  }
  if (g.touched && g.touched[gateNum]) return "tried";
  return "ghost";
}

/** 四颗海星：金星=满分通关 · 空心=学过未过 · 虚框=未学 */
function formatLessonFourSeaStars(state, lessonId) {
  const parts = LESSON_FOUR_DIMS.map((d) => {
    const st = lessonDimStarState(state, lessonId, d.gate);
    const hint =
      st === "gold" ? "金星" : st === "tried" ? "未满分" : "未学";
    const sym = st === "gold" ? "★" : st === "tried" ? "☆" : "○";
    return `<span class="sea-star sea-star--${st}" title="${d.labelZh}·${hint}" aria-hidden="true">${sym}</span>`;
  });
  return `<span class="lesson-sea-stars" aria-label="単語·会話·文法·テスト">${parts.join("")}</span>`;
}

function countLessonGoldStars(state, lessonId) {
  return LESSON_FOUR_DIMS.filter((d) => lessonDimStarState(state, lessonId, d.gate) === "gold").length;
}

/** 课次行 · 圆圈序号 | 中文主题 + 日文课名 | 状态+海星 */
function curriculumLessonProgressDisplay(state, lessonId, options) {
  const id = Number(lessonId);
  const unitId = options?.unitId != null ? Number(options.unitId) : getUnitIdForLesson(id);
  const d = options?.lessonDisplay || getCurriculumLessonDisplay(id);
  const showReal =
    options?.forceReal ||
    curriculumDevCatalogMode() ||
    d.playable ||
    (typeof curriculumUnitVisualState === "function" &&
      curriculumUnitVisualState(state, unitId) !== "dormant");

  if (d.devStub || !d.hasData) {
    return {
      filled: 0,
      stars: formatLessonFourSeaStars(state, id),
      status: "準備中",
      title: "内容準備中",
    };
  }

  if (!showReal) {
    return {
      filled: 0,
      stars: formatLessonFourSeaStars(state, id),
      status: "未開啟",
      title: "单元未进入",
    };
  }

  const n = countLessonGoldStars(state, id);
  if (n === 0) {
    return {
      filled: 0,
      stars: formatLessonFourSeaStars(state, id),
      status: "未学習",
      title: "单词·会话·语法·测试",
    };
  }
  if (n === 4) {
    return {
      filled: 4,
      stars: formatLessonFourSeaStars(state, id),
      status: "通関",
      title: "四关金星",
    };
  }
  return {
    filled: n,
    stars: formatLessonFourSeaStars(state, id),
    status: `進行中 ${n}/4`,
    title: `金星 ${n}/4`,
  };
}

function applyUnitThemeToView(lessonId, rootEl) {
  const theme = getStageThemeForLesson(lessonId);
  const el = rootEl || document.getElementById("view-lesson");
  if (!el || !theme) return;
  const uid = getUnitIdForLesson(lessonId);
  el.dataset.unit = String(uid);
  el.style.setProperty("--mvp-primary", theme.accent);
  el.style.setProperty("--mvp-primary-dark", theme.primaryDark);
  el.style.setProperty("--mvp-border", theme.border);
  el.style.setProperty("--mvp-bg", theme.pageBg);
  el.style.setProperty("--unit-accent", theme.accent);
}

/** 首页线框：左列 1–3 单元 · 右列 4–6 单元 */
const CURRICULUM_STAGE_SLOTS = {
  1: "slot-l1",
  2: "slot-l2",
  3: "slot-l3",
  4: "slot-r1",
  5: "slot-r2",
  6: "slot-r3",
};

function curriculumLessonCleared(state, lessonId) {
  return countLessonGoldStars(state, lessonId) === 4;
}

/** 已发布且有数据的课全部三关通关 → 可自由选课刷星 */
function curriculumFreeExploreMode(state) {
  const released = CURRICULUM_RELEASED_IDS.filter((id) => curriculumLessonHasData(id));
  if (!released.length) return false;
  return released.every((id) => curriculumLessonCleared(state, id));
}

/** 线性通关：当前应攻克的下一课（仅计可 play 的课） */
function curriculumGetFocusLesson(state) {
  if (curriculumFreeJumpMode()) return null;
  if (curriculumDevCatalogMode()) return null;
  if (curriculumFreeExploreMode(state)) return null;
  for (const id of CURRICULUM_LESSON_ORDER) {
    const d = getCurriculumLessonDisplay(id);
    if (!d.playable) continue;
    if (!curriculumLessonCleared(state, id)) return id;
  }
  return null;
}

/** 散点学习：仅拦截未发布/无数据课 */
function curriculumCanEnterLesson(state, lessonId) {
  const id = Number(lessonId);
  if (curriculumDevCatalogMode()) return id >= 1 && id <= 24;
  const d = getCurriculumLessonDisplay(id);
  return !!d.playable;
}

/** 新用户闪烁引导：Part-0 与第1课（或当前 focus 课） */
/** 新干线示意路径 · 按课序连接 24 站（viewBox 0 0 240 360） */
function curriculumShinkansenPathD() {
  const parts = [];
  CURRICULUM_LESSON_ORDER.forEach((id, i) => {
    const pt = LESSON_MAP_POINTS[id];
    if (!pt) return;
    parts.push(`${i === 0 ? "M" : " L"} ${pt.x} ${pt.y}`);
  });
  return parts.join("");
}

function curriculumGuideFlashPart0(state) {
  return !state?.homeGuide?.part0Tap;
}

function curriculumGuideFlashLesson1(state) {
  if (state?.homeGuide?.lesson1Tap) return false;
  if (curriculumFreeExploreMode(state)) return false;
  return true;
}

function curriculumGuideFlashMapNode(state, lessonId) {
  const id = Number(lessonId);
  if (id === 1 && curriculumGuideFlashLesson1(state)) return true;
  const focus = curriculumGetFocusLesson(state);
  if (focus && focus === id && !state?.homeGuide?.focusTap) return true;
  return false;
}

function curriculumGuideFlashPill(state, lessonId) {
  const id = Number(lessonId);
  if (id === 1 && curriculumGuideFlashLesson1(state)) return true;
  const focus = curriculumGetFocusLesson(state);
  if (focus && focus === id && !state?.homeGuide?.focusTap) return true;
  return false;
}

function curriculumUnitProgress(state, unit) {
  const lessons = unit.lessonIds.map((id) => getCurriculumLessonDisplay(id));
  const playable = lessons.filter((L) => L.playable);
  let cleared = 0;
  playable.forEach((L) => {
    const g = state?.lessons?.[L.lessonId];
    if (g && g.gate0 && g.gate1 && g.gate2 && g.gate3) cleared++;
  });
  return {
    cleared,
    total: playable.length,
    released: lessons.filter((L) => L.released).length,
    allTotal: lessons.length,
  };
}

/** 隐藏彩蛋「通关全家福」· 第 1–24 課（六单元）每课四颗金星 */
const CURRICULUM_GRAND_FINALE_LESSON_IDS = CURRICULUM_UNITS.flatMap((u) => u.lessonIds);

function curriculumGrandFinaleProgress(state) {
  const total = CURRICULUM_GRAND_FINALE_LESSON_IDS.length;
  let goldLessons = 0;
  CURRICULUM_GRAND_FINALE_LESSON_IDS.forEach((id) => {
    if (curriculumLessonCleared(state, id)) goldLessons += 1;
  });
  return { goldLessons, total, unlocked: goldLessons === total };
}

/** 唯一开启条件：24 课 × 単語·会話·文法·テスト 各 1 金星（共 4 金星/课） */
function curriculumGrandFinaleUnlocked(state) {
  return curriculumGrandFinaleProgress(state).unlocked;
}

/** 当前主攻阶段：第一个尚有未通关已发布课的单元 */
function getCurrentStageUnitId(state) {
  for (const u of CURRICULUM_UNITS) {
    const prog = curriculumUnitProgress(state, u);
    if (prog.total > 0 && prog.cleared < prog.total) return u.id;
    const anyReleased = u.lessonIds.some((id) => curriculumIsReleased(id));
    if (anyReleased && prog.cleared < prog.allTotal) return u.id;
  }
  return 1;
}
