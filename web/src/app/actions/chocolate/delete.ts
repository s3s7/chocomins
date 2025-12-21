'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { deleteChocolateFromDB } from '@/services/delete-chocolate'
import { ActionResult, ErrorCodes } from '@/types'
import {
  DeleteChocolateInput,
  deleteChocolateSchema,
} from '@/schemas/chocolate'

export async function deleteChocolate(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }
  const input: DeleteChocolateInput = {
    chocolateId: formData.get('chocolateId')?.toString() ?? '',
  }

  const parsed = deleteChocolateSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await deleteChocolateFromDB({
      ...parsed.data,
    })

    revalidatePath('/chocolates')
    return { isSuccess: true }
  } catch (err) {
    console.error('deleteChocolate error:', err)

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
