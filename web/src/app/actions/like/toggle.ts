'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult, ErrorCodes } from '@/types'

export async function toggleLike(reviewId: string): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user) {
    return { isSuccess: false, errorCode: ErrorCodes.UNAUTHORIZED }
  }

  const userId = session.user.id

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    })

    if (existing) {
      await prisma.like.delete({
        where: { userId_reviewId: { userId, reviewId } },
      })
    } else {
      await prisma.like.create({
        data: { userId, reviewId },
      })
    }

    revalidatePath(`/reviews/${reviewId}`)
    revalidatePath('/reviews')
    return { isSuccess: true }
  } catch (err) {
    console.error('toggleLike error:', err)
    return { isSuccess: false, errorCode: ErrorCodes.SERVER_ERROR }
  }
}
