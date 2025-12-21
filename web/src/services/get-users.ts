import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { SortField, SortOrder, SortValue } from '@/types'

export async function getUsers({
  keyword = '',
  page = 1,
  perPage = 10,
  sort = 'createdAt-desc',
}: {
  keyword?: string
  page?: number
  perPage?: number
  sort?: SortValue
} = {}) {
  // 検索条件
  const where: Prisma.UserWhereInput = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
        ],
      }
    : {}

  // ソート条件
  const [sortKey, sortOrder] = sort.split('-') as [SortField, SortOrder]
  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [sortKey]: sortOrder,
  }

  // ページネーション計算
  const skip = (page - 1) * perPage

  // データ取得
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  return { users, totalCount }
}
