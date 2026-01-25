'use client'

import Link from 'next/link'
import { Role } from '@prisma/client'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zen_Maru_Gothic } from 'next/font/google'

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
})

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
    <header className="flex items-center justify-between bg-[#563406] px-4 py-3 text-white">
      <Link href="/" className={`${zenMaruGothic.className} text-lg font-bold`}>
        ちょこみんず
      </Link>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <div className="flex items-center space-x-2">
            <Link href="/brands" className="rounded px-3 py-1">
              メーカー・店舗一覧
            </Link>
            <Link href="/brands/new" className="rounded px-3 py-1">
              メーカー・店舗入力
            </Link>
            <Link href="/chocolates" className="rounded px-3 py-1">
              商品一覧
            </Link>
            <Link href="/chocolates/new" className="rounded px-3 py-1">
              商品入力
            </Link>
            <Link href="/reviews" className="rounded px-3 py-1">
              投稿一覧
            </Link>
            <Link href="/reviews/new" className="rounded px-3 py-1">
              レビュー入力
            </Link>
            <Link href="/mypage" className="rounded px-3 py-1">
              マイページ
            </Link>
            {session.user.role === Role.ADMIN && (
              <Link href="/admin" className="rounded px-3 py-1">
                管理者ページ
              </Link>
            )}
            <button onClick={handleLogout} className="rounded px-3 py-1">
              ログアウト
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link href="/signin" className="rounded px-3 py-1">
              ログイン
            </Link>
            <Link href="/signup" className="rounded px-3 py-1">
              新規登録
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
