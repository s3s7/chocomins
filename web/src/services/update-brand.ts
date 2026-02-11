import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type UpdateBrandInput = {
  brandId: string
  name: string
  country?: string | null
  userId: string
  userRole: string
  imagePath?: string | null
}

export async function updateBrandInDB({
  brandId,
  name,
  country,
  userId,
  userRole,
  imagePath,
}: UpdateBrandInput) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } })

  // レコードの存在チェック
  if (!brand) {
    console.error(`Brand not found: brandId=${brandId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  const isOwner = brand.userId === userId
  const isAdmin = userRole === Role.ADMIN

  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized brand update: brandId=${brandId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  // 更新
  return await prisma.brand.update({
    where: { id: brandId },
    data: {
      name,
      country: country ?? null,
      ...(imagePath !== undefined ? { imagePath } : {}),
    },
  })
}
