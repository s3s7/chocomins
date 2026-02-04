import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type UpdateChocolateInput = {
  chocolateId: string
  description: string
  cacaoPercent?: number
  name: string
  hasMint: boolean
  status?: number
  brandId: string
  price?: number
  categoryId?: string | null
  userId: string
  userRole: Role
}

export async function updateChocolateInDB({
  chocolateId,
  name,
  description,
  cacaoPercent,
  hasMint,
  status,
  brandId,
  price,
  categoryId,
  userId,
  userRole,
}: UpdateChocolateInput) {
  const chocolate = await prisma.chocolate.findUnique({
    where: { id: chocolateId },
  })

  // 投稿の存在チェック
  if (!chocolate) {
    console.error(
      `Chocolate not found: chocolateId=${chocolateId} brandId=${brandId} `,
    )
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  const isOwner = chocolate.userId === userId
  const isAdmin = userRole === Role.ADMIN
  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized update attempt: chocolateId=${chocolateId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  // 投稿の更新
  return await prisma.chocolate.update({
    where: { id: chocolateId },
    data: {
      name,
      description,
      cacaoPercent,
      hasMint,
      status: status ?? undefined,
      price: price ?? null,
      brandId,
      categoryId: categoryId ?? null,
    },
  })
}
