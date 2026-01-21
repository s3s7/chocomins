import Link from 'next/link'
// import Image from 'next/image'
// import type { Metadata } from 'next'
import {
  Calendar,
  Gift,
  Inbox,
  Users,
  Eye,
  type LucideIcon,
} from 'lucide-react'

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

// export const metadata: Metadata = {
//   title: 'ちょこみんず',
//   description:
//     'ちょこみんずは、気になるメーカーやチョコレートを記録し、レビューを通じて推しチョコを共有できるコミュニティです。',
//   openGraph: {
//     title: 'ちょこみんず',
//     description:
//       'ちょこみんずでブランドやチョコを整理し、レビューを投稿して新しい一粒に出会いましょう。',
//     images: ['/window.svg'],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'ちょこみんず',
//     description:
//       'ちょこみんずは、ブランド登録からレビュー投稿までをサポートするチョコミント好きのための場所です。',
//     images: ['/window.svg'],
//   },
// }

const heroMessages = [
  '「お気に入りのショコラトリーを忘れたくない」',
  '「推しチョコとの出会いをシェアしたい」',
  'その思い出、ちょこみんずに残しませんか？',
]

export default async function Home() {
  const session = await auth()
  const isSignedIn = Boolean(session?.user)

  const features: Feature[] = [
    {
      title: 'アカウント登録 / ログイン',
      description:
        'メールアドレスだけで簡単にスタート。ログインするとブランド登録やレビュー投稿などすべての機能を利用できます。',
      highlight: 'Sign in',
      icon: Users,
      accent: 'from-sky-100 via-blue-50 to-white',
      ctaLabel: isSignedIn ? 'マイページへ' : 'ログインする',
      ctaHref: isSignedIn ? '/mypage' : '/signin',
    },
    {
      title: 'メーカー・店舗の登録',
      description:
        '地元のショコラトリーや旅先で出会ったお店を記録。ブランドごとに特徴をまとめておけば、レビュー作成時にすぐ呼び出せます。',
      highlight: 'Brand Library',
      icon: Gift,
      accent: 'from-emerald-100 via-emerald-50 to-white',
      ctaLabel: isSignedIn ? 'ブランドを登録' : 'ログインして登録',
      ctaHref: isSignedIn ? '/brands/new' : '/signin',
    },
    {
      title: 'チョコレート情報のストック',
      description:
        'カカオ含有率やテイスト、価格帯をチョコ単位で整理。メモやおすすめシーンを書き添えられ、写真投稿は近日公開予定です。',
      highlight: 'Chocolate Notes',
      icon: Inbox,
      accent: 'from-amber-100 via-orange-50 to-white',
      ctaLabel: isSignedIn ? 'チョコを登録' : 'ログインして登録',
      ctaHref: isSignedIn ? '/chocolates/new' : '/signin',
      note: '写真投稿機能は現在開発中です。',
    },
    {
      title: 'レビュー・感想を投稿',
      description:
        '味や香り、ペアリングした飲み物の感想を残しましょう。リンク共有すれば推しチョコを仲間にも紹介できます。',
      highlight: 'Review Share',
      icon: Eye,
      accent: 'from-purple-100 via-violet-50 to-white',
      ctaLabel: isSignedIn ? 'レビューを書く' : 'ログインして投稿',
      ctaHref: isSignedIn ? '/reviews/new' : '/signin',
      note: '写真投稿は順次アップデート予定。',
    },
    {
      title: 'コミュニティとの連携',
      description:
        '気になるレビューにコメントしたり、お気に入りに登録して再購入を逃さないように。非公開設定も柔軟に選べます。',
      highlight: 'Community',
      icon: Users,
      accent: 'from-rose-100 via-pink-50 to-white',
      ctaLabel: isSignedIn ? 'レビュー一覧へ' : 'ログインして参加',
      ctaHref: isSignedIn ? '/reviews' : '/signin',
    },
    {
      title: '次の一粒を探す',
      description:
        '検索やランキングで次に試したいミントチョコを探しましょう。気になる銘柄はマイページで管理できます。',
      highlight: 'Discovery',
      icon: Calendar,
      accent: 'from-cyan-100 via-teal-50 to-white',
      comingSoon: true,
      note: 'ランキング・おすすめ機能は順次追加予定です。',
    },
  ]

  const primaryCta = isSignedIn
    ? { href: '/mypage', label: 'マイページへ' }
    : { href: '/signin', label: 'ログイン・新規登録' }
  const secondaryCta = isSignedIn
    ? { href: '/reviews/new', label: '最初の記録を作成' }
    : { href: '/guide', label: '使い方を見る' }

  return (
    <main className="space-y-12 px-4 py-10">
      <section className="mx-auto w-full max-w-5xl rounded-3xl bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 px-6 py-16 shadow-sm">
        {/* <div className="mb-8 flex justify-center">
          <Image
            src="/top.webp"
            alt="ちょこみんずのキービジュアル"
            width={2040}
            height={1027}
            className="h-auto max-w-full rounded-2xl shadow-lg"
            priority
          />
        </div> */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 bg-white/80 text-sky-600">
            ちょこみんずについて
          </Badge>
          <p className="text-xl text-slate-800">
            ちょこみんずはブランド登録からレビュー投稿まで、チョコ好きのワークフローを丸ごとサポートするコミュニティです。
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-2xl bg-white/70 shadow-inner">
              <Gift className="h-14 w-14 text-orange-500" />
            </div>
          </div>
          <div className="text-center text-lg leading-relaxed text-slate-900">
            {heroMessages.map((line) => (
              <p key={line} className="mb-4">
                {line}
              </p>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-2xl bg-white/70 shadow-inner">
              <Users className="h-14 w-14 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-sky-200 text-sky-600 hover:bg-sky-100"
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
          <p className="mt-2 text-slate-600">
            ブランド登録やチョコのレビューなど、ガイドページと同じ流れでご紹介します。
          </p>
        </div>
        <div className="space-y-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-slate-100 p-6 shadow-md"
            >
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm font-semibold text-orange-500">
                    STEP {index + 1}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                  {feature.note ? (
                    <p className="text-muted-foreground mt-2 text-sm">
                      {feature.note}
                    </p>
                  ) : null}
                  <div className="mt-6">
                    {feature.comingSoon ? (
                      <Button variant="secondary" disabled>
                        近日公開予定
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Link href={feature.ctaHref!}>{feature.ctaLabel}</Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex w-full justify-center md:w-auto">
                  <div
                    className={`flex h-40 w-40 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-center shadow-inner`}
                  >
                    <feature.icon className="mb-3 h-10 w-10 text-slate-700" />
                    <span className="text-sm font-semibold text-slate-700">
                      {feature.highlight}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
