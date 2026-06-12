import { prisma } from '@/lib/prisma'

export async function getReviewById(reviewId: string, currentUserId?: string) {
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
      _count: {
        select: { likes: true },
      },
      ...(currentUserId
        ? { likes: { where: { userId: currentUserId }, select: { userId: true } } }
        : {}),
    },
  })

  if (!review) return null

  const { _count, likes, ...rest } = review as typeof review & {
    _count: { likes: number }
    likes?: { userId: string }[]
  }

  return {
    ...rest,
    likeCount: _count.likes,
    isLiked: currentUserId ? (likes ?? []).length > 0 : false,
    place: rest.place
      ? {
          ...rest.place,
          lat: rest.place.lat ?? null,
          lng: rest.place.lng ?? null,
          address: rest.place.address ?? null,
          name: rest.place.name ?? null,
        }
      : null,
  }
}
