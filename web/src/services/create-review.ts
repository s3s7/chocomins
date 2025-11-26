import { prisma } from '@/lib/prisma'

type CreateReviewInput = {
  title: string
  content: string
  mintiness: number
  userId: string
}

export async function createReviewInDB(input: CreateReviewInput) {
  return await prisma.review.create({
    data: {
      title: input.title,
      content: input.content,
      mintiness: input.mintiness,
      userId: input.userId,
    },
  })
}
