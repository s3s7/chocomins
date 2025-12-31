import { z } from 'zod'

export const chocolateSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  description: z.string().min(1, '説明は必須です'),
  cacaoPercent: z.coerce.number<number>().nonnegative().optional(),
  hasMint: z.boolean(),
  status: z.coerce.number<number>().optional(),
  price: z.coerce.number<number>().nonnegative().optional(),
  brandId: z.string().min(1, 'ブランドIDは必須です'),
  categoryId: z.string().min(1).optional(),
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
