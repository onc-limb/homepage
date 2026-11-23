import { floorMetadata } from "@/components/building/FloorFrame"
import { FloorPage } from "@/components/building/FloorPage"

const id = "3f"

export const metadata = floorMetadata(id)

export default function Floor3Page() {
    return FloorPage({ id })
}
