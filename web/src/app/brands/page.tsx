import { BrandList } from './_components/brand-list'
import { getBrands } from '@/services/get-brand'
import { auth } from '@/lib/auth'

export default async function BrandListPage() {
  const session = await auth()
  const brands = await getBrands()
  const currentUserRole = session?.user?.role ?? ''

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">メーカー・店舗一覧</h1>
      <BrandList
        brands={brands}
        currentUserRole={currentUserRole}
      />
    </main>
  )
}
