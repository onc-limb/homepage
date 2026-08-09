import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
    findAdjacentProjectIds,
    formatProjectNumber,
    getProjectById,
    getProjectIds,
    getProjects,
} from "@/lib/portfolio"
import { Reveal } from "@/components/animations"
import { ExternalIcon, GitHubIcon } from "@/components/icons"
import { ArchDiagram, Pager } from "@/components/portfolio"
import { JsonLd } from "@/components/seo"
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata } from "@/lib/seo"

export function generateStaticParams() {
    return getProjectIds().map((id) => ({ id }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const project = getProjectById(id)
    if (!project) return { title: "Project Not Found" }
    return createPageMetadata({
        title: project.title,
        description: project.description,
        path: `/portfolio/${project.id}`,
    })
}

function inferStatus(period: string): string {
    return /present|現在|〜/i.test(period) ? "production" : "archived"
}

function statusVisual(period: string): string {
    return inferStatus(period) === "production" ? "In Production" : "Archived"
}

function projectNumber(
    project: { id: string; category: "personal" },
    all: { id: string; category: "personal" }[]
): string {
    const sameList = all.filter((p) => p.category === project.category)
    const indexInList = sameList.findIndex((p) => p.id === project.id)
    return formatProjectNumber(project.category, indexInList)
}

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const project = getProjectById(id)
    if (!project) notFound()

    const ids = getProjectIds()
    const all = getProjects()
    const { prev, next } = findAdjacentProjectIds(ids, project.id)
    const prevProj = prev ? all.find((p) => p.id === prev) : null
    const nextProj = next ? all.find((p) => p.id === next) : null

    const detailNumber = projectNumber(project, all)

    const isOncLimb = project.id === "portfolio-site"

    return (
        <main className="page flex-1">
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        name: project.title,
                        description: project.longDescription || project.description,
                        url: absoluteUrl(`/portfolio/${project.id}`),
                        creator: {
                            "@type": "Person",
                            name: "onclimb",
                            url: absoluteUrl("/profile"),
                        },
                        keywords: project.technologies.join(", "),
                        inLanguage: "ja-JP",
                    },
                    breadcrumbJsonLd([
                        { name: "Home", path: "/" },
                        { name: "Portfolio", path: "/portfolio" },
                        {
                            name: project.title,
                            path: `/portfolio/${project.id}`,
                        },
                    ]),
                ]}
            />
            {/* HERO */}
            <section className="relative overflow-hidden border-b border-hairline px-0 pb-12 pt-[72px]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-[1]"
                    style={{
                        // グラデーション廃止・単色化: 放射状グラデーションの背面装飾を単色パネルに置換
                        background: "var(--bg-elev)",
                    }}
                />
                <div className="mx-auto max-w-[980px] px-6">
                    <Reveal className="mb-6 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <Link
                            href="/"
                            className="text-fg-muted transition-colors hover:text-accent"
                        >
                            onclimb
                        </Link>
                        <span className="text-fg-dim">/</span>
                        <Link
                            href="/portfolio"
                            className="text-fg-muted transition-colors hover:text-accent"
                        >
                            portfolio
                        </Link>
                        <span className="text-fg-dim">/</span>
                        <b className="font-medium text-accent">{project.title}</b>
                    </Reveal>
                    <Reveal
                        delay={60}
                        className="mb-5 flex flex-wrap items-baseline gap-3.5"
                    >
                        <span className="font-mono text-[13px] tracking-[0.18em] text-accent">
                            {detailNumber}
                        </span>
                        <span className="font-mono text-xs tracking-[0.06em] text-fg-dim">
                            {project.period}
                        </span>
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full border border-hairline-solid px-2.5 py-0.5 font-mono text-[11px] text-fg-strong"
                            style={{
                                // ASSUMPTION: --accent-soft は accent の低不透明度ティント（透明度 1.0 未満）の
                                // 可能性があり、かつ accent 文字×accent ティントは同系色で 4.5:1 を割る恐れがあるため、
                                // 不透明の --surface-solid 背景 + text-fg-strong に置換し WCAG 2.2 AA を保証。
                                // アクセント色の視覚的合図はステータスドット（下記）で維持する。
                                background: "var(--surface-solid)",
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="block h-1.5 w-1.5 rounded-full"
                                style={{
                                    background: "var(--accent)",
                                    boxShadow: "0 0 6px var(--accent)",
                                }}
                            />
                            {inferStatus(project.period)}
                        </span>
                    </Reveal>
                    <Reveal delay={120}>
                        <h1 className="mb-4 text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            {project.title}
                        </h1>
                    </Reveal>
                    <Reveal delay={180}>
                        <p className="mb-7 max-w-[720px] text-lg leading-[1.7] text-fg">
                            {project.longDescription || project.description}
                        </p>
                    </Reveal>
                    <Reveal delay={240} className="flex flex-wrap gap-2.5">
                        {project.links?.demo && (
                            <a
                                href={project.links.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 font-mono text-xs tracking-[0.04em] text-white transition-all duration-200 hover:-translate-y-0.5"
                                style={{ background: "var(--accent)" }}
                            >
                                Live demo
                                <ExternalIcon width={12} height={12} />
                            </a>
                        )}
                        {project.links?.github && (
                            <a
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-4 py-2.5 font-mono text-xs tracking-[0.04em] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
                            >
                                <GitHubIcon />
                                GitHub
                            </a>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* FACTS */}
            <Reveal
                className="mx-auto -mt-6 grid max-w-[980px] grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-hairline px-6 [@media(min-width:720px)]:grid-cols-4"
                style={{ background: "var(--hairline)" }}
            >
                <Fact label="CATEGORY">Personal · Web</Fact>
                <Fact label="ROLE">{project.role}</Fact>
                <Fact label="DURATION">{project.period}</Fact>
                <Fact label="STATUS" accent>
                    {statusVisual(project.period)}
                </Fact>
            </Reveal>

            {/* 01 BACKGROUND */}
            {(project.detail?.background || project.detail?.overview) && (
                <DetailSection num="/01" title="作成背景" sub="— why I built this">
                    <div className="text-base leading-[1.85] text-fg">
                        {project.detail.overview && (
                            <p className="mb-4">{project.detail.overview}</p>
                        )}
                        {project.detail.background && (
                            <p className="mb-4">{project.detail.background}</p>
                        )}
                    </div>
                </DetailSection>
            )}

            {/* 02 TECH */}
            <DetailSection num="/02" title="使用技術" sub="— stack & tooling">
                <div
                    className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-hairline [@media(min-width:720px)]:grid-cols-2"
                    style={{ background: "var(--hairline)" }}
                >
                    <div className="bg-bg-elev px-6 py-5 transition-colors duration-200 hover:bg-bg-elev-2">
                        <div className="mb-3.5 flex items-center gap-2.5">
                            <div
                                className="grid h-8 w-8 place-items-center rounded-md border border-hairline-solid text-accent"
                                style={{
                                    // ASSUMPTION: --accent-soft は半透明ティント（透明度 1.0 未満）の可能性があるため、
                                    // 不透明の --surface-solid + border に置換。内包する SVG は装飾（非テキスト）で
                                    // accent アイコン×surface-solid は WCAG 1.4.11(3:1) を満たす前提。
                                    background: "var(--surface-solid)",
                                }}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 4h16v16H4z" />
                                    <path d="M9 4v16M4 9h5" />
                                </svg>
                            </div>
                            <div className="text-sm font-semibold text-fg-strong">
                                Stack
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {project.technologies.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-[4px] border border-hairline-strong bg-bg px-2.5 py-1 font-mono text-[11.5px] text-fg transition-all duration-200 hover:border-accent hover:text-accent"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </DetailSection>

            {/* 03 ARCH */}
            {isOncLimb && (
                <DetailSection num="/03" title="インフラ構成図" sub="— architecture">
                    <Reveal>
                        <ArchDiagram />
                    </Reveal>
                </DetailSection>
            )}

            {/* 04 CRAFTS */}
            {project.detail?.technicalPoints &&
                project.detail.technicalPoints.length > 0 && (
                    <DetailSection
                        num="/04"
                        title="工夫した点"
                        sub="— what I obsessed over"
                    >
                        <div className="grid grid-cols-1 gap-4 [@media(min-width:720px)]:grid-cols-2">
                            {project.detail.technicalPoints.map((pt, i) => (
                                <Reveal
                                    key={i}
                                    delay={i * 80}
                                    as="article"
                                    className="craft relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid shadow-card px-7 py-6 transition-all duration-250 hover:-translate-y-0.5 hover:border-accent"
                                >
                                    <div className="mb-2 font-mono text-[11px] tracking-[0.18em] text-accent">
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <h3 className="mb-2.5 text-lg font-semibold leading-[1.4]">
                                        {pt.title}
                                    </h3>
                                    <p className="text-[14.5px] leading-[1.75] text-fg-muted">
                                        {pt.description}
                                    </p>
                                </Reveal>
                            ))}
                        </div>
                    </DetailSection>
                )}

            <Pager
                prev={
                    prevProj
                        ? {
                              id: prevProj.id,
                              title: prevProj.title,
                              number: projectNumber(prevProj, all),
                          }
                        : null
                }
                next={
                    nextProj
                        ? {
                              id: nextProj.id,
                              title: nextProj.title,
                              number: projectNumber(nextProj, all),
                          }
                        : null
                }
            />
        </main>
    )
}

function Fact({
    label,
    children,
    accent = false,
}: {
    label: string
    children: React.ReactNode
    accent?: boolean
}) {
    return (
        <div className="bg-bg-elev px-5 py-4">
            <div className="mb-1.5 font-mono text-[10px] tracking-[0.18em] text-fg-dim">
                {label}
            </div>
            <div
                className="text-[15px] font-semibold leading-[1.3]"
                style={
                    accent ? { color: "var(--accent)" } : { color: "var(--fg-strong)" }
                }
            >
                {children}
            </div>
        </div>
    )
}

function DetailSection({
    num,
    title,
    sub,
    children,
}: {
    num: string
    title: string
    sub: string
    children: React.ReactNode
}) {
    return (
        <section className="py-[70px]">
            <div className="mx-auto max-w-[980px] px-6">
                <Reveal
                    as="header"
                    className="mb-7 flex items-baseline gap-4 border-b border-hairline pb-3.5"
                >
                    <span className="font-mono text-xs tracking-[0.18em] text-accent">
                        {num}
                    </span>
                    <h2 className="text-[28px] font-semibold tracking-[-0.02em]">
                        {title}
                    </h2>
                    <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                        {sub}
                    </span>
                </Reveal>
                <Reveal delay={80}>{children}</Reveal>
            </div>
        </section>
    )
}
