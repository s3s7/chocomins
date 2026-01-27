import { prisma } from '@/lib/prisma'
import { ChocolateDetail } from '@/types'

export async function getChocolateById(
  chocolateId: string,
): Promise<ChocolateDetail | null> {
  const chocolate = await prisma.chocolate.findUnique({
    where: { id: chocolateId },
    include: {
      brand: {
        select: { name: true },
      },
      category: {
        select: { name: true },
      },
    },
  })

  if (!chocolate) return null

  return {
    ...chocolate,
    cacaoPercent:
      chocolate.cacaoPercent == null
        ? null
        : Number(chocolate.cacaoPercent),
  }
}
