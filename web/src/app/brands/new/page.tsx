import { BrandForm } from '@/app/brands/_components/brand-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { FormPageLayout } from '@/components/form-page-layout'

export default async function BrandListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <FormPageLayout title="メーカー・店舗登録">
      <BrandForm />
    </FormPageLayout>
  )
}
