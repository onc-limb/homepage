import { getEntries } from "@/lib/building/entries"
import { findFloor, type FloorId } from "@/lib/building/floors"
import { groupLine } from "@/lib/building/guide"
import { FloorFrame } from "./FloorFrame"
import { FloorMapSection } from "./FloorMapSection"

export async function FloorPage({ id }: { id: Exclude<FloorId, "rf"> }) {
    const floor = findFloor(id)
    const entries = await getEntries()
    const doors = floor.groups.map((group) => ({
        name: group.name,
        plate: groupLine(group, entries.filter((entry) => entry.group === group.slug).length),
        href: group.href,
    }))

    return (
        <FloorFrame floor={floor} doors={doors}>
            <FloorMapSection floor={floor} entries={entries} />
        </FloorFrame>
    )
}
