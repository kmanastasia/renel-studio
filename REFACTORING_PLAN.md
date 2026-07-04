# Renel. Studio サイト リファクタリング計画書

- 作成日: 2026-07-04
- 対象: このリポジトリ（`renel-studio/`）全体
- 前提: **この計画書と本リポジトリのコードだけ**を渡された実行者が、迷わず安全に完遂できることを合格条件とする
- 実行ルール: 1項目 = 1コミット。各項目の完了条件を満たせなければ**中断して報告**する（§6の指示文を参照）

---

## 1. 現状理解（実行者への文脈共有）

### 1.1 これは何のサイトか

Renel. Studio（個人スタジオ）の公式サイト。ビルドツールなしの**純粋な静的サイト**（HTML + CSS 1枚 + JS 1枚）。アニメーションに GSAP / ScrollTrigger / Lenis を CDN から読み込む。ダークトーン（黒×ゴールド）のブランドデザイン。

### 1.2 デプロイ【最重要の注意】

- GitHub リモート: `https://github.com/kmanastasia/renel-studio.git`
- **`main` へ push すると Cloudflare Pages で https://renel-studio.com に自動デプロイされる**（コミット履歴に「trigger redeploy」「Cloudflare Function」の形跡あり）。
- したがって本作業では **`git push` を絶対にしない**。全コミットはローカルに留め、push はオーナー（Karen）の承認後に行う。

### 1.3 ファイル構造マップ

```
renel-studio/
├── index.html            … トップページ（Hero / About / Business / Works予告 / Self-Projects / Contact）287行
├── css/style.css         … 全ページ共通スタイル 1229行。CSS変数でデザイントークン管理
├── js/main.js            … 全ページ共通スクリプト 503行。IIFE、機能ごとに init関数分割
│                            （Lenis / カーソル / ページカーテン遷移 / ナビ / スクロール演出 /
│                             3Dチルト / フィルタ / 問い合わせフォーム / マグネットボタン / 文字スクランブル）
│                            要素が無いページでは各機能を自動スキップする設計（null チェック済み）
├── works/index.html      … 実績一覧（フィルタ付きカードグリッド）200行
├── self-projects/
│   ├── index.html        … 個人制作一覧 107行
│   ├── life-timer/       … 「1日1アプリ」PWA。index.html 1223行に CSS/JS 全部入り（意図的な単一ファイル構成）
│   │   ├── index.html / sw.js / manifest.json / ogp.svg / screenshot.png / icons/(svg×2)
│   └── chemistry-match/  … 別リポジトリ（~/chemistry-match）の**ビルド成果物のコピー**。手を入れない（§5）
├── thank-you/index.html  … フォーム送信後のサンクスページ 112行
├── company/index.html    … 会社概要（準備中）。**どこからもリンクされていないが意図的に残置**
│                            （コミット 85b890c「Simplify Company page and remove from all footers」）。触らない
├── projects/index.html   … self-projects/ の**旧版の重複**。どこからもリンクされていない孤立ページ（R4で処理）
├── outputs/              … 制作メモ（.gitignore 済み、サイトの一部ではない）
└── assets/               … 空ディレクトリ（git 未追跡）。無視してよい
```

### 1.4 データフロー / 外部依存

- **問い合わせフォーム**（index.html → js/main.js `initForm`）: Web3Forms API（`https://api.web3forms.com/submit`）へ POST → 成功時 `https://renel-studio.com/thank-you` へリダイレクト。`access_key` はクライアント埋め込み前提の公開キーであり、**秘密情報ではない**（動かさないこと）。
- **CDN**: GSAP 3.12.5（バージョン固定済み）、Lenis（`lenis@latest` で**未固定** → R8）。Google Fonts。
- **life-timer**: localStorage（キー `lifetimer-v1`）に設定保存。Service Worker（sw.js）でオフラインキャッシュ。外部リンクは OFUSE（投げ銭）と共有系のみ。

### 1.5 ページ間の共通構造について

6つの HTML すべてに head / ナビ / フッター / CDN 読み込みがコピペで重複している。これは**ビルドステップを持たない静的サイトの意図的な構成**であり、テンプレートエンジンや SSG の導入は仕様変更にあたるため**行わない**（§5）。重複は許容し、壊れている箇所だけを直す。

