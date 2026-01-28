import { prisma } from '@/lib/prisma'

export async function getChocolateById(chocolateId: string) {
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

  return chocolate
}
