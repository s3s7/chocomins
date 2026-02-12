'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, SignInResponse } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { signInSchema, type SignInValues } from '@/schemas/sign-in'

export function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: SignInValues) => {
    startTransition(async () => {
      try {
        const result = (await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false, // 手動でリダイレクト
        })) as SignInResponse | undefined

        if (result?.error) {
          toast.error(
            'ログインに失敗しました。メールアドレスかパスワードを確認してください。',
          )
          return
        }

        toast.success('ログインに成功しました！')
        form.reset()
        router.push('/') // 成功したらトップページへ
      } catch (err) {
        console.error(err)
        toast.error('予期せぬエラーが発生しました')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="******"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
        >
          {isPending ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
    </Form>
  )
}
