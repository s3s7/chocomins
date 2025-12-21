import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type UpdateBrandInput = {
  brandId: string
  name: string
  country?: string | null
}

export async function updateBrandInDB({
  brandId,
  name,
  country,
}: UpdateBrandInput) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } })

  // レコードの存在チェック
  if (!brand) {
    console.error(`Brand not found: brandId=${brandId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  // 更新
  return await prisma.brand.update({
    where: { id: brandId },
    data: {
      name,
      country: country ?? null,
    },
  })
}
