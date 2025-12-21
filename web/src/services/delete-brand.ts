import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type DeleteBrandInput = {
  brandId: string
}

export async function deleteBrandFromDB({ brandId }: DeleteBrandInput) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } })

  if (!brand) {
    console.error(`Brand not found: brandId=${brandId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  return await prisma.brand.delete({ where: { id: brandId } })
}
