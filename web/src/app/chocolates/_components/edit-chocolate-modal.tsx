'use client'

import { useActionState, useEffect, useState, startTransition } from 'react'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateChocolate } from '@/app/actions/chocolate/update'
import { Chocolate } from '@prisma/client'
import { EditChocolateInput, editChocolateSchema } from '@/schemas/chocolate'
import { getErrorMessage } from '@/lib/error-messages'

type ChocolateForClient = Omit<Chocolate, 'cacaoPercent'> & {
  cacaoPercent: number | null
  brandName: string
  categoryName: string | null
}

type Props = {
  chocolate: ChocolateForClient
  open: boolean
  onCloseAction: () => void
}

export function EditChocolateModal({ chocolate, open, onCloseAction }: Props) {
  const [state, dispatch, isPending] = useActionState(updateChocolate, null)
  const [brandOptions, setBrandOptions] = useState<{ id: string; name: string }[]>([])
  const [brandLoading, setBrandLoading] = useState(true)

  const form = useForm<EditChocolateInput>({
    resolver: zodResolver(editChocolateSchema),
    defaultValues: {
      chocolateId: chocolate.id,
      name: chocolate.name,
      description: chocolate.description ?? '',
      cacaoPercent: Number(chocolate.cacaoPercent ?? 0),
      hasMint: chocolate.hasMint,
      status: chocolate.status ?? 0,
      price: chocolate.price ?? 0,
      brandId: chocolate.brandId,
      categoryId: chocolate.categoryId ?? undefined,
    },
  })

  const onSubmit = (values: EditChocolateInput) => {
    const formData = new FormData()
    formData.append('chocolateId', values.chocolateId)
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
      toast.success('投稿が更新されました！')
      form.reset()
      onCloseAction()
    } else if (state.errorCode) {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, onCloseAction])

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
              name="name"
              render={({ field }) => (
                <FormItem>
              <FormLabel>商品名</FormLabel>
              <FormControl>
                <Input placeholder="商品名を入力" autoComplete="off" {...field} />
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
              render={({ field }) => <EditHasMintCheckboxField field={field} />}
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
              render={({ field }) => {
                const options =
                  field.value &&
                  !brandOptions.some((brand) => brand.id === field.value)
                    ? [{ id: field.value, name: field.value }, ...brandOptions]
                    : brandOptions
                return (
                  <FormItem>
                    <FormLabel>ブランド</FormLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isPending || brandLoading || options.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={brandLoading ? '取得中...' : '選択してください'}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-muted-foreground">
                            ブランドが登録されていません
                          </div>
                        ) : (
                          options.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name} ({brand.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>登録済みブランドから選択してください</FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
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

type EditHasMintCheckboxFieldProps = {
  field: ControllerRenderProps<EditChocolateInput, 'hasMint'>
}

function EditHasMintCheckboxField({ field }: EditHasMintCheckboxFieldProps) {
  return (
    <FormItem>
      <EditHasMintCheckboxContent field={field} />
      <FormMessage />
    </FormItem>
  )
}

function EditHasMintCheckboxContent({ field }: EditHasMintCheckboxFieldProps) {
  const { formItemId } = useFormField()

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <FormLabel className="text-base" htmlFor={formItemId}>
        ミント入り
      </FormLabel>
      <FormControl>
        <input
          id={formItemId}
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
  )
}
