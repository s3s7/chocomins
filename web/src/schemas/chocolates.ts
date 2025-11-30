import { z } from 'zod'

export const chocolateSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, '本文は必須です'),
})

export type ChocolateInput = z.infer<typeof chocolateSchema>

export const editChocolateSchema = chocolateSchema.extend({
  chocolateId: z.string().min(1, '投稿IDが必要です'),
})

export type EditChocolateInput = z.infer<typeof editChocolateSchema>

export const deleteChocolateSchema = z.object({
  chocolateId: z.string().min(1, '投稿IDは必須です'),
})

export type DeleteChocolateInput = z.infer<typeof deleteChocolateSchema>
