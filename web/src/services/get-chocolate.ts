import { prisma } from '@/lib/prisma'

export async function getChocolates() {
  const rows = await prisma.chocolate.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercent: true,
      hasMint: true,
      status: true,
      price: true,
      brandId: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  })

  return rows.map(({ brand, category, ...chocolate }) => ({
    ...chocolate,
    brandName: brand.name,
    categoryName: category?.name ?? null,
    cacaoPercent:
      chocolate.cacaoPercent == null ? null : Number(chocolate.cacaoPercent),
  }))
}
