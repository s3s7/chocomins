import { ReviewForm } from '../_components/review-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ReviewListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <ReviewForm />
    </main>
  )
}
