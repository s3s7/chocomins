'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Chocolate, Role } from '@prisma/client'
import { EditChocolateModal } from './edit-chocolate-modal'
import { deleteChocolate } from '@/app/actions/chocolate/delete'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useMemo, useState, useTransition } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type ChocolateForClient = Omit<Chocolate, 'cacaoPercent'> & {
  cacaoPercent: number | null
  brandName: string
  categoryName: string | null
}

type ChocolateItemProps = {
  chocolate: ChocolateForClient
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
  const placeholderImageUrl =
    'https://dummy.kobeya.com/?width=300&height=200&bg=c3c88d&color=373436&text=No%20Image&_=1769497540044'
  const createdAtText = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(chocolate.createdAt))
    } catch {
      return chocolate.createdAt.toString()
    }
  }, [chocolate.createdAt])

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
      <li>
        <Card className="relative h-full min-h-[420px] rounded-3xl border-emerald-100 shadow-sm">
          <Link
            href={`/chocolates/${chocolate.id}`}
            className="flex h-full flex-col"
            prefetch={false}
            onClick={(e) => {
              if (isPending) {
                e.preventDefault()
              }
            }}
          >
            <CardContent className="flex-grow space-y-4 p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {chocolate.name}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>メーカー：{chocolate.brandName ?? '未設定'}</p>
                  {/* <p>カテゴリ：{chocolate.categoryName ?? '未設定'}</p> */}
                </div>
                <p className="text-sm text-gray-700">
                  説明：
                  {(chocolate.description || '説明はありません').slice(0, 10)}
                  {chocolate.description && chocolate.description.length > 10
                    ? '…'
                    : ''}
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

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">カカオ含有率</dt>
                  <dd className="font-semibold text-gray-900">
                    {cacaoPercentText}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">ミント入り</dt>
                  <dd className="font-semibold text-gray-900">
                    {chocolate.hasMint ? 'あり' : 'なし'}
                  </dd>
                </div>
                <p className="text-xs text-gray-500">
                  作成日：<br></br>
                  <span suppressHydrationWarning>{createdAtText}</span>
                </p>
                <div>
                  <dt className="text-gray-500">価格</dt>
                  <dd className="font-semibold text-gray-900">
                    {chocolate.price != null
                      ? `${chocolate.price}円`
                      : '未設定'}
                  </dd>
                </div>
              </dl>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 px-6 pt-0 pb-6 sm:flex-row">
              {isAdmin && (
                <div className="flex flex-1 gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      setEditing(true)
                    }}
                    className="flex-1"
                  >
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    disabled={isPending}
                    className="flex-1"
                  >
                    {isPending ? '削除中...' : '削除'}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Link>
        </Card>
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
