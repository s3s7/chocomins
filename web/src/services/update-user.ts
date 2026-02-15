import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type UpdateUserInput = {
  userId: string
  name: string
  email: string
}

export async function updateUserProfileInDB({
  userId,
  name,
  email,
}: UpdateUserInput) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error(ErrorCodes.USER_EXISTS)
      }
    }
    throw error
  }
}
