/**
 * 五十音单字朗读 · 书写 / 入門注音全景 / 点格提示 共用
 * 真源：js/data/intro-content.js · tts-cache/{key}.mp3（与 audit-tts-registry 对账）
 * 禁止为书写板块单独注册清音 MP3。
 */
const KanaSpeak = (function () {
  function payload(kana) {
    const k = String(kana || "").trim();
    return { jp: k, kana: k, ttsLine: k };
  }

  function ttsKey(kana) {
    if (typeof SpeechEngine === "undefined" || !SpeechEngine.primaryTtsKey) return "";
    return SpeechEngine.primaryTtsKey(payload(kana));
  }

  function btnHtml(kana, extraClass) {
    if (typeof SpeakUI === "undefined") return "";
    const cls = extraClass ? `btn-speak-icon ${extraClass}` : "btn-speak-icon";
    return SpeakUI.btnHtml(payload(kana), `class="${cls}" title="听"`);
  }

  function bindButtons(root, opts) {
    if (typeof SpeakUI === "undefined" || !root) return;
    SpeakUI.bind(root, opts);
  }

  return { payload, ttsKey, btnHtml, bindButtons };
})();
