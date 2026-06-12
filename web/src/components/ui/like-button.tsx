'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/app/actions/like/toggle'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type LikeButtonProps = {
  reviewId: string
  initialLikeCount: number
  initialIsLiked: boolean
  isLoggedIn: boolean
}

export function LikeButton({
  reviewId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!isLoggedIn) {
      toast.error('いいねするにはログインしてください')
      return
    }

    const nextIsLiked = !isLiked
    setIsLiked(nextIsLiked)
    setLikeCount((prev) => prev + (nextIsLiked ? 1 : -1))

    startTransition(async () => {
      const result = await toggleLike(reviewId)
      if (!result.isSuccess) {
        setIsLiked(isLiked)
        setLikeCount(likeCount)
        toast.error('操作に失敗しました')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        isLiked
          ? 'border-pink-300 bg-pink-50 text-pink-500 hover:bg-pink-100'
          : 'border-gray-200 bg-white text-gray-500 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-400',
        isPending && 'opacity-60',
      )}
    >
      <Heart
        className={cn('h-4 w-4', isLiked && 'fill-pink-500 text-pink-500')}
      />
      <span>{likeCount}</span>
    </button>
  )
}
