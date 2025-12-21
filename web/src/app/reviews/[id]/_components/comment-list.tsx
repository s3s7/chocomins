import { CommentItem } from './comment-item'
import { getComments } from '@/services/get-comments'

export async function CommentList({ reviewId }: { reviewId: string }) {
  const comments = await getComments(reviewId)

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">コメント</h2>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
