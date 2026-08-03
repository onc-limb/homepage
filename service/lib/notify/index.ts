import { notifyEmail } from "./email"
import { notifySlack } from "./slack"
import type { ContactNotification, NotifyResult } from "./types"

export type { ContactNotification, NotifyResult }
export { notifyEmail, notifySlack }

/**
 * 問い合わせを全経路へ通知する。
 * 各経路は例外を投げず結果を値で返すため、片方が落ちてももう片方は送られる。
 */
export async function notifyContact(contact: ContactNotification): Promise<{
    slack: NotifyResult
    email: NotifyResult
}> {
    const [slack, email] = await Promise.all([
        notifySlack(contact),
        notifyEmail(contact),
    ])
    return { slack, email }
}
