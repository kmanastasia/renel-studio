# Renel. Studio — サイト運用ルール

Karen のポートフォリオサイト（GitHub: kmanastasia/renel-studio）。静的HTML/CSS/JS。

## Self-Projects 追加ルール【必須】

`self-projects/` 配下に新しいプロジェクトフォルダを追加したら、**必ず次の3点をセットで行う**こと（片方だけの更新は禁止）:

1. **`index.html`（トップページ）** の `#projects` セクション内 `.card-grid` にカードを追加する
2. **`self-projects/index.html`** の `#cardGrid` にも同じカードを追加する
3. プロジェクトフォルダ直下に **`screenshot.png`** を置く（カードのサムネイル。**16:10** で撮影する — `.card__media` の aspect-ratio に一致させ、切れを防ぐ）

- カードのマークアップは既存カード（life-timer 等）をコピーして使う。トップページ側は `class="card reveal is-interactive"`、self-projects 側は `class="card is-interactive" data-category="app"`（reveal なし）で、パスの起点も異なる点に注意。
- 新しいカードは原則グリッドの**先頭**（最新順）に置く。
- カード文言: タイトル / 1〜2文の説明 / `card__meta` に技術スタックと年。

## デプロイ形式

- 各プロジェクトは **ビルド済み静的ファイルをフォルダ直下に直接配置**し、その場で遊べる形にする（life-timer 方式）。
- Vite プロジェクトは `npx vite build --base=./`（相対パス）でビルドし、`dist/*` をコピーする。
  - 例: 裏切りおでん = ソースは `~/game-theory/app`（GitHub: kmanastasia/uragiri-oden）→ `dist/*` を `self-projects/uragiri-oden/` へ。

## コミット時の注意

- 依頼された変更のファイルだけをステージする（無関係な未コミット変更・untracked を巻き込まない）。
