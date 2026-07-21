import { Reveal } from "@/components/animations"
import { formatProjectNumber, type Project } from "@/lib/portfolio"
import { ProjectCard } from "./ProjectCard"

interface PortfolioSectionProps {
    seq: string
    title: string
    countLabel: string
    projects: Project[]
}

/**
 * Portfolio 一覧の "Personal Projects" セクションを共通化したコンポーネント。
 * 番号フォーマットは `formatProjectNumber` を共用する。
 */
export function PortfolioSection({
    seq,
    title,
    countLabel,
    projects,
}: PortfolioSectionProps) {
    return (
        <>
            <Reveal
                as="header"
                className="my-10 flex items-baseline gap-3.5 border-b border-hairline pb-3.5"
            >
                <span className="font-mono text-xs tracking-[0.18em] text-accent">
                    {seq}
                </span>
                <h2 className="text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>
                <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                    {projects.length} {countLabel}
                </span>
            </Reveal>
            <div className="grid gap-4">
                {projects.map((project, i) => (
                    <Reveal key={project.id} delay={i * 80}>
                        <ProjectCard
                            project={project}
                            number={formatProjectNumber(project.category, i)}
                        />
                    </Reveal>
                ))}
            </div>
        </>
    )
}
