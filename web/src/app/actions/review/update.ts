'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { EditReviewInput, editReviewSchema } from '@/schemas/review'
import { ActionResult, ErrorCodes } from '@/types'
import { updateReviewInDB } from '@/services/update-review'
import { upsertPlace } from '@/services/upsert-place'

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
    mintiness: Number(formData.get('mintiness') ?? 0),
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
  }

  const googlePlaceId = formData.get('googlePlaceId')?.toString()
  const placeName = formData.get('placeName')?.toString()
  const address = formData.get('address')?.toString()
  const lat = formData.get('lat')?.toString()
  const lng = formData.get('lng')?.toString()

  const parseCoordinate = (value?: string | null) => {
    if (typeof value !== 'string' || value.length === 0) return undefined
    const num = Number(value)
    return Number.isFinite(num) ? num : undefined
  }

  const latNumber = parseCoordinate(lat)
  const lngNumber = parseCoordinate(lng)

  const parsed = editReviewSchema.safeParse(input)

  if (!parsed.success)
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }

  try {
    let placeId: string | undefined
    if (googlePlaceId && placeName) {
      const place = await upsertPlace({
        googlePlaceId,
        name: placeName,
        address,
        lat: latNumber,
        lng: lngNumber,
      })
      placeId = place.id
    }

    await updateReviewInDB({
      reviewId: parsed.data.reviewId,
      title: parsed.data.title,
      content: parsed.data.content,
      mintiness: parsed.data.mintiness,
      chocolateId: parsed.data.chocolateId,
      userId: session.user.id,
      userRole: session.user.role,
      placeId,
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
