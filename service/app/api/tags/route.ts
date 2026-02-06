import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { tags } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
    const allTags = await db.select().from(tags).orderBy(tags.name)
    return Response.json(allTags)
}

export async function POST(request: NextRequest) {
    const session = await auth()
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body as { name: string }

    if (!name || !name.trim()) {
        return Response.json({ error: "Tag name is required" }, { status: 400 })
    }

    const [newTag] = await db
        .insert(tags)
        .values({ name: name.trim() })
        .onConflictDoNothing()
        .returning()

    if (!newTag) {
        const [existing] = await db
            .select()
            .from(tags)
            .where(eq(tags.name, name.trim()))
            .limit(1)
        return Response.json(existing)
    }

    return Response.json(newTag, { status: 201 })
}
