import { beforeEach, describe, expect, it, vi } from "vitest"

// data-access と通知経路をモックし、送信フローの分岐だけを検証する。
vi.mock("@/lib/contacts", () => ({
    createContact: vi.fn(async () => ({ id: 7 })),
    markContactNotified: vi.fn(async () => undefined),
}))

vi.mock("@/lib/notify", () => ({
    notifyContact: vi.fn(async () => ({
        slack: { delivered: true, skipped: false },
        email: { delivered: true, skipped: false },
    })),
}))

import { createContact, markContactNotified } from "@/lib/contacts"
import { notifyContact } from "@/lib/notify"
import { submitContact } from "@/lib/contact-submission"
import { FORM_STARTED_AT_FIELD, HONEYPOT_FIELD } from "@/lib/validations/contact"

const VALID = {
    name: "尾長 聡",
    email: "someone@example.com",
    company: "Example Inc.",
    category: "work",
    message: "新規プロダクトの実装をご相談させてください。",
}

/** 人間が普通に記入した状態のフォーム（開いてから十分に時間が経っている）。 */
function buildFormData(overrides: Record<string, string> = {}) {
    const formData = new FormData()
    for (const [key, value] of Object.entries({ ...VALID, ...overrides })) {
        formData.set(key, value)
    }
    formData.set(FORM_STARTED_AT_FIELD, String(Date.now() - 60_000))
    return formData
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe("submitContact（正常系）", () => {
    it("入力を保存し、通知したうえで成功を返す", async () => {
        const result = await submitContact(buildFormData())

        expect(result).toEqual({ status: "success" })
        expect(createContact).toHaveBeenCalledWith({
            name: VALID.name,
            email: VALID.email,
            company: VALID.company,
            category: "work",
            message: VALID.message,
        })
        expect(notifyContact).toHaveBeenCalledTimes(1)
    })

    it("通知には相談種別の表示名と保存した id を渡す", async () => {
        await submitContact(buildFormData())

        expect(notifyContact).toHaveBeenCalledWith(
            expect.objectContaining({ id: 7, categoryLabel: "お仕事のご相談" })
        )
    })

    it("通知の到達状況を記録する", async () => {
        await submitContact(buildFormData())

        expect(markContactNotified).toHaveBeenCalledWith(7, {
            slack: true,
            email: true,
        })
    })

    it("会社名が未入力なら null として保存する", async () => {
        await submitContact(buildFormData({ company: "" }))

        expect(createContact).toHaveBeenCalledWith(
            expect.objectContaining({ company: null })
        )
    })
})

describe("submitContact（通知が失敗しても送信は成功扱い）", () => {
    it("全経路が失敗しても success を返し、記録には失敗を残す", async () => {
        vi.mocked(notifyContact).mockResolvedValueOnce({
            slack: { delivered: false, skipped: false },
            email: { delivered: false, skipped: true },
        })

        const result = await submitContact(buildFormData())

        // 内容は保存済みなので、送信者にエラーを見せる必要はない
        expect(result).toEqual({ status: "success" })
        expect(markContactNotified).toHaveBeenCalledWith(7, {
            slack: false,
            email: false,
        })
    })

    it("到達状況の記録に失敗しても success を返す", async () => {
        vi.mocked(markContactNotified).mockRejectedValueOnce(new Error("db down"))

        const result = await submitContact(buildFormData())

        expect(result).toEqual({ status: "success" })
    })
})

describe("submitContact（スパム対策）", () => {
    it("honeypot に値が入っていたら保存せず、成功を装って破棄する", async () => {
        const formData = buildFormData()
        formData.set(HONEYPOT_FIELD, "http://spam.example")

        const result = await submitContact(formData)

        // ボットに検知させないため、エラーではなく成功を返す
        expect(result).toEqual({ status: "success" })
        expect(createContact).not.toHaveBeenCalled()
        expect(notifyContact).not.toHaveBeenCalled()
    })

    it("開いた直後の送信は拒否し、入力値を返す", async () => {
        const formData = buildFormData()
        formData.set(FORM_STARTED_AT_FIELD, String(Date.now()))

        const result = await submitContact(formData)

        expect(result.status).toBe("error")
        if (result.status === "error") {
            expect(result.values.name).toBe(VALID.name)
        }
        expect(createContact).not.toHaveBeenCalled()
    })
})

describe("submitContact（異常系）", () => {
    it("入力が不正ならフィールドごとのエラーと入力値を返す", async () => {
        const result = await submitContact(
            buildFormData({ email: "not-an-email", message: "短い" })
        )

        expect(result.status).toBe("error")
        if (result.status === "error") {
            expect(result.fieldErrors).toHaveProperty("email")
            expect(result.fieldErrors).toHaveProperty("message")
            // 再入力させないよう、送信された値をそのまま返す
            expect(result.values.email).toBe("not-an-email")
            expect(result.values.name).toBe(VALID.name)
        }
        expect(createContact).not.toHaveBeenCalled()
    })

    it("保存に失敗したらメールでの連絡先を案内し、通知は行わない", async () => {
        vi.mocked(createContact).mockRejectedValueOnce(new Error("db down"))

        const result = await submitContact(buildFormData())

        expect(result.status).toBe("error")
        if (result.status === "error") {
            expect(result.message).toContain("@")
            expect(result.values.name).toBe(VALID.name)
        }
        expect(notifyContact).not.toHaveBeenCalled()
    })
})
