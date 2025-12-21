import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type DeleteChocolateInput = {
  chocolateId: string
}

export async function deleteChocolateFromDB({
  chocolateId,
}: DeleteChocolateInput) {
  const chocolate = await prisma.chocolate.findUnique({
    where: { id: chocolateId },
  })

  if (!chocolate) {
    console.error(`Chocolate not found: chocolateId=${chocolateId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  return await prisma.chocolate.delete({ where: { id: chocolateId } })
}
