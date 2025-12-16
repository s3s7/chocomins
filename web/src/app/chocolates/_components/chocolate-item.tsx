'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Chocolate, Role } from '@prisma/client'
import { EditChocolateModal } from './edit-chocolate-modal'
import { deleteChocolate } from '@/app/actions/chocolate/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useState, useTransition } from 'react'

type ChocolateItemProps = {
  chocolate: Chocolate
  currentUserRole: string
}

export function ChocolateItem({
  chocolate,
  currentUserRole,
}: ChocolateItemProps) {
  const [editing, setEditing] = useState(false)


  const isAdmin = currentUserRole === Role.ADMIN

  const cacaoPercentText =
    chocolate.cacaoPercent != null
      ? `${chocolate.cacaoPercent.toString()}%`
      : '-'

  const [isPending, startTransition] = useTransition()
  const handleDelete = () => {
    const confirmDelete = window.confirm('本当にこの投稿を削除しますか？')
    if (!confirmDelete) return

    const formData = new FormData()
    formData.append('chocolateId', chocolate.id)

    startTransition(async () => {
      try {
        const result = await deleteChocolate(formData)
        if (result.isSuccess) {
          toast.success('投稿を削除しました！')
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
            <h3 className="text-lg font-semibold">{chocolate.name}</h3>
            <p className="text-xs text-gray-500">
              作成日:{' '}
              <span suppressHydrationWarning>
                {new Date(chocolate.createdAt).toLocaleString()}
              </span>
            </p>
          </div>
          <div className="text-right text-sm space-y-2">
            <p>ブランドID: {chocolate.brandId ?? '未設定'}</p>
            <p>カテゴリID: {chocolate.categoryId ?? '未設定'}</p>
          </div>
        </div>

        <p className="whitespace-pre-line text-sm text-gray-700">
          {chocolate.description || '説明はありません'}
        </p>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-500">カカオ含有率</dt>
            <dd>{cacaoPercentText}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ミント入り</dt>
            <dd>{chocolate.hasMint ? 'あり' : 'なし'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ステータス</dt>
            <dd>{chocolate.status}</dd>
          </div>
          <div>
            <dt className="text-gray-500">価格</dt>
            <dd>{chocolate.price != null ? `${chocolate.price}円` : '未設定'}</dd>
          </div>
        </dl>

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

      <EditChocolateModal
        key={editing ? 'editing' : 'closed'}
        chocolate={chocolate}
        open={editing}
        onCloseAction={() => setEditing(false)}
      />
    </>
  )
}