### 1.6 問題の洗い出しと優先順位（効果×リスク）

| ID | 問題 | 効果 | リスク | 順位根拠 |
|---|---|---|---|---|
| R1 | 未定義CSS変数 `--radius-card`（実バグ） | 中 | 低 | バグ修正。最初に |
| R2 | `hero__eyebrow` のデッドコード（CSS+JS） | 小 | 低 | 削除のみ、検証容易 |
| R3 | 未使用CSSルール5群 | 小 | 低 | 削除のみ、検証容易 |
| R4 | 孤立した旧ページ projects/ | 中 | 低 | 古い内容が公開されたまま |
| R5 | life-timer のメタ情報リンク切れ3件 | 中 | 低 | SNS共有・PWAの実害あり |
| R6 | sw.js が cache-first で更新が永久に届かない | 高 | 中 | R5の後に。PWA挙動の理解必要 |
| R7 | フォーム成功時リダイレクトが絶対URL直書き | 中 | 低 | ローカル/プレビュー環境で壊れる |
| R8 | `lenis@latest` バージョン未固定 | 中 | 低 | 再現性・サプライチェーン対策 |
| R9 | フォームのメール形式チェック欠落 | 小 | 低 | エラー処理の穴。最後に |

---## 2. 項目0: 安全網の構築【最初に必ず実行】

### R0-a. 作業前コミットとタグ

```bash
cd ~/karen-studio/renel-studio
git status --short        # 期待: 出力なし（クリーン）。REFACTORING_PLAN.md のみ untracked なら OK
git checkout main
git tag refactor-baseline # 戻し先の目印
```

`git status` に REFACTORING_PLAN.md 以外の変更が出た場合は**中断して報告**（この計画の前提が崩れている）。

### R0-b. 特性テスト①: リンク検査スクリプト

テストが存在しないため、以下を `tools/check_links.py` として**そのまま**作成する。HTML 内の `href` / `src` が指すローカルファイルの存在を機械的に固定するのが目的。

```python
#!/usr/bin/env python3
"""renel-studio ローカルリンク検査。
全HTML内の href/src が指すローカルファイルの存在を確認する。
使い方: python3 tools/check_links.py  （リポジトリのどこから実行してもよい）
終了コード: 0=全リンク存在 / 1=欠損あり（欠損一覧を表示）
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIR_NAMES = {".git", "outputs", "node_modules", "tools"}
# chemistry-match はビルド成果物のコピーのため検査対象外
SKIP_SUBTREES = [ROOT / "self-projects" / "chemistry-match"]
ATTR_RE = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
EXTERNAL_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "data:", "#", "javascript:")

def main():
    missing = []
    for html in sorted(ROOT.rglob("*.html")):
        if any(p.name in SKIP_DIR_NAMES for p in html.parents):
            continue
        if any(html.is_relative_to(s) for s in SKIP_SUBTREES):
            continue
        text = html.read_text(encoding="utf-8")
        for m in ATTR_RE.finditer(text):
            raw = m.group(1)
            if raw.startswith(EXTERNAL_PREFIXES):
                continue
            url = raw.split("#")[0].split("?")[0]
            if not url:
                continue
            target = (html.parent / url).resolve()
            ok = target.is_file() or (target.is_dir() and (target / "index.html").is_file())
            if not ok:
                missing.append(f"{html.relative_to(ROOT)} -> {raw}")
    if missing:
        print("MISSING:")
        print("\n".join(missing))
        sys.exit(1)
    print("OK: all local href/src targets exist")
    sys.exit(0)

if __name__ == "__main__":
    main()
```

ベースライン取得:

```bash
python3 tools/check_links.py | tee tools/baseline_links.txt; echo "exit=$?"
```

**期待されるベースライン**（既知の欠損。R5 で解消するまではこの状態が「正」）:

```
MISSING:
self-projects/life-timer/index.html -> icons/icon-192.png
exit=1
```

これ以外の欠損が出た場合は**中断して報告**。

### R0-c. 特性テスト②: 手動スモークチェックリスト

ローカルサーバを**フォアグラウンドで**起動する（localhost のみ、外部通信なし）:

```bash
cd ~/karen-studio/renel-studio && python3 -m http.server 8000
```

ブラウザ（デスクトップ）で以下を確認し、結果を控える。**リスクの高い項目（R4/R6/R7/R8）の完了時にも同じ表で再確認する。**

