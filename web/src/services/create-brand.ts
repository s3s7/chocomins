import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type CreateBrandInput = {
  name: string
  country?: string | null
  userId: string
  imagePath?: string
}

export async function createBrandInDB(input: CreateBrandInput) {
  const existing = await prisma.brand.findUnique({
    where: { name: input.name },
  })

  if (existing) {
    throw new Error(ErrorCodes.BRAND_EXISTS)
  }

  return await prisma.brand.create({
    data: {
      name: input.name,
      country: input.country ?? null,
      userId: input.userId,
      imagePath: input.imagePath,
    },
  })
}
