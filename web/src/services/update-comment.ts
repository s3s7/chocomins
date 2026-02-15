import { prisma } from '@/lib/prisma'
import { ErrorCodes } from '@/types'

type UpdateCommentInput = {
  commentId: string
  userId: string
  content: string
}

export async function updateCommentInDB({
  commentId,
  userId,
  content,
}: UpdateCommentInput) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment) {
    console.error(`Comment not found: commentId=${commentId}`)
    throw new Error(ErrorCodes.NOT_FOUND)
  }

  if (comment.userId !== userId) {
    console.error(
      `Unauthorized comment update: commentId=${commentId}, userId=${userId}`,
    )
    throw new Error(ErrorCodes.FORBIDDEN)
  }

  return await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  })
}
