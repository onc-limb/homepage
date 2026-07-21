import Link from "next/link"

import { Reveal } from "@/components/animations"
import { Button } from "@/components/ui/button"

// App Router の not-found 規約に沿った Server Component。
// 存在しない URL にアクセスした際に表示される 404 ページ。
// 既存のデザインシステム（globals.css の CSS トークン / Reveal 等の共通 UI）に合わせる。
export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
            <Reveal>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Error 404
                </p>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    ページが見つかりません
                </h1>
                <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
                    お探しのページは移動または削除された可能性があります。URL をご確認いただくか、ホームからお探しください。
                </p>
                <div className="mt-10 flex justify-center">
                    <Button asChild>
                        <Link href="/">ホームへ戻る</Link>
                    </Button>
                </div>
            </Reveal>
        </main>
    )
}
