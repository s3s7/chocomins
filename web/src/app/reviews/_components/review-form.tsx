'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState, useEffect, useState, startTransition } from 'react'
import { createReview } from '@/app/actions/review/create'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReviewInput, reviewSchema } from '@/schemas/review'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/error-messages'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import {
  PlaceAutocompleteField,
  type PlaceSelection,
} from './place-autocomplete-field'
import { ImgEditor } from '@/lib/img-editor'

type BrandOption = {
  id: string
  name: string
}

const imgEditor = new ImgEditor()

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const ReviewForm = () => {
  const [state, dispatch, isPending] = useActionState(createReview, null)
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([])
  const [brandLoading, setBrandLoading] = useState(true)
  const [placeSelection, setPlaceSelection] = useState<PlaceSelection>({})
  const router = useRouter()

  // 画像まわり
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      chocolateName: '',
      content: '',
      mintiness: 0,
      chocoRichness: 0,
      brandId: '',
      address: '',
      imagePath: undefined,
    },
  })

  // プレビューURL後始末
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  const onSubmit = async (values: ReviewInput) => {
    // 画像を選んでいる場合：送信前にアップロードして path を確定させる
    let pathToSend: string | null = imagePath

    if (imageFile && !pathToSend) {
      // client side validation
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
    formData.append('chocolateName', values.chocolateName)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
    formData.append('chocoRichness', String(values.chocoRichness))
    formData.append('brandId', values.brandId)

    if (placeSelection.googlePlaceId) {
      formData.append('googlePlaceId', placeSelection.googlePlaceId as string)
    }
    if (placeSelection.placeName) {
      formData.append('placeName', placeSelection.placeName as string)
    }
    const addressToSend = placeSelection.address ?? values.address
    if (typeof addressToSend === 'string' && addressToSend.length > 0) {
      formData.append('address', addressToSend)
    }
    if (placeSelection.lat) formData.append('lat', placeSelection.lat as string)
    if (placeSelection.lng) formData.append('lng', placeSelection.lng as string)

    if (pathToSend) {
      formData.append('imagePath', pathToSend)
    }

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

      toast.success('投稿が完了しました！')
      router.push('/reviews')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, form, router])

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch brands')
        const data = await response.json()
        setBrandOptions(data.brands ?? [])
      } catch (error) {
        console.error('Failed to load brands', error)
        toast.error('メーカー・店舗一覧の取得に失敗しました')
      } finally {
        setBrandLoading(false)
      }
    }
    fetchBrands()
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border p-4"
      >
        <FormField
          control={form.control}
          name="chocolateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>チョコレート名</FormLabel>
              <FormControl>
                <Input
                  placeholder="チョコレート名を入力"
                  className="!bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PlaceAutocompleteField
          form={form}
          onSelectionChange={setPlaceSelection}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メーカー・店舗</FormLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value === '' ? undefined : field.value}
                disabled={
                  isPending || brandLoading || brandOptions.length === 0
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        brandLoading ? '取得中...' : '選択してください'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brandOptions.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-2 text-sm">
                      メーカー・店舗が登録されていません
                    </div>
                  ) : (
                    brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                登録済みのメーカー・店舗から選択してください（必須）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>本文</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="本文を入力"
                  className="bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mintiness"
          render={({ field }) => {
            const mintinessValue = field.value ?? 0
            return (
              <FormItem>
                <FormLabel>ミント感</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    name={field.name}
                    value={mintinessValue}
                    readOnly
                    ref={field.ref}
                    className="sr-only"
                  />
                </FormControl>
                <div className="flex flex-col items-center gap-3">
                  <Rating
                    aria-label="ミント感"
                    value={mintinessValue}
                    onValueChange={field.onChange}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingButton key={index} />
                    ))}
                  </Rating>
                  <span className="text-muted-foreground text-xs">
                    ミント感: {mintinessValue}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="chocoRichness"
          render={({ field }) => {
            const chocoValue = field.value ?? 0
            return (
              <FormItem>
                <FormLabel>チョコ感</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    name={field.name}
                    value={chocoValue}
                    readOnly
                    ref={field.ref}
                    className="sr-only"
                  />
                </FormControl>
                <div className="flex flex-col items-center gap-3">
                  <Rating
                    aria-label="チョコ感"
                    value={chocoValue}
                    onValueChange={field.onChange}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingButton key={index} />
                    ))}
                  </Rating>
                  <span className="text-muted-foreground text-xs">
                    チョコ感: {chocoValue}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* 画像入力 */}
        <FormItem>
          <FormLabel>画像（任意・1枚）</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              className="!bg-white"
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

        <Button
          type="submit"
          disabled={isPending || imageUploading}
          className="bg-[#8FCBAB] text-slate-900 hover:bg-[#7BB898]"
        >
          {isPending
            ? '投稿中...'
            : imageUploading
              ? '画像アップロード中...'
              : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
