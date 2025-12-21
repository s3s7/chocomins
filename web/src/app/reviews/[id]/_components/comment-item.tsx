'use client'
import { CommentWithUser } from '@/types'

export function CommentItem({ comment }: { comment: CommentWithUser }) {
  return (
    <div className="rounded-md border p-4">
      <p>{comment.content}</p>
      <p className="text-sm text-gray-500">
        by {comment.user?.name ?? '匿名'} /{' '}
        <span suppressHydrationWarning>
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </p>
    </div>
  )
}
