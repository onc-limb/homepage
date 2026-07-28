import { describe, expect, it } from "vitest"
import {
    CONTACT_CATEGORIES,
    contactCategoryLabel,
    contactFormSchema,
    isSubmittedTooFast,
    MIN_SUBMIT_ELAPSED_MS,
} from "./contact"

const validInput = {
    name: "尾長 聡",
    email: "someone@example.com",
    company: "Example Inc.",
    category: "work",
    message: "新規プロダクトの実装をお願いしたく、ご相談させてください。",
}

describe("contactFormSchema", () => {
    it("必須項目が揃っていれば通り、前後の空白は落とす", () => {
        const result = contactFormSchema.safeParse({
            ...validInput,
            name: "  尾長 聡  ",
        })

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe("尾長 聡")
        }
    })

    it("会社・組織名は未入力でもよい", () => {
        const result = contactFormSchema.safeParse({ ...validInput, company: "" })
        expect(result.success).toBe(true)
    })

    it.each([
        ["name", { name: "" }],
        ["name", { name: "あ".repeat(101) }],
        ["email", { email: "" }],
        ["email", { email: "not-an-email" }],
        ["category", { category: "unknown" }],
        ["message", { message: "短すぎる" }],
        ["message", { message: "あ".repeat(2001) }],
    ])("%s が不正なら弾く", (field, override) => {
        const result = contactFormSchema.safeParse({ ...validInput, ...override })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors).toHaveProperty(field)
        }
    })

    it.each(CONTACT_CATEGORIES.map((c) => c.value))(
        "相談種別 %s を受け付ける",
        (category) => {
            const result = contactFormSchema.safeParse({ ...validInput, category })
            expect(result.success).toBe(true)
        }
    )
})

describe("contactCategoryLabel", () => {
    it("定義済みの値は表示名に変換する", () => {
        expect(contactCategoryLabel("work")).toBe("お仕事のご相談")
    })

    it("未知の値はそのまま返す（通知が落ちないようにするため）", () => {
        expect(contactCategoryLabel("unknown")).toBe("unknown")
    })
})

describe("isSubmittedTooFast", () => {
    const now = 1_700_000_000_000

    it("開いた直後の送信はボットとみなす", () => {
        expect(isSubmittedTooFast(now, now)).toBe(true)
    })

    it("しきい値の直前は弾き、しきい値ちょうどは通す", () => {
        expect(isSubmittedTooFast(now - (MIN_SUBMIT_ELAPSED_MS - 1), now)).toBe(true)
        expect(isSubmittedTooFast(now - MIN_SUBMIT_ELAPSED_MS, now)).toBe(false)
    })

    it("クライアントの時計が進んでいて経過が負になる場合は通す", () => {
        // サーバーとクライアントの時計ずれで正当な送信を弾かないための逃げ道
        expect(isSubmittedTooFast(now + 60_000, now)).toBe(false)
    })

    it("24時間を超える経過は判定対象から外す", () => {
        expect(isSubmittedTooFast(now - 25 * 60 * 60 * 1000, now)).toBe(false)
    })

    it.each([undefined, null, "", "abc"])(
        "数値として読めない値（%s）は判定対象から外す",
        (value) => {
            expect(isSubmittedTooFast(value, now)).toBe(false)
        }
    )
})