| # | URL / 操作 | 期待結果 |
|---|---|---|
| S1 | `http://localhost:8000/` を開く | Hero の「Renel. Studio / Re. Born. / Re. New.」が1文字ずつ出現。金色のカスタムカーソルが追従 |
| S2 | ナビの「About」をクリック | About セクションへスムーススクロール（ページ遷移しない） |
| S3 | Self-Projects の「すべて見る →」をクリック | 金色カーテンが下から覆い、`/self-projects/` へ遷移。遷移先でカーテンが上へ抜ける |
| S4 | `/works/` でフィルタ「お野菜旅」をクリック | カードが2枚（収穫体験ツアー設計・産地ブランディング）だけ表示。「All」で9枚に戻る |
| S5 | `/self-projects/life-timer/` を開く | 緑のブート画面がタイプ表示 → クリックで本体へ。カウンタが毎秒更新 |
| S6 | life-timer で生年月日を変更しリロード | 変更値が保持されている（localStorage） |
| S7 | トップの問い合わせフォームを空のまま「送信する」 | 赤字で「すべての項目をご入力ください。」が表示される。**実際の送信テスト（全欄入力→送信）は行わない**（本物のメールが飛ぶため） |
| S8 | `http://localhost:8000/thank-you/` を直接開く | 「メッセージを受け取りました。」ページが表示される |

### R0-d. 安全網のコミット

```bash
git add tools/check_links.py tools/baseline_links.txt REFACTORING_PLAN.md
git commit -m "chore: add refactoring plan and link-check baseline (R0)"
```

---

## 3. 作業項目リスト（実行順）

> 各項目共通の戻し方: `git revert HEAD`（直前のコミットを打ち消す）。部分的に戻す場合は `git restore --source=refactor-baseline -- <ファイル>`。

### R1. 未定義CSS変数 `--radius-card` の修正

- **対象**: `css/style.css:944`（`.works-upcoming` ブロック内）
- **問題**: `border-radius: var(--radius-card);` の `--radius-card` は `:root` に定義がなく、無効値となり角丸が 0 になっている（実バグ）。
- **どう変えるか**: 同種のパネル（`.form` / `.biz-tile`）が使う定義済みトークンに揃える。

  ```css
  /* before (style.css:944) */
    border-radius: var(--radius-card);
  /* after */
    border-radius: var(--radius-xl);
  ```

- **注意**: トップページ Works セクションの「Upcoming」パネルの角が四角→16px 角丸に変わる。これはバグ修正による**意図されたデザインへの復帰**であり、見た目が変わって正しい。
- **完了条件**:
  - `grep -n "radius-card" css/style.css` → ヒット 0 件
  - S1 のページで Works の「Upcoming」パネルに角丸が付いて表示される
- **リスク/戻し方**: リスクほぼなし。`git revert HEAD`
- **依存**: R0

### R2. `hero__eyebrow` デッドコードの削除（CSS + JS）

- **対象**: `css/style.css:415-422`（`.hero__eyebrow { ... }` ブロック）、`js/main.js:232, 235, 246-248`
- **問題**: `.hero__eyebrow` 要素はどの HTML にも存在しない（削除前に下記 grep で再確認）。CSS ルールと JS のアニメーション処理が死んでいる。
- **どう変えるか**:
  1. 事前確認: `grep -rn "hero__eyebrow" --include="*.html" .` → 0 件であること（1件でもあれば**中断**）
  2. `css/style.css` の `.hero__eyebrow { ... }` ブロック（8行）を削除
  3. `js/main.js` を以下の通り変更:

  ```js
  // before (main.js:232)
  const eyebrow = hero.querySelector(".hero__eyebrow");
  // → 行ごと削除

  // before (main.js:235)
  [eyebrow, sub, cta].forEach(function (el) {
  // after
  [sub, cta].forEach(function (el) {

  // before (main.js:246-248)
  if (eyebrow) {
    tl.from(eyebrow, { y: -10, opacity: 0, duration: 0.5, ease: "expo.out" }, 0.15);
  }
  // → 3行とも削除
  ```

- **完了条件**:
  - `grep -rn "eyebrow" css/ js/` → ヒット 0 件
  - S1 を再実行: Hero の文字アニメーションが従来通り動く（ブラウザのコンソールにエラーが出ない）
