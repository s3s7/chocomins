import { prisma } from '@/lib/prisma'

export async function getBrands() {
  return await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })
}
