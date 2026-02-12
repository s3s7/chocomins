'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Brand, Role } from '@prisma/client'
import { deleteBrand } from '@/app/actions/brand/delete'
import { EditBrandModal } from './edit-brand-modal'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'

const BRAND_IMAGE_BUCKET = 'review-images'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_LOCAL_SUPABASE =
  SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost')

const buildBrandImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null
  if (/^https?:\/\//.test(imagePath)) return imagePath

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  const normalizedBase = supabaseUrl.endsWith('/')
    ? supabaseUrl.slice(0, -1)
    : supabaseUrl

  const normalizedPath = imagePath.startsWith('/')
    ? imagePath.slice(1)
    : imagePath

  return `${normalizedBase}/storage/v1/object/public/${BRAND_IMAGE_BUCKET}/${normalizedPath}`
}

type BrandItemProps = {
  brand: Brand
  currentUserRole: string
}

export function BrandItem({
  brand,
  currentUserRole,
}: BrandItemProps) {
  const [isPending, startTransition] = useTransition()
  const isAdmin = currentUserRole === Role.ADMIN
  const [editing, setEditing] = useState(false)
  const placeholderImageUrl = '/no_image.webp'
  const brandImageUrl = useMemo(
    () => buildBrandImageUrl(brand.imagePath) ?? placeholderImageUrl,
    [brand.imagePath, placeholderImageUrl],
  )
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
    if (!isAdmin) return
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
              <Image
                src={brandImageUrl}
                alt={brand.imagePath ? `${brand.name}の画像` : 'No Image'}
                width={600}
                height={400}
                className="h-48 w-full object-cover"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 33vw"
                unoptimized={IS_LOCAL_SUPABASE}
              />
            </div>
          </CardContent>

          {isAdmin && (
            <CardFooter className="flex gap-2 px-6 pt-0 pb-6">
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                className="flex-1"
              >
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
