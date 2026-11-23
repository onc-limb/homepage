import { floorMetadata } from "@/components/building/FloorFrame"
import { FloorPage } from "@/components/building/FloorPage"

const id = "2f"

export const metadata = floorMetadata(id)

export default function Floor2Page() {
    return FloorPage({ id })
}
