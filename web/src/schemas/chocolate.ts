import { z } from 'zod'

export const chocolateSchema = z.object({
  name: z.string().min(1, '商品名は必須です').max(50, '商品名は50文字以内で入力してください'),
  description: z.string().min(1, '説明は必須です').max(200, '説明は200文字以内で入力してください'),
  cacaoPercent: z.coerce.number<number>().max(100.00, 'カカオ含有率は100%以内で入力してください').nonnegative().optional(),
  hasMint: z.boolean(),
  status: z.coerce.number<number>().optional(),
  price: z.coerce.number<number>().max(999999, '価格は999,999以内で入力してください').nonnegative().optional(),
  brandId: z.string().min(1, 'メーカー・店舗IDは必須です'),
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
