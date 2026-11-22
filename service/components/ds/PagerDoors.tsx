import { DoorButton } from "./DoorButton"

type PagerTarget = { title: string; href: string }

type PagerDoorsProps = {
    prev?: PagerTarget
    next?: PagerTarget
    /** Category name shown in the back-to-list door. */
    category: string
    listHref: string
}

export function PagerDoors({ prev, next, category, listHref }: PagerDoorsProps) {
    return (
        <nav aria-label="前後のページ" className="flex flex-col gap-ds-3 md:flex-row md:flex-wrap">
            {prev ? <DoorButton href={prev.href}>← 前: {prev.title}</DoorButton> : null}
            <DoorButton href={listHref}>{category}の一覧へ戻る</DoorButton>
            {next ? <DoorButton href={next.href}>次: {next.title} →</DoorButton> : null}
        </nav>
    )
}
