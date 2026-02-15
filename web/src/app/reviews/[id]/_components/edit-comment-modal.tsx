'use client'

import { useActionState, useEffect, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import {
  editCommentSchema,
  EditCommentInput,
} from '@/schemas/comment'
import { updateComment } from '@/app/actions/comment/update'
import { CommentWithUser } from '@/types'

type EditCommentModalProps = {
  comment: CommentWithUser
  open: boolean
  onClose: () => void
}

export function EditCommentModal({ comment, open, onClose }: EditCommentModalProps) {
  const [state, dispatch, isPending] = useActionState(updateComment, null)

  const form = useForm<EditCommentInput>({
    resolver: zodResolver(editCommentSchema),
    defaultValues: {
      commentId: comment.id,
      content: comment.content,
      reviewId: comment.reviewId,
    },
  })

  const onSubmit = (values: EditCommentInput) => {
    const formData = new FormData()
    formData.append('commentId', values.commentId)
    formData.append('reviewId', values.reviewId)
    formData.append('content', values.content)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      toast.success('コメントを更新しました')
      onClose()
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, onClose])

  useEffect(() => {
    if (!open) return

    form.reset({
      commentId: comment.id,
      content: comment.content,
      reviewId: comment.reviewId,
    })
  }, [open, comment.id, comment.content, comment.reviewId, form])

  return (
    <Dialog
      open={open}
      onOpenChange={(dialogOpen) => {
        if (!dialogOpen) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>コメントを編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('commentId')} />
            <input type="hidden" {...form.register('reviewId')} />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} rows={4} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
              >
                {isPending ? '更新中...' : '更新する'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
