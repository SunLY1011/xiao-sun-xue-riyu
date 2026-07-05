/** ボタン押下の見た目フィードバック（タッチ・クリック） */
(function () {
  function setPressed(el, on) {
    if (!el || el.disabled) return;
    el.classList.toggle("is-pressed", on);
  }

  document.addEventListener(
    "pointerdown",
    (e) => {
      const btn = e.target.closest("button, .gate-tab, .qz-opt, .gn-link");
      if (btn) setPressed(btn, true);
    },
    true
  );

  document.addEventListener(
    "pointerup",
    () => {
      document.querySelectorAll(".is-pressed").forEach((el) => setPressed(el, false));
    },
    true
  );

  document.addEventListener(
    "pointercancel",
    () => {
      document.querySelectorAll(".is-pressed").forEach((el) => setPressed(el, false));
    },
    true
  );
})();
