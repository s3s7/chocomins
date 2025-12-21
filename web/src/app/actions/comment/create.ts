'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { commentSchema, CommentInput } from '@/schemas/comment'
import { ActionResult, ErrorCodes } from '@/types'
import { createCommentInDB } from '@/services/create-comment'

export async function createComment(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {

  // ユーザー認証チェック
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  // フォームデータの取得とバリデーション
  const input: CommentInput = {
    content: formData.get('content')?.toString() ?? '',
    reviewId: formData.get('reviewId')?.toString() ?? '',
  }

  const parsed = commentSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  // コメントの作成
  try {
    await createCommentInDB({ ...parsed.data, userId: session.user.id })

    revalidatePath(`/reviews/${parsed.data.reviewId}`)
    return { isSuccess: true }
  } catch (err) {
    console.error('createComment error:', err)
    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
