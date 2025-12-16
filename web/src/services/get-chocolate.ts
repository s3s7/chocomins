import { prisma } from '@/lib/prisma'

export async function getChocolates() {
  return await prisma.chocolate.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
