"use client"

import { useActionState, useEffect, useId, useRef, useState } from "react"
import { DoorButton } from "@/components/ds/DoorButton"
import { FOCUS_RING } from "@/components/ds/focus-styles"
import { PROSE_TEXT } from "@/components/ds/prose-styles"
import { BOXED_SURFACE } from "@/components/ds/surface-styles"
import { initialContactFormState } from "@/lib/contact-form-state"
import {
    CONTACT_CATEGORIES,
    CONTACT_MESSAGE_MAX_LENGTH,
    CONTACT_MESSAGE_MIN_LENGTH,
    FORM_STARTED_AT_FIELD,
    HONEYPOT_FIELD,
} from "@/lib/validations/contact"
import { submitContactAction } from "./actions"

const NOTE_TEXT = "text-ds-sm text-ds-fg-muted"
const FIELD_BLOCK = "flex flex-col gap-ds-2"
const FIELD_CLASS = `w-full border border-ds-fg-muted bg-ds-surface px-ds-3 py-ds-2 placeholder:text-ds-fg-muted ${FOCUS_RING}`

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null
    return (
        <p id={id} className="text-ds-sm text-ds-accent">
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

    // 種別は制御コンポーネントにする。React 19 の form action は送信後にフォームを
    // リセットするが、input / textarea と違って select は defaultValue が復元されず、
    // エラーで戻ってきたときに選択が先頭へ巻き戻ってしまうため。
    const [category, setCategory] = useState<string>(CONTACT_CATEGORIES[0].value)
    // 本文と文字数表示を同じ値から描画し、エラー時は返却された本文を復元する。
    const [message, setMessage] = useState("")

    // 送信結果が返ってきたら、サーバーが実際に受け取った種別に合わせ直す。
    // レンダー中に前回値と比較して調整する React 公式のパターン（effect にすると
    // 余計な再レンダーを挟むうえ react-hooks/set-state-in-effect にも触れる）。
    const [lastState, setLastState] = useState(state)
    if (state !== lastState) {
        setLastState(state)
        setMessage(state.status === "error" ? state.values.message : "")
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
            <div role="status" className={`${BOXED_SURFACE} ${PROSE_TEXT}`}>
                <h3 className="mb-ds-2 text-ds-lg font-bold text-ds-fg">送信しました</h3>
                <p className={NOTE_TEXT}>
                    お問い合わせありがとうございます。内容を確認のうえ、
                    ご記入いただいたメールアドレス宛に折り返しご連絡します。
                    数日たっても返信が届かない場合は、お手数ですが直接メールでご連絡ください。
                </p>
            </div>
        )
    }

    return (
        <form action={formAction} noValidate className={`flex flex-col gap-ds-4 ${PROSE_TEXT}`}>
            {state.status === "error" && (
                <p
                    role="alert"
                    className="border border-ds-accent bg-ds-surface px-ds-3 py-ds-2 text-ds-sm text-ds-fg"
                >
                    {state.message}
                </p>
            )}

            <div className={FIELD_BLOCK}>
                <label htmlFor={`${uid}-name`}>
                    お名前 <span className="text-ds-accent">*</span>
                </label>
                <input
                    id={`${uid}-name`}
                    name="name"
                    type="text"
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

            <div className={FIELD_BLOCK}>
                <label htmlFor={`${uid}-email`}>
                    メールアドレス <span className="text-ds-accent">*</span>
                </label>
                <input
                    id={`${uid}-email`}
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    defaultValue={values?.email}
                    aria-invalid={Boolean(errorOf("email"))}
                    aria-describedby={errorOf("email") ? `${uid}-email-error` : undefined}
                    className={FIELD_CLASS}
                />
                <FieldError id={`${uid}-email-error`} message={errorOf("email")} />
            </div>

            <div className={FIELD_BLOCK}>
                <label htmlFor={`${uid}-company`}>
                    会社・組織名
                    <span className={`ml-ds-2 ${NOTE_TEXT}`}>（任意）</span>
                </label>
                <input
                    id={`${uid}-company`}
                    name="company"
                    type="text"
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

            <div className={FIELD_BLOCK}>
                <label htmlFor={`${uid}-category`}>
                    ご相談の種別 <span className="text-ds-accent">*</span>
                </label>
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
                    className={FIELD_CLASS}
                >
                    {CONTACT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
                <FieldError id={`${uid}-category-error`} message={errorOf("category")} />
            </div>

            <div className={FIELD_BLOCK}>
                <label htmlFor={`${uid}-message`}>
                    お問い合わせ内容 <span className="text-ds-accent">*</span>
                </label>
                <textarea
                    id={`${uid}-message`}
                    name="message"
                    required
                    rows={6}
                    maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                    placeholder="ご相談の背景や、実現したいことをお書きください。分かる範囲で構いません。"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    aria-invalid={Boolean(errorOf("message"))}
                    aria-describedby={`${uid}-message-hint ${uid}-message-count${errorOf("message") ? ` ${uid}-message-error` : ""}`}
                    className={FIELD_CLASS}
                />
                <p id={`${uid}-message-hint`} className={NOTE_TEXT}>
                    {CONTACT_MESSAGE_MIN_LENGTH}〜{CONTACT_MESSAGE_MAX_LENGTH}
                    文字で入力してください。
                    絵文字などは複数文字として数える場合があります。
                </p>
                <p id={`${uid}-message-count`} className={NOTE_TEXT}>
                    入力文字数: {message.length} / {CONTACT_MESSAGE_MAX_LENGTH}
                </p>
                <p
                    role="status"
                    className={
                        message.length >= CONTACT_MESSAGE_MAX_LENGTH
                            ? NOTE_TEXT
                            : "sr-only"
                    }
                >
                    {message.length >= CONTACT_MESSAGE_MAX_LENGTH
                        ? "上限に達しました。追加するには内容を短くしてください。"
                        : ""}
                </p>
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

            <div className="flex flex-col gap-ds-3">
                <DoorButton type="submit" primary disabled={isPending}>
                    {isPending ? "送信中..." : "送信する"}
                </DoorButton>
                <p className={NOTE_TEXT}>
                    いただいた内容は返信のためだけに利用します。
                </p>
            </div>
        </form>
    )
}
