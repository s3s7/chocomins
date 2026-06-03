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
  const [absoluteUrl, setAbsoluteUrl] = useState(url)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
    try {
      setAbsoluteUrl(new URL(url, window.location.origin).toString())
    } catch {
      setAbsoluteUrl(url)
    }
  }, [url])

  // X共有用のintent URL（<a>で使う）
  const xIntentUrl = useMemo(() => {
    const intent = new URL('https://x.com/intent/post')
    intent.searchParams.set('text', `${title}\n#ちょこみんず  #チョコミント`)
    intent.searchParams.set('url', absoluteUrl)
    return intent.toString()
  }, [title, absoluteUrl])

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
        <a
          href={xIntentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          aria-label="Share on X"
        >
          <FaXTwitter className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
