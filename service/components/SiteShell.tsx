"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isStudio = pathname.startsWith("/studio")

    if (isStudio) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}
