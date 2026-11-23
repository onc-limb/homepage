import { floorMetadata } from "@/components/building/FloorFrame"
import { FloorPage } from "@/components/building/FloorPage"

const id = "b1"

export const metadata = floorMetadata(id)

export default function B1Page() {
    return FloorPage({ id })
}
