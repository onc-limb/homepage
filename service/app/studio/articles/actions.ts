"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
// ASSUMPTION: 認証は next-auth v5 の `auth()` を @/lib/auth（相対で ../../../lib/auth）から取得する。
//             既存 /studio の認証境界に合わせ、サーバーアクションでも二重に保護する。
import { auth } from "../../../lib/auth"
// ASSUMPTION: DB へは直接触れず、articles-data-access (../../../lib/articles) の関数のみを利用する。
//             既存 books の data-access パターンに揃えた以下のシグネチャを想定する。
import {
    createArticle,
    deleteArticle,
    setArticleStatus,
    updateArticle,
} from "../../../lib/articles"

const STUDIO_ARTICLES_PATH = "/studio/articles"

const statusSchema = z.enum(["draft", "published"])

// 記事入力のバリデーション。slug は一意ルーティングキー（小文字英数字＋ハイフン）。
const articleInputSchema = z.object({
    title: z.string().trim().min(1, "タイトルを入力してください"),
    slug: z
        .string()
        .trim()
        .min(1, "slug を入力してください")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug は小文字英数字とハイフンで入力してください"),
    body: z.string().min(1, "本文を入力してください"),
    status: statusSchema.default("draft"),
    tagIds: z.array(z.number().int().positive()).default([]),
})

function parseArticleForm(formData: FormData) {
    const tagIds = formData
        .getAll("tagIds")
        .map((value) => Number(value))
        .filter((n) => Number.isInteger(n) && n > 0)

    return articleInputSchema.parse({
        title: formData.get("title") ?? "",
        slug: formData.get("slug") ?? "",
        body: formData.get("body") ?? "",
        status: (formData.get("status") as string) || "draft",
        tagIds,
    })
}

// 既存 /studio の認証境界に合わせ、未認証はトップへ退避する。
async function requireSession() {
    const session = await auth()
    if (!session) {
        redirect("/")
    }
}

export async function createArticleAction(formData: FormData) {
    await requireSession()
    const input = parseArticleForm(formData)
    await createArticle(input)
    revalidatePath(STUDIO_ARTICLES_PATH)
    redirect(STUDIO_ARTICLES_PATH)
}

export async function updateArticleAction(id: number, formData: FormData) {
    await requireSession()
    const input = parseArticleForm(formData)
    await updateArticle(id, input)
    revalidatePath(STUDIO_ARTICLES_PATH)
    revalidatePath(`${STUDIO_ARTICLES_PATH}/${id}/edit`)
    redirect(STUDIO_ARTICLES_PATH)
}

export async function toggleArticleStatusAction(
    id: number,
    currentStatus: "draft" | "published"
) {
    await requireSession()
    const next = currentStatus === "published" ? "draft" : "published"
    await setArticleStatus(id, next)
    revalidatePath(STUDIO_ARTICLES_PATH)
}

export async function deleteArticleAction(id: number) {
    await requireSession()
    await deleteArticle(id)
    revalidatePath(STUDIO_ARTICLES_PATH)
}
