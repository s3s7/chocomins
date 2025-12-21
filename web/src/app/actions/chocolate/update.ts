'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { EditChocolateInput, chocolateSchema } from '@/schemas/chocolate'
import { ActionResult, ErrorCodes } from '@/types'
import { updateChocolateInDB } from '@/services/update-chocolate'

export async function updateChocolate(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user)
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }

  const rawCategoryId = formData.get('categoryId')
  const input: EditChocolateInput = {
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    cacaoPercent: Number(formData.get('cacaoPercent') ?? 0),
    status: Number(formData.get('status') ?? 0),
    price: Number(formData.get('price') ?? 0),

    // boolean に変換（チェックボックスの場合など）
    hasMint: formData.get('hasMint') === 'true', // or 'on' などフォームの値に合わせて
    brandId: formData.get('brandId')?.toString() ?? '',
    categoryId: rawCategoryId ? rawCategoryId.toString() : undefined,
  }

  const parsed = chocolateSchema.safeParse({
    name: input.name,
    description: input.description,
    cacaoPercent: input.cacaoPercent,
    status: input.status,
    price: input.price,
    hasMint: input.hasMint,
    brandId: input.brandId,
    categoryId: input.categoryId,
  })

  if (!parsed.success)
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }

  try {
    await updateChocolateInDB({
      chocolateId: input.chocolateId,
      name: parsed.data.name,
      description: parsed.data.description,
      cacaoPercent: parsed.data.cacaoPercent,
      status: parsed.data.status,
      price: parsed.data.price,
      hasMint: parsed.data.hasMint,
      brandId: parsed.data.brandId,
      categoryId: parsed.data.categoryId,
    })

    revalidatePath('/chocolates')
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
