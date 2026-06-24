/** 自动生成：PRD 第1–12 / 21–24 課 · 勿手改（改 PRD 后重跑 generate-lessons-from-prd.py） */
const LESSONS_PRD_UNRELEASED_MVP = [
  {
    "lessonId": 1,
    "lessonTitle": "李さんは中国人です",
    "lessonTitleRuby": [],
    "theme": "自己紹介",
    "themeZh": "自我介绍",
    "grammarNodes": [
      {
        "id": "l1_wa_desu",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「AはBです」で「A＝B」を表します。日本語の文の基本です。「は」は話題、「です」は「だ」の丁寧形。",
        "example": "李さんは中国人です。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜は〜ではありません（否定）、〜は〜ですか（疑問）"
          }
        ],
        "tags": [
          "#基本文型",
          "#自己紹介"
        ]
      },
      {
        "id": "l1_no",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「AのB」で「Aに所属するB」「Aが持っているB」を表します。",
        "example": "わたしは北京大学の学生です。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜の（材料・性質・第2課補足）"
          }
        ],
        "tags": [
          "#所属",
          "#の"
        ]
      },
      {
        "id": "l1_desuka",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "文の最後に「か」をつけると質問になります。返事は「はい、そうです」か「いいえ、ちがいます」。",
        "example": "李さんは日本人ですか。→ いいえ、日本人ではありません。中国人です。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜ですね（確認・第2課）"
          }
        ],
        "tags": [
          "#疑問",
          "#返事"
        ]
      },
      {
        "id": "l1_self_intro",
        "title": "自己紹介の基本パターン",
        "titleZh": "自己紹介の基本パターン",
        "explanation": "初対面のあいさつでよく使うパターンをまとめます。\nはじめまして。わたしは○○です。△△の学生です。どうぞよろしくお願いします。\n「はじめまして」＋名前＋所属＋「よろしくお願いします」が基本セット。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #自己紹介 #挨拶"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l1_dialogue_main",
        "title": "初対面の自己紹介",
        "sceneEmoji": "📖",
        "scenePlace": "初対面の自己紹介",
        "opener": {
          "speaker": "A",
          "japanese": "はじめまして。わたしは山田です。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "はじめまして。わたしは李です。中国人です。どうぞよろしくお願いします。",
              "chinese": "",
              "noteJa": "基本形。名前＋国籍＋「よろしくお願いします」のフルセット。教科書通りのていねいな自己紹介。",
              "noteZh": "基本形。名前＋国籍＋「よろしくお願いします」のフルセット。教科書通りのていねいな自己紹介。"
            },
            {
              "japanese": "あ、山田さんですか。はじめまして。わたしは李です。北京大学の学生です。よろしくお願いします。",
              "chinese": "",
              "noteJa": "相手の名前を繰り返して確認する＋所属を追加する。相手に興味があることを伝えられる。",
              "noteZh": "相手の名前を繰り返して確認する＋所属を追加する。相手に興味があることを伝えられる。"
            },
            {
              "japanese": "はじめまして。李です。どうぞよろしく。",
              "chinese": "",
              "noteJa": "少しカジュアルな言い方。「お願いします」を省略した「どうぞよろしく」は友だち同士や学生同士でよく使う。教科書では習わないが実際の会話では頻出。",
              "noteZh": "少しカジュアルな言い方。「お願いします」を省略した「どうぞよろしく」は友だち同士や学生同士でよく使う。教科書では習わないが実際の会話では頻出。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l1_q1",
        "type": "choice",
        "question": "わたし＿＿＿学生です。",
        "options": [
          "は",
          "が",
          "の",
          "に"
        ],
        "answer": 0,
        "explanation": "主題は「は」。",
        "grammarNodeId": "l1_wa_desu"
      },
      {
        "id": "l1_q2",
        "type": "choice",
        "question": "李さん＿＿＿中国人ですか。",
        "options": [
          "は",
          "が",
          "の",
          "か"
        ],
        "answer": 0,
        "explanation": "疑問文でも「は」を使う。",
        "grammarNodeId": "l1_wa_desu"
      },
      {
        "id": "l1_q3",
        "type": "fill",
        "question": "わたしは東京大学＿＿＿学生です。",
        "answer": "の",
        "explanation": "所属を表す「の」。",
        "grammarNodeId": "l1_wa_desu"
      }
    ]
  },
  {
    "lessonId": 2,
    "lessonTitle": "これは本です",
    "lessonTitleRuby": [],
    "theme": "指示語",
    "themeZh": "指示事物",
    "grammarNodes": [
      {
        "id": "l2_kosoado",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "話し手からの距離で使い分けます。\nこれ：話し手に近いもの\nそれ：聞き手に近いもの\nあれ：どちらからも遠いもの\nどれ：わからないときに質問",
        "example": "これは本です。それはペンです。あれは何ですか。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：ここ・そこ・あそこ（第3課）、この・その・あの（第2課補足）"
          }
        ],
        "tags": [
          "#指示語",
          "#距離感"
        ]
      },
      {
        "id": "l2_desune",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「〜ですね」は相手に確認したり、共感を求めたりするときの言い方。",
        "example": "今日はいい天気ですね。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜ですか（質問）vs 〜ですね（確認）"
          }
        ],
        "tags": [
          "#確認",
          "#共感"
        ]
      },
      {
        "id": "l2_kono_vs_kore",
        "title": "「この・その・あの・どの」と「これ・それ・あれ・どれ」の違い",
        "titleZh": "「この・その・あの・どの」と「これ・それ・あれ・どれ」の違い",
        "explanation": "これ・それ・あれ・どれ：名詞の代わりに単独で使う。\nこの・その・あの・どの：後ろに名詞が来る。「この本」「その人」。",
        "example": "これはわたしの本です。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：こそあど"
          }
        ],
        "tags": [
          "#指示語",
          "#使い分け"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l2_dialogue_main",
        "title": "店で商品を尋ねる",
        "sceneEmoji": "📖",
        "scenePlace": "店で商品を尋ねる",
        "opener": {
          "speaker": "A",
          "japanese": "これは何ですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "それは日本のカメラです。とてもいいですよ。",
              "chinese": "",
              "noteJa": "基本形。「それ」を使うことで、相手のものを指している。「いいですよ」の「よ」は相手に情報を伝えるときの優しい言い方。",
              "noteZh": "基本形。「それ」を使うことで、相手のものを指している。「いいですよ」の「よ」は相手に情報を伝えるときの優しい言い方。"
            },
            {
              "japanese": "あ、それですか。それは最新のスマートフォンです。昨日発売されたばかりなんです。",
              "chinese": "",
              "noteJa": "「あ、それですか」で相手の質問を一度受けてから答える。「〜ばかり」で「たった今」を強調。会話が自然に広がる。",
              "noteZh": "「あ、それですか」で相手の質問を一度受けてから答える。「〜ばかり」で「たった今」を強調。会話が自然に広がる。"
            },
            {
              "japanese": "すみません、どれのことですか。…ああ、これですね。これは電子辞書です。",
              "chinese": "",
              "noteJa": "すぐに相手の指しているものがわからないときの返し方。「どれのことですか」で確認してから答える。",
              "noteZh": "すぐに相手の指しているものがわからないときの返し方。「どれのことですか」で確認してから答える。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l2_q1",
        "type": "choice",
        "question": "＿＿＿は本です。（話し手の近く）",
        "options": [
          "これ",
          "それ",
          "あれ",
          "どれ"
        ],
        "answer": 0,
        "explanation": "話し手に近いものは「これ」。",
        "grammarNodeId": "l2_kosoado"
      },
      {
        "id": "l2_q2",
        "type": "choice",
        "question": "今日はいい天気＿＿＿。",
        "options": [
          "ですか",
          "ですね",
          "です",
          "か"
        ],
        "answer": 1,
        "explanation": "共感・確認は「ですね」。",
        "grammarNodeId": "l2_kosoado"
      },
      {
        "id": "l2_q3",
        "type": "fill",
        "question": "＿＿＿本はわたしのです。（近くの本を指して）",
        "answer": "この",
        "explanation": "名詞の前につけるときは「この」。",
        "grammarNodeId": "l2_kosoado"
      }
    ]
  },
  {
    "lessonId": 3,
    "lessonTitle": "ここはデパートです",
    "lessonTitleRuby": [],
    "theme": "場所",
    "themeZh": "场所位置",
    "grammarNodes": [
      {
        "id": "l3_koko",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "場所を指す指示語です。距離感は「これ・それ・あれ」と同じ。\nここ：話し手の近く\nそこ：聞き手の近く\nあそこ：両方から遠い\nどこ：わからないとき",
        "example": "ここはデパートです。トイレはどこですか。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：こそあど（第2課）"
          }
        ],
        "tags": [
          "#場所",
          "#指示語"
        ]
      },
      {
        "id": "l3_floors",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "建物の階数の言い方。\n一階（いっかい）、二階（にかい）、三階（さんかい）…\n地下一階（ちかいっかい）",
        "example": "デパートは五階建てです。本屋は三階です。",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #数字 #場所"
          }
        ],
        "tags": []
      },
      {
        "id": "l3_asking_place",
        "title": "場所を聞くとき・教えるときの自然な言い方",
        "titleZh": "場所を聞くとき・教えるときの自然な言い方",
        "explanation": "すみません、〜はどこですか。（基本）\nあのう、〜を探しているんですが…（やわらかい）\n〜はどこにありますか。（丁寧）\n教えるとき：\nあそこです。（指さして）\n三階にあります。（階数で）\nあのエスカレーターを上がって右です。（道案内）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #場所案内 #日常会話"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l3_dialogue_main",
        "title": "場所を聞く",
        "sceneEmoji": "📖",
        "scenePlace": "場所を聞く",
        "opener": {
          "speaker": "A",
          "japanese": "すみません、トイレはどこですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "あちらです。あの階段の右側にあります。",
              "chinese": "",
              "noteJa": "基本形。方向を指し示して、目印と位置関係を簡潔に伝える。相手が迷わないように具体的に言うのが親切。",
              "noteZh": "基本形。方向を指し示して、目印と位置関係を簡潔に伝える。相手が迷わないように具体的に言うのが親切。"
            },
            {
              "japanese": "ええと…ちょっと待ってくださいね。（周りを見て）あ、あそこです。あの赤い看板のところです。",
              "chinese": "",
              "noteJa": "すぐにわからないときに「ええと」で間を持たせて、確認してから教える誠実な対応。色や看板などの目印をつけるとより親切。",
              "noteZh": "すぐにわからないときに「ええと」で間を持たせて、確認してから教える誠実な対応。色や看板などの目印をつけるとより親切。"
            },
            {
              "japanese": "すみません、わたしもここがよくわからなくて…。あちらの店員さんに聞いてもらえますか。",
              "chinese": "",
              "noteJa": "自分がわからないときに正直に伝え、代わりの案を出す。無理に答えないのも大人の対応。",
              "noteZh": "自分がわからないときに正直に伝え、代わりの案を出す。無理に答えないのも大人の対応。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l3_q1",
        "type": "choice",
        "question": "＿＿＿は図書館です。",
        "options": [
          "ここ",
          "この",
          "これ",
          "どの"
        ],
        "answer": 0,
        "explanation": "場所を指すときは「ここ」。",
        "grammarNodeId": "l3_koko"
      },
      {
        "id": "l3_q2",
        "type": "choice",
        "question": "本屋は＿＿＿にあります。",
        "options": [
          "三",
          "三個",
          "三冊",
          "三階"
        ],
        "answer": 3,
        "explanation": "階数は「〜階」。",
        "grammarNodeId": "l3_koko"
      },
      {
        "id": "l3_q3",
        "type": "fill",
        "question": "デパートはあのビルの＿＿＿です。",
        "answer": "となり（例）",
        "explanation": "「となり」は位置関係を表す名詞。他に「隣」「前」「後ろ」など。",
        "grammarNodeId": "l3_koko"
      }
    ]
  },
  {
    "lessonId": 4,
    "lessonTitle": "部屋に机といすがあります",
    "lessonTitleRuby": [],
    "theme": "存在",
    "themeZh": "存在与数量",
    "grammarNodes": [
      {
        "id": "l4_aru_iru",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "ものの存在を表します。\nある：無生物（机、本、木など）\nいる：生物（人、犬、猫など）",
        "example": "部屋に机があります。庭に犬がいます。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：助数詞＋ある（第13課）"
          }
        ],
        "tags": [
          "#存在",
          "#基本動詞"
        ]
      },
      {
        "id": "l4_ya_nado",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「〜と」が全部を列挙するのに対し、「〜や〜など」は一部を例として挙げる言い方。",
        "example": "机の上に本やペンなどがあります。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜と（全部列挙）vs 〜や（一部列挙）"
          }
        ],
        "tags": [
          "#列挙",
          "#例示"
        ]
      },
      {
        "id": "l4_positions",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "位置を表す名詞。\n上（うえ）、下（した）、前（まえ）、後ろ（うしろ）\n左（ひだり）、右（みぎ）、中（なか）、外（そと）",
        "example": "机の上に本があります。猫は椅子の下にいます。",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #位置 #空間表現"
          }
        ],
        "tags": []
      },
      {
        "id": "l4_aru_iru_exception",
        "title": "ある・いるの使い分けの例外",
        "titleZh": "ある・いるの使い分けの例外",
        "explanation": "基本的に無生物は「ある」、生物は「いる」ですが、以下のような例外もあります。\nロボットや人形：意思があると感じれば「いる」、単なる機械なら「ある」。\n幽霊：昔話では「ある」も使う（もののけがある）。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #存在 #例外"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l4_dialogue_main",
        "title": "部屋の様子を聞く",
        "sceneEmoji": "📖",
        "scenePlace": "部屋の様子を聞く",
        "opener": {
          "speaker": "A",
          "japanese": "部屋に何がありますか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "机と椅子とベッドがあります。机の上にパソコンや本などがあります。",
              "chinese": "",
              "noteJa": "基本形。存在するものを列挙して、さらに詳細を加えるパターン。「〜や〜など」で全部ではないことをやわらかく示す。",
              "noteZh": "基本形。存在するものを列挙して、さらに詳細を加えるパターン。「〜や〜など」で全部ではないことをやわらかく示す。"
            },
            {
              "japanese": "そうですね…まず入ってすぐ左に本棚があります。その隣に机、窓のそばにベッドがあります。壁には時計もかかっています。",
              "chinese": "",
              "noteJa": "空間の順序に沿って説明する。「まず」「その隣に」などのつなぎことばで整理して話すと聞きやすい。",
              "noteZh": "空間の順序に沿って説明する。「まず」「その隣に」などのつなぎことばで整理して話すと聞きやすい。"
            },
            {
              "japanese": "そんなに多くないです。机と椅子だけです。でも、窓から公園が見えて、とても気に入っています。",
              "chinese": "",
              "noteJa": "物が少ない場合でも、ポジティブな情報を付け加える。ただ「少ない」で終わらず、「でも」「気に入っている」と続けると会話が明るくなる。",
              "noteZh": "物が少ない場合でも、ポジティブな情報を付け加える。ただ「少ない」で終わらず、「でも」「気に入っている」と続けると会話が明るくなる。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l4_q1",
        "type": "choice",
        "question": "部屋に机＿＿＿あります。",
        "options": [
          "を",
          "が",
          "に",
          "で"
        ],
        "answer": 1,
        "explanation": "存在の主体は「が」。",
        "grammarNodeId": "l4_aru_iru"
      },
      {
        "id": "l4_q2",
        "type": "choice",
        "question": "庭に猫＿＿＿います。",
        "options": [
          "を",
          "が",
          "に",
          "で"
        ],
        "answer": 1,
        "explanation": "生物の存在は「が＋いる」。",
        "grammarNodeId": "l4_aru_iru"
      },
      {
        "id": "l4_q3",
        "type": "choice",
        "question": "机の上に本＿＿＿ペン＿＿＿があります。",
        "options": [
          "と・と",
          "や・など",
          "や・や"
        ],
        "answer": 3,
        "explanation": "全部列挙は「と」、一部列挙は「や〜など」。どちらも文法的に正しい。",
        "grammarNodeId": "l4_aru_iru"
      },
      {
        "id": "l4_q4",
        "type": "fill",
        "question": "猫は椅子の＿＿＿にいます。",
        "answer": "下（した）",
        "explanation": "位置を表す方位詞。",
        "grammarNodeId": "l4_aru_iru"
      }
    ]
  },
  {
    "lessonId": 5,
    "lessonTitle": "森さんは七時に起きます",
    "lessonTitleRuby": [],
    "theme": "時間",
    "themeZh": "时间与ます形",
    "grammarNodes": [
      {
        "id": "l5_masu",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動詞の丁寧な言い方。今すること・これからすることを表します。",
        "example": "森さんは七時に起きます。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：ます形→て形（第14課）、ます形→た形（第21課）"
          }
        ],
        "tags": [
          "#動詞",
          "#基本活用"
        ]
      },
      {
        "id": "l5_time",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "時刻の言い方。「〜時〜分」で表します。\n4時（よじ）、7時（しちじ）、9時（くじ）に注意。\n分：いっぷん（1分）、にふん（2分）、さんぷん（3分）…じゅっぷん（10分）",
        "example": "毎朝六時半に起きます。",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #時間 #数字"
          }
        ],
        "tags": [
          "#時間表現"
        ]
      },
      {
        "id": "l5_daily_routine",
        "title": "一日のスケジュール表現",
        "titleZh": "一日のスケジュール表現",
        "explanation": "一日の行動を順番に言う表現集。\n起きる→顔を洗う→朝ごはんを食べる→学校へ行く→勉強する→昼ごはんを食べる→帰る→宿題をする→晩ごはんを食べる→お風呂に入る→寝る",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #日常 #スケジュール"
          }
        ],
        "tags": []
      },
      {
        "id": "l5_kara_made",
        "title": "〜から〜まで（時間の範囲）",
        "titleZh": "〜から〜まで（時間の範囲）",
        "explanation": "時間の始まりと終わりを表します。\n九時から五時まで働きます。\n月曜日から金曜日まで学校があります。",
        "example": "",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜から〜まで（空間・第6課）"
          }
        ],
        "tags": [
          "#範囲",
          "#時間"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l5_dialogue_main",
        "title": "朝の習慣",
        "sceneEmoji": "📖",
        "scenePlace": "朝の習慣",
        "opener": {
          "speaker": "A",
          "japanese": "毎朝何時に起きますか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "六時半に起きます。それから、朝ごはんを食べて、七時半に家を出ます。",
              "chinese": "",
              "noteJa": "基本形。時間＋行動の順番をシンプルに説明。「それから」で次の行動につなぐ。",
              "noteZh": "基本形。時間＋行動の順番をシンプルに説明。「それから」で次の行動につなぐ。"
            },
            {
              "japanese": "普段は七時ごろですね。でも、昨日は遅くまで勉強していたので、今朝は八時まで寝ていました。",
              "chinese": "",
              "noteJa": "「普段は」で習慣を言い、「でも」で例外を付け加える。会話に変化が出て自然。過去のことと対比すると相手も質問しやすい。",
              "noteZh": "「普段は」で習慣を言い、「でも」で例外を付け加える。会話に変化が出て自然。過去のことと対比すると相手も質問しやすい。"
            },
            {
              "japanese": "私は朝が弱くて、いつもギリギリまで寝ています。七時半に起きて、何も食べずに家を出ます。",
              "chinese": "",
              "noteJa": "「朝が弱い」は自分をちょっと下げて話す言い方。「ギリギリまで」は口語でよく使う。正直に言うことで親しみやすくなる。",
              "noteZh": "「朝が弱い」は自分をちょっと下げて話す言い方。「ギリギリまで」は口語でよく使う。正直に言うことで親しみやすくなる。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l5_q1",
        "type": "choice",
        "question": "森さんは毎朝七時＿＿＿起きます。",
        "options": [
          "で",
          "に",
          "を",
          "が"
        ],
        "answer": 1,
        "explanation": "時刻には「に」をつける。",
        "grammarNodeId": "l5_masu"
      },
      {
        "id": "l5_q2",
        "type": "choice",
        "question": "九時＿＿＿五時＿＿＿働きます。",
        "options": [
          "から・まで",
          "に・に",
          "で・で",
          "まで・から"
        ],
        "answer": 0,
        "explanation": "時間の範囲は「から〜まで」。",
        "grammarNodeId": "l5_masu"
      },
      {
        "id": "l5_q3",
        "type": "fill",
        "question": "毎日十一時＿＿＿寝ます。",
        "answer": "に",
        "explanation": "動作の時点を表す「に」。",
        "grammarNodeId": "l5_masu"
      }
    ]
  },
  {
    "lessonId": 6,
    "lessonTitle": "吉田さんは来月中国へ行きます",
    "lessonTitleRuby": [],
    "theme": "移動",
    "themeZh": "移动与方向",
    "grammarNodes": [
      {
        "id": "l6_e",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "移動の方向・目的地を表す助詞。「に」と似ているが、「へ」は方向性が強い。",
        "example": "吉田さんは来月中国へ行きます。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜に（到着点）vs 〜へ（方向）"
          },
          {
            "type": "extension",
            "label": "🔗 後：〜から〜まで（空間）"
          }
        ],
        "tags": [
          "#移動",
          "#方向"
        ]
      },
      {
        "id": "l6_kara_made_space",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "空間の起点と終点を表します。",
        "example": "家から駅まで歩いて十分です。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：〜から〜まで（時間・第5課）"
          }
        ],
        "tags": [
          "#範囲",
          "#空間"
        ]
      },
      {
        "id": "l6_transportation",
        "title": "交通手段の言い方",
        "titleZh": "交通手段の言い方",
        "explanation": "移動の手段を表す「で」。\n電車で行きます。\nバスで来ました。\n歩いて帰ります。（歩くときは「で」を使わない。注意！）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #交通 #手段"
          }
        ],
        "tags": []
      },
      {
        "id": "l6_invitation",
        "title": "旅行の誘い方と返事",
        "titleZh": "旅行の誘い方と返事",
        "explanation": "誘う：一緒に〜に行きませんか。\nOK：いいですね。行きましょう。\n断る：すみません、ちょっと…（最後まで言わないのがコツ）",
        "example": "",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜ましょうか（第14課）"
          }
        ],
        "tags": [
          "#誘い",
          "#提案"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l6_dialogue_main",
        "title": "旅行の計画",
        "sceneEmoji": "📖",
        "scenePlace": "旅行の計画",
        "opener": {
          "speaker": "A",
          "japanese": "今度の休みにどこかへ行きますか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "はい、京都へ行く予定です。新幹線で行きます。",
              "chinese": "",
              "noteJa": "基本形。目的地＋交通手段を簡潔に答える。「予定です」で計画を伝える。",
              "noteZh": "基本形。目的地＋交通手段を簡潔に答える。「予定です」で計画を伝える。"
            },
            {
              "japanese": "そうですね、まだ決めていませんが、温泉に行きたいです。箱根か草津がいいなと思っています。",
              "chinese": "",
              "noteJa": "決まっていないときの返し方。「まだ決めていません」と正直に言いつつ、希望を伝える。「〜がいいな」は考え中の気持ち。",
              "noteZh": "決まっていないときの返し方。「まだ決めていません」と正直に言いつつ、希望を伝える。「〜がいいな」は考え中の気持ち。"
            },
            {
              "japanese": "友だちと一緒に韓国へ行くかもしれません。まだ航空券を探しているところです。",
              "chinese": "",
              "noteJa": "「かもしれません」で不確定な予定をやわらかく伝える。「〜ところです」で今の段階を説明すると自然。",
              "noteZh": "「かもしれません」で不確定な予定をやわらかく伝える。「〜ところです」で今の段階を説明すると自然。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l6_q1",
        "type": "choice",
        "question": "来月、日本＿＿＿行きます。",
        "options": [
          "を",
          "が",
          "へ",
          "で"
        ],
        "answer": 2,
        "explanation": "移動の方向は「へ」。",
        "grammarNodeId": "l6_e"
      },
      {
        "id": "l6_q2",
        "type": "choice",
        "question": "家＿＿＿駅＿＿＿バスで行きます。",
        "options": [
          "から・まで",
          "へ・へ",
          "に・に",
          "から・へ"
        ],
        "answer": 0,
        "explanation": "空間の起点と終点は「から〜まで」。",
        "grammarNodeId": "l6_e"
      },
      {
        "id": "l6_q3",
        "type": "fill",
        "question": "毎日、電車＿＿＿会社へ行きます。",
        "answer": "で",
        "explanation": "交通手段は「で」。",
        "grammarNodeId": "l6_e"
      }
    ]
  },
  {
    "lessonId": 7,
    "lessonTitle": "李さんは毎日コーヒーを飲みます",
    "lessonTitleRuby": [],
    "theme": "対象",
    "themeZh": "对象与频率",
    "grammarNodes": [
      {
        "id": "l7_wo",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動作の対象を示す助詞。他動詞と一緒に使う。",
        "example": "李さんは毎日コーヒーを飲みます。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜を（対象）vs 〜を（移動・第14課補足）"
          }
        ],
        "tags": [
          "#対象",
          "#助詞"
        ]
      },
      {
        "id": "l7_frequency",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動作の頻度を表す副詞。\nいつも（100%）、よく（80%）、ときどき（50%）、あまり（20%）、ぜんぜん（0%）",
        "example": "わたしはときどき映画を見ます。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：あまり〜ない（第9課）"
          }
        ],
        "tags": [
          "#頻度",
          "#副詞"
        ]
      },
      {
        "id": "l7_ordering",
        "title": "飲食店での注文表現",
        "titleZh": "飲食店での注文表現",
        "explanation": "レストランやカフェでの注文のしかた。\nコーヒーをお願いします。\nコーヒーにします。\nコーヒーください。（カジュアル）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #飲食 #注文"
          }
        ],
        "tags": []
      },
      {
        "id": "l7_invitation_detail",
        "title": "「〜ませんか」と「〜ましょう」の使い分け",
        "titleZh": "「〜ませんか」と「〜ましょう」の使い分け",
        "explanation": "〜ませんか：相手の意思を聞く（一緒に映画を見ませんか）\n〜ましょう：自分も含めて提案（一緒に映画を見ましょう）\n「ませんか」の方が相手に選択肢を与えるので丁寧。",
        "example": "",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：誘いの表現（第6課補足）"
          },
          {
            "type": "extension",
            "label": "🔗 後：〜ましょうか（第14課）"
          }
        ],
        "tags": [
          "#勧誘",
          "#提案"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l7_dialogue_main",
        "title": "カフェで注文",
        "sceneEmoji": "📖",
        "scenePlace": "カフェで注文",
        "opener": {
          "speaker": "A",
          "japanese": "ご注文はお決まりですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "はい、コーヒーをお願いします。ホットで。",
              "chinese": "",
              "noteJa": "基本形。丁寧な注文の仕方。「ホットで」のように温度やサイズを付け加えるとスムーズ。",
              "noteZh": "基本形。丁寧な注文の仕方。「ホットで」のように温度やサイズを付け加えるとスムーズ。"
            },
            {
              "japanese": "ええと…そうですね。アイスカフェラテにします。Mサイズで。",
              "chinese": "",
              "noteJa": "迷ったときの間の取り方。「ええと」「そうですね」で考えていることを伝えられる。「〜にします」は決めたことを伝える定番表現。",
              "noteZh": "迷ったときの間の取り方。「ええと」「そうですね」で考えていることを伝えられる。「〜にします」は決めたことを伝える定番表現。"
            },
            {
              "japanese": "まだちょっと決めていなくて…。おすすめはどれですか。",
              "chinese": "",
              "noteJa": "決まっていないときは無理に急がず、店員さんにおすすめを聞く。これも自然な会話のパターン。",
              "noteZh": "決まっていないときは無理に急がず、店員さんにおすすめを聞く。これも自然な会話のパターン。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l7_q1",
        "type": "choice",
        "question": "毎朝、牛乳＿＿＿飲みます。",
        "options": [
          "を",
          "が",
          "に",
          "で"
        ],
        "answer": 0,
        "explanation": "飲む対象は「を」。",
        "grammarNodeId": "l7_wo"
      },
      {
        "id": "l7_q2",
        "type": "choice",
        "question": "わたしは＿＿＿映画を見ます。（週に1回くらい）",
        "options": [
          "いつも",
          "よく",
          "ときどき",
          "あまり"
        ],
        "answer": 2,
        "explanation": "週1回なら頻度は「ときどき」。",
        "grammarNodeId": "l7_wo"
      },
      {
        "id": "l7_q3",
        "type": "choice",
        "question": "一緒に映画を見＿＿＿。",
        "options": [
          "ます",
          "ませんか",
          "ました",
          "ない"
        ],
        "answer": 1,
        "explanation": "誘うときは「〜ませんか」。",
        "grammarNodeId": "l7_wo"
      }
    ]
  },
  {
    "lessonId": 8,
    "lessonTitle": "李さんは日本語で手紙を書きます",
    "lessonTitleRuby": [],
    "theme": "手段",
    "themeZh": "手段与授受",
    "grammarNodes": [
      {
        "id": "l8_de_method",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動作の手段や方法を表す「で」。",
        "example": "李さんは日本語で手紙を書きます。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜で（手段）vs 〜で（場所・第3課）vs 〜で（原因・第16課）"
          }
        ],
        "tags": [
          "#手段",
          "#方法"
        ]
      },
      {
        "id": "l8_ageru_morau",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "あげる：自分から相手に与える（わたしは友だちにプレゼントをあげました）\nもらう：自分が相手から受け取る（わたしは友だちからプレゼントをもらいました）\n注意：「あげる」は相手に恩着せがましく聞こえることがあるので、直接「あげます」と言うのは避けることも。",
        "example": "",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜てあげる・〜てもらう（第24課）"
          }
        ],
        "tags": [
          "#授受",
          "#あげるもらう"
        ]
      },
      {
        "id": "l8_gift",
        "title": "プレゼントを渡すとき・受け取るとき",
        "titleZh": "プレゼントを渡すとき・受け取るとき",
        "explanation": "渡す：これ、つまらないものですが…（謙遜の決まり文句）\n受け取る：ありがとうございます。開けてもいいですか。\n友だち同士：これ、プレゼント！気に入ってくれるといいな。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #プレゼント #マナー"
          }
        ],
        "tags": []
      },
      {
        "id": "l8_de_vs_tsukatte",
        "title": "手段の「で」と「を使って」",
        "titleZh": "手段の「で」と「を使って」",
        "explanation": "箸で食べます。（で＝手段）\n箸を使って食べます。（使って＝より具体的・説明的）\n日常会話では「で」の方が自然で簡潔。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #手段 #言い換え"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l8_dialogue_main",
        "title": "プレゼントを渡す",
        "sceneEmoji": "📖",
        "scenePlace": "プレゼントを渡す",
        "opener": {
          "speaker": "A",
          "japanese": "これ、誕生日のプレゼントです。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "ありがとうございます！開けてもいいですか。",
              "chinese": "",
              "noteJa": "基本形。お礼＋相手に許可を求める。「開けてもいいですか」はもらったときの自然な流れ。",
              "noteZh": "基本形。お礼＋相手に許可を求める。「開けてもいいですか」はもらったときの自然な流れ。"
            },
            {
              "japanese": "えっ、いいんですか。気を使っていただいて、すみません。",
              "chinese": "",
              "noteJa": "「えっ」で驚き、「いいんですか」で遠慮の気持ちを表現。「気を使っていただいて」は「気を遣わせてしまって」の意味で、大人っぽい返し方。",
              "noteZh": "「えっ」で驚き、「いいんですか」で遠慮の気持ちを表現。「気を使っていただいて」は「気を遣わせてしまって」の意味で、大人っぽい返し方。"
            },
            {
              "japanese": "うれしい！ありがとう。ちょうどほしかったんだ。",
              "chinese": "",
              "noteJa": "友だち同士のカジュアルな返し方。「ちょうどほしかった」は相手が自分の好みをわかっていることへの喜びを伝える。教科書では習わないが実際の会話では頻出。",
              "noteZh": "友だち同士のカジュアルな返し方。「ちょうどほしかった」は相手が自分の好みをわかっていることへの喜びを伝える。教科書では習わないが実際の会話では頻出。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l8_q1",
        "type": "choice",
        "question": "日本語＿＿＿話しましょう。",
        "options": [
          "を",
          "が",
          "で",
          "に"
        ],
        "answer": 2,
        "explanation": "手段の「で」。",
        "grammarNodeId": "l8_de_method"
      },
      {
        "id": "l8_q2",
        "type": "choice",
        "question": "わたしは友だちに本を＿＿＿。",
        "options": [
          "もらいました",
          "あげました",
          "くれました",
          "くださいました"
        ],
        "answer": 1,
        "explanation": "自分から相手に与えるのは「あげる」。友だちに→あげた。",
        "grammarNodeId": "l8_de_method"
      },
      {
        "id": "l8_q3",
        "type": "choice",
        "question": "わたしは先生＿＿＿辞書をもらいました。",
        "options": [
          "に",
          "から",
          "を"
        ],
        "answer": 3,
        "explanation": "「に」でも「から」でもOK。",
        "grammarNodeId": "l8_de_method"
      }
    ]
  },
  {
    "lessonId": 9,
    "lessonTitle": "四川料理は辛いです",
    "lessonTitleRuby": [],
    "theme": "イ形容詞",
    "themeZh": "い形容词",
    "grammarNodes": [
      {
        "id": "l9_i_adjective",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "ものごとの性質や状態を表します。言い切りの形は「〜い」で終わります。",
        "example": "四川料理は辛いです。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：イ形容詞のて形（第16課）"
          }
        ],
        "tags": [
          "#形容詞",
          "#基本活用"
        ]
      },
      {
        "id": "l9_amari_nai",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「あまり」＋否定形で「そんなに〜ではない」という意味になります。",
        "example": "この料理はあまり辛くないです。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：頻度副詞（第7課）"
          },
          {
            "type": "extension",
            "label": "🔗 後：全然〜ない（第10課補足）"
          }
        ],
        "tags": [
          "#否定",
          "#程度"
        ]
      },
      {
        "id": "l9_taste_adjectives",
        "title": "料理の味を表すイ形容詞",
        "titleZh": "料理の味を表すイ形容詞",
        "explanation": "味の表現は日常生活でとてもよく使います。\n辛い（からい）、甘い（あまい）、酸っぱい（すっぱい）、苦い（にがい）、塩辛い（しおからい）\n美味しい（おいしい）、まずい\n熱い（あつい）、冷たい（つめたい）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #味覚 #料理"
          }
        ],
        "tags": []
      },
      {
        "id": "l9_karai_tsurai",
        "title": "「辛い」の二つの意味",
        "titleZh": "「辛い」の二つの意味",
        "explanation": "「辛い」には二つの読み方と意味があります。\nからい：味がスパイシー（四川料理は辛い）\nつらい：気持ちが苦しい、大変（毎日の練習が辛い）\n漢字は同じでも読み方で意味が全く違うので注意。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #同音異義 #注意"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l9_dialogue_main",
        "title": "料理の感想",
        "sceneEmoji": "📖",
        "scenePlace": "料理の感想",
        "opener": {
          "speaker": "A",
          "japanese": "このカレー、どうですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "ちょっと辛いですが、美味しいです。",
              "chinese": "",
              "noteJa": "基本形。「ちょっと＋形容詞＋が」で短所を認めつつ、「美味しい」で長所を伝えるバランスの良い言い方。",
              "noteZh": "基本形。「ちょっと＋形容詞＋が」で短所を認めつつ、「美味しい」で長所を伝えるバランスの良い言い方。"
            },
            {
              "japanese": "思ったより辛くないです。ちょうどいい味ですね。",
              "chinese": "",
              "noteJa": "「思ったより〜ない」は「予想と違った」を伝える便利な表現。「ちょうどいい」は自分の好みに合っていることを伝える。",
              "noteZh": "「思ったより〜ない」は「予想と違った」を伝える便利な表現。「ちょうどいい」は自分の好みに合っていることを伝える。"
            },
            {
              "japanese": "うーん、私にはちょっと辛すぎます。水をもらってもいいですか。",
              "chinese": "",
              "noteJa": "「〜すぎる」で程度がオーバーしていることを伝える。その後の行動（水をもらう）を言うと自然な流れになる。",
              "noteZh": "「〜すぎる」で程度がオーバーしていることを伝える。その後の行動（水をもらう）を言うと自然な流れになる。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l9_q1",
        "type": "choice",
        "question": "この料理は＿＿＿です。",
        "options": [
          "辛い",
          "辛く",
          "辛",
          "辛さ"
        ],
        "answer": 0,
        "explanation": "イ形容詞の言い切りは「〜い」。",
        "grammarNodeId": "l9_i_adjective"
      },
      {
        "id": "l9_q2",
        "type": "choice",
        "question": "このスープは＿＿＿熱くないです。",
        "options": [
          "とても",
          "あまり",
          "いつも",
          "よく"
        ],
        "answer": 1,
        "explanation": "「あまり〜ない」で程度が低いことを表す。",
        "grammarNodeId": "l9_i_adjective"
      },
      {
        "id": "l9_q3",
        "type": "fill",
        "question": "昨日のテストは＿＿＿です。（難しかった）",
        "answer": "難しかった",
        "explanation": "イ形容詞の過去形は「い」→「かった」。",
        "grammarNodeId": "l9_i_adjective"
      }
    ]
  },
  {
    "lessonId": 10,
    "lessonTitle": "京都の紅葉は有名です",
    "lessonTitleRuby": [],
    "theme": "ナ形容詞",
    "themeZh": "な形容词",
    "grammarNodes": [
      {
        "id": "l10_na_adjective",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "ものごとの性質や状態を表します。名詞を修飾するときは「〜な」、言い切りの丁寧形は「〜です」。",
        "example": "京都の紅葉は有名です。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：イ形容詞（第9課）"
          },
          {
            "type": "extension",
            "label": "🔗 後：ナ形容詞のて形（第16課）"
          }
        ],
        "tags": [
          "#形容動詞",
          "#基本活用"
        ]
      },
      {
        "id": "l10_deshita",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "名詞やナ形容詞の過去を表す丁寧形。「です」→「でした」。",
        "example": "昨日はいい天気でした。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：〜です（第1課）"
          }
        ],
        "tags": [
          "#過去",
          "#丁寧形"
        ]
      },
      {
        "id": "l10_sightseeing",
        "title": "観光地を紹介する表現",
        "titleZh": "観光地を紹介する表現",
        "explanation": "観光地の魅力を伝えるときの表現集。\n〜は有名です\n〜はきれいです\n〜は素晴らしいです\n〜は人気があります\n〜に行ったことがありますか",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #観光 #紹介"
          }
        ],
        "tags": []
      },
      {
        "id": "l10_i_vs_na",
        "title": "イ形容詞とナ形容詞の見分け方",
        "titleZh": "イ形容詞とナ形容詞の見分け方",
        "explanation": "簡単な見分け方。\n言い切りが「〜い」で終わる → イ形容詞（多い、高い、美味しい）\n言い切りが「〜い」で終わらない → ナ形容詞（有名、きれい、静か）\n例外：「きれい」「嫌い」は「い」で終わるがナ形容詞！",
        "example": "",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：きれい（ナ形）vs 美しい（イ形）"
          }
        ],
        "tags": [
          "#品詞",
          "#見分け方"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l10_dialogue_main",
        "title": "観光地の感想",
        "sceneEmoji": "📖",
        "scenePlace": "観光地の感想",
        "opener": {
          "speaker": "A",
          "japanese": "京都はどうでしたか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "とてもきれいでした。特に紅葉が素晴らしかったです。",
              "chinese": "",
              "noteJa": "基本形。全体的な感想＋特によかった点を挙げる。「特に」を使うと話にメリハリが出る。",
              "noteZh": "基本形。全体的な感想＋特によかった点を挙げる。「特に」を使うと話にメリハリが出る。"
            },
            {
              "japanese": "すごく良かったです。お寺も静かで、とても落ち着きました。また行きたいです。",
              "chinese": "",
              "noteJa": "「すごく」は「とても」より口語的。「〜て、〜」で感想をつなげて、「また行きたい」で締めるのが自然な流れ。",
              "noteZh": "「すごく」は「とても」より口語的。「〜て、〜」で感想をつなげて、「また行きたい」で締めるのが自然な流れ。"
            },
            {
              "japanese": "正直、思ったより人が多くてちょっと疲れました。でも、早朝の清水寺は静かで本当にきれいでした。",
              "chinese": "",
              "noteJa": "正直な感想＋でも良かった点も。「正直」で本音を言う前置き、「でも」でフォローするバランス。",
              "noteZh": "正直な感想＋でも良かった点も。「正直」で本音を言う前置き、「でも」でフォローするバランス。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l10_q1",
        "type": "choice",
        "question": "京都の紅葉は＿＿＿です。",
        "options": [
          "有名",
          "有名な",
          "有名に",
          "有名だ"
        ],
        "answer": 0,
        "explanation": "ナ形容詞の言い切り丁寧形は「〜です」。",
        "grammarNodeId": "l10_na_adjective"
      },
      {
        "id": "l10_q2",
        "type": "choice",
        "question": "昨日はいい天気＿＿＿。",
        "options": [
          "です",
          "でした",
          "ます",
          "ました"
        ],
        "answer": 1,
        "explanation": "過去の断定は「でした」。",
        "grammarNodeId": "l10_na_adjective"
      },
      {
        "id": "l10_q3",
        "type": "choice",
        "question": "＿＿＿な町ですね。",
        "options": [
          "きれい",
          "きれいだ",
          "きれく",
          "きれいに"
        ],
        "answer": 0,
        "explanation": "「きれい」はナ形容詞。名詞修飾は「きれいな」。",
        "grammarNodeId": "l10_na_adjective"
      }
    ]
  },
  {
    "lessonId": 11,
    "lessonTitle": "小野さんは歌が好きです",
    "lessonTitleRuby": [],
    "theme": "好み",
    "themeZh": "喜好与擅长",
    "grammarNodes": [
      {
        "id": "l11_suki_kirai",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "好きなもの・嫌いなものを表します。好き・嫌いの対象には「が」を使います。",
        "example": "小野さんは歌が好きです。わたしはタバコが嫌いです。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜が好き（名詞）vs 〜たい（動詞・第17課）"
          }
        ],
        "tags": [
          "#好み",
          "#感情"
        ]
      },
      {
        "id": "l11_jouzu_heta",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "技能の上手・下手を表します。対象には「が」を使います。",
        "example": "森さんはテニスが上手です。わたしは料理が下手です。",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #技能 #謙遜"
          }
        ],
        "tags": []
      },
      {
        "id": "l11_suki_levels",
        "title": "好きの強さレベル",
        "titleZh": "好きの強さレベル",
        "explanation": "好きの度合いを表す表現。\nちょっと好き（軽い気持ち）\n好き（普通）\n大好き（強い気持ち）\n一番好き（最も好き）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #程度 #感情表現"
          }
        ],
        "tags": []
      },
      {
        "id": "l11_hobbies",
        "title": "趣味の話で使う表現",
        "titleZh": "趣味の話で使う表現",
        "explanation": "趣味や好みを話すときの会話パターン。\n趣味は〜です。（基本）\n〜にハマっています。（最近夢中になっている）\n〜を始めたばかりです。（初心者）\n〜を習っています。（勉強中）",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #趣味 #自己紹介"
          }
        ],
        "tags": []
      }
    ],
    "dialogues": [
      {
        "id": "l11_dialogue_main",
        "title": "趣味の話",
        "sceneEmoji": "📖",
        "scenePlace": "趣味の話",
        "opener": {
          "speaker": "A",
          "japanese": "趣味は何ですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "音楽を聞くことが好きです。特に日本のポップスが大好きです。",
              "chinese": "",
              "noteJa": "基本形。好きなこと＋特に好きなもの。「大好き」で好きの強さを伝える。",
              "noteZh": "基本形。好きなこと＋特に好きなもの。「大好き」で好きの強さを伝える。"
            },
            {
              "japanese": "そうですね…最近は料理にハマっています。まだ上手じゃないですが、作るのが楽しいです。",
              "chinese": "",
              "noteJa": "「そうですね」で考える間を作る。「〜にハマっている」は口語で「夢中」の意味。「まだ上手じゃない」と謙遜しつつ「楽しい」で前向きに。",
              "noteZh": "「そうですね」で考える間を作る。「〜にハマっている」は口語で「夢中」の意味。「まだ上手じゃない」と謙遜しつつ「楽しい」で前向きに。"
            },
            {
              "japanese": "特にないんですけど…あ、でも散歩は好きです。天気のいい日に公園を歩くのが気持ちいいです。",
              "chinese": "",
              "noteJa": "特に趣味がないときの返し方。「特にない」で一旦終わらせず、「でも」で小さなことでも挙げると会話が続く。",
              "noteZh": "特に趣味がないときの返し方。「特にない」で一旦終わらせず、「でも」で小さなことでも挙げると会話が続く。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l11_q1",
        "type": "choice",
        "question": "わたしは猫＿＿＿好きです。",
        "options": [
          "を",
          "が",
          "に",
          "で"
        ],
        "answer": 1,
        "explanation": "好き・嫌いの対象は「が」。",
        "grammarNodeId": "l11_suki_kirai"
      },
      {
        "id": "l11_q2",
        "type": "choice",
        "question": "李さんは料理＿＿＿上手ですね。",
        "options": [
          "を",
          "が",
          "に",
          "で"
        ],
        "answer": 1,
        "explanation": "上手・下手の対象も「が」。",
        "grammarNodeId": "l11_suki_kirai"
      },
      {
        "id": "l11_q3",
        "type": "choice",
        "question": "自分のことを言うときは？",
        "options": [
          "上手です",
          "得意です",
          "上手いです",
          "上手でした"
        ],
        "answer": 1,
        "explanation": "自分には「得意」を使う。自慢に聞こえないためのマナー。",
        "grammarNodeId": "l11_suki_kirai"
      }
    ]
  },
  {
    "lessonId": 12,
    "lessonTitle": "李さんは森さんより若いです",
    "lessonTitleRuby": [],
    "theme": "比較",
    "themeZh": "比较",
    "grammarNodes": [
      {
        "id": "l12_yori",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "二つのものを比べて「AはBより〜」で「Aの方がBよりも〜だ」を表します。",
        "example": "李さんは森さんより若いです。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜のほうが〜（次のノード）"
          }
        ],
        "tags": [
          "#比較",
          "#より"
        ]
      },
      {
        "id": "l12_nohouga",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「AのほうがBより〜」で「Aの方を選ぶ」気持ちを表します。「より」より「ほうが」の方が比較の気持ちが強い。",
        "example": "日本より中国のほうが広いです。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：〜より"
          },
          {
            "type": "extension",
            "label": "🔗 後：〜ほうがいい（第18課）"
          }
        ],
        "tags": [
          "#比較",
          "#選択"
        ]
      },
      {
        "id": "l12_comparison_dialogue",
        "title": "「どっちがいい？」の自然な会話",
        "titleZh": "「どっちがいい？」の自然な会話",
        "explanation": "日常でよくある比較の会話パターン。\nAとBとどっちがいい？\nどっちもいいけど、Aのほうが好きかな。\nBよりAのほうが使いやすい。",
        "example": "",
        "links": [
          {
            "type": "scene",
            "label": "🏷️ #日常会話 #選択"
          }
        ],
        "tags": []
      },
      {
        "id": "l12_saikou",
        "title": "一番〜（最上級）",
        "titleZh": "一番〜（最上級）",
        "explanation": "三つ以上のものの中で最も程度が高いことを表します。",
        "example": "クラスで李さんが一番背が高いです。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：比較表現"
          }
        ],
        "tags": [
          "#最上級",
          "#比較"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l12_dialogue_main",
        "title": "どっちがいい？",
        "sceneEmoji": "📖",
        "scenePlace": "どっちがいい？",
        "opener": {
          "speaker": "A",
          "japanese": "AとB、どっちがいいですか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "Aのほうがいいです。デザインが好きです。",
              "chinese": "",
              "noteJa": "基本形。「〜のほうがいい」で選択し、理由を添える。理由があると説得力が出る。",
              "noteZh": "基本形。「〜のほうがいい」で選択し、理由を添える。理由があると説得力が出る。"
            },
            {
              "japanese": "うーん、どっちもいいですね。でも、値段を考えるとBのほうがいいかな。",
              "chinese": "",
              "noteJa": "迷ったときの返し方。「どっちもいい」で両方を認めつつ、「でも」で判断基準を出す。「〜かな」でやわらかく意見を言う。",
              "noteZh": "迷ったときの返し方。「どっちもいい」で両方を認めつつ、「でも」で判断基準を出す。「〜かな」でやわらかく意見を言う。"
            },
            {
              "japanese": "AはAでいいし、BはBでいいし…決められないです。すみません、ちょっと考えてもいいですか。",
              "chinese": "",
              "noteJa": "すぐに決められないときの正直な返し方。「AはAでいいし〜」は「それぞれ良さがある」の口語表現。「考えてもいいですか」で時間をもらう。",
              "noteZh": "すぐに決められないときの正直な返し方。「AはAでいいし〜」は「それぞれ良さがある」の口語表現。「考えてもいいですか」で時間をもらう。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l12_q1",
        "type": "choice",
        "question": "李さんは森さん＿＿＿若いです。",
        "options": [
          "より",
          "ほう",
          "が",
          "は"
        ],
        "answer": 0,
        "explanation": "比較は「〜より」。",
        "grammarNodeId": "l12_yori"
      },
      {
        "id": "l12_q2",
        "type": "choice",
        "question": "日本より中国の＿＿＿広いです。",
        "options": [
          "ほう",
          "ほうが",
          "こと",
          "もの"
        ],
        "answer": 1,
        "explanation": "「〜のほうが〜」で比較選択。",
        "grammarNodeId": "l12_yori"
      },
      {
        "id": "l12_q3",
        "type": "choice",
        "question": "クラスで李さんが＿＿＿背が高いです。",
        "options": [
          "一番",
          "とても",
          "あまり",
          "よく"
        ],
        "answer": 0,
        "explanation": "最上級は「一番」。",
        "grammarNodeId": "l12_yori"
      },
      {
        "id": "l12_q4",
        "type": "fill",
        "question": "夏より冬のほう＿＿＿好きです。",
        "answer": "が",
        "explanation": "「〜のほうが」の「が」を忘れない。",
        "grammarNodeId": "l12_yori"
      }
    ]
  },
  {
    "lessonId": 21,
    "lessonTitle": "わたしはすき焼きを食べたことがあります",
    "lessonTitleRuby": [],
    "theme": "経験",
    "themeZh": "た形与经历",
    "grammarNodes": [
      {
        "id": "l21_taform",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動詞のた形は、過去や完了を表す形です。作り方は「て形」とまったく同じルールです。\n作り方：\n1グループ：書く→書いた、待つ→待った、読む→読んだ\n2グループ：食べる→食べた、起きる→起きた\n3グループ：する→した、来る→来た",
        "example": "昨日、映画を見た。（昨天看了电影。）",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：動詞のて形（第14課）"
          },
          {
            "type": "extension",
            "label": "🔗 後：〜たり〜たり（第23課）"
          }
        ],
        "tags": [
          "#た形",
          "#過去",
          "#活用"
        ]
      },
      {
        "id": "l21_takotogaaru",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "動詞のた形＋ことがあるで、「過去に〜した経験がある」ことを表します。現在の能力や状態ではなく、過去の経験を言います。",
        "example": "わたしはすき焼きを食べたことがあります。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：動詞のた形"
          },
          {
            "type": "contrast",
            "label": "⚠️ 比：〜ている（状態）vs 〜たことがある（経験）"
          }
        ],
        "tags": [
          "#経験",
          "#た形"
        ]
      },
      {
        "id": "l21_taatode",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "AをしたあとでBをする。第14課の「〜てから」よりも、時間の前後関係を客観的に述べるニュアンスがあります。",
        "example": "食事をしたあとで、散歩します。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜てから（第14課）vs 〜たあとで"
          },
          {
            "type": "prerequisite",
            "label": "📖 前：動詞のた形"
          }
        ],
        "tags": [
          "#時間",
          "#順序"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l21_dialogue_main",
        "title": "会話練習",
        "sceneEmoji": "📖",
        "scenePlace": "会話練習",
        "opener": {
          "speaker": "A",
          "japanese": "日本料理を食べたことがありますか。",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "はい、あります。去年、友だちとすしを食べに行きました。とても美味しかったです。",
              "chinese": "",
              "noteJa": "基本形。経験の有無＋いつ・誰と・感想を簡潔に答える。",
              "noteZh": "基本形。経験の有無＋いつ・誰と・感想を簡潔に答える。"
            },
            {
              "japanese": "いいえ、まだないんです。でも、ラーメンはぜひ食べてみたいです。",
              "chinese": "",
              "noteJa": "「まだない」＋「でも」で希望を伝える。「ぜひ〜たい」で強い意欲を示す。",
              "noteZh": "「まだない」＋「でも」で希望を伝える。「ぜひ〜たい」で強い意欲を示す。"
            },
            {
              "japanese": "あ、何度もありますよ。特にすき焼きは自分でも作ったことがあります。",
              "chinese": "",
              "noteJa": "「何度もある」で豊富な経験を伝える。追加情報で会話が広がる。",
              "noteZh": "「何度もある」で豊富な経験を伝える。追加情報で会話が広がる。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l21_q1",
        "type": "choice",
        "question": "日本へ＿＿＿ことがありますか。",
        "options": [
          "行く",
          "行った",
          "行ったこと",
          "行き"
        ],
        "answer": 1,
        "explanation": "経験は「た形＋ことがある」。",
        "grammarNodeId": "l21_taform"
      },
      {
        "id": "l21_q2",
        "type": "choice",
        "question": "映画を見た＿＿＿、買い物をしました。",
        "options": [
          "まえ",
          "あとで",
          "なか",
          "とき"
        ],
        "answer": 1,
        "explanation": "「〜たあとで」で時間的前後関係を表す。",
        "grammarNodeId": "l21_taform"
      },
      {
        "id": "l21_q3",
        "type": "fill",
        "question": "まだ一度も＿＿＿ことがありません。（行く）",
        "answer": "行った",
        "explanation": "「行く」のた形は「行った」。",
        "grammarNodeId": "l21_taform"
      },
      {
        "id": "l21_q4",
        "type": "choice",
        "question": "コーヒーにしますか、＿＿＿紅茶にしますか。",
        "options": [
          "または",
          "それとも",
          "でも",
          "そして"
        ],
        "answer": 1,
        "explanation": "二者択一の接続詞は「それとも」。",
        "grammarNodeId": "l21_taform"
      }
    ]
  },
  {
    "lessonId": 22,
    "lessonTitle": "森さんは毎晩テレビを見る",
    "lessonTitleRuby": [],
    "theme": "常体",
    "themeZh": "简体",
    "grammarNodes": [
      {
        "id": "l22_plain_form",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "友だちや家族との会話で使う普通の言い方。これまで習った「です・ます」は丁寧体です。\n動詞の簡体と丁寧体の対応表：\n簡体\t丁寧体\n現在肯定\t見る\t見ます\n現在否定\t見ない\t見ません\n過去肯定\t見た\t見ました\n過去否定\t見なかった\t見ませんでした",
        "example": "",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：全課の丁寧体との切り替え"
          }
        ],
        "tags": []
      },
      {
        "id": "l22_adj_plain",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "",
        "example": "",
        "links": [],
        "tags": [
          "#簡体",
          "#活用"
        ]
      },
      {
        "id": "l22_yotei",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "簡体＋予定だで、未来の予定を表します。",
        "example": "明日は友だちと遊ぶ予定です。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：〜つもり（第17課補足）"
          }
        ],
        "tags": [
          "#予定",
          "#未来"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l22_dialogue_main",
        "title": "会話練習",
        "sceneEmoji": "📖",
        "scenePlace": "会話練習",
        "opener": {
          "speaker": "A",
          "japanese": "今晩、何する？",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "特に予定ないよ。家でゲームでもしようかな。",
              "chinese": "",
              "noteJa": "友だち同士の自然なやりとり。「〜しようかな」で軽い意志を表す。",
              "noteZh": "友だち同士の自然なやりとり。「〜しようかな」で軽い意志を表す。"
            },
            {
              "japanese": "あ、今日は早く寝るつもり。明日早いんだ。",
              "chinese": "",
              "noteJa": "「つもり」で意志を伝える。「んだ」は説明の口語。",
              "noteZh": "「つもり」で意志を伝える。「んだ」は説明の口語。"
            },
            {
              "japanese": "ごめん、今ちょっと手が離せない。後で連絡するね。",
              "chinese": "",
              "noteJa": "忙しいときの断り方。簡体で親しい相手に使う。",
              "noteZh": "忙しいときの断り方。簡体で親しい相手に使う。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l22_q1",
        "type": "choice",
        "question": "明日は休みだ。＝明日は休み＿＿＿。",
        "options": [
          "ます",
          "です",
          "でした",
          "ません"
        ],
        "answer": 1,
        "explanation": "簡体「だ」の丁寧体は「です」。",
        "grammarNodeId": "l22_plain_form"
      },
      {
        "id": "l22_q2",
        "type": "choice",
        "question": "来週、京都へ行く＿＿＿です。",
        "options": [
          "予定",
          "こと",
          "もの",
          "とき"
        ],
        "answer": 0,
        "explanation": "「〜予定だ」で未来の計画を表す。",
        "grammarNodeId": "l22_plain_form"
      },
      {
        "id": "l22_q3",
        "type": "fill",
        "question": "昨日は映画を＿＿＿。（見た・見る）",
        "answer": "見た",
        "explanation": "過去の簡体は「た形」。",
        "grammarNodeId": "l22_plain_form"
      },
      {
        "id": "l22_q4",
        "type": "choice",
        "question": "この料理の＿＿＿方を教えてください。",
        "options": [
          "作る",
          "作り",
          "作った",
          "作って"
        ],
        "answer": 1,
        "explanation": "「ます形＋方」で方法を表す名詞。",
        "grammarNodeId": "l22_plain_form"
      }
    ]
  },
  {
    "lessonId": 23,
    "lessonTitle": "休みの日、散歩したり買い物に行ったりします",
    "lessonTitleRuby": [],
    "theme": "並列",
    "themeZh": "たり·场合",
    "grammarNodes": [
      {
        "id": "l23_tari",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "いくつかの動作の中から代表的なものを挙げて「AしたりBしたりする」とつなぎます。「色々なことをする」というニュアンス。",
        "example": "休みの日、散歩したり買い物に行ったりします。",
        "links": [
          {
            "type": "prerequisite",
            "label": "📖 前：動詞のた形（第21課）"
          },
          {
            "type": "contrast",
            "label": "⚠️ 比：〜や〜など（名詞列挙・第4課）"
          }
        ],
        "tags": [
          "#列挙",
          "#た形"
        ]
      },
      {
        "id": "l23_baai",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "「もし〜の状況になったら」という仮定の条件を表します。",
        "example": "雨の場合は、試合が中止になります。",
        "links": [
          {
            "type": "extension",
            "label": "🔗 後：〜たら（第24課補足）"
          }
        ],
        "tags": [
          "#条件",
          "#場合"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l23_dialogue_main",
        "title": "会話練習",
        "sceneEmoji": "📖",
        "scenePlace": "会話練習",
        "opener": {
          "speaker": "A",
          "japanese": "週末はいつも何してる？",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "だいたい家で本を読んだり、映画を見たりしてるよ。たまに友だちと出かけたりもする。",
              "chinese": "",
              "noteJa": "「〜たり〜たり」で複数の活動を列挙。「たまに」で頻度を加える。",
              "noteZh": "「〜たり〜たり」で複数の活動を列挙。「たまに」で頻度を加える。"
            },
            {
              "japanese": "先週は京都へ行ったよ。でも今週は特に予定ないから、掃除したり料理したりするつもり。",
              "chinese": "",
              "noteJa": "過去と未来を対比させる自然な流れ。",
              "noteZh": "過去と未来を対比させる自然な流れ。"
            },
            {
              "japanese": "試験が近いから、図書館で勉強したり、ノートをまとめたりしてる。終わったら遊びたい！",
              "chinese": "",
              "noteJa": "理由→行動→願望の順で話す。",
              "noteZh": "理由→行動→願望の順で話す。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l23_q1",
        "type": "choice",
        "question": "休みの日は＿＿＿して過ごします。",
        "options": [
          "散歩する",
          "散歩し",
          "散歩したり",
          "散歩した"
        ],
        "answer": 2,
        "explanation": "「〜たり〜たりする」で動作の例示。",
        "grammarNodeId": "l23_tari"
      },
      {
        "id": "l23_q2",
        "type": "choice",
        "question": "雨の＿＿＿は、運動会がありません。",
        "options": [
          "とき",
          "こと",
          "場合",
          "の"
        ],
        "answer": 2,
        "explanation": "条件は「〜場合」。",
        "grammarNodeId": "l23_tari"
      },
      {
        "id": "l23_q3",
        "type": "fill",
        "question": "昨日は映画を＿＿＿、買い物を＿＿＿しました。（見る・する）",
        "answer": "見たり、したり",
        "explanation": "動詞の「たり」形。",
        "grammarNodeId": "l23_tari"
      },
      {
        "id": "l23_q4",
        "type": "choice",
        "question": "李さんが来る＿＿＿分かりません。",
        "options": [
          "か",
          "かどうか",
          "が",
          "を"
        ],
        "answer": 1,
        "explanation": "不確定の疑問は「〜かどうか」。",
        "grammarNodeId": "l23_tari"
      }
    ]
  },
  {
    "lessonId": 24,
    "lessonTitle": "李さんはもうすぐ来ると思います",
    "lessonTitleRuby": [],
    "theme": "引用",
    "themeZh": "引用与思う",
    "grammarNodes": [
      {
        "id": "l24_tomou",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "自分の考えや感じたことを述べます。前に来る文は必ず簡体。",
        "example": "李さんはもうすぐ来ると思います。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜でしょう（第18課）"
          }
        ],
        "tags": [
          "#意見",
          "#推量"
        ]
      },
      {
        "id": "l24_toiu_quote",
        "title": "文法",
        "titleZh": "文法",
        "explanation": "誰かの発言や内容をそのまま伝える引用表現。",
        "example": "彼は「行く」と言いました。",
        "links": [
          {
            "type": "contrast",
            "label": "⚠️ 比：〜という（名前紹介・第16課）vs 〜と言う（発言引用）"
          }
        ],
        "tags": [
          "#引用",
          "#伝聞"
        ]
      }
    ],
    "dialogues": [
      {
        "id": "l24_dialogue_main",
        "title": "会話練習",
        "sceneEmoji": "📖",
        "scenePlace": "会話練習",
        "opener": {
          "speaker": "A",
          "japanese": "あの新しいレストラン、どう思う？",
          "chinese": ""
        },
        "userTurn": {
          "speaker": "B",
          "replies": [
            {
              "japanese": "美味しいと思うよ。値段も思ったより高くなかったし。",
              "chinese": "",
              "noteJa": "「〜と思う」＋理由。簡体で友だちに意見を言う。",
              "noteZh": "「〜と思う」＋理由。簡体で友だちに意見を言う。"
            },
            {
              "japanese": "うーん、私はあんまり好きじゃないかな。味がちょっと濃いと思った。",
              "chinese": "",
              "noteJa": "否定的意見をやわらかく伝える。「ちょっと」で緩和。",
              "noteZh": "否定的意見をやわらかく伝える。「ちょっと」で緩和。"
            },
            {
              "japanese": "まだ行ったことないからわからないけど、友だちはいい店だと言ってたよ。",
              "chinese": "",
              "noteJa": "伝聞情報として引用。「〜と言ってた」で他者の意見を紹介。",
              "noteZh": "伝聞情報として引用。「〜と言ってた」で他者の意見を紹介。"
            }
          ]
        }
      }
    ],
    "quizQuestions": [
      {
        "id": "l24_q1",
        "type": "choice",
        "question": "明日は晴れる＿＿＿。",
        "options": [
          "と思う",
          "と思った",
          "と言う",
          "と言った"
        ],
        "answer": 0,
        "explanation": "意見・推量は「〜と思う」。",
        "grammarNodeId": "l24_tomou"
      },
      {
        "id": "l24_q2",
        "type": "choice",
        "question": "彼は「さようなら」＿＿＿言いました。",
        "options": [
          "を",
          "と",
          "に",
          "で"
        ],
        "answer": 1,
        "explanation": "引用の助詞は「と」。",
        "grammarNodeId": "l24_tomou"
      },
      {
        "id": "l24_q3",
        "type": "choice",
        "question": "すみません、頭が痛い＿＿＿。",
        "options": [
          "です",
          "んだ",
          "んです",
          "ですか"
        ],
        "answer": 2,
        "explanation": "説明・理由の「〜んです」。",
        "grammarNodeId": "l24_tomou"
      },
      {
        "id": "l24_q4",
        "type": "choice",
        "question": "先生は来週テストがある＿＿＿言っていました。",
        "options": [
          "と",
          "を",
          "に",
          "で"
        ],
        "answer": 0,
        "explanation": "引用の「と」。",
        "grammarNodeId": "l24_tomou"
      }
    ]
  }
];
