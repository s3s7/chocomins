import { ChocolateForm } from '@/app/chocolates/_components/chocolate-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { FormPageLayout } from '@/components/form-page-layout'

export default async function ChocolateListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <FormPageLayout title="商品登録">
      <ChocolateForm />
    </FormPageLayout>
  )
}
