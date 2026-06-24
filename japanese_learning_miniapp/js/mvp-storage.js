const MVP_STORAGE_KEY = "hyouga_mvp_v1";

function mvpDefaultState() {
  return {
    studyDays: [],
    lessons: {
      14: { gate1: false, gate2: false, gate3: false },
      16: { gate1: false, gate2: false, gate3: false },
      18: { gate1: false, gate2: false, gate3: false },
    },
    mistakes: [],
    lastLessonId: 16,
  };
}

function loadMvpState() {
  try {
    const raw = localStorage.getItem(MVP_STORAGE_KEY);
    if (!raw) return mvpDefaultState();
    const parsed = JSON.parse(raw);
    const base = mvpDefaultState();
    return {
      ...base,
      ...parsed,
      lessons: { ...base.lessons, ...(parsed.lessons || {}) },
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      studyDays: Array.isArray(parsed.studyDays) ? parsed.studyDays : [],
    };
  } catch {
    return mvpDefaultState();
  }
}

function saveMvpState(state) {
  localStorage.setItem(MVP_STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function touchStudyDay(state) {
  const key = todayKey();
  if (!state.studyDays.includes(key)) {
    state.studyDays.push(key);
    state.studyDays.sort();
  }
  saveMvpState(state);
}

function setGateDone(state, lessonId, gate) {
  const lid = Number(lessonId);
  if (!state.lessons[lid]) {
    state.lessons[lid] = { gate1: false, gate2: false, gate3: false };
  }
  state.lessons[lid][`gate${gate}`] = true;
  touchStudyDay(state);
  saveMvpState(state);
}

function lessonGatePercent(state, lessonId) {
  const g = state.lessons[Number(lessonId)] || {};
  const done = [g.gate1, g.gate2, g.gate3].filter(Boolean).length;
  return Math.round((done / 3) * 100);
}

function addMvpMistake(state, item) {
  const entry = {
    id: Date.now() + Math.random(),
    lessonId: item.lessonId,
    questionId: item.questionId,
    question: item.question,
    userAnswer: item.userAnswer,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation || "",
    grammarNodeId: item.grammarNodeId || "",
    wrongAt: item.wrongAt || new Date().toISOString(),
    reviewCount: 0,
  };
  state.mistakes = state.mistakes.filter((m) => m.questionId !== item.questionId);
  state.mistakes.unshift(entry);
  if (state.mistakes.length > 100) state.mistakes = state.mistakes.slice(0, 100);
  saveMvpState(state);
}

function removeMvpMistake(state, id) {
  state.mistakes = state.mistakes.filter((m) => m.id !== id);
  saveMvpState(state);
}

/** 错题产生后第 1、3、7 天提醒 */
function daysSinceWrong(wrongAt) {
  const start = new Date(wrongAt);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / 86400000);
}

function isMistakeDue(m) {
  const d = daysSinceWrong(m.wrongAt);
  return d === 1 || d === 3 || d === 7 || d > 7;
}

function dueMistakes(state) {
  return state.mistakes.filter(isMistakeDue);
}

function weakGrammarTop3(state) {
  const counts = {};
  state.mistakes.forEach((m) => {
    if (!m.grammarNodeId) return;
    counts[m.grammarNodeId] = (counts[m.grammarNodeId] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => {
      const found = findNodeAcrossLessons(id);
      return {
        id,
        title: found?.node?.title || id,
        count,
      };
    });
}

function weekStudyDays(state) {
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    keys.push(`${d.getFullYear()}-${m}-${day}`);
  }
  return keys.map((k) => ({ date: k, studied: state.studyDays.includes(k) }));
}

function clearMvpData() {
  localStorage.removeItem(MVP_STORAGE_KEY);
}
