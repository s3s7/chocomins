'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Brand, Role } from '@prisma/client'
import { deleteBrand } from '@/app/actions/brand/delete'
import { EditBrandModal } from './edit-brand-modal'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useMemo, useState, useTransition } from 'react'

type BrandItemProps = {
  brand: Brand
  currentUserRole: string
}

export function BrandItem({ brand, currentUserRole }: BrandItemProps) {
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentUserRole === Role.ADMIN
  const [editing, setEditing] = useState(false)
  const placeholderImageUrl =
    'https://dummy.kobeya.com/?width=300&height=200&bg=c3c88d&color=373436&text=No%20Image&_=1769497540044'
  const createdAtText = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(brand.createdAt))
    } catch {
      return brand.createdAt.toString()
    }
  }, [brand.createdAt])

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      '本当にこのメーカー・店舗を削除しますか？',
    )
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('brandId', brand.id)

    startTransition(async () => {
      try {
        const result = await deleteBrand(formData)
        if (result.isSuccess) {
          toast.success('メーカー・店舗を削除しました！')
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
      <li>
        <Card className="h-full rounded-3xl border-emerald-100 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {brand.name}
                </h3>
              </div>
              {/* <p className="text-sm text-gray-500">
                国名：{brand.country ?? '未設定'}
              </p> */}
              <p className="text-xs text-gray-500" suppressHydrationWarning>
                作成日：{createdAtText}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-[#c3c88d]">
              <img
                src={placeholderImageUrl}
                alt="No Image"
                className="h-48 w-full object-cover"
                loading="lazy"
              />
            </div>
          </CardContent>

          {isAdmin && (
            <CardFooter className="flex gap-2 px-6 pb-6 pt-0">
              <Button size="sm" onClick={() => setEditing(true)} className="flex-1">
                編集
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? '削除中...' : '削除'}
              </Button>
            </CardFooter>
          )}
        </Card>
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
