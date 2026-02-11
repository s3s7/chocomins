import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'
import { Role } from '@prisma/client'

type UpdateReviewInput = {
  reviewId: string
  chocolateName: string
  content: string
  mintiness: number
  chocoRichness: number
  chocolateId?: string | null
  brandId: string
  userId: string
  userRole: string
  placeId?: string | null

  // ★追加：undefined = 変更なし / null = 削除 / string = 更新
  imagePath?: string | null
}

export async function updateReviewInDB({
  reviewId,
  chocolateName,
  content,
  mintiness,
  chocoRichness,
  chocolateId,
  brandId,
  userId,
  userRole,
  placeId,
  imagePath,
}: UpdateReviewInput) {
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
    data: {
      chocolateName,
      content,
      mintiness,
      chocoRichness,
      ...(chocolateId !== undefined ? { chocolateId } : {}),
      brandId,
      ...(placeId !== undefined ? { placeId: placeId ?? null } : {}),
      // ★imagePath が渡されたときだけ更新する
      ...(imagePath !== undefined ? { imagePath } : {}),
    },
  })
}
