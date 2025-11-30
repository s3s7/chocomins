import { ReviewWithUser } from '@/types'
import { ReviewItem } from './review-item'

type ReviewListProps = {
  reviews: ReviewWithUser[]
  currentUserId: string
  currentUserRole: string
}

export function ReviewList({ reviews ,currentUserId,
  currentUserRole,}: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-gray-500">投稿がまだありません。</p>
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
    </ul>
  )
}
