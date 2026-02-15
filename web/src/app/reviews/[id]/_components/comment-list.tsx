import { CommentItem } from './comment-item'
import { getComments } from '@/services/get-comments'
import { cn } from '@/lib/utils'

type CommentListProps = {
  reviewId: string
  className?: string
  showHeading?: boolean
  currentUserId?: string
}

export async function CommentList({
  reviewId,
  className,
  showHeading = true,
  currentUserId = '',
}: CommentListProps) {
  const comments = await getComments(reviewId)

  return (
    <div className={cn('mt-6 space-y-4', className)}>
      {showHeading && <h2 className="text-lg font-semibold">コメント</h2>}
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
