import { z } from 'zod'

export const reviewSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, '本文は必須です'),
  mintiness: z.coerce.number().min(0, 'ミント感は0以上である必要があります'),
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
