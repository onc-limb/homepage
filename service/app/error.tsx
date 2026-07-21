"use client"

import { useEffect } from "react"

import { Reveal } from "@/components/animations"
import { Button } from "@/components/ui/button"

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
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
            <Reveal>
                <div className="mx-auto flex max-w-md flex-col items-center gap-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Error
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        問題が発生しました
                    </h1>
                    <p className="text-muted-foreground">
                        ページの表示中に予期しないエラーが発生しました。お手数ですが、時間をおいて再度お試しください。
                    </p>
                    {error.digest ? (
                        <p className="text-xs text-muted-foreground/70">
                            エラー ID: {error.digest}
                        </p>
                    ) : null}
                    <Button onClick={() => reset()}>再試行する</Button>
                </div>
            </Reveal>
        </div>
    )
}
