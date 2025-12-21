import { prisma } from '@/lib/prisma'

type CreateBrandInput = {
  name: string
  country?: string | null
}

export async function createBrandInDB(input: CreateBrandInput) {
  return await prisma.brand.create({
    data: {
      name: input.name,
      country: input.country ?? null,
    },
  })
}
