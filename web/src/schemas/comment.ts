import { z } from 'zod'

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(100, 'コメントは100文字以内で入力してください'),
  reviewId: z.string().uuid('不正な投稿IDです'),
})

export type CommentInput = z.infer<typeof commentSchema>
