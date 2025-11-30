'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { EditReviewInput, reviewSchema } from '@/schemas/review'
import { ActionResult, ErrorCodes } from '@/types'
import { updateReviewInDB } from '@/services/update-review'

export async function updateReview(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user)
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }

  const input: EditReviewInput = {
    reviewId: formData.get('reviewId')?.toString() ?? '',
    title: formData.get('title')?.toString() ?? '',
    content: formData.get('content')?.toString() ?? '',
  }

  const parsed = reviewSchema.safeParse({
    title: input.title,
    content: input.content,
  })

  if (!parsed.success)
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }

  try {
    await updateReviewInDB({
      reviewId: input.reviewId,
      title: parsed.data.title,
      content: parsed.data.content,
      userId: session.user.id,
      userRole: session.user.role,
    })

    revalidatePath('/reviews')
    return { isSuccess: true }
  } catch (err) {
    console.error(err)
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
