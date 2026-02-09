'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ReviewInput, reviewSchema } from '@/schemas/review'
import { ActionResult, ErrorCodes } from '@/types'
import { createReviewInDB } from '@/services/create-review'
import { upsertPlace } from '@/services/upsert-place'

export async function createReview(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const imagePathRaw = formData.get('imagePath')
  const imagePath =
    typeof imagePathRaw === 'string' && imagePathRaw.trim().length > 0
      ? imagePathRaw.trim()
      : undefined

  // ★重要：他人のパスを勝手に紐付けられないようにする
  if (imagePath && !imagePath.startsWith(`reviews/${session.user.id}/`)) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  const input: ReviewInput = {
    title: formData.get('title')?.toString() ?? '',
    content: formData.get('content')?.toString() ?? '',
    mintiness: Number(formData.get('mintiness') ?? 0),
    chocoRichness: Number(formData.get('chocoRichness') ?? 0),
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
    imagePath,
  }

  const googlePlaceId = formData.get('googlePlaceId')?.toString()
  const placeName = formData.get('placeName')?.toString()
  const address = formData.get('address')?.toString()
  const lat = formData.get('lat') ? Number(formData.get('lat')) : undefined
  const lng = formData.get('lng') ? Number(formData.get('lng')) : undefined

  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    let placeId: string | undefined
    if (googlePlaceId && placeName) {
      const place = await upsertPlace({
        googlePlaceId,
        name: placeName,
        address,
        lat,
        lng,
      })
      placeId = place.id
    }

    await createReviewInDB({
      title: parsed.data.title,
      content: parsed.data.content,
      mintiness: parsed.data.mintiness,
      chocoRichness: parsed.data.chocoRichness,
      chocolateId: parsed.data.chocolateId,
      userId: session.user.id,
      placeId,
      imagePath: parsed.data.imagePath,
    })

    revalidatePath('/reviews')
    return { isSuccess: true }
  } catch (err) {
    console.error('error:', err)
    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
