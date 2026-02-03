import { ReviewList } from './_components/review-list'
import { getReviews } from '@/services/get-reviews'
import { auth } from '@/lib/auth'

export default async function ReviewListPage() {
  const session = await auth()
  const reviews = await getReviews()
  const currentUserId = session?.user?.id ?? ''
  const currentUserRole = session?.user?.role ?? ''

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">レビュー一覧</h1>
      <ReviewList
        reviews={reviews}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </main>
  )
}
