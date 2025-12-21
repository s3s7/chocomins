'use client'

import { ReviewWithUser } from '@/types'

export function ReviewContent({ review }: { review: ReviewWithUser }) {
  return (
    <>
      <h1 className="text-2xl font-bold">{review.title}</h1>
      <p className="text-gray-700">{review.content}</p>
      <p className="text-sm text-gray-600">
        チョコレート: {review.chocolate?.name ?? '不明'}
      </p>
      <p className="text-sm text-gray-500">
        by {review.user?.name ?? '匿名'} /{' '}
        <span suppressHydrationWarning>
          {new Date(review.createdAt).toLocaleString()}
        </span>
      </p>
    </>
  )
}
