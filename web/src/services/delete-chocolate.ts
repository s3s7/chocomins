import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type DeleteChocolateInput = {
  chocolateId: string
  userId: string
  userRole: string
}

export async function deleteChocolateFromDB({
  chocolateId,
  userId,
  userRole,
}: DeleteChocolateInput) {
  const chocolate = await prisma.chocolate.findUnique({
    where: { id: chocolateId },
  })

  if (!chocolate) {
    console.error(`Chocolate not found: chocolateId=${chocolateId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  const isOwner = chocolate.userId === userId
  const isAdmin = userRole === Role.ADMIN

  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized chocolate delete: chocolateId=${chocolateId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  return await prisma.chocolate.delete({ where: { id: chocolateId } })
}
