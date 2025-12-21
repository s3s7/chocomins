'use client'

import { SortValue } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation'

const sortOptions: { label: string; value: SortValue }[] = [
  { label: '名前（昇順）', value: 'name-asc' },
  { label: '名前（降順）', value: 'name-desc' },
  { label: '作成日（新しい順）', value: 'createdAt-desc' },
  { label: '作成日（古い順）', value: 'createdAt-asc' },
]

export function SortForm({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectId = 'admin-user-sort'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', e.target.value)
    router.replace(`/admin/users?${params.toString()}`)
  }

  return (
    <div>
      <label htmlFor={selectId} className="mr-2 font-medium">
        並び替え：
      </label>
      <select
        id={selectId}
        name="sort"
        value={currentSort}
        onChange={handleChange}
        className="rounded border px-2 py-1"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
