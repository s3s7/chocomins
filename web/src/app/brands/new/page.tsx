import { BrandForm } from '@/app/brands/_components/brand-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function BrandListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <BrandForm />
    </main>
  )
}
