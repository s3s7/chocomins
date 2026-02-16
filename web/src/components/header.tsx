'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zen_Maru_Gothic } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { MenuIcon, XIcon } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = session?.user?.role === Role.ADMIN

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
    if (!confirmLogout) return false

    try {
      await signOut({ redirect: false })
      toast.success('ログアウトしました')
      router.push('/')
      return true
    } catch (err) {
      console.error(err)
      toast.error('ログアウトに失敗しました')
      return false
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleMobileLogout = async () => {
    const loggedOut = await handleLogout()
    if (loggedOut) {
      closeMobileMenu()
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

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

  const mobileNavLinkClass =
    'block w-full rounded-full border border-slate-200 px-4 py-3 text-left text-base font-medium text-slate-900 hover:bg-slate-50'

  const guestLinks = useMemo(
    () => [
      { label: 'ログイン', href: '/signin' },
      { label: '新規登録', href: '/signup' },
      { label: 'レビュー一覧', href: '/reviews' },
      { label: 'メーカー / 店舗一覧', href: '/brands' },
    ],
    [],
  )

  const reviewLinks = useMemo(
    () => [
      { label: '一覧', href: '/reviews' },
      { label: '入力', href: '/reviews/new' },
    ],
    [],
  )

  const brandLinks = useMemo(
    () => [
      { label: '一覧', href: '/brands' },
      { label: '入力', href: '/brands/new' },
    ],
    [],
  )

  const otherLinks = useMemo(
    () =>
      [
        { label: 'マイページ', href: '/mypage' },
        ...(isAdmin ? [{ label: '管理者ページ', href: '/admin' }] : []),
      ],
    [isAdmin],
  )

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

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <Menubar className={menubarClass}>
              <MenubarMenu>
                <MenubarTrigger className={menuTriggerClass}>
                  レビュー
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  {reviewLinks.map((link) => (
                    <MenubarItem asChild key={link.href}>
                      <Link href={link.href} className="flex w-full items-center">
                        {link.label}
                      </Link>
                    </MenubarItem>
                  ))}
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className={menuTriggerClass}>
                  メーカー・店舗
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  {brandLinks.map((link) => (
                    <MenubarItem asChild key={link.href}>
                      <Link href={link.href} className="flex w-full items-center">
                        {link.label}
                      </Link>
                    </MenubarItem>
                  ))}
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className={menuTriggerClass}>
                  その他
                </MenubarTrigger>
                <MenubarContent className="bg-white text-gray-900">
                  {otherLinks.map((link) => (
                    <MenubarItem asChild key={link.href}>
                      <Link href={link.href} className="flex w-full items-center">
                        {link.label}
                      </Link>
                    </MenubarItem>
                  ))}

                  <MenubarItem
                    variant="destructive"
                    onSelect={() => void handleLogout()}
                  >
                    ログアウト
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          ) : (
            <div className="flex items-center gap-3">
              {guestLinks.map((link) => (
                <Button asChild size="lg" className={authButtonClass} key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/60 bg-white text-slate-900 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
          aria-label={mobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu-panel"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <XIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden" aria-hidden={!mobileMenuOpen}>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="メインメニュー"
            className="fixed inset-y-0 right-0 z-[70] flex h-full w-72 max-w-full flex-col bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="text-lg font-semibold">メニュー</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                onClick={closeMobileMenu}
                aria-label="メニューを閉じる"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {session?.user ? (
              <nav className="flex flex-1 flex-col gap-6" aria-label="ログイン済みメニュー">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    レビュー
                  </p>
                  <div className="mt-2 space-y-2">
                    {reviewLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={mobileNavLinkClass}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    メーカー・店舗
                  </p>
                  <div className="mt-2 space-y-2">
                    {brandLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={mobileNavLinkClass}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {!!otherLinks.length && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      その他
                    </p>
                    <div className="mt-2 space-y-2">
                      {otherLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={mobileNavLinkClass}
                          onClick={closeMobileMenu}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="mt-auto block w-full rounded-full border border-red-200 px-4 py-3 text-left text-base font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => void handleMobileLogout()}
                >
                  ログアウト
                </button>
              </nav>
            ) : (
              <nav className="flex flex-col gap-3" aria-label="未ログインメニュー">
                {guestLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
