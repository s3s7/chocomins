import { z } from 'zod'

export const reviewSchema = z.object({
  chocolateName: z
    .string()
    .min(1, 'チョコレート名は必須です')
    .max(30, 'チョコレート名は30文字以内で入力してください'),
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
  brandId: z.string().min(1, 'メーカー・店舗の選択は必須です'),
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
