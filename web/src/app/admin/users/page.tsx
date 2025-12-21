import { SearchForm } from './_components/search-form'
import { getUsers } from '@/services/get-users'

type Props = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function AdminUserPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const keyword = q.trim() // 前後の空白を除去

  // キーワード検索
  const { users } = await getUsers({ keyword })

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">ユーザー一覧</h1>
      {/* 検索フォームを追加 */}
      <SearchForm defaultValue={keyword} />
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="rounded border p-2">
            <p className="font-medium">{user.name || '（名前なし）'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
