import { prisma } from '@/lib/prisma'

export async function getReviewById(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
      chocolate: {
        select: { name: true },
      },
      place: {
        select: { lat: true, lng: true },
      },
    },
  })

  if (!review) return null

  return {
    ...review,
    place: review.place
      ? {
          ...review.place,
          lat: review.place.lat?.toNumber() ?? null,
          lng: review.place.lng?.toNumber() ?? null,
        }
      : null,
  }
}
