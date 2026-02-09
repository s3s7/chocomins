import { ReviewForm } from '../_components/review-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { FormPageLayout } from '@/components/form-page-layout'

export default async function ReviewListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <FormPageLayout title="レビュー登録">
      <ReviewForm />
    </FormPageLayout>
  )
}
