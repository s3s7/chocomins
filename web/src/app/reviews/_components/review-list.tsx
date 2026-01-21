import { ReviewWithUser } from '@/types'

import { ReviewCard } from './review-card'

type ReviewListProps = {
  reviews: ReviewWithUser[]
  currentUserId: string
  currentUserRole: string
}

export function ReviewList({
  reviews,
  currentUserId,
  currentUserRole,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-gray-500">投稿がまだありません。</p>
  }

  return (
    <ul className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
    </ul>
  )
}
