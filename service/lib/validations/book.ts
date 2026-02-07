import { z } from "zod"

export const bookFormSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
    author: z.string().min(1, "著者は必須です"),
    publisher: z.string().optional(),
    publishedYear: z
        .number()
        .int()
        .min(1900, "1900年以降を入力してください")
        .max(new Date().getFullYear(), "未来の年は入力できません")
        .optional()
        .nullable(),
    isbn: z.string().optional(),
    officialUrl: z
        .string()
        .url("有効なURLを入力してください")
        .optional()
        .or(z.literal("")),
    memo: z.string().optional(),
    isRead: z.boolean(),
    tagNames: z.array(z.string()),
})

export type BookFormValues = z.infer<typeof bookFormSchema>
