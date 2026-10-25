/* =========================================================
   Renel Studio — works-data.js
   Works ページとトップの「Featured Films」はこのファイルだけで決まる。
   新しい作品は works 配列の【先頭】に1件追加するだけでOK。

   作品1件の書き方:
   {
     id:       "neon-garden",              // 英数字ハイフン（URL #film-neon-garden で直接開ける）
     title:    "Neon Garden",
     titleJa:  "ネオンの庭",                 // 任意
     credit:   "unit",                     // "unit" = It's color STUDIO / "solo" = 個人制作
     year:     "2026",
     duration: "1:24",                     // 任意
     days:     3,                          // 任意：制作日数（「制作 3日」と表示。AIのスピード感を見せる）
     made:     "32H",                      // 任意：制作期間を自由表記（days より優先）
     kind:     "MV",                       // MV / Short Film / Commercial / Concept など
     tools:    ["Kling", "Midjourney", "Suno"],
     desc:     "説明。空行で段落を分けられる（長い時は `...` で囲む）。一覧の大枠には1段落目だけ出る",
     badge:    "◯◯ 出場",                  // 任意：コンペ出場・受賞など
     poster:   "assets/works/neon-garden/poster.jpg",   // 16:9 サムネ（サイト直下からのパス）
     preview:  "assets/works/neon-garden/preview.mp4",  // 任意：ホバーで流れる無音ループ（5〜8秒・2MB以内推奨）
     video:    { type: "youtube", id: "xxxxxxxxxxx" }   // youtube / vimeo / mp4（mp4 は src にパス）/ link（外部ページ: url, label）/ tiktok（id＝動画番号, url）
     featured: true                        // 任意：Works ページ上部の大枠に出す（無ければ最新作）
   }
   ========================================================= */

