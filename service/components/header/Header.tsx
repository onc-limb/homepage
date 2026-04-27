"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme"
import { SiteBrand } from "./SiteBrand"
import { SiteNav } from "./SiteNav"
import { MobileNav } from "./MobileNav"

export default function Header() {
    const pathname = usePathname() || "/"
    return (
        <header className="site-header relative">
            <div className="site-header__inner mx-auto grid max-w-[var(--container)] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-3.5 md:px-10 md:py-4">
                <SiteBrand pathname={pathname} />
                <SiteNav pathname={pathname} />
                <div className="inline-flex items-center gap-2">
                    <ThemeToggle />
                    <MobileNav pathname={pathname} />
                </div>
            </div>
        </header>
    )
}
