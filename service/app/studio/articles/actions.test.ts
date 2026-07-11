import { beforeEach, describe, expect, it, vi } from "vitest"

// data-access / 認証 / Next のキャッシュ・遷移をモックし、フローのみを検証する。
// import 指定子はテスト対象 actions.ts と同一の相対パスに揃える（エイリアス設定に依存しない）。
vi.mock("../../../lib/articles", () => ({
    createArticle: vi.fn(async () => ({ id: 1 })),
    updateArticle: vi.fn(async () => ({ id: 1 })),
    deleteArticle: vi.fn(async () => undefined),
    setArticleStatus: vi.fn(async () => ({ id: 1 })),
}))

vi.mock("../../../lib/auth", () => ({
    auth: vi.fn(async () => ({ user: { email: "editor@example.com" } })),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}))

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createArticle, setArticleStatus } from "../../../lib/articles"
import { createArticleAction, toggleArticleStatusAction } from "./actions"

beforeEach(() => {
    vi.clearAllMocks()
})

describe("createArticleAction（作成フロー）", () => {
    it("フォーム入力をパースして createArticle を呼び、一覧へ遷移する", async () => {
        const formData = new FormData()
        formData.set("title", "My Post")
        formData.set("slug", "my-post")
        formData.set("body", "# Hello")
        formData.set("status", "draft")
        formData.append("tagIds", "1")
        formData.append("tagIds", "2")

        await createArticleAction(formData)

        expect(createArticle).toHaveBeenCalledTimes(1)
        expect(createArticle).toHaveBeenCalledWith({
            title: "My Post",
            slug: "my-post",
            body: "# Hello",
            status: "draft",
            tagIds: [1, 2],
        })
        expect(revalidatePath).toHaveBeenCalledWith("/studio/articles")
        expect(redirect).toHaveBeenCalledWith("/studio/articles")
    })

    it("公開状態を指定して作成できる", async () => {
        const formData = new FormData()
        formData.set("title", "Published Post")
        formData.set("slug", "published-post")
        formData.set("body", "body")
        formData.set("status", "published")

        await createArticleAction(formData)

        expect(createArticle).toHaveBeenCalledWith({
            title: "Published Post",
            slug: "published-post",
            body: "body",
            status: "published",
            tagIds: [],
        })
    })

    it("不正な slug は弾く", async () => {
        const formData = new FormData()
        formData.set("title", "Bad slug")
        formData.set("slug", "Invalid Slug!!")
        formData.set("body", "body")
        formData.set("status", "draft")

        await expect(createArticleAction(formData)).rejects.toThrow()
        expect(createArticle).not.toHaveBeenCalled()
    })
})

describe("toggleArticleStatusAction（公開状態切り替えフロー）", () => {
    it("下書き → 公開 に切り替える", async () => {
        await toggleArticleStatusAction(5, "draft")

        expect(setArticleStatus).toHaveBeenCalledWith(5, "published")
        expect(revalidatePath).toHaveBeenCalledWith("/studio/articles")
    })

    it("公開 → 下書き に切り替える", async () => {
        await toggleArticleStatusAction(7, "published")

        expect(setArticleStatus).toHaveBeenCalledWith(7, "draft")
        expect(revalidatePath).toHaveBeenCalledWith("/studio/articles")
    })
})
