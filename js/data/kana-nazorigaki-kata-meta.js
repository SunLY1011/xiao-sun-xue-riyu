/** 片假名なぞりがき · 由 extract-nazorigaki-kata.py 从 PDF 解析 · 勿手改 */
const KANA_NAZORIGAKI_KATA_META = {
  "あ": {
    "kana": "ア",
    "hira": "あ",
    "page": 1,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30a2-panel.png",
      "trace": "assets/write-nazorigaki/kata/30a2-trace.png"
    },
    "examples": [
      "アイスクリーム"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "ア行",
    "rowPeers": [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ"
    ],
    "strokeCount": 1
  },
  "い": {
    "kana": "イ",
    "hira": "い",
    "page": 2,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30a4-panel.png",
      "trace": "assets/write-nazorigaki/kata/30a4-trace.png"
    },
    "examples": [
      "イヤリング"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ア行",
    "rowPeers": [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ"
    ],
    "strokeCount": 1
  },
  "う": {
    "kana": "ウ",
    "hira": "う",
    "page": 3,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30a6-panel.png",
      "trace": "assets/write-nazorigaki/kata/30a6-trace.png"
    },
    "examples": [
      "ウインナー"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ア行",
    "rowPeers": [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ"
    ],
    "strokeCount": 1
  },
  "え": {
    "kana": "エ",
    "hira": "え",
    "page": 4,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30a8-panel.png",
      "trace": "assets/write-nazorigaki/kata/30a8-trace.png"
    },
    "examples": [
      "エクレア",
      "エプロン"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "ア行",
    "rowPeers": [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ"
    ],
    "strokeCount": 1
  },
  "お": {
    "kana": "オ",
    "hira": "お",
    "page": 5,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30aa-panel.png",
      "trace": "assets/write-nazorigaki/kata/30aa-trace.png"
    },
    "examples": [
      "オートバイ",
      "オムライス"
    ],
    "techniques": [
      "とめる",
      "はらう",
      "はねる"
    ],
    "rowLabel": "ア行",
    "rowPeers": [
      "ア",
      "イ",
      "ウ",
      "エ",
      "オ"
    ],
    "strokeCount": 1
  },
  "か": {
    "kana": "カ",
    "hira": "か",
    "page": 6,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ab-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ab-trace.png"
    },
    "examples": [
      "カレンダー",
      "カスタネット"
    ],
    "techniques": [
      "はらう",
      "はねる"
    ],
    "rowLabel": "カ行",
    "rowPeers": [
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ"
    ],
    "strokeCount": 1
  },
  "き": {
    "kana": "キ",
    "hira": "き",
    "page": 7,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ad-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ad-trace.png"
    },
    "examples": [
      "キャベツ",
      "キウイフルーツ"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "カ行",
    "rowPeers": [
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ"
    ],
    "strokeCount": 1
  },
  "く": {
    "kana": "ク",
    "hira": "く",
    "page": 8,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30af-panel.png",
      "trace": "assets/write-nazorigaki/kata/30af-trace.png"
    },
    "examples": [
      "クレヨン",
      "クリスマス"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "カ行",
    "rowPeers": [
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ"
    ],
    "strokeCount": 1
  },
  "け": {
    "kana": "ケ",
    "hira": "け",
    "page": 9,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30b1-panel.png",
      "trace": "assets/write-nazorigaki/kata/30b1-trace.png"
    },
    "examples": [
      "ケーキ",
      "ケーブルカー"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "カ行",
    "rowPeers": [
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ"
    ],
    "strokeCount": 1
  },
  "こ": {
    "kana": "コ",
    "hira": "こ",
    "page": 10,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30b3-panel.png",
      "trace": "assets/write-nazorigaki/kata/30b3-trace.png"
    },
    "examples": [
      "コップ",
      "コック"
    ],
    "techniques": [],
    "rowLabel": "カ行",
    "rowPeers": [
      "カ",
      "キ",
      "ク",
      "ケ",
      "コ"
    ],
    "strokeCount": 1
  },
  "さ": {
    "kana": "サ",
    "hira": "さ",
    "page": 11,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30b5-panel.png",
      "trace": "assets/write-nazorigaki/kata/30b5-trace.png"
    },
    "examples": [
      "サイレン",
      "サンタクロース"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "サ行",
    "rowPeers": [
      "サ",
      "シ",
      "ス",
      "セ",
      "ソ"
    ],
    "strokeCount": 1
  },
  "し": {
    "kana": "シ",
    "hira": "し",
    "page": 12,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30b7-panel.png",
      "trace": "assets/write-nazorigaki/kata/30b7-trace.png"
    },
    "examples": [
      "シンバル",
      "シャツ"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "サ行",
    "rowPeers": [
      "サ",
      "シ",
      "ス",
      "セ",
      "ソ"
    ],
    "strokeCount": 1
  },
  "す": {
    "kana": "ス",
    "hira": "す",
    "page": 13,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30b9-panel.png",
      "trace": "assets/write-nazorigaki/kata/30b9-trace.png"
    },
    "examples": [
      "スプーン",
      "ストロー"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "サ行",
    "rowPeers": [
      "サ",
      "シ",
      "ス",
      "セ",
      "ソ"
    ],
    "strokeCount": 1
  },
  "せ": {
    "kana": "セ",
    "hira": "せ",
    "page": 14,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30bb-panel.png",
      "trace": "assets/write-nazorigaki/kata/30bb-trace.png"
    },
    "examples": [
      "セロハンテープ",
      "セーター"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "サ行",
    "rowPeers": [
      "サ",
      "シ",
      "ス",
      "セ",
      "ソ"
    ],
    "strokeCount": 1
  },
  "そ": {
    "kana": "ソ",
    "hira": "そ",
    "page": 15,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30bd-panel.png",
      "trace": "assets/write-nazorigaki/kata/30bd-trace.png"
    },
    "examples": [
      "ソックス",
      "ソフトクリーム"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "サ行",
    "rowPeers": [
      "サ",
      "シ",
      "ス",
      "セ",
      "ソ"
    ],
    "strokeCount": 1
  },
  "た": {
    "kana": "タ",
    "hira": "た",
    "page": 16,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30bf-panel.png",
      "trace": "assets/write-nazorigaki/kata/30bf-trace.png"
    },
    "examples": [
      "タオル",
      "タンバリン"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "タ行",
    "rowPeers": [
      "タ",
      "チ",
      "ツ",
      "テ",
      "ト"
    ],
    "strokeCount": 1
  },
  "ち": {
    "kana": "チ",
    "hira": "ち",
    "page": 17,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30c1-panel.png",
      "trace": "assets/write-nazorigaki/kata/30c1-trace.png"
    },
    "examples": [
      "チューリップ",
      "チョコレート"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "タ行",
    "rowPeers": [
      "タ",
      "チ",
      "ツ",
      "テ",
      "ト"
    ],
    "strokeCount": 1
  },
  "つ": {
    "kana": "ツ",
    "hira": "つ",
    "page": 18,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30c4-panel.png",
      "trace": "assets/write-nazorigaki/kata/30c4-trace.png"
    },
    "examples": [
      "ツナ",
      "ツキノワグマ"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "タ行",
    "rowPeers": [
      "タ",
      "チ",
      "ツ",
      "テ",
      "ト"
    ],
    "strokeCount": 1
  },
  "て": {
    "kana": "テ",
    "hira": "て",
    "page": 19,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30c6-panel.png",
      "trace": "assets/write-nazorigaki/kata/30c6-trace.png"
    },
    "examples": [
      "テント",
      "テーブル"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "タ行",
    "rowPeers": [
      "タ",
      "チ",
      "ツ",
      "テ",
      "ト"
    ],
    "strokeCount": 1
  },
  "と": {
    "kana": "ト",
    "hira": "と",
    "page": 20,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30c8-panel.png",
      "trace": "assets/write-nazorigaki/kata/30c8-trace.png"
    },
    "examples": [
      "トナカイ",
      "トライアングル"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "タ行",
    "rowPeers": [
      "タ",
      "チ",
      "ツ",
      "テ",
      "ト"
    ],
    "strokeCount": 1
  },
  "な": {
    "kana": "ナ",
    "hira": "な",
    "page": 21,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ca-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ca-trace.png"
    },
    "examples": [
      "ナイフ",
      "ナナホシテントウ"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ナ行",
    "rowPeers": [
      "ナ",
      "ニ",
      "ヌ",
      "ネ",
      "ノ"
    ],
    "strokeCount": 1
  },
  "に": {
    "kana": "ニ",
    "hira": "に",
    "page": 22,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30cb-panel.png",
      "trace": "assets/write-nazorigaki/kata/30cb-trace.png"
    },
    "examples": [
      "ニュース",
      "スニーカー"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "ナ行",
    "rowPeers": [
      "ナ",
      "ニ",
      "ヌ",
      "ネ",
      "ノ"
    ],
    "strokeCount": 1
  },
  "ぬ": {
    "kana": "ヌ",
    "hira": "ぬ",
    "page": 23,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30cc-panel.png",
      "trace": "assets/write-nazorigaki/kata/30cc-trace.png"
    },
    "examples": [
      "ヌー",
      "ヌードル"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ナ行",
    "rowPeers": [
      "ナ",
      "ニ",
      "ヌ",
      "ネ",
      "ノ"
    ],
    "strokeCount": 1
  },
  "ね": {
    "kana": "ネ",
    "hira": "ね",
    "page": 24,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30cd-panel.png",
      "trace": "assets/write-nazorigaki/kata/30cd-trace.png"
    },
    "examples": [
      "ネグリジェ",
      "ネクタイ"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ナ行",
    "rowPeers": [
      "ナ",
      "ニ",
      "ヌ",
      "ネ",
      "ノ"
    ],
    "strokeCount": 1
  },
  "の": {
    "kana": "ノ",
    "hira": "の",
    "page": 25,
    "source": "matome-50katakana-a-no.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ce-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ce-trace.png"
    },
    "examples": [
      "ノック",
      "トントン"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "ナ行",
    "rowPeers": [
      "ナ",
      "ニ",
      "ヌ",
      "ネ",
      "ノ"
    ],
    "strokeCount": 1
  },
  "は": {
    "kana": "ハ",
    "hira": "は",
    "page": 26,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30cf-panel.png",
      "trace": "assets/write-nazorigaki/kata/30cf-trace.png"
    },
    "examples": [
      "ハンバーガー",
      "ハンカチ"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ハ行",
    "rowPeers": [
      "ハ",
      "ヒ",
      "フ",
      "ヘ",
      "ホ"
    ],
    "strokeCount": 1
  },
  "ひ": {
    "kana": "ヒ",
    "hira": "ひ",
    "page": 27,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30d2-panel.png",
      "trace": "assets/write-nazorigaki/kata/30d2-trace.png"
    },
    "examples": [
      "ヒーター",
      "ヒーロー"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "ハ行",
    "rowPeers": [
      "ハ",
      "ヒ",
      "フ",
      "ヘ",
      "ホ"
    ],
    "strokeCount": 1
  },
  "ふ": {
    "kana": "フ",
    "hira": "ふ",
    "page": 28,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30d5-panel.png",
      "trace": "assets/write-nazorigaki/kata/30d5-trace.png"
    },
    "examples": [
      "フライパン",
      "フォーク"
    ],
    "techniques": [],
    "rowLabel": "ハ行",
    "rowPeers": [
      "ハ",
      "ヒ",
      "フ",
      "ヘ",
      "ホ"
    ],
    "strokeCount": 1
  },
  "へ": {
    "kana": "ヘ",
    "hira": "へ",
    "page": 29,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30d8-panel.png",
      "trace": "assets/write-nazorigaki/kata/30d8-trace.png"
    },
    "examples": [
      "ヘルメット",
      "ヘリコプター"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "ハ行",
    "rowPeers": [
      "ハ",
      "ヒ",
      "フ",
      "ヘ",
      "ホ"
    ],
    "strokeCount": 1
  },
  "ほ": {
    "kana": "ホ",
    "hira": "ほ",
    "page": 30,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30db-panel.png",
      "trace": "assets/write-nazorigaki/kata/30db-trace.png"
    },
    "examples": [
      "ホットケーキ",
      "ホチキス"
    ],
    "techniques": [
      "はねる"
    ],
    "rowLabel": "ハ行",
    "rowPeers": [
      "ハ",
      "ヒ",
      "フ",
      "ヘ",
      "ホ"
    ],
    "strokeCount": 1
  },
  "ま": {
    "kana": "マ",
    "hira": "ま",
    "page": 31,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30de-panel.png",
      "trace": "assets/write-nazorigaki/kata/30de-trace.png"
    },
    "examples": [
      "マラカス",
      "マフラー"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "マ行",
    "rowPeers": [
      "マ",
      "ミ",
      "ム",
      "メ",
      "モ"
    ],
    "strokeCount": 1
  },
  "み": {
    "kana": "ミ",
    "hira": "み",
    "page": 32,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30df-panel.png",
      "trace": "assets/write-nazorigaki/kata/30df-trace.png"
    },
    "examples": [
      "ミニスカート",
      "ミルク"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "マ行",
    "rowPeers": [
      "マ",
      "ミ",
      "ム",
      "メ",
      "モ"
    ],
    "strokeCount": 1
  },
  "む": {
    "kana": "ム",
    "hira": "む",
    "page": 33,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e0-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e0-trace.png"
    },
    "examples": [
      "ムササビ",
      "ガム"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "マ行",
    "rowPeers": [
      "マ",
      "ミ",
      "ム",
      "メ",
      "モ"
    ],
    "strokeCount": 1
  },
  "め": {
    "kana": "メ",
    "hira": "め",
    "page": 34,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e1-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e1-trace.png"
    },
    "examples": [
      "メジャー",
      "メロン"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "マ行",
    "rowPeers": [
      "マ",
      "ミ",
      "ム",
      "メ",
      "モ"
    ],
    "strokeCount": 1
  },
  "も": {
    "kana": "モ",
    "hira": "も",
    "page": 35,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e2-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e2-trace.png"
    },
    "examples": [
      "モップ",
      "モノレール"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "マ行",
    "rowPeers": [
      "マ",
      "ミ",
      "ム",
      "メ",
      "モ"
    ],
    "strokeCount": 1
  },
  "や": {
    "kana": "ヤ",
    "hira": "や",
    "page": 36,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e4-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e4-trace.png"
    },
    "examples": [
      "タイヤ",
      "ダイヤモンド"
    ],
    "techniques": [
      "とめる"
    ],
    "rowLabel": "ヤ行",
    "rowPeers": [
      "ヤ",
      "ユ",
      "ヨ"
    ],
    "strokeCount": 1
  },
  "ゆ": {
    "kana": "ユ",
    "hira": "ゆ",
    "page": 37,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e6-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e6-trace.png"
    },
    "examples": [
      "ユニフォーム",
      "ユーフォー"
    ],
    "techniques": [],
    "rowLabel": "ヤ行",
    "rowPeers": [
      "ヤ",
      "ユ",
      "ヨ"
    ],
    "strokeCount": 1
  },
  "よ": {
    "kana": "ヨ",
    "hira": "よ",
    "page": 38,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e8-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e8-trace.png"
    },
    "examples": [
      "ヨーヨー",
      "ヨット"
    ],
    "techniques": [],
    "rowLabel": "ヤ行",
    "rowPeers": [
      "ヤ",
      "ユ",
      "ヨ"
    ],
    "strokeCount": 1
  },
  "ら": {
    "kana": "ラ",
    "hira": "ら",
    "page": 39,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30e9-panel.png",
      "trace": "assets/write-nazorigaki/kata/30e9-trace.png"
    },
    "examples": [
      "ランドセル",
      "ライト"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ラ行",
    "rowPeers": [
      "ラ",
      "リ",
      "ル",
      "レ",
      "ロ"
    ],
    "strokeCount": 1
  },
  "り": {
    "kana": "リ",
    "hira": "り",
    "page": 40,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ea-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ea-trace.png"
    },
    "examples": [
      "リース",
      "リボン"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ラ行",
    "rowPeers": [
      "ラ",
      "リ",
      "ル",
      "レ",
      "ロ"
    ],
    "strokeCount": 1
  },
  "る": {
    "kana": "ル",
    "hira": "る",
    "page": 41,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30eb-panel.png",
      "trace": "assets/write-nazorigaki/kata/30eb-trace.png"
    },
    "examples": [
      "ルーペ",
      "ルーレット"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "ラ行",
    "rowPeers": [
      "ラ",
      "リ",
      "ル",
      "レ",
      "ロ"
    ],
    "strokeCount": 1
  },
  "れ": {
    "kana": "レ",
    "hira": "れ",
    "page": 42,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ec-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ec-trace.png"
    },
    "examples": [
      "レモン",
      "レタス"
    ],
    "techniques": [],
    "rowLabel": "ラ行",
    "rowPeers": [
      "ラ",
      "リ",
      "ル",
      "レ",
      "ロ"
    ],
    "strokeCount": 1
  },
  "ろ": {
    "kana": "ロ",
    "hira": "ろ",
    "page": 43,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ed-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ed-trace.png"
    },
    "examples": [
      "ロボット",
      "ロケット"
    ],
    "techniques": [],
    "rowLabel": "ラ行",
    "rowPeers": [
      "ラ",
      "リ",
      "ル",
      "レ",
      "ロ"
    ],
    "strokeCount": 1
  },
  "わ": {
    "kana": "ワ",
    "hira": "わ",
    "page": 44,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30ef-panel.png",
      "trace": "assets/write-nazorigaki/kata/30ef-trace.png"
    },
    "examples": [
      "ワイン",
      "ワンピース"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "ワ行",
    "rowPeers": [
      "ワ",
      "ヲ"
    ],
    "strokeCount": 1
  },
  "を": {
    "kana": "ヲ",
    "hira": "を",
    "page": 45,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30f2-panel.png",
      "trace": "assets/write-nazorigaki/kata/30f2-trace.png"
    },
    "examples": [
      "ワイウエヲ"
    ],
    "techniques": [
      "はらう"
    ],
    "rowLabel": "ワ行",
    "rowPeers": [
      "ワ",
      "ヲ"
    ],
    "strokeCount": 1
  },
  "ん": {
    "kana": "ン",
    "hira": "ん",
    "page": 46,
    "source": "matome-50katakana-ha-nn.pdf",
    "assets": {
      "panel": "assets/write-nazorigaki/kata/30f3-panel.png",
      "trace": "assets/write-nazorigaki/kata/30f3-trace.png"
    },
    "examples": [
      "パン",
      "カレンダー"
    ],
    "techniques": [
      "とめる",
      "はらう"
    ],
    "rowLabel": "ン",
    "rowPeers": [
      "ン"
    ],
    "strokeCount": 1
  }
};
