const STORAGE_KEY = "jp_study_app_v1";

const nowMs = () => Date.now();
const startOfTodayMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const uuid = () => {
  const s = Math.random().toString(16).slice(2);
  return `id_${s}_${Date.now().toString(16)}`;
};

const normalizeTags = (value) =>
  String(value ?? "")
    .split(/[,，]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

const normalizeSrs = (srs) => {
  const base = {
    dueAt: startOfTodayMs(),
    intervalDays: 0,
    ease: 2.2,
    streak: 0,
    lapses: 0
  };
  if (!srs || typeof srs !== "object") return base;
  return {
    dueAt: typeof srs.dueAt === "number" ? srs.dueAt : base.dueAt,
    intervalDays: typeof srs.intervalDays === "number" ? clamp(Math.round(srs.intervalDays), 0, 3650) : base.intervalDays,
    ease: typeof srs.ease === "number" ? clamp(srs.ease, 1.3, 3.2) : base.ease,
    streak: typeof srs.streak === "number" ? clamp(Math.round(srs.streak), 0, 9999) : base.streak,
    lapses: typeof srs.lapses === "number" ? clamp(Math.round(srs.lapses), 0, 9999) : base.lapses
  };
};

const sanitizeCard = (c) => {
  const t = nowMs();
  const base = {
    id: typeof c?.id === "string" ? c.id : uuid(),
    jp: typeof c?.jp === "string" ? c.jp.trim() : "",
    reading: typeof c?.reading === "string" ? c.reading.trim() : "",
    cn: typeof c?.cn === "string" ? c.cn.trim() : "",
    tags: Array.isArray(c?.tags) ? c.tags.filter((t) => typeof t === "string" && t.trim()).slice(0, 20) : [],
    deck: typeof c?.deck === "string" && c.deck.trim() ? c.deck.trim() : "默认",
    createdAt: typeof c?.createdAt === "number" ? c.createdAt : t,
    updatedAt: typeof c?.updatedAt === "number" ? c.updatedAt : t,
    srs: normalizeSrs(c?.srs)
  };
  if (!base.jp && !base.cn && !base.reading) base.jp = "(空)";
  return base;
};

const defaultState = () => ({
  version: 1,
  decks: ["默认"],
  cards: []
});

const loadState = () => {
  const raw = wx.getStorageSync(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const decks = Array.isArray(parsed?.decks) ? parsed.decks.filter((d) => typeof d === "string" && d.trim()).slice(0, 200) : ["默认"];
    const cards = Array.isArray(parsed?.cards) ? parsed.cards : [];
    const uniqueDecks = Array.from(new Set(decks.map((d) => d.trim()).filter(Boolean)));
    if (!uniqueDecks.includes("默认")) uniqueDecks.unshift("默认");
    return {
      version: 1,
      decks: uniqueDecks,
      cards: cards.filter((c) => c && typeof c === "object").map((c) => sanitizeCard(c)).slice(0, 5000)
    };
  } catch {
    return defaultState();
  }
};

const saveState = (state) => {
  wx.setStorageSync(STORAGE_KEY, JSON.stringify(state));
};

const formatDue = (ms) => {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const matchText = (card, q) => {
  const hay = [card.jp, card.reading, card.cn, card.deck, ...(Array.isArray(card.tags) ? card.tags : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

Page({
  data: {
    decks: ["默认"],
    deckSelectIndex: 0,
    filterDeckIndex: 0,
    filterDeckLabels: ["全部分组", "默认"],
    filterDeckLabel: "全部分组",
    quizDeckIndex: 0,
    quizDeckLabels: ["全部分组", "默认"],
    quizRangeIndex: 0,
    quizRangeLabels: ["只复习到期", "随机抽全部"],
    modeText: "添加模式",
    isEditMode: false,
    form: {
      jp: "",
      reading: "",
      cn: "",
      tags: "",
      deck: "默认"
    },
    searchQuery: "",
    cardsView: [],
    filteredCount: 0,
    totalCount: 0,
    dueCount: 0,
    quizPill: "未开始",
    quiz: {
      range: "due",
      rangeLabel: "只复习到期",
      deck: "__all__",
      deckLabel: "全部分组",
      running: false,
      showBack: false,
      front: "点击“开始”",
      back: "",
      tip: "点击卡片可翻面",
      hint: ""
    },
    showExport: false,
    exportText: "",
    showImport: false,
    importText: ""
  },

  onLoad() {
    this.state = loadState();
    this.editingId = null;
    this.quizQueue = [];
    this.quizIndex = -1;
    this.refreshUi({ keepFormDeck: false });
  },

  onShareAppMessage() {
    return {
      title: "日语学习小程序",
      path: "/pages/index/index"
    };
  },

  ensureDeck(name) {
    const n = String(name ?? "").trim() || "默认";
    if (!this.state.decks.includes(n)) this.state.decks.push(n);
    const unique = Array.from(new Set(this.state.decks.map((d) => String(d).trim()).filter(Boolean)));
    unique.sort((a, b) => a.localeCompare(b, "zh"));
    if (!unique.includes("默认")) unique.unshift("默认");
    this.state.decks = unique;
  },

  computeDueCount() {
    const today = startOfTodayMs();
    let due = 0;
    for (const c of this.state.cards) {
      if ((c.srs?.dueAt ?? today) <= today) due += 1;
    }
    return due;
  },

  getFilterDeckValue() {
    const idx = this.data.filterDeckIndex;
    if (idx <= 0) return "__all__";
    return this.state.decks[idx - 1] ?? "__all__";
  },

  getQuizDeckValue() {
    const idx = this.data.quizDeckIndex;
    if (idx <= 0) return "__all__";
    return this.state.decks[idx - 1] ?? "__all__";
  },

  getQuizRangeValue() {
    return this.data.quizRangeIndex === 1 ? "all" : "due";
  },

  getFilteredCards() {
    const q = String(this.data.searchQuery ?? "").trim().toLowerCase();
    const deck = this.getFilterDeckValue();
    const items = this.state.cards.slice().sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    return items.filter((c) => {
      const deckOk = deck === "__all__" ? true : c.deck === deck;
      const qOk = q ? matchText(c, q) : true;
      return deckOk && qOk;
    });
  },

  buildCardsView(cards) {
    return cards.map((c) => {
      const cnLine = [c.reading ? `【${c.reading}】` : "", c.cn].filter(Boolean).join(" ");
      const dueText = formatDue(c.srs?.dueAt ?? startOfTodayMs());
      const tagsText = Array.isArray(c.tags) && c.tags.length ? c.tags.join("，") : "";
      return {
        id: c.id,
        jp: c.jp || "(空)",
        cnLine: cnLine || "(无解释)",
        deck: c.deck,
        dueText,
        tagsText
      };
    });
  },

  refreshPickers({ keepFormDeck }) {
    const decks = this.state.decks.slice();
    const filterDeckLabels = ["全部分组", ...decks];
    const quizDeckLabels = ["全部分组", ...decks];

    let deckSelectIndex = 0;
    const currentDeck = keepFormDeck ? this.data.form.deck : "默认";
    deckSelectIndex = Math.max(0, decks.indexOf(currentDeck));
    const nextFormDeck = decks[deckSelectIndex] ?? "默认";

    let filterDeckIndex = this.data.filterDeckIndex;
    filterDeckIndex = clamp(filterDeckIndex, 0, filterDeckLabels.length - 1);
    const filterDeckLabel = filterDeckLabels[filterDeckIndex] ?? "全部分组";

    let quizDeckIndex = this.data.quizDeckIndex;
    quizDeckIndex = clamp(quizDeckIndex, 0, quizDeckLabels.length - 1);
    const quizDeckLabel = quizDeckLabels[quizDeckIndex] ?? "全部分组";

    const quizRangeIndex = this.data.quizRangeIndex;
    const rangeLabel = this.data.quizRangeLabels[quizRangeIndex] ?? "只复习到期";

    this.setData({
      decks,
      deckSelectIndex,
      filterDeckLabels,
      filterDeckIndex,
      filterDeckLabel,
      quizDeckLabels,
      quizDeckIndex,
      quiz: {
        ...this.data.quiz,
        deckLabel: quizDeckLabel,
        rangeLabel
      },
      form: {
        ...this.data.form,
        deck: nextFormDeck
      }
    });
  },

  refreshUi({ keepFormDeck }) {
    this.ensureDeck("默认");
    this.refreshPickers({ keepFormDeck });
    const filtered = this.getFilteredCards();
    const dueCount = this.computeDueCount();
    this.setData({
      cardsView: this.buildCardsView(filtered),
      filteredCount: filtered.length,
      totalCount: this.state.cards.length,
      dueCount
    });
    this.updateQuizUiPill();
  },

  setModeEdit(id) {
    this.editingId = id;
    const isEditMode = Boolean(id);
    this.setData({
      isEditMode,
      modeText: isEditMode ? "编辑模式" : "添加模式"
    });
  },

  clearForm() {
    const deck = this.data.form.deck || "默认";
    this.setData({
      form: {
        jp: "",
        reading: "",
        cn: "",
        tags: "",
        deck
      }
    });
  },

  onJpInput(e) {
    this.setData({ form: { ...this.data.form, jp: e.detail.value } });
  },
  onReadingInput(e) {
    this.setData({ form: { ...this.data.form, reading: e.detail.value } });
  },
  onCnInput(e) {
    this.setData({ form: { ...this.data.form, cn: e.detail.value } });
  },
  onTagsInput(e) {
    this.setData({ form: { ...this.data.form, tags: e.detail.value } });
  },

  onDeckPick(e) {
    const idx = Number(e.detail.value ?? 0);
    const deck = this.state.decks[idx] ?? "默认";
    this.setData({
      deckSelectIndex: idx,
      form: { ...this.data.form, deck }
    });
  },

  onSaveTap() {
    const jp = String(this.data.form.jp ?? "").trim();
    const reading = String(this.data.form.reading ?? "").trim();
    const cn = String(this.data.form.cn ?? "").trim();
    const deck = String(this.data.form.deck ?? "").trim() || "默认";
    const tags = normalizeTags(this.data.form.tags ?? "");

    if (!jp && !reading && !cn) {
      wx.showToast({ title: "至少填一项内容", icon: "none" });
      return;
    }

    this.ensureDeck(deck);

    const t = nowMs();
    if (!this.editingId) {
      const card = sanitizeCard({
        id: uuid(),
        jp,
        reading,
        cn,
        deck,
        tags,
        createdAt: t,
        updatedAt: t,
        srs: { dueAt: startOfTodayMs(), intervalDays: 0, ease: 2.2, streak: 0, lapses: 0 }
      });
      this.state.cards.unshift(card);
      saveState(this.state);
      this.refreshUi({ keepFormDeck: true });
      this.clearForm();
      wx.showToast({ title: "已保存", icon: "success" });
      return;
    }

    const idx = this.state.cards.findIndex((c) => c.id === this.editingId);
    if (idx < 0) {
      this.setModeEdit(null);
      wx.showToast({ title: "编辑目标不存在", icon: "none" });
      return;
    }

    const old = this.state.cards[idx];
    this.state.cards[idx] = sanitizeCard({
      ...old,
      jp,
      reading,
      cn,
      deck,
      tags,
      updatedAt: t
    });
    saveState(this.state);
    this.refreshUi({ keepFormDeck: true });
    wx.showToast({ title: "已更新", icon: "success" });
  },

  onClearTap() {
    this.clearForm();
    wx.showToast({ title: "已清空", icon: "none" });
  },

  onCancelEditTap() {
    this.setModeEdit(null);
    this.clearForm();
    wx.showToast({ title: "已退出编辑", icon: "none" });
  },

  onEditTap(e) {
    const id = e.currentTarget.dataset.id;
    const card = this.state.cards.find((c) => c.id === id);
    if (!card) return;
    this.ensureDeck(card.deck);
    this.setModeEdit(id);
    const tags = Array.isArray(card.tags) ? card.tags.join(",") : "";
    this.setData({
      form: {
        jp: card.jp ?? "",
        reading: card.reading ?? "",
        cn: card.cn ?? "",
        tags,
        deck: card.deck
      }
    });
    this.refreshPickers({ keepFormDeck: true });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    wx.showToast({ title: "进入编辑", icon: "none" });
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    const card = this.state.cards.find((c) => c.id === id);
    if (!card) return;
    wx.showModal({
      title: "删除卡片",
      content: `确定删除这张卡片吗？\n\n${card.jp}\n${card.cn}`,
      success: (res) => {
        if (!res.confirm) return;
        this.state.cards = this.state.cards.filter((c) => c.id !== id);
        if (this.editingId === id) {
          this.setModeEdit(null);
          this.clearForm();
        }
        saveState(this.state);
        this.refreshUi({ keepFormDeck: true });
        wx.showToast({ title: "已删除", icon: "success" });
      }
    });
  },

  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
    this.refreshUi({ keepFormDeck: true });
  },

  onFilterDeckPick(e) {
    const idx = Number(e.detail.value ?? 0);
    const label = this.data.filterDeckLabels[idx] ?? "全部分组";
    this.setData({ filterDeckIndex: idx, filterDeckLabel: label });
    this.refreshUi({ keepFormDeck: true });
  },

  onQuizRangePick(e) {
    const idx = Number(e.detail.value ?? 0);
    const label = this.data.quizRangeLabels[idx] ?? "只复习到期";
    this.setData({
      quizRangeIndex: idx,
      quiz: { ...this.data.quiz, rangeLabel: label, range: idx === 1 ? "all" : "due" }
    });
    this.resetQuizView();
  },

  onQuizDeckPick(e) {
    const idx = Number(e.detail.value ?? 0);
    const label = this.data.quizDeckLabels[idx] ?? "全部分组";
    this.setData({
      quizDeckIndex: idx,
      quiz: { ...this.data.quiz, deckLabel: label }
    });
    this.resetQuizView();
  },

  updateQuizUiPill() {
    const q = this.data.quiz;
    if (!q.running) {
      this.setData({ quizPill: "未开始" });
      return;
    }
    this.setData({ quizPill: `${this.quizIndex + 1}/${this.quizQueue.length}` });
  },

  getQuizCandidates() {
    const deck = this.getQuizDeckValue();
    const today = startOfTodayMs();
    const all = this.state.cards.filter((c) => (deck === "__all__" ? true : c.deck === deck));
    if (this.getQuizRangeValue() === "all") return all;
    return all.filter((c) => (c.srs?.dueAt ?? today) <= today);
  },

  resetQuizView() {
    this.quizQueue = [];
    this.quizIndex = -1;
    this.setData({
      quizPill: "未开始",
      quiz: {
        ...this.data.quiz,
        running: false,
        showBack: false,
        front: "点击“开始”",
        back: "",
        tip: "点击卡片可翻面",
        hint: ""
      }
    });
  },

  showQuizCard() {
    if (this.quizIndex < 0 || this.quizIndex >= this.quizQueue.length) {
      this.setData({
        quizPill: "已结束",
        quiz: {
          ...this.data.quiz,
          running: false,
          showBack: false,
          front: "没有可复习的卡片",
          back: "",
          tip: "先去添加卡片或切换复习范围",
          hint: ""
        }
      });
      return;
    }
    const c = this.quizQueue[this.quizIndex];
    const title = [c.jp, c.reading ? `(${c.reading})` : ""].filter(Boolean).join(" ");
    const hint = `分组：${c.deck}  ·  标签：${c.tags?.length ? c.tags.join("，") : "无"}`;
    this.setData({
      quizPill: `${this.quizIndex + 1}/${this.quizQueue.length}`,
      quiz: {
        ...this.data.quiz,
        running: true,
        showBack: false,
        front: title || "(空)",
        back: c.cn || "(无解释)",
        tip: "点击卡片可翻面",
        hint
      }
    });
  },

  onStartQuizTap() {
    const candidates = this.getQuizCandidates();
    if (candidates.length === 0) {
      this.resetQuizView();
      wx.showToast({ title: "没有可复习内容", icon: "none" });
      return;
    }
    this.quizQueue = shuffle(candidates.slice());
    this.quizIndex = 0;
    this.showQuizCard();
    wx.showToast({ title: "开始复习", icon: "none" });
  },

  onFlipTap() {
    if (this.quizIndex < 0 || this.quizIndex >= this.quizQueue.length) return;
    this.setData({ quiz: { ...this.data.quiz, showBack: !this.data.quiz.showBack } });
  },

  schedule(card, { correct }) {
    const today = startOfTodayMs();
    const srs = normalizeSrs(card.srs);
    let ease = srs.ease;
    let interval = srs.intervalDays;
    let streak = srs.streak;
    let lapses = srs.lapses;

    if (correct) {
      streak += 1;
      ease = clamp(ease + 0.08, 1.3, 3.2);
      if (interval <= 0) interval = 1;
      else if (interval === 1) interval = 3;
      else interval = Math.round(interval * ease);
    } else {
      lapses += 1;
      streak = 0;
      ease = clamp(ease - 0.2, 1.3, 3.2);
      interval = 1;
    }

    const dueAt = today + interval * 24 * 60 * 60 * 1000;
    card.srs = { dueAt, intervalDays: interval, ease, streak, lapses };
    card.updatedAt = nowMs();
  },

  answer(correct) {
    if (this.quizIndex < 0 || this.quizIndex >= this.quizQueue.length) return;
    const current = this.quizQueue[this.quizIndex];
    const real = this.state.cards.find((x) => x.id === current.id);
    if (real) this.schedule(real, { correct });
    saveState(this.state);
    this.refreshUi({ keepFormDeck: true });
    this.quizIndex += 1;
    this.showQuizCard();
  },

  onCorrectTap() {
    this.answer(true);
  },

  onWrongTap() {
    this.answer(false);
  },

  onExportTap() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: "JapaneseStudyMiniProgram",
      version: 1,
      decks: this.state.decks,
      cards: this.state.cards
    };
    const text = JSON.stringify(payload);
    this.setData({ showExport: true, exportText: text, showImport: false });
    wx.pageScrollTo({ scrollTop: 99999, duration: 200 });
  },

  onCopyExportTap() {
    wx.setClipboardData({
      data: this.data.exportText || "",
      success: () => wx.showToast({ title: "已复制", icon: "success" })
    });
  },

  onCloseExportTap() {
    this.setData({ showExport: false, exportText: "" });
  },

  onImportTap() {
    this.setData({ showImport: true, showExport: false });
    wx.pageScrollTo({ scrollTop: 99999, duration: 200 });
  },

  onImportTextInput(e) {
    this.setData({ importText: e.detail.value });
  },

  onConfirmImportTap() {
    const text = String(this.data.importText ?? "").trim();
    if (!text) {
      wx.showToast({ title: "请先粘贴文本", icon: "none" });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      wx.showToast({ title: "导入失败：不是JSON", icon: "none" });
      return;
    }
    const decks = Array.isArray(parsed?.decks) ? parsed.decks : [];
    const cards = Array.isArray(parsed?.cards) ? parsed.cards : [];
    const next = defaultState();
    next.decks = Array.from(new Set(["默认", ...decks.filter((d) => typeof d === "string" && d.trim())])).slice(0, 200);
    next.cards = cards.filter((c) => c && typeof c === "object").map((c) => sanitizeCard(c)).slice(0, 5000);
    this.state = next;
    saveState(this.state);
    this.setModeEdit(null);
    this.clearForm();
    this.setData({ showImport: false, importText: "" });
    this.resetQuizView();
    this.refreshUi({ keepFormDeck: false });
    wx.showToast({ title: "已导入", icon: "success" });
  },

  onCloseImportTap() {
    this.setData({ showImport: false, importText: "" });
  },

  onWipeTap() {
    wx.showModal({
      title: "清空全部",
      content: "确定清空全部卡片吗？此操作不可恢复。",
      success: (res) => {
        if (!res.confirm) return;
        this.state = defaultState();
        saveState(this.state);
        this.setModeEdit(null);
        this.clearForm();
        this.setData({ searchQuery: "", showExport: false, exportText: "", showImport: false, importText: "" });
        this.resetQuizView();
        this.refreshUi({ keepFormDeck: false });
        wx.showToast({ title: "已清空", icon: "success" });
      }
    });
  }
});

