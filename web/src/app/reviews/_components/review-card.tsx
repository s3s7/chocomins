'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Star } from 'lucide-react'

import { ReviewWithUser } from '@/types'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type ReviewCardProps = {
  review: ReviewWithUser
  currentUserId: string
  currentUserRole: string
  href?: string | null
}

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(typeof value === 'string' ? new Date(value) : value)

const clampRating = (value: number) => Math.min(5, Math.max(0, value))

const getAvatarColor = (seed: string) => {
  if (!seed) return '#10b981'
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 45%)`
}

const getInitial = (name?: string | null) => name?.trim()?.[0] ?? '？'

function StarRating({ rating }: { rating: number }) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], [])
  return (
    <div className="flex items-center gap-0.5 text-base leading-none" aria-label={`評価 ${rating} / 5`}>
      {stars.map((value) => (
        <Star
          key={value}
          className={cn(
            'h-4 w-4',
            value <= rating ? 'fill-emerald-500 text-emerald-500' : 'text-emerald-100',
          )}
        />
      ))}
    </div>
  )
}

export function ReviewCard({ review, href }: ReviewCardProps) {
  const linkHref = href === undefined ? `/reviews/${review.id}` : href
  const isLinkEnabled = typeof linkHref === 'string' && linkHref.length > 0

  const userName = review.user?.name ?? '匿名'
  const avatarColor = useMemo(() => getAvatarColor(userName), [userName])
  const rating = clampRating(review.mintiness)
  const chocolateName = review.chocolate?.name ?? 'チョコレート未登録'
  const chocolateCategory = review.chocolate?.category?.name ?? 'カテゴリ未設定'
  const chocolateBrand = review.chocolate?.brand?.name ?? 'ブランド未設定'

  const cardInner = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className="text-sm font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitial(review.user?.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">{formatDate(review.createdAt)} に投稿</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <span className="text-sm font-semibold text-emerald-600">{rating} / 5</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Badge
          variant="secondary"
          className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100"
        >
          {chocolateCategory}
        </Badge>
        <span>{chocolateBrand}</span>
        <span>#{chocolateName}</span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">{review.title}</h3>
      <p className="mt-1 text-xs font-medium text-emerald-600">{chocolateName}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{review.content}</p>
    </>
  )

  return (
    <Card className="relative h-full rounded-3xl border-emerald-100 shadow-sm transition-shadow hover:shadow-md">
      {!review.published && (
        <span className="absolute right-6 top-6 inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-500">
          非公開
        </span>
      )}

      {isLinkEnabled ? (
        <Link href={linkHref} className="flex h-full flex-col" aria-label={`${review.title} のレビュー詳細へ`}>
          <CardContent className="p-6">{cardInner}</CardContent>

          <CardFooter className="mt-auto flex items-center justify-between px-6 pb-6 pt-0 text-xs text-gray-400">
            <span>更新日: {formatDate(review.updatedAt)}</span>
          </CardFooter>
        </Link>
      ) : (
        <>
          <CardContent className="p-6">{cardInner}</CardContent>

          <CardFooter className="flex items-center justify-between px-6 pb-6 pt-0 text-xs text-gray-400">
            <span>更新日: {formatDate(review.updatedAt)}</span>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
