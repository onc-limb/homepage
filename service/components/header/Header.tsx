"use client"

import { usePathname } from "next/navigation"
import { PAGE_WIDTH } from "@/components/ds/page-styles"
import { ThemeToggle } from "@/components/theme"
import { SiteBrand } from "./SiteBrand"
import { SiteNav } from "./SiteNav"
import { MobileNav } from "./MobileNav"

export default function Header() {
    const pathname = usePathname() || "/"
    return (
        <header className="sticky top-0 z-50 border-b border-ds-border bg-ds-bg">
            <div className={`${PAGE_WIDTH} flex flex-wrap items-center gap-x-ds-4 py-ds-2`}>
                <SiteBrand pathname={pathname} />
                <SiteNav pathname={pathname} />
                <div className="ml-auto inline-flex items-center gap-ds-2">
                    <ThemeToggle />
                    <MobileNav pathname={pathname} />
                </div>
            </div>
        </header>
    )
}
