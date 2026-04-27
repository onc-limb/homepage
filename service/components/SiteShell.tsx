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

    return (
        <>
            <ParticleBackground />
            <Header />
            {children}
            <Footer />
        </>
    )
}
