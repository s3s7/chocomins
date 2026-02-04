import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type DeleteBrandInput = {
  brandId: string
  userId: string
  userRole: string
}

export async function deleteBrandFromDB({
  brandId,
  userId,
  userRole,
}: DeleteBrandInput) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } })

  if (!brand) {
    console.error(`Brand not found: brandId=${brandId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  const isOwner = brand.userId === userId
  const isAdmin = userRole === Role.ADMIN
  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized brand delete: brandId=${brandId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  return await prisma.brand.delete({ where: { id: brandId } })
}
