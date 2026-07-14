"use client"

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

    // /blog は NAV_ITEMS の一項目として SiteNav / MobileNav から他項目と同じ粒度で
    // 描画される（#124）。gh#107 当時にここへ別建てしていた /blog 専用サブナビは撤去した。
    return (
        <>
            <ParticleBackground />
            <Header />
            {children}
            <Footer />
        </>
    )
}
