"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ArticleFormValues, TagOption } from "./types"

type Props = {
    // 新規作成 / 更新のサーバーアクション。FormData を受け取る。
    // ASSUMPTION: 記事は API ルートではなくサーバーアクション経由で永続化する
    // （/api/articles は本タスクの書き込み境界外のため）。
    action: (formData: FormData) => void | Promise<void>
    availableTags: TagOption[]
    defaultValues?: ArticleFormValues
    submitLabel?: string
}

const emptyValues: ArticleFormValues = {
    title: "",
    slug: "",
    body: "",
    status: "draft",
    tagIds: [],
}

export function ArticleForm({
    action,
    availableTags,
    defaultValues = emptyValues,
    submitLabel = "保存する",
}: Props) {
    // 本文は Markdown 入力。プレビュー表示のため state で保持する。
    const [body, setBody] = useState(defaultValues.body)
    const [showPreview, setShowPreview] = useState(false)
    const selectedTagIds = new Set(defaultValues.tagIds)

    return (
        <form action={action} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={defaultValues.title}
                    placeholder="記事タイトル"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">slug</Label>
                <Input
                    id="slug"
                    name="slug"
                    required
                    defaultValue={defaultValues.slug}
                    placeholder="my-first-article"
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                />
                {/* slug は articles-schema で確定した一意ルーティングキー（/blog/[slug]）。 */}
                <p className="text-sm text-muted-foreground">
                    公開 URL に使われる一意なキー。小文字英数字とハイフンで入力してください。
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">状態</Label>
                <select
                    id="status"
                    name="status"
                    defaultValue={defaultValues.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                </select>
            </div>

            {availableTags.length > 0 && (
                <div className="space-y-2">
                    <Label>タグ</Label>
                    <div className="flex flex-wrap gap-3">
                        {availableTags.map((tag) => (
                            <label
                                key={tag.id}
                                className="flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm"
                            >
                                {/* ネイティブ checkbox で FormData に tagIds を複数入れる。 */}
                                <input
                                    type="checkbox"
                                    name="tagIds"
                                    value={tag.id}
                                    defaultChecked={selectedTagIds.has(tag.id)}
                                    className="h-4 w-4"
                                />
                                {tag.name}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="body">本文（Markdown）</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview((v) => !v)}
                    >
                        {showPreview ? "編集に戻る" : "プレビュー"}
                    </Button>
                </div>
                {showPreview ? (
                    <>
                        <div className="prose min-h-[16rem] max-w-none rounded-md border border-input p-4 dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {body || "_（本文がありません）_"}
                            </ReactMarkdown>
                        </div>
                        {/* プレビュー中は Textarea がアンマウントされ name="body" が DOM から消えるため、
                            hidden input で本文を保持し、プレビュー表示のまま送信しても FormData に含める。 */}
                        <input type="hidden" name="body" value={body} />
                    </>
                ) : (
                    <Textarea
                        id="body"
                        name="body"
                        required
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={16}
                        placeholder="# 見出し&#10;&#10;Markdown で本文を記述します。"
                    />
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit">{submitLabel}</Button>
            </div>
        </form>
    )
}
