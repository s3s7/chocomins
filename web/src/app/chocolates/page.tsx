import { ChocolateList } from './_components/chocolate-list'
import { ChocolateForm } from './_components/chocolate-form'
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
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <ChocolateForm />
      <h1 className="text-2xl font-bold">投稿一覧</h1>
      <ChocolateList
        chocolates={chocolates}
        currentUserRole={session.user.role}
      />
    </main>
  )
}
