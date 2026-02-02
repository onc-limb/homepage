import { getBookTags } from "@/lib/books"
import { BookForm } from "../BookForm"

export default async function NewBookPage() {
    const tags = await getBookTags()

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">書籍を登録</h1>
            <p className="mt-1 text-sm text-slate-500">新しい書籍を登録します</p>
            <div className="mt-8 rounded-md border bg-white p-6">
                <BookForm availableTags={tags} />
            </div>
        </div>
    )
}
