import type { Metadata } from "next"

import { SkillDetailPage, skillDetailMetadata } from "@/components/skills"
import { findGroup } from "@/lib/building/floors"
import { getSkills } from "@/lib/skills"
import { listSkillsOnFloor } from "@/lib/skills-meta"

const group = findGroup("skills")

type Props = { params: Promise<{ name: string }> }

export function generateStaticParams() {
    return listSkillsOnFloor(getSkills(), group.floor).map((skill) => ({ name: skill.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { name } = await params
    return skillDetailMetadata(group, name)
}

export default async function Page({ params }: Props) {
    const { name } = await params
    return <SkillDetailPage group={group} name={name} />
}
