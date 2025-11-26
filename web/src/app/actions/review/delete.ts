'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { deleteReviewFromDB } from '@/services/delete-review'
import { ActionResult, ErrorCodes } from '@/types'
import { DeleteReviewInput, deleteReviewSchema } from '@/schemas/review'

export async function deleteReview(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }
  const input: DeleteReviewInput = {
    reviewId: formData.get('reviewId')?.toString() ?? '',
  }

  const parsed = deleteReviewSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await deleteReviewFromDB({
      ...parsed.data,
      userId: session.user.id,
      userRole: session.user.role,
    })

    revalidatePath('/reviews')
    return { isSuccess: true }
  } catch (err) {
    console.error('deleteReview error:', err)

    if (err instanceof Error) {
      switch (err.message) {
        case ErrorCodes.NOT_FOUND:
          return { isSuccess: false, errorCode: ErrorCodes.NOT_FOUND }
        case ErrorCodes.UNAUTHORIZED:
          return { isSuccess: false, errorCode: ErrorCodes.FORBIDDEN }
        default:
          return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
      }
    }

    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
