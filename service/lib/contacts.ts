import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { contacts } from "@/lib/db/schema"
import type { ContactCategory } from "@/lib/validations/contact"

export interface NewContact {
    name: string
    email: string
    company?: string | null
    category: ContactCategory
    message: string
}

export type Contact = typeof contacts.$inferSelect

/** 問い合わせを保存する。通知より先に呼ぶことで、通知が全滅しても内容を失わない。 */
export async function createContact(input: NewContact): Promise<Contact> {
    const [row] = await db
        .insert(contacts)
        .values({
            name: input.name,
            email: input.email,
            company: input.company || null,
            category: input.category,
            message: input.message,
        })
        .returning()

    return row
}

/**
 * 通知の到達状況を記録する。
 * ここが失敗しても問い合わせ自体は保存済みなので、呼び出し側は握りつぶしてよい。
 */
export async function markContactNotified(
    id: number,
    flags: { slack: boolean; email: boolean }
): Promise<void> {
    await db
        .update(contacts)
        .set({ notifiedSlack: flags.slack, notifiedEmail: flags.email })
        .where(eq(contacts.id, id))
}
