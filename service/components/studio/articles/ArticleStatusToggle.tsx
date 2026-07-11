import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ArticleStatus } from "./types"

// 公開/下書きの状態切り替えボタン。
// サーバーアクション (bind 済み) を form の action として受け取り、
// ネイティブ form 送信でトグルする（クライアント JS 不要のためサーバーコンポーネントで完結）。
export function ArticleStatusToggle({
    status,
    action,
}: {
    status: ArticleStatus
    action: () => Promise<void>
}) {
    const isPublished = status === "published"
    return (
        <form action={action}>
            <Button type="submit" variant="outline" size="sm">
                {isPublished ? (
                    <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        下書きに戻す
                    </>
                ) : (
                    <>
                        <Eye className="mr-1 h-4 w-4" />
                        公開する
                    </>
                )}
            </Button>
        </form>
    )
}
