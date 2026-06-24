/**
 * 笔记板块 · 规范 19（分色块 + 默认折叠，控首屏高度）
 */
const NotesPanel = (() => {
  let boundRoot = null;
  let boundState = null;
  let boundCallbacks = {};

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  /** 关联/学霸文案 · 按知识类别分色（全笔记统一规则） */
  const KNOWLEDGE_HL_RULES = [
    { cls: "notes-hl-lesson", re: /第\s*\d+\s*课/g },
    {
      cls: "notes-hl-place",
      re: /これ・それ・あれ|この・その・あの|ここ・そこ・あそこ|あちら|こちら|场所指示/g,
    },
    {
      cls: "notes-hl-pos",
      re: /「[^」]{1,16}」|名词句|指示代词|助词|词性|名词|代词|所属|連体/g,
    },
    {
      cls: "notes-hl-conj",
      re: /活用|变形|转性|否定形|肯定|否定|过去形|过去|ません|ですか|动词|形容词|イ形容|ナ形容|普通体|ます形/g,
    },
    { cls: "notes-hl-pattern", re: /句型|表达|结合|掌握|存在句|敬体/g },
    { cls: "notes-hl-special", re: /敬语|读作|读「|特殊|注意|は读|寒暄/g },
  ];

  function highlightKnowledgeText(raw) {
    let parts = [{ text: escapeHtml(String(raw || "")), hl: false }];
    KNOWLEDGE_HL_RULES.forEach(({ cls, re }) => {
      const next = [];
      parts.forEach((part) => {
        if (part.hl) {
          next.push(part);
          return;
        }
        const str = part.text;
        let last = 0;
        const reLocal = new RegExp(re.source, re.flags);
        let m;
        while ((m = reLocal.exec(str)) !== null) {
          if (m.index > last) next.push({ text: str.slice(last, m.index), hl: false });
          next.push({ text: m[0], hl: true, cls });
          last = m.index + m[0].length;
        }
        if (last === 0) next.push(part);
        else if (last < str.length) next.push({ text: str.slice(last), hl: false });
      });
      if (next.length) parts = next;
    });
    return parts
      .map((p) => (p.hl ? `<span class="notes-hl ${p.cls}">${p.text}</span>` : p.text))
      .join("");
  }

  /** 关联条 · 倒空心三角 + 顶横线（可点开） */
  function tapOpenMarkHtml() {
    return `<span class="notes-tap-open" aria-hidden="true" title="可点开">
      <svg class="notes-tap-open-svg" viewBox="0 0 10 10" width="9" height="9" focusable="false">
        <line x1="1" y1="1.2" x2="9" y2="1.2" stroke="currentColor" stroke-width="1"/>
        <path d="M2 2.2 L8 2.2 L5 8.2 Z" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
      </svg>
    </span>`;
  }

  function linksTapLegendHtml() {
    return `<p class="notes-links-tap-legend zh-annotation">${tapOpenMarkHtml()}<span>可点开关联卡片</span></p>`;
  }

  function knowledgeLegendHtml() {
    return `<p class="notes-hl-legend zh-annotation" aria-hidden="false">
      <span class="notes-hl notes-hl-lesson">课次</span>
      <span class="notes-hl notes-hl-pattern">句型</span>
      <span class="notes-hl notes-hl-pos">词性</span>
      <span class="notes-hl notes-hl-conj">活用</span>
      <span class="notes-hl notes-hl-place">指示</span>
      <span class="notes-hl notes-hl-special">特殊</span>
      <span class="notes-hl-legend-note">（加粗=重点）</span>
    </p>`;
  }

  function showZh(state) {
    return state?.showChineseZh !== false;
  }

  function lessonIds() {
    if (typeof CURRICULUM_RELEASED_IDS !== "undefined") {
      return [...CURRICULUM_RELEASED_IDS].sort((a, b) => a - b);
    }
    if (typeof LESSONS_MVP !== "undefined") {
      return LESSONS_MVP.map((l) => l.lessonId).sort((a, b) => a - b);
    }
    return [];
  }

  function getLesson(id) {
    return typeof getLessonMvp === "function" ? getLessonMvp(id) : null;
  }

  function lessonSummaryTitle(L, id) {
    const jp = L?.lessonTitle || L?.headline || L?.titleJa || "";
    return `第${id}課 · ${jp}`;
  }

  /** 与课文目录 · CURRICULUM_STAGE_THEMES 一致（赤橙黄绿青蓝紫） */
  function unitMetaForLesson(lessonId) {
    const unitId =
      typeof getUnitIdForLesson === "function" ? getUnitIdForLesson(lessonId) : 1;
    const theme =
      typeof getStageThemeForLesson === "function"
        ? getStageThemeForLesson(lessonId)
        : { accent: "#bdbdbd", pageBg: "#fff", border: "#e0e0e0", primaryDark: "#757575" };
    const labelZh =
      typeof curriculumUnitLabelZh === "function"
        ? curriculumUnitLabelZh(unitId)
        : `第${unitId}单元`;
    return { unitId, labelZh, theme };
  }

  function unitThemeStyleAttr(theme) {
    if (!theme) return "";
    return `style="--stage-accent:${theme.accent};--notes-unit-bg:${theme.pageBg};--notes-unit-border:${theme.border};--notes-unit-dark:${theme.primaryDark || theme.accent}"`;
  }

  function hasUserNote(state, lessonId) {
    if (typeof LearningNotes !== "undefined") {
      return LearningNotes.hasText(state, { type: "lesson", id: lessonId });
    }
    return false;
  }

  const SUMMARY_KEY_MAP = {
    pronunciation: { title: "发音", short: "音", cls: "me-kp-音" },
    etymology: { title: "语源", short: "源", cls: "me-kp-源" },
    preview: { title: "活用预告", short: "予", cls: "me-kp-予" },
    honorific: { title: "敬语", short: "敬", cls: "me-kp-敬" },
  };

  const TEACHER_EXTRA = [
    { id: "dialogue", title: "会话要点", short: "話", cls: "me-kp-話" },
    { id: "matome", title: "本课总结", short: "総", cls: "me-kp-総" },
    { id: "template", title: "表达模板", short: "模", cls: "me-kp-模" },
    { id: "unitQuiz", title: "单元测试予告", short: "試", cls: "me-kp-試" },
    { id: "mistakes", title: "常见错误", short: "誤", cls: "me-kp-誤" },
  ];

  const LONG_REF_TABLE_MIN = 18;
  const LONG_REF_LESSON_IDS = new Set([5, 13, 14]);

  function stripReviewMarkers(s) {
    return String(s || "")
      .replace(/【[^】]+】\s*/g, "")
      .trim();
  }

  function mistakeDedupeKey(s) {
    const t = stripReviewMarkers(s);
    const m = t.match(/×\s*(.+?)\s*○\s*(.+)/);
    if (m) return `×${m[1]}○${m[2]}`.replace(/\s+/g, "");
    return t.replace(/\s+/g, "");
  }

  /** 误用行：拆多行、去重；Top20 与 ×○ 重复时保留一条 */
  function normalizeMistakeLines(lines) {
    const flat = [];
    (lines || []).forEach((line) => {
      String(line)
        .split(/\n/)
        .forEach((part) => {
          const t = part.trim();
          if (t) flat.push(t);
        });
    });
    const seen = new Set();
    const out = [];
    flat.forEach((t) => {
      const k = mistakeDedupeKey(t);
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push(t);
    });
    return out;
  }

  /** @returns {Record<string, {meta, lines: string[]}>} */
  function collectTeacherGroups(L) {
    const groups = {};
    function push(key, meta, line) {
      const t = String(line || "").trim();
      if (!t || /^表达\t/.test(t)) return;
      if (!groups[key]) groups[key] = { meta, lines: [] };
      groups[key].lines.push(t);
    }
    (L?.summaryBlocks || []).forEach((block) => {
      const meta = SUMMARY_KEY_MAP[block.key] || { title: "补充", short: "补", cls: "me-kp-補" };
      (block.lines || []).forEach((line) => push(block.key, meta, line));
    });
    (L?.dialogueKeyPoints || []).forEach((line) => {
      push("dialogue", TEACHER_EXTRA[0], line);
    });
    (L?.reviewExtension || []).forEach((sec) => {
      const title = sec.title || "";
      if (/模板/.test(title)) {
        (sec.lines || []).forEach((line) => push("template", TEACHER_EXTRA[2], line));
        return;
      }
      if (/これまでのまとめ/.test(title)) {
        (sec.lines || []).forEach((line) => {
          const t = String(line || "").trim();
          if (!t || /^第\s*\d+\s*课[：:]/.test(t)) return;
          push("matome", TEACHER_EXTRA[1], t);
        });
        return;
      }
      if (/单元测试予告/.test(title)) {
        (sec.lines || []).forEach((line) => push("unitQuiz", TEACHER_EXTRA[3], line));
        return;
      }
      if (!/よくある誤り|常见误/.test(title)) return;
      normalizeMistakeLines(sec.lines || []).forEach((line) => push("mistakes", TEACHER_EXTRA[4], line));
    });
    return groups;
  }

  function subFoldHtml(lessonId, dim, subKey, title, count, innerHtml, extraCls) {
    if (!count) return "";
    const uid = `n${lessonId}-${dim}-${subKey}`;
    const bodyId = `${uid}-body`;
    return `<div class="notes-sub notes-sub--fold ${extraCls || ""}" data-notes-sub="${uid}">
      <button type="button" class="notes-sub-summary" aria-expanded="false" aria-controls="${bodyId}">
        <span class="notes-sub-chevron" aria-hidden="true"></span>
        <span class="notes-sub-title">${escapeHtml(title)}</span>
        <span class="notes-sub-count">${count}条</span>
      </button>
      <div class="notes-sub-body" id="${bodyId}" hidden>${innerHtml}</div>
    </div>`;
  }

  function dimFoldHtml(lessonId, dim, icon, label, count, innerHtml, openMine, countLabelText) {
    const countLabel = count
      ? `<span class="notes-dim-count">${escapeHtml(countLabelText || `${count}条`)}</span>`
      : "";
    const openAttr = openMine ? " open" : "";
    return `<details class="notes-dim notes-dim--${dim}" data-notes-dim="${dim}" data-lesson-dim="${lessonId}-${dim}"${openAttr}>
      <summary class="notes-dim-summary">
        <span class="notes-dim-chevron" aria-hidden="true"></span>
        <span class="notes-dim-icon" aria-hidden="true">${icon}</span>
        <span class="notes-dim-label">${escapeHtml(label)}</span>
        ${countLabel}
      </summary>
      <div class="notes-dim-panel">${innerHtml || `<p class="notes-empty zh-annotation">（暂无）</p>`}</div>
    </details>`;
  }

  function grammarLinksHtml(node) {
    const links = (node?.links || []).filter((l) => l && (l.label || l.href));
    if (!links.length) return "";
    const items = links
      .map((l) => {
        const label = escapeHtml(l.label || l.href || "");
        if (l.href) {
          return `<li><a class="notes-tb-link" href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
        }
        return `<li><span class="notes-tb-link notes-tb-link--text">${label}</span></li>`;
      })
      .join("");
    return `<ul class="notes-tb-links zh-annotation" aria-label="教材对照与关联">${items}</ul>`;
  }

  function textbookDimHtml(L, lessonId) {
    const nodes = L?.grammarNodes || [];
    if (!nodes.length) return { count: 0, html: "" };
    const subs = nodes
      .map((n, i) => {
        const label = n.titleZh || n.title || "语法点";
        const bodyZh = (n.explanationZh || "").trim();
        const bodyJp = (n.explanation || "").trim();
        const links = grammarLinksHtml(n);
        const linkCount = (n.links || []).filter((l) => l && (l.label || l.href)).length;
        let bodyHtml = "";
        if (bodyZh) {
          bodyHtml += `<div class="notes-tb-bubble notes-tb-bubble--zh zh-annotation">${highlightKnowledgeText(bodyZh)}</div>`;
          if (bodyJp && bodyJp !== bodyZh) {
            bodyHtml += `<p class="notes-tb-ja jp">${escapeHtml(bodyJp)}</p>`;
          }
        } else if (bodyJp) {
          bodyHtml += `<div class="notes-tb-bubble zh-annotation">${highlightKnowledgeText(bodyJp)}</div>`;
        } else {
          bodyHtml = `<p class="notes-empty zh-annotation">（无中文说明）</p>`;
        }
        const inner = `${bodyHtml}${links}`;
        const itemCount = (bodyZh || bodyJp ? 1 : 0) + linkCount;
        return subFoldHtml(
          lessonId,
          "tb",
          `g${i}`,
          label,
          itemCount || 1,
          inner,
          "notes-sub--textbook notes-sub--teacher-like"
        );
      })
      .join("");
    return { count: nodes.length, html: `<div class="notes-dim-subs">${subs}</div>` };
  }

  function scholarBubbleHtml(kind, text) {
    return `<div class="notes-scholar-bubble notes-scholar-bubble--${kind} zh-annotation">${highlightKnowledgeText(text)}</div>`;
  }

  function teacherDimHtml(L, lessonId) {
    const groups = collectTeacherGroups(L);
    const keys = [
      "pronunciation",
      "etymology",
      "preview",
      "honorific",
      "dialogue",
      "matome",
      "template",
      "unitQuiz",
      "mistakes",
    ];
    let total = 0;
    const subs = keys
      .map((key) => {
        const g = groups[key];
        if (!g || !g.lines.length) return "";
        total += g.lines.length;
        const inner = g.lines
          .map(
            (text) => `<div class="notes-kp-row">
              <span class="me-kp-badge ${g.meta.cls}">${g.meta.short}</span>
              <p class="notes-kp-text">${escapeHtml(text)}</p>
            </div>`
          )
          .join("");
        return subFoldHtml(
          lessonId,
          "tc",
          key,
          g.meta.title,
          g.lines.length,
          inner,
          `notes-sub--teacher notes-sub--${key}`
        );
      })
      .join("");
    return { count: total, html: subs ? `<div class="notes-dim-subs">${subs}</div>` : "" };
  }

  function isLongRefTable(lessonId, refLines) {
    return refLines.length >= LONG_REF_TABLE_MIN || LONG_REF_LESSON_IDS.has(Number(lessonId));
  }

  function refTableFoldHtml(lessonId, refLines) {
    const body = refLines
      .map((t) => `<div class="notes-ref-table-line zh-annotation">${escapeHtml(t)}</div>`)
      .join("");
    return subFoldHtml(
      lessonId,
      "sc",
      "ref-long",
      "参考长表",
      refLines.length,
      body,
      "notes-sub--scholar-fold notes-sub--ref-long"
    );
  }

  function scholarDimHtml(L, lessonId) {
    const coreLines = [];
    const refLines = [];
    const errLines = [];
    const nodes = L?.grammarNodes || [];
    if (nodes.length) {
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const firstZh = (first.explanationZh || first.titleZh || "").replace(/\s+/g, " ").trim();
      const firstJp = (first.explanation || first.title || "").replace(/\s+/g, " ").trim();
      if (firstZh) {
        coreLines.push({ kind: "core", text: `${first.titleZh || first.title || ""} — ${firstZh}` });
        if (firstJp && firstJp !== firstZh) {
          coreLines.push({ kind: "ref", text: `日语句型：${firstJp}` });
        }
      } else if (firstJp) {
        coreLines.push({ kind: "core", text: `${first.title || ""} — ${firstJp}` });
      }
      const lastZh = (last.explanationZh || "").trim();
      if (lastZh) {
        const head = last.titleZh || last.title || "";
        coreLines.push({
          kind: "one",
          text: head ? `${head} — ${lastZh.split("\n")[0]}` : lastZh.split("\n")[0],
        });
      }
    }
    (L?.reviewExtension || []).forEach((sec) => {
      if (!/参考表/.test(sec.title || "")) return;
      sec.lines.forEach((line) => {
        const t = String(line || "").trim();
        if (t && !/^[\d.]+\s/.test(t)) refLines.push(t);
      });
    });
    const errSec = (L?.reviewExtension || []).find((s) => /よくある誤り|常见误/.test(s.title || ""));
    if (errSec) {
      normalizeMistakeLines(errSec.lines || []).forEach((t) => {
        if (
          t.startsWith("×") ||
          t.startsWith("○") ||
          /^易错|注意|【/.test(t) ||
          /×.+○/.test(t)
        ) {
          errLines.push(t);
        }
      });
    }

    const parts = [];
    let blockCount = 0;

    if (coreLines.length) {
      blockCount += 1;
      parts.push(`<section class="notes-scholar-block notes-scholar-block--core">
        <h5 class="notes-scholar-block-title">核心句型 · 一句话</h5>
        <div class="notes-scholar-bubbles">
          ${coreLines.map((row) => scholarBubbleHtml(row.kind, row.text)).join("")}
        </div>
      </section>`);
    }

    if (refLines.length) {
      blockCount += 1;
      if (isLongRefTable(lessonId, refLines)) {
        parts.push(refTableFoldHtml(lessonId, refLines));
      } else {
        const inner = refLines.map((t) => scholarBubbleHtml("ref", t)).join("");
        parts.push(
          subFoldHtml(lessonId, "sc", "ref", "参考对照", refLines.length, inner, "notes-sub--scholar-fold")
        );
      }
    }

    if (errLines.length) {
      blockCount += 1;
      const inner = errLines.map((t) => scholarBubbleHtml("err", t)).join("");
      parts.push(
        subFoldHtml(lessonId, "sc", "err", "易错提醒", errLines.length, inner, "notes-sub--scholar-fold")
      );
    }

    if (!parts.length) return { count: 0, html: "" };
    return {
      count: blockCount,
      html: `<div class="notes-scholar-doc">${parts.join("")}</div>`,
      countLabel: `${blockCount}块`,
    };
  }

  /** 易错类型 · 色标 + 字（与笔记内提词色系协调） */
  const WEAK_CAT = {
    lang: { id: "lang", label: "语言", short: "语", cls: "notes-weak-cat--lang" },
    write: { id: "write", label: "书写", short: "写", cls: "notes-weak-cat--write" },
    verb: { id: "verb", label: "动词", short: "动", cls: "notes-weak-cat--verb" },
    grammar: { id: "grammar", label: "语法", short: "法", cls: "notes-weak-cat--grammar" },
    mix: { id: "mix", label: "易混", short: "混", cls: "notes-weak-cat--mix" },
  };

  function classifyWeakCategory(key, title, samples) {
    const id = String(key || "");
    const blob = [
      id,
      title,
      ...(samples || []).map((m) => `${m.question || ""} ${m.explanation || ""} ${m.userAnswer || ""}`),
    ]
      .join(" ")
      .toLowerCase();
    if (/_v_|^l\d+_v|単語|单词|发音|読み|假名|会話|dlg|dialogue|片假|平假|は读|読音/.test(blob) || /_v_/.test(id)) {
      return WEAK_CAT.lang;
    }
    if (/动词|活用|ます形|ない形|た形|て形|辞書|一类|二类|三类|自他|可能形|被动|使役|い形容词|な形容词/.test(blob)) {
      return WEAK_CAT.verb;
    }
    if (/书写|汉字|笔顺|空格|标点|写错|字形|kanji/.test(blob)) {
      return WEAK_CAT.write;
    }
    if (/易混|混淆|区别|歧义|不要和|×|相反|搞错/.test(blob)) {
      return WEAK_CAT.mix;
    }
    if (/^l\d+_g|语法|句型|助词|です|ません|ですか/.test(blob) || /_g\d/.test(id)) {
      return WEAK_CAT.grammar;
    }
    return WEAK_CAT.grammar;
  }

  function weakStarLevel(count) {
    const n = Number(count) || 0;
    if (n >= 4) return { filled: 3, hint: "须加强 · 错4次及以上" };
    if (n >= 2) return { filled: 2, hint: "多练 · 错2–3次" };
    return { filled: 1, hint: "留意 · 错1次" };
  }

  function weakStarsHtml(filled) {
    const f = Math.min(3, Math.max(0, filled));
    return `<span class="notes-weak-stars" aria-label="${f}星">${"★".repeat(f)}${"☆".repeat(3 - f)}</span>`;
  }

  function pickLatestMistakeSample(samples) {
    if (!samples?.length) return null;
    return [...samples].sort(
      (a, b) => new Date(b.wrongAt || 0).getTime() - new Date(a.wrongAt || 0).getTime()
    )[0];
  }

  function weakCompareHtml(samples) {
    const s = pickLatestMistakeSample(samples);
    if (!s) return "";
    const wrong = String(s.userAnswer || "").trim();
    const right = String(s.correctAnswer || "").trim();
    const expl = String(s.explanation || "").trim();
    if (!wrong && !right) {
      return expl
        ? `<p class="notes-weak-compare-hint zh-annotation">${escapeHtml(expl)}</p>`
        : "";
    }
    const rows = [];
    if (right) {
      rows.push(`<div class="notes-weak-compare-row notes-weak-compare-row--correct">
        <span class="notes-weak-compare-label">○ 正解</span>
        <span class="notes-weak-compare-val">${escapeHtml(right)}</span>
      </div>`);
    }
    if (wrong) {
      rows.push(`<div class="notes-weak-compare-row notes-weak-compare-row--mistake">
        <span class="notes-weak-compare-label">× 曾错</span>
        <span class="notes-weak-compare-val">${escapeHtml(wrong)}</span>
      </div>`);
    }
    const q = String(s.question || "").trim();
    const qLine = q && q.length <= 48 ? `<p class="notes-weak-q zh-annotation">${escapeHtml(q)}</p>` : "";
    const explLine =
      expl && wrong && right
        ? `<p class="notes-weak-compare-expl zh-annotation">${escapeHtml(expl)}</p>`
        : "";
    return `<div class="notes-weak-compare">${qLine}${rows.join("")}${explLine}</div>`;
  }

  function collectLessonWeakPoints(state, lessonId) {
    const byKey = {};
    (state.mistakes || [])
      .filter((m) => Number(m.lessonId) === Number(lessonId))
      .forEach((m) => {
        const key = m.grammarNodeId || m.questionId || String(m.question || "").slice(0, 40) || "错题";
        if (!byKey[key]) byKey[key] = { key, count: 0, samples: [] };
        byKey[key].count += 1;
        byKey[key].samples.push(m);
      });
    return Object.values(byKey).map((row) => {
      let title = row.key;
      if (typeof findNodeAcrossLessons === "function") {
        const found = findNodeAcrossLessons(row.key);
        if (found?.node?.title) title = found.node.title;
      }
      if (title === row.key && row.samples[0]?.question) {
        title = String(row.samples[0].question).slice(0, 28);
      }
      const category = classifyWeakCategory(row.key, title, row.samples);
      const star = weakStarLevel(row.count);
      return { ...row, title, category, star };
    });
  }

  function unitWeakSummary(state, unitId) {
    const uid = Number(unitId);
    const unit =
      typeof CURRICULUM_UNITS !== "undefined" ? CURRICULUM_UNITS.find((u) => u.id === uid) : null;
    if (!unit) return { totalPlaces: 0, lessonHits: [] };
    const lessonHits = [];
    let totalPlaces = 0;
    (unit.lessonIds || []).forEach((lid) => {
      const pts = collectLessonWeakPoints(state, lid);
      if (!pts.length) return;
      totalPlaces += pts.length;
      lessonHits.push({ lessonId: lid, places: pts.length });
    });
    return { totalPlaces, lessonHits };
  }

  function lessonWeakMarkersHtml(state, lessonId) {
    const pts = collectLessonWeakPoints(state, lessonId);
    if (!pts.length) return "";
    const seen = new Set();
    const badges = [];
    pts.forEach((p) => {
      if (seen.has(p.category.id)) return;
      seen.add(p.category.id);
      const c = p.category;
      badges.push(
        `<span class="notes-weak-cat-badge ${c.cls}" title="${escapeHtml(c.label)}">${c.short}</span>`
      );
    });
    return `<span class="notes-lesson-weak-markers" aria-label="本课易错类型">${badges.join("")}</span>`;
  }

  function notesGuideHtml() {
    const dimLegend = `
      <span class="notes-guide-chip notes-guide-chip--tb">课本</span>
      <span class="notes-guide-chip notes-guide-chip--tc">老师</span>
      <span class="notes-guide-chip notes-guide-chip--sc">学霸</span>
      <span class="notes-guide-chip notes-guide-chip--lk">关联</span>
      <span class="notes-guide-chip notes-guide-chip--mine">我的笔记</span>`;
    const weakCats = Object.values(WEAK_CAT)
      .map(
        (c) =>
          `<span class="notes-weak-legend-chip"><span class="notes-weak-cat-badge ${c.cls}">${c.short}</span>${escapeHtml(c.label)}</span>`
      )
      .join("");
    return `<details class="notes-guide" id="notes-guide">
      <summary class="notes-guide-summary">
        <span class="notes-guide-chevron" aria-hidden="true"></span>
        <span class="notes-guide-summary-text">📋 笔记怎么用 · 颜色是什么意思</span>
      </summary>
      <div class="notes-guide-body zh-annotation">
        <p class="notes-guide-lead"><strong>怎么用：</strong>先认<strong>单元色条</strong>（与课文目录一致）→ 点开某一课 → 再点课内色块查看；同时只展开一个单元/一块，减少长页滚动。</p>
        <p><strong>单元左边线色</strong>＝第1–6单元（赤橙黄绿青紫），与首页一致；标题行可看本单元<strong>有几处易错、分布在几课</strong>。</p>
        <p><strong>课内五色块：</strong>${dimLegend}（点块展开；课本/老师可再点子项。）</p>
        <p><strong>易错知识点</strong>（仅本课测验做错才出现，不是整课都薄弱）：</p>
        <div class="notes-weak-legend-cats notes-guide-weak-cats">${weakCats}</div>
        <p class="notes-weak-legend-stars"><span class="notes-weak-stars notes-weak-stars--demo">★★★</span>错≥4次须加强 · <span class="notes-weak-stars notes-weak-stars--demo">★★☆</span>2–3次多练 · <span class="notes-weak-stars notes-weak-stars--demo">★☆☆</span>错1次留意</p>
        <p>每条易错对照：<strong>上红大字=正解</strong>（加深正确印象）· <strong>下蓝小字=曾错选项</strong>（仅作对照，不必死记）。</p>
        <p class="notes-guide-foot">课名旁小标签：课本/老师/学霸数量；<strong>易错N处</strong>＝本课有几处需加强；色点＝薄弱类型一览。<strong>关联</strong>连接符下 ${tapOpenMarkHtml()} 表示可点开。</p>
      </div>
    </details>`;
  }

  function weakDimHtml(state, lessonId) {
    const all = collectLessonWeakPoints(state, lessonId);
    if (!all.length) {
      return { count: 0, html: "", countLabel: "" };
    }
    const totalPlaces = all.length;
    const ranked = [...all].sort((a, b) => b.count - a.count).slice(0, 3);
    const intro = `<p class="notes-weak-intro-brief zh-annotation">本课 <strong>${totalPlaces} 处</strong>易错 · 先看<strong>红色正解</strong>，下方蓝字为曾错选项。</p>`;
    const ranks = ["①", "②", "③"];
    const list = `<ul class="notes-weak-list">${ranked
      .map((row, i) => {
        const c = row.category;
        const compare = weakCompareHtml(row.samples);
        return `<li class="notes-weak-item ${c.cls}" data-weak-cat="${c.id}">
          <div class="notes-weak-item-head">
            <span class="notes-weak-cat-badge ${c.cls}" title="${escapeHtml(c.label)}">${c.short}</span>
            ${weakStarsHtml(row.star.filled)}
            <span class="notes-weak-rank">${ranks[i] || i + 1}</span>
            <span class="notes-weak-title">${escapeHtml(row.title)}</span>
            <span class="notes-weak-count" title="${escapeHtml(row.star.hint)}">错 ${row.count} 次</span>
          </div>
          ${compare}
        </li>`;
      })
      .join("")}</ul>`;
    return {
      count: ranked.length,
      totalPlaces,
      html: `${intro}${list}`,
      countLabel: `${totalPlaces}处`,
    };
  }

  function parseCrossLinks(L, fromLessonId) {
    const links = [];
    const seen = new Set();

    function pushLink(targetId, desc) {
      const tid = Number(targetId);
      const d = String(desc || "").trim();
      if (!tid || !d || tid === Number(fromLessonId)) return;
      const key = `${tid}|${d}`;
      if (seen.has(key)) return;
      seen.add(key);
      links.push({ targetId: tid, desc: d });
    }

    const matome = (L?.reviewExtension || []).find((s) => /これまでのまとめ/.test(s.title || ""));
    if (matome) {
      (matome.lines || []).forEach((line) => {
        const t = String(line || "").trim();
        const m = t.match(/第\s*(\d+)\s*课[：:]\s*(.+)/);
        if (m) pushLink(m[1], m[2].trim());
      });
    }

    const cur = Number(fromLessonId);
    const g = typeof KNOWLEDGE_GRAPH !== "undefined" ? KNOWLEDGE_GRAPH : null;
    if (g?.concepts && cur) {
      Object.values(g.concepts).forEach((concept) => {
        const refs = concept?.refs || [];
        if (!refs.some((r) => Number(r.lessonId) === cur)) return;
        refs.forEach((ref) => {
          const tid = Number(ref.lessonId);
          if (!tid || tid === cur) return;
          const label = (concept.label || "").trim();
          const refLabel = (ref.label || "").trim();
          const desc = refLabel ? `${label} ↔ ${refLabel}` : label;
          pushLink(tid, desc);
        });
      });
    }

    links.sort((a, b) => a.targetId - b.targetId || a.desc.localeCompare(b.desc, "zh"));
    return links;
  }

  function linkChipHtml(fromLessonId, lnk) {
    const targetId = lnk.targetId;
    const aria = `打开第${fromLessonId}课与第${targetId}课关联知识卡片`;
    return `<button type="button" class="notes-link-chip" data-from-lesson="${fromLessonId}" data-target-lesson="${targetId}" aria-label="${escapeHtml(aria)}">
      <span class="notes-link-chip-main">
        <span class="notes-link-badge">第${fromLessonId}課 ↔ 第${targetId}課${tapOpenMarkHtml()}</span>
        <span class="notes-link-text zh-annotation">${highlightKnowledgeText(lnk.desc)}</span>
      </span>
    </button>`;
  }

  function linksDimHtml(L, fromLessonId) {
    const links = parseCrossLinks(L, fromLessonId);
    if (!links.length) return { count: 0, html: "" };
    const inner = `${links.map((lnk) => linkChipHtml(fromLessonId, lnk)).join("")}${linksTapLegendHtml()}${knowledgeLegendHtml()}`;
    return { count: links.length, html: `<div class="notes-link-list">${inner}</div>` };
  }

  function mineDimHtml(state, lessonId) {
    const val =
      typeof LearningNotes !== "undefined"
        ? LearningNotes.getText(state, { type: "lesson", id: lessonId })
        : "";
    const has = !!String(val || "").trim();
    const inner = `<textarea class="notes-mine-editor" data-note-lesson-id="${lessonId}" rows="3" placeholder="要点、疑问…（失焦保存）">${escapeHtml(val)}</textarea>`;
    return { count: has ? 1 : 0, html: inner, open: false };
  }

  function lessonPreviewChips(L, state, lessonId) {
    const tb = (L?.grammarNodes || []).length;
    const tc = Object.values(collectTeacherGroups(L)).reduce((n, g) => n + g.lines.length, 0);
    const sc = scholarDimHtml(L, lessonId).count;
    const wkMeta = weakDimHtml(state, lessonId);
    const parts = [];
    if (tb) parts.push(`<span class="notes-preview-chip notes-preview-chip--tb">课本${tb}</span>`);
    if (tc) parts.push(`<span class="notes-preview-chip notes-preview-chip--tc">老师${tc}</span>`);
    if (sc) parts.push(`<span class="notes-preview-chip notes-preview-chip--sc">学霸${sc}块</span>`);
    if (wkMeta.count) {
      parts.push(
        `<span class="notes-preview-chip notes-preview-chip--wk">易错${wkMeta.totalPlaces || wkMeta.count}处</span>`
      );
    }
    return parts.length ? `<span class="notes-lesson-preview">${parts.join("")}</span>` : "";
  }

  function lessonBodyHtml(L, lessonId, state) {
    if (!L) {
      return `<p class="notes-empty zh-annotation">（本课数据準備中）</p>`;
    }
    const tb = textbookDimHtml(L, lessonId);
    const tc = teacherDimHtml(L, lessonId);
    const sc = scholarDimHtml(L, lessonId);
    const wk = weakDimHtml(state, lessonId);
    const lk = linksDimHtml(L, lessonId);
    const mine = mineDimHtml(state, lessonId);

    const dims = [
      dimFoldHtml(lessonId, "textbook", "📖", "课本知识", tb.count, tb.html),
      dimFoldHtml(lessonId, "teacher", "👨‍🏫", "老师补充", tc.count, tc.html),
      dimFoldHtml(lessonId, "scholar", "🧠", "学霸笔记", sc.count, sc.html, false, sc.countLabel),
      wk.count
        ? dimFoldHtml(lessonId, "weak", "🎯", "易错知识点", wk.count, wk.html, false, wk.countLabel)
        : "",
      lk.count ? dimFoldHtml(lessonId, "links", "🔗", "关联知识", lk.count, lk.html) : "",
      dimFoldHtml(lessonId, "mine", "✏️", "我的笔记", mine.count, mine.html, mine.open),
    ]
      .filter(Boolean)
      .join("");

    return `<div class="notes-lesson-body">
      <div class="notes-dim-stack">${dims}</div>
      <button type="button" class="btn secondary notes-go-lesson" data-go-lesson="${lessonId}" aria-label="去学第${lessonId}课">去学本课 →</button>
    </div>`;
  }

  /** 易错分类角标放进标题列，避免 grid 多占一行把折叠条撑高 */
  function notesRowInnerWithWeak(rowInner, weakMark) {
    if (!weakMark || !rowInner) return rowInner || "";
    if (rowInner.includes("lesson-row-body")) {
      return rowInner.replace(
        /<span class="lesson-row-body">([\s\S]*?)<\/span>/,
        `<span class="lesson-row-body">$1<span class="notes-lesson-weak-inline">${weakMark}</span></span>`
      );
    }
    return `${rowInner}<span class="notes-lesson-weak-inline">${weakMark}</span>`;
  }

  function lessonCardHtml(lessonId, state) {
    const L = getLesson(lessonId);
    const unit = unitMetaForLesson(lessonId);
    const dot = hasUserNote(state, lessonId)
      ? `<span class="notes-lesson-dot" title="已有笔记" aria-label="已有笔记">●</span>`
      : "";
    const wkPlaces = collectLessonWeakPoints(state, lessonId).length;
    const weakMark = lessonWeakMarkersHtml(state, lessonId);
    const weakCls = wkPlaces ? " notes-lesson-card--has-weak" : "";
    const rowOpts = { unitId: unit.unitId };
    let rowInner =
      L && typeof curriculumLessonRowInnerHtml === "function"
        ? curriculumLessonRowInnerHtml(L, state, rowOpts)
        : `<span class="notes-lesson-title jp">${escapeHtml(lessonSummaryTitle(L, lessonId))}</span>`;
    rowInner = notesRowInnerWithWeak(rowInner, weakMark);
    const rowCls =
      L && typeof curriculumLessonRowClass === "function"
        ? `${curriculumLessonRowClass(L, state, rowOpts)} lesson-row--notes-summary`
        : "lesson-row lesson-row--notes-summary";
    return `<details class="notes-lesson-card notes-lesson-card--u${unit.unitId}${weakCls}" data-lesson-id="${lessonId}" data-unit-id="${unit.unitId}" data-weak-places="${wkPlaces}" ${unitThemeStyleAttr(unit.theme)}>
      <summary class="notes-lesson-summary notes-lesson-summary--symbol">
        <span class="notes-lesson-chevron" aria-hidden="true"></span>
        <div class="lesson-row ${rowCls} lesson-row--notes-summary" aria-hidden="true">${rowInner}</div>
        ${dot}
      </summary>
      ${lessonBodyHtml(L, lessonId, state)}
    </details>`;
  }

  function renderLessonAccordion(state) {
    const ids = lessonIds();
    let lastUnit = 0;
    const parts = [];
    ids.forEach((id) => {
      const { unitId, labelZh, theme } = unitMetaForLesson(id);
      if (unitId !== lastUnit) {
        lastUnit = unitId;
        const uwk = unitWeakSummary(state, unitId);
        const weakPill = uwk.totalPlaces
          ? `<span class="notes-unit-weak-pill" title="本单元测验易错合计">易错 ${uwk.totalPlaces} 处 · ${uwk.lessonHits.length} 课</span>`
          : `<span class="notes-unit-weak-pill notes-unit-weak-pill--none">本单元暂无易错记录</span>`;
        const stacked =
          typeof curriculumUnitStackedTitleHtml === "function"
            ? curriculumUnitStackedTitleHtml(unitId)
            : `<span class="notes-unit-head-label">${escapeHtml(labelZh)}</span>`;
        const unitStars =
          typeof curriculumUnitProgressStarsHtml === "function"
            ? curriculumUnitProgressStarsHtml(state, unitId)
            : "";
        parts.push(
          `<div class="notes-unit-head hyouga-unit-head-symbol" data-unit-id="${unitId}" data-unit-weak-total="${uwk.totalPlaces}" ${unitThemeStyleAttr(theme)}>
            <span class="notes-unit-head-stripe" aria-hidden="true"></span>
            <div class="hyouga-unit-head-body">${stacked}</div>
            <div class="hyouga-unit-head-end">${unitStars}${weakPill}</div>
          </div>`
        );
      }
      parts.push(lessonCardHtml(id, state));
    });
    return parts.join("");
  }

  function timerBarHtml() {
    let h = "0.0";
    let today = "0";
    if (typeof StudyTimer !== "undefined") {
      const s = StudyTimer.getStats();
      h = (s.totalMinutes / 60).toFixed(1);
      today = String(s.todayMinutes);
    }
    return `<div class="notes-timer-bar" aria-label="学习计时">
      <div class="notes-timer-stat">
        <span class="notes-timer-label">累计时长</span>
        <span class="notes-timer-val">${h}<span class="notes-timer-unit">小时</span></span>
      </div>
      <span class="notes-timer-sep" aria-hidden="true"></span>
      <div class="notes-timer-stat">
        <span class="notes-timer-label">今日</span>
        <span class="notes-timer-val">${today}<span class="notes-timer-unit">分钟</span></span>
      </div>
    </div>`;
  }

  function linkModalHtml() {
    return `<div id="notes-link-modal" class="mvp-backdrop notes-link-modal" hidden aria-hidden="true">
      <div class="notes-link-card" role="dialog" aria-labelledby="notes-link-card-title">
        <button type="button" class="notes-link-close" aria-label="关闭">✕</button>
        <div class="notes-link-card-head">
          <span id="notes-link-card-badge" class="notes-link-card-badge">L1 ↔ L2</span>
        </div>
        <p id="notes-link-card-jp" class="notes-link-card-jp jp"></p>
        <p id="notes-link-card-zh" class="notes-link-card-zh zh-annotation"></p>
        <h5 class="notes-link-card-sub">🔗 关联说明</h5>
        <p id="notes-link-card-desc" class="notes-link-card-desc zh-annotation"></p>
        <h5 class="notes-link-card-sub">📌 关联语法点</h5>
        <div id="notes-link-card-tags" class="notes-link-card-tags"></div>
        <h5 class="notes-link-card-sub">💡 记忆要点</h5>
        <p id="notes-link-card-tip" class="notes-link-card-tip zh-annotation"></p>
        <p class="notes-link-card-foot zh-annotation">点卡片外或 ✕ 关闭</p>
      </div>
    </div>`;
  }

  function render(state) {
    return `${timerBarHtml()}
      ${notesGuideHtml()}
      <div class="notes-lesson-accordion" id="notes-lesson-accordion">${renderLessonAccordion(state)}</div>
      ${linkModalHtml()}`;
  }

  function graphLinksForLessons(fromId, targetId) {
    const from = Number(fromId);
    const to = Number(targetId);
    const g = typeof KNOWLEDGE_GRAPH !== "undefined" ? KNOWLEDGE_GRAPH : null;
    if (!g?.concepts || !from || !to) return [];
    const hits = [];
    Object.values(g.concepts).forEach((concept) => {
      const refs = concept?.refs || [];
      const hasFrom = refs.some((r) => Number(r.lessonId) === from);
      const hasTo = refs.some((r) => Number(r.lessonId) === to);
      if (!hasFrom || !hasTo) return;
      const fromRef = refs.find((r) => Number(r.lessonId) === from);
      const toRef = refs.find((r) => Number(r.lessonId) === to);
      hits.push({
        label: (concept.label || "").trim(),
        fromLabel: (fromRef?.label || "").trim(),
        toLabel: (toRef?.label || "").trim(),
        fromAnchor: fromRef?.anchorId || "",
        toAnchor: toRef?.anchorId || "",
      });
    });
    return hits;
  }

  function grammarNodeByAnchor(lessonId, anchorId) {
    if (!anchorId || !/^l\d+_g\d+$/.test(anchorId)) return null;
    const L = getLesson(lessonId);
    return (L?.grammarNodes || []).find((n) => n.id === anchorId) || null;
  }

  function openLinkModal(fromId, targetId, desc) {
    const modal = document.getElementById("notes-link-modal");
    if (!modal) return;
    const fromL = getLesson(fromId);
    const tgtL = getLesson(targetId);
    const graphHits = graphLinksForLessons(fromId, targetId);
    const badge = modal.querySelector("#notes-link-card-badge");
    const jp = modal.querySelector("#notes-link-card-jp");
    const zh = modal.querySelector("#notes-link-card-zh");
    const descEl = modal.querySelector("#notes-link-card-desc");
    const tagsEl = modal.querySelector("#notes-link-card-tags");
    const tipEl = modal.querySelector("#notes-link-card-tip");
    if (badge) badge.textContent = `L${fromId} ↔ L${targetId}`;
    if (jp) jp.textContent = tgtL?.lessonTitle || `第${targetId}課`;
    if (zh) zh.textContent = tgtL?.themeZh || "";
    const graphDesc = graphHits.length
      ? graphHits.map((h) => `${h.label}（L${fromId}·${h.fromLabel || "锚点"} ↔ L${targetId}·${h.toLabel || "锚点"}）`).join("；")
      : "";
    const fullDesc = [desc, graphDesc].filter(Boolean).join("\n");
    if (descEl) descEl.innerHTML = highlightKnowledgeText(fullDesc || desc || "");
    if (tagsEl) {
      const tagSet = new Set();
      const tagHtml = [];
      const pushTag = (text, cls) => {
        const t = String(text || "").trim();
        if (!t || tagSet.has(t)) return;
        tagSet.add(t);
        tagHtml.push(`<span class="notes-tag notes-tag--${cls}">${escapeHtml(t)}</span>`);
      };
      graphHits.forEach((h) => pushTag(h.label, "graph"));
      graphHits.forEach((h) => {
        const nFrom = grammarNodeByAnchor(fromId, h.fromAnchor);
        const nTo = grammarNodeByAnchor(targetId, h.toAnchor);
        if (nFrom) pushTag(`L${fromId}·${nFrom.titleZh || nFrom.title}`, "textbook");
        if (nTo) pushTag(`L${targetId}·${nTo.titleZh || nTo.title}`, "textbook");
      });
      (tgtL?.grammarNodes || []).slice(0, 4).forEach((n) => {
        pushTag(n.titleZh || n.title, "textbook");
      });
      if (fromL && Number(fromId) !== Number(targetId)) {
        (fromL.grammarNodes || []).slice(0, 2).forEach((n) => {
          pushTag(`L${fromId}·${n.titleZh || n.title}`, "textbook");
        });
      }
      tagsEl.innerHTML = tagHtml.length
        ? tagHtml.join("")
        : `<span class="zh-annotation">（目标课语法点加载后显示）</span>`;
    }
    if (tipEl) {
      const tipParts = [];
      if (graphHits.length) {
        tipParts.push(`知识图谱：${graphHits.map((h) => h.label).join("、")}`);
      }
      if (desc) tipParts.push(`对比记忆：${desc}`);
      else if (graphHits.length) tipParts.push("两课通过同一概念串联；先掌握本课句型，再打开目标课对照。");
      else tipParts.push("先掌握本课句型，再打开目标课对照复习。");
      tipEl.innerHTML = highlightKnowledgeText(tipParts.join("\n"));
    }
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }

  function closeLinkModal() {
    const modal = document.getElementById("notes-link-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }

  function bindSingleOpen(container, selector) {
    container.querySelectorAll(selector).forEach((det) => {
      if (det.dataset.notesAccordionBound === "1") return;
      det.dataset.notesAccordionBound = "1";
      det.addEventListener("toggle", () => {
        if (!det.open) return;
        container.querySelectorAll(selector).forEach((other) => {
          if (other !== det) other.open = false;
        });
      });
    });
  }

  function setSubFoldOpen(wrap, open) {
    const btn = wrap.querySelector(".notes-sub-summary");
    const body = wrap.querySelector(".notes-sub-body");
    if (!btn || !body) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      body.removeAttribute("hidden");
      wrap.classList.add("is-open");
    } else {
      body.setAttribute("hidden", "");
      wrap.classList.remove("is-open");
    }
  }

  /** 课本/老师/学霸子项：不用嵌套 details（微信 WebView 易「无法打开」） */
  function bindSubFolds(scope) {
    scope.querySelectorAll(".notes-sub--fold").forEach((wrap) => {
      if (wrap.dataset.notesSubBound === "1") return;
      wrap.dataset.notesSubBound = "1";
      const btn = wrap.querySelector(".notes-sub-summary");
      if (!btn) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = btn.getAttribute("aria-expanded") !== "true";
        const panel = wrap.closest(".notes-dim-panel");
        if (willOpen && panel) {
          panel.querySelectorAll(".notes-sub--fold.is-open").forEach((other) => {
            if (other !== wrap) setSubFoldOpen(other, false);
          });
        }
        setSubFoldOpen(wrap, willOpen);
      });
    });
  }

  function bindDimPanel(panel) {
    if (!panel) return;
    bindSubFolds(panel);
  }

  function bindAccordions(root) {
    bindSingleOpen(root, ".notes-lesson-card");
    root.querySelectorAll(".notes-lesson-body").forEach((body) => {
      bindSingleOpen(body, ".notes-dim");
      body.querySelectorAll(".notes-dim-panel").forEach((panel) => bindDimPanel(panel));
      body.querySelectorAll(".notes-dim").forEach((det) => {
        if (det.dataset.notesDimToggleBound === "1") return;
        det.dataset.notesDimToggleBound = "1";
        det.addEventListener("toggle", () => {
          if (det.open) bindDimPanel(det.querySelector(".notes-dim-panel"));
        });
      });
    });
  }

  function saveNote(lessonId, text) {
    if (typeof LearningNotes === "undefined" || !boundState) return;
    LearningNotes.setText(boundState, { type: "lesson", id: lessonId }, text);
    if (typeof saveMvpState === "function") saveMvpState(boundState);
    const card = boundRoot?.querySelector(`.notes-lesson-card[data-lesson-id="${lessonId}"]`);
    const summary = card?.querySelector(".notes-lesson-summary");
    let dot = card?.querySelector(".notes-lesson-dot");
    const has = !!String(text || "").trim();
    const countEl = card?.querySelector(".notes-dim--mine .notes-dim-count");
    if (has && !dot && summary) {
      summary.insertAdjacentHTML(
        "beforeend",
        '<span class="notes-lesson-dot" title="已有笔记" aria-label="已有笔记">●</span>'
      );
    } else if (!has && dot) {
      dot.remove();
    }
    if (countEl) countEl.textContent = has ? "1条" : "";
  }

  function bind(root, state, callbacks) {
    boundRoot = root;
    boundState = state;
    boundCallbacks = callbacks || {};
    if (typeof LearningNotes !== "undefined") LearningNotes.ensure(state);

    bindAccordions(root);

    root.querySelectorAll(".notes-mine-editor").forEach((ta) => {
      ta.addEventListener("blur", () => saveNote(Number(ta.dataset.noteLessonId), ta.value));
    });

    root.querySelectorAll(".notes-link-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLinkModal(
          Number(btn.dataset.fromLesson),
          Number(btn.dataset.targetLesson),
          btn.querySelector(".notes-link-text")?.textContent?.trim() || ""
        );
      });
    });

    root.querySelectorAll(".notes-go-lesson").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lid = Number(btn.dataset.goLesson);
        if (typeof boundCallbacks.enterLesson === "function") {
          boundCallbacks.enterLesson(lid, 0, { returnView: "me" });
        }
      });
    });

    const modal = document.getElementById("notes-link-modal");
    if (modal && !modal.dataset.notesModalBound) {
      modal.dataset.notesModalBound = "1";
      modal.querySelector(".notes-link-close")?.addEventListener("click", closeLinkModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeLinkModal();
      });
    }
  }

  function expandLesson(scope) {
    if (!boundRoot || !scope || scope.type !== "lesson") return;
    const id = Number(scope.id);
    const det = boundRoot.querySelector(`.notes-lesson-card[data-lesson-id="${id}"]`);
    if (!det) return;
    boundRoot.querySelectorAll(".notes-lesson-card").forEach((d) => {
      d.open = d === det;
    });
    det.open = true;
    const mineDim = det.querySelector(".notes-dim--mine");
    if (mineDim) {
      det.querySelectorAll(".notes-dim").forEach((d) => {
        d.open = d === mineDim;
      });
      mineDim.open = true;
    }
    det.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const ta = det.querySelector(".notes-mine-editor");
    if (ta) setTimeout(() => ta.focus(), 300);
  }

  return { render, bind, expandLesson, openLinkModal, closeLinkModal };
})();
