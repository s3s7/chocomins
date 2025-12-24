import { ReviewList } from './_components/review-list'
import { ReviewForm } from './_components/review-form'
import { getReviews } from '@/services/get-reviews'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ReviewListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }
  const reviews = await getReviews()

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">レビュー一覧</h1>
      <ReviewList
        reviews={reviews}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </main>
  )
}
