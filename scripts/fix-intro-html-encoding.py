# -*- coding: utf-8 -*-
"""Rewrite intro.html as UTF-8 (avoids shell encoding corruption)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "intro.html"

CONTENT = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>00 入門 · 標日 あと学習</title>
  <link rel="stylesheet" href="css/app.css?v=74" />
  <link rel="stylesheet" href="css/mvp.css?v=74" />
</head>
<body class="mvp-body intro-body">
  <header class="top-bar">
    <a href="index.html?v=74" class="btn-back" style="text-decoration:none">← 標日 あと学習</a>
    <h1 style="font-size:16px;margin:0">00 入門</h1>
  </header>
  <main class="intro-page">
    <div class="mvp-hero intro-hero intro-hero--minimal">
      <h2>五十音能力全景</h2>
      <p class="intro-hero-sub jp">発音と文字</p>
      <p class="intro-hero-hint zh-annotation">点假名看提示 · 喇叭听音</p>
    </div>
    <div id="intro-root" class="intro-root"></div>
  </main>
  <script src="js/share-wechat.js?v=74"></script>
  <script src="js/speech-engine.js?v=74"></script>
  <script src="js/speak-ui.js?v=74"></script>
  <script src="js/shadow-speak.js?v=74"></script>
  <script src="js/sensei-tip-card.js?v=74"></script>
  <script src="js/data/intro-content.js?v=74"></script>
  <script src="js/data/intro-kana-tips.js?v=74"></script>
  <script src="js/intro-kana-tip.js?v=74"></script>
  <script src="js/intro-guide.js?v=74"></script>
</body>
</html>
"""

def main() -> int:
    OUT.write_text(CONTENT, encoding="utf-8", newline="\n")
    text = OUT.read_text(encoding="utf-8")
    for needle in ("五十音", "入門", "標日", "発音"):
        if needle not in text:
            raise SystemExit(f"[FAIL] missing {needle}")
    print(f"[OK] wrote {OUT} ({len(text)} bytes utf-8)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
