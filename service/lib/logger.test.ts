import { afterEach, describe, expect, it, vi } from "vitest"

import { createLogger, logger } from "./logger"

type ConsoleLevel = "debug" | "info" | "warn" | "error"

// 指定レベルの console 出力をキャプチャするスパイを張る。
function spyConsole(level: ConsoleLevel) {
    return vi.spyOn(console, level).mockImplementation(() => {})
}

// スパイに渡された最初の引数（JSON 文字列）をパースして返す。
function firstPayload(spy: ReturnType<typeof spyConsole>): LogEntryLike {
    return JSON.parse(spy.mock.calls[0][0] as string) as LogEntryLike
}

interface LogEntryLike {
    level: string
    message: string
    timestamp: string
    context?: Record<string, unknown>
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("logger", () => {
    it("各レベルが対応する console メソッドへ構造化出力される", () => {
        const levels: ConsoleLevel[] = ["debug", "info", "warn", "error"]
        for (const level of levels) {
            const spy = spyConsole(level)
            createLogger()[level]("hello")

            expect(spy).toHaveBeenCalledTimes(1)
            const payload = firstPayload(spy)
            expect(payload.level).toBe(level)
            expect(payload.message).toBe("hello")
            expect(typeof payload.timestamp).toBe("string")

            spy.mockRestore()
        }
    })

    it("コンテキストが context フィールドとして付与される", () => {
        const spy = spyConsole("info")
        createLogger().info("with ctx", { userId: 1, path: "/blog" })

        const payload = firstPayload(spy)
        expect(payload.context).toEqual({ userId: 1, path: "/blog" })
    })

    it("コンテキストが無い場合は context フィールドを出力しない", () => {
        const spy = spyConsole("info")
        createLogger().info("no ctx")

        const payload = firstPayload(spy)
        expect(payload).not.toHaveProperty("context")
    })

    it("最小レベル未満のログは抑制される", () => {
        const debugSpy = spyConsole("debug")
        const errorSpy = spyConsole("error")
        const log = createLogger({ level: "warn" })

        log.debug("skip")
        log.error("keep")

        expect(debugSpy).not.toHaveBeenCalled()
        expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it("child は既定コンテキストとログ時コンテキストをマージする", () => {
        const spy = spyConsole("info")
        const base = createLogger({ context: { service: "blog" } })
        const child = base.child({ requestId: "abc" })

        child.info("msg", { extra: true })

        const payload = firstPayload(spy)
        expect(payload.context).toEqual({
            service: "blog",
            requestId: "abc",
            extra: true,
        })
    })

    it("Error は name / message / stack に展開される", () => {
        const spy = spyConsole("error")
        createLogger().error("failed", { err: new Error("boom") })

        const payload = firstPayload(spy)
        const err = payload.context?.err as Record<string, unknown>
        expect(err.name).toBe("Error")
        expect(err.message).toBe("boom")
        expect(typeof err.stack).toBe("string")
    })

    it("既定ロガー logger が利用できる", () => {
        const spy = spyConsole("info")
        logger.info("default")

        expect(spy).toHaveBeenCalledTimes(1)
        expect(firstPayload(spy).message).toBe("default")
    })
})
