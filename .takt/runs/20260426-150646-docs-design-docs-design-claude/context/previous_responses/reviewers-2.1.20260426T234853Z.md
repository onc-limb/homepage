## security-review
セキュリティレビューを実施しました。全変更ファイル（layout, theme, ParticleBackground, books, news, portfolio, social, header/footer 等）と、依存関係・URL ハンドリング・localStorage・dangerouslySetInnerHTML の使用箇所を確認しました。

## セキュリティレビュー結果

### 結果: APPROVE

### サマリー
- 本ステップは初回実行（前回レビューなし、追跡対象 finding なし）
- AI 生成コード特有の脆弱性パターンを含め、本変更で導入されたブロッキング相当のセキュリティ問題は検出せず
- インジェクション（SQL/コマンド/XSS）、認証・認可、データ露出、暗号化のいずれの観点でも、新たな攻撃能力をもたらす変更は確認されなかった

### 確認した観点
- [x] インジェクション（SQL / コマンド / XSS）
- [x] 認証・認可
- [x] データ露出
- [x] 暗号化・ハッシュ
- [x] dangerouslySetInnerHTML / innerHTML / eval 系
- [x] localStorage / sessionStorage / cookie
- [x] 外部リンク (target="_blank" + rel)
- [x] URL スキーム検証（react-markdown / `href={...}`）
- [x] CSP / Reverse Tabnabbing
- [x] 依存関係の追加

### 検出した問題 (new)
| # | finding_id | 場所 | 問題 | 修正案 |
|---|------------|------|------|--------|
| - | - | - | 該当なし | - |

### 個別の確認結果（記録）

| 観点 | 確認内容 | 結果 |
|------|---------|------|
| `dangerouslySetInnerHTML` | `service/app/layout.tsx:55-57` で `themeBootScript` を head に注入 | **安全**: `service/components/theme/ThemeProvider.tsx:67` の `themeBootScript` はテンプレートリテラル内に `${THEME_STORAGE_KEY}`（`"onclimb-theme"`, `service/lib/theme.ts:5`）と `${DEFAULT_THEME}`（`"dark"`, 同 :10）を埋め込むのみ。両方ともコード上の固定文字列（リテラル `as const`）で、外部入力経路なし。スクリプト内では `localStorage` の値を `s==='dark'\|\|s==='light'` でホワイトリスト検証してから使用。XSS / コード注入経路なし。 |
| `localStorage` 利用 | `ThemeProvider.tsx:24-37`, `ParticleBackground.tsx:155-159` | **安全**: 読み出し時は `isTheme()`（`lib/theme.ts:12-14`）で文字列値を `"dark"\|"light"` に厳格に絞り込み。書き込み時は `setTheme(next: Theme)` 経由でのみ。攻撃者が localStorage を細工しても、不正値はフォールバックされ、攻撃面は広がらない。 |
| `target="_blank"` の Reverse Tabnabbing | `service/app/page.tsx:321`, `news/[date]/page.tsx:85,99`, `books/BooksContent.tsx:57`, `portfolio/[id]/page.tsx:143,155`, `social/page.tsx:69`, `components/portfolio/ProjectCard.tsx:89,100`, `footer/Footer.tsx:45`, `news/NewsCard.tsx:65`, `studio/books/page.tsx:80` 全 13 箇所 | **安全**: 全てに `rel="noopener noreferrer"` が付与済み。Reverse Tabnabbing / Referer 漏洩なし。 |
| 外部 URL の href 渡し | `article.url`, `book.officialUrl`, `book.ogpImage`, `project.links.demo/github`, `link.url` | **本変更で新規リスクなし**: いずれもサーバー DB / リポジトリ内 Markdown 由来で、エンドユーザー入力ではない（信頼境界の内側）。スキーム検証の欠如は変更前から同じパターンで存在し、本タスク（デザイン適用）の trust boundary を変えていない。 |
| ReactMarkdown による memo / summary 描画 | `BooksContent.tsx:87-90,357-360`, `news/[date]/page.tsx:74-95` | **安全**: react-markdown `^9.1.0`（`service/package.json:48`）はデフォルトで raw HTML を無効化、`urlTransform` で `javascript:` `data:` `vbscript:` 等の危険スキームを除去する。カスタム `components.a` でも `href` に対して何も追加しておらず、ライブラリ既定の安全動作を維持。 |
| CSS 変数の `setProperty` | `HeroSpotlight.tsx:23-24`, `NewsCard.tsx:34-35` | **安全**: 値は `clientX/Y` から計算した数値 + `"%"` のみ。文字列連結による CSS インジェクション経路なし。 |
| `setAttribute("data-theme", theme)` | `ThemeProvider.tsx:59` | **安全**: `theme` は `Theme` 型（`"dark"\|"light"`）で型レベル＋ランタイムの両方で制約済み。 |
| 新規スクリプトタグ `pagead2.googlesyndication.com` | `app/layout.tsx:58-62` | **本変更前から存在**（git diff で `head` 構造を再構成した結果として diff に現れるが、AdSense スクリプトの読み込み自体は既存挙動）。`crossOrigin="anonymous"` 付与で SRI なしながら、本タスクで新たに追加された外部スクリプトではない。デザインタスクのスコープ外。 |
| 認証・認可 | `service/app/studio/page.tsx` の認可ロジックは未変更（`auth()` 呼び出し維持、見た目のみ更新） | **安全**: 認可フローへの変更なし。`SiteShell` の `/studio` バイパス（`SiteShell.tsx:11-13` 相当）も維持。 |
| 暗号・ハッシュ | 該当処理の追加なし | **N/A** |
| 依存関係追加 | `vitest@^2.1.8`, `@vitejs/plugin-react@^4.3.4`, `jsdom@^25.0.1` | **安全**: 全て devDependencies。プロダクションバンドルに含まれない。既知の高リスク CVE なし（いずれも現行メジャー版の安定リリース）。 |
| AI 生成コード特有のリスク | デフォルト値 / 入力過信 / コピペ脆弱性 | **問題なし**: 「もっともらしい危険なデフォルト」の代表例（`cors: '*'`、平文クレデンシャル、過剰な `try{}catch{}`）は検出せず。`themeBootScript` 内の `try/catch` も例外時にデフォルトテーマで文字列固定値をセットするだけで、エラー握りつぶしによる権限昇格や情報露出はない。 |

