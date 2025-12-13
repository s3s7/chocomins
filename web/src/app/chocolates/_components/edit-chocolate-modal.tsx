'use client'

import { useEffect } from 'react'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateChocolate } from '@/app/actions/chocolate/update'
import { ChocolateWithUser } from '@/types'
import { startTransition } from 'react'
import { EditChocolateInput, editChocolateSchema } from '@/schemas/chocolate'
import { getErrorMessage } from '@/lib/error-messages'

type Props = {
  chocolate: ChocolateWithUser
  open: boolean
  onCloseAction: () => void
}

export function EditChocolateModal({ chocolate, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateChocolate, null)

  const form = useForm<EditChocolateInput>({
    resolver: zodResolver(editChocolateSchema),
    defaultValues: {
      chocolateId: chocolate.id,
      title: chocolate.title,
      content: chocolate.content,
      mintiness: chocolate.mintiness,
    },
  })

  const onSubmit = (values: EditChocolateInput) => {
    const formData = new FormData()
    formData.append('chocolateId', values.chocolateId)
    formData.append('title', values.title)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
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

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>投稿の編集</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('chocolateId')} />

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
                    <Textarea placeholder="本文を入力" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
