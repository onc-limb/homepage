import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PortfolioDetail, portfolioDetailMetadata } from "@/components/portfolio"
import { findGroup } from "@/lib/building/floors"
import { getProjects, listProjects, resolveProjectPage } from "@/lib/portfolio"

const group = findGroup("portfolios")

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
    return listProjects(getProjects()).map((project) => ({ id: project.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const resolved = resolveProjectPage(getProjects(), id)
    return resolved.kind === "found" ? portfolioDetailMetadata(resolved.project) : {}
}

export default async function Page({ params }: Props) {
    const { id } = await params
    const resolved = resolveProjectPage(getProjects(), id)
    if (resolved.kind === "missing") notFound()
    return <PortfolioDetail group={group} project={resolved.project} prev={resolved.prev} next={resolved.next} />
}
