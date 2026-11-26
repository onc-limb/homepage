import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

import { SkillDetail, skillDetailMetadata } from "@/components/skills"
import { findGroup } from "@/lib/building/floors"
import { getSkills } from "@/lib/skills"
import { listSkillsOnFloor, resolveSkillPage } from "@/lib/skills-meta"

const group = findGroup("skills")

type Props = { params: Promise<{ name: string }> }

export function generateStaticParams() {
    return listSkillsOnFloor(getSkills(), group.floor).map((skill) => ({ name: skill.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { name } = await params
    const resolved = resolveSkillPage(getSkills(), group, name)
    return resolved.kind === "found" ? skillDetailMetadata(resolved.skill) : {}
}

export default async function Page({ params }: Props) {
    const { name } = await params
    const resolved = resolveSkillPage(getSkills(), group, name)
    if (resolved.kind === "missing") notFound()
    if (resolved.kind === "moved") permanentRedirect(resolved.href)
    return <SkillDetail group={group} skill={resolved.skill} prev={resolved.prev} next={resolved.next} />
}
