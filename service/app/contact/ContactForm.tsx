"use client"

import { useActionState, useEffect, useId, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { initialContactFormState } from "@/lib/contact-form-state"
import {
    CONTACT_CATEGORIES,
    FORM_STARTED_AT_FIELD,
    HONEYPOT_FIELD,
} from "@/lib/validations/contact"
import { submitContactAction } from "./actions"

const FIELD_CLASS =
    "border-hairline-solid bg-bg-elev text-fg placeholder:text-fg-dim focus-visible:ring-accent"

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null
    return (
        <p id={id} className="text-[13px] text-red-400">
            {message}
        </p>
    )
}

export function ContactForm() {
    const [state, formAction, isPending] = useActionState(
        submitContactAction,
        initialContactFormState
    )
    const startedAtRef = useRef<HTMLInputElement>(null)
    const uid = useId()

    // 種別だけは制御コンポーネントにする。React 19 の form action は送信後にフォームを
    // リセットするが、input / textarea と違って select は defaultValue が復元されず、
    // エラーで戻ってきたときに選択が先頭へ巻き戻ってしまうため。
    const [category, setCategory] = useState<string>(CONTACT_CATEGORIES[0].value)

    // 送信結果が返ってきたら、サーバーが実際に受け取った種別に合わせ直す。
    // レンダー中に前回値と比較して調整する React 公式のパターン（effect にすると
    // 余計な再レンダーを挟むうえ react-hooks/set-state-in-effect にも触れる）。
    const [lastState, setLastState] = useState(state)
    if (state !== lastState) {
        setLastState(state)
        if (state.status === "error" && state.values.category) {
            setCategory(state.values.category)
        }
    }

    // マウント時刻はサーバーとクライアントで必ず食い違うため、SSR では空のままにして
    // hydration 後に入れる（初期値を Date.now() にすると hydration mismatch になる）。
    useEffect(() => {
        if (startedAtRef.current) {
            startedAtRef.current.value = String(Date.now())
        }
    }, [])

    const values = state.status === "error" ? state.values : undefined
    const fieldErrors = state.status === "error" ? state.fieldErrors : undefined
    const errorOf = (field: string) => fieldErrors?.[field]?.[0]

    if (state.status === "success") {
        return (
            <div
                role="status"
                className="rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid p-8 shadow-card"
            >
                <h3 className="mb-3 text-[20px] font-semibold text-fg-strong">
                    送信しました
                </h3>
                <p className="text-sm leading-[1.8] text-fg-muted">
                    お問い合わせありがとうございます。内容を確認のうえ、
                    ご記入いただいたメールアドレス宛に折り返しご連絡します。
                    数日たっても返信が届かない場合は、お手数ですが直接メールでご連絡ください。
                </p>
            </div>
        )
    }

    return (
        <form
            action={formAction}
            noValidate
            className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid p-7 shadow-card"
        >
            {state.status === "error" && (
                <p
                    role="alert"
                    className="rounded-[var(--radius)] border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] leading-[1.7] text-red-300"
                >
                    {state.message}
                </p>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-name`} className="text-fg">
                    お名前 <span className="text-accent">*</span>
                </Label>
                <Input
                    id={`${uid}-name`}
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    defaultValue={values?.name}
                    aria-invalid={Boolean(errorOf("name"))}
                    aria-describedby={errorOf("name") ? `${uid}-name-error` : undefined}
                    className={FIELD_CLASS}
                />
                <FieldError id={`${uid}-name-error`} message={errorOf("name")} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-email`} className="text-fg">
                    メールアドレス <span className="text-accent">*</span>
                </Label>
                <Input
                    id={`${uid}-email`}
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    defaultValue={values?.email}
                    aria-invalid={Boolean(errorOf("email"))}
                    aria-describedby={
                        errorOf("email") ? `${uid}-email-error` : undefined
                    }
                    className={FIELD_CLASS}
                />
                <FieldError id={`${uid}-email-error`} message={errorOf("email")} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-company`} className="text-fg">
                    会社・組織名
                    <span className="ml-2 text-xs text-fg-dim">（任意）</span>
                </Label>
                <Input
                    id={`${uid}-company`}
                    name="company"
                    maxLength={100}
                    autoComplete="organization"
                    defaultValue={values?.company}
                    aria-invalid={Boolean(errorOf("company"))}
                    aria-describedby={
                        errorOf("company") ? `${uid}-company-error` : undefined
                    }
                    className={FIELD_CLASS}
                />
                <FieldError id={`${uid}-company-error`} message={errorOf("company")} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-category`} className="text-fg">
                    ご相談の種別 <span className="text-accent">*</span>
                </Label>
                {/* ASSUMPTION: Server Action へ formData で載せるため、Radix の Select ではなく
                    ネイティブ select を使う（JS 無しでも値が送られ、hidden input を挟まずに済む）。 */}
                <select
                    id={`${uid}-category`}
                    name="category"
                    required
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    aria-invalid={Boolean(errorOf("category"))}
                    aria-describedby={
                        errorOf("category") ? `${uid}-category-error` : undefined
                    }
                    className="flex h-10 w-full rounded-md border border-hairline-solid bg-bg-elev px-3 py-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                    {CONTACT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
                <FieldError
                    id={`${uid}-category-error`}
                    message={errorOf("category")}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor={`${uid}-message`} className="text-fg">
                    お問い合わせ内容 <span className="text-accent">*</span>
                </Label>
                <Textarea
                    id={`${uid}-message`}
                    name="message"
                    required
                    rows={8}
                    maxLength={2000}
                    placeholder="ご相談の背景や、実現したいことをお書きください。分かる範囲で構いません。"
                    defaultValue={values?.message}
                    aria-invalid={Boolean(errorOf("message"))}
                    aria-describedby={
                        errorOf("message") ? `${uid}-message-error` : undefined
                    }
                    className={FIELD_CLASS}
                />
                <FieldError id={`${uid}-message-error`} message={errorOf("message")} />
            </div>

            {/* スパム対策: 画面には出ない honeypot。値が入っていたらボットとみなす。 */}
            <div aria-hidden="true" className="hidden">
                <label htmlFor={`${uid}-${HONEYPOT_FIELD}`}>
                    この項目は入力しないでください
                </label>
                <input
                    id={`${uid}-${HONEYPOT_FIELD}`}
                    type="text"
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                />
            </div>

            {/* スパム対策: フォームを開いた時刻。速すぎる送信を弾く材料にする。 */}
            <input
                ref={startedAtRef}
                type="hidden"
                name={FORM_STARTED_AT_FIELD}
                defaultValue=""
            />

            <div className="flex flex-col gap-3 [@media(min-width:560px)]:flex-row [@media(min-width:560px)]:items-center">
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "送信中..." : "送信する"}
                </button>
                <p className="text-xs leading-[1.7] text-fg-dim">
                    いただいた内容は返信のためだけに利用します。
                </p>
            </div>
        </form>
    )
}
