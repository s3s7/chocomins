import { SearchForm } from './users/_components/search-form'
import { getUsers } from '@/services/get-users'
import { SortForm } from './users/_components/sort-form'
import { SortValue } from '@/types'

type Props = {
  searchParams: Promise<{
    q?: string
    sort?: SortValue
  }>
}

export default async function AdminUserPage({ searchParams }: Props) {
  const { q = '', sort = 'createdAt-desc' } = await searchParams

  const keyword = q.trim()

  const { users } = await getUsers({
    keyword,
    sort,
  })

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">ユーザー一覧</h1>
      <SearchForm defaultValue={keyword} />
      {/* ソートフォームを追加 */}
      <SortForm currentSort={sort} />
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
