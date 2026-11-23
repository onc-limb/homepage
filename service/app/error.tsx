"use client"

import { useEffect } from "react"

import { DoorButton } from "@/components/ds/DoorButton"
import { Page } from "@/components/ds/Page"

import { ERROR_TITLE } from "./error-copy"

// App Router のセグメントエラーバウンダリ規約に沿った Client Component。
// error / reset プロップを受け取り、reset() で該当セグメントの再レンダリングを試みる。
type ErrorBoundaryProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        // ASSUMPTION: 構造化ロガー / 外部エラートラッキング（Sentry 等）の導入は本 issue のスコープ外。
        // ここではブラウザコンソールへの出力にとどめ、握りつぶさず可視化する。
        console.error(error)
    }, [error])

    return (
        <main className="flex-1">
            <Page title={ERROR_TITLE}>
                <div className="space-y-ds-3">
                    <p>
                        ページの表示中に予期しないエラーが発生しました。お手数ですが、時間をおいて再度お試しください。
                    </p>
                    {error.digest ? (
                        <p className="text-ds-sm">エラー ID: {error.digest}</p>
                    ) : null}
                    <DoorButton onClick={() => reset()}>再試行する</DoorButton>
                </div>
            </Page>
        </main>
    )
}
