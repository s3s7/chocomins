'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { updateProfileSchema, UpdateProfileInput } from '@/schemas/user'
import { ActionResult, ErrorCodes } from '@/types'
import { updateUserProfileInDB } from '@/services/update-user'

export async function updateProfile(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const input: UpdateProfileInput = {
    name: formData.get('name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
  }

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    await updateUserProfileInDB({
      userId: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
    })

    revalidatePath('/mypage')
    return { isSuccess: true }
  } catch (err) {
    console.error('updateProfile error:', err)

    if (err instanceof Error) {
      switch (err.message) {
        case ErrorCodes.USER_EXISTS:
          return { isSuccess: false, errorCode: ErrorCodes.USER_EXISTS }
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
