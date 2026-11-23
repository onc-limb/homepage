import { getEntries } from "@/lib/building/entries"
import { findFloor, type FloorId } from "@/lib/building/floors"
import { FloorFrame } from "./FloorFrame"

export async function FloorPage({ id }: { id: Exclude<FloorId, "rf"> }) {
    const floor = findFloor(id)
    const entries = await getEntries()
    const doors = floor.groups.map((group) => ({
        name: group.name,
        plate: group.note ?? `${entries.filter((entry) => entry.group === group.slug).length} 件`,
        href: group.href,
    }))

    return <FloorFrame floor={floor} doors={doors} />
}
