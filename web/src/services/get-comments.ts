import { prisma } from '@/lib/prisma'

export async function getComments(reviewId: string) {
  return await prisma.comment.findMany({
    where: { reviewId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}
