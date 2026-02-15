'use client'

import { useState, useTransition } from 'react'
import { CommentWithUser } from '@/types'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { deleteComment } from '@/app/actions/comment/delete'
import { EditCommentModal } from './edit-comment-modal'

type CommentItemProps = {
  comment: CommentWithUser
  currentUserId: string
}

export function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const isOwner = currentUserId === comment.userId
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!isOwner) return
    const confirmed = window.confirm('このコメントを削除しますか？')
    if (!confirmed) return

    const formData = new FormData()
    formData.append('commentId', comment.id)
    formData.append('reviewId', comment.reviewId)

    startTransition(async () => {
      try {
        const result = await deleteComment(formData)
        if (result.isSuccess) {
          toast.success('コメントを削除しました')
        } else if (result.errorCode) {
          toast.error(getErrorMessage(result.errorCode))
        }
      } catch (error) {
        console.error(error)
        toast.error('削除に失敗しました')
      }
    })
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p>{comment.content}</p>
          <p className="text-sm text-gray-500">
            by {comment.user?.name ?? '匿名'} /{' '}
            <span suppressHydrationWarning>
              {new Date(comment.createdAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2 self-end sm:self-start">
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
            >
              編集
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full px-6 py-3 shadow-lg"
            >
              {isPending ? '削除中...' : '削除'}
            </Button>
          </div>
        )}
      </div>

      {isOwner && (
        <EditCommentModal
          comment={comment}
          open={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}
