import { ChocolateForm } from '@/app/chocolates/_components/chocolate-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ChocolateListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/') // 未ログインならトップページへ
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <ChocolateForm />
    </main>
  )
}