- **リスク/戻し方**: `eyebrow` は元々 null で全処理がスキップされているため挙動変化なし。`git revert HEAD`
- **依存**: R0

### R3. 未使用CSSルールの削除

- **対象**: `css/style.css` の以下5群
  | セレクタ | 行範囲（目安） | 死んでいる理由 |
  |---|---|---|
  | `.page-curtain.leaving` + `@keyframes curtain-out` | 158-160, 171-178 | JS は入場をインラインスタイルで行い `leaving` クラスを一切付与しない（main.js:117-125 参照） |
  | `.contact__lead` | 978-985 | どの HTML にも存在しない |
  | `.contact__channels`（`a` / `a:hover` 含む） | 991-1006 | 同上 |
  | `.form__note` | 1068-1071 | 同上 |
  | `.company-table` 一式（`th,td` / `th` / `td a` / `td a:hover`） | 1167-1198 | company/index.html は簡素化済みで table を持たない |
- **問題**: 参照ゼロのルールが 60 行超あり、CSS の見通しを悪くしている。
- **どう変えるか**: 削除前に**各セレクタごとに**参照ゼロを確認してから削除する:

  ```bash
  for sel in "curtain-out" "leaving" "contact__lead" "contact__channels" "form__note" "company-table"; do
    echo "== $sel =="
    grep -rn "$sel" --include="*.html" --include="*.js" . | grep -v ".git/" | grep -v chemistry-match
  done
  ```

  期待: `leaving` を含め**すべて 0 件**（style.css 自身のヒットは除く）。1件でも HTML/JS 側にヒットしたら、そのセレクタは削除対象から外して報告する。
- **完了条件**:
  - 上記 grep で削除済みセレクタが style.css からも消えている（ヒット 0 件）
  - S1 / S3 / S8 を再実行して表示崩れがない（特にカーテン遷移と company ページ `http://localhost:8000/company/` の表示）
- **リスク/戻し方**: 削除しすぎ（行範囲ズレ）に注意。行番号はズレる可能性があるため**必ずセレクタ名で検索して**ブロック単位で削除する。`git revert HEAD`
- **依存**: R0（R2 とは独立だが、行番号ズレを避けるため R2 の後に実施）

### R4. 孤立した旧ページ `projects/index.html` をリダイレクトスタブ化

- **対象**: `projects/index.html`（全96行）
- **問題**: `self-projects/` の旧版の重複。サイト内のどこからもリンクされていない（自分自身へのリンクのみ）が、URL 直打ちや古い外部リンクで到達でき、**古い内容（カード1枚・旧フッター表記）が公開されたまま**になっている。
- **どう変えるか**: 削除ではなく（外部リンク切れ防止のため）、ファイル全体を以下のリダイレクトスタブで**丸ごと置き換える**:

  ```html
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="refresh" content="0; url=../self-projects/index.html" />
      <meta name="robots" content="noindex" />
      <title>Self-Projects — Renel. Studio</title>
      <link rel="canonical" href="https://renel-studio.com/self-projects/" />
    </head>
    <body>
      <p><a href="../self-projects/index.html">Self-Projects へ移動しました</a></p>
    </body>
  </html>
  ```

- **完了条件**:
  - `http://localhost:8000/projects/` を開くと即座に `/self-projects/` の内容が表示される
  - `python3 tools/check_links.py` の結果がベースライン（`tools/baseline_links.txt`）と一致（欠損は life-timer の icon-192.png の1件のみ）
- **リスク/戻し方**: 旧ページを見ていた人にはレイアウトなしの一瞬の白画面が挟まる（許容）。戻す場合 `git revert HEAD` で旧ページ復活。
- **依存**: R0

### R5. life-timer のメタ情報リンク切れ修正（3件）

- **対象**: `self-projects/life-timer/index.html:11, 16, 24` と `self-projects/life-timer/manifest.json:24-31`
- **問題**: 存在しないファイルへの参照が3種類ある。
  1. OGP画像: `https://renel-studio.com/self-produced/life-timer/ogp.png` — ディレクトリ名が誤り（`self-produced` → 正しくは `self-projects`）かつ `ogp.png` は存在しない（あるのは `ogp.svg`。ただし X/Facebook のクローラは SVG 非対応）→ SNS シェア時に画像が出ない
  2. `<link rel="apple-touch-icon" href="icons/icon-192.png">` — PNG は存在しない（SVG のみ）→ 404
  3. manifest.json の `screenshots` が `ogp.png` を参照 → 存在しない
