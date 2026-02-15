'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { editCommentSchema, EditCommentInput } from '@/schemas/comment'
import { ActionResult, ErrorCodes } from '@/types'
import { updateCommentInDB } from '@/services/update-comment'

export async function updateComment(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const input: EditCommentInput = {
    commentId: formData.get('commentId')?.toString() ?? '',
    content: formData.get('content')?.toString() ?? '',
    reviewId: formData.get('reviewId')?.toString() ?? '',
  }

  const parsed = editCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await updateCommentInDB({
      commentId: parsed.data.commentId,
      content: parsed.data.content,
      userId: session.user.id,
    })

    revalidatePath(`/reviews/${parsed.data.reviewId}`)
    return { isSuccess: true }
  } catch (err) {
    console.error('updateComment error:', err)

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
