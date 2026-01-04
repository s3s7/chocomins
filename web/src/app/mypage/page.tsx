import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function MyPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  const name = session.user.name ?? '未設定'
  const email = session.user.email ?? '未設定'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-muted-foreground text-sm">
          あなたの登録情報を確認できます。
        </p>
      </div>

      <div className="bg-card space-y-4 rounded-lg border p-6">
        <div>
          <p className="text-muted-foreground text-sm">名前</p>
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">メールアドレス</p>
          <p className="text-lg font-semibold">{email}</p>
        </div>
      </div>
    </div>
  )
}
