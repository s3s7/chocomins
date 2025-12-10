'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ChocolateInput, chocolateSchema } from '@/schemas/chocolate'
import { ActionResult, ErrorCodes } from '@/types'
import { createChocolateInDB } from '@/services/create-chocolate'

export async function createChocolate(
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
  const input: ChocolateInput = {
    name: formData.get('name')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    cacaoPercent: Number(formData.get('cacaoPercent') ?? 0),
  status: Number(formData.get('status') ?? 0),
  price: Number(formData.get('price') ?? 0),

  // boolean に変換（チェックボックスの場合など）
  hasMint: formData.get('hasMint') === 'true', // or 'on' などフォームの値に合わせて
    brandId: formData.get('brandId')?.toString() ?? '',
    categoryId: formData.get('categoryId')?.toString() ?? '',
  }

  // バリデーションチェック
  const parsed = chocolateSchema.safeParse(input)
  if (!parsed.success) {
    // 入力が不正な場合
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    // 投稿データをデータベースに保存
    await createChocolateInDB({
      ...parsed.data,        // バリデーション済みの title と content
   
    })

    // 投稿一覧ページのキャッシュを再検証（最新の投稿を表示）
    revalidatePath('/chocolates')

    // 成功時は isSuccess: true を返す
    return { isSuccess: true }
  } catch (err) {
    // サーバーエラーの場合
    console.error('error:', err)
    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
