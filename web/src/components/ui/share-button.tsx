'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { FaXTwitter } from 'react-icons/fa6'

interface ShareButtonProps {
  url: string
  title: string
  showCopyButton?: boolean
  showNativeShare?: boolean
  showXButton?: boolean
  className?: string
}

export default function ShareButton({
  url,
  title,
  showCopyButton = true,
  showNativeShare = true,
  showXButton = true,
  className,
}: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  // urlが相対だった場合に絶対URLに寄せる（保険）
  const absoluteUrl = useMemo(() => {
    try {
      return new URL(
        url,
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://example.com',
      ).toString()
    } catch {
      return url
    }
  }, [url])

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: title,
        url: absoluteUrl,
      })
    } catch {
      // ユーザーキャンセル等もここに入るので握りつぶしでOK
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl)
      setShowCopiedMessage(true)
      setTimeout(() => setShowCopiedMessage(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = absoluteUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
      } catch {}
      document.body.removeChild(textArea)

      setShowCopiedMessage(true)
      setTimeout(() => setShowCopiedMessage(false), 2000)
    }
  }

  const handleShareOnX = () => {
    const intent = new URL('https://x.com/intent/post')
    intent.searchParams.set('text', title)
    intent.searchParams.set('url', absoluteUrl)

    const opened = window.open(
      intent.toString(),
      '_blank',
      'noopener,noreferrer',
    )
    if (!opened) {
      // ポップアップブロック対策
      window.location.href = intent.toString()
    }
  }

  return (
    <div className={cn('flex gap-4', className)}>
      {showCopyButton && (
        <button
          onClick={handleCopyUrl}
          className="group text-muted-foreground hover:text-foreground relative inline-flex items-center gap-2 transition-colors"
          aria-label="Copy URL to clipboard"
          type="button"
        >
          {showCopiedMessage && (
            <span className="bg-background absolute -top-8 left-1/2 -translate-x-1/2 rounded border px-2 py-1 text-sm whitespace-nowrap">
              URLをコピーしました
            </span>
          )}
          {/* アイコン等 */}
          Copy
        </button>
      )}

      {showNativeShare && canShare && (
        <button
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          aria-label="Share article"
          type="button"
        >
          Share
        </button>
      )}

      {showXButton && (
        <button
          onClick={handleShareOnX}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          aria-label="Share on X"
          type="button"
        >
          <FaXTwitter className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
