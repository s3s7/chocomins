import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type UpdateReviewInput = {
  reviewId: string
  title: string
  content: string
  mintiness: number
  userId: string
  userRole: string
}

export async function updateReviewInDB({ reviewId, title, content, mintiness,userId, userRole }: UpdateReviewInput) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })

  // 投稿の存在チェック
  if (!review) {
    console.error(`Review not found: reviewId=${reviewId}, userId=${userId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  // 認可チェック
  const isOwner = review.userId === userId
  const isAdmin = userRole === Role.ADMIN
  if (!isOwner && !isAdmin) {
    console.error(
      `Unauthorized update attempt: reviewId=${reviewId}, userId=${userId}, role=${userRole}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  // 投稿の更新
  return await prisma.review.update({
    where: { id: reviewId },
    data: { title, content , mintiness},
  })
}
