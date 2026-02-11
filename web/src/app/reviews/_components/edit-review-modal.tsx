'use client'

import { useEffect, useMemo, useState, startTransition } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateReview } from '@/app/actions/review/update'
import { ReviewWithUser } from '@/types'
import {
  EditReviewInput,
  ReviewInput,
  editReviewSchema,
} from '@/schemas/review'
import { getErrorMessage } from '@/lib/error-messages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import {
  PlaceAutocompleteField,
  type PlaceSelection,
} from './place-autocomplete-field'
import { ImgEditor } from '@/lib/img-editor'

type Props = {
  review: ReviewWithUser
  open: boolean
  onCloseAction: () => void
}

type ChocolateOption = {
  id: string
  name: string
}

const imgEditor = new ImgEditor()
const NO_CHOCOLATE_VALUE = '__NO_CHOCOLATE__'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const REVIEW_IMAGE_BUCKET = 'review-images'
const buildReviewImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null
  if (/^https?:\/\//.test(imagePath)) return imagePath

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  const base = supabaseUrl.endsWith('/')
    ? supabaseUrl.slice(0, -1)
    : supabaseUrl
  const normalizedPath = imagePath.startsWith('/')
    ? imagePath.slice(1)
    : imagePath

  return `${base}/storage/v1/object/public/${REVIEW_IMAGE_BUCKET}/${normalizedPath}`
}

export function EditReviewModal({ review, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateReview, null)
  const [chocolateOptions, setChocolateOptions] = useState<ChocolateOption[]>(
    [],
  )
  const [chocolateLoading, setChocolateLoading] = useState(true)
  const [placeSelection, setPlaceSelection] = useState<PlaceSelection>({})

  // --- 画像まわり ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imagePath, setImagePath] = useState<string | null>(
    review.imagePath ?? null,
  )
  const [imageUploading, setImageUploading] = useState(false)
  const [removeImage, setRemoveImage] = useState(false)

  const existingImageUrl = useMemo(
    () => buildReviewImageUrl(review.imagePath),
    [review.imagePath],
  )
  const shownPreview =
    imagePreviewUrl ??
    (removeImage ? null : (buildReviewImageUrl(imagePath) ?? existingImageUrl))

  const form = useForm<EditReviewInput>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      reviewId: review.id,
      title: review.title,
      content: review.content,
      mintiness: review.mintiness,
      chocoRichness: review.chocoRichness ?? 0,
      chocolateId: review.chocolateId ?? undefined,
      address: '',
      // imagePath はフォーム入力としては持たせなくてもOK（FormDataで送る）
    },
  })

  // open が切り替わった時に状態を初期化（モーダル再利用対策）
  useEffect(() => {
    if (!open) return

    setImageFile(null)
    setRemoveImage(false)
    setImagePath(review.imagePath ?? null)

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImagePreviewUrl(null)

    // placeSelection なども必要なら初期化
    setPlaceSelection({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, review.id])

  // プレビューURL後始末
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  const onSubmit = async (values: EditReviewInput) => {
    const formData = new FormData()
    formData.append('reviewId', values.reviewId)
    formData.append('title', values.title)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
    formData.append('chocoRichness', String(values.chocoRichness))
    if (values.chocolateId) {
      formData.append('chocolateId', values.chocolateId)
    }

    if (placeSelection.googlePlaceId) {
      formData.append('googlePlaceId', placeSelection.googlePlaceId)
    }
    if (placeSelection.placeName) {
      formData.append('placeName', placeSelection.placeName)
    }
    const addressToSend = placeSelection.address ?? values.address
    if (addressToSend) {
      formData.append('address', addressToSend)
    }
    if (placeSelection.lat) {
      formData.append('lat', placeSelection.lat)
    }
    if (placeSelection.lng) {
      formData.append('lng', placeSelection.lng)
    }

    // --- 画像の扱い ---
    // 1) 削除指定がある → 空文字を送る（サーバ側で null 扱い）
    if (removeImage) {
      formData.append('imagePath', '')
    } else {
      // 2) 新しいファイルを選んでいる → 送信前にアップロードして path を確定
      if (imageFile && !imagePath) {
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
      } else if (imageFile && imagePath) {
        // すでに確定済みならそのまま送る
        formData.append('imagePath', imagePath)
      }
      // 3) 何も変えていない場合は送らない（＝現状維持）
    }

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      toast.success('投稿が更新されました！')
      form.reset()
      setPlaceSelection({})
      onCloseAction()
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, onCloseAction])

  useEffect(() => {
    const fetchChocolates = async () => {
      try {
        const response = await fetch('/api/chocolates', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch chocolates')
        const data = await response.json()
        setChocolateOptions(data.chocolates ?? [])
      } catch (error) {
        console.error('Failed to load chocolates', error)
        toast.error('チョコレート一覧の取得に失敗しました')
      } finally {
        setChocolateLoading(false)
      }
    }

    fetchChocolates()
  }, [])

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿の編集</DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('reviewId')} />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="タイトルを入力" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PlaceAutocompleteField
              form={form as unknown as UseFormReturn<ReviewInput>}
              onSelectionChange={setPlaceSelection}
            />

            <FormField
              control={form.control}
              name="chocolateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>チョコレート</FormLabel>
                  <Select
                    name={field.name}
                    onValueChange={(value) =>
                      field.onChange(
                        value === NO_CHOCOLATE_VALUE ? undefined : value,
                      )
                    }
                    value={field.value ?? NO_CHOCOLATE_VALUE}
                    disabled={isPending || chocolateLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            chocolateLoading ? '取得中...' : '選択してください'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CHOCOLATE_VALUE}>紐付けなし</SelectItem>
                      {chocolateOptions.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-2 text-sm">
                          チョコレートが登録されていません
                        </div>
                      ) : (
                        chocolateOptions.map((chocolate) => (
                          <SelectItem key={chocolate.id} value={chocolate.id}>
                            {chocolate.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    登録済みのチョコレートから選択してください
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
                    <Textarea placeholder="本文を入力" rows={4} {...field} />
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

            {/* ✅ 画像入力（編集モーダル用） */}
            <FormItem>
              <FormLabel>画像（任意・1枚）</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isPending || imageUploading}
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] ?? null

                    // 選び直し用に value をクリアしたい場合はここで
                    // e.currentTarget.value = ''

                    setImageFile(file)
                    setRemoveImage(false)
                    setImagePath(null) // 新しい画像が選ばれた → submit時にアップロードする

                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
                    setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                />
              </FormControl>

              <FormDescription>JPEG/PNG/WebP、5MBまで</FormDescription>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isPending ||
                    imageUploading ||
                    (!review.imagePath && !imagePreviewUrl && !imagePath)
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
                <div className="mt-2 overflow-hidden rounded-2xl border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shownPreview}
                    alt="画像プレビュー"
                    className="max-h-[320px] w-full object-contain"
                    loading="lazy"
                  />
                </div>
              )}
            </FormItem>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCloseAction}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isPending || imageUploading}>
                {isPending
                  ? '保存中...'
                  : imageUploading
                    ? '画像アップロード中...'
                    : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