window.RENEL_WORKS = {
  unit: {
    name: "It's color STUDIO",
    members: [
      { name: "Akira" },
      { name: "REN" },
    ],
    lead: "", // ユニット紹介文（空なら非表示）
  },

  /* ---- Apps（1日1アプリ / 旧 Self-Projects）----
     【先頭が最新】。id = self-projects/ 配下のフォルダ名。
     フォルダ直下に screenshot.png（16:10）を置けば、トップ・Works・Self-Projects の3か所に出る。 */
  apps: [
    {
      id: "water-reminder",
      title: "お水ごくごく",
      jpTitle: true, // 日本語タイトルは太ゴシックで表示
      desc: "詰めてこない水分補給リマインダーPWA。「水飲んだ？」とゆるく声をかけるだけ。罪悪感ゼロの声かけと、飲むとちょっと嬉しいゲージで続けられます。",
      stack: "Vanilla JS / PWA",
      year: "2026",
    },
    {
      id: "uragiri-oden",
      title: "裏切りおでん",
      jpTitle: true,
      desc: "ナッシュ均衡を遊んで学ぶレトロRPG風ゲーム。同時ゲーム・逐次ゲーム・利得表クイズの3モードで、「得なのに抜け出せない場所」を体感できます。",
      stack: "React / Vite",
      year: "2026",
    },
    {
      id: "life-timer",
      title: "Life Timer",
      desc: "人生であなたがやり遂げたいこと、大切な人と過ごす時間は意外と少ない。それを実感させてくれます。",
      stack: "Vanilla JS",
      year: "2026",
    },
    {
      id: "chemistry-match",
      title: "Chemistry Match",
      desc: "16タイプで、チームや友人との相性を診断。グループ全体のケミストリーをスコアで可視化します。",
      stack: "React",
      year: "2026",
    },
  ],

  /* ---- Services（依頼できること）---- */
  services: [
    {
      title: "AI MV・映像制作",
      by: "unit", // It's color STUDIO として受ける
      desc: "楽曲やブランドの世界観から、生成AIでMV・ショートフィルムを制作。絵コンテから仕上げまで一気通貫。",
      tags: ["MV", "Short Film", "Lyric Video"],
    },
    {
      title: "AI 広告・SNSショート動画",
      by: "unit",
      desc: "Reels / TikTok / YouTube Shorts 向けの縦型動画を、短いサイクルで量産。テスト→改善まで伴走します。",
      tags: ["Reels", "Shorts", "Ad Creative"],
    },
    {
      title: "AI プロトタイプ開発",
      by: "solo",
      desc: "アイデアを数日で「触れる形」に。1日1アプリで鍛えたスピードで、Webアプリ・PWAを作ります。",
      tags: ["Web App", "PWA", "Claude Code"],
    },
    {
      title: "生成AI 活用のご相談",
      by: "solo",
      desc: "クリエイティブ制作や事業づくりに、どのAIをどう組み込むか。ツール選びから小さく試すまで一緒に。", // TODO: 本業と競合しないか確認
      tags: ["Workshop", "Consulting"],
    },
  ],

  /* ---- 音楽活動 Naked Lotus ----
     tracks は【先頭が最新】。links は持っているものだけ書けばOK
     （listen=配信まとめ / spotify / apple / youtube / instagram / tiktok / soundcloud / suno）。 */
  music: {
    artist: "Naked Lotus",
    lead: "Lyrics by REN",
    tools: ["Claude", "Gemini", "FL Studio"],
    links: {
      instagram: "https://www.instagram.com/naked_lotus_/",
      tiktok: "https://www.tiktok.com/@naked_lotus_/",
    },
    tracks: [
      {
        title: "Polaris",
        year: "2026",
        type: "Single",
        length: "3:00",
        bpm: 72,
        cover: "assets/music/polaris.jpg",
        // mv: "polaris-mv", // 制作中のMVが公開されたら works に追加して、その id を書くと「▶ MV」ボタンが出る
        links: {
          listen: "https://linkco.re/Pgr0BNtR", // 配信まとめ（各ストアへのリンク集）
        },
      },
    ],
  },

  works: [
    {
      id: "my-gang-cat",
      title: "My Gang Cat",
      credit: "solo",
      year: "2026",
      kind: "Short Film",
      tools: ["TapNow", "ChatGPT Image", "Seedance"],
      desc: "",
      poster: "assets/works/my-gang-cat/poster.jpg",
      video: { type: "link", url: "https://app.tapnow.ai/home/taptv/video/c3f0a246-fe7d-4031-a15b-348efd8078df", label: "TapNow で見る" },
    },
    {
      id: "our-times",
      title: "OUR TIMES",
      credit: "unit",
      year: "2026",
      kind: "Competition",
      made: "32H",
      tools: ["Claude", "TapNow", "ChatGPT Image", "Seedream", "Kling", "Seedance", "Suno", "CapCut"],
      badge: "TapNow Arena Peak Asia Tokyo 出場",
      desc: `1926年、ハリウッド。
映画産業が熱を帯び、あらゆる才能が撮影所に引き寄せられていた時代。美術大学を卒業したものの、志していたイラストレーターの道を断たれたジョーは、職を求めてさまよううちに、ある撮影所の門をくぐる。

そこで出会ったのは、夢を追う者、金のために働く者、ただ機械が好きでたまらない者――映画に関わる動機も境遇もばらばらな、個性豊かなスタッフたちだった。

インスピレーションに従い、次々と無理難題を突きつける監督。振り回されながらも、仲間とともに一つひとつ形にしていくうちに、ジョーはいつしか映画作りの渦にのめり込んでいく。

絵筆を握ることを諦めかけていた青年が見つけた、もうひとつの「描く」場所。サイレント映画の黄金期を舞台に、ものづくりに魂を燃やす人々の姿を描く、喜びと狂騒。`,
      poster: "assets/works/our-times/poster.jpg",
      video: { type: "link", url: "https://app.tapnow.ai/home/taptv/66/38366541-d115-4f02-bb2e-fba2301370f8", label: "TapNow で見る" },
      featured: true,
    },
    {
      id: "polaris-tiktok",
      title: "Polaris",
      credit: "solo",
      year: "2026",
      kind: "Short Video",
      desc: "Naked Lotus「Polaris」の TikTok 映像。",
      poster: "assets/music/polaris.jpg", // ジャケットを仮サムネに
      posterPos: "center 62%", // サムネの切り取り位置（任意）
      video: { type: "tiktok", id: "7689818649271487764", url: "https://www.tiktok.com/@naked_lotus_/video/7689818649271487764" },
    },
  ],
};
