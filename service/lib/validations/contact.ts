import { z } from "zod"

/**
 * 相談種別。DB の contacts.category に入る値で、
 * lib/db/schema.ts の contacts_category_check と対応する（変更時は両方を直すこと）。
 */
export const CONTACT_CATEGORIES = [
    { value: "work", label: "お仕事のご相談" },
    { value: "tech", label: "技術的なご相談・壁打ち" },
    { value: "other", label: "その他" },
] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]["value"]

const categoryValues = CONTACT_CATEGORIES.map((c) => c.value) as [
    ContactCategory,
    ...ContactCategory[],
]

export function contactCategoryLabel(value: string): string {
    return CONTACT_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

/** 送信者が実際に入力する項目。クライアント・サーバーの双方で使う。 */
export const contactFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "お名前を入力してください")
        .max(100, "お名前は100文字以内で入力してください"),
    email: z
        .string()
        .trim()
        .min(1, "メールアドレスを入力してください")
        .email("メールアドレスの形式が正しくありません")
        .max(200, "メールアドレスは200文字以内で入力してください"),
    company: z
        .string()
        .trim()
        .max(100, "会社・組織名は100文字以内で入力してください")
        .optional()
        .or(z.literal("")),
    category: z.enum(categoryValues, {
        errorMap: () => ({ message: "相談内容の種別を選択してください" }),
    }),
    message: z
        .string()
        .trim()
        .min(10, "お問い合わせ内容は10文字以上で入力してください")
        .max(2000, "お問い合わせ内容は2000文字以内で入力してください"),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

/** honeypot フィールドの name。画面には出さず、値が入っていたらボットとみなす。 */
export const HONEYPOT_FIELD = "company_website"

/** フォームのマウント時刻（ミリ秒）を載せる hidden フィールドの name。 */
export const FORM_STARTED_AT_FIELD = "form_started_at"

/** これ未満の速さで送信されたものはボットとみなす。 */
export const MIN_SUBMIT_ELAPSED_MS = 3000

/**
 * 送信までの経過時間が「速すぎる」かを判定する。
 *
 * startedAt はクライアントの時計で、比較するのはサーバーの時計なので両者はずれ得る。
 * ずれで正当な送信を弾かないよう、経過が負（クライアントが未来）や 24 時間超
 * （時計が大きく狂っている / タブを放置した）のような明らかに異常な値は判定対象から外し、
 * 0〜3 秒に収まるときだけボットとみなす。
 */
export function isSubmittedTooFast(startedAt: unknown, now: number): boolean {
    const started = Number(startedAt)
    if (!Number.isFinite(started)) return false

    const elapsed = now - started
    if (elapsed < 0) return false
    if (elapsed > 24 * 60 * 60 * 1000) return false

    return elapsed < MIN_SUBMIT_ELAPSED_MS
}
