import { prisma } from '@/lib/prisma'

export async function getReviewById(reviewId: string) {
  return await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
      chocolate: {
        select: { name: true },
      },
    },
  })
}
