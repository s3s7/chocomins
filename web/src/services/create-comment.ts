import { prisma } from '@/lib/prisma'

type AddCommentInput = {
  reviewId: string
  userId: string
  content: string
}

export async function createCommentInDB(input: AddCommentInput) {
  return await prisma.comment.create({
    data: {
      reviewId: input.reviewId,
      userId: input.userId,
      content: input.content,
    },
    include: {
      user: true,
    },
  })
}
