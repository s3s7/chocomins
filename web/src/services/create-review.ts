import { prisma } from '@/lib/prisma'

type CreateReviewInput = {
  title: string
  content: string
  mintiness: number
  chocoRichness: number
  userId: string
  chocolateId: string
  placeId?: string
  imagePath?: string
}

export async function createReviewInDB(input: CreateReviewInput) {
  return await prisma.review.create({
    data: {
      title: input.title,
      content: input.content,
      mintiness: input.mintiness,
      chocoRichness: input.chocoRichness,
      userId: input.userId,
      chocolateId: input.chocolateId,
      placeId: input.placeId,
      imagePath: input.imagePath,
    },
  })
}
