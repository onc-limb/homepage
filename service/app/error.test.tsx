/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { act } from "react-dom/test-utils"
import { createRoot, type Root } from "react-dom/client"

import ErrorBoundary from "./error"

// react-dom/test-utils の act をランタイム警告なしで使うためのフラグ。
;(
    globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

type Rendered = {
    container: HTMLElement
    root: Root
    unmount: () => void
}

// testing-library は未導入のため、react-dom/client + jsdom で直接描画する。
function renderError(reset: () => void): Rendered {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => {
        root.render(
            <ErrorBoundary
                error={Object.assign(new Error("boom"), { digest: "abc123" })}
                reset={reset}
            />,
        )
    })
    return {
        container,
        root,
        unmount() {
            act(() => {
                root.unmount()
            })
            container.remove()
        },
    }
}

describe("app/error.tsx", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("error / reset プロップを受け取ってフォールバック UI を描画する", () => {
        // useEffect 内の console.error（意図的なログ出力）でテスト出力を汚さない。
        vi.spyOn(console, "error").mockImplementation(() => {})
        const reset = vi.fn()
        const { container, unmount } = renderError(reset)

        expect(container.textContent).toContain("問題が発生しました")
        // 再試行導線としてのボタンが存在する。
        expect(container.querySelector("button")).not.toBeNull()

        unmount()
    })

    it("再試行ボタン押下で reset が呼ばれる", () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const reset = vi.fn()
        const { container, unmount } = renderError(reset)

        const button = container.querySelector("button")
        expect(button).not.toBeNull()

        act(() => {
            button?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        })

        expect(reset).toHaveBeenCalledTimes(1)

        unmount()
    })
})
