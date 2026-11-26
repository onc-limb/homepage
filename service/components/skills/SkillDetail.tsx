import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"

import { floorTitle } from "@/components/building/FloorFrame"
import { HashHeading } from "@/components/ds/HashHeading"
import { KeyValue } from "@/components/ds/KeyValue"
import { Page } from "@/components/ds/Page"
import { PagerDoors } from "@/components/ds/PagerDoors"
import { PROSE_BODY, PROSE_LIST } from "@/components/ds/prose-styles"
import { findFloor, type FloorGroup } from "@/lib/building/floors"
import { createPageMetadata } from "@/lib/seo"
import { getSkills } from "@/lib/skills"
import {
    SKILL_SECTION_TITLES,
    categoryLabels,
    levelLabels,
    resolveSkillPage,
    skillHref,
    skillVirtualPath,
    type ListItem,
    type ListSection,
    type Skill,
} from "@/lib/skills-meta"
import { LevelGauge } from "./LevelGauge"

type SkillDetailPageProps = {
    group: FloorGroup
    name: string
}

/** The detail page of the skill whose md file name is `name`, on the floor group `group`. */
export function SkillDetailPage({ group, name }: SkillDetailPageProps) {
    const resolved = resolveSkillPage(getSkills(), group, name)
    if (resolved.kind === "missing") notFound()
    if (resolved.kind === "moved") permanentRedirect(resolved.href)
    const { skill, prev, next } = resolved
    return (
        <main className="flex-1">
            <Page title={skill.name} command={`cat ${skillVirtualPath(skill)}`}>
                <div className="flex flex-col gap-ds-5">
                    <KeyValue
                        items={[
                            { key: "分野", value: categoryLabels[skill.category] },
                            {
                                key: "レベル",
                                value: (
                                    <>
                                        <LevelGauge level={skill.level} /> {levelLabels[skill.level].label}
                                    </>
                                ),
                            },
                            { key: "置いてある階", value: floorTitle(findFloor(group.floor)) },
                        ]}
                    />
                    <SkillBody skill={skill} />
                    <PagerDoors
                        prev={prev && skillLink(prev)}
                        next={next && skillLink(next)}
                        category={group.name}
                        listHref={group.url}
                    />
                </div>
            </Page>
        </main>
    )
}

/** Metadata of the detail page. An unknown name gets none (the page itself is a 404). */
export function skillDetailMetadata(group: FloorGroup, name: string): Metadata {
    const resolved = resolveSkillPage(getSkills(), group, name)
    if (resolved.kind !== "found") return {}
    const { skill } = resolved
    return createPageMetadata({
        title: skill.name,
        description: `${skill.name}（${categoryLabels[skill.category]}・${levelLabels[skill.level].label}）の経験と知識。`,
        path: skillHref(skill),
    })
}

function skillLink(skill: Skill) {
    return { title: skill.name, href: skillHref(skill) }
}

function SkillBody({ skill }: { skill: Skill }) {
    return (
        <>
            <ListSectionView title={SKILL_SECTION_TITLES.experience} section={skill.experience} />
            <ListSectionView title={SKILL_SECTION_TITLES.knowledge} section={skill.knowledge} />
            <FlatSectionView title={SKILL_SECTION_TITLES.relatedTech} items={skill.relatedTech} />
            <FlatSectionView title={SKILL_SECTION_TITLES.relatedBooks} items={skill.relatedBooks} />
        </>
    )
}

function ListSectionView({ title, section }: { title: string; section: ListSection }) {
    if (section.items.length === 0 && section.subsections.length === 0) return null
    return (
        <section className={PROSE_BODY}>
            <HashHeading>{title}</HashHeading>
            <ItemList items={section.items} />
            {section.subsections.map((subsection) => (
                <div key={subsection.title} className="flex flex-col gap-ds-2">
                    <HashHeading level={3}>{subsection.title}</HashHeading>
                    <ItemList items={subsection.items} />
                </div>
            ))}
        </section>
    )
}

function FlatSectionView({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) return null
    return (
        <section className={PROSE_BODY}>
            <HashHeading>{title}</HashHeading>
            <ItemList items={items.map((text) => ({ text, children: [] }))} />
        </section>
    )
}

function ItemList({ items }: { items: ListItem[] }) {
    if (items.length === 0) return null
    return (
        <ul className={PROSE_LIST}>
            {items.map((item, index) => (
                <li key={index}>
                    {item.text}
                    <ItemList items={item.children} />
                </li>
            ))}
        </ul>
    )
}
