import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Gift, Users, Eye, type LucideIcon } from 'lucide-react'
import { Zen_Maru_Gothic } from 'next/font/google'

import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type Feature = {
  title: string
  description: ReactNode
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
      title: 'レビューを投稿',
      description:
        'チョコ・ミント感(★5段階評価)など感想を残しましょう。推し商品を仲間に共有できます。',
      highlight: 'Review Share',
      icon: Eye,
      accent: 'from-[#c3ebde] via-[#89c5a0] to-white',
      ctaLabel: isSignedIn ? 'レビューを書く' : 'ログインして投稿',
      ctaHref: isSignedIn ? '/reviews/new' : '/signin',
    },
    {
      title: '次の一口を探す',
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
      title: 'コメントを投稿',
      description: (
        <>
          気になるレビューにコメントして盛り上がろう！
          <br />
          新作チェックも、推しへの愛も、ここなら全力で語り合えます。
        </>
      ),
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
    ? { href: '/reviews/new', label: '記録を作成' }
    : { href: '/signin', label: 'ログイン' }

  return (
    <main className="space-y-12 px-0 py-0">
      {/* <div className="mb-5 flex justify-center">
        <Image
          src="/top.webp"
          alt="ちょこみんずのキービジュアル"
          // width={2040}
          // height={1027}
          width={1540}
          height={607}
          className="h-auto max-w-full"
          priority
        />
      </div> */}
      <div className="relative -mt-16 mb-5 flex justify-center">
        <Image
          src="/top.webp"
          alt="ちょこみんずのキービジュアル"
          width={1940}
          height={607}
          className="h-auto max-w-full"
          priority
        />
        {/* 文字を載せたいならここに absolute で重ねられます */}
        {/* <div className="absolute inset-0 bg-black/20" /> */}
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
      <section className="mx-auto w-full max-w-5xl px-6 py-40">
        <p
          className={`${zenMaruGothic.className} text-2xl leading-relaxed font-bold text-sky-600 md:text-3xl`}
        >
          スースー不足のあなたへ。
          <br />
          チョコミント専門の記録&amp;情報交換サービス、誕生。
        </p>
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* 左：テキスト */}
          <div className="space-y-5 text-left">
            <p className="py-10 text-base leading-7 text-black md:text-lg md:leading-9">
              新作から定番まで、チョコミント商品に特化した評価・共有プラットフォーム。
              <br />
              「チョコとミントどっちが強い？」
              <br />
              「スースー感はどれくらい？」
              <br />
              そんなこだわりを数値化してシェア。
              <br />
              全国のチョコミント好きとつながって、最新のトレンドや隠れた名品をチェックしよう。
              <br />
              <br />
              さあ、あなたの「チョコミント愛」を形にしませんか？
            </p>

            <div className="mt-0 flex flex-col items-center gap-4 md:flex-row md:justify-start">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
              >
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border border-white bg-white px-6 py-3 text-slate-900 hover:bg-slate-50"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            </div>
          </div>

          {/* 右：画像 */}
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl">
            <Image
              src="/topChoco.webp" // ここを表示したい画像に変更（例: /hero-side.webp）
              alt="チョコミントのイメージ"
              width={900}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16">
        {/* 背景画像（bodyではなく、このセクション背景） */}
        <Image
          src="/haikei.webp" // public/bg.jpg を用意
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
          priority={false}
        />

        {/* 読みやすさ用のフィルター（濃さはお好みで） */}
        {/* <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]" /> */}

        {/* 中身（カード） */}
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8 px-6">
          <div className="text-center">
            <h2
              className={`${zenMaruGothic.className} text-2xl leading-relaxed font-bold md:text-3xl`}
            >
              ちょこみんずの使い方
            </h2>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-[#8FCBAB]/40 bg-white/90 p-6 shadow-lg backdrop-blur"
              >
                <div className="flex flex-col items-center gap-6 md:flex-row">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-semibold text-sky-600">
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
