export const dynamic = "force-dynamic"

import Link from "next/link"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
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
