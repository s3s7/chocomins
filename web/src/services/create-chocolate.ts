import { prisma } from '@/lib/prisma'

type CreateChocolateInput = {
  name: string
  description: string
  cacaoPercent?: number
  hasMint: boolean
  status?: number
  price?: number
  brandId: string
  categoryId?: string | null
}

export async function createChocolateInDB(input: CreateChocolateInput) {
  return await prisma.chocolate.create({
    data: {
      name: input.name,
      description: input.description,
      cacaoPercent: input.cacaoPercent ?? null,
      hasMint: input.hasMint,
      status: input.status ?? undefined,
      price: input.price ?? null,
      brandId: input.brandId,
      categoryId: input.categoryId ?? null, // optional
    },
  })
}
