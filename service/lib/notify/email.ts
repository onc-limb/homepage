import { logger } from "@/lib/logger"
import {
    DELIVERED,
    FAILED,
    NOT_CONFIGURED,
    type ContactNotification,
    type NotifyResult,
} from "./types"

const log = logger.child({ scope: "notify.email" })

/**
 * Cloudflare Workers の send_email バインディング。
 * 型定義パッケージを増やさないよう、使う分だけをここで宣言する。
 */
interface SendEmailBinding {
    send(message: {
        to: string
        from: string
        subject: string
        text: string
        html?: string
    }): Promise<unknown>
}

/**
 * Worker の env から send_email バインディングを取り出す。
 *
 * ローカル開発では next.config に initOpenNextCloudflareForDev() を入れていないため
 * getCloudflareContext() が使えない。その場合はメール通知だけを黙って諦め、
 * DB 保存と Slack 通知は通常どおり動かす。
 */
async function getEmailBinding(): Promise<SendEmailBinding | null> {
    try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare")
        const { env } = getCloudflareContext()
        const binding = (env as Record<string, unknown>).SEND_EMAIL
        return (binding as SendEmailBinding | undefined) ?? null
    } catch {
        return null
    }
}

function buildBody(contact: ContactNotification): string {
    return [
        "onclimb.net のコンタクトフォームに新しい問い合わせが届きました。",
        "",
        `お名前　　　: ${contact.name}`,
        `メール　　　: ${contact.email}`,
        `会社・組織　: ${contact.company || "（未記入）"}`,
        `種別　　　　: ${contact.categoryLabel}`,
        "",
        "----- 内容 -----",
        contact.message,
        "----------------",
        "",
        `contacts.id = ${contact.id}`,
        `返信はそのまま ${contact.email} 宛に送ってください。`,
    ].join("\n")
}

/**
 * Cloudflare Email Routing 経由で自分宛に問い合わせ内容を通知する。
 *
 * 動かすには Cloudflare 側の設定が必要（docs/contact-form-design.md 参照）:
 * ゾーンで Email Routing が有効・通知先が検証済み destination・差出人ドメインが検証済み。
 * 未設定でも例外は投げず、結果を値で返す。
 */
export async function notifyEmail(
    contact: ContactNotification
): Promise<NotifyResult> {
    const from = process.env.CONTACT_MAIL_FROM
    const to = process.env.CONTACT_MAIL_TO

    if (!from || !to) {
        log.warn(
            "CONTACT_MAIL_FROM / CONTACT_MAIL_TO が未設定のためメール通知をスキップしました",
            { contactId: contact.id }
        )
        return NOT_CONFIGURED
    }

    const binding = await getEmailBinding()
    if (!binding) {
        log.warn(
            "send_email バインディングを取得できないためメール通知をスキップしました",
            { contactId: contact.id }
        )
        return NOT_CONFIGURED
    }

    try {
        await binding.send({
            to,
            from,
            subject: `[お問い合わせ] ${contact.categoryLabel} / ${contact.name} 様`,
            text: buildBody(contact),
        })

        log.info("メール通知を送信しました", { contactId: contact.id })
        return DELIVERED
    } catch (error) {
        log.error("メール通知の送信に失敗しました", {
            contactId: contact.id,
            error,
        })
        return FAILED
    }
}
