'use client'

import { Button } from '@/components/ui/button'
import { ChocolateWithUser } from '@/types'
import { EditChocolateModal } from './edit-chocolate-modal'
import { Role } from '@prisma/client'
import { deleteChocolate } from '@/app/actions/chocolate/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useState, useTransition } from 'react'

type ChocolateItemProps = {
  chocolate: ChocolateWithUser
  currentUserId: string
  currentUserRole: string
}

export function ChocolateItem({
  chocolate,
  currentUserId,
  currentUserRole,
}: ChocolateItemProps) {
  const [editing, setEditing] = useState(false)

  const isOwner = chocolate.userId === currentUserId
  const isAdmin = currentUserRole === Role.ADMIN

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
      <li className="space-y-2 rounded border p-4">
        <h3 className="text-lg font-semibold">{chocolate.title}</h3>
        <p className="text-sm text-gray-600">
          by {chocolate.user?.name ?? '匿名'} /{' '}
          <span suppressHydrationWarning>
            {new Date(chocolate.createdAt).toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-600">ミント感: {chocolate.mintiness}</p>
        <p>{chocolate.content}</p>

        {(isOwner || isAdmin) && (
          <div className="mt-2 flex gap-2">
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
