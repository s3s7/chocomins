'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewWithUser } from '@/types'
import Map from '@/components/ui/map'
import { Button } from '@/components/ui/button'
import { deleteReview } from '@/app/actions/review/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { Role } from '@prisma/client'
import { EditReviewModal } from '../../_components/edit-review-modal'

type ReviewContentProps = {
  review: ReviewWithUser
  currentUserId: string
  currentUserRole: string
}

export function ReviewContent({
  review,
  currentUserId,
  currentUserRole,
}: ReviewContentProps) {
  const lat = review.place?.lat ?? null
  const lng = review.place?.lng ?? null
  const address = review.place?.address ?? null
  const placeName = review.place?.name ?? null
  const locationTexts = [address, placeName].filter(
    (text): text is string => typeof text === 'string' && text.length > 0,
  )
  const locationLabel = locationTexts.join(' / ')
  const [editing, setEditing] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const router = useRouter()
  const isOwner = review.userId === currentUserId
  const isAdmin = currentUserRole === Role.ADMIN

  const handleDelete = () => {
    const confirmDelete = window.confirm('本当にこの投稿を削除しますか？')
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('reviewId', review.id)

    startTransition(async () => {
      try {
        const result = await deleteReview(formData)
        if (result.isSuccess) {
          toast.success('投稿を削除しました！')
          router.push('/reviews')
        } else if (result.errorCode) {
          toast.error(getErrorMessage(result.errorCode))
        }
      } catch (err) {
        toast.error('削除中に予期せぬエラーが発生しました')
        console.error(err)
      }
    })
  }

  return (
    <>
      <h1 className="text-2xl font-bold">{review.title}</h1>
      <p className="text-gray-700">{review.content}</p>

      <p className="text-sm text-gray-600">
        チョコレート: {review.chocolate?.name ?? '不明'}
      </p>

      {typeof lat === 'number' && typeof lng === 'number' ? (
        <div className="mt-4 space-y-2">
          {locationLabel.length > 0 && (
            <p className="text-sm text-gray-600">{locationLabel}</p>
          )}
          <Map lat={lat} lng={lng} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">位置情報が未登録です</p>
      )}

      <p className="text-sm text-gray-500">
        by {review.user?.name ?? '匿名'} /{' '}
        <span suppressHydrationWarning>
          {new Date(review.createdAt).toLocaleString()}
        </span>
      </p>

      {(isOwner || isAdmin) && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => setEditing(true)}>
            編集
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除'}
          </Button>
        </div>
      )}

      <EditReviewModal
        key={editing ? 'editing' : 'closed'}
        review={review}
        open={editing}
        onCloseAction={() => setEditing(false)}
      />
    </>
  )
}
