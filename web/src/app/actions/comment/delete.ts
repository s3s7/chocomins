'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { deleteCommentSchema, DeleteCommentInput } from '@/schemas/comment'
import { ActionResult, ErrorCodes } from '@/types'
import { deleteCommentFromDB } from '@/services/delete-comment'

export async function deleteComment(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const input: DeleteCommentInput = {
    commentId: formData.get('commentId')?.toString() ?? '',
    reviewId: formData.get('reviewId')?.toString() ?? '',
  }

  const parsed = deleteCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await deleteCommentFromDB({
      commentId: parsed.data.commentId,
      userId: session.user.id,
    })

    revalidatePath(`/reviews/${parsed.data.reviewId}`)
    return { isSuccess: true }
  } catch (err) {
    console.error('deleteComment error:', err)

    if (err instanceof Error) {
      switch (err.message) {
        case ErrorCodes.NOT_FOUND:
          return { isSuccess: false, errorCode: ErrorCodes.NOT_FOUND }
        case ErrorCodes.FORBIDDEN:
          return { isSuccess: false, errorCode: ErrorCodes.FORBIDDEN }
        default:
          return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
      }
    }

    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
