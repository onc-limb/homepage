import type { Metadata } from "next"

import { floorTitle } from "@/components/building/FloorFrame"
import { HashHeading } from "@/components/ds/HashHeading"
import { KeyValue } from "@/components/ds/KeyValue"
import { Page } from "@/components/ds/Page"
import { PagerDoors } from "@/components/ds/PagerDoors"
import { PROSE_BODY, PROSE_LIST } from "@/components/ds/prose-styles"
import { findFloor, type FloorGroup } from "@/lib/building/floors"
import { createPageMetadata } from "@/lib/seo"
import {
    SKILL_SECTION_TITLES,
    categoryLabels,
    levelLabels,
    skillHref,
    skillVirtualPath,
    type ListItem,
    type ListSection,
    type Skill,
} from "@/lib/skills-meta"
import { LevelGauge } from "./LevelGauge"

type SkillDetailProps = {
    group: FloorGroup
    skill: Skill
    prev?: Skill
    next?: Skill
}

/**
 * The detail page of a skill already resolved by the route (which owns the
 * 404 and the redirect to the right floor).
 */
export function SkillDetail({ group, skill, prev, next }: SkillDetailProps) {
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

/** Metadata of the detail page of a resolved skill. */
export function skillDetailMetadata(skill: Skill): Metadata {
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
