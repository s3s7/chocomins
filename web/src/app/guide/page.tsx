import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye, LogIn, Plus, Share2, Shield, Sparkles } from 'lucide-react'

import { auth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: '使い方ガイド - ちょこみんず',
  description:
    'ちょこみんずでのブランド・チョコ登録やレビュー投稿の流れを紹介します。',
}

type Step = {
  number: number
  colorClass: string
  title: string
  description: string
  bullets?: string[]
  extra?: ReactNode
}

export default async function GuidePage() {
  const session = await auth()
  const isSignedIn = Boolean(session?.user)

  const steps: Step[] = [
    {
      number: 1,
      colorClass: 'bg-sky-500',
      title: 'アカウント登録 / ログイン',
      description:
        'メールアドレスとパスワードだけで、すぐにチーム“ちょこみんず”へ参加できます。ログインするとレビュー投稿やお気に入り登録など、すべての機能にアクセスできます。',
      bullets: ['メールアドレスのみで登録完了', 'SNSログインにも順次対応予定'],
    },
    {
      number: 2,
      colorClass: 'bg-lime-500',
      title: 'メーカー・店舗の登録',
      description:
        '地元のショコラトリーから旅行先で見つけたショップまで、気になるブランド情報を整理しましょう。登録したブランドは他のメンバーとも共有され、レビュー作成時にすぐ選べます。',
      bullets: ['店舗名・エリア・特徴を記録', 'マイページからいつでも編集可能'],
    },
    {
      number: 3,
      colorClass: 'bg-amber-500',
      title: 'チョコレート情報のストック',
      description:
        'カカオ含有率、テイスト、価格帯など、チョコレート単位で細かな情報を保管。ミント入りかどうかも明記できるので、次に食べたいチョコをすぐ思い出せます。',
      bullets: [
        'メモ・おすすめシーンを保存',
        '写真投稿は近日公開予定',
        '公開 / 非公開を切り替え可能',
      ],
    },
    {
      number: 4,
      colorClass: 'bg-purple-500',
      title: 'レビュー・感想を投稿',
      description:
        '味のバランスや香り、ペアリングした飲み物などをレビューとして残しましょう。写真投稿機能は現在準備中で、公開後は視覚的にも共有できるようになります。',
      extra: (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-foreground mb-1 flex items-center gap-2 font-semibold">
              <Eye className="h-4 w-4" />
              レビュー閲覧
            </div>
            <p className="text-muted-foreground text-sm">
              ブランド別にレビューを横断検索
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="text-foreground mb-1 flex items-center gap-2 font-semibold">
              <Share2 className="h-4 w-4" />
              推しチョコの共有
            </div>
            <p className="text-muted-foreground text-sm">
              リンク共有でSNSにも紹介しやすい
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 5,
      colorClass: 'bg-teal-500',
      title: '次の一粒を探す',
      description:
        'レビュー検索やランキングを活用して、次に試したいミントチョコを見つけましょう。季節限定の一粒も逃さずキャッチできます。',
      bullets: [
        '検索フィルターで味わいを絞り込み',
        '気になるチョコはマイページで管理',
      ],
    },
    {
      number: 6,
      colorClass: 'bg-rose-500',
      title: 'コミュニティとの連携',
      description:
        '他のメンバーの投稿にコメントしたり、気になるチョコをお気に入り登録したり、コミュニティから新しい発見を得ましょう。',
      bullets: [
        'コメント通知で会話がスムーズ',
        'お気に入りリストで再購入を逃さない',
      ],
      extra: (
        <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-900">
          <Shield className="h-4 w-4" />
          <AlertTitle>プライバシーも安心</AlertTitle>
          <AlertDescription>
            非公開設定にしたチョコやメモは自分だけが閲覧できます。公開範囲は投稿ごとに細かく設定可能です。
          </AlertDescription>
        </Alert>
      ),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-10 lg:px-0">
      <div className="rounded-3xl bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 px-8 py-16 text-center shadow-sm">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-sky-700">
          <Sparkles className="h-4 w-4" />
          ちょこみんずでできること
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-800">使い方ガイド</h1>
        <p className="text-lg text-slate-600">
          ブランド登録からレビュー投稿まで、チョコ好きのワークフローをギュッと整理しました。
        </p>
      </div>

      <div className="space-y-8">
        {steps.map((step) => (
          <Card key={step.number} className="border-slate-100 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white',
                    step.colorClass,
                  ].join(' ')}
                >
                  {step.number}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {step.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-slate-600">
                {step.description}
              </p>
              {step.bullets?.length ? (
                <ul className="list-inside list-disc space-y-2 text-slate-600">
                  {step.bullets.map((bullet, index) => (
                    <li key={`${step.number}-${index}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {step.extra}
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">よくある質問</h2>
          <p className="mt-2 text-slate-600">
            導入前に気になるポイントをまとめました。
          </p>
        </div>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {/* <AccordionItem value="q1">
                <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-primary">
                  Q. 投稿内容はすべて公開されますか？
                </AccordionTrigger>
                <AccordionContent>
                  A. 投稿ごとに公開 / 非公開を設定できます。ブランドやチョコの基本情報は共有しつつ、個人的なメモは自分だけに留める、といった使い方も可能です。
                </AccordionContent>
              </AccordionItem> */}
              {/* <Separator className="my-2" /> */}
              <AccordionItem value="q2">
                <AccordionTrigger className="hover:text-primary text-left font-semibold text-slate-800">
                  Q. 利用料金はかかりますか？
                </AccordionTrigger>
                <AccordionContent>
                  A.
                  基本機能はすべて無料です。有料プランが追加された場合も、既存データはそのままご利用いただけます。
                </AccordionContent>
              </AccordionItem>
              <Separator className="my-2" />
              <AccordionItem value="q3">
                <AccordionTrigger className="hover:text-primary text-left font-semibold text-slate-800">
                  Q. スマホからでも投稿できますか？
                </AccordionTrigger>
                <AccordionContent>
                  A.
                  ちょこみんずはレスポンシブ対応です。スマートフォンやタブレットからでも快適に操作でき、写真投稿機能は順次追加予定です。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 px-8 py-10 text-center shadow-inner">
        <h3 className="text-2xl font-bold text-slate-800">
          さあ、新しいミントチョコを探しに行こう！
        </h3>
        <p className="mt-2 text-slate-600">
          気になるブランドを登録し、レビューで“推しチョコ”を共有してみましょう。
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          {isSignedIn ? (
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl">
              <Link href="/reviews/new" className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                最初のレビューを書く
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-sky-600 shadow-lg hover:bg-sky-700 hover:shadow-xl"
            >
              <Link href="/signup" className="inline-flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                無料でアカウントを作成
              </Link>
            </Button>
          )}
          <div className="text-muted-foreground text-sm">
            <Badge variant="secondary">無料プラン</Badge>
            <span className="ml-2">
              好きなだけブランド・レビューを登録できます
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
