import Link from "next/link"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default async function StudioPage() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(books)

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Studio</h1>
            <p className="mt-1 text-sm text-slate-500">コンテンツ管理</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/studio/books">
                    <Card className="transition-colors hover:border-turquoise-300 hover:bg-turquoise-50/30">
                        <CardHeader>
                            <BookOpen className="mb-2 h-8 w-8 text-turquoise-600" />
                            <CardTitle>Books</CardTitle>
                            <CardDescription>{count}冊</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
