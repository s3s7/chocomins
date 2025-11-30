import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { ErrorCodes } from '@/types'

type DeleteReviewInput = {
  reviewId: string
  userId: string
  userRole: string
}

export async function deleteReviewFromDB({
  reviewId,
  userId,
  userRole,
}: DeleteReviewInput) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })

  if (!review) {
    console.error(`Review not found: reviewId=${reviewId}, userId=${userId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  const isOwner = review.userId === userId
  const isAdmin = userRole === Role.ADMIN

  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized update attempt: reviewId=${reviewId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  return await prisma.review.delete({ where: { id: reviewId } })
}
