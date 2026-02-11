import { prisma } from '@/lib/prisma'

type CreateReviewInput = {
  chocolateName: string
  content: string
  mintiness: number
  chocoRichness: number
  userId: string
  chocolateId?: string | null
  brandId: string
  placeId?: string
  imagePath?: string
}

export async function createReviewInDB(input: CreateReviewInput) {
  return await prisma.review.create({
    data: {
      chocolateName: input.chocolateName,
      content: input.content,
      mintiness: input.mintiness,
      chocoRichness: input.chocoRichness,
      userId: input.userId,
      brandId: input.brandId,
      chocolateId: input.chocolateId ?? null,
      placeId: input.placeId,
      imagePath: input.imagePath,
    },
  })
}
