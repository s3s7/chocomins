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
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const input: EditReviewInput = {
    reviewId: formData.get('reviewId')?.toString() ?? '',
    title: formData.get('title')?.toString() ?? '',
    content: formData.get('content')?.toString() ?? '',
    mintiness: Number(formData.get('mintiness') ?? 0),
    chocoRichness: Number(formData.get('chocoRichness') ?? 0),
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
  }

  // ★ 画像パス（任意）
  // - 送られてこない(null) => 変更しない (undefined)
  // - 空文字 '' => 削除扱い (null)
  // - 文字列 => その値に更新
  const imagePathRaw = formData.get('imagePath')
  const imagePath: string | null | undefined =
    imagePathRaw === null
      ? undefined
      : imagePathRaw.toString().length === 0
        ? null
        : imagePathRaw.toString()

  // Google Places 由来の拡張データ（任意）
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
      chocoRichness: parsed.data.chocoRichness,
      chocolateId: parsed.data.chocolateId,
      userId: session.user.id,
      userRole: session.user.role,
      placeId,
      imagePath,
    })

    // 一覧と詳細の両方を更新
    revalidatePath('/reviews')
    revalidatePath(`/reviews/${parsed.data.reviewId}`)

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
