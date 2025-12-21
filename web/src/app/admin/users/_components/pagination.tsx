'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Props = {
  currentPage: number
  totalCount: number
  perPage: number
}

export function Pagination({ currentPage, totalCount, perPage }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const totalPages = Math.ceil(totalCount / perPage)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  // ページ数が1以下なら表示しない
  if (totalPages <= 1) return null

  // ページ番号を計算（例: 最大5ページ表示）
  const pagesToShow = 5
  const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2))
  const endPage = Math.min(totalPages, startPage + pagesToShow - 1)
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="flex justify-center items-center gap-2 pt-4 flex-wrap">
      <button
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="rounded border px-3 py-1 disabled:opacity-50"
      >
        前へ
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`rounded border px-3 py-1 ${
            page === currentPage ? 'bg-blue-600 text-white' : ''
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="rounded border px-3 py-1 disabled:opacity-50"
      >
        次へ
      </button>
    </div>
  )
}
