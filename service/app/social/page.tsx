import { BookOpen } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { Reveal } from "@/components/animations"
import { GitHubIcon, XIcon } from "@/components/icons"
import { SOCIAL_LINKS, type SocialLink } from "@/lib/constants"

interface SocialPresentation {
    icon: ReactNode
    description: string
}

const PRESENTATION: Record<string, SocialPresentation> = {
    GitHub: {
        icon: <GitHubIcon className="h-6 w-6" />,
        description: "ソースコード",
    },
    Zenn: {
        icon: <BookOpen className="h-6 w-6" />,
        description: "技術記事の執筆",
    },
    "X (Twitter)": {
        icon: <XIcon className="h-6 w-6" />,
        description: "日々の発信、技術トピック",
    },
}

function presentationFor(link: SocialLink): SocialPresentation {
    const presentation = PRESENTATION[link.name]
    if (!presentation) {
        throw new Error(`Missing social presentation for ${link.name}`)
    }
    return presentation
}

export default function SocialPage() {
    return (
        <main className="page flex-1">
            <section className="px-0 pb-10 pt-20">
                <div className="mx-auto max-w-[820px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">social</b>
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mb-5 text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            別の場所で
                            <br />
                            発信しています。
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="max-w-[640px] text-lg leading-[1.7] text-fg">
                            ソースコード、技術記事、日々の発信。プラットフォームごとにリズムが違います。
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="pb-20">
                <div className="mx-auto flex max-w-[820px] flex-col gap-4 px-6">
                    {SOCIAL_LINKS.map((link, i) => {
                        const presentation = presentationFor(link)
                        return (
                            <Reveal key={link.name} delay={i * 80}>
                                <Link
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-6 rounded-[var(--radius-lg)] border border-hairline-strong bg-surface p-7 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent hover:shadow-card-soft"
                                >
                                    <div
                                        className="grid h-12 w-12 shrink-0 place-items-center rounded-md text-accent transition-colors group-hover:text-accent-strong"
                                        style={{ background: "var(--accent-soft)" }}
                                    >
                                        {presentation.icon}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-semibold text-fg-strong">
                                                {link.name}
                                            </span>
                                            <span className="font-mono text-xs text-fg-dim">
                                                {link.username}
                                            </span>
                                        </div>
                                        <span className="text-sm text-fg-muted">
                                            {presentation.description}
                                        </span>
                                    </div>
                                    <span
                                        aria-hidden="true"
                                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-muted transition-all duration-[250ms] group-hover:translate-x-1 group-hover:bg-accent group-hover:text-white"
                                    >
                                        ↗
                                    </span>
                                </Link>
                            </Reveal>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}
