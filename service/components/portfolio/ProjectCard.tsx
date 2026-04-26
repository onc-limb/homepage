import Link from "next/link"
import type { Project } from "@/lib/portfolio"
import { ExternalIcon, GitHubIcon } from "@/components/icons"

interface ProjectCardProps {
    project: Project
    number: string
}

export function ProjectCard({ project, number }: ProjectCardProps) {
    const hasDetail = project.detail !== undefined
    const detailHref = `/portfolio/${project.id}`
    return (
        <article
            data-cat={project.category}
            className="proj group relative grid grid-cols-1 gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface px-8 py-7 backdrop-blur-[8px] transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent hover:shadow-card-soft [@media(min-width:720px)]:grid-cols-[80px_1fr_auto] [@media(min-width:720px)]:items-start"
        >
            <div className="pt-1 font-mono text-xs tracking-[0.16em] text-fg-dim">
                {number}
            </div>
            <div>
                <div className="mb-2 flex flex-wrap items-baseline gap-3.5">
                    <h3 className="text-[22px] font-semibold tracking-[-0.01em]">
                        {hasDetail ? (
                            <Link
                                href={detailHref}
                                className="transition-colors duration-200 hover:text-accent"
                            >
                                {project.title}
                            </Link>
                        ) : (
                            project.title
                        )}
                    </h3>
                    <span className="font-mono text-[11px] tracking-[0.06em] text-fg-dim">
                        {project.period}
                    </span>
                </div>
                <p className="mb-3.5 text-[14.5px] leading-[1.7] text-fg-muted">
                    {project.description}
                </p>
                {project.highlights.length > 0 && (
                    <ul className="mb-3.5 grid list-none gap-1 p-0">
                        {project.highlights.map((h, i) => (
                            <li
                                key={i}
                                className="relative py-0.5 pl-4.5 text-[13.5px] text-fg before:absolute before:left-0 before:font-semibold before:text-accent before:content-['›']"
                                style={{ paddingLeft: "18px" }}
                            >
                                {h}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((t) => (
                        <span
                            key={t}
                            className="rounded-[4px] border border-hairline-strong bg-bg px-2 py-0.5 font-mono text-[11px] text-fg"
                        >
                            {t}
                        </span>
                    ))}
                </div>
                {hasDetail && (
                    <Link
                        href={detailHref}
                        className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.06em] text-accent transition-all duration-200 hover:gap-2.5"
                    >
                        View case study
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>
            <div className="flex flex-wrap gap-2 self-start">
                {project.links?.github && (
                    <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="grid h-9 w-9 place-items-center rounded-md border border-hairline-strong text-fg-muted transition-all duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent"
                    >
                        <GitHubIcon />
                    </a>
                )}
                {project.links?.demo && (
                    <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Live demo"
                        className="grid h-9 w-9 place-items-center rounded-md border border-hairline-strong text-fg-muted transition-all duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent"
                    >
                        <ExternalIcon />
                    </a>
                )}
            </div>
        </article>
    )
}
