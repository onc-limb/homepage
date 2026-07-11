"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ParticleBackground } from "@/components/animations"

export default function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isStudio = pathname.startsWith("/studio")

    if (isStudio) {
        return <>{children}</>
    }

    // ASSUMPTION: 公開ナビの実体 (NAV_ITEMS / service/components/header 配下) は本タスクの
    // 書き込み境界 (service/app/blog/**, service/components/blog/**, service/components/*.tsx) の
    // 外側にある。そのため記事一覧 (/blog) への導線を、書き込み可能な共通シェル
    // (service/components 直下) のヘッダー直下サブナビとして追加し、books へのリンクを持つ
    // 既存ナビと同じ公開シェル上で /blog へ到達できるようにする。
    const isBlog = pathname === "/blog" || pathname.startsWith("/blog/")

    return (
        <>
            <ParticleBackground />
            <Header />
            <div className="relative z-[1] border-b border-hairline">
                <nav
                    aria-label="blog"
                    className="mx-auto flex max-w-[var(--container)] justify-end px-6 py-2 md:px-10"
                >
                    <Link
                        href="/blog"
                        aria-current={isBlog ? "page" : undefined}
                        className={
                            "inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.06em] transition-colors duration-200 " +
                            (isBlog
                                ? "text-accent"
                                : "text-fg-muted hover:text-accent")
                        }
                    >
                        <span aria-hidden="true" className="text-accent">
                            /
                        </span>
                        blog
                    </Link>
                </nav>
            </div>
            {children}
            <Footer />
        </>
    )
}
