import { PAGE_WIDTH } from "@/components/ds/page-styles"
import { TextLink } from "@/components/ds/TextLink"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"
import { SITE_NAME } from "@/lib/seo"

export default function Footer() {
    return (
        <footer className="border-t border-ds-border font-ds text-ds-sm text-ds-fg-muted">
            <div
                className={`${PAGE_WIDTH} flex flex-wrap justify-between gap-x-ds-4 gap-y-ds-2 py-ds-4`}
            >
                <p>© {new Date().getFullYear()} {SITE_NAME}</p>
                <nav aria-label="フッター" className="flex flex-wrap gap-ds-4">
                    {NAV_ITEMS.map((item) => (
                        <TextLink key={item.href} href={item.href}>
                            {item.label}
                        </TextLink>
                    ))}
                    {SOCIAL_LINKS.map((link) => (
                        <TextLink key={link.url} href={link.url}>
                            {link.name}
                        </TextLink>
                    ))}
                </nav>
            </div>
        </footer>
    )
}
