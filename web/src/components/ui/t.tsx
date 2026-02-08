'use client'

import * as React from 'react'

type Props = {
  imageUrl: string
  children: React.ReactNode
  /** どれくらい見えたら発火するか（0〜1） */
  threshold?: number
  /** 早め/遅めに発火したい時 */
  rootMargin?: string
  /** fixed にしたいなら true */
  fixed?: boolean
}

export function BodyBgOnView({
  imageUrl,
  children,
  threshold = 0.35,
  rootMargin = '0px 0px -20% 0px',
  fixed = true,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const prev = React.useRef<{
    backgroundImage: string
    backgroundSize: string
    backgroundPosition: string
    backgroundRepeat: string
    backgroundAttachment: string
    backgroundColor: string
  } | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const body = document.body

    // 元の状態を保存（初回だけ）
    if (!prev.current) {
      prev.current = {
        backgroundImage: body.style.backgroundImage,
        backgroundSize: body.style.backgroundSize,
        backgroundPosition: body.style.backgroundPosition,
        backgroundRepeat: body.style.backgroundRepeat,
        backgroundAttachment: body.style.backgroundAttachment,
        backgroundColor: body.style.backgroundColor,
      }
    }

    const applyBg = () => {
      body.style.backgroundImage = `url("${imageUrl}")`
      body.style.backgroundSize = 'cover'
      body.style.backgroundPosition = 'center'
      body.style.backgroundRepeat = 'no-repeat'
      body.style.backgroundAttachment = fixed ? 'fixed' : 'scroll'
      // 必要ならベース色（画像が読み込まれる前の色）
      body.style.backgroundColor = '#ffffff'
    }

    const restoreBg = () => {
      if (!prev.current) return
      body.style.backgroundImage = prev.current.backgroundImage
      body.style.backgroundSize = prev.current.backgroundSize
      body.style.backgroundPosition = prev.current.backgroundPosition
      body.style.backgroundRepeat = prev.current.backgroundRepeat
      body.style.backgroundAttachment = prev.current.backgroundAttachment
      body.style.backgroundColor = prev.current.backgroundColor
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) applyBg()
        else restoreBg()
      },
      { threshold, rootMargin },
    )

    io.observe(el)
    return () => {
      io.disconnect()
      restoreBg()
    }
  }, [imageUrl, threshold, rootMargin, fixed])

  return <div ref={ref}>{children}</div>
}
