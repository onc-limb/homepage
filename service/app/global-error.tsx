"use client"

import { DoorButton } from "@/components/ds/DoorButton"
import { TEXT_LINK } from "@/components/ds/link-styles"
import { Page } from "@/components/ds/Page"

import { ERROR_TITLE, HOME_LINK_LABEL } from "./error-copy"
import "./globals.css"

type GlobalErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

// The root layout is replaced, so this boundary provides its own document and styles.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <html lang="ja">
            <body className="min-h-screen bg-ds-bg">
                <main role="alert" aria-live="assertive">
                    <Page title={ERROR_TITLE}>
                        <div className="space-y-ds-3">
                            <p>
                                予期しないエラーによりページを表示できませんでした。お手数ですが、もう一度お試しください。
                            </p>
                            {error.digest ? (
                                <p className="text-ds-sm">Error ID: {error.digest}</p>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-ds-3">
                                <DoorButton onClick={() => reset()}>もう一度試す</DoorButton>
                                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error はルートレイアウトごと置き換わるため next/link の Router Context に依存できない */}
                                <a href="/" className={TEXT_LINK}>
                                    {HOME_LINK_LABEL}
                                </a>
                            </div>
                        </div>
                    </Page>
                </main>
            </body>
        </html>
    )
}
