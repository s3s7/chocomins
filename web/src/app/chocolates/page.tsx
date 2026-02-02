import { ChocolateList } from './_components/chocolate-list'
import { getChocolates } from '@/services/get-chocolate'
import { auth } from '@/lib/auth'

export default async function ChocolateListPage() {
  const session = await auth()
  const chocolates = await getChocolates()
  const currentUserRole = session?.user?.role ?? ''

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">商品一覧</h1>
      <ChocolateList
        chocolates={chocolates}
        currentUserRole={currentUserRole}
      />
    </main>
  )
}
