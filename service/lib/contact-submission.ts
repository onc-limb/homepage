import {
    type ContactFormState,
    type ContactFormValuesRaw,
} from "@/lib/contact-form-state"
import { createContact, markContactNotified } from "@/lib/contacts"
import { CONTACT_EMAIL } from "@/lib/constants"
import { logger } from "@/lib/logger"
import { notifyContact } from "@/lib/notify"
import {
    contactCategoryLabel,
    contactFormSchema,
    FORM_STARTED_AT_FIELD,
    HONEYPOT_FIELD,
    isSubmittedTooFast,
} from "@/lib/validations/contact"

const log = logger.child({ scope: "contact.submission" })

/** 保存に失敗したときの逃げ道。メールでの直接連絡へ誘導する。 */
const SAVE_FAILED_MESSAGE =
    `送信に失敗しました。時間をおいて再度お試しいただくか、` +
    `お手数ですが ${CONTACT_EMAIL} 宛に直接ご連絡ください。`

function formValue(formData: FormData, key: string): string {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
}

/**
 * コンタクトフォームの送信を処理する本体。
 *
 * Server Action（app/contact/actions.ts）から呼ばれる。"use server" ファイルは
 * async 関数しか export できないため、処理本体をここに置いている
 * （状態の型と初期値はクライアントからも使うので lib/contact-form-state.ts 側）。
 *
 * 保存を先・通知を後に行い、通知の失敗は送信者に見せない
 * （内容は contacts に残っており、notified_* から後追いできるため）。
 */
export async function submitContact(
    formData: FormData
): Promise<ContactFormState> {
    // ASSUMPTION: honeypot に引っかかった送信は、ボットに検知させないため
    //             エラーではなく成功を装って破棄する（スパム対策の定石）。
    const honeypot = formValue(formData, HONEYPOT_FIELD)
    if (honeypot.trim() !== "") {
        log.warn("honeypot に値が入っていたため問い合わせを破棄しました")
        return { status: "success" }
    }

    const values: ContactFormValuesRaw = {
        name: formValue(formData, "name"),
        email: formValue(formData, "email"),
        company: formValue(formData, "company"),
        category: formValue(formData, "category"),
        message: formValue(formData, "message"),
    }

    if (isSubmittedTooFast(formData.get(FORM_STARTED_AT_FIELD), Date.now())) {
        log.warn("送信が速すぎるため問い合わせを拒否しました")
        return {
            status: "error",
            message:
                "送信が速すぎます。お手数ですが、もう一度送信ボタンを押してください。",
            values,
        }
    }

    const parsed = contactFormSchema.safeParse(values)

    if (!parsed.success) {
        return {
            status: "error",
            message: "入力内容をご確認ください。",
            fieldErrors: parsed.error.flatten().fieldErrors,
            values,
        }
    }

    const input = parsed.data

    let contactId: number
    try {
        const saved = await createContact({
            name: input.name,
            email: input.email,
            company: input.company || null,
            category: input.category,
            message: input.message,
        })
        contactId = saved.id
    } catch (error) {
        log.error("問い合わせの保存に失敗しました", { error })
        return { status: "error", message: SAVE_FAILED_MESSAGE, values }
    }

    const { slack, email } = await notifyContact({
        id: contactId,
        name: input.name,
        email: input.email,
        company: input.company || null,
        categoryLabel: contactCategoryLabel(input.category),
        message: input.message,
    })

    try {
        await markContactNotified(contactId, {
            slack: slack.delivered,
            email: email.delivered,
        })
    } catch (error) {
        // 通知状況の記録に失敗しても問い合わせ本体は保存済みなので、送信は成功として扱う。
        log.error("通知状況の記録に失敗しました", { contactId, error })
    }

    if (!slack.delivered && !email.delivered) {
        // 設定が無くて送っていないだけの状態を error にすると、
        // 本当に通知が壊れたときの検知が埋もれるので区別する。
        if (slack.skipped && email.skipped) {
            log.warn("通知経路が未設定のため、問い合わせは保存のみされました", {
                contactId,
            })
        } else {
            log.error("すべての通知経路が失敗しました", { contactId })
        }
    }

    return { status: "success" }
}
