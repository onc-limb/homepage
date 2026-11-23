import { FloorFrame, floorMetadata } from "@/components/building/FloorFrame"
import { findFloor } from "@/lib/building/floors"
import { SOCIAL_LINKS } from "@/lib/constants"

const floor = findFloor("rf")

export const metadata = floorMetadata(floor.id)

export default function RooftopPage() {
    const doors = SOCIAL_LINKS.map((link) => ({
        name: link.name,
        plate: link.note,
        href: link.url,
        caption: "外のサイトへ",
    }))

    return <FloorFrame floor={floor} doors={doors} />
}
