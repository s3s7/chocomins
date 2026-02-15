import { z } from 'zod'

const contentSchema = z
  .string()
  .min(1, 'コメントを入力してください')
  .max(100, 'コメントは100文字以内で入力してください')

export const commentSchema = z.object({
  content: contentSchema,
  reviewId: z.string().uuid('不正な投稿IDです'),
})

export const editCommentSchema = commentSchema.extend({
  commentId: z.string().uuid('不正なコメントIDです'),
})

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid('不正なコメントIDです'),
  reviewId: z.string().uuid('不正な投稿IDです'),
})

export type CommentInput = z.infer<typeof commentSchema>
export type EditCommentInput = z.infer<typeof editCommentSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>
