'use client'

import { Button } from '@/components/ui/button'
import { ReviewWithUser } from '@/types'
import { EditReviewModal } from './edit-review-modal'
import { Role } from '@prisma/client'
import { deleteReview } from '@/app/actions/review/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useState, useTransition } from 'react'
import Link from 'next/link'

type ReviewItemProps = {
  review: ReviewWithUser
  currentUserId: string
  currentUserRole: string
}

export function ReviewItem({
  review,
  currentUserId,
  currentUserRole,
}: ReviewItemProps) {
  const [editing, setEditing] = useState(false)

  const isOwner = review.userId === currentUserId
  const isAdmin = currentUserRole === Role.ADMIN

  const [isPending, startTransition] = useTransition()
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
      <li className="space-y-2 rounded border p-4">
        <Link href={`/reviews/${review.id}`} className="block">
          <h3 className="text-lg font-semibold text-blue-600 hover:underline">
            {review.title?.length ? review.title : 'レビュー'}
          </h3>
        </Link>
        <p className="text-sm text-gray-600">
          by {review.user?.name ?? '匿名'} /{' '}
          <span suppressHydrationWarning>
            {new Date(review.createdAt).toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          メーカー・店舗：
          {review.brand?.name ?? review.chocolate?.brand?.name ?? '未設定'}
        </p>
        <p className="text-sm text-gray-600">ミント感: {review.mintiness}</p>
        <p>{review.content}</p>

        {(isOwner || isAdmin) && (
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => setEditing(true)}>
              編集
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? '削除中...' : '削除'}
            </Button>
          </div>
        )}
      </li>

      <EditReviewModal
        key={editing ? 'editing' : 'closed'}
        review={review}
        open={editing}
        onCloseAction={() => setEditing(false)}
      />
    </>
  )
}
