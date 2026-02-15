import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ProfileCard } from './_components/profile-card'
import { getUserById } from '@/services/get-user-by-id'

export default async function MyPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  const user = await getUserById(session.user.id)
  if (!user) {
    redirect('/')
  }

  const name = user.name ?? '未設定'
  const email = user.email ?? '未設定'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-muted-foreground text-sm">
          あなたの登録情報を確認できます。
        </p>
      </div>

      <ProfileCard name={name} email={email} />
    </div>
  )
}
