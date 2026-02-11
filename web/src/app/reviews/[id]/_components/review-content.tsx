'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ReviewWithUser } from '@/types'
import Map from '@/components/ui/map'
import { Button } from '@/components/ui/button'
import { deleteReview } from '@/app/actions/review/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { Role } from '@prisma/client'
import { EditReviewModal } from '../../_components/edit-review-modal'
import { ImgEditor } from '@/lib/img-editor'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import ShareButton from '@/components/ui/share-button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const clampScore = (value?: number | null) =>
  typeof value === 'number' ? Math.max(0, Math.min(5, value)) : 0

const ScoreStars = ({
  label,
  value,
  variant = 'panel',
}: {
  label: string
  value?: number | null
  variant?: 'panel' | 'chip'
}) => {
  const clamped = clampScore(value)
  const stars = Array.from({ length: 5 })
  const starIcons = stars.map((_, index) => (
    <Star
      key={`${label}-${index}`}
      className={cn(
        'h-4 w-4 text-emerald-200',
        index < clamped && 'fill-emerald-500 text-emerald-500',
      )}
    />
  ))

  if (variant === 'chip') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700">
        <span>{label}</span>
        <div className="flex items-center gap-0.5">{starIcons}</div>
        <span className="text-emerald-900">
          {typeof value === 'number' ? `${value}/5` : '未評価'}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-1">
        {starIcons}
        <span className="ml-2 text-sm font-semibold text-emerald-900">
          {typeof value === 'number' ? `${value} / 5` : '未評価'}
        </span>
      </div>
    </div>
  )
}

const imgEditor = new ImgEditor()

const buildReviewImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null
  if (/^https?:\/\//.test(imagePath)) return imagePath
  const normalizedPath = imagePath.startsWith('/')
    ? imagePath.slice(1)
    : imagePath
  return imgEditor.getPublicUrl(normalizedPath)
}

const getAvatarColor = (seed: string) => {
  if (!seed) return '#1f2937'
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 45%)`
}

const getInitial = (name?: string | null) => name?.trim()?.[0] ?? '？'

const placeholderImageUrl = '/no_image.webp'

type ReviewContentProps = {
  review: ReviewWithUser
  currentUserId: string
  currentUserRole: string
}

export function ReviewContent({
  review,
  currentUserId,
  currentUserRole,
}: ReviewContentProps) {
  const lat = review.place?.lat ?? null
  const lng = review.place?.lng ?? null
  const address = review.place?.address ?? null
  const placeName = review.place?.name ?? null

  const locationTexts = [address, placeName].filter(
    (text): text is string => typeof text === 'string' && text.length > 0,
  )
  const locationLabel = locationTexts.join(' / ')

  const [editing, setEditing] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const router = useRouter()

  const isOwner = review.userId === currentUserId
  const isAdmin = currentUserRole === Role.ADMIN

  const imageUrl = buildReviewImageUrl(review.imagePath) ?? placeholderImageUrl
  const shareUrl = `/reviews/${review.id}`
  const chocolateNameFromRelation =
    review.chocolate?.name ?? 'チョコレート未登録'
  const chocolateBrand =
    review.brand?.name ??
    review.chocolate?.brand?.name ??
    'メーカー・店舗未設定'
  const shareTitle =
    review.chocolateName?.length > 0
      ? review.chocolateName
      : `${chocolateBrand} ${chocolateNameFromRelation}`.trim()
  const chocolateHeading =
    review.chocolateName?.length > 0
      ? review.chocolateName
      : chocolateNameFromRelation
  const chocolateCategory = review.chocolate?.category?.name ?? 'カテゴリ未設定'
  const userName = review.user?.name ?? '匿名'
  const avatarColor = useMemo(() => getAvatarColor(userName), [userName])
  const createdAtLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(review.createdAt))
    } catch {
      return review.createdAt.toString()
    }
  }, [review.createdAt])

  const handleDelete = () => {
    const confirmDelete = window.confirm('本当にこの投稿を削除しますか？')
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('reviewId', review.id)

    startTransition(async () => {
      try {
        const result = await deleteReview(formData)
        if (result.isSuccess) {
          toast.success('投稿を削除しました！')
          router.push('/reviews')
        } else if (result.errorCode) {
          toast.error(getErrorMessage(result.errorCode))
        }
      } catch (err) {
        toast.error('削除中に予期せぬエラーが発生しました')
        console.error(err)
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            <span className="mr-3 block text-sm font-semibold text-gray-500 sm:inline">
              {chocolateBrand}
            </span>
            <br></br>
            {chocolateHeading}
          </h1>
         
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-50 bg-emerald-50/40 p-3 text-sm text-gray-700">
            
            <div className="flex flex-wrap items-center gap-2">
              <ScoreStars label="ミント感" value={review.mintiness} variant="chip" />
              <ScoreStars label="チョコ感" value={review.chocoRichness} variant="chip" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 md:flex md:space-x-6">
        <div className="w-full md:w-1/2">
          <div className="h-[250px] w-full overflow-hidden rounded-xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${shareTitle}の投稿画像`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-sm font-semibold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {getInitial(userName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500" suppressHydrationWarning>
                {createdAtLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full md:mt-0 md:w-1/2">
          <div className="rounded-xl border border-emerald-100 bg-white p-2 sm:p-4 shadow">
            {typeof lat === 'number' && typeof lng === 'number' ? (
              <Map lat={lat} lng={lng} />
            ) : (
              <div className="flex h-[320px] w-full flex-col items-center justify-center rounded-2xl bg-emerald-50 text-sm text-emerald-700">
                位置情報が未登録です
              </div>
            )}
            {locationLabel.length > 0 && (
              <p className="mt-3 text-xs text-gray-600">{locationLabel}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="font-semibold text-gray-800">レビュー本文</p>
        <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-800">
          {review.content}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center">
        <ShareButton
          url={shareUrl}
          title={shareTitle}
          showCopyButton={false}
          showNativeShare={false}
          className="sm:ml-auto"
        />
      </div>

      {(isOwner || isAdmin) && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              編集
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除'}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href="/reviews"
          className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
        >
          みんなのレビューに戻る
        </Link>
      </div>

      <EditReviewModal
        key={editing ? 'editing' : 'closed'}
        review={review}
        open={editing}
        onCloseAction={() => setEditing(false)}
      />
    </>
  )
}
