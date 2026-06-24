/** 自学笔记：课次 / 单元 / 全册聚合（localStorage via mvp state） */
const LearningNotes = (() => {
  function ensure(state) {
    if (!state.notes || typeof state.notes !== "object") {
      state.notes = { lesson: {}, unit: {}, bookExtra: "" };
    }
    if (!state.notes.lesson || typeof state.notes.lesson !== "object") state.notes.lesson = {};
    if (!state.notes.unit || typeof state.notes.unit !== "object") state.notes.unit = {};
    if (typeof state.notes.bookExtra !== "string") state.notes.bookExtra = "";
    if (!state.ui || typeof state.ui !== "object") state.ui = {};
    return state;
  }

  function scopeKey(scope) {
    if (!scope || scope.type === "book") return "book";
    const id = Number(scope.id);
    return `${scope.type}:${id}`;
  }

  function getText(state, scope) {
    ensure(state);
    if (!scope || scope.type === "book") return state.notes.bookExtra || "";
    const id = String(Number(scope.id));
    if (scope.type === "lesson") return state.notes.lesson[id] || "";
    if (scope.type === "unit") return state.notes.unit[id] || "";
    return "";
  }

  function setText(state, scope, text) {
    ensure(state);
    const val = String(text || "");
    if (!scope || scope.type === "book") {
      state.notes.bookExtra = val;
      return state;
    }
    const id = String(Number(scope.id));
    if (scope.type === "lesson") state.notes.lesson[id] = val;
    else if (scope.type === "unit") state.notes.unit[id] = val;
    return state;
  }

  function hasText(state, scope) {
    return !!getText(state, scope).trim();
  }

  function lessonLabel(id) {
    const lid = Number(id);
    const L = typeof getLessonMvp === "function" ? getLessonMvp(lid) : null;
    const title = L?.lessonTitleJa || L?.headline || L?.titleJa || "";
    return title ? `第${lid}課 ${title}` : `第${lid}課`;
  }

  function unitLabel(id) {
    const uid = Number(id);
    const u = typeof CURRICULUM_UNITS !== "undefined" ? CURRICULUM_UNITS.find((x) => x.id === uid) : null;
    if (!u) return `第${uid}单元`;
    if (typeof curriculumUnitTitleParts === "function") {
      const p = curriculumUnitTitleParts(u);
      const mid = p.themeJa ? ` · ${p.themeJa}` : "";
      return `${p.labelZh}${mid}${p.titleZh ? ` · ${p.titleZh}` : ""}`;
    }
    return `${u.titleJa} · ${u.titleZh}`;
  }

  function scopeTitle(scope) {
    if (!scope || scope.type === "book") return "全册自学笔记";
    if (scope.type === "unit") return unitLabel(scope.id);
    return lessonLabel(scope.id);
  }

  /** 只读聚合：全册预览 */
  function buildBookAggregate(state) {
    ensure(state);
    const lines = [];
    if (state.notes.bookExtra.trim()) {
      lines.push("【全册总记】", state.notes.bookExtra.trim(), "");
    }
    if (typeof CURRICULUM_UNITS !== "undefined") {
      CURRICULUM_UNITS.forEach((u) => {
        const ut = state.notes.unit[String(u.id)]?.trim();
        if (ut) {
          const head =
            typeof curriculumUnitTitleParts === "function"
              ? (() => {
                  const p = curriculumUnitTitleParts(u);
                  return `【${p.labelZh}${p.themeJa ? ` ${p.themeJa}` : ""}${p.titleZh ? ` ${p.titleZh}` : ""}】`;
                })()
              : `【${u.titleJa} ${u.titleZh}】`;
          lines.push(head, ut, "");
        }
        u.lessonIds.forEach((lid) => {
          const lt = state.notes.lesson[String(lid)]?.trim();
          if (!lt) return;
          lines.push(`【${lessonLabel(lid)}】`, lt, "");
        });
      });
    } else {
      Object.keys(state.notes.lesson)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((lid) => {
          const lt = state.notes.lesson[lid]?.trim();
          if (!lt) return;
          lines.push(`【${lessonLabel(lid)}】`, lt, "");
        });
    }
    return lines.join("\n").trim() || "（尚未写入笔记，可在下方选择课次或单元开始记录）";
  }

  return {
    ensure,
    scopeKey,
    getText,
    setText,
    hasText,
    scopeTitle,
    lessonLabel,
    unitLabel,
    buildBookAggregate,
  };
})();
