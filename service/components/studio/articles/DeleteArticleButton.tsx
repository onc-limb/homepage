"use client"

import { Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

// 記事削除ボタン。削除は取り消せないため AlertDialog で確認を挟む。
// 確認後、bind 済みサーバーアクションを form 送信で呼び出す。
// ASSUMPTION: 削除確認 UI は既存 /studio の DeleteBookButton と同じ AlertDialog パターンに揃える。
export function DeleteArticleButton({
    title,
    action,
}: {
    title: string
    action: () => Promise<void>
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="削除">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        「{title}」を削除します。この操作は取り消せません。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <form action={action}>
                        <AlertDialogAction type="submit">削除する</AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
