/**
 * 满级测试卡 · 一条链接全开（不必打关）
 * 真源说明：docs/测试卡-满级链接.md
 * 开启：URL 带 testcard=1 或 developer=1（会写入 localStorage）
 * 关闭：?testcard=0 或 我的页「清除学习数据」
 * 电脑验收：dev-phone-preview.html（竖屏 iframe）
 */
const HyougaTestCard = (function () {
  const LS_KEY = "hyouga_test_card";
  const LS_DEV = "hyouga_developer";

  function fromUrl() {
    try {
      const q = location.search || "";
      if (/[?&](?:testcard|developer|dev)=0(?:&|$)/.test(q)) return false;
      if (/[?&]testcard=1(?:&|$)/.test(q)) return true;
      if (/[?&](?:developer|dev)=1(?:&|$)/.test(q)) return true;
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function active() {
    const u = fromUrl();
    if (u === true) return true;
    if (u === false) return false;
    try {
      if (localStorage.getItem(LS_KEY) === "1") return true;
      if (localStorage.getItem(LS_DEV) === "1") return true;
    } catch (_) {
      return false;
    }
    return false;
  }

  function persistOn() {
    try {
      localStorage.setItem(LS_KEY, "1");
      localStorage.setItem(LS_DEV, "1");
      localStorage.setItem("hyouga_dev_catalog", "1");
      localStorage.setItem("hyouga_story_dev", "1");
    } catch (_) {
      /* ignore */
    }
  }

  function persistOff() {
    try {
      localStorage.setItem(LS_KEY, "0");
      localStorage.setItem(LS_DEV, "0");
    } catch (_) {
      /* ignore */
    }
  }

  function lessonIds() {
    if (typeof CURRICULUM_RELEASED_IDS !== "undefined") return CURRICULUM_RELEASED_IDS.slice();
    return Array.from({ length: 24 }, (_, i) => i + 1);
  }

  /** 写入满级进度：24 课四金星、六单元条带齐、L3 解锁 */
  function apply(state) {
    if (!state || typeof state !== "object") return state;
    const cleared =
      typeof mvpLessonGatesCleared === "function"
        ? mvpLessonGatesCleared
        : () => ({
            gate0: true,
            gate1: true,
            gate2: true,
            gate3: true,
            quizScore: 5,
            quizTotal: 5,
            quizPerfect: true,
            touched: { 0: true, 1: true, 2: true, 3: true },
          });

    if (!state.lessons || typeof state.lessons !== "object") state.lessons = {};
    lessonIds().forEach((lid) => {
      state.lessons[lid] = cleared();
    });

    if (typeof StoryReward !== "undefined") StoryReward.ensureStory(state);
    if (!state.story) state.story = { units: {}, pendingAuto: null, eggGrandSeen: false };
    if (!state.story.eggs) state.story.eggs = { lesson: {}, unit: {}, ultimate: {} };

    const units =
      typeof getCurriculumUnitsForHome === "function" ? getCurriculumUnitsForHome() : [];

    if (!state.unitsTouched || typeof state.unitsTouched !== "object") state.unitsTouched = {};
    units.forEach((unit) => {
      const key = String(unit.id);
      state.unitsTouched[unit.id] = true;
      state.story.units[key] = {
        rewardSeen: true,
        stripUnlocked: [true, true, true, true],
      };
      state.story.eggs.unit[key] = { seen: true, unlockedAt: Date.now() };
    });

    lessonIds().forEach((lid) => {
      state.story.eggs.lesson[String(lid)] = { seen: true, unlockedAt: Date.now() };
    });

    state.story.eggs.ultimate = { seen: true, unlockedAt: Date.now() };
    state.story.eggGrandSeen = true;
    state.story.pendingAuto = null;

    if (typeof StoryReward !== "undefined" && StoryReward.syncAllStrips) {
      StoryReward.syncAllStrips(state);
    }

    return state;
  }

  function skipsHomeAutoEggPopup() {
    if (!active()) return false;
    const q = location.search || "";
    if (/[?&]egg=/.test(q)) return false;
    if (/[?&]storyAuto=/.test(q)) return false;
    if (/[?&]storyEggLesson=/.test(q)) return false;
    if (/[?&]storyPreview=/.test(q)) return false;
    return true;
  }

  function bootUrl(state, saveFn) {
    const u = fromUrl();
    if (u === true) persistOn();
    if (u === false) persistOff();
    if (!active()) return state;
    apply(state);
    if (typeof saveFn === "function") saveFn(state);
    if (typeof document !== "undefined") document.documentElement.classList.add("hyouga-test-card-on");
    return state;
  }

  function learnUrl(base, cacheVer) {
    const v = cacheVer || (typeof ShareWechat !== "undefined" ? ShareWechat.CACHE_VER : "93");
    const origin = (base || `${location.protocol}//${location.host}`).replace(/\/$/, "");
    return `${origin}/index.html?v=${v}&testcard=1&developer=1`;
  }

  /** 每次读档后强制满级（避免 reload / 合并种子覆盖） */
  function wrapLoadMvpState() {
    if (typeof loadMvpState !== "function" || loadMvpState.__hyougaTestCardWrapped) return;
    const orig = loadMvpState;
    function wrapped() {
      let s = orig();
      if (active()) s = apply(s);
      return s;
    }
    wrapped.__hyougaTestCardWrapped = true;
    loadMvpState = wrapped;
  }

  wrapLoadMvpState();

  return {
    active,
    apply,
    bootUrl,
    persistOn,
    persistOff,
    skipsHomeAutoEggPopup,
    learnUrl,
    wrapLoadMvpState,
  };
})();
