'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentSchema, CommentInput } from '@/schemas/comment'
import { createComment } from '@/app/actions/comment/create'
import { startTransition, useEffect } from 'react'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'

export function CommentForm({ reviewId }: { reviewId: string }) {
  const [state, dispatch, isPending] = useActionState(createComment, null)

  // フォームの初期化
  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      reviewId,
    },
  })

  const onSubmit = (data: CommentInput) => {
    const formData = new FormData()
    formData.set('content', data.content)
    formData.set('reviewId', data.reviewId)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      form.reset()
      toast.success('コメントを投稿しました！')
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="コメントを書く..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? '送信中...' : 'コメントを投稿'}
        </Button>
      </form>
    </Form>
  )
}
