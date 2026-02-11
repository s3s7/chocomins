'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zen_Maru_Gothic } from 'next/font/google'
import { Button } from '@/components/ui/button'
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
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [scrolled, setScrolled] = useState(false)

  // ホームだけスクロール監視（ホーム以外は常に白背景）
  useEffect(() => {
    if (!isHome) {
      setScrolled(false)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

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

  // ヘッダー背景：
  // - ホーム：上は透明、スクロールで白+ぼかし
  // - ホーム以外：BEDDE2（背景色）
  const headerClass = [
    'fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-4 transition-colors duration-300',
    isHome
      ? scrolled
        ? 'bg-white/80 text-slate-900 backdrop-blur border-b border-slate-200'
        : 'bg-transparent text-slate-900'
      : 'bg-[#BEDDE2] text-slate-900 border-slate-200',
  ].join(' ')

  const logoClass = [
    zenMaruGothic.className,
    'inline-flex items-center gap-0 text-xl font-bold transition-colors text-slate-900',
  ].join(' ')

  // Menubar 全体は箱を作らない（外枠なし）
  const menubarClass = 'bg-transparent p-0 border-0 shadow-none'

  // MenubarTrigger の見た目（ピル型 + 黒い枠）
  const menuTriggerClass = [
    'bg-white text-slate-900 border-black/60',
    'hover:bg-slate-50',
    'data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 data-[state=open]:border-black',
  ].join(' ')

  // 未ログイン時の通常ボタン（ログイン/新規登録/各ページリンク用）
  const authButtonClass =
    'rounded-full border border-black/60 bg-white px-6 py-3 text-slate-900 hover:bg-slate-50'

  return (
    <header className={headerClass}>
      <Link href="/" className={logoClass}>
        <span className="leading-none whitespace-nowrap">ちょこみんず</span>
        <Image
          src="/leaf.png"
          alt="ちょこみんずのロゴ"
          width={53}
          height={53}
          className="ml-0"
          priority
        />
      </Link>

      <div className="flex items-center space-x-4">
        {session?.user ? (
          // ===== ログイン後：Menubar =====
          <div className="flex items-center space-x-3">
            <Menubar className={menubarClass}>
              <MenubarMenu>
                <MenubarTrigger className={menuTriggerClass}>
                  レビュー
                </MenubarTrigger>
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
                <MenubarTrigger className={menuTriggerClass}>
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
                <MenubarTrigger className={menuTriggerClass}>
                  その他
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  <MenubarItem asChild>
                    <Link href="/mypage" className="flex w-full items-center">
                      マイページ
                    </Link>
                  </MenubarItem>

                  {session.user.role === Role.ADMIN && (
                    <MenubarItem asChild>
                      <Link href="/admin" className="flex w-full items-center">
                        管理者ページ
                      </Link>
                    </MenubarItem>
                  )}

                  <MenubarItem
                    variant="destructive"
                    onSelect={() => void handleLogout()}
                  >
                    ログアウト
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        ) : (
          // ===== 未ログイン：全部「普通のボタン」+ 「一覧」表記 =====
          <div className="flex items-center gap-3">
            <Button asChild size="lg" className={authButtonClass}>
              <Link href="/signin">ログイン</Link>
            </Button>

            <Button asChild size="lg" className={authButtonClass}>
              <Link href="/signup">新規登録</Link>
            </Button>

            <Button asChild size="lg" className={authButtonClass}>
              <Link href="/reviews">レビュー一覧</Link>
            </Button>

            <Button asChild size="lg" className={authButtonClass}>
              <Link href="/brands">メーカー / 店舗一覧</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
