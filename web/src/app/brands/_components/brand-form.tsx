'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { BrandInput, brandSchema } from '@/schemas/brand'
import { createBrand } from '@/app/actions/brand/create'
import { getErrorMessage } from '@/lib/error-messages'
import { ImgEditor } from '@/lib/img-editor'

const imgEditor = new ImgEditor({ endpoint: '/api/brands/image-upload' })
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const BrandForm = () => {
  const [state, dispatch, isPending] = useActionState(createBrand, null)
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      country: undefined,
      imagePath: undefined,
    },
  })

  const onSubmit = async (values: BrandInput) => {
    let pathToSend: string | null = imagePath

    if (imageFile && !pathToSend) {
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
        pathToSend = path
        setImagePath(path)
      } catch (e) {
        console.error(e)
        toast.error('画像アップロードに失敗しました')
        return
      } finally {
        setImageUploading(false)
      }
    }

    const formData = new FormData()
    formData.append('name', values.name)
    if (values.country) formData.append('country', values.country)
    if (pathToSend) formData.append('imagePath', pathToSend)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return
    if (state.isSuccess) {
      form.reset()
      setImageFile(null)
      setImagePath(null)
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
      toast.success('メーカー・店舗を追加しました！')
      router.push('/brands')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, router, imagePreviewUrl])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border p-4"
      >
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
                setImageFile(file)
                setImagePath(null)
                if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
                setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
              }}
            />
          </FormControl>
          <FormDescription>JPEG/PNG/WebP、5MBまで</FormDescription>
          {imagePreviewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="preview"
              className="mt-2 max-h-60 w-full rounded-md border object-contain"
            />
          )}
        </FormItem>

        {/* <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>国名（任意）</FormLabel>
              <FormControl>
                <Input
                  placeholder="例: Japan, Belgium..."
                  autoComplete="country-name"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button
          type="submit"
          disabled={isPending || imageUploading}
          className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
        >
          {imageUploading
            ? '画像アップロード中...'
            : isPending
              ? '追加中...'
              : '追加'}
        </Button>
      </form>
    </Form>
  )
}
