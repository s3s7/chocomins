import { Review, User } from '@prisma/client'

export type ReviewWithUser = Review & {
  user: Pick<User, 'name'> | null
}

export type ActionResult =
  | { isSuccess: false; errorCode: ErrorCode }
  | { isSuccess: true }

export const ErrorCodes = {
  USER_EXISTS: 'USER_EXISTS',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
} as const

export type ErrorCode = keyof typeof ErrorCodes
