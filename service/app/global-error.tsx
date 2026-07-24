"use client"

// App Router の global-error 規約に基づく最上位フォールバック。
// ルートレイアウト（app/layout.tsx）ごと置き換わるため、自前で <html>/<body> を持ち、
// 通常のプロバイダ・globals.css の適用を前提にできない。
//
// ASSUMPTION: ルート致命時は layout.tsx で読み込まれる globals.css のトークンや
// Reveal（motion 依存の共通 UI）が確実に適用される保証がないため、デザインシステムの
// トーン（ダーク基調＋アクセントグラデーション）に「可能な範囲で」寄せつつ、
// 依存を持たないインラインスタイルでスタンドアロン動作させる方針とする。

type GlobalErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <html lang="ja">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    background: "#0a0a0f",
                    color: "#e5e7eb",
                    fontFamily:
                        "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif",
                    lineHeight: 1.6,
                    WebkitFontSmoothing: "antialiased",
                }}
            >
                <main
                    role="alert"
                    aria-live="assertive"
                    style={{
                        width: "100%",
                        maxWidth: "32rem",
                        textAlign: "center",
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 0.75rem",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "#818cf8",
                        }}
                    >
                        Fatal Error
                    </p>
                    <h1
                        style={{
                            margin: "0 0 1rem",
                            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                            fontWeight: 700,
                            background: "#a5b4fc",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        問題が発生しました
                    </h1>
                    <p
                        style={{
                            margin: "0 0 2rem",
                            fontSize: "1rem",
                            color: "#9ca3af",
                        }}
                    >
                        予期しないエラーによりページを表示できませんでした。お手数ですが、もう一度お試しください。
                    </p>

                    {error.digest ? (
                        <p
                            style={{
                                margin: "0 0 2rem",
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                fontFamily:
                                    "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                            }}
                        >
                            Error ID: {error.digest}
                        </p>
                    ) : null}

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                            justifyContent: "center",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => reset()}
                            style={{
                                appearance: "none",
                                cursor: "pointer",
                                border: "none",
                                borderRadius: "0.625rem",
                                padding: "0.75rem 1.75rem",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                color: "#0a0a0f",
                                background: "#a5b4fc",
                            }}
                        >
                            もう一度試す
                        </button>
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error はルートレイアウトごと置き換わるため next/link の Router Context に依存できない */}
                        <a
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "0.625rem",
                                padding: "0.75rem 1.75rem",
                                fontSize: "0.9375rem",
                                fontWeight: 600,
                                color: "#e5e7eb",
                                textDecoration: "none",
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                            }}
                        >
                            ホームへ戻る
                        </a>
                    </div>
                </main>
            </body>
        </html>
    )
}
