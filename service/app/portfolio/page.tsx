import type { Metadata } from "next"
import { getProjects } from "@/lib/portfolio"
import { createPageMetadata } from "@/lib/seo"
import { Reveal } from "@/components/animations"
import { PortfolioListClient } from "@/components/portfolio"

export const metadata: Metadata = createPageMetadata({
    title: "Portfolio",
    description:
        "設計・実装・運用に携わったWebアプリケーションや、個人開発プロジェクトの実績を紹介します。",
    path: "/portfolio",
})

export default function PortfolioPage() {
    const projects = getProjects()
    const personal = projects.filter((p) => p.category === "personal")

    return (
        <main className="page flex-1">
            <section className="px-0 pb-10 pt-20">
                <div className="mx-auto max-w-[1080px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">portfolio</b>
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mb-5 text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            作って、届けて、
                            <br />
                            動かし続けたもの。
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="max-w-[640px] text-lg leading-[1.7] text-fg">
                            個人プロジェクトの記録。詳細を残せるものは詳細ページへ。
                        </p>
                    </Reveal>
                </div>
            </section>

            <PortfolioListClient personal={personal} />
        </main>
    )
}
