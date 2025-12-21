'use client'

import { useEffect, startTransition } from 'react'
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
import { Button } from '@/components/ui/button'
import { updateBrand } from '@/app/actions/brand/update'
import { Brand } from '@prisma/client'
import { EditBrandInput, editBrandSchema } from '@/schemas/brand'
import { getErrorMessage } from '@/lib/error-messages'

type Props = {
  brand: Brand
  open: boolean
  onCloseAction: () => void
}

export function EditBrandModal({ brand, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateBrand, null)

  const form = useForm<EditBrandInput>({
    resolver: zodResolver(editBrandSchema),
    defaultValues: {
      brandId: brand.id,
      name: brand.name,
      country: brand.country ?? undefined,
    },
  })

  const onSubmit = (values: EditBrandInput) => {
    const formData = new FormData()
    formData.append('brandId', values.brandId)
    formData.append('name', values.name)
    if (values.country) formData.append('country', values.country)
    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      toast.success('ブランドが更新されました！')
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
          <DialogTitle>ブランドの編集</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('brandId')} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ブランド名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ブランド名を入力"
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>国名（任意）</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例: Japan, Belgium..."
                      autoComplete="country-name"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
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
