import { prisma } from '@/lib/prisma'

type CreateChocolateInput = {
  name: string
  hasMint: boolean
  status: number
  brandId: string
}

export async function createChocolateInDB(input: CreateChocolateInput) {
  return await prisma.chocolate.create({
    data: {
      name: input.name,
      hasMint: input.hasMint,
      status: input.status,
      brandId: input.brandId,
    },
  })
}
