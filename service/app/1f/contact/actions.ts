"use server"

import type { ContactFormState } from "@/lib/contact-form-state"
import { submitContact } from "@/lib/contact-submission"

/**
 * コンタクトフォームの Server Action。
 *
 * "use server" ファイルは async 関数しか export できないため、
 * 型・初期 state・処理本体は @/lib/contact-submission に置き、ここは入口だけを担う。
 * useActionState 用に (prevState, formData) のシグネチャを取る。
 */
export async function submitContactAction(
    _prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    return submitContact(formData)
}
