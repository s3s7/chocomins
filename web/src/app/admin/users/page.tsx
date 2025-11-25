import { prisma } from '@/lib/prisma'

export default async function AdminUserPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">ユーザー一覧</h1>
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
