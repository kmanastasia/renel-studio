# Renel. Studio — サイト運用ルール

Karen のポートフォリオサイト（GitHub: kmanastasia/renel-studio）。静的HTML/CSS/JS。

## Self-Projects 追加ルール【必須】

`self-projects/` 配下に新しいプロジェクトフォルダを追加したら、**必ず次の2点をセットで行う**こと（片方だけの更新は禁止）:

1. **`js/works-data.js`** の `apps` 配列の**先頭**（最新順）に1件追加する（`id` = フォルダ名）
   → トップの Apps タブ・Works の Apps タブ・Self-Projects ページの3か所に自動で出る（HTML は触らない）
2. プロジェクトフォルダ直下に **`screenshot.png`** を置く（カードのサムネイル。**16:10** で撮影する — `.card__media` の aspect-ratio に一致させ、切れを防ぐ）

- 文言: `title` / `desc`（1〜2文）/ `stack`（技術スタック）/ `year`。日本語タイトルは `jpTitle: true`。
- 映像（`works`）・曲（`music`）・AI工程（`workflow`）・サービス（`services`）も同じ `js/works-data.js` で管理する。書き方はファイル冒頭のコメント参照。
- 描画は `js/works.js`。各ページで `works-data.js` → `works.js` → `main.js` の順に読み込むこと。

## デプロイ形式

- 各プロジェクトは **ビルド済み静的ファイルをフォルダ直下に直接配置**し、その場で遊べる形にする（life-timer 方式）。
- Vite プロジェクトは `npx vite build --base=./`（相対パス）でビルドし、`dist/*` をコピーする。
  - 例: 裏切りおでん = ソースは `~/game-theory/app`（GitHub: kmanastasia/uragiri-oden）→ `dist/*` を `self-projects/uragiri-oden/` へ。

## コミット時の注意

- 依頼された変更のファイルだけをステージする（無関係な未コミット変更・untracked を巻き込まない）。
