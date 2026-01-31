'use client'

import Link from 'next/link'
import { Role } from '@prisma/client'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zen_Maru_Gothic } from 'next/font/google'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'

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
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-[#563406] px-4 text-white">
      <Link href="/" className={`${zenMaruGothic.className} text-lg font-bold`}>
        ちょこみんず
      </Link>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <div className="flex items-center space-x-3">
            <Menubar className="border-white/30 bg-transparent text-white">
              <MenubarMenu>
                <MenubarTrigger className="text-white">レビュー</MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/reviews" className="flex w-full items-center">
                      一覧
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link
                      href="/reviews/new"
                      className="flex w-full items-center"
                    >
                      入力
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">
                  メーカー・店舗
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/brands" className="flex w-full items-center">
                      一覧
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link
                      href="/brands/new"
                      className="flex w-full items-center"
                    >
                      入力
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">商品</MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link
                      href="/chocolates"
                      className="flex w-full items-center"
                    >
                      一覧
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link
                      href="/chocolates/new"
                      className="flex w-full items-center"
                    >
                      入力
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">その他</MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/mypage" className="flex w-full items-center">
                      マイページ
                    </Link>
                  </MenubarItem>
                  {/* <MenubarItem asChild>
                    <Link href="/guide" className="flex w-full items-center">
                      使い方
                    </Link>
                  </MenubarItem> */}
                  {session.user.role === Role.ADMIN && (
                    <MenubarItem asChild>
                      <Link href="/admin" className="flex w-full items-center">
                        管理者ページ
                      </Link>
                    </MenubarItem>
                  )}
                  <MenubarItem
                    variant="destructive"
                    onSelect={() => {
                      void handleLogout()
                    }}
                  >
                    ログアウト
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Menubar className="border-white/30 bg-transparent text-white">
              <MenubarMenu>
                <MenubarTrigger className="text-white">
                  ログイン / 新規登録
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/signin" className="flex w-full items-center">
                      ログイン
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link href="/signup" className="flex w-full items-center">
                      新規登録
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">レビュー</MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/reviews" className="flex w-full items-center">
                      一覧
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">
                  メーカー・店舗
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/brands" className="flex w-full items-center">
                      一覧
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="text-white">商品</MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link
                      href="/chocolates"
                      className="flex w-full items-center"
                    >
                      一覧
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        )}
      </div>
    </header>
  )
}
