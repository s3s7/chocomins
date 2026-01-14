'use client'

import { ReviewWithUser } from '@/types'
import Map from '@/components/ui/map'

export function ReviewContent({ review }: { review: ReviewWithUser }) {
  const lat = review.place?.lat ?? null
  const lng = review.place?.lng ?? null

  return (
    <>
      <h1 className="text-2xl font-bold">{review.title}</h1>
      <p className="text-gray-700">{review.content}</p>

      <p className="text-sm text-gray-600">
        チョコレート: {review.chocolate?.name ?? '不明'}
      </p>

      {typeof lat === 'number' && typeof lng === 'number' ? (
        <Map lat={lat} lng={lng} />
      ) : (
        <p className="mt-2 text-sm text-gray-500">位置情報が未登録です</p>
      )}

      <p className="text-sm text-gray-500">
        by {review.user?.name ?? '匿名'} /{' '}
        <span suppressHydrationWarning>
          {new Date(review.createdAt).toLocaleString()}
        </span>
      </p>
    </>
  )
}
