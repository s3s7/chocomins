'use client'

import { useActionState, useEffect, startTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { updateProfile } from '@/app/actions/user/update-profile'
import { updateProfileSchema, UpdateProfileInput } from '@/schemas/user'
import { useRouter } from 'next/navigation'

type ProfileEditModalProps = {
  open: boolean
  onClose: () => void
  name: string
  email: string
}

export function ProfileEditModal({
  open,
  onClose,
  name,
  email,
}: ProfileEditModalProps) {
  const [state, dispatch, isPending] = useActionState(updateProfile, null)
  const router = useRouter()

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
      email,
    },
  })

  const onSubmit = (values: UpdateProfileInput) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('email', values.email)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      toast.success('プロフィールを更新しました！')
      router.refresh()
      onClose()
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, onClose, router])

  useEffect(() => {
    if (!open) return

    form.reset({ name, email })
  }, [open, name, email, form])

  return (
    <Dialog
      open={open}
      onOpenChange={(dialogOpen) => {
        if (!dialogOpen) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロフィール情報を編集</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名前</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled={isPending}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
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
                {isPending ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
