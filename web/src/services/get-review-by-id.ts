import { prisma } from '@/lib/prisma'

export async function getReviewById(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
      chocolate: {
        select: {
          name: true,
          brand: {
            select: { name: true },
          },
          category: {
            select: { name: true },
          },
        },
      },
      brand: {
        select: { name: true },
      },
      place: {
        select: { lat: true, lng: true, address: true, name: true },
      },
    },
  })

  if (!review) return null

  return {
    ...review,
    place: review.place
      ? {
          ...review.place,
          lat: review.place.lat ?? null,
          lng: review.place.lng ?? null,
          address: review.place.address ?? null,
          name: review.place.name ?? null,
        }
      : null,
  }
}
