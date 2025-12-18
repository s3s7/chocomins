'use client'

import { Button } from '@/components/ui/button'
import { Brand, Role } from '@prisma/client'
import { deleteBrand } from '@/app/actions/brand/delete'
import { EditBrandModal } from './edit-brand-modal'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useState,useTransition } from 'react'

type BrandItemProps = {
  brand: Brand
  currentUserRole: string
}

export function BrandItem({ brand, currentUserRole }: BrandItemProps) {
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentUserRole === Role.ADMIN
  const [editing, setEditing] = useState(false)

  const handleDelete = () => {
    const confirmDelete = window.confirm('本当にこのブランドを削除しますか？')
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('brandId', brand.id)

    startTransition(async () => {
      try {
        const result = await deleteBrand(formData)
        if (result.isSuccess) {
          toast.success('ブランドを削除しました！')
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
    <li className="space-y-3 rounded border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{brand.name}</h3>
          <p className="text-xs text-gray-500">
            作成日:{' '}
            <span suppressHydrationWarning>
              {new Date(brand.createdAt).toLocaleString()}
            </span>
          </p>
        </div>
        <div className="text-right text-sm space-y-2">
          <p>国名: {brand.country ?? '未設定'}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setEditing(true)}>
              編集
            </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? '削除中...' : '削除'}
          </Button>
        </div>
      )}
    </li>
       <EditBrandModal
            key={editing ? 'editing' : 'closed'}
            brand={brand}
            open={editing}
            onCloseAction={() => setEditing(false)}
          />
        </>
  )
}


