import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { notifySlack } from "./slack"
import type { ContactNotification } from "./types"

const WEBHOOK = "https://hooks.slack.example/services/T000/B000/XXXX"

const contact: ContactNotification = {
    id: 42,
    name: "尾長 聡",
    email: "someone@example.com",
    company: "Example Inc.",
    categoryLabel: "お仕事のご相談",
    message: "よろしくお願いします。",
}

function mockFetch(response: Partial<Response> = { ok: true }) {
    // 引数を宣言しておかないと mock.calls が空タプル型になり、呼び出し内容を検証できない。
    const fetchMock = vi.fn(
        async (_input: RequestInfo | URL, _init?: RequestInit) =>
            response as Response
    )
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

/** 直近の fetch 呼び出しに渡された JSON ボディを取り出す。 */
function sentPayload(fetchMock: ReturnType<typeof mockFetch>) {
    return JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
}

beforeEach(() => {
    vi.stubEnv("SLACK_WEBHOOK_URL", WEBHOOK)
})

afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe("notifySlack", () => {
    it("Webhook URL 未設定なら送信せずスキップする", async () => {
        vi.stubEnv("SLACK_WEBHOOK_URL", "")
        const fetchMock = mockFetch()

        const result = await notifySlack(contact)

        expect(result).toEqual({ delivered: false, skipped: true })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("Webhook へ POST し、成功したら delivered を返す", async () => {
        const fetchMock = mockFetch({ ok: true })

        const result = await notifySlack(contact)

        expect(result).toEqual({ delivered: true, skipped: false })
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock.mock.calls[0][0]).toBe(WEBHOOK)
        expect(fetchMock.mock.calls[0][1]?.method).toBe("POST")
    })

    it("blocks を表示できないクライアント向けに text も載せる", async () => {
        const fetchMock = mockFetch()

        await notifySlack(contact)

        const payload = sentPayload(fetchMock)
        expect(payload.text).toContain("尾長 聡")
        expect(payload.text).toContain("お仕事のご相談")
        expect(Array.isArray(payload.blocks)).toBe(true)
    })

    it("問い合わせ本文の mrkdwn 制御文字をエスケープする", async () => {
        const fetchMock = mockFetch()

        await notifySlack({
            ...contact,
            message: "<https://evil.example|クリック> & 続き",
        })

        const body = JSON.stringify(sentPayload(fetchMock))
        // 生の < > & が残っていると Slack 側でリンクとして解釈されてしまう
        expect(body).toContain("&lt;https://evil.example|クリック&gt;")
        expect(body).toContain("&amp;")
    })

    it("会社名が空なら未記入と表示する", async () => {
        const fetchMock = mockFetch()

        await notifySlack({ ...contact, company: null })

        expect(JSON.stringify(sentPayload(fetchMock))).toContain("（未記入）")
    })

    it("Webhook が 2xx 以外を返したら失敗として扱う", async () => {
        mockFetch({ ok: false, status: 500 })

        const result = await notifySlack(contact)

        expect(result).toEqual({ delivered: false, skipped: false })
    })

    it("送信中に例外が出ても投げ返さず失敗として扱う", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("network down")
            })
        )

        const result = await notifySlack(contact)

        expect(result).toEqual({ delivered: false, skipped: false })
    })
})
