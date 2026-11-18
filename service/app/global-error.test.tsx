// @vitest-environment jsdom
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

        // jsdom の既定の文書は最初から html と body を持つ。存在の確認では
        // コンポーネントの出力を区別できないため、描画前は属性がないことを確かめる。
        expect(document.documentElement.getAttribute("lang")).toBeNull()
        expect(document.body.getAttribute("style")).toBeNull()

        // <html> は div の子として DOM に置けないため、document 全体を React の root にする。
        const documentRoot = createRoot(document)
        act(() => {
            documentRoot.render(<GlobalError error={error} reset={reset} />)
        })

        // ルートレイアウトを置き換えるため、コンポーネント自身が html/body を描画する。
        expect(document.documentElement.getAttribute("lang")).toBe("ja")
        expect(document.body.style.minHeight).toBe("100vh")
        expect(document.body.textContent).toContain("問題が発生しました")
        // digest が渡された場合は Error ID として表示される。
        expect(document.body.textContent).toContain("abc123")

        act(() => {
            documentRoot.unmount()
        })
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
