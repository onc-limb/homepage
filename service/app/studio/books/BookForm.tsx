"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { bookFormSchema, type BookFormValues } from "@/lib/validations/book"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { TagInput } from "./TagInput"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i)

interface BookFormProps {
    defaultValues?: BookFormValues
    bookId?: number
    availableTags: string[]
}

export function BookForm({ defaultValues, bookId, availableTags }: BookFormProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const isEdit = bookId !== undefined

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BookFormValues>({
        resolver: zodResolver(bookFormSchema),
        defaultValues: defaultValues ?? {
            title: "",
            author: "",
            publisher: "",
            publishedYear: CURRENT_YEAR,
            isbn: "",
            officialUrl: "",
            memo: "",
            isRead: false,
            tagNames: [],
        },
    })

    const tagNames = watch("tagNames")
    const isRead = watch("isRead")

    async function onSubmit(data: BookFormValues) {
        setSubmitting(true)
        try {
            const body = {
                ...data,
                publisher: data.publisher || undefined,
                publishedYear: data.publishedYear || undefined,
                isbn: data.isbn || undefined,
                officialUrl: data.officialUrl || undefined,
                memo: data.memo || undefined,
            }

            const url = isEdit ? `/api/books/${bookId}` : "/api/books"
            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                router.push("/studio/books")
                router.refresh()
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title">
                        タイトル <span className="text-red-500">*</span>
                    </Label>
                    <Input id="title" {...register("title")} />
                    {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="author">
                        著者 <span className="text-red-500">*</span>
                    </Label>
                    <Input id="author" {...register("author")} />
                    {errors.author && (
                        <p className="text-sm text-red-500">{errors.author.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="publisher">出版社</Label>
                    <Input id="publisher" {...register("publisher")} />
                </div>

                <div className="space-y-2">
                    <Label>出版年</Label>
                    <Select
                        value={String(watch("publishedYear") ?? "")}
                        onValueChange={(v) =>
                            setValue("publishedYear", v ? Number(v) : null)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.publishedYear && (
                        <p className="text-sm text-red-500">
                            {errors.publishedYear.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" {...register("isbn")} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="officialUrl">公式URL</Label>
                    <Input
                        id="officialUrl"
                        type="url"
                        placeholder="https://..."
                        {...register("officialUrl")}
                    />
                    {errors.officialUrl && (
                        <p className="text-sm text-red-500">
                            {errors.officialUrl.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="memo">メモ</Label>
                <Textarea id="memo" rows={4} {...register("memo")} />
            </div>

            <div className="space-y-2">
                <Label>タグ</Label>
                <TagInput
                    availableTags={availableTags}
                    selectedTags={tagNames}
                    onChange={(tags) => setValue("tagNames", tags)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="isRead"
                    checked={isRead}
                    onCheckedChange={(checked) =>
                        setValue("isRead", checked === true)
                    }
                />
                <Label htmlFor="isRead" className="cursor-pointer">
                    既読
                </Label>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                    {submitting
                        ? isEdit
                            ? "更新中…"
                            : "登録中…"
                        : isEdit
                          ? "更新"
                          : "登録"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/studio/books")}
                >
                    キャンセル
                </Button>
            </div>
        </form>
    )
}
