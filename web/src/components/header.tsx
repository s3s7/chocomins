'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
  const confirmLogout = window.confirm('本当にログアウトしますか？')
  if (!confirmLogout) return

  try {
    await signOut({ redirect: false })
    toast.success('ログアウトしました')
    router.push('/')
  } catch (err) {
    console.error(err)
    toast.error('ログアウトに失敗しました')
  }
  }

  return (
    <header className="flex items-center justify-between bg-gray-100 px-4 py-2">
      <Link href="/" className="text-lg font-bold">
        My App
      </Link>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <div className="flex items-center space-x-2">
            <span>こんにちは, {session.user.name || session.user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-3 py-1 text-white"
              >
                ログアウト
              </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link
              href="/signin"
              className="rounded bg-blue-500 px-3 py-1 text-white"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded bg-blue-500 px-3 py-1 text-white"
            >
              新規登録
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
