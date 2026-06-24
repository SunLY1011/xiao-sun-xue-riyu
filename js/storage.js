const STORAGE_KEY = "hyouga_study_v1";

const defaultState = () => ({
  currentLesson: 1,
  settings: {
    apiBase: "https://api.openai.com/v1",
    apiKey: "",
    apiModel: "gpt-4o-mini",
  },
  progress: {},
  scenarioProgress: {},
  mistakes: [],
  chatHistory: {},
  stats: { listen: 0, speak: 0, read: 0, write: 0, chat: 0, correct: 0, total: 0 },
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getLessonProgress(state, lessonId) {
  const p = state.progress[lessonId] || { listen: 0, speak: 0, read: 0, write: 0, done: false };
  const modes = ["listen", "speak", "read", "write"];
  const total = modes.length;
  const done = modes.filter((m) => p[m] > 0).length;
  return { ...p, percent: Math.round((done / total) * 100) };
}

function recordExercise(state, lessonId, mode, correct) {
  if (!state.progress[lessonId]) {
    state.progress[lessonId] = { listen: 0, speak: 0, read: 0, write: 0, done: false };
  }
  state.progress[lessonId][mode] = (state.progress[lessonId][mode] || 0) + 1;
  state.stats[mode] = (state.stats[mode] || 0) + 1;
  state.stats.total = (state.stats.total || 0) + 1;
  if (correct) state.stats.correct = (state.stats.correct || 0) + 1;
  const lp = state.progress[lessonId];
  if (lp.listen && lp.speak && lp.read && lp.write) lp.done = true;
  saveState(state);
}

function addMistake(state, item) {
  state.mistakes.unshift({
    id: Date.now(),
    lessonId: item.lessonId,
    mode: item.mode,
    question: item.question,
    yourAnswer: item.yourAnswer,
    correctAnswer: item.correctAnswer,
    at: new Date().toISOString(),
  });
  if (state.mistakes.length > 200) state.mistakes = state.mistakes.slice(0, 200);
  saveState(state);
}

function removeMistake(state, id) {
  state.mistakes = state.mistakes.filter((m) => m.id !== id);
  saveState(state);
}

function overallPercent(state) {
  let sum = 0;
  for (let i = 1; i <= 24; i++) sum += getLessonProgress(state, i).percent;
  return Math.round(sum / 24);
}

function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}
