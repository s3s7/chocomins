import { ChocolateList } from './_components/chocolate-list'
import { getChocolates } from '@/services/get-chocolate'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ChocolateListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }
  const chocolates = await getChocolates()

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-center text-2xl font-bold">チョコレート一覧</h1>
      <ChocolateList
        chocolates={chocolates}
        currentUserRole={session.user.role}
      />
    </main>
  )
}
