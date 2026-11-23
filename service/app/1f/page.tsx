import { floorMetadata } from "@/components/building/FloorFrame"
import { FloorPage } from "@/components/building/FloorPage"

const id = "1f"

export const metadata = floorMetadata(id)

export default function Floor1Page() {
    return FloorPage({ id })
}
