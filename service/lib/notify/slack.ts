import { logger } from "@/lib/logger"
import {
    DELIVERED,
    FAILED,
    NOT_CONFIGURED,
    type ContactNotification,
    type NotifyResult,
} from "./types"

const log = logger.child({ scope: "notify.slack" })

/** Webhook の応答を待つ上限。問い合わせ送信のレスポンスを長く待たせないため短めにする。 */
const TIMEOUT_MS = 5000

/** Slack の 1 ブロックあたりのテキスト上限（3000）に対する安全側の閾値。 */
const MAX_BLOCK_TEXT = 2800

/**
 * Slack mrkdwn の制御文字をエスケープする。
 * 問い合わせ本文はユーザー入力なので、`<http://...|表示名>` のようなリンク記法を
 * そのまま解釈させない。Slack が要求するのはこの 3 文字の実体参照化のみ。
 */
function escapeMrkdwn(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function truncate(text: string, max: number): string {
    return text.length <= max ? text : `${text.slice(0, max)}…（省略）`
}

/**
 * 通知に添えるメンション。Slack のメンション記法をそのまま設定する。
 *
 *   個人       `<@U01ABCDEFGH>`（表示名ではなくメンバー ID）
 *   グループ   `<!subteam^S012ABCDEF>`
 *   チャンネル `<!here>` / `<!channel>`
 *
 * `@onclimb` のような表示名を書いてもリンクにならず、ただの文字列として出るだけで
 * 通知も飛ばない。未設定ならメンションなしで送る。
 */
function mentionPrefix(): string {
    return process.env.SLACK_MENTION?.trim() ?? ""
}

function buildPayload(contact: ContactNotification) {
    const field = (label: string, value: string) => ({
        type: "mrkdwn",
        text: `*${label}*\n${escapeMrkdwn(value)}`,
    })

    const mention = mentionPrefix()
    const summary = `新しいお問い合わせ: ${contact.name} 様（${contact.categoryLabel}）`

    return {
        // blocks を表示できないクライアント（通知バナーなど）向けのフォールバック。
        text: mention ? `${mention} ${summary}` : summary,
        blocks: [
            {
                type: "header",
                text: { type: "plain_text", text: "新しいお問い合わせ" },
            },
            // header は plain_text でメンションを解釈しないため、独立した section で添える。
            ...(mention
                ? [
                      {
                          type: "section",
                          text: { type: "mrkdwn", text: mention },
                      },
                  ]
                : []),
            {
                type: "section",
                fields: [
                    field("お名前", contact.name),
                    field("メールアドレス", contact.email),
                    field("会社・組織", contact.company || "（未記入）"),
                    field("種別", contact.categoryLabel),
                ],
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: truncate(
                        `*内容*\n${escapeMrkdwn(contact.message)}`,
                        MAX_BLOCK_TEXT
                    ),
                },
            },
            {
                type: "context",
                elements: [{ type: "mrkdwn", text: `contacts.id = ${contact.id}` }],
            },
        ],
    }
}

/**
 * Slack Incoming Webhook へ問い合わせ内容を通知する。
 * SDK は入れず fetch のみで送る。失敗しても例外は投げず、結果を値で返す。
 */
export async function notifySlack(
    contact: ContactNotification
): Promise<NotifyResult> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) {
        log.warn("SLACK_WEBHOOK_URL が未設定のため Slack 通知をスキップしました", {
            contactId: contact.id,
        })
        return NOT_CONFIGURED
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload(contact)),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        })

        if (!response.ok) {
            log.error("Slack 通知が失敗しました", {
                contactId: contact.id,
                status: response.status,
            })
            return FAILED
        }

        log.info("Slack 通知を送信しました", { contactId: contact.id })
        return DELIVERED
    } catch (error) {
        log.error("Slack 通知の送信中に例外が発生しました", {
            contactId: contact.id,
            error,
        })
        return FAILED
    }
}
