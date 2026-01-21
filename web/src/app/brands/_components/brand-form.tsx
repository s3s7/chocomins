'use client'

import { startTransition, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { BrandInput, brandSchema } from '@/schemas/brand'
import { createBrand } from '@/app/actions/brand/create'
import { getErrorMessage } from '@/lib/error-messages'

export const BrandForm = () => {
  const [state, dispatch, isPending] = useActionState(createBrand, null)
  const router = useRouter()

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      country: undefined,
    },
  })

  const onSubmit = (values: BrandInput) => {
    const formData = new FormData()
    formData.append('name', values.name)
    if (values.country) formData.append('country', values.country)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return
    if (state.isSuccess) {
      form.reset()
      toast.success('メーカー・店舗を追加しました！')
      router.push('/brands')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, router])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border p-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メーカー・店舗名</FormLabel>
              <FormControl>
                <Input
                  placeholder="メーカー・店舗名を入力"
                  autoComplete="organization"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
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
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button type="submit" disabled={isPending}>
          {isPending ? '追加中...' : '追加'}
        </Button>
      </form>
    </Form>
  )
}
