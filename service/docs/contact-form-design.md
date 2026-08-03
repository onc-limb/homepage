# コンタクトページ 設計メモ

仕事の問い合わせを受け付けるための `/contact` を新設する。受付経路は 2 つ:

1. **メール** — アドレスを表示し `mailto:` で直接送ってもらう（従来どおりの経路）
2. **フォーム** — サイト内で完結する経路。受信内容は DB に保存したうえで Slack とメールへ通知する

## なぜ 2 経路か

メールは相手のクライアントに依存せず確実だが、こちらの受信箱に届いたことを検知するまで時間がかかる。
フォームは Slack へ即時に飛ぶが、通知が失敗すると内容ごと消える。両方を残し、フォーム側は
**保存を先・通知を後**にすることで、通知が全滅しても問い合わせ自体は失われないようにする。

## データモデル

`contacts` テーブルを既存 Turso DB に追加する（`lib/db/schema.ts`）。
既存 `books` / `articles` と同じく autoIncrement の integer 主キー、タイムスタンプは
`text` + `datetime('now')` に揃える。

| カラム | 型 | 意味 |
| --- | --- | --- |
| `id` | integer PK | |
| `name` | text NOT NULL | 送信者名 |
| `email` | text NOT NULL | 返信先 |
| `company` | text | 会社・組織名（任意） |
| `category` | text NOT NULL | 相談種別。`work` / `tech` / `other` を CHECK 制約で固定 |
| `message` | text NOT NULL | 本文 |
| `notified_slack` | boolean NOT NULL | Slack 通知が成功したか |
| `notified_email` | boolean NOT NULL | メール通知が成功したか |
| `created_at` | text NOT NULL | 受信日時 |

`notified_*` を持つのは「保存はされたが通知が飛んでいない問い合わせ」を後から拾えるようにするため。
通知は保存後の best-effort であり、失敗しても送信者にはエラーを見せない（内容は残っているため）。

マイグレーションはこのリポジトリの運用どおり `pnpm db:push` で反映する（マイグレーションファイルは持たない）。

## 送信フロー

```
ContactForm (client) --formData--> submitContactAction (server action)
                                        |
                                        1. honeypot / 経過時間チェック
                                        2. zod バリデーション
                                        3. contacts へ INSERT
                                        4. Slack / メールへ通知（並行・失敗許容）
                                        5. notified_* を UPDATE
```

Route Handler ではなく **Server Action** を採用する。既存 `/studio` の書き込み系が Server Action で
統一されていること、CSRF 対策が Next.js 側に組み込まれていることが理由。

## スパム対策

npm 依存も Cloudflare ダッシュボードの設定も増やさない範囲に留める。

- **honeypot** — 画面に出ない `company_website` フィールド。値が入っていたら
  **成功を装って破棄**する（ボットに検知させないための定石）
- **経過時間** — フォームのマウント時刻を hidden で送り、3 秒未満の送信を拒否する。
  クライアント時計とサーバー時計のずれで誤爆しないよう、経過が負・または 24 時間超といった
  明らかに異常な値は判定対象から外し、「0〜3 秒」に収まるときだけ拒否する

これで素朴なボット送信はほぼ止まる。人力スパムや高度なボットは通るため、実運用で問題が出たら
Cloudflare Turnstile の追加を検討する（サイトキー/シークレットキーの発行が必要になる）。

## 通知経路

### Slack

Incoming Webhook へ `fetch` で POST するだけ。SDK は入れない。
5 秒でタイムアウトさせ、失敗しても送信処理全体は成功として扱う。

環境変数 `SLACK_WEBHOOK_URL`（未設定なら通知をスキップ）。

`SLACK_MENTION` を設定すると、通知バナー（`text`）と本文の両方でメンションする。
値は Slack のメンション記法をそのまま入れる — 個人なら `<@U01ABCDEFGH>`、
グループなら `<!subteam^S012ABCDEF>`、チャンネル全体なら `<!here>` / `<!channel>`。
**表示名（`@onclimb`）ではメンションにならない**ためメンバー ID を使う。
`text` 側にも入れるのは、blocks を展開しない通知バナーからメンションが落ちないようにするため。

### メール（Cloudflare Email Routing）

Workers の `send_email` バインディング経由で自分宛に送る。外部メール送信サービスは使わない。

```jsonc
// wrangler.jsonc
"send_email": [
    { "name": "SEND_EMAIL", "allowed_destination_addresses": ["<通知先>"] }
]
```

バインディングは `getCloudflareContext().env.SEND_EMAIL` で取得する。

**この経路には Cloudflare 側の事前設定が要る**（コードだけでは動かない）:

- 対象ゾーンで Email Routing が有効になっていること
- 通知先アドレスが Email Routing の destination address として検証済みであること
  （未検証だと `E_RECIPIENT_NOT_ALLOWED`）
- 差出人アドレスのドメインが検証済みであること（未検証だと `E_SENDER_NOT_VERIFIED`）

ローカル開発では `getCloudflareContext()` が使えないため（`initOpenNextCloudflareForDev()` を
next.config に入れていない）、バインディングが取れない場合はメール通知をスキップする。
Slack・DB 保存はローカルでも動く。

環境変数 `CONTACT_MAIL_FROM` / `CONTACT_MAIL_TO`。どちらか欠けていればスキップする。

## トップページからの導線

- **ヒーロー** — 「仕事の相談をする」を primary ボタンとして先頭に置く。既存の Profile / Portfolio は
  ghost に下げ、最初に目に入る行動導線を問い合わせにする
- **CTA バンド** — `mailto:` の直リンクを `/contact` へのリンクに置き換える。
  メールアドレスそのものはコンタクトページ側で表示する
- **フッター** — Sitemap 列に Contact を追加する

ヘッダーの `NAV_ITEMS` には**追加しない**。あの並びは「読み物・コンテンツの探索先」を表しており、
行動導線である Contact を混ぜると意味論が濁るため。代わりにフッターとトップの CTA で拾う。

## 公開アドレスの扱い

トップページに直書きされていた `satoshi-onga@onc-limb.com` を `lib/constants.ts` の
`CONTACT_EMAIL` に集約する。表示箇所が増えても 1 箇所の変更で済む。

## デプロイ前に必要な設定

コードだけでは通知が飛ばない。以下が未設定でもフォームは壊れず、
問い合わせは `contacts` に保存され `notified_*` が false のまま残る。

1. **DB** — `pnpm db:push` で `contacts` を本番の Turso に反映する
2. **Worker の環境変数 / シークレット**
   - `SLACK_WEBHOOK_URL` — Slack Incoming Webhook の URL（シークレット扱い）
   - `SLACK_MENTION` — 任意。通知でメンションしたい相手（`<@メンバーID>` 等）
   - `CONTACT_MAIL_FROM` — 差出人。Email Routing で検証済みドメインのアドレス
   - `CONTACT_MAIL_TO` — 通知先。Email Routing の検証済み destination
3. **Cloudflare Email Routing** — 対象ゾーンで有効化し、通知先アドレスを検証する
4. **wrangler.jsonc** — `send_email` の `allowed_destination_addresses` を実際の通知先に合わせる

設定が済んだかは、テスト送信後に `contacts` の `notified_slack` / `notified_email` が
1 になっているかで確認できる。

## 今回やらないこと

- `/studio` での問い合わせ一覧画面（DB には貯まるので後から追加できる）
- 自動返信メール（送信者への受付確認）
- 添付ファイル
