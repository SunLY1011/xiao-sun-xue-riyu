/** 每课情景对话：分层递进 · 场景切换 · 分支路线 · 综合串联 */
const CONVO_KIND_ORDER = { integrated: 0, branch: 1, scene: 2 };

const REPLY_DISTRACTOR_POOL = [
  { jp: "そうですね、ちょっと考えます。", zh: "是啊，让我想想" },
  { jp: "はい、わかりました。", zh: "好的，明白了" },
  { jp: "もう一度お願いします。", zh: "请再说一遍" },
  { jp: "ありがとうございます。", zh: "谢谢" },
  { jp: "すみません、少々お待ちください。", zh: "不好意思，请稍等" },
];

/** 同课补充回答：培养语感，不强调对错 */
const LESSON_REPLY_EXTRAS = {
  14: [
    { jp: "はい、そう思います。", zh: "是的，我也这么想" },
    { jp: "あとでまた相談します。", zh: "回头再商量" },
    { jp: "今日はちょっと忙しいです。", zh: "今天有点忙" },
  ],
  16: [
    { jp: "とてもきれいだと思います。", zh: "我觉得很漂亮" },
    { jp: "少しうるさいかもしれません。", zh: "可能有点吵" },
    { jp: "もっと広いほうがいいです。", zh: "再大一点更好" },
  ],
  18: [
    { jp: "だいぶよくなりました。ありがとう。", zh: "好多了，谢谢" },
    { jp: "まだ少し熱があります。", zh: "还有一点发烧" },
    { jp: "今日は家で休みます。", zh: "今天在家休息" },
    { jp: "そうですね、前より便利です。", zh: "是啊，比以前方便" },
    { jp: "まだ検討しています。", zh: "还在考虑" },
  ],
};

const DEFAULT_REPLY_EXTRAS = [
  { jp: "そうですね。", zh: "是啊。" },
  { jp: "なるほど。", zh: "原来如此。" },
  { jp: "わかりました。", zh: "明白了。" },
  { jp: "ありがとうございます。", zh: "谢谢。" },
  { jp: "ちょっと考えます。", zh: "让我想想。" },
];

/** 按问句类型生成语感备选（批量模板，触类旁通） */
const REPLY_BY_QUESTION = [
  { re: /どうですか|いかがですか|どうでしょう/, alts: [
    { jp: "とてもいいです。", zh: "非常好。" },
    { jp: "まあまあです。", zh: "还行。" },
    { jp: "ちょっと難しいです。", zh: "有点难。" },
  ]},
  { re: /ますか|ませんか|でしょうか/, alts: [
    { jp: "はい、そうです。", zh: "是的。" },
    { jp: "いいえ、ちょっと違います。", zh: "不，不太对。" },
    { jp: "まだわかりません。", zh: "还不太清楚。" },
  ]},
  { re: /何|どこ|いつ|だれ|どちら/, alts: [
    { jp: "すみません、もう一度お願いします。", zh: "请再说一遍。" },
    { jp: "ちょっと待ってください。", zh: "请稍等。" },
    { jp: "そうですね、考えます。", zh: "让我想想。" },
  ]},
  { re: /ください|お願い/, alts: [
    { jp: "はい、わかりました。", zh: "好的，明白了。" },
    { jp: "すみません、少し待ってください。", zh: "不好意思，请稍等。" },
    { jp: "ありがとうございます。", zh: "谢谢。" },
  ]},
  { re: /風邪|病院|薬|休/, alts: [
    { jp: "だいぶよくなりました。", zh: "好多了。" },
    { jp: "まだ少しつらいです。", zh: "还有点难受。" },
    { jp: "今日は休みます。", zh: "今天休息。" },
  ]},
  { re: /いくら|高い|安い|買/, alts: [
    { jp: "少し高いですね。", zh: "有点贵呢。" },
    { jp: "もう少し安いのはありますか。", zh: "有更便宜的吗？" },
    { jp: "じゃ、これをください。", zh: "那就要这个吧。" },
  ]},
];

function thematicAltsFromNpc(npcJp) {
  const q = npcJp || "";
  for (const row of REPLY_BY_QUESTION) {
    if (row.re.test(q)) return row.alts.slice();
  }
  return DEFAULT_REPLY_EXTRAS.slice(0, 3);
}

/**
 * 批量：每条「你的回答」自动补全 3 种可选（已有 replies 则保留）
 * 模板 = 问句🔊 + 多选回答🔊（与综合篇一致）
 */
function enrichTurnsWithReplies(turns, lessonId) {
  let prevNpc = null;
  return turns.map((t) => {
    if (t.npc) {
      prevNpc = { role: t.role, jp: t.jp, zh: t.zh };
      return t;
    }
    if (t.choice || t.transition || t.tier != null) {
      prevNpc = null;
      return t;
    }
    if (!t.jp) return t;
    if (t.replies && t.replies.length >= 2) return t;

    const primary = { jp: t.jp, zh: t.zh || "", primary: true };
    const thematic = thematicAltsFromNpc(prevNpc?.jp)
      .filter((a) => a.jp !== t.jp)
      .slice(0, 2);
    const contextual = pickContextualReplies(t, lessonId, 2).map((o) => ({
      jp: o.jp,
      zh: o.zh,
      primary: false,
    }));
    const merged = [primary];
    for (const a of [...thematic, ...contextual]) {
      if (merged.length >= 3) break;
      if (!merged.some((x) => x.jp === a.jp)) merged.push(a);
    }
    while (merged.length < 3) {
      const extra = REPLY_DISTRACTOR_POOL.find((p) => !merged.some((x) => x.jp === p.jp));
      if (!extra) break;
      merged.push({ jp: extra.jp, zh: extra.zh, primary: false });
    }
    prevNpc = null;
    return { ...t, replies: merged.slice(0, 3) };
  });
}

function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickContextualReplies(t, lessonId, count) {
  const lid = Number(lessonId) || 0;
  const pool = [...(LESSON_REPLY_EXTRAS[lid] || []), ...REPLY_DISTRACTOR_POOL].filter(
    (p) => p.jp && p.jp !== t.jp
  );
  return shuffleArr(pool)
    .slice(0, count)
    .map((p) => ({ jp: p.jp, zh: p.zh || "", correct: true, primary: false }));
}

