import { prisma } from '@/lib/prisma'

export async function getReviews() {
  return await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
  })
}
