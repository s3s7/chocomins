import { prisma } from '@/lib/prisma'
import { ReviewWithUser } from '@/types'

export async function getReviews(currentUserId?: string): Promise<ReviewWithUser[]> {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
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

  return reviews.map(({ _count, likes, ...review }) => ({
    ...review,
    likeCount: _count.likes,
    isLiked: currentUserId ? (likes as { userId: string }[] | undefined ?? []).length > 0 : false,
  }))
}
