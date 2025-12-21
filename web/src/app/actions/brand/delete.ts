'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { deleteBrandFromDB } from '../../../services/delete-brand'
import { ActionResult, ErrorCodes } from '@/types'
import { DeleteBrandInput, deleteBrandSchema } from '@/schemas/brand'

export async function deleteBrand(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }
  const input: DeleteBrandInput = {
    brandId: formData.get('brandId')?.toString() ?? '',
  }

  const parsed = deleteBrandSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await deleteBrandFromDB({
      ...parsed.data,
    })

    revalidatePath('/brands')
    return { isSuccess: true }
  } catch (err) {
    console.error('deleteBrand error:', err)

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