- **どう変えるか**: 新規アセットは作らず、実在する PNG（`screenshot.png`）への差し替えと、壊れている参照の削除で対応する。

  ```html
  <!-- index.html:11 before -->
  <meta property="og:image" content="https://renel-studio.com/self-produced/life-timer/ogp.png">
  <!-- after -->
  <meta property="og:image" content="https://renel-studio.com/self-projects/life-timer/screenshot.png">

  <!-- index.html:16 before -->
  <meta name="twitter:image" content="https://renel-studio.com/self-produced/life-timer/ogp.png">
  <!-- after -->
  <meta name="twitter:image" content="https://renel-studio.com/self-projects/life-timer/screenshot.png">

  <!-- index.html:24 before -->
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <!-- after: この行を削除（現状 404 で機能していないため、削除は挙動不変） -->
  ```

  ```jsonc
  // manifest.json: "screenshots": [ ... ] の配列ブロック（"icons" の後）を丸ごと削除。
  // 削除後も JSON として妥当なこと（末尾カンマを残さない）。
  ```

- **完了条件**:
  - `python3 tools/check_links.py` → `OK: all local href/src targets exist`（exit 0）。**ここで初めてベースラインの欠損が解消される**
  - `python3 -c "import json; json.load(open('self-projects/life-timer/manifest.json'))"` → エラーなし
  - S5 を再実行: life-timer が従来通り動く
- **リスク/戻し方**: OGP はクローラのキャッシュがあるため即時反映されないが、コード上は正しくなる。`git revert HEAD`
- **依存**: R0

### R6. life-timer sw.js: HTML を network-first 化 + キャッシュ名の更新

- **対象**: `self-projects/life-timer/sw.js:1, 26-39`
- **問題**: 現在は全リクエスト cache-first で、`CACHE = "lifetimer-v1"` のままコンテンツだけ更新されてきた（git log 参照）。**SW をインストール済みの訪問者には index.html の更新が永久に届かない**。R5 の修正を届けるためにも直す必要がある。
- **どう変えるか**: ナビゲーション（HTML）だけ network-first にし、キャッシュ名を bump する。

  ```js
  // before (sw.js:1)
  const CACHE = "lifetimer-v1";
  // after
  const CACHE = "lifetimer-v2";

  // before (sw.js:26-39) fetch ハンドラ全体
  self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;
    e.respondWith(
      caches.match(e.request).then(cached => { /* cache-first */ ... })
    );
  });
  // after: fetch ハンドラを以下に丸ごと置き換え
  self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;
    // HTML(ページ遷移)は network-first: 更新を即座に届け、オフライン時のみキャッシュ
    if (e.request.mode === "navigate") {
      e.respondWith(
        fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        }).catch(() => caches.match(e.request))
      );
      return;
    }
    // それ以外(フォント・アイコン等)は従来通り cache-first
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (!res || res.status !== 200 || res.type === "opaque") return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        }).catch(() => cached);
      })
    );
  });
  ```

  ※ `install` / `activate` ハンドラは変更しない（`activate` の旧キャッシュ削除処理が `lifetimer-v1` を自動掃除してくれる）。
- **完了条件**: ローカルサーバ起動中に Chrome で確認:
  1. `http://localhost:8000/self-projects/life-timer/` を開く → DevTools > Application > Service Workers で新 SW が activated になる（「Update on reload」を一時的に ON にすると確実）
  2. Application > Cache Storage に `lifetimer-v2` があり `lifetimer-v1` が消えている
  3. DevTools > Network で「Offline」にしてリロード → ページが表示される（オフラインフォールバック維持）
  4. Offline を解除して S5 を再実行 → 正常動作
- **リスク/戻し方**: SW は挙動が独特（確認時は必ずリロード2回 or Update on reload）。壊れた場合は `git revert HEAD` し、DevTools > Application > Service Workers > Unregister でローカルの SW を削除してから再確認。
- **依存**: **R5**（v2 キャッシュに修正済み HTML を載せるため、必ず R5 の後）

