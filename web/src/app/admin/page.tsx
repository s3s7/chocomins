import Link from 'next/link'

export default async function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="mb-6 text-2xl font-bold">管理者ダッシュボード</h1>
      <p className="mb-4">ここは管理者専用のページです。</p>
      <Link href="/admin/users" className="text-blue-600 hover:underline">
        ユーザー一覧
      </Link>
    </div>
  )
}
