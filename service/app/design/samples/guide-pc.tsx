import {
    GuidePc,
    type GuidePaper,
    type GuideRooms,
    type GuideSearch,
} from "@/components/ds/GuidePc"
import { findFloor, findGroup, toVirtualPath } from "@/lib/building/floors"

import type { DesignSample } from "./types"

const firstFloor = findFloor("1f")
const profile = findGroup("profile")
const portfolios = findGroup("portfolios")

const PAPERS: readonly GuidePaper[] = [
    { title: "自己紹介", line: "経歴の要約と主な関心" },
    { title: "関心", line: "いま関心のある技術" },
    { title: "資格", line: "保有する資格の一覧" },
    { title: "活動", line: "参加しているコミュニティ" },
    { title: "読書", line: "最近読んだ本" },
    { title: "目標", line: "今年の目標" },
    { title: "趣味", line: "休日の過ごし方" },
]

const ROOMS: GuideRooms = {
    scope: "floor",
    items: firstFloor.groups.flatMap((group) =>
        group.roomName ? [{ id: group.slug, name: group.roomName }] : []
    ),
}

const SEARCHES: readonly GuideSearch[] = [
    {
        label: "プロフィールを読む",
        command: profile.command,
        summary: "1 件見つかりました。",
        paths: [toVirtualPath(profile.url)],
    },
    {
        label: "作ったものを並べる",
        command: portfolios.command,
        summary: "1 件見つかりました。",
        paths: [toVirtualPath(portfolios.url)],
    },
]

export const guidePcSample: DesignSample = {
    id: "guide-pc",
    title: "GuidePc",
    Sample: () => (
        <GuidePc
            text={`ここは ${firstFloor.label}「${firstFloor.name}」です。部屋の一覧から移れます。探しものがあれば、下のボタンでお調べします。`}
            papers={PAPERS}
            destinations={[{ label: firstFloor.label, href: firstFloor.url }]}
            rooms={ROOMS}
            searches={SEARCHES}
            activeSearch={SEARCHES[1].command}
        />
    ),
}
