import { Brand, Category, Chocolate, Comment, Review, User, Place } from '@prisma/client'

export type ReviewWithUser = Review & {
  user: Pick<User, 'name'> | null
  chocolate: Pick<Chocolate, 'name'> & {
    brand?: Pick<Brand, 'name'> | null
    category?: Pick<Category, 'name'> | null
  }
  place: 
    | (Pick<Place, 'lat' | 'lng'> & {
        lat: number | null
        lng: number | null
      })
    | null
}

export type ActionResult =
  | { isSuccess: false; errorCode: ErrorCode }
  | { isSuccess: true }

// 並び替え可能なフィールド
export type SortField = 'name' | 'createdAt'

// 昇順 or 降順
export type SortOrder = 'asc' | 'desc'

// "name-asc" | "createdAt-desc" などの文字列リテラル型を自動生成
export type SortValue = `${SortField}-${SortOrder}`

export const ErrorCodes = {
  USER_EXISTS: 'USER_EXISTS',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
} as const

export type ErrorCode = keyof typeof ErrorCodes
export type CommentWithUser = Comment & {
  user: User
}
