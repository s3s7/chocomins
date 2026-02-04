'use client'

import { useMemo, useState, useTransition } from 'react'
import { Role } from '@prisma/client'
import { ChocolateWithRelations } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EditChocolateModal } from '../../_components/edit-chocolate-modal'
import { deleteChocolate } from '@/app/actions/chocolate/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ChocolateContentProps = {
  chocolate: ChocolateWithRelations
  currentUserRole: string
  currentUserId: string
}

const placeholderImageUrl = '/no_image.webp'

export function ChocolateContent({
  chocolate,
  currentUserRole,
  currentUserId,
}: ChocolateContentProps) {
  const [editing, setEditing] = useState(false)
  const [isDeleting, startTransition] = useTransition()
  const router = useRouter()

  const isAdmin = currentUserRole === Role.ADMIN
  const isOwner = chocolate.userId === currentUserId && currentUserId.length > 0
  const canManage = isAdmin || isOwner

  const cacaoPercentText =
    chocolate.cacaoPercent != null
      ? `${chocolate.cacaoPercent.toNumber()}%`
      : '-'

  const createdAtText = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(chocolate.createdAt))
    } catch {
      return chocolate.createdAt.toString()
    }
  }, [chocolate.createdAt])

  const handleDelete = () => {
    if (!canManage) return
    const confirmDelete = window.confirm('本当に削除しますか？')
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('chocolateId', chocolate.id)

    startTransition(async () => {
      try {
        const result = await deleteChocolate(formData)
        if (result.isSuccess) {
          toast.success('削除しました')
          router.push('/chocolates')
        } else if (result.errorCode) {
          toast.error(getErrorMessage(result.errorCode))
        }
      } catch (err) {
        toast.error('削除中にエラーが発生しました')
        console.error(err)
      }
    })
  }

  return (
    <>
      <Card className="rounded-3xl border-emerald-100 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {chocolate.name}
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              <p>メーカー：{chocolate.brand?.name ?? '未設定'}</p>
            </div>
            <p className="text-base text-gray-700">
              {chocolate.description || '説明はありません'}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-[#c3c88d]">
            <Image
              src={placeholderImageUrl}
              alt="No Image"
              width={600}
              height={400}
              className="h-60 w-full object-cover"
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">カカオ含有率</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {cacaoPercentText}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">ミント入り</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {chocolate.hasMint ? 'あり' : 'なし'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">作成日</dt>
              <dd className="text-sm text-gray-900" suppressHydrationWarning>
                {createdAtText}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">価格</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {chocolate.price != null ? `${chocolate.price}円` : '未設定'}
              </dd>
            </div>
          </dl>

          {canManage && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                className="bg-[#CFE6DA] text-gray-800 hover:bg-[#b7dacf]"
                onClick={() => setEditing(true)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '削除中…' : '削除'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditChocolateModal
        key={editing ? 'editing' : 'closed'}
        chocolate={{
          ...chocolate,
          cacaoPercent:
            chocolate.cacaoPercent != null
              ? chocolate.cacaoPercent.toNumber()
              : null,
          brandName: chocolate.brand?.name ?? '',
          categoryName: chocolate.category?.name ?? null,
        }}
        open={editing}
        onCloseAction={() => setEditing(false)}
      />
    </>
  )
}
