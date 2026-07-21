import type { Project } from "@/lib/portfolio"
import { PortfolioSection } from "./PortfolioSection"

interface Props {
    personal: Project[]
}

export function PortfolioListClient({ personal }: Props) {
    return (
        <section className="py-14">
            <div className="mx-auto max-w-[1080px] px-6">
                {personal.length > 0 ? (
                    <PortfolioSection
                        seq="/01"
                        title="Personal Projects"
                        countLabel="projects"
                        projects={personal}
                    />
                ) : (
                    <div className="py-12 text-center text-fg-muted">
                        プロジェクトは準備中です
                    </div>
                )}
            </div>
        </section>
    )
}
