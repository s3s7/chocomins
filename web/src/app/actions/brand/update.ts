'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { EditBrandInput, brandSchema } from '@/schemas/brand'
import { ActionResult, ErrorCodes } from '@/types'
import { updateBrandInDB } from '../../../services/update-brand'

export async function updateBrand(
  _: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user)
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }

  const rawCountry = formData.get('country')?.toString()
  const imagePathRaw = formData.get('imagePath')
  const imagePath: string | null | undefined =
    imagePathRaw === null
      ? undefined
      : imagePathRaw.toString().length === 0
        ? null
        : imagePathRaw.toString()

  if (
    typeof imagePath === 'string' &&
    !imagePath.startsWith(`brands/${session.user.id}/`)
  ) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }
  const input: EditBrandInput = {
    brandId: formData.get('brandId')?.toString() ?? '',
    name: formData.get('name')?.toString() ?? '',
    country: rawCountry ? rawCountry : undefined,
  }

  const parsed = brandSchema.safeParse({
    name: input.name,
    country: input.country,
  })

  if (!parsed.success)
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }

  try {
    await updateBrandInDB({
      brandId: input.brandId,
      name: parsed.data.name,
      country: parsed.data.country,
      userId: session.user.id,
      userRole: session.user.role,
      imagePath,
    })

    revalidatePath('/brands')
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