function buildReplyStep(t, lessonId) {
  const primary = { jp: t.jp, zh: t.zh || "", correct: true, primary: true };
  let options;
  if (t.replies && t.replies.length >= 2) {
    options = t.replies.map((o, i) => ({
      jp: o.jp,
      zh: o.zh || "",
      correct: true,
      primary: o.primary === true || o.jp === t.jp || i === 0,
      tip: o.tip || "",
    }));
  } else {
    options = [primary, ...pickContextualReplies(t, lessonId, 2)];
  }
  const seen = new Set();
  options = options.filter((o) => {
    if (seen.has(o.jp)) return false;
    seen.add(o.jp);
    return true;
  });
  while (options.length < 3) {
    const extra = REPLY_DISTRACTOR_POOL.find((p) => !seen.has(p.jp));
    if (!extra) break;
    seen.add(extra.jp);
    options.push({ jp: extra.jp, zh: extra.zh, correct: true, primary: false });
  }
  return {
    type: "reply",
    options: shuffleArr(options),
    keywords: t.keys || [],
    guide: t.tip || "",
  };
}

/** 对方一句 + 你的多种回答 → 合并为一步（模板） */
function mergeNpcReplySteps(steps) {
  const out = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.type === "npc") {
      const next = steps[i + 1];
      if (next?.type === "reply") {
        out.push({
          type: "npc_reply",
          role: s.role,
          npcJp: s.jp,
          npcZh: s.zh,
          options: next.options,
          keywords: next.keywords || [],
        });
        i++;
        continue;
      }
      out.push({
        type: "npc_reply",
        role: s.role,
        npcJp: s.jp,
        npcZh: s.zh,
        options: buildReplyStep({ jp: "はい、わかりました。", zh: "好的，明白了。" }, 0).options,
        keywords: [],
      });
      continue;
    }
    if (s.type === "reply") {
      out.push({
        type: "npc_reply",
        role: "相手",
        npcJp: "",
        npcZh: "",
        options: s.options,
        keywords: s.keywords || [],
      });
      continue;
    }
    out.push(s);
  }
  return out;
}

function turnsToSteps(turns, lessonId) {
  const steps = [];
  turns.forEach((t) => {
    if (t.tier != null) {
      steps.push({
        type: "tier",
        level: t.tier,
        label: t.label || "",
        mood: t.mood || "",
        zh: t.zh || "",
      });
      return;
    }
    if (t.transition) {
      steps.push({
        type: "transition",
        place: t.place || "",
        text: t.text || "",
        bg: t.emoji || "➡️",
      });
      return;
    }
    if (t.choice) {
      steps.push({
        type: "choice",
        prompt: t.prompt,
        zh: t.zh || "",
        options: (t.options || []).map((o) => ({
          jp: o.jp,
          zh: o.zh,
          correct: o.correct !== false,
          route: o.route || null,
          tip: o.tip || "",
        })),
      });
      return;
    }
    if (t.npc) {
      steps.push({ type: "npc", role: t.role, jp: t.jp, zh: t.zh });
      return;
    }
    if (t.guide) {
      steps.push({ type: "guide", text: t.guide, hint: t.jp });
      if (!t.jp) return;
    }
    if (t.jp) {
      steps.push(buildReplyStep(t, lessonId));
    }
  });
  return steps;
}

function mkDialogue(lessonId, id, title, emoji, place, sceneZh, turns, meta = {}) {
  const steps = [{ type: "scene", text: sceneZh, bg: emoji }];
  const enriched = enrichTurnsWithReplies(turns, lessonId);
  steps.push(...mergeNpcReplySteps(turnsToSteps(enriched, lessonId)));
  steps.push({ type: "celebrate", text: meta.endText || "🎉 本场对话完成！" });
  return {
    id,
    lessonId: Number(lessonId),
    title,
    emoji,
    place,
    desc: meta.desc || title,
    kind: meta.kind || "scene",
    steps,
  };
}

/** 分支篇：先选路线，再展开对应场景链（邮局优先 / 百货优先） */
function mkBranchDialogue(lessonId, id, title, emoji, place, sceneZh, introTurns, choiceTurn, segments, endingTurns, meta = {}) {
  const base = [
    { type: "scene", text: sceneZh, bg: emoji },
    ...mergeNpcReplySteps(turnsToSteps(enrichTurnsWithReplies(introTurns, lessonId), lessonId)),
  ];
  const choiceSteps = turnsToSteps(enrichTurnsWithReplies([choiceTurn], lessonId), lessonId);
  const ending = mergeNpcReplySteps(
    turnsToSteps(enrichTurnsWithReplies(endingTurns || [], lessonId), lessonId)
  );
  return {
    id,
    lessonId: Number(lessonId),
    title,
    emoji,
    place,
    desc: meta.desc || title,
    kind: "branch",
    branchAt: base.length + choiceSteps.length,
    steps: [...base, ...choiceSteps],
    segments: Object.fromEntries(
      Object.entries(segments).map(([k, turns]) => [
        k,
        mergeNpcReplySteps(turnsToSteps(enrichTurnsWithReplies(turns, lessonId), lessonId)),
      ])
    ),
    ending,
    _expanded: false,
  };
}

function expandBranchDialogue(dlg, route) {
  if (!dlg.segments?.[route]) return dlg;
  return {
    ...dlg,
    _expanded: true,
    _route: route,
    steps: [
      ...dlg.steps,
      ...mergeNpcReplySteps(dlg.segments[route]),
      ...dlg.ending,
      { type: "celebrate", text: "🎉 路线完成！" },
    ],
  };
}

