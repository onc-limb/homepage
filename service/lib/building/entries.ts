// 建物の中身（「紙」）の一覧を作るモジュール。サーバー側専用。
// getSkills / getProfile / getProjects が md を読み込むため、Client Component から import しない。
// クライアントで使う定数と変換は lib/building/floors.ts にある。

import { SOCIAL_LINKS } from "../constants"
import { getParsedProfile, getProfile, listHistories, toSerialNumber, type CareerItem } from "../profile"
import { getProjects } from "../portfolio"
import { getSkills, levelLabels, type SkillLevel } from "../skills"
import { hasSkillDetail, skillGroup, skillHref, skillVirtualPath, sortSkillsByLevel } from "../skills-meta"
import { findFloor, findGroup, toVirtualPath, type FloorId, type GroupSlug } from "./floors"

export interface Entry {
    path: string // 仮想パス（~/2f/skills/language/typescript.md）
    floor: FloorId
    group: GroupSlug | null // 屋上の紙は分類を持たない
    room: string | null // スキルは分野、ほかは分類の slug。屋上の紙は部屋を持たない
    title: string
    excerpt: string
    href: string // 最終の URL（移行中の FLOORS の href は使わない）
    tags: string[]
    date?: string
    level?: SkillLevel
}

const groupDir = (slug: GroupSlug): string => toVirtualPath(findGroup(slug).url)

// 題名から仮想パスの名前を作る。"/" と空白だけを "-" に置き換える
const toFileName = (title: string): string => title.replace(/[/\s]/g, "-")

const toNumbered = (serial: string, title: string): string =>
    `${serial}-${toFileName(title)}.md`

export async function getEntries(): Promise<Entry[]> {
    const [profile, parsed] = await Promise.all([getProfile(), getParsedProfile()])
    return [
        ...skillEntries(),
        ...historyEntries(parsed.career),
        ...profileEntries(profile.data.title, parsed.interests, parsed.certs),
        ...portfolioEntries(),
        ...rooftopEntries(),
    ]
}

// 経験の深い順（分野の部屋の説明「経験の深い順に置いてあります」）。並びの決まりは sortSkillsByLevel が持つ
function skillEntries(): Entry[] {
    return sortSkillsByLevel(getSkills()).map((skill) => {
        const group = skillGroup(skill)
        return {
            path: skillVirtualPath(skill),
            floor: group.floor,
            group: group.slug,
            room: skill.category,
            title: skill.name,
            excerpt: `level ${skill.level}（${levelLabels[skill.level].label}）`,
            // 本文が空のスキルは詳細ページを持たないので、一覧へ行かせる
            href: hasSkillDetail(skill) ? skillHref(skill) : group.url,
            tags: [skill.category],
            level: skill.level,
        }
    })
}

// 経歴の並びと番号付けは listHistories が持つ（古い順・2 桁）
function historyEntries(career: CareerItem[]): Entry[] {
    return listHistories(career).map((history) => ({
        path: `${groupDir("histories")}/${toNumbered(history.number, history.role)}`,
        floor: findGroup("histories").floor,
        group: "histories",
        room: "histories",
        title: history.role,
        excerpt: history.bullets[0] ?? "",
        href: findGroup("histories").url,
        tags: [],
    }))
}

function profileEntries(
    jobTitle: string,
    interests: { title: string; description: string }[],
    certs: { title: string; year: string }[],
): Entry[] {
    const dir = groupDir("profile")
    const href = findGroup("profile").url
    const base = { floor: findGroup("profile").floor, group: "profile", room: "profile", href } as const
    return [
        { ...base, tags: [], path: `${dir}/README.md`, title: "自己紹介", excerpt: jobTitle },
        ...interests.map((item, index) => ({
            ...base,
            tags: [],
            path: `${dir}/interests/${toNumbered(toSerialNumber(index), item.title)}`,
            title: item.title,
            excerpt: item.description,
        })),
        ...certs.map((item, index) => ({
            ...base,
            tags: [],
            path: `${dir}/certs/${toNumbered(toSerialNumber(index), item.title)}`,
            title: item.title,
            excerpt: item.year,
        })),
    ]
}

function portfolioEntries(): Entry[] {
    return getProjects().map((project) => ({
        path: `${groupDir("portfolios")}/${project.id}.md`,
        floor: findGroup("portfolios").floor,
        group: "portfolios",
        room: "portfolios",
        title: project.title,
        excerpt: project.description,
        href: `${findGroup("portfolios").url}/${project.id}`,
        tags: project.technologies,
        date: project.updatedAt,
    }))
}

// 外部リンクの名前は、名前の最初の英単語を小文字にしたもの（"X (Twitter)" → x）
function rooftopEntries(): Entry[] {
    const rooftop = findFloor("rf")
    return SOCIAL_LINKS.map((link) => {
        const word = link.name.match(/[A-Za-z]+/)
        if (!word) throw new Error(`Cannot derive a file name from link name: ${link.name}`)
        return {
            path: `${toVirtualPath(rooftop.url)}/${word[0].toLowerCase()}.url`,
            floor: rooftop.id,
            group: null,
            room: null,
            title: link.name,
            excerpt: link.username,
            href: link.url,
            tags: [],
        }
    })
}
