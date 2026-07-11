import { Badge } from "@/components/ui/badge"
import type { ArticleStatus } from "./types"

// 公開/下書き状態を表すバッジ。既存 UI の Badge を再利用する。
export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
    return status === "published" ? (
        <Badge>公開</Badge>
    ) : (
        <Badge variant="secondary">下書き</Badge>
    )
}
