レビュー判定を出します。

---

# AI Review 判定: REJECT

## Summary
変更ファイルにロジックバグ、dead code、DRY違反、未使用exportなど**ブロッキング問題**を 11 件検出しました。テストとリンターは通っているものの、AI生成コードに典型的な「もっともらしいが微妙にずれている」コードが各所に残存しています。

---

## Findings

### finding_id: AR-001 (new) [BLOCKING]
**HeroParticleTitle の `start()` 二重実行バグ + 分岐重複**

- ファイル: `service/components/animations/HeroParticleTitle.tsx:148-174`
- 問題: `if (document.fonts && document.fonts.ready)` ブランチで `document.fonts.ready.then(start)` と `setTimeout(start, 1500)` の両方を仕掛けている。フォントが 1.5 秒以内に読み込まれる通常ケースでは `start()` が 2 回呼ばれ、`build()` → `particles = ...` が再代入されるため、初期化中のアニメーションがリセットされる/粒子配置が破綻する。
- さらに if 分岐と else 分岐がほぼ同一の listener 登録・cleanup を二重定義しており、policy「冗長な条件分岐パターン検出」に該当。
- 修正案:
  - `let started = false; const safeStart = () => { if (started) return; started = true; start(); };`
  - listener 登録と cleanup 取得を分岐外に出し、フォント解決のみ条件分岐に閉じ込める。

### finding_id: AR-002 (new) [BLOCKING]
**`NewsContent.tsx` の `filteredDays` useMemo が無意味**

- ファイル: `service/components/news/NewsContent.tsx:31-34`
- 問題: `tag === "all"` で `days` を返し、それ以外でも `days.map((d) => ({ ...d, articles: d.articles }))` と articles をそのままコピーするだけ。実際のフィルタは内側の map で `inferTags(article.source)` ベースに行われており、`filteredDays` 自体は何もフィルタしていない。useMemo・spread・条件分岐すべて dead。
- 修正案: `filteredDays` を削除し、外側 map は `days.map(...)` で十分。tag は内側のフィルタに直接渡す。

### finding_id: AR-003 (new) [BLOCKING]
**`NewsCard.formatTime` の try-catch は到達不能**

- ファイル: `service/components/news/NewsCard.tsx:111-121`
- 問題: `new Date(invalid)` は throw せず Invalid Date を返す → `isNaN(d.getTime())` で検出済み。`String(n).padStart()` も throw しない。`publishedAt.slice(...)` も throw しない。catch は論理的に到達不可能。
- policy「論理的デッドコードの検出」「エラーの握りつぶし（空の catch / try-catch で空値返却）」両方に該当。
- 修正案: try-catch を撤去。Invalid Date 時のフォールバックは既存の `if (isNaN(d.getTime())) return publishedAt.slice(11, 16)` で十分。

### finding_id: AR-004 (new) [BLOCKING]
**`app/page.tsx` Hero eyebrow に空の inline style + What/How コメント**

- ファイル: `service/app/page.tsx:92-99`
- 問題:
  ```tsx
  style={
      {
          // dot is rendered via ::before in hero-eyebrow class
      } as React.CSSProperties
  }
  ```
  中身が空のオブジェクトに「ドットは ::before で描画される」という説明コメントが入っているだけ。policy「説明コメント禁止」「未使用コード（念のためのコード）」両方に該当。さらに事実として ::before は globals.css にも定義されていない (hero-eyebrow クラスで装飾しているのは別要素)。
- 修正案: `style` prop ごと削除する。

### finding_id: AR-005 (new) [BLOCKING]
**`tailwind.config.ts` の `accent-shadcn` が未使用**

- ファイル: `service/tailwind.config.ts:68-71`
- 問題: `"accent-shadcn": { DEFAULT: "var(--accent-soft)", foreground: "var(--accent-strong)" }` は `tailwind.config.js` には存在せず、`grep -r "accent-shadcn" service/` でも tailwind.config.ts 以外にヒットしない。dead config。
- 加えて `.ts` と `.js` で同じ責務の color 定義が乖離していると、どちらが active か不明という構造的問題を顕在化させる (plan の Open Question で明示的に放置を選択している件と整合しない: 「両方を同じく更新する」方針なら、片方にしか存在しないキーを残すのは禁止)。
- 修正案: `accent-shadcn` ブロックを削除する (または tailwind.config.js にも揃える、ただし利用ゼロのため削除が妥当)。

### finding_id: AR-006 (new) [BLOCKING]
**Profile pull-quote 判定がハードコード文字列に依存**

- ファイル: `service/app/profile/page.tsx:130-145`
- 問題: `parsed.selfIntroduction.split("\n\n").map((para) => { if (para.startsWith("最も大切にしているのは")) { return <pull-quote>... } })`。profile.md の本文の特定文言（"最も大切にしているのは"）でしか pull-quote が発火しない。md の文言が 1 文字変わるだけでデザインが破綻する隠れた結合。
- 計画書にもこの判定基準は無く、AI が独自に推測した条件分岐 (policy「仮定の検証」)。
- 修正案:
  - markdown 側で `> 最も大切にしているのは...` のブロッククォート構文を使い、`parseProfile` で抽出フィールドとして取り出す。
  - もしくは pull-quote セクションを `parseProfile` の戻り値に明示的に追加する。

### finding_id: AR-007 (new) [BLOCKING]
**Portfolio detail で `番号` 算出ロジックが 3 箇所重複 (DRY 違反)**

- ファイル: `service/app/portfolio/[id]/page.tsx:76-78`, `:294-301`, `:310-317`
- 問題: 同じ
  ```ts
  (cat === "personal" ? "P/" : "W/") + String(list.findIndex(p => p.id === id) + 1).padStart(2, "0")
  ```
  が 3 回繰り返される。policy「本質的に同じロジックの重複（DRY 違反）」直撃。
