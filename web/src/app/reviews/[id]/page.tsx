import { getReviewById } from '@/services/get-review-by-id'
import { auth } from '@/lib/auth'
import { ReviewContent } from './_components/review-content'
import { CommentForm } from './_components/comment-form'
import { CommentList } from './_components/comment-list'
import { CommentSkeleton } from './_components/comment-skeleton'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const review = await getReviewById(id)
  if (!review) notFound()

  const currentUserId = session?.user?.id ?? ''
  const currentUserRole = session?.user?.role ?? ''

  return (
    <section className="px-1 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-3 shadow-lg sm:p-6">
        <ReviewContent
          review={review}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="mb-6">
            {session?.user ? (
              <CommentForm reviewId={review.id} />
            ) : (
              <p className="text-sm text-gray-500">
                コメントするにはログインしてください。
              </p>
            )}
          </div>

          <Suspense fallback={<CommentSkeleton />}>
            <CommentList reviewId={review.id} showHeading={false} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
