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
  // 認証情報を取得
  const session = await auth()

  // ユーザーがログインしていない場合
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  // フォームデータから投稿情報を取得
  const input: ReviewInput = {
    title: formData.get('title')?.toString() ?? '',
    content: formData.get('content')?.toString() ?? '',
    mintiness: Number(formData.get('mintiness') ?? 0),
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
  }

  // Google Places 由来の拡張データ（任意）
  const googlePlaceId = formData.get('googlePlaceId')?.toString()
  const placeName = formData.get('placeName')?.toString()
  const address = formData.get('address')?.toString()
  const lat = formData.get('lat') ? Number(formData.get('lat')) : undefined
  const lng = formData.get('lng') ? Number(formData.get('lng')) : undefined

  // バリデーションチェック
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) {
    // 入力が不正な場合
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    // 投稿データをデータベースに保存
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
      chocolateId: parsed.data.chocolateId,
      userId: session.user.id,
      placeId,
    })

    // 投稿一覧ページのキャッシュを再検証（最新の投稿を表示）
    revalidatePath('/reviews')

    // 成功時は isSuccess: true を返す
    return { isSuccess: true }
  } catch (err) {
    // サーバーエラーの場合
    console.error('error:', err)
    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
