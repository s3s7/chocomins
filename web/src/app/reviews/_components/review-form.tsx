'use client'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState ,useState } from 'react'
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
import { startTransition, useEffect } from 'react'
import { getErrorMessage } from '@/lib/error-messages'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'

type ChocolateOption = {
  id: string
  name: string
}

export const ReviewForm = () => {
  const [state, dispatch, isPending] = useActionState(createReview, null)
  const [chocolateOptions, setChocolateOptions] = useState<ChocolateOption[]>([])
  const [chocolateLoading, setChocolateLoading] = useState(true)


  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      content: '',
      mintiness: 0,
      chocolateId: '',
    },
  })

  const onSubmit = (values: ReviewInput) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
    formData.append('chocolateId', values.chocolateId)
    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      form.reset()
      toast.success('投稿が完了しました！')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form])

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
                <Input placeholder="タイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
                value={field.value || undefined}
                disabled={isPending || chocolateLoading || chocolateOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={chocolateLoading ? '取得中...' : '選択してください'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {chocolateOptions.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
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
              <FormDescription>登録済みのチョコレートから選択してください</FormDescription>
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
                <Textarea rows={4} placeholder="本文を入力" {...field} />
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

        {/* <div className="flex flex-col items-center gap-3">
          <Rating defaultValue={3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton key={index} />
            ))}
          </Rating>
          <span className="text-muted-foreground text-xs">ミント感</span>
        </div> */}

        <Button type="submit" disabled={isPending}>
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
