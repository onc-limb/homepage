# 変更スコープ宣言

## タスク
docs/design 素案を service/ サイト (Next.js 15 + Tailwind) に再実装で適用。デザイントークン、共通シェル、各公開ページを素案準拠に置換。

## 変更予定

### 共通基盤
| 種別 | ファイル |
|------|---------|
| 変更 | `service/tailwind.config.ts` |
| 変更 | `service/tailwind.config.js` |
| 変更 | `service/app/globals.css` |
| 変更 | `service/app/layout.tsx` |
| 変更 | `service/components/SiteShell.tsx` |
| 変更 | `service/lib/constants.ts` |
| 作成 | `service/lib/theme.ts` |

### Theme / Reveal / Particle
| 種別 | ファイル |
|------|---------|
| 作成 | `service/components/theme/ThemeProvider.tsx` |
| 作成 | `service/components/theme/ThemeToggle.tsx` |
| 作成 | `service/components/theme/index.ts` |
| 作成 | `service/components/animations/ParticleBackground.tsx` |
| 作成 | `service/components/animations/Reveal.tsx` |
| 作成 | `service/components/animations/FloatingShapes.tsx` |
| 作成 | `service/components/animations/HeroParticleTitle.tsx` |
| 作成 | `service/components/animations/HeroSpotlight.tsx` |
| 変更 | `service/components/animations/index.ts` |

### Header / Footer
| 種別 | ファイル |
|------|---------|
| 変更 | `service/components/header/Header.tsx` |
| 作成 | `service/components/header/SiteBrand.tsx` |
| 作成 | `service/components/header/SiteNav.tsx` |
| 作成 | `service/components/header/MobileNav.tsx` |
| 変更 | `service/components/header/index.ts` |
| 削除 | `service/components/header/HeaderButton.tsx` |
| 作成 | `service/components/footer/Footer.tsx` |
| 作成 | `service/components/footer/FooterClock.tsx` |
| 作成 | `service/components/footer/index.ts` |
| 削除 | `service/components/footer.tsx` |

### 既存 animation 削除
| 種別 | ファイル |
|------|---------|
| 削除 | `service/components/animations/GeometricBackground.tsx` |
| 削除 | `service/components/animations/FloatingShape.tsx` |
| 削除 | `service/components/animations/HeroContent.tsx` |
| 削除 | `service/components/animations/AnimatedNavCard.tsx` |
| 削除 | `service/components/animations/AnimatedSkillCard.tsx` |
| 削除 | `service/components/animations/FadeInSection.tsx` |

### lib 拡張
| 種別 | ファイル |
|------|---------|
| 変更 | `service/lib/profile.ts` (parseProfile 追加 / regex を行走査に変更) |
| 変更 | `service/lib/skills.ts` (getRadarAxes / RADAR_AXIS_KEYS 追加) |
| 変更 | `service/lib/portfolio.ts` (findAdjacentProjectIds 追加 + portfolio-site.md import 復活) |

### Pages / Components
| 種別 | ファイル |
|------|---------|
| 変更 | `service/app/page.tsx` (top) |
| 変更 | `service/app/profile/page.tsx` |
| 変更 | `service/app/skills/page.tsx` |
| 変更 | `service/app/portfolio/page.tsx` |
| 変更 | `service/app/portfolio/[id]/page.tsx` |
| 変更 | `service/app/news/page.tsx` |
| 変更 | `service/app/news/[date]/page.tsx` |
| 変更 | `service/app/books/page.tsx` |
| 変更 | `service/app/books/BooksContent.tsx` |
| 変更 | `service/app/social/page.tsx` |
| 変更 | `service/app/studio/page.tsx` (turquoise dead クラスをトークン化) |
| 変更 | `service/components/ui/card.tsx` (turquoise を hairline/accent トークンに) |
| 作成 | `service/components/skills/RadarChart.tsx` |
| 作成 | `service/components/skills/SkillBar.tsx` |
| 作成 | `service/components/skills/SkillCategorySection.tsx` |
| 作成 | `service/components/skills/index.ts` |
| 作成 | `service/components/portfolio/ProjectCard.tsx` |
| 作成 | `service/components/portfolio/PortfolioFilter.tsx` |
| 作成 | `service/components/portfolio/PortfolioListClient.tsx` |
| 作成 | `service/components/portfolio/Pager.tsx` |
| 作成 | `service/components/portfolio/ArchDiagram.tsx` |
| 作成 | `service/components/portfolio/index.ts` |
| 作成 | `service/components/news/Ticker.tsx` |
| 作成 | `service/components/news/NewsCard.tsx` |
| 作成 | `service/components/news/NewsTagFilter.tsx` |
| 作成 | `service/components/news/DayHead.tsx` |
| 作成 | `service/components/news/NewsContent.tsx` |
| 作成 | `service/components/news/index.ts` |
| 作成 | `service/components/books/BookCluster.ts` |
| 作成 | `service/components/books/BookGraph.tsx` |
| 作成 | `service/components/books/BookListView.tsx` |
| 作成 | `service/components/books/BookViewToggle.tsx` |
| 作成 | `service/components/books/index.ts` |

### docs / 設定
| 種別 | ファイル |
|------|---------|
| 作成 | `docs/design/MISSING_FEATURES.md` |
| 変更 | `service/package.json` (vitest / jsdom / plugin-react / test scripts) |
| 作成 | `service/vitest.config.ts` |
| 作成 | `service/lib/__tests__/{constants,theme,profile,skills,portfolio}.test.ts` |
| 変更 | `ASSUMPTIONS.md` |

## 推定規模
Large

## 影響範囲
- 全公開ページ (top / profile / skills / portfolio / portfolio detail / news / news[date] / books / social) の見た目と DOM 構造
- `bg-turquoise-*` / `terracotta` / `watercolor` クラスの全廃 → CSS 変数経由のダーク青系トークンへ
- `<html data-theme="dark">` SSR + ThemeProvider による hydration 安全な dark default
- `NAV_ITEMS` 順序変更 (Home 先頭、Social ヘッダー除外) → Header / Footer / top Explore グリッドの全配線
- フォント: Inter → Geist + Noto Sans JP + Space Grotesk + JetBrains Mono
- `components/ui/card.tsx` shadcn コンポーネントを直接トークン化（hardcoded turquoise の dead-style 除去）
- `service/app/studio/*` は機能上スコープ外だが、turquoise dead クラスのみトークンに置換（admin UI の無色化を回避）
- `lib/profile.ts` の regex を行走査ベースに書き換え（JS 非対応の `\z` を排除）
- `components/animations/Reveal.tsx` を `createElement` ベースに変更（dynamic-tag ref の型 union 爆発を解消）
- Books は graph / list view を新設しつつ、既存の検索 / 積読タブ / タグフィルタ / メモモーダルはトークン適用のみで保持
- ビルド: `pnpm exec tsc --noEmit` EXIT=0 / `pnpm lint` warnings 0 / `pnpm test` 50 passed (5 files)。`pnpm build` の最終 "Collecting page data" のみ `TURSO_DATABASE_URL` 必須で失敗（`/news/[date]` generateStaticParams が DB を呼ぶ既存挙動、本タスクの変更とは無関係）