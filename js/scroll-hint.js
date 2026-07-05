/** 各关固定高度滚动区：顶部进度 + 底部「还有内容」+ 可见滚动条 */
const ScrollHint = (() => {
  const binds = new WeakMap();

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function createShell(body, gateKey) {
    body.innerHTML = `
      <div class="gate-scroll-shell" data-gate="${escapeHtml(String(gateKey))}">
        <p class="gate-scroll-progress" role="status" aria-live="polite"></p>
        <div class="gate-scroll-region" tabindex="0"></div>
        <p class="gate-scroll-more" hidden aria-hidden="true"></p>
      </div>`;
    const shell = body.querySelector(".gate-scroll-shell");
    return {
      shell,
      region: shell.querySelector(".gate-scroll-region"),
      progress: shell.querySelector(".gate-scroll-progress"),
      more: shell.querySelector(".gate-scroll-more"),
    };
  }

  function visibleItemIndex(region, selector) {
    const items = [...region.querySelectorAll(selector)];
    if (!items.length) return 0;
    const anchor = region.getBoundingClientRect().top + region.clientHeight * 0.32;
    let idx = 1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].getBoundingClientRect().top <= anchor) idx = i + 1;
    }
    return Math.min(idx, items.length);
  }

  function remainingBelow(region) {
    const sh = region.scrollHeight;
    const ch = region.clientHeight;
    const st = region.scrollTop;
    if (sh <= ch + 8) return 0;
    const ratio = (st + ch) / sh;
    const total = Number(region.dataset.scrollTotal) || 0;
    if (total > 0) {
      const seen = visibleItemIndex(region, region.dataset.scrollItemSelector || "");
      return Math.max(0, total - seen);
    }
    return ratio < 0.92 ? 1 : 0;
  }

  function update(host, cfg) {
    const { region, progress, more } = host;
    if (!region || !progress) return;

    const total = cfg.getTotal ? cfg.getTotal(region) : Number(region.dataset.scrollTotal) || 0;
    const cur = cfg.itemSelector
      ? visibleItemIndex(region, cfg.itemSelector)
      : total;
    const fits = region.scrollHeight <= region.clientHeight + 12;
    const atBottom = region.scrollTop + region.clientHeight >= region.scrollHeight - 16;

    progress.textContent = cfg.formatProgress
      ? cfg.formatProgress({ cur, total, region, fits })
      : "";

    if (!more) return;
    if (fits || atBottom) {
      more.hidden = true;
      more.setAttribute("aria-hidden", "true");
      return;
    }
    const left = cfg.formatMore
      ? cfg.formatMore({ cur, total, region })
      : total > cur
        ? `↓ あと ${total - cur} 件`
        : "↓ 下へスクロール";
    more.textContent = left;
    more.hidden = false;
    more.setAttribute("aria-hidden", "false");
  }

  function attach(host, cfg) {
    if (!host?.region) return;
    const old = binds.get(host.region);
    if (old) {
      old.ro?.disconnect();
      old.mo?.disconnect();
      host.region.removeEventListener("scroll", old.onScroll);
    }

    const onScroll = () => update(host, cfg);
    host.region.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => update(host, cfg));
    ro.observe(host.region);
    let mo = null;
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(() => update(host, cfg));
      mo.observe(host.region, { childList: true, subtree: true });
    }
    binds.set(host.region, { onScroll, ro, mo });
    requestAnimationFrame(() => update(host, cfg));
    setTimeout(() => update(host, cfg), 120);
    setTimeout(() => update(host, cfg), 400);
  }

  function scrollRegionTop(body) {
    body?.querySelector(".gate-scroll-region")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const gateConfigs = {
    0: {
      itemSelector: ".vf-word-row",
      getTotal: (r) => r.querySelectorAll(".vf-word-row").length,
      formatProgress: ({ cur, total, fits }) =>
        fits
          ? `単語 · 全 ${total} 語（この画面に収まります）`
          : `単語 · ${cur} / ${total} 語 · 下にスクロール`,
      formatMore: ({ cur, total }) =>
        total > cur ? `↓ あと ${total - cur} 語` : "↓ 下へスクロール",
    },
    1: {
      itemSelector: ".gn-card",
      getTotal: (r) => r.querySelectorAll(".gn-card").length,
      formatProgress: ({ cur, total, fits }) =>
        fits
          ? `文法 · 全 ${total} 枚`
          : `文法 · 約 ${cur} / ${total} 枚 · 下にスクロール`,
      formatMore: ({ cur, total }) =>
        total > cur ? `↓ あと ${total - cur} 枚` : "↓ 下へスクロール",
    },
    2: {
      itemSelector: ".dg-reply-block",
      getTotal: (r) => r.querySelectorAll(".dg-reply-block").length,
      formatProgress: ({ cur, total, region, fits }) => {
        const tabs = region.querySelectorAll(".dg-dtab");
        const active = region.querySelector(".dg-dtab.active");
        const scene =
          tabs.length > 1 && active
            ? `シーン ${(Number(active.dataset.didx) || 0) + 1} / ${tabs.length}`
            : "";
        const base = total
          ? fits
            ? `会話 · 返事 ${total} 種`
            : `会話 · 返事 ${Math.min(cur, total)} / ${total} 種`
          : "会話";
        return scene ? `${base} · ${scene}` : base;
      },
      formatMore: ({ cur, total }) =>
        total > cur ? `↓ あと ${total - cur} 種の返事` : "↓ 下へスクロール",
    },
    3: {
      itemSelector: ".qz-question-block",
      getTotal: (r) => r.querySelectorAll(".qz-question-block").length || 0,
      formatProgress: ({ total, fits }) => {
        if (!total) return "テスト · 問題に答える";
        return fits ? `テスト · 全 ${total} 問` : `テスト · 下に ${total} 問`;
      },
      formatMore: () => "↓ 次の問題へ",
    },
  };

  function setupForGate(body, gateKey) {
    const host = createShell(body, gateKey);
    const cfg = gateConfigs[gateKey] || gateConfigs[0];
    attach(host, cfg);
    return host;
  }

  return { createShell, attach, setupForGate, scrollRegionTop, update };
})();
