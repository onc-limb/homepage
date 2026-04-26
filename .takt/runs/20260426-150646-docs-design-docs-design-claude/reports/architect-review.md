# アーキテクチャレビュー

## 結果: APPROVE

## サマリー
前回 REJECT した 6 件のブロッキング指摘（DRY 違反 5 件 + 純粋関数テスト欠落 1 件）はすべて適切な責務境界で解消済み。新規ブロッキング問題なし。

## 解消済み（resolved）
| finding_id | 解消根拠 |
|------------|----------|
| ARCH-NEW-BookCluster-tests-L44 | `service/components/books/__tests__/BookCluster.test.ts` 追加（13 ケース：空入力/上位 N/lexical tiebreak/limit/隅座標/最初一致割当/非該当除外/`isRead`→status/座標 5..95 クランプ/related 自身除外+4 件 cap/共有ゼロ/memo→notes fallback） |
| ARCH-NEW-isActive-dup | `service/components/header/nav-utils.ts:6-9` に `isNavItemActive` 集約。`SiteNav.tsx:5,14` / `MobileNav.tsx:6,29` から import、重複定義 grep ヒット 0 件 |
| ARCH-NEW-social-urls-dup | `service/lib/constants.ts:22-38` に `SOCIAL_LINKS` canonical 定義。`Footer.tsx:2,41` / `social/page.tsx:6,63` / `app/page.tsx:2,10-14` がすべて参照（app/page.tsx は初期化時 Fail Fast 検証） |
| ARCH-NEW-projectNumber-dup | `service/lib/portfolio.ts:188-205` に `formatProjectNumber(category, indexInList)` を export、`CATEGORY_PREFIX` テーブル経由。`PortfolioSection.tsx:41` / `app/portfolio/[id]/page.tsx:46` が共用、ハードコード grep ヒット 0 件 |
| ARCH-NEW-icon-dup | `service/components/icons/{GitHubIcon,ExternalIcon,XIcon,index}.tsx` 新設、3 消費者（`ProjectCard.tsx:3` / `portfolio/[id]/page.tsx:11` / `social/page.tsx:5`）が import。SVG 定義は icons/ 配下のみ |
| ARCH-NEW-PortfolioSection-dup | `service/components/portfolio/PortfolioSection.tsx` 新設、`PortfolioListClient.tsx:24-39` が同コンポーネントを 2 回呼ぶ形に統合、`number` は `formatProjectNumber` 共用 |

## 検証証跡
- ビルド: 未実行（編集禁止フェーズ）。`coder-decisions.md` 第7項で `tsc --noEmit EXIT=0` / `pnpm lint warnings 0` 記録済み
- テスト: 未実行（編集禁止フェーズ）。テスト追加（`BookCluster.test.ts` 13 / `nav-utils.test.ts` 5 / `reveal-attr.test.ts` 3）はソース直読で確認
- 動作確認: 未実行。git status・各ファイル全文 Read・`grep` による重複定義/呼び出し元/契約文字列の全件確認で実施