export const dynamic = "force-dynamic"

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
    // /studio 配下の入口ガード。以前は middleware がセッションクッキーの
    // 有無だけを見ていたが、Next.js 16 で middleware は deprecated であり、
    // 後継の proxy は Node.js ランタイム固定で @opennextjs/cloudflare が
    // まだ対応していない（opennextjs-cloudflare#1309）。
    // ここで auth() を呼ぶとクッキーの存在ではなくセッションの有効性を検証できる。
    // 書き込み系（Server Actions・Route Handlers）は各所で auth() を通しており、
    // このガードはあくまで画面表示の入口。
    const session = await auth()
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/studio")}`)
    }

    return (
        // 管理画面はライト配色で固定する。data-theme でこのサブツリーだけ
        // ライトのカスタムプロパティに差し替え、text-fg でその値を使って
        // color を引き直す（<body> の color はサイトのテーマで解決済みのため、
        // 変数を上書きするだけでは文字色が変わらない）。
        // これが無いとダークテーマ時に、白い面へ明るい文字が乗って読めなくなる。
        <div className="min-h-screen bg-slate-50 text-fg" data-theme="light">
            <header className="sticky top-0 z-50 border-b bg-white">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/studio"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Studio
                        </Link>
                        <nav className="flex items-center gap-2">
                            <Link
                                href="/studio/books"
                                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            >
                                Books
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">
                                <Home className="mr-1 h-4 w-4" />
                                サイト
                            </Link>
                        </Button>
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOut className="mr-1 h-4 w-4" />
                                サインアウト
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
    )
}
