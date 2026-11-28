import type { Metadata } from "next"

import { HashHeading } from "@/components/ds/HashHeading"
import { KeyValue } from "@/components/ds/KeyValue"
import { Page } from "@/components/ds/Page"
import { DETAIL_STACK } from "@/components/ds/page-styles"
import { PagerDoors } from "@/components/ds/PagerDoors"
import { Prose } from "@/components/ds/Prose"
import { PROSE_LIST } from "@/components/ds/prose-styles"
import { TextLink } from "@/components/ds/TextLink"
import { JsonLd } from "@/components/seo"
import { findGroup, type FloorGroup } from "@/lib/building/floors"
import { projectHref, projectVirtualPath, type Project, type ProjectLinks } from "@/lib/portfolio"
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_NAME } from "@/lib/seo"
import { ArchDiagram } from "./ArchDiagram"

// The architecture diagram is drawn for this project only.
const ARCH_DIAGRAM_PROJECT_ID = "portfolio-site"

const LINK_LABELS: Record<keyof ProjectLinks, string> = {
    github: "GitHub",
    demo: "デモ",
    article: "記事",
}

type PortfolioDetailProps = {
    group: FloorGroup
    project: Project
    prev?: Project
    next?: Project
}

/**
 * The detail page of a project already resolved by the route (which owns the
 * 404): the frontmatter as a KeyValue, the whole md body, the diagram and the
 * doors to the neighbours.
 */
export function PortfolioDetail({ group, project, prev, next }: PortfolioDetailProps) {
    return (
        <main className="flex-1">
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        name: project.title,
                        description: project.longDescription || project.description,
                        url: absoluteUrl(projectHref(project)),
                        creator: {
                            "@type": "Person",
                            name: SITE_NAME,
                            url: absoluteUrl(findGroup("profile").url),
                        },
                        keywords: project.technologies.join(", "),
                        inLanguage: "ja-JP",
                    },
                    breadcrumbJsonLd([
                        { name: "Home", path: "/" },
                        { name: group.name, path: group.url },
                        { name: project.title, path: projectHref(project) },
                    ]),
                ]}
            />
            <Page title={project.title} command={`cat ${projectVirtualPath(project)}`}>
                <div className={DETAIL_STACK}>
                    <div className="max-w-ds-measure">
                        <KeyValue items={keyValueItems(project)} />
                    </div>
                    <Prose markdown={project.body} />
                    {project.id === ARCH_DIAGRAM_PROJECT_ID ? (
                        <section className="flex flex-col gap-ds-3">
                            <HashHeading>インフラ構成図</HashHeading>
                            <ArchDiagram />
                        </section>
                    ) : null}
                    <PagerDoors
                        prev={prev && pagerTarget(prev)}
                        next={next && pagerTarget(next)}
                        category={group.name}
                        listHref={group.url}
                    />
                </div>
            </Page>
        </main>
    )
}

/** Metadata of the detail page of a resolved project. */
export function portfolioDetailMetadata(project: Project): Metadata {
    return createPageMetadata({
        title: project.title,
        description: project.description,
        path: projectHref(project),
    })
}

function pagerTarget(project: Project) {
    return { title: project.title, href: projectHref(project) }
}

function keyValueItems(project: Project) {
    const links = (Object.keys(LINK_LABELS) as Array<keyof ProjectLinks>).flatMap((name) => {
        const href = project.links?.[name]
        return href ? [{ name, href }] : []
    })
    return [
        { key: "期間", value: project.period },
        { key: "役割", value: project.role },
        { key: "技術", value: project.technologies.join(" · ") },
        {
            key: "ハイライト",
            value: (
                <ul className={PROSE_LIST}>
                    {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                    ))}
                </ul>
            ),
        },
        ...(links.length > 0
            ? [
                  {
                      key: "リンク",
                      value: (
                          <ul className={PROSE_LIST}>
                              {links.map(({ name, href }) => (
                                  <li key={name}>
                                      <TextLink href={href}>{LINK_LABELS[name]}</TextLink>
                                  </li>
                              ))}
                          </ul>
                      ),
                  },
              ]
            : []),
    ]
}
