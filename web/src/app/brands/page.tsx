import { BrandList } from './_components/brand-list'
import { BrandForm } from './_components/brand-form'
import { getBrands } from '@/services/get-brand'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function BrandListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }
  const brands = await getBrands()

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">ブランド一覧</h1>
      <BrandList brands={brands} currentUserRole={session.user.role} />
    </main>
  )
}
