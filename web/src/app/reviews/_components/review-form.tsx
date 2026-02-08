'use client'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
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
import { ImgEditor } from '@/lib/img-editor'
import {
  PlaceAutocompleteField,
  type PlaceSelection,
} from './place-autocomplete-field'

type ChocolateOption = {
  id: string
  name: string
}

type ReviewFormProps = {
  userId: string
}

export const ReviewForm = ({ userId }: ReviewFormProps) => {
  const [state, dispatch, isPending] = useActionState(createReview, null)
  const [chocolateOptions, setChocolateOptions] = useState<ChocolateOption[]>(
    [],
  )
  const [chocolateLoading, setChocolateLoading] = useState(true)
  const [placeSelection, setPlaceSelection] = useState<PlaceSelection>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const imgEditorRef = useRef<ImgEditor | null>(null)
  const router = useRouter()

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      content: '',
      mintiness: 0,
      chocolateId: '',
      address: '',
      imagePath: '',
    },
  })

  const updatePreview = useCallback((nextPreview: string | null) => {
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return nextPreview
    })
  }, [])

  const ensureImgEditor = useCallback(() => {
    if (imgEditorRef.current) return imgEditorRef.current

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('画像アップロードの設定が見つかりません')
      return null
    }

    try {
      imgEditorRef.current = new ImgEditor(supabaseUrl, supabaseAnonKey)
      return imgEditorRef.current
    } catch (error) {
      console.error('Failed to initialize ImgEditor', error)
      toast.error('画像アップロードの初期化に失敗しました')
      return null
    }
  }, [])

  const handleImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target
      const file = input.files?.[0]
      if (!file) return

      if (!userId) {
        toast.error('画像をアップロードするにはログインが必要です')
        input.value = ''
        return
      }

      const objectUrl = URL.createObjectURL(file)
      updatePreview(objectUrl)

      const editor = ensureImgEditor()
      if (!editor) {
        updatePreview(null)
        input.value = ''
        return
      }

      setImageUploading(true)

      try {
        const { src } = await editor.uploadImage(file, userId)
        form.setValue('imagePath', src, { shouldValidate: true })
        updatePreview(src)
        toast.success('画像をアップロードしました')
      } catch (error) {
        console.error('Failed to upload image', error)
        toast.error('画像のアップロードに失敗しました')
        form.setValue('imagePath', '', { shouldValidate: true })
        updatePreview(null)
      } finally {
        setImageUploading(false)
        input.value = ''
      }
    },
    [ensureImgEditor, form, updatePreview, userId],
  )

  const onSubmit = (values: ReviewInput) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
    formData.append('chocolateId', values.chocolateId)
    if (values.imagePath) {
      formData.append('imagePath', values.imagePath)
    }
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

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      form.reset()
      updatePreview(null)
      toast.success('投稿が完了しました！')
      router.push('/reviews')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, router])

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border p-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input
                  placeholder="タイトルを入力"
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
          name="chocolateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>チョコレート</FormLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={
                  isPending || chocolateLoading || chocolateOptions.length === 0
                }
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
          name="imagePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>写真（任意）</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-white"
                  disabled={isPending || imageUploading}
                  onChange={handleImageChange}
                />
              </FormControl>
              {imageUploading && (
                <p className="text-muted-foreground mt-2 text-xs">
                  画像をアップロードしています...
                </p>
              )}
              {imagePreview && (
                <div className="mt-2 overflow-hidden rounded-md border">
                  <img
                    src={imagePreview}
                    alt="アップロード画像のプレビュー"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
              {field.value && !imageUploading && (
                <p className="text-emerald-600 mt-2 text-xs break-words">
                  アップロード済み: {field.value}
                </p>
              )}
              <FormDescription>
                5MB 以下の画像ファイルをアップロードできます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <div className="flex flex-col items-center gap-3">
          <Rating defaultValue={3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton key={index} />
            ))}
          </Rating>
          <span className="text-muted-foreground text-xs">ミント感</span>
        </div> */}

        <Button
          type="submit"
          disabled={isPending || imageUploading}
          className="bg-[#8FCBAB] text-slate-900 hover:bg-[#7BB898]"
        >
          {isPending || imageUploading ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
