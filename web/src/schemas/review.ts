import { z } from 'zod'

export const reviewSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(30, 'タイトルは30文字以内で入力してください'),
  content: z
    .string()
    .min(1, '本文は必須です')
    .max(1000, '本文は1000文字以内で入力してください'),
  mintiness: z.coerce
    .number<number>()
    .min(0, 'ミント感は0以上である必要があります'),
  chocoRichness: z.coerce
    .number<number>()
    .min(0, 'チョコ感は0以上である必要があります')
    .max(5, 'チョコ感は5以下である必要があります'),
  chocolateId: z.string().min(1).optional(),
  address: z.string().optional(),
  imagePath: z.string().optional(),
})

export type ReviewInput = z.infer<typeof reviewSchema>

export const editReviewSchema = reviewSchema.extend({
  reviewId: z.string().min(1, '投稿IDが必要です'),
})

export type EditReviewInput = z.infer<typeof editReviewSchema>

export const deleteReviewSchema = z.object({
  reviewId: z.string().min(1, '投稿IDは必須です'),
})

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>
