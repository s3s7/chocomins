'use client'

import { useEffect, startTransition, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateBrand } from '@/app/actions/brand/update'
import { Brand } from '@prisma/client'
import { EditBrandInput, editBrandSchema } from '@/schemas/brand'
import { getErrorMessage } from '@/lib/error-messages'
import { ImgEditor } from '@/lib/img-editor'

const imgEditor = new ImgEditor({ endpoint: '/api/brands/image-upload' })
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BRAND_IMAGE_BUCKET = 'review-images'

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

type Props = {
  brand: Brand
  open: boolean
  onCloseAction: () => void
}

export function EditBrandModal({ brand, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateBrand, null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(
    brand.imagePath ?? null,
  )
  const [imageUploading, setImageUploading] = useState(false)
  const [removeImage, setRemoveImage] = useState(false)

  const existingImageUrl = useMemo(
    () => buildBrandImageUrl(brand.imagePath),
    [brand.imagePath],
  )
  const computedImagePathUrl = useMemo(
    () => (imagePath ? buildBrandImageUrl(imagePath) : null),
    [imagePath],
  )
  const shownPreview =
    imagePreviewUrl ??
    (removeImage ? null : (computedImagePathUrl ?? existingImageUrl))

  const form = useForm<EditBrandInput>({
    resolver: zodResolver(editBrandSchema),
    defaultValues: {
      brandId: brand.id,
      name: brand.name,
      country: brand.country ?? undefined,
    },
  })

  const onSubmit = async (values: EditBrandInput) => {
    if (imageUploading) return

    const formData = new FormData()
    formData.append('brandId', values.brandId)
    formData.append('name', values.name)
    if (values.country) formData.append('country', values.country)

    if (removeImage) {
      formData.append('imagePath', '')
    } else if (imageFile) {
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        toast.error('JPEG/PNG/WebPのみ対応です')
        return
      }
      if (imageFile.size > MAX_BYTES) {
        toast.error('画像サイズは5MB以下にしてください')
        return
      }

      setImageUploading(true)
      try {
        const { path } = await imgEditor.uploadImage(imageFile)
        setImagePath(path)
        formData.append('imagePath', path)
      } catch (e) {
        console.error(e)
        toast.error('画像アップロードに失敗しました')
        return
      } finally {
        setImageUploading(false)
      }
    }

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      toast.success('メーカー・店舗が更新されました！')
      form.reset()
      setImageFile(null)
      setRemoveImage(false)
      setImagePath(null)
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
      onCloseAction()
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, onCloseAction, imagePreviewUrl])

  useEffect(() => {
    if (!open) return

    form.reset({
      brandId: brand.id,
      name: brand.name,
      country: brand.country ?? undefined,
    })
    setImageFile(null)
    setRemoveImage(false)
    setImagePath(brand.imagePath ?? null)
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, brand.id])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メーカー・店舗の編集</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('brandId')} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メーカー・店舗名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="メーカー・店舗名を入力"
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>画像（任意・1枚）</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isPending || imageUploading}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] ?? null
                    e.currentTarget.value = ''
                    setImageFile(file)
                    setRemoveImage(false)
                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
                    setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                />
              </FormControl>
              <FormDescription>JPEG/PNG/WebP、5MBまで</FormDescription>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    isPending ||
                    imageUploading ||
                    (!imagePreviewUrl && !imagePath && !brand.imagePath)
                  }
                  onClick={() => {
                    setImageFile(null)
                    setImagePath(null)
                    setRemoveImage(true)
                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
                    setImagePreviewUrl(null)
                  }}
                >
                  画像を削除
                </Button>
                {imageUploading && (
                  <span className="text-xs text-gray-500">
                    画像アップロード中...
                  </span>
                )}
              </div>

              {shownPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownPreview}
                  alt="ブランド画像プレビュー"
                  className="mt-2 max-h-60 w-full rounded-md border object-contain"
                />
              )}
            </FormItem>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCloseAction}>
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isPending || imageUploading}
                className="bg-[#CFE6DA] text-gray-800 hover:bg-[#b7dacf]"
              >
                {isPending || imageUploading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
