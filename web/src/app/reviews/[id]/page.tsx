import { getReviewById } from '@/services/get-review-by-id'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ReviewContent } from './_components/review-content'
import { CommentForm } from './_components/comment-form'
import { CommentList } from './_components/comment-list'
{
  /* 追加 */
}
import { CommentSkeleton } from './_components/comment-skeleton'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
{
  /* ここまで追加 */
}
export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  {
    /* 以下のコードを修正 */
  }
  const review = await getReviewById(id)
  if (!review) notFound()
  {
    /* ここまで修正 */
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <ReviewContent review={review} />
      <CommentForm reviewId={review.id} />
      {/* ここから修正 */}
      <Suspense fallback={<CommentSkeleton />}>
        <CommentList reviewId={review.id} />
      </Suspense>
      {/* ここまで修正 */}
    </div>
  )
}