const LESSON_DIALOGUES = [
  // —— 第14课：综合一天（家→大学→邮局→公交→百货）约 24 步 ——
  mkDialogue(
    14,
    "l14-integrated",
    "【综合篇】忙碌的一天",
    "🌅",
    "一日",
    "周六一整天：出门前、校园里、邮局、公交站、百货商店，把第14课串成一条故事线。",
    [
      { tier: 1, label: "第1层·铺垫", mood: "家常", zh: "和家人确认行程" },
      { npc: true, role: "妈妈", jp: "李さん、今日の午後は何をしますか。", zh: "小李，今天下午做什么？" },
      {
        guide: "用て形串联：去图书馆学习，然后回家写信。",
        jp: "図書館へ行って、勉強をします。それから家へ帰って、手紙を書きます。",
        zh: "去图书馆学习，然后回家写信。",
        keys: ["行って", "勉強", "帰って", "手紙"],
      },
      { npc: true, role: "妈妈", jp: "いいですね。いつ出かけますか。", zh: "真好。什么时候出门？" },
      { jp: "昼ご飯を食べてから出かけます。", zh: "午饭后出门。", keys: ["食べてから", "出かけ"] },
      { npc: true, role: "妈妈", jp: "何時に帰りますか。", zh: "几点回来？" },
      { jp: "夜八時ごろ帰ります。", zh: "晚上八点左右回来。", keys: ["八時", "帰り"] },
      { transition: true, emoji: "🏫", place: "大学", text: "午後、大学で友達に会いました。" },
      { tier: 2, label: "第2层·展开", mood: "轻松", zh: "和同学商量购物" },
      { npc: true, role: "同学", jp: "今日デパートへ行きませんか。", zh: "今天不去百货吗？" },
      { jp: "はい、行きましょう。でも、まず郵便局へ行って、荷物を送ります。", zh: "好，去吧。不过先去邮局寄包裹。", keys: ["郵便局", "行って", "送り"] },
      { npc: true, role: "同学", jp: "そうですか。何を送りますか。", zh: "是吗？寄什么？" },
      { jp: "中国の友達にプレゼントを送ります。", zh: "给中国朋友寄礼物。", keys: ["中国", "送り"] },
      { transition: true, emoji: "📮", place: "郵便局", text: "二人で郵便局に入りました。" },
      { tier: 3, label: "第3层·深入", mood: "办事", zh: "邮局完整交流" },
      { npc: true, role: "店员", jp: "いらっしゃいませ。どうなさいましたか。", zh: "欢迎。有什么事？" },
      { jp: "すみません、この荷物を中国へ送ってください。", zh: "请把这个包裹寄到中国。", keys: ["荷物", "送って"] },
      { npc: true, role: "店员", jp: "船便ですか、航空便ですか。", zh: "海运还是空运？" },
      { jp: "船便でお願いします。急ぎませんから。", zh: "请走海运，不急。", keys: ["船便"] },
      { npc: true, role: "店员", jp: "かしこまりました。お名前と住所を書いてください。", zh: "好的，请写姓名和地址。" },
      { jp: "はい、ここに書きます。", zh: "好的，写在这里。", keys: ["書いて"] },
      { transition: true, emoji: "🚌", place: "バス停", text: "郵便局のあと、バスでデパートへ向かいます。" },
      { tier: 4, label: "第4层·穿插", mood: "确认", zh: "路上问路" },
      { npc: true, role: "乗客", jp: "このバスは駅前を通りますか。", zh: "这车经过站前吗？" },
      { jp: "はい、通りますよ。駅前までお願いします。", zh: "是的，请到站前。", keys: ["通ります", "駅前"] },
      { npc: true, role: "運転手", jp: "はい、わかりました。", zh: "好的，明白了。" },
      { transition: true, emoji: "🛍️", place: "デパート", text: "デパートに着きました。" },
      { tier: 5, label: "第5层·高潮", mood: "愉快", zh: "购物收尾" },
      { npc: true, role: "同学", jp: "何を買いますか。", zh: "买什么？" },
      { jp: "デパートへ行って、服と本を買います。", zh: "去百货买衣服和书。", keys: ["買い", "服", "本"] },
      { npc: true, role: "同学", jp: "いいですね。一緒に見ましょう。", zh: "好啊，一起看吧。" },
      { jp: "ありがとう。今日は楽しかったです。", zh: "谢谢，今天很开心。", keys: ["楽しかった"] },
    ],
    { kind: "integrated", desc: "约24轮·五层递进·五场景串联" }
  ),

  mkBranchDialogue(
    14,
    "l14-branch-order",
    "【分支篇】先邮局还是先百货？",
    "🔀",
    "午後",
    "午饭後，你和同学商量路线顺序——选不同顺序，对话场景会穿插变化。",
    [
      { tier: 1, label: "开场", mood: "商量", zh: "决定出门顺序" },
      { npc: true, role: "同学", jp: "午後、一緒に出かけませんか。", zh: "下午一起出门吗？" },
      { jp: "はい、出かけましょう。", zh: "好，走吧。", keys: ["出かけ"] },
    ],
    {
      choice: true,
      prompt: "午後、先にどこへ行きますか。",
      zh: "下午先去哪儿？",
      options: [
        { jp: "まず郵便局へ行って、荷物を送ります。", zh: "先去邮局寄包裹", correct: true, route: "post" },
        { jp: "まずデパートへ行って、買い物をします。", zh: "先去百货购物", correct: true, route: "shop" },
      ],
    },
    {
      post: [
        { transition: true, emoji: "📮", place: "郵便局", text: "路线A：郵便局 → デパート" },
        { tier: 2, label: "邮局", mood: "办事" },
        { npc: true, role: "店员", jp: "いらっしゃいませ。", zh: "欢迎光临。" },
        { jp: "この荷物を中国へ送ってください。", zh: "请寄到中国。", keys: ["送って"] },
        { npc: true, role: "店员", jp: "船便ですか、航空便ですか。", zh: "海运还是空运？" },
        { jp: "船便でお願いします。", zh: "海运，谢谢。", keys: ["船便"] },
        { transition: true, emoji: "🛍️", place: "デパート", text: "荷物を送ったあと、デパートへ。" },
        { npc: true, role: "同学", jp: "さあ、買い物しましょう。", zh: "来购物吧。" },
        { jp: "服を買って、それから本を買います。", zh: "买衣服，然后买书。", keys: ["買って"] },
      ],
      shop: [
        { transition: true, emoji: "🛍️", place: "デパート", text: "路线B：デパート → 郵便局" },
        { tier: 2, label: "百货", mood: "购物" },
        { npc: true, role: "同学", jp: "今日は何を買いますか。", zh: "今天买什么？" },
        { jp: "デパートへ行って、買い物をします。", zh: "去百货买东西。", keys: ["買い物"] },
        { npc: true, role: "店员", jp: "いらっしゃいませ。", zh: "欢迎。" },
        { jp: "この服を見せてください。", zh: "请让我看看这件衣服。", keys: ["見せて"] },
        { transition: true, emoji: "📮", place: "郵便局", text: "買い物のあと、郵便局へ。" },
        { npc: true, role: "店员", jp: "荷物を送りますか。", zh: "要寄包裹吗？" },
        { jp: "はい、中国へ送ってください。", zh: "是的，请寄到中国。", keys: ["送って"] },
      ],
    },
    [
      { tier: 3, label: "收尾", mood: "满足" },
      { npc: true, role: "同学", jp: "今日はたくさん歩きましたね。", zh: "今天走了很多路呢。" },
      { jp: "ええ、とても楽しかったです。", zh: "嗯，非常开心。", keys: ["楽しかった"] },
    ],
    { desc: "选路线·场景穿插·约18轮" }
  ),

  mkDialogue(1, "l1-d1", "第一次见面", "🤝", "教室", "开学第一天，教室里认识新同学。", [
    { tier: 1, label: "寒暄", mood: "礼貌" },
    { npc: true, role: "同学", jp: "はじめまして。わたしは田中です。", zh: "初次见面，我是田中。" },
    { guide: "自我介绍并问好。", jp: "はじめまして。わたしは李です。中国人です。", zh: "初次见面，我是小李，中国人。", keys: ["はじめまして", "中国人"] },
    { npc: true, role: "田中", jp: "李さんは学生ですか。", zh: "你是学生吗？" },
    { jp: "いいえ、学生じゃありません。会社員です。", zh: "不，是公司职员。", keys: ["会社員"] },
    { npc: true, role: "田中", jp: "そうですか。日本語は大丈夫ですか。", zh: "是吗？日语还好吗？" },
    { jp: "まだあまり上手じゃありませんが、頑張ります。", zh: "还不太行，但会努力。", keys: ["頑張り"] },
    { jp: "どうぞよろしくお願いします。", zh: "请多关照。", keys: ["よろしく"] },
    { npc: true, role: "田中", jp: "こちらこそ、よろしくお願いします。", zh: "我才要请你多关照。" },
  ]),

  mkDialogue(14, "l14-dA", "校园·下午的安排", "📚", "大学", "大学里，两位同学聊下午计划。", [
    { tier: 1, label: "闲聊", mood: "轻松" },
    { npc: true, role: "甲", jp: "今日の午後は何をしますか。", zh: "今天下午做什么？" },
    { guide: "て形串联多个动作。", jp: "図書館へ行って、勉強をします。それから家へ帰って、手紙を書きます。", zh: "去图书馆学习，然后回家写信。", keys: ["行って", "手紙"] },
    { npc: true, role: "乙", jp: "いいですね。図書館は何時からですか。", zh: "真好。图书馆几点开？" },
    { jp: "一時からです。", zh: "一点开始。", keys: ["一時"] },
    { npc: true, role: "乙", jp: "じゃあ、一緒に行きませんか。", zh: "那一起去吗？" },
    { jp: "はい、行きましょう。", zh: "好，走吧。", keys: ["行きましょう"] },
    { npc: true, role: "乙", jp: "何時に帰りますか。", zh: "几点回去？" },
    { jp: "五時ごろ帰ります。", zh: "大概五点。", keys: ["五時", "帰り"] },
  ]),

  mkDialogue(14, "l14-dB", "出门·てから", "🚶", "家", "出门前和家人对话。", [
    { tier: 1, label: "叮嘱", mood: "关心" },
    { npc: true, role: "妈妈", jp: "今日は早く帰ってくださいね。", zh: "今天要早点回来哦。" },
    { npc: true, role: "妈妈", jp: "いつ出かけますか。", zh: "什么时候出门？" },
    { jp: "昼ご飯を食べてから出かけます。", zh: "午饭后出门。", keys: ["食べてから"] },
    { npc: true, role: "妈妈", jp: "荷物、忘れないでね。", zh: "别忘了东西。" },
    { jp: "はい、荷物を持って行きます。", zh: "好的，我会带上。", keys: ["持って"] },
    { npc: true, role: "妈妈", jp: "何時に帰りますか。", zh: "几点回来？" },
    { jp: "夜八時ごろ帰ります。", zh: "晚上八点左右。", keys: ["帰り"] },
    { jp: "行ってきます。", zh: "我出门了。", keys: ["行って"] },
    { npc: true, role: "妈妈", jp: "いってらっしゃい。", zh: "慢走。" },
  ]),

  mkDialogue(14, "l14-dC", "邮局·寄包裹", "📮", "郵便局", "在日本邮局寄礼物回中国。", [
    { tier: 1, label: "办事", mood: "正式" },
    { npc: true, role: "店员", jp: "いらっしゃいませ。", zh: "欢迎光临。" },
    { jp: "すみません、この荷物を中国へ送ってください。", zh: "请把这个包裹寄到中国。", keys: ["荷物", "送って"] },
    { npc: true, role: "店员", jp: "内容は何ですか。", zh: "里面是什么？" },
    { jp: "本とお菓子です。", zh: "书和点心。", keys: ["本", "お菓子"] },
    { npc: true, role: "店员", jp: "船便ですか、航空便ですか。", zh: "海运还是空运？" },
    { jp: "船便でお願いします。", zh: "请走海运。", keys: ["船便"] },
    { npc: true, role: "店员", jp: "お名前と住所を書いてください。", zh: "请写姓名和地址。" },
    { jp: "はい、ここに書きます。", zh: "好的，写在这里。", keys: ["書いて"] },
    { npc: true, role: "店员", jp: "ありがとうございました。", zh: "谢谢惠顾。" },
    { jp: "ありがとうございます。", zh: "谢谢。", keys: ["ありがとう"] },
  ]),

  mkDialogue(14, "l14-dD", "公交·问路", "🚌", "バス停", "在公交站确认是否经过车站。", [
    { tier: 1, label: "确认", mood: "小心" },
    { npc: true, role: "司机", jp: "どちらまでですか。", zh: "您到哪儿？" },
    { jp: "駅前までお願いします。", zh: "请到站前。", keys: ["駅前"] },
    { npc: true, role: "乘客", jp: "このバスは駅前を通りますか。", zh: "这车经过站前吗？" },
    { jp: "はい、通りますよ。", zh: "是的，经过。", keys: ["通ります"] },
    { npc: true, role: "司机", jp: "二十分ぐらいかかります。", zh: "大约二十分钟。" },
    { jp: "わかりました。ありがとうございます。", zh: "明白了，谢谢。", keys: ["ありがとう"] },
    { npc: true, role: "乘客", jp: "次の停留所で降ります。", zh: "下一站下车。" },
    { jp: "私もそこで降ります。", zh: "我也那儿下。", keys: ["降り"] },
  ]),

  mkDialogue(14, "l14-dE", "百货·购物", "🛍️", "デパート", "周末和同学去百货商店。", [
    { tier: 2, label: "购物", mood: "愉快" },
    { npc: true, role: "同学", jp: "今日デパートへ行きませんか。", zh: "今天去百货吗？" },
    { jp: "はい、行きましょう。買い物をします。", zh: "好，去购物。", keys: ["買い物"] },
    { npc: true, role: "同学", jp: "何を買いますか。", zh: "买什么？" },
    { jp: "デパートへ行って、服を買います。", zh: "去百货买衣服。", keys: ["行って", "服"] },
    { npc: true, role: "店员", jp: "いらっしゃいませ。", zh: "欢迎。" },
    { jp: "このシャツを見せてください。", zh: "请让我看看这件衬衫。", keys: ["見せて"] },
    { npc: true, role: "同学", jp: "いい色ですね。", zh: "颜色真好。" },
    { jp: "ええ、買います。", zh: "嗯，买了。", keys: ["買い"] },
  ]),

  // —— 第16课综合 ——
  mkDialogue(
    16,
    "l16-integrated",
    "【综合篇】一日游日本印象",
    "🗾",
    "旅行",
    "从酒店到办公室再到街头，把形容、并列、印象句型织进一段旅行对话。",
    [
      { tier: 1, label: "第1层", mood: "介绍", zh: "酒店房间" },
      { npc: true, role: "导游", jp: "ホテルの部屋はどうですか。", zh: "酒店房间怎么样？" },
      { jp: "部屋は広くて明るくて、とてもきれいです。", zh: "又宽又亮，很漂亮。", keys: ["広くて", "明るい"] },
      { npc: true, role: "游客", jp: "風呂はありますか。", zh: "有浴室吗？" },
      { jp: "はい、あります。シャワーも新しいです。", zh: "有，淋浴也很新。", keys: ["あります"] },
      { transition: true, emoji: "👔", place: "会社", text: "午後、旅行会社のオフィスへ。" },
      { tier: 2, label: "第2层", mood: "职场", zh: "聊同事森先生" },
      { npc: true, role: "同事", jp: "森さんはどんな人ですか。", zh: "森先生是什么样的人？" },
      { jp: "背が高くて脚が長くて、ハンサムな人です。", zh: "高个子腿长，很帅。", keys: ["高くて", "ハンサム"] },
      { npc: true, role: "同事", jp: "森さんは何の社員ですか。", zh: "森先生是什么职员？" },
      { jp: "旅行会社の社員で、部長です。", zh: "旅行社职员，是部长。", keys: ["社員", "部長"] },
      { transition: true, emoji: "🌆", place: "街", text: "仕事のあと、街を歩きます。" },
      { tier: 3, label: "第3层", mood: "感慨", zh: "谈日本印象" },
      { npc: true, role: "朋友", jp: "日本はどうですか。", zh: "日本怎么样？" },
      { jp: "町がきれいで安全ですが、物が高いですね。", zh: "城市干净安全，但东西贵。", keys: ["きれい", "安全", "高い"] },
      { npc: true, role: "朋友", jp: "食べ物はおいしいですか。", zh: "食物好吃吗？" },
      { jp: "はい、とてもおいしいです。これからも来たいです。", zh: "很好吃，还想再来。", keys: ["おいしい"] },
      { npc: true, role: "朋友", jp: "交通は便利ですか。", zh: "交通方便吗？" },
      { jp: "電車もバスも便利で、駅も近いです。", zh: "电车公交都方便，车站也近。", keys: ["便利"] },
    ],
    { kind: "integrated", desc: "三场景·三层递进·约18轮" }
  ),

  mkDialogue(16, "l16-d1", "介绍酒店房间", "🏨", "ホテル", "导游向游客介绍酒店。", [
    { tier: 1, label: "描写", mood: "称赞" },
    { npc: true, role: "导游", jp: "ホテルの部屋はどうですか。", zh: "房间怎么样？" },
    { jp: "ホテルの部屋は広くて明るいです。", zh: "又宽敞又明亮。", keys: ["広くて", "明るい"] },
    { npc: true, role: "游客", jp: "窓からの景色はどうですか。", zh: "窗外景色呢？" },
    { jp: "とてもきれいです。海が見えます。", zh: "很美，能看见海。", keys: ["きれい"] },
    { npc: true, role: "游客", jp: "風呂はありますか。", zh: "有浴室吗？" },
    { jp: "はい、あります。とてもきれいです。", zh: "有，而且很干净。", keys: ["あります"] },
  ]),

  mkDialogue(16, "l16-d2", "描述同事森先生", "👔", "会社", "办公室里聊同事。", [
    { tier: 2, label: "人物", mood: "好奇" },
    { npc: true, role: "同事", jp: "森さんはどんな人ですか。", zh: "森先生是什么样的人？" },
    { jp: "背が高くて脚が長くて、ハンサムな人です。", zh: "个子高腿长，很帅。", keys: ["高くて", "ハンサム"] },
    { npc: true, role: "同事", jp: "性格はどうですか。", zh: "性格呢？" },
    { jp: "親切で、よく教えてくれます。", zh: "亲切，经常教我。", keys: ["親切"] },
    { npc: true, role: "同事", jp: "森さんは旅行会社の社員ですか。", zh: "是旅行社职员吗？" },
    { jp: "はい、旅行会社の社員で、部長です。", zh: "是，还是部长。", keys: ["部長"] },
  ]),

  mkDialogue(16, "l16-d3", "聊日本印象", "🗾", "観光", "和日本朋友聊旅行感受。", [
    { tier: 3, label: "印象", mood: "坦诚" },
    { npc: true, role: "朋友", jp: "日本はどうですか。", zh: "日本怎么样？" },
    { jp: "町がきれいで安全ですが、物が高いですね。", zh: "干净安全，但东西贵。", keys: ["安全", "高い"] },
    { npc: true, role: "朋友", jp: "どこが一番好きですか。", zh: "最喜欢哪里？" },
    { jp: "京都が好きです。静かで美しいです。", zh: "喜欢京都，安静美丽。", keys: ["好き", "美しい"] },
    { npc: true, role: "朋友", jp: "交通は便利ですか。", zh: "交通方便吗？" },
    { jp: "はい、電車もバスも便利です。", zh: "电车公交都方便。", keys: ["便利"] },
  ]),

  // —— 第18课综合 ——
  mkDialogue(
    18,
    "l18-integrated",
    "【综合篇】变化与愿望",
    "✨",
    "一日",
    "电器店、教室、医院——自然变化、人为改变、愿望句型连成故事。",
    [
      { tier: 1, label: "第1层", mood: "惊喜", zh: "电器店" },
      { npc: true, role: "店员", jp: "新しい携帯はどうですか。", zh: "新手机怎么样？" },
      { jp: "携帯電話はとても小さくなりました。", zh: "手机变得很小了。", keys: ["小さく", "なりました"] },
      { npc: true, role: "店员", jp: "軽くなりましたか。", zh: "变轻了吗？" },
      { jp: "はい、前より軽くなりました。", zh: "比以前轻了。", keys: ["軽く"] },
      { transition: true, emoji: "🏫", place: "学校", text: "翌日、学校へ。" },
      { tier: 2, label: "第2层", mood: "关心", zh: "同学感冒" },
      {
        npc: true,
        role: "同学",
        jp: "風邪はどうですか。もうよくなりましたか。",
        zh: "感冒好了吗？",
      },
      {
        jp: "ゆうべ薬を飲みましたが、まだよくなりません。",
        zh: "昨晚吃药了，还没好。",
        keys: ["薬", "よくなりません"],
        replies: [
          { jp: "ゆうべ薬を飲みましたが、まだよくなりません。", zh: "昨晚吃药了，还没好。" },
          { jp: "だいぶよくなりました。ありがとう。", zh: "好多了，谢谢关心。" },
          { jp: "まだ少し熱があります。", zh: "还有一点发烧。" },
        ],
      },
      { npc: true, role: "同学", jp: "今日は休んでください。", zh: "今天请休息。" },
      { jp: "はい、休みます。", zh: "好的，休息。", keys: ["休み"] },
      { transition: true, emoji: "👨‍⚕️", place: "教室", text: "後で、先生と将来の話。" },
      { tier: 3, label: "第3层", mood: "憧憬", zh: "谈将来" },
      { npc: true, role: "老师", jp: "将来何になりたいですか。", zh: "将来想做什么？" },
      { jp: "医者になりたいです。人の役に立ちたいです。", zh: "想当医生，想帮助别人。", keys: ["医者", "なりたい"] },
      { npc: true, role: "老师", jp: "いいですね。音を大きくしないで、体を大切にしてください。", zh: "很好，别放太大声，保重身体。" },
      { jp: "はい、頑張ります。", zh: "好的，我会努力。", keys: ["頑張り"] },
      { npc: true, role: "老师", jp: "きっと医者になれますよ。", zh: "一定能成为医生哦。" },
      { jp: "ありがとうございます。励みになります。", zh: "谢谢，很受鼓舞。", keys: ["ありがとう"] },
    ],
    { kind: "integrated", desc: "三场景·约20轮" }
  ),

  mkDialogue(18, "l18-d1", "手机变小了", "📱", "電器店", "在电器店聊手机。", [
    { tier: 1, label: "变化", mood: "惊讶" },
    { npc: true, role: "店员", jp: "新しい携帯はどうですか。", zh: "新手机怎么样？" },
    { jp: "携帯電話はとても小さくなりました。", zh: "手机变小了。", keys: ["小さく"] },
    { npc: true, role: "店员", jp: "画面も大きくなりましたか。", zh: "屏幕变大了吗？" },
    { jp: "いいえ、画面は小さくしません。音を大きくします。", zh: "不缩小屏幕，把音量调大。", keys: ["大きく"] },
    { npc: true, role: "店员", jp: "軽くなりましたか。", zh: "变轻了吗？" },
    { jp: "はい、前より軽くなりました。", zh: "比以前轻了。", keys: ["軽く"] },
  ]),

  mkDialogue(18, "l18-d2", "感冒还没好", "🤒", "学校", "同学关心你的感冒。", [
    { tier: 2, label: "关心", mood: "温暖" },
    { npc: true, role: "同学", jp: "顔色が悪いですね。大丈夫ですか。", zh: "脸色不好，没事吧？" },
    {
      jp: "風邪をひきました。まだよくなりません。",
      zh: "感冒了，还没好。",
      keys: ["風邪", "よくなりません"],
      replies: [
        { jp: "風邪をひきました。まだよくなりません。", zh: "感冒了，还没好。" },
        { jp: "だいぶよくなりました。", zh: "好多了。" },
        { jp: "今日は家で休みます。", zh: "今天在家休息。" },
      ],
    },
    { npc: true, role: "同学", jp: "病院へ行きましたか。", zh: "去医院了吗？" },
    {
      jp: "いいえ、薬を飲むだけです。",
      zh: "没有，只吃药。",
      keys: ["薬"],
      replies: [
        { jp: "いいえ、薬を飲むだけです。", zh: "没有，只吃药。" },
        { jp: "はい、昨日病院へ行きました。", zh: "去了，昨天去的医院。" },
        { jp: "これから行くつもりです。", zh: "打算要去。" },
      ],
    },
    { npc: true, role: "同学", jp: "今日は休んでください。", zh: "今天请休息。" },
    { jp: "はい、休みます。ありがとう。", zh: "好的，谢谢。", keys: ["休み"] },
  ]),

  mkDialogue(18, "l18-d3", "成为医生", "👨‍⚕️", "学校", "聊今后的梦想。", [
    { tier: 3, label: "愿望", mood: "认真" },
    { npc: true, role: "老师", jp: "将来何になりたいですか。", zh: "将来想做什么？" },
    { jp: "医者になりたいです。", zh: "想当医生。", keys: ["医者", "なりたい"] },
    { npc: true, role: "老师", jp: "なぜ医者ですか。", zh: "为什么当医生？" },
    { jp: "子どものころからそう思っていました。", zh: "从小就这么想。", keys: ["思って"] },
    { npc: true, role: "老师", jp: "いいですね。頑張ってください。", zh: "很好，加油。" },
    { jp: "はい、頑張ります。", zh: "好的，会努力。", keys: ["頑張り"] },
  ]),
];

