'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { BrandInput, brandSchema } from '@/schemas/brand'
import { ActionResult, ErrorCodes } from '@/types'
import { createBrandInDB } from '../../../services/create-brand'

export async function createBrand(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // 認証情報を取得
  const session = await auth()

  // ユーザーがログインしていない場合
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const rawCountry = formData.get('country')
  const imagePathRaw = formData.get('imagePath')
  const imagePath =
    typeof imagePathRaw === 'string' && imagePathRaw.trim().length > 0
      ? imagePathRaw.trim()
      : undefined

  if (imagePath && !imagePath.startsWith(`brands/${session.user.id}/`)) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  // フォームデータから投稿情報を取得
  const input: BrandInput = {
    name: formData.get('name')?.toString() ?? '',
    country: rawCountry ? rawCountry.toString() : undefined,
    imagePath,
  }

  // バリデーションチェック
  const parsed = brandSchema.safeParse(input)
  if (!parsed.success) {
    // 入力が不正な場合
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    // データベースに保存
    await createBrandInDB({
      ...parsed.data,
      userId: session.user.id,
    })

    // 一覧ページなどを再検証
    revalidatePath('/brands')

    // 成功時
    return { isSuccess: true }
  } catch (err) {
    console.error('error:', err)

    if (err instanceof Error) {
      switch (err.message) {
        case ErrorCodes.BRAND_EXISTS:
          return { isSuccess: false, errorCode: ErrorCodes.BRAND_EXISTS }
        default:
          break
      }
    }

    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
