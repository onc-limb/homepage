import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act } from "react-dom/test-utils"
import { createRoot, type Root } from "react-dom/client"

import GlobalError from "./global-error"

// React 18 の act() 実行環境フラグ。
// @ts-expect-error テスト実行環境専用のグローバルフラグ
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe("GlobalError", () => {
    let container: HTMLDivElement
    let root: Root

    beforeEach(() => {
        container = document.createElement("div")
        document.body.appendChild(container)
        root = createRoot(container)
    })

    afterEach(() => {
        act(() => {
            root.unmount()
        })
        container.remove()
        vi.restoreAllMocks()
    })

    it("error / reset プロップを受け取り、自前の <html><body> を持ってレンダリングされる", () => {
        const error = Object.assign(new Error("boom"), { digest: "abc123" })
        const reset = vi.fn()

        act(() => {
            root.render(<GlobalError error={error} reset={reset} />)
        })

        // ルートレイアウトを置き換えるため、コンポーネント自身が html/body を描画する。
        expect(container.querySelector("html")).not.toBeNull()
        expect(container.querySelector("body")).not.toBeNull()
        expect(container.textContent).toContain("問題が発生しました")
        // digest が渡された場合は Error ID として表示される。
        expect(container.textContent).toContain("abc123")
    })

    it("再試行ボタンのクリックで reset() が呼ばれる", () => {
        const error: Error & { digest?: string } = new Error("boom")
        const reset = vi.fn()

        act(() => {
            root.render(<GlobalError error={error} reset={reset} />)
        })

        const button = container.querySelector("button")
        expect(button).not.toBeNull()

        act(() => {
            button?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        })

        expect(reset).toHaveBeenCalledTimes(1)
    })
})
