import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type DeleteCommentInput = {
  commentId: string
  userId: string
}

export async function deleteCommentFromDB({
  commentId,
  userId,
}: DeleteCommentInput) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment) {
    console.error(`Comment not found: commentId=${commentId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  if (comment.userId !== userId) {
    console.error(
      `Unauthorized comment delete: commentId=${commentId}, userId=${userId}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  await prisma.comment.delete({ where: { id: commentId } })
}
