'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { createChocolate } from '@/app/actions/chocolate/create'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { ChocolateInput, chocolateSchema } from '@/schemas/chocolate'
import { getErrorMessage } from '@/lib/error-messages'

type BrandOption = {
  id: string
  name: string
}

export const ChocolateForm = () => {
  const [state, dispatch, isPending] = useActionState(createChocolate, null)
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([])
  const [brandLoading, setBrandLoading] = useState(true)

  const form = useForm<ChocolateInput>({
    resolver: zodResolver(chocolateSchema),
    defaultValues: {
      name: '',
      description: '',
      cacaoPercent: 0,
      hasMint: false,
      status: 0,
      price: 0,
      brandId: '',
      categoryId: undefined,
    },
  })

  const onSubmit = (values: ChocolateInput) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('description', values.description)
    formData.append('cacaoPercent', String(values.cacaoPercent))
    formData.append('hasMint', String(values.hasMint))
    formData.append('status', String(values.status))
    formData.append('price', String(values.price))
    formData.append('brandId', values.brandId)
    if (values.categoryId) {
      formData.append('categoryId', values.categoryId)
    }

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
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch brands')
        const data = await response.json()
        setBrandOptions(data.brands ?? [])
      } catch (error) {
        console.error('Failed to load brands', error)
        toast.error('ブランド一覧の取得に失敗しました')
      } finally {
        setBrandLoading(false)
      }
    }
    fetchBrands()
  }, [])

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
              <FormLabel>商品名</FormLabel>
              <FormControl>
                <Input placeholder="商品名を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品説明</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="商品の説明を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cacaoPercent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カカオ含有率 (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ''
                        ? 0
                        : Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormDescription>例: 62.5</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasMint"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-3">
                <FormLabel className="text-base">ミント入り</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ''
                        ? 0
                        : Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormDescription>0: 提案, 1: 承認 など</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>価格 (円)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ''
                        ? 0
                        : Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ブランド</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={isPending || brandLoading || brandOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={brandLoading ? '取得中...' : 'ブランドを選択'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brandOptions.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      ブランドが登録されていません
                    </div>
                  ) : (
                    brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name} ({brand.id})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>登録済みのブランドから選択してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリID (任意)</FormLabel>
              <FormControl>
                <Input
                  placeholder="カテゴリIDを入力"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