(function fillRemainingLessons() {
  const done = new Set(LESSON_DIALOGUES.map((d) => d.lessonId));
  const extras = [
    [2, "在教室认物品", "📚", "教室", "课间认物品。", [
      { tier: 1, label: "指认" },
      { npc: true, role: "同学", jp: "これは何ですか。", zh: "这是什么？" },
      { jp: "これは本です。", zh: "这是书。", keys: ["これ", "本"] },
      { npc: true, role: "同学", jp: "それは何ですか。", zh: "那是什么？" },
      { jp: "それはノートです。", zh: "那是笔记本。", keys: ["ノート"] },
      { npc: true, role: "同学", jp: "あれは辞書ですか。", zh: "那是字典吗？" },
      { jp: "いいえ、あれは雑誌です。", zh: "不，是杂志。", keys: ["雑誌"] },
      { npc: true, role: "同学", jp: "このペンはあなたのですか。", zh: "这支笔是你的吗？" },
      { jp: "はい、わたしのです。", zh: "是的，是我的。", keys: ["わたし"] },
    ]],
    [3, "问路", "🗺️", "学校", "新生问路。", [
      { tier: 1, label: "指路" },
      { npc: true, role: "学生", jp: "すみません、図書館はどこですか。", zh: "图书馆在哪儿？" },
      { jp: "図書館はあそこです。", zh: "在那儿。", keys: ["あそこ"] },
      { npc: true, role: "学生", jp: "食堂はどこですか。", zh: "食堂呢？" },
      { jp: "食堂はここです。", zh: "在这里。", keys: ["ここ"] },
      { npc: true, role: "学生", jp: "ありがとうございます。", zh: "谢谢。" },
      { jp: "どういたしまして。", zh: "不客气。", keys: ["どういたしまして"] },
    ]],
    [4, "房间里有什么", "🏠", "宿舍", "参观房间。", [
      { tier: 1, label: "存在" },
      { npc: true, role: "朋友", jp: "部屋に何がありますか。", zh: "房间里有什么？" },
      { jp: "机と椅子があります。", zh: "有桌子和椅子。", keys: ["机", "椅子"] },
      { npc: true, role: "朋友", jp: "テレビはありますか。", zh: "有电视吗？" },
      { jp: "はい、あります。パソコンもあります。", zh: "有，还有电脑。", keys: ["パソコン"] },
      { npc: true, role: "朋友", jp: "ベッドはありますか。", zh: "有床吗？" },
      { jp: "いいえ、ベッドはありません。ふとんがあります。", zh: "没有床，有被褥。", keys: ["ありません"] },
    ]],
    [5, "怎么去学校", "🚌", "駅", "在车站遇同学。", [
      { tier: 1, label: "交通" },
      { npc: true, role: "同学", jp: "李さんは毎日何で来ますか。", zh: "你每天怎么来？" },
      { jp: "毎日バスで来ます。", zh: "坐公交来。", keys: ["バス"] },
      { npc: true, role: "同学", jp: "歩いて来ますか。", zh: "走路来吗？" },
      { jp: "いいえ、電車で来ます。", zh: "不，坐地铁。", keys: ["電車"] },
      { npc: true, role: "同学", jp: "何時に着きますか。", zh: "几点到？" },
      { jp: "八時半ごろ着きます。", zh: "八点半左右到。", keys: ["八時半"] },
    ]],
    [6, "星期几见面", "📅", "学校", "约周末见面。", [
      { tier: 1, label: "约定" },
      { npc: true, role: "同学", jp: "土曜日に映画を見ませんか。", zh: "周六看电影好吗？" },
      { jp: "はい、土曜日の三時はどうですか。", zh: "周六三点怎么样？", keys: ["三時"] },
      { npc: true, role: "同学", jp: "いいですね。どこで会いますか。", zh: "在哪儿见？" },
      { jp: "駅の前で会いましょう。", zh: "车站前见吧。", keys: ["会いましょう"] },
    ]],
    [7, "在商店问价格", "🛒", "店", "买相机。", [
      { tier: 1, label: "购物" },
      { npc: true, role: "店员", jp: "いらっしゃいませ。", zh: "欢迎。" },
      { jp: "すみません、このカメラはいくらですか。", zh: "这相机多少钱？", keys: ["いくら"] },
      { npc: true, role: "店员", jp: "三万円です。", zh: "三万日元。" },
      { jp: "少し高いですね。", zh: "有点贵。", keys: ["高い"] },
      { npc: true, role: "店员", jp: "もう少し安いのもあります。", zh: "也有便宜一点的。" },
    ]],
    [8, "昨天没学习", "📖", "家", "老师问昨天情况。", [
      { tier: 1, label: "过去" },
      { npc: true, role: "老师", jp: "昨日勉強しましたか。", zh: "昨天学了吗？" },
      { jp: "いいえ、勉強しませんでした。", zh: "没有。", keys: ["しませんでした"] },
      { npc: true, role: "老师", jp: "テレビを見ましたか。", zh: "看电视了吗？" },
      { jp: "はい、少し見ました。", zh: "看了一点。", keys: ["見ました"] },
      { npc: true, role: "老师", jp: "今日は頑張ってください。", zh: "今天要加油。" },
      { jp: "はい、頑張ります。", zh: "好的。", keys: ["頑張り"] },
    ]],
    [9, "那是谁", "👤", "教室", "看照片问是谁。", [
      { tier: 1, label: "介绍" },
      { npc: true, role: "朋友", jp: "あの人はだれですか。", zh: "那个人是谁？" },
      { jp: "あの人は田中さんです。先生です。", zh: "是田中老师。", keys: ["だれ"] },
      { npc: true, role: "朋友", jp: "隣の人はだれですか。", zh: "旁边是谁？" },
      { jp: "森さんです。会社員です。", zh: "森先生，公司职员。", keys: ["会社員"] },
    ]],
    [10, "在公园散步", "🌳", "公園", "周末在公园。", [
      { tier: 1, label: "邀请" },
      { npc: true, role: "朋友", jp: "今日は天気がいいですね。", zh: "天气真好。" },
      { jp: "はい、公園で散歩しましょう。", zh: "在公园散步吧。", keys: ["散歩"] },
      { npc: true, role: "朋友", jp: "コーヒーを飲みませんか。", zh: "喝咖啡吗？" },
      { jp: "いいですね。", zh: "好啊。", keys: [] },
    ]],
    [11, "用日语说话", "🗣️", "教室", "语言教室。", [
      { tier: 1, label: "课堂" },
      { npc: true, role: "老师", jp: "日本語で話してください。", zh: "请用日语说。" },
      { jp: "はい、日本語で話します。", zh: "好的。", keys: ["日本語"] },
      { npc: true, role: "老师", jp: "もう一度言ってください。", zh: "请再说一遍。" },
      { jp: "はい、もう一度言います。", zh: "好的，再说一遍。", keys: ["もう一度"] },
    ]],
    [12, "谁更年轻", "⚖️", "办公室", "比较年龄。", [
      { tier: 1, label: "比较" },
      { npc: true, role: "同事", jp: "李さんと王さんとどちらが若いですか。", zh: "谁更年轻？" },
      { jp: "李さんは王さんより若いです。", zh: "小李更年轻。", keys: ["より"] },
      { npc: true, role: "同事", jp: "どちらが背が高いですか。", zh: "谁更高？" },
      { jp: "王さんのほうが高いです。", zh: "小王更高。", keys: ["高い"] },
    ]],
    [13, "给朋友写信", "✉️", "家", "写完信。", [
      { tier: 1, label: "进行" },
      { npc: true, role: "妈妈", jp: "何をしていますか。", zh: "在做什么？" },
      { jp: "友達に手紙を書いています。", zh: "给朋友写信。", keys: ["書いて"] },
      { npc: true, role: "妈妈", jp: "中国の友達ですか。", zh: "中国朋友吗？" },
      { jp: "はい、北京の友達です。", zh: "是的，北京的朋友。", keys: ["友達"] },
    ]],
    [15, "可以拍照吗", "📷", "博物館", "在博物馆。", [
      { tier: 1, label: "许可" },
      { npc: true, role: "游客", jp: "すみません、ここで写真を撮ってもいいですか。", zh: "可以拍照吗？" },
      { jp: "はい、撮ってもいいですよ。", zh: "可以哦。", keys: ["撮って"] },
      { npc: true, role: "游客", jp: "フラッシュはだめですか。", zh: "不能闪光吗？" },
      { jp: "はい、フラッシュは使わないでください。", zh: "请不要用闪光。", keys: ["使わない"] },
    ]],
    [17, "一起看电影", "🎬", "学校", "邀请同学。", [
      { tier: 1, label: "邀请" },
      { npc: true, role: "李", jp: "今度の日曜日、映画を見ませんか。", zh: "下星期天看电影好吗？" },
      { jp: "いいですね。一緒に行きましょう。", zh: "好啊，一起去。", keys: ["一緒"] },
      { npc: true, role: "李", jp: "何時に会いますか。", zh: "几点见？" },
      { jp: "十時に駅で会いましょう。", zh: "十点车站见。", keys: ["十時"] },
    ]],
    [19, "正在用电脑", "💻", "教室", "问在做什么。", [
      { tier: 1, label: "进行" },
      { npc: true, role: "老师", jp: "今何をしていますか。", zh: "现在在做什么？" },
      { jp: "パソコンを使っています。", zh: "在用电脑。", keys: ["使って"] },
      { npc: true, role: "老师", jp: "宿題ですか。", zh: "是作业吗？" },
      { jp: "はい、レポートを書いています。", zh: "在写报告。", keys: ["書いて"] },
    ]],
    [20, "会说日语", "🎌", "面试", "简单面试。", [
      { tier: 1, label: "能力" },
      { npc: true, role: "面试官", jp: "日本語が話せますか。", zh: "会说日语吗？" },
      { jp: "はい、少し話せます。", zh: "会一点。", keys: ["話せます"] },
      { npc: true, role: "面试官", jp: "読みますか。", zh: "会读吗？" },
      { jp: "はい、簡単な文章なら読めます。", zh: "简单文章可以。", keys: ["読めます"] },
    ]],
    [21, "下雨就不去", "🌧️", "家", "商量明天。", [
      { tier: 1, label: "条件" },
      { npc: true, role: "朋友", jp: "明日ピクニックに行きますか。", zh: "明天去野餐吗？" },
      { jp: "雨が降ったら、行きません。", zh: "下雨就不去。", keys: ["降ったら"] },
      { npc: true, role: "朋友", jp: "天気予報はどうですか。", zh: "天气预报呢？" },
      { jp: "午後は晴れるそうです。", zh: "听説下午会晴。", keys: ["晴れる"] },
    ]],
    [22, "请再说一遍", "🔁", "教室", "没听清。", [
      { tier: 1, label: "课堂" },
      { npc: true, role: "学生", jp: "すみません、もう一度言ってください。", zh: "请再说一遍。", keys: ["もう一度"] },
      { npc: true, role: "老师", jp: "いいですよ。よく聞いてください。", zh: "好的，请好好听。" },
      { jp: "はい、わかりました。", zh: "好的，明白了。", keys: ["わかり"] },
    ]],
    [23, "听说明天有雨", "☁️", "办公室", "聊天气。", [
      { tier: 1, label: "传闻" },
      { npc: true, role: "同事", jp: "明日は雨だそうです。", zh: "听说明天有雨。" },
      { jp: "そうですか。傘を持って行きます。", zh: "那我带伞去。", keys: ["傘"] },
      { npc: true, role: "同事", jp: "風が強いそうですよ。", zh: "听説风很大。" },
      { jp: "じゃあ、コートも着ます。", zh: "那也穿外套。", keys: ["着ます"] },
    ]],
    [24, "学期末回顾", "🎓", "教室", "学期结束。", [
      { tier: 3, label: "总结", mood: "感动" },
      { npc: true, role: "老师", jp: "三か月、お疲れさまでした。", zh: "三个月辛苦了。" },
      { jp: "ありがとうございました。これからも頑張ります。", zh: "谢谢，会继续努力。", keys: ["頑張り"] },
      { npc: true, role: "老师", jp: "日本語の勉強、続けてくださいね。", zh: "请继续学日语。" },
      { jp: "はい、続けます。先生のおかげです。", zh: "好的，多亏了老师。", keys: ["続けます"] },
      { npc: true, role: "老师", jp: "夏休みも少し復習してください。", zh: "暑假也复习一下。" },
      { jp: "はい、毎日少し練習します。", zh: "好，每天练一点。", keys: ["練習"] },
    ]],
  ];
  extras.forEach(([lid, title, emoji, place, scene, turns]) => {
    if (!done.has(lid)) LESSON_DIALOGUES.push(mkDialogue(lid, `l${lid}-d1`, title, emoji, place, scene, turns));
  });
})();

function getLessonDialogues(lessonId) {
  const lid = Number(lessonId);
  return LESSON_DIALOGUES.filter((d) => d.lessonId === lid).sort(
    (a, b) => (CONVO_KIND_ORDER[a.kind] ?? 9) - (CONVO_KIND_ORDER[b.kind] ?? 9)
  );
}

function getLessonDialogue(id) {
  const d = LESSON_DIALOGUES.find((x) => x.id === id) || null;
  if (d?.kind === "branch" && !d._expanded) {
    return { ...d, steps: [...d.steps] };
  }
  return d;
}

function resolveBranchChoice(dialogue, route) {
  if (dialogue?.kind !== "branch" || !dialogue.segments?.[route]) return dialogue;
  return expandBranchDialogue(dialogue, route);
}