### R7. フォーム成功時リダイレクトを相対URL化

- **対象**: `js/main.js:421`
- **問題**: `window.location.href = "https://renel-studio.com/thank-you";` と本番ドメインが直書きされており、ローカルや Cloudflare のプレビュー環境では送信成功後に本番サイトへ飛んでしまう（環境非依存性の欠如、直値の散在）。
- **どう変えるか**:

  ```js
  // before (main.js:421)
  window.location.href = "https://renel-studio.com/thank-you";
  // after — フォームはサイトルートの index.html にのみ存在するため相対で解決できる
  window.location.href = "thank-you/";
  ```

- **完了条件**:
  - `grep -n "renel-studio.com" js/main.js` → ヒット 0 件
  - S7 を再実行（空送信エラーが従来通り出る）。**実送信テストは行わない**。成功パスは静的レビューで確認: このコードが動くのはトップページのみ → `thank-you/` は `/thank-you/` に解決され、S8 で表示確認済みのページに着地する
- **リスク/戻し方**: 実送信を伴う経路のため、push 後の本番で1回だけ実地確認する必要がある旨を最終報告に明記すること。`git revert HEAD`
- **依存**: R0

### R8. Lenis の CDN バージョン固定

- **対象**: 5ファイルの `<script src="https://unpkg.com/lenis@latest/dist/lenis.min.js">`
  - `index.html:283` / `works/index.html:196` / `self-projects/index.html:103` / `thank-you/index.html:108` / `company/index.html:76`
  - （`projects/index.html` は R4 でスタブ化済みのため対象外）
- **問題**: `@latest` は取得タイミングで中身が変わる。表示の再現性がなく、CDN 側の破壊的変更やサプライチェーン攻撃に無防備。GSAP は 3.12.5 固定済みで、Lenis だけが未固定。
- **どう変えるか**:
  1. 現在実際に配信されているバージョンを確認する: ブラウザで `https://unpkg.com/lenis@latest/dist/lenis.min.js` を開くと、アドレスバーが `https://unpkg.com/lenis@X.Y.Z/dist/lenis.min.js` にリダイレクトされる。この `X.Y.Z` を控える
  2. 5ファイルすべてで `lenis@latest` → `lenis@X.Y.Z` に置換（**5ファイルで同一バージョンにする**）
- **完了条件**:
  - `grep -rn "lenis@latest" --include="*.html" .` → ヒット 0 件
  - `grep -rn "lenis@" --include="*.html" . | grep -v ".git/"` → 5件すべて同一バージョン
  - S1 / S2 を再実行: スムーススクロールが従来通り動く（ブラウザのコンソールで `typeof Lenis` が `"function"` を返す）
- **リスク/戻し方**: 確認したバージョンをそのまま固定するため挙動は不変。`git revert HEAD`
- **依存**: **R4**（対象ファイル数を確定させるため）

### R9. フォームのメール形式チェック追加

- **対象**: `js/main.js:390-396` 付近（`initForm` 内、空チェックの直後）
- **問題**: `<form novalidate>` のためブラウザ標準のメール形式チェックが無効化されており、JS 側も空チェックしかしていない。形式不正のまま API に送られ、送信失敗の原因が利用者に分からない（エラー処理の穴）。
- **どう変えるか**: 独自の正規表現は書かず、ブラウザ標準の検証（`type="email"` の `checkValidity()`）をそのまま使う。空チェックブロックの**直後**に挿入:

  ```js
  // main.js: 以下の既存ブロックの直後に挿入
  //   if (!name || !email || !message) { ...「すべての項目をご入力ください。」... return; }
  if (!form.querySelector("#email").checkValidity()) {
    if (status) {
      status.classList.add("is-error");
      status.textContent = "メールアドレスの形式をご確認ください。";
    }
    return;
  }
  ```

- **完了条件**: S7 の環境で:
  1. 名前とメッセージを入力、メール欄に `abc` と入力して送信 → 「メールアドレスの形式をご確認ください。」が赤字表示され、DevTools > Network に `web3forms` への通信が**発生しない**
  2. 空送信 → 従来の「すべての項目をご入力ください。」が出る（順序が変わっていない）
  3. **正しいメールでの実送信テストは行わない**
