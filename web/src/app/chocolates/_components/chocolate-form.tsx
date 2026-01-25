'use client'

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { InfoIcon } from 'lucide-react'
import { useForm, type ControllerRenderProps } from 'react-hook-form'
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
  useFormField,
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
  const router = useRouter()

  const form = useForm<ChocolateInput>({
    resolver: zodResolver(chocolateSchema),
    defaultValues: {
      name: '',
      description: '',
      cacaoPercent: undefined,
      hasMint: false,
      status: undefined,
      price: undefined,
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
    if (typeof values.status === 'number') {
      formData.append('status', String(values.status))
    }
    if (values.price !== undefined) {
      formData.append('price', String(values.price))
    }
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
      router.push('/chocolates')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, router])

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch brands')
        const data = await response.json()
        setBrandOptions(data.brands ?? [])
      } catch (error) {
        console.error('Failed to load brands', error)
        toast.error('メーカー・店舗一覧の取得に失敗しました')
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
        {/* 横並びレイアウト例（md以上で2カラム） */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="商品名を入力"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp>
                    パッケージに記載された正式名称を入力してください。（必須、最大50文字）
                  </FieldHelp>
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
                    <Textarea
                      rows={4}
                      placeholder="商品の説明を入力"
                      {...field}
                    />
                  </FormControl>
                  <FieldHelp>
                    味や香り、感じた特徴やおすすめシーンなどを200文字以内で入力してください。（必須、最大200文字）
                  </FieldHelp>
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
                            ? undefined
                            : Number.isNaN(event.target.valueAsNumber)
                              ? undefined
                              : event.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FieldHelp>
                    例: 62.5 のように小数点込みで入力できます。（任意、0〜100%）
                  </FieldHelp>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="hasMint"
              render={({ field }) => <HasMintCheckboxField field={field} />}
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
                            ? undefined
                            : Number.isNaN(event.target.valueAsNumber)
                              ? undefined
                              : event.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FieldHelp>
                    購入時点での税込価格（1個または1箱あたり）を入力してください。（任意、0円以上）
                  </FieldHelp>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メーカー・店舗</FormLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    disabled={
                      isPending || brandLoading || brandOptions.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            brandLoading ? '取得中...' : '選択してください'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brandOptions.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-2 text-sm">
                          メーカー・店舗が登録されていません
                        </div>
                      ) : (
                        brandOptions.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FieldHelp>
                    登録済みのメーカー・店舗から該当するものを選択してください。（必須）
                  </FieldHelp>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* <FormField
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
        /> */}

        <Button type="submit" disabled={isPending}>
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}

type FieldHelpProps = {
  children: ReactNode
}

function FieldHelp({ children }: FieldHelpProps) {
  return (
    <FormDescription className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
      <InfoIcon className="mt-0.5 h-3.5 w-3.5 text-slate-400" aria-hidden />
      <span>{children}</span>
    </FormDescription>
  )
}

type HasMintCheckboxFieldProps = {
  field: ControllerRenderProps<ChocolateInput, 'hasMint'>
}

function HasMintCheckboxField({ field }: HasMintCheckboxFieldProps) {
  return (
    <FormItem>
      <HasMintCheckboxContent field={field} />
      <FieldHelp>
        ミントの風味が感じられる場合はオンにしてください。（必須）
      </FieldHelp>
      <FormMessage />
    </FormItem>
  )
}

function HasMintCheckboxContent({ field }: HasMintCheckboxFieldProps) {
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
