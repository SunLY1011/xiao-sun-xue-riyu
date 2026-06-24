const Chat = (() => {
  let state = null;

  function setState(s) {
    state = s;
  }

  function getHistory(lessonId) {
    const key = String(lessonId);
    if (!state.chatHistory[key]) {
      state.chatHistory[key] = [];
    }
    return state.chatHistory[key];
  }

  function appendMsg(lessonId, role, content) {
    const h = getHistory(lessonId);
    h.push({ role, content, at: Date.now() });
    if (h.length > 40) state.chatHistory[String(lessonId)] = h.slice(-40);
    saveState(state);
  }

  function renderMessages(container, lessonId) {
    const h = getHistory(lessonId);
    container.innerHTML = "";
    if (!h.length) {
      const lesson = getLesson(lessonId);
      const sys = document.createElement("div");
      sys.className = "msg system";
      sys.textContent = `已切换到${lesson.title}（${lesson.theme}）。用日语聊聊本课话题吧。`;
      container.appendChild(sys);
      return;
    }
    h.forEach((m) => {
      const el = document.createElement("div");
      el.className = `msg ${m.role === "user" ? "user" : "bot"}`;
      el.textContent = m.content;
      container.appendChild(el);
    });
    container.scrollTop = container.scrollHeight;
  }

  async function callApi(messages, lesson) {
    const { apiBase, apiKey, apiModel } = state.settings;
    if (!apiKey) return null;

    const base = (apiBase || "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是日语教师。学生学习日语初级上册第${lesson.id}课「${lesson.theme}」。
课文标题：${lesson.headline || ""}
${(lesson.grammar || []).map((g) => g.title).join("、")}
用简单日语对话，附简短中文。温和纠错。不照搬教材长文。`,
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "（无回复）";
  }

  function offlineReply(userText, lesson) {
    const tips = [
      `很好！继续用です／ます形说说「${lesson.theme}」相关的内容吧。`,
      "试着把句子说完整，例如：わたしは～です。",
      "注意助词は和が的区别，有问题可以继续问我。",
      "不错！能再用一句日语自我介绍吗？",
    ];
    if (/你好|您好|hi|hello/i.test(userText)) {
      return "こんにちは！今日は何を勉強しますか。\n（你好！今天想学什么？）";
    }
    if (/谢谢/.test(userText)) {
      return "どういたしまして。\n（不客气。）";
    }
    if (/不会|不懂|不明白/.test(userText)) {
      return `第${lesson.id}课重点是「${lesson.theme}」。可以先看课文例句，再模仿说一遍。`;
    }
    return tips[Math.floor(Math.random() * tips.length)] + "\n\n（离线模式：在「设置」填入 API Key 可启用 AI 对话）";
  }

  async function send(container, lessonId, userText) {
    const lesson = getLesson(lessonId);
    appendMsg(lessonId, "user", userText);
    renderMessages(container, lessonId);

    const typing = document.createElement("div");
    typing.className = "msg bot";
    typing.textContent = "…";
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;

    let reply;
    try {
      const history = getHistory(lessonId).filter((m) => m.role === "user" || m.role === "assistant");
      const apiMessages = history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
      reply = await callApi(apiMessages, lesson);
      if (!reply) reply = offlineReply(userText, lesson);
      else state.stats.chat = (state.stats.chat || 0) + 1;
    } catch (e) {
      reply = `连接失败：${e.message}\n\n已改用离线提示。\n${offlineReply(userText, lesson)}`;
    }

    typing.remove();
    appendMsg(lessonId, "assistant", reply);
    saveState(state);
    renderMessages(container, lessonId);
  }

  return { setState, renderMessages, send };
})();
