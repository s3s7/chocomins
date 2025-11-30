'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ReviewInput, reviewSchema } from '@/schemas/review'
import { ActionResult, ErrorCodes } from '@/types'
import { createReviewInDB } from '@/services/create-review'

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
    mintiness: formData.get('mintiness')?.toInt() ?? '',
  }

  // バリデーションチェック
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) {
    // 入力が不正な場合
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    // 投稿データをデータベースに保存
    await createReviewInDB({
      ...parsed.data,        // バリデーション済みの title と content
      userId: session.user.id // 認証済みユーザーの ID を追加
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