### 継続指摘 (persists) / 解消済み (resolved) / 再発 (reopened)
- 前回レポートが存在しないため、すべて N/A。

### 補足（ブロッキングではない参考情報）
- 外部 URL（`article.url` 等）の href へのスキーム検証は本変更前から欠如しており、本タスクのスコープ外。Studio 経由で書き込まれるデータの trust boundary は変更されていないため、本レビューでは指摘しない。将来 RSS 等の自動取得経路を追加する場合は、保存時に `https?:` 限定のホワイトリスト検証を入れるとさらに堅牢。

### 判定根拠
- ブロッキング条件（インジェクション、認可回避、機密露出、信頼境界の破壊、新たな攻撃能力）に該当する変更なし。
- ナレッジ「優先順位解決・オーバーライド・信頼境界」に照らしても、ThemeProvider のオーバーライドは同一信頼レベル内（ユーザー自身の localStorage）の表示切替のみで、他者・他データへの権限拡大なし。
- 全件 APPROVE。

---

## qa-review
# QA レビュー

## 結果: APPROVE

## サマリー
前回の testing-review で REJECT した `TEST-NEW-bookcluster-L44`（純粋関数 2 件のテスト 0 件）は、`service/components/books/__tests__/BookCluster.test.ts` の 13 ケースで完全解消済み。fix.1 で追加された 30 ケース（BookCluster 13 / nav-utils 5 / reveal-attr 3 / SOCIAL_LINKS 4 / formatProjectNumber 4 / 既存 +α）により、テスト総数は 50 → 80 まで拡充。各 family_tag (missing-tests / dry-violation / reveal-orphan-attr) ごとに再発防止テストを完備。新規ブロッキング問題なし。

