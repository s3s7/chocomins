'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
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
} from '@/components/ui/form'
import { ReviewInput, reviewSchema } from '@/schemas/review'
import { startTransition, useEffect } from 'react'
import { getErrorMessage } from '@/lib/error-messages'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating';

export const ReviewForm = () => {
  const [state, dispatch, isPending] = useActionState(createReview, null)

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      content: '',
      mintiness: 0,
    },
  })

  const onSubmit = (values: ReviewInput) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('content', values.content)

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
            render={({ field }) => (
              <FormItem>
                <FormLabel>ミント感</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-3">
                    <Rating value={field.value} onValueChange={field.onChange}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <RatingButton key={index} />
                      ))}
                    </Rating>
                    <span className="text-xs text-muted-foreground">
                      ミント感: {field.value ?? 0}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex flex-col items-center gap-3">
          <Rating defaultValue={3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton key={index} />
            ))}
          </Rating>
          <span className="text-xs text-muted-foreground">ミント感</span>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
