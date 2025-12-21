'use client'

import { useEffect, useState, startTransition } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateReview } from '@/app/actions/review/update'
import { ReviewWithUser } from '@/types'
import { EditReviewInput, editReviewSchema } from '@/schemas/review'
import { getErrorMessage } from '@/lib/error-messages'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'

type Props = {
  review: ReviewWithUser
  open: boolean
  onCloseAction: () => void
}

type ChocolateOption = {
  id: string
  name: string
}

export function EditReviewModal({ review, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateReview, null)
  const [chocolateOptions, setChocolateOptions] = useState<ChocolateOption[]>(
    [],
  )
  const [chocolateLoading, setChocolateLoading] = useState(true)

  const form = useForm<EditReviewInput>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      reviewId: review.id,
      title: review.title,
      content: review.content,
      mintiness: review.mintiness,
      chocolateId: review.chocolateId,
    },
  })

  const onSubmit = (values: EditReviewInput) => {
    const formData = new FormData()
    formData.append('reviewId', values.reviewId)
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
      toast.success('投稿が更新されました！')
      form.reset()
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
        <DialogDescription></DialogDescription>

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
                    disabled={
                      isPending ||
                      chocolateLoading ||
                      chocolateOptions.length === 0
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCloseAction}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