- 修正案: 同ファイル内に `function projectNumber(p: Project, all: Project[]): string { ... }` を定義し、3 箇所を呼び出しに置換する。スコープは現ファイル限定で、計画にない追加抽象化ではない (構造をシンプルに維持するための内部 helper)。

### finding_id: AR-008 (new) [BLOCKING]
**Footer の著作権年がハードコード**

- ファイル: `service/components/footer/Footer.tsx:69`
- 問題: `© 2026 onclimb` と year を直書き。直前のコミット履歴 `6eaccc3 chore: update footer copyright year to 2026` から、毎年手動更新が必要な保守負債が既に発生していた既知問題。今回の新規作成 footer でも同じパターンを踏襲しており、ボーイスカウト違反。
- 修正案: `© {new Date().getFullYear()} onclimb` に置換 (FooterClock がすでに client component なので、年もここで動的にしてよい。SSR 上は build 時の年で固定されるが、それでも来年以降のメンテナンスコストはゼロになる)。

### finding_id: AR-009 (new) [BLOCKING]
**profile.md が二重 import される配線**

- ファイル: `service/lib/profile.ts:3`, `service/app/profile/page.tsx:5-6`
- 問題: `lib/profile.ts` 内部で `profileMarkdown` を raw-loader 経由で import 済み。一方 `app/profile/page.tsx` は `getProfile()`（内部で同じ md を読む）を呼びつつ、別途 `import profileRaw from "../../docs/profile.md"` も行う。raw-loader の二重 import は webpack の dedup で実質一回ロードされるが、API 設計として「呼び出し元が同じファイルを再 import しないと parseProfile が動かない」のはAI 特有のリーク (`parseProfile` を「純粋関数」として書くために、上位への配線責任を押し付けた形)。
- 修正案: `lib/profile.ts` に `getParsedProfile(): ParsedProfile` を export し、内部の `profileMarkdown` を使う。`app/profile/page.tsx` の `import profileRaw` は削除。テスト用には `parseProfile(rawMarkdown)` の純粋関数を残してよい (二段構成)。

### finding_id: AR-010 (new) [BLOCKING]
**未使用の re-export (`SkillBar`, `useTheme`)**

- ファイル: `service/components/skills/index.ts:2`, `service/components/theme/index.ts:1`
- 問題:
  - `SkillBar` は `SkillCategorySection.tsx` 内部からのみ参照されており、外部からは使われていない。
  - `useTheme` は `ThemeToggle.tsx` 内部からのみ参照され、外部利用なし。
- policy「内部実装のパブリック API エクスポート（インフラ層の関数・内部クラスが公開されている）」「孤立したエクスポート」に該当。
- 修正案: 両 `index.ts` から該当 export を削除する。`SkillCategorySection` から `SkillBar` を相対 import (`./SkillBar`) で参照、`ThemeToggle` から `useTheme` も相対 import。

### finding_id: AR-011 (new) [BLOCKING]
**`inferTags()` の silent fallback が UX を壊す**

- ファイル: `service/components/news/NewsContent.tsx:120`
- 問題: `return tags.length === 0 ? ["frontend"] : tags`。source 文字列にどのキーワードもマッチしない記事を強制的に "frontend" タグ扱いにしている。結果として UI 側のタグフィルタで:
  - 「frontend」を選ぶと、本来 frontend 記事ではないものが大量に出る
  - 「ai」「lang」等を選んでもその他 source の記事は弾かれる (false negative)
- policy「フォールバック値の乱用」「条件分岐でサイレント無視」に該当。MISSING_FEATURES.md に「タグ列が無い」と明記しているのだから、UI 側でも「タグ未確定」を正直に表現すべき。
- 修正案: `return []` を返す。`NewsContent.tsx` 側で「タグが空 = "all" のときのみ表示、それ以外では非表示」または「タグが空 = どのフィルタにも該当しないので常に非表示」のいずれかに統一。

---

## ファクトチェック結果

| 項目 | 確認 |
|------|------|
| build / typecheck | 前ステップで `pnpm exec tsc --noEmit` EXIT=0 / `pnpm lint` warnings 0 / `pnpm test` 50 passed と報告済み (検証は不要)。 |
| `turquoise` / `terracotta` / `watercolor` の残存 | `service/app` `service/components` 配下にゼロを確認。 |
| 削除されたコンポーネントへの参照残存 | `FloatingShape`, `GeometricBackground`, `HeroContent`, `AnimatedNavCard`, `AnimatedSkillCard`, `FadeInSection`, `HeaderButton` を grep — 残存なし。 |
| `Reveal` の usage と新 API 整合 | 全 12 ファイルが `import { Reveal } from "@/components/animations"` で揃っており、`as` `delay` `className` の使用も契約と一致。 |

---

## 補足 (Warning, 非ブロッキング)

- `BookListView.tsx:81` の `book.title.split(" ").slice(0, 3).join(" ")` は日本語タイトル (スペース無し) では full title がそのまま box に入り、`overflow: hidden` でも余白計算がずれる可能性。
- `Ticker.tsx` の固定リストは MISSING_FEATURES.md に記載済みで、ASSUMPTION として許容。
- `BookGraph.tsx` の Legend で "reading" を表示しているが、実装上 `reading` ステータスは絶対に発生しない (BookCluster で `read` / `queue` 二値のみ)。MISSING_FEATURES.md に明記されているため、UI 側で凡例を残すか落とすかは設計判断。残すなら "reading (coming soon)" 等の注記が必要。

---

**判定: REJECT** — 上記 11 件のうち BLOCKING のすべてを ai_fix で修正してください。