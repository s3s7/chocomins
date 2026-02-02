import Link from 'next/link'
import Image from 'next/image'
// import type { Metadata } from 'next'
import {
  Calendar,
  Gift,
  Inbox,
  Users,
  Eye,
  type LucideIcon,
} from 'lucide-react'
import { Zen_Maru_Gothic } from 'next/font/google'

import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type Feature = {
  title: string
  description: string
  highlight: string
  icon: LucideIcon
  accent: string
  ctaLabel?: string
  ctaHref?: string
  comingSoon?: boolean
  note?: string
}

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
})

// export const metadata: Metadata = {
//   title: 'ちょこみんず',
//   description:
//     'ちょこみんずは、気になるメーカーやチョコレートを記録し、レビューを通じて推しチョコを共有できるコミュニティです。',
//   openGraph: {
//     title: 'ちょこみんず',
//     description:
//       'ちょこみんずでメーカー・店舗やチョコを整理し、レビューを投稿して新しい一粒に出会いましょう。',
//     images: ['/window.svg'],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'ちょこみんず',
//     description:
//       'ちょこみんずは、メーカー・店舗登録からレビュー投稿までをサポートするチョコミント好きのための場所です。',
//     images: ['/window.svg'],
//   },
// }

export default async function Home() {
  const session = await auth()
  const isSignedIn = Boolean(session?.user)

  const features: Feature[] = [
    {
      title: 'アカウント登録 / ログイン',
      description:
        'メールアドレスだけで簡単にスタート。ログインすると店舗登録やレビュー投稿などすべての機能を利用できます。',
      highlight: 'Sign in',
      icon: Users,
      accent: 'from-[#c9f1e3] via-[#8fcbab] to-white',
      ctaLabel: isSignedIn ? 'マイページへ' : 'ログインする',
      ctaHref: isSignedIn ? '/mypage' : '/signin',
    },
    {
      title: 'メーカー / 店舗の登録',
      description:
        'チョコミント商品の情報を登録しよう。メーカーや地元のカフェ、旅先で出会ったお店を記録できます。',
      highlight: 'Brand Library',
      icon: Gift,
      accent: 'from-[#d4f5ea] via-[#97d2b5] to-white',
      ctaLabel: isSignedIn ? '店舗・を登録' : 'ログインして登録',
      ctaHref: isSignedIn ? '/brands/new' : '/signin',
    },
    {
      title: 'チョコレート情報の登録',
      description:
        '説明、価格などを保存して、食べたチョコを記録しましょう。',
      highlight: 'Chocolate Notes',
      icon: Inbox,
      accent: 'from-[#d9f8ee] via-[#9fd8c0] to-white',
      ctaLabel: isSignedIn ? 'チョコを登録' : 'ログインして登録',
      ctaHref: isSignedIn ? '/chocolates/new' : '/signin',
      note: '写真投稿機能は現在開発中です。',
    },
    {
      title: 'レビューを投稿',
      description:
        '味やミント感など感想を残しましょう。リンク共有すれば推しチョコを仲間にも紹介できます。',
      highlight: 'Review Share',
      icon: Eye,
      accent: 'from-[#c3ebde] via-[#89c5a0] to-white',
      ctaLabel: isSignedIn ? 'レビューを書く' : 'ログインして投稿',
      ctaHref: isSignedIn ? '/reviews/new' : '/signin',
    },
    {
      title: '次の一粒を探す',
      description: '次に試したい商品をレビューや商品一覧で探しましょう。',
      highlight: 'Discovery',
      icon: Calendar,
      accent: 'from-[#cfeede] via-[#85c5a3] to-white',
      ctaLabel: isSignedIn ? 'レビュー一覧へ' : 'レビュー一覧へ',
      ctaHref: isSignedIn ? '/reviews' : '/reviews',
      comingSoon: false,
      note: '',
    },
    {
      title: 'コミュニティとの連携',
      description: '気になるレビューにコメントして盛り上がろう！',
      highlight: 'Community',
      icon: Users,
      accent: 'from-[#def7ed] via-[#a3d9c0] to-white',
      ctaLabel: isSignedIn ? 'レビュー一覧へ' : 'ログインして参加',
      ctaHref: isSignedIn ? '/reviews' : '/signin',
    },
  ]

  const primaryCta = isSignedIn
    ? { href: '/mypage', label: 'マイページへ' }
    : { href: '/signup', label: '新規登録' }
  const secondaryCta = isSignedIn
    ? { href: '/reviews/new', label: '最初の記録を作成' }
    : { href: '/signin', label: 'ログイン' }

  return (
    <main className="space-y-12 px-0 py-0">
      <div className="mb-5 flex justify-center">
        <Image
          src="/t.png"
          alt="ちょこみんずのキービジュアル"
          width={2040}
          height={1027}
          className="h-auto max-w-full"
          priority
        />
      </div>
      {/* <div className="mb-0 flex justify-center">
        <Image
          src="/line.png"
          alt="区切り線"
          width={1040}
          height={1027}
          className="h-auto max-w-full"
          priority
        />
      </div> */}
      <section className="mx-auto w-full max-w-5xl rounded-3xl bg-white px-6 py-16 shadow-sm">
        <div className="text-center">
          <Badge
            variant="secondary"
            className={`${zenMaruGothic.className} mb-4 bg-white/80 px-11 py-3 text-3xl font-bold text-sky-600`}
          >
            「ちょこみんず」とは？
          </Badge>
          <p className="text-xl text-slate-800">
            チョコミント好きのための情報管理や共有をするサービスです。<br></br>商品のメーカー / 店舗を登録し、レビューを投稿して情報を交換できます。
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#8FCBAB] text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-[#8FCBAB] text-[#3E5C4F] hover:bg-[#8FCBAB]/20"
          >
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-slate-900">
            ちょこみんずの使い方
          </h2>
        </div>
        <div className="space-y-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-[#8FCBAB]/40 bg-white p-6 shadow-lg"
            >
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-semibold text-[#3E5C4F]">
                    STEP {index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#1F3028]">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#445851]">
                    {feature.description}
                  </p>
                  {feature.note ? (
                    <p className="mt-2 text-sm text-[#5F746B]">
                      {feature.note}
                    </p>
                  ) : null}
                  {/* <div className="mt-6">
                    {feature.comingSoon ? (
                      <Button
                        variant="secondary"
                        disabled
                        className="bg-[#CFE6DA] text-[#5F746B]"
                      >
                        近日公開予定
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="bg-[#8FCBAB] text-[#1F3028] hover:bg-[#7BB898]"
                      >
                        <Link href={feature.ctaHref!}>{feature.ctaLabel}</Link>
                      </Button>
                    )}
                  </div> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