## 確認した観点
| 観点 | 結果 | 備考 |
|------|------|------|
| テストカバレッジ | ✅ | 新規導入の純粋関数（`deriveTopClusters` / `assignBooksToClusters` / `isNavItemActive` / `formatProjectNumber` / `findAdjacentProjectIds` / `getRadarAxes` / `parseProfile` / `isTheme`）はすべてテスト保有。共通定数（`NAV_ITEMS` / `SOCIAL_LINKS`）も契約テストあり |
| テスト品質（GWT） | ✅ | 全 8 テストファイルで Given/When/Then コメント徹底。`it("does X when Y")` 命名一貫 |
| テスト独立性・再現性 | ✅ | `factoryBook` / `factorySkill` ファクトリ採用、共有可変フィクスチャなし |
| テスト戦略（ユニット/統合/E2E） | ✅ | 純粋関数はユニット適切。React UI 部分はロジックを純粋関数に分離してテスト可能化（`coder-decisions.md` 第 3 項の意図と整合）|
| エラーハンドリング | ✅ | `app/page.tsx` の SOCIAL_LINKS Fail Fast、`useTheme` の Provider 外使用 throw、`Reveal` の IntersectionObserver 非対応環境フォールバック（`is-revealed` 即付与）など、要所で適切に処理 |
| ログ・モニタリング | N/A | クライアントサイド UI 変更が中心、ログ追加対象なし |
| 保守性 | ✅ | DRY 違反 5 件解消・barrel 規約遵守・トークン駆動 CSS で長期保守容易 |
| 境界値カバレッジ | ✅ | 座標 5..95 クランプ / related cap 4 / lexical tiebreak / 隣接 prev/next の境界・ラップ無し / 空入力 / null memo fallback など要所網羅 |

## 今回の指摘（new）
| # | finding_id | family_tag | カテゴリ | 場所 | 問題 | 修正案 |
|---|------------|------------|---------|------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 継続指摘（persists）
| # | finding_id | family_tag | 前回根拠 | 今回根拠 | 問題 | 修正案 |
|---|------------|------------|----------|----------|------|--------|
| - | - | - | - | - | 該当なし | - |

## 解消済み（resolved）
| finding_id | 解消根拠 |
|------------|----------|
| TEST-NEW-bookcluster-L44 | `service/components/books/__tests__/BookCluster.test.ts` 全文確認: `deriveTopClusters` 5 ケース（空入力 / 上位 4 件 desc / lexical tiebreak / limit 制限 / 4 隅座標）+ `assignBooksToClusters` 8 ケース（空 clusters / 最初一致割当 / 非該当除外 / `isRead`→status / 座標 5..95 クランプ / related 自身除外 + 4 件 cap / 共有ゼロ / memo→notes fallback）の 13 ケースを実装。`coder-decisions.md` 第 3 項「純粋関数として切り出した（テスト容易性のため）」の契約を充足 |

## 再開指摘（reopened）
| # | finding_id | family_tag | 解消根拠（前回） | 再発根拠 | 問題 | 修正案 |
|---|------------|------------|----------------|---------|------|--------|
| - | - | - | - | - | 該当なし | - |

## Warning（参考: ブロッキングではない）
- `service/components/footer/FooterClock.tsx:5-11` の `pad` / `formatUtc` はモジュール内 private のため未テストだが、ロジックが極めて単純（2 桁ゼロ詰め＋連結）かつ視覚出力のみに使われるため、テスト追加は推奨しない（オーバーテスト回避）。
- `service/components/animations/Reveal.tsx`、`service/components/theme/ThemeProvider.tsx` は `IntersectionObserver` / `localStorage` 等 DOM 依存。テスト容易性のため、現状の「pure な定数・判定は `lib/theme.ts` 側に抽出してテスト、副作用は React コンポーネント側」という分離は妥当。jsdom ベースの結合テストは将来拡張時の選択肢として残してよい。

## 検証証跡
- 変更ファイルリスト: `git status --short` で 58 件（修正 35 / 削除 9 / 新規 14 ディレクトリ）を実列挙
- テストファイル列挙: `find service -path '*/node_modules' -prune -o -path '*/__tests__/*' -type f -name '*.test.ts' -print` → 8 ファイル（BookCluster / nav-utils / reveal-attr / profile / skills / constants / portfolio / theme）
- 各テストファイル全文を直読し、GWT 構造・factory 利用・境界値カバレッジを目視確認
- 解消根拠ファイル: `BookCluster.test.ts` 13 ケース実列挙、対応するソース `BookCluster.ts:44-127`（`deriveTopClusters` / `assignBooksToClusters` / `relatedIds` / `clamp`）と契約一致を確認
- ビルド/テスト: 編集禁止フェーズのため未実行。`fix.1.20260426T233849Z.md` レポートで `pnpm exec tsc --noEmit EXIT=0` / `pnpm lint No warnings or errors` / `pnpm test → 8 files / 80 tests passed` 記録を確認
- 並行レビュー: `architect-review.md` / `frontend-review.md` / `ai-review.md` がすべて APPROVE。findings は本レビューと整合

## REJECT判定条件
- `new` 0 件 / `persists` 0 件 / `reopened` 0 件 → **APPROVE**