import { DoorButton } from "@/components/ds/DoorButton"
import { Page } from "@/components/ds/Page"
import { findFloor, type Floor, type FloorId } from "@/lib/building/floors"
import { createPageMetadata, LODGE_NAME } from "@/lib/seo"

type FloorDoor = {
    name: string
    plate: string
    href: string
    caption?: string
}

export function floorTitle(floor: Floor): string {
    return `${floor.label} ${floor.name}`
}

export function floorMetadata(id: FloorId) {
    const floor = findFloor(id)
    const title = floorTitle(floor)
    return createPageMetadata({
        title,
        description: `${LODGE_NAME}の ${title}。`,
        path: floor.url,
    })
}

export function FloorFrame({ floor, doors }: { floor: Floor; doors: FloorDoor[] }) {
    return (
        <main className="flex-1">
            <Page title={floorTitle(floor)}>
                <div className="flex flex-wrap gap-x-ds-4 gap-y-ds-3">
                    {doors.map((door) => (
                        <DoorButton key={door.href} size="large" href={door.href} count={door.plate} caption={door.caption}>
                            {door.name}
                        </DoorButton>
                    ))}
                </div>
            </Page>
        </main>
    )
}