- **リスク/戻し方**: これまで通っていた不正形式が弾かれるようになる（意図した変更）。`git revert HEAD`
- **依存**: **R7**（同一関数 `initForm` を触るため、コンフリクト回避で順番に）

---

## 4. やらないことリスト（実行者への禁止事項）

善意でも以下は**行わない**。必要と感じたら作業を止めて報告すること。

1. **`git push` しない** — push = 本番デプロイ。全コミットはローカルに留める（§1.2）
2. **`self-projects/chemistry-match/` に一切触れない** — 別リポジトリのビルド成果物のコピー。修正は元リポジトリ側で行い「Sync」コミットで持ち込む運用
3. **`company/index.html` を削除・変更しない** — リンクされていないのは意図的（URL 直打ち用に残置）
4. **テンプレートエンジン / SSG / ビルドステップを導入しない** — head/ナビ/フッターの重複は既知で許容済み
5. **ライブラリを更新しない** — GSAP 3.12.5 は据え置き。R8 は「現在配信中のバージョンをそのまま固定する」だけで、アップグレードではない
6. **CDN の SRI（integrity属性）追加や、ライブラリ・フォントのセルフホスト化をしない** — 検証コストに対して今回のスコープ外
7. **Web3Forms の `access_key` を隠そうとしない**（.env 化・難読化等） — クライアント埋め込み前提の公開キーであり、移動すると静的サイトとして動かなくなる
8. **文言・コンテンツ・デザインを変更しない** — works のカード内容、About の詩的コピー、配色等はすべて意図的。R1 の角丸復帰だけが唯一の見た目変化
9. **life-timer の単一ファイル構成（HTML内にCSS/JS全部入り）を分割しない** — 「1日1アプリ」の配布形態として意図的。分割は SW キャッシュ戦略の再設計を伴い、効果に対してリスクが大きい
10. **フォームの実送信テストをしない** — 本物の通知メールが飛ぶ。成功パスの実地確認は push 後にオーナーが行う
11. **`.env`・設定ファイル・リポジトリ外のファイルに触れない / 新しいパッケージをインストールしない** — 本計画は Python 標準ライブラリとブラウザだけで完遂できる

---

## 5. 完成計画のトレース検証（実施済み）

提出前に実行順で前提破壊がないか検証した結果:

- R2→R3: 両方 style.css を触るが対象ブロックは重複しない。R3 の行番号は R2 後にズレるため、R3 は**セレクタ名検索で削除**するよう指示済み
- R4→R8: R4 が projects/ から CDN 読み込みを除去するため、R8 の対象は5ファイルで確定。逆順だと R8 の完了条件（件数）が狂う → 依存として明記済み
- R5→R6: R6 のキャッシュ bump（v2）が R5 修正済みの HTML を配布する。逆順だと壊れた HTML が v2 に焼き付く → 依存として明記済み
- R7→R9: 同一関数を編集。R9 の挿入位置指定（空チェック直後）は R7 の変更（関数末尾側）と干渉しない
- リンク検査: R0 で欠損1件をベースライン固定 → R4 完了条件で「ベースラインと一致」→ R5 完了条件で「exit 0」に更新。矛盾なし

---

## 6. 実行者への指示文（このままコピペして渡す）

```
あなたはリファクタリングの実行者です。~/karen-studio/renel-studio/ の REFACTORING_PLAN.md を開き、
その内容だけに従って作業してください。ルール:

1. まず REFACTORING_PLAN.md の §1（現状理解）と §4（やらないことリスト）を読んでから着手する
2. 項目0（安全網）を最初に実行する。ベースラインが計画書の期待と一致しなければ中断して報告する
3. 作業は R1→R2→R3→R4→R5→R6→R7→R8→R9 の順。1項目ずつ実施し、1項目ごとに
   計画書記載の完了条件をすべて確認してからコミットする（1項目=1コミット）
4. 完了条件を1つでも満たせない場合、その項目の変更を破棄（git checkout -- <file>）して中断し、
   何をどう試して何が期待と違ったかを報告する。勝手に別解を試さない
5. git push は絶対にしない（push すると本番サイトに即デプロイされる）
6. 計画書に書かれていない改善点に気づいても実施せず、報告に「提案」として書くにとどめる
7. 全項目完了後、git log --oneline refactor-baseline..HEAD と、スモークチェック（§2 R0-c）の
   最終結果表を添えて報告する
```
