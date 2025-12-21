'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'

export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue || '')
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams) // 既存のクエリを維持
    if (value) {
      params.set('q', value) // 検索クエリを更新
    } else {
      params.delete('q') // 空なら削除
    }
    router.replace(`${pathname}?${params.toString()}`) // URLを置き換え
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border rounded px-3 py-1"
        placeholder="名前やメールで検索"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm"
      >
        検索
      </button>
    </form>
  )
}
